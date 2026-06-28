---
title: "Simulation physique avancée et techniques de rendu photoréaliste"
category: "simulation"
date: "2024-12-26"
author: "CyberGarage Simulation Team"
tags: ["simulation physique", "rendu", "ray tracing", "compute shaders", "RTX"]
summary: "Implémentation d'un moteur de simulation physique haute performance avec rendu photoréaliste en temps réel utilisant les dernières techniques GPU."
readTime: 20
---

# Simulation physique avancée et techniques de rendu photoréaliste

## Introduction

La simulation physique moderne combine algorithmes numériques avancés et puissance de calcul GPU pour créer des environnements virtuels photoréalistes en temps réel. Ce guide explore les techniques de pointe pour la simulation de corps rigides, fluides, et le rendu basé sur la physique.

## Architecture du moteur de simulation

### Système de gestion des entités physiques

```cpp
#include <vector>
#include <unordered_map>
#include <memory>
#include <glm/glm.hpp>
#include <glm/gtc/matrix_transform.hpp>
#include <cuda_runtime.h>
#include <thrust/device_vector.h>

// Composant de physique pour ECS (Entity Component System)
struct RigidBodyComponent {
    glm::vec3 position{0.0f};
    glm::quat orientation{1.0f, 0.0f, 0.0f, 0.0f};
    glm::vec3 linear_velocity{0.0f};
    glm::vec3 angular_velocity{0.0f};
    
    float mass = 1.0f;
    float inverse_mass = 1.0f;
    glm::mat3 inertia_tensor{1.0f};
    glm::mat3 inverse_inertia_tensor{1.0f};
    
    glm::vec3 force_accumulator{0.0f};
    glm::vec3 torque_accumulator{0.0f};
    
    float restitution = 0.6f;
    float friction = 0.8f;
    float drag = 0.99f;
    
    bool is_kinematic = false;
    bool is_sleeping = false;
    float sleep_motion = 0.0f;
};

struct ColliderComponent {
    enum Type { BOX, SPHERE, CAPSULE, MESH };
    Type type = BOX;
    
    union {
        struct { glm::vec3 half_extents; } box;
        struct { float radius; } sphere;
        struct { float radius; float height; } capsule;
        struct { uint32_t mesh_id; } mesh;
    } geometry;
    
    glm::vec3 local_position{0.0f};
    glm::quat local_orientation{1.0f, 0.0f, 0.0f, 0.0f};
    
    bool is_trigger = false;
    uint32_t collision_mask = 0xFFFFFFFF;
    uint32_t collision_layer = 1;
};

// Moteur de physique principal
class PhysicsEngine {
private:
    // Stockage GPU pour calculs parallèles
    thrust::device_vector<RigidBodyComponent> gpu_rigid_bodies;
    thrust::device_vector<ColliderComponent> gpu_colliders;
    thrust::device_vector<glm::vec4> gpu_contact_points;
    thrust::device_vector<glm::vec4> gpu_contact_normals;
    
    // Paramètres de simulation
    float time_step = 1.0f / 60.0f;
    int velocity_iterations = 8;
    int position_iterations = 3;
    glm::vec3 gravity = glm::vec3(0.0f, -9.81f, 0.0f);
    
    // Structures de données pour broad phase
    struct BVHNode {
        glm::vec3 min_bounds;
        glm::vec3 max_bounds;
        uint32_t left_child;
        uint32_t right_child;
        uint32_t entity_id;
        bool is_leaf;
    };
    
    std::vector<BVHNode> bvh_nodes;
    
public:
    PhysicsEngine() {
        // Initialisation CUDA
        cudaSetDevice(0);
        
        // Allocation des buffers GPU
        gpu_rigid_bodies.reserve(10000);
        gpu_colliders.reserve(10000);
        gpu_contact_points.reserve(50000);
        gpu_contact_normals.reserve(50000);
    }
    
    // Simulation step principal
    void simulate(float dt) {
        // Phase 1: Intégration des forces
        integrate_forces(dt);
        
        // Phase 2: Broad phase collision detection
        broad_phase_collision_detection();
        
        // Phase 3: Narrow phase collision detection
        narrow_phase_collision_detection();
        
        // Phase 4: Resolution des contraintes
        solve_constraints(dt);
        
        // Phase 5: Intégration des vitesses
        integrate_velocities(dt);
        
        // Phase 6: Post-processing
        update_transforms();
        update_sleep_states();
    }
    
private:
    // Intégration des forces avec CUDA
    void integrate_forces(float dt) {
        int block_size = 256;
        int grid_size = (gpu_rigid_bodies.size() + block_size - 1) / block_size;
        
        integrate_forces_kernel<<<grid_size, block_size>>>(
            thrust::raw_pointer_cast(gpu_rigid_bodies.data()),
            gpu_rigid_bodies.size(),
            gravity,
            dt
        );
        
        cudaDeviceSynchronize();
    }
};

// Kernels CUDA pour simulation physique
__global__ void integrate_forces_kernel(RigidBodyComponent* bodies,
                                       int count,
                                       glm::vec3 gravity,
                                       float dt) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= count) return;
    
    RigidBodyComponent* body = &bodies[idx];
    
    if (body->is_kinematic || body->is_sleeping) return;
    
    // Application de la gravité
    body->force_accumulator += gravity * body->mass;
    
    // Intégration de Verlet pour la position
    glm::vec3 acceleration = body->force_accumulator * body->inverse_mass;
    body->linear_velocity += acceleration * dt;
    
    // Application du drag
    body->linear_velocity *= body->drag;
    body->angular_velocity *= body->drag;
    
    // Calcul du mouvement pour le sleep
    float motion = length(body->linear_velocity) + length(body->angular_velocity);
    body->sleep_motion = 0.9f * body->sleep_motion + 0.1f * motion;
    
    // Reset des accumulateurs
    body->force_accumulator = glm::vec3(0.0f);
    body->torque_accumulator = glm::vec3(0.0f);
}

// Détection de collision en broad phase avec BVH
__global__ void broad_phase_bvh_kernel(const BVHNode* nodes,
                                      const RigidBodyComponent* bodies,
                                      const ColliderComponent* colliders,
                                      uint32_t* collision_pairs,
                                      int* pair_count,
                                      int max_pairs) {
    
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    
    // Traversée de l'arbre BVH
    __shared__ uint32_t stack[32];
    __shared__ int stack_size;
    
    if (threadIdx.x == 0) {
        stack_size = 1;
        stack[0] = 0; // Root node
    }
    
    __syncthreads();
    
    while (stack_size > 0) {
        __syncthreads();
        
        uint32_t node_idx = stack[--stack_size];
        const BVHNode* node = &nodes[node_idx];
        
        // Test d'intersection AABB
        if (aabb_intersect(node->min_bounds, node->max_bounds, 
                          bodies[idx].position, colliders[idx])) {
            
            if (node->is_leaf) {
                // Ajouter la paire de collision
                int pair_idx = atomicAdd(pair_count, 1);
                if (pair_idx < max_pairs) {
                    collision_pairs[pair_idx * 2] = idx;
                    collision_pairs[pair_idx * 2 + 1] = node->entity_id;
                }
            } else {
                // Continuer la traversée
                if (stack_size < 30) {
                    stack[stack_size++] = node->left_child;
                    stack[stack_size++] = node->right_child;
                }
            }
        }
        
        __syncthreads();
    }
}

// Test d'intersection AABB optimisé
__device__ bool aabb_intersect(glm::vec3 min1, glm::vec3 max1,
                               glm::vec3 pos2, const ColliderComponent& collider2) {
    
    glm::vec3 min2, max2;
    
    // Calcul des bounds du second collider
    switch (collider2.type) {
        case ColliderComponent::BOX: {
            glm::vec3 half = collider2.geometry.box.half_extents;
            min2 = pos2 - half;
            max2 = pos2 + half;
            break;
        }
        case ColliderComponent::SPHERE: {
            float r = collider2.geometry.sphere.radius;
            min2 = pos2 - glm::vec3(r);
            max2 = pos2 + glm::vec3(r);
            break;
        }
    }
    
    return (min1.x <= max2.x && max1.x >= min2.x) &&
           (min1.y <= max2.y && max1.y >= min2.y) &&
           (min1.z <= max2.z && max1.z >= min2.z);
}
```

## Simulation de fluides par SPH

### Smoothed Particle Hydrodynamics sur GPU

```cuda
#include <thrust/sort.h>
#include <thrust/unique.h>

// Structure d'une particule fluide
struct FluidParticle {
    glm::vec3 position;
    glm::vec3 velocity;
    glm::vec3 force;
    
    float density;
    float pressure;
    float mass;
    
    uint32_t grid_hash;
    uint32_t particle_id;
    
    glm::vec3 color;
    float temperature;
};

// Paramètres de simulation SPH
struct SPHParameters {
    float kernel_radius = 0.1f;
    float rest_density = 1000.0f;
    float gas_constant = 2000.0f;
    float viscosity = 0.01f;
    float surface_tension = 0.02f;
    float restitution = 0.5f;
    
    glm::vec3 gravity = glm::vec3(0.0f, -9.81f, 0.0f);
    glm::vec3 domain_min = glm::vec3(-5.0f, 0.0f, -5.0f);
    glm::vec3 domain_max = glm::vec3(5.0f, 10.0f, 5.0f);
    
    float time_step = 0.001f;
    int grid_cells_x = 100;
    int grid_cells_y = 100;
    int grid_cells_z = 100;
};

class SPHFluidSimulator {
private:
    thrust::device_vector<FluidParticle> particles;
    thrust::device_vector<uint32_t> grid_indices;
    thrust::device_vector<uint32_t> grid_start;
    thrust::device_vector<uint32_t> grid_end;
    
    SPHParameters params;
    int particle_count;
    
public:
    SPHFluidSimulator(int max_particles) : particle_count(0) {
        particles.reserve(max_particles);
        grid_indices.reserve(max_particles);
        grid_start.resize(params.grid_cells_x * params.grid_cells_y * params.grid_cells_z);
        grid_end.resize(params.grid_cells_x * params.grid_cells_y * params.grid_cells_z);
    }
    
    void simulate_step() {
        // Phase 1: Calcul des hash de grille et tri
        compute_grid_hash();
        sort_particles();
        find_grid_boundaries();
        
        // Phase 2: Calcul de la densité
        compute_density();
        
        // Phase 3: Calcul de la pression
        compute_pressure();
        
        // Phase 4: Calcul des forces
        compute_forces();
        
        // Phase 5: Intégration
        integrate_particles();
        
        // Phase 6: Gestion des collisions avec les limites
        handle_boundary_collisions();
    }
    
private:
    void compute_grid_hash() {
        int block_size = 256;
        int grid_size = (particle_count + block_size - 1) / block_size;
        
        compute_grid_hash_kernel<<<grid_size, block_size>>>(
            thrust::raw_pointer_cast(particles.data()),
            particle_count,
            params
        );
    }
    
    void sort_particles() {
        // Tri par hash de grille pour améliorer la cohérence cache
        thrust::sort_by_key(
            thrust::device,
            particles.begin(), particles.begin() + particle_count,
            grid_indices.begin()
        );
    }
    
    void find_grid_boundaries() {
        thrust::fill(grid_start.begin(), grid_start.end(), 0xFFFFFFFF);
        thrust::fill(grid_end.begin(), grid_end.end(), 0);
        
        int block_size = 256;
        int grid_size = (particle_count + block_size - 1) / block_size;
        
        find_grid_boundaries_kernel<<<grid_size, block_size>>>(
            thrust::raw_pointer_cast(particles.data()),
            thrust::raw_pointer_cast(grid_start.data()),
            thrust::raw_pointer_cast(grid_end.data()),
            particle_count
        );
    }
};

// Calcul du hash de grille pour accélération spatiale
__global__ void compute_grid_hash_kernel(FluidParticle* particles,
                                        int count,
                                        SPHParameters params) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= count) return;
    
    FluidParticle* p = &particles[idx];
    
    // Calcul des indices de grille
    glm::vec3 grid_pos = (p->position - params.domain_min) / params.kernel_radius;
    int3 grid_coord = make_int3(
        __float2int_rd(grid_pos.x),
        __float2int_rd(grid_pos.y), 
        __float2int_rd(grid_pos.z)
    );
    
    // Calcul du hash
    p->grid_hash = grid_coord.x + 
                   grid_coord.y * params.grid_cells_x +
                   grid_coord.z * params.grid_cells_x * params.grid_cells_y;
    
    p->particle_id = idx;
}

// Calcul de la densité SPH
__global__ void compute_density_kernel(FluidParticle* particles,
                                      uint32_t* grid_start,
                                      uint32_t* grid_end,
                                      int count,
                                      SPHParameters params) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= count) return;
    
    FluidParticle* p_i = &particles[idx];
    glm::vec3 pos_i = p_i->position;
    float density = 0.0f;
    
    // Parcours des cellules voisines (3x3x3 = 27 cellules)
    for (int z = -1; z <= 1; z++) {
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                
                uint32_t neighbor_hash = get_grid_hash(
                    pos_i + glm::vec3(x, y, z) * params.kernel_radius,
                    params
                );
                
                if (neighbor_hash >= params.grid_cells_x * params.grid_cells_y * params.grid_cells_z)
                    continue;
                
                uint32_t start = grid_start[neighbor_hash];
                if (start == 0xFFFFFFFF) continue;
                
                uint32_t end = grid_end[neighbor_hash];
                
                // Parcours des particules dans la cellule
                for (uint32_t j = start; j < end; j++) {
                    FluidParticle* p_j = &particles[j];
                    glm::vec3 r = pos_i - p_j->position;
                    float r_len = length(r);
                    
                    if (r_len < params.kernel_radius) {
                        // Kernel de Poly6
                        float h2 = params.kernel_radius * params.kernel_radius;
                        float r2 = r_len * r_len;
                        float poly6_factor = 315.0f / (64.0f * M_PI * pow(params.kernel_radius, 9));
                        float kernel = poly6_factor * pow(h2 - r2, 3);
                        
                        density += p_j->mass * kernel;
                    }
                }
            }
        }
    }
    
    p_i->density = density;
}

// Calcul de la pression selon l'équation d'état
__global__ void compute_pressure_kernel(FluidParticle* particles,
                                       int count,
                                       SPHParameters params) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= count) return;
    
    FluidParticle* p = &particles[idx];
    
    // Équation d'état de Tait
    p->pressure = params.gas_constant * (p->density - params.rest_density);
    p->pressure = max(0.0f, p->pressure); // Pression positive uniquement
}

// Calcul des forces SPH (pression, viscosité, tension de surface)
__global__ void compute_forces_kernel(FluidParticle* particles,
                                     uint32_t* grid_start,
                                     uint32_t* grid_end,
                                     int count,
                                     SPHParameters params) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= count) return;
    
    FluidParticle* p_i = &particles[idx];
    glm::vec3 pos_i = p_i->position;
    glm::vec3 vel_i = p_i->velocity;
    
    glm::vec3 force_pressure(0.0f);
    glm::vec3 force_viscosity(0.0f);
    glm::vec3 force_surface(0.0f);
    
    // Parcours des voisins
    for (int z = -1; z <= 1; z++) {
        for (int y = -1; y <= 1; y++) {
            for (int x = -1; x <= 1; x++) {
                
                uint32_t neighbor_hash = get_grid_hash(
                    pos_i + glm::vec3(x, y, z) * params.kernel_radius,
                    params
                );
                
                if (neighbor_hash >= params.grid_cells_x * params.grid_cells_y * params.grid_cells_z)
                    continue;
                
                uint32_t start = grid_start[neighbor_hash];
                if (start == 0xFFFFFFFF) continue;
                uint32_t end = grid_end[neighbor_hash];
                
                for (uint32_t j = start; j < end; j++) {
                    if (j == idx) continue; // Éviter l'auto-interaction
                    
                    FluidParticle* p_j = &particles[j];
                    glm::vec3 r = pos_i - p_j->position;
                    float r_len = length(r);
                    
                    if (r_len < params.kernel_radius && r_len > 0.0f) {
                        glm::vec3 r_normalized = r / r_len;
                        
                        // Force de pression (gradient de Spiky kernel)
                        float spiky_factor = -45.0f / (M_PI * pow(params.kernel_radius, 6));
                        float spiky_grad = spiky_factor * pow(params.kernel_radius - r_len, 2);
                        
                        float pressure_term = (p_i->pressure + p_j->pressure) / (2.0f * p_j->density);
                        force_pressure += -p_j->mass * pressure_term * spiky_grad * r_normalized;
                        
                        // Force de viscosité (Laplacien de viscosité kernel)
                        float visc_factor = 45.0f / (M_PI * pow(params.kernel_radius, 6));
                        float visc_laplacian = visc_factor * (params.kernel_radius - r_len);
                        
                        glm::vec3 vel_diff = p_j->velocity - vel_i;
                        force_viscosity += params.viscosity * p_j->mass * vel_diff * visc_laplacian / p_j->density;
                        
                        // Force de tension de surface
                        float poly6_factor = 315.0f / (64.0f * M_PI * pow(params.kernel_radius, 9));
                        float h2 = params.kernel_radius * params.kernel_radius;
                        float r2 = r_len * r_len;
                        float poly6 = poly6_factor * pow(h2 - r2, 3);
                        
                        force_surface += params.surface_tension * p_j->mass * poly6 * r_normalized / p_j->density;
                    }
                }
            }
        }
    }
    
    // Force totale
    p_i->force = force_pressure + force_viscosity + force_surface + params.gravity * p_i->mass;
}

// Intégration des particules (Leapfrog)
__global__ void integrate_particles_kernel(FluidParticle* particles,
                                         int count,
                                         SPHParameters params) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    if (idx >= count) return;
    
    FluidParticle* p = &particles[idx];
    
    // Intégration de Leapfrog
    glm::vec3 acceleration = p->force / p->mass;
    p->velocity += acceleration * params.time_step;
    p->position += p->velocity * params.time_step;
    
    // Damping pour stabilité numérique
    p->velocity *= 0.999f;
}
```

## Rendu basé sur la physique

### Ray tracing en temps réel avec RTX

```hlsl
// Structure d'un rayon
struct Ray {
    float3 origin;
    float3 direction;
    float tmin;
    float tmax;
};

// Structure de matériau PBR
struct Material {
    float3 albedo;
    float metallic;
    float roughness;
    float3 emission;
    float transmission;
    float ior;
};

// Structure d'intersection
struct HitInfo {
    float3 position;
    float3 normal;
    float2 uv;
    Material material;
    float t;
    bool frontFace;
};

// Raytracing global
RWTexture2D<float4> outputTexture : register(u0);
RaytracingAccelerationStructure scene : register(t0);
ConstantBuffer<SceneParameters> sceneParams : register(b0);

// Shader de ray generation
[shader("raygeneration")]
void RayGenShader() {
    uint2 pixelIndex = DispatchRaysIndex().xy;
    uint2 screenSize = DispatchRaysDimensions().xy;
    
    // Calcul du rayon primaire
    float2 uv = (pixelIndex + 0.5) / screenSize;
    float2 ndc = uv * 2.0 - 1.0;
    ndc.y = -ndc.y; // Flip Y pour DirectX
    
    // Paramètres de caméra
    float3 origin = sceneParams.cameraPosition;
    float3 direction = normalize(
        ndc.x * sceneParams.cameraRight * sceneParams.aspectRatio +
        ndc.y * sceneParams.cameraUp +
        sceneParams.cameraForward / tan(sceneParams.fov * 0.5)
    );
    
    // Lancement du rayon primaire
    RayDesc ray;
    ray.Origin = origin;
    ray.Direction = direction;
    ray.TMin = 0.001f;
    ray.TMax = 10000.0f;
    
    RayPayload payload = (RayPayload)0;
    payload.depth = 0;
    payload.seed = initRandom(pixelIndex, sceneParams.frameCount);
    
    TraceRay(scene, RAY_FLAG_NONE, 0xFF, 0, 0, 0, ray, payload);
    
    // Accumulation temporelle pour débruitage
    float3 currentColor = payload.color;
    float3 previousColor = outputTexture[pixelIndex].rgb;
    
    float alpha = 1.0f / (sceneParams.frameCount + 1);
    float3 finalColor = lerp(previousColor, currentColor, alpha);
    
    outputTexture[pixelIndex] = float4(finalColor, 1.0f);
}

// Structure de payload pour le raytracing
struct RayPayload {
    float3 color;
    uint depth;
    uint seed;
    float3 normal;
    float t;
};

// Shader de closest hit pour matériaux PBR
[shader("closesthit")]
void ClosestHitShader(inout RayPayload payload, in BuiltInTriangleIntersectionAttributes attrib) {
    
    if (payload.depth >= MAX_RAY_DEPTH) {
        payload.color = float3(0, 0, 0);
        return;
    }
    
    // Interpolation des attributs du vertex
    float3 barycentrics = float3(1.0 - attrib.barycentrics.x - attrib.barycentrics.y, 
                                attrib.barycentrics.x, 
                                attrib.barycentrics.y);
    
    // Récupération des données du triangle
    uint triangleIndex = PrimitiveIndex();
    VertexData v0, v1, v2;
    GetTriangleVertices(triangleIndex, v0, v1, v2);
    
    // Interpolation des normales et UV
    float3 normal = normalize(v0.normal * barycentrics.x + 
                             v1.normal * barycentrics.y + 
                             v2.normal * barycentrics.z);
    
    float2 uv = v0.uv * barycentrics.x + 
                v1.uv * barycentrics.y + 
                v2.uv * barycentrics.z;
    
    // Position d'intersection
    float3 hitPosition = WorldRayOrigin() + WorldRayDirection() * RayTCurrent();
    
    // Récupération du matériau
    Material material = GetMaterial(triangleIndex, uv);
    
    // Calcul de l'éclairage direct
    float3 directLighting = CalculateDirectLighting(hitPosition, normal, material, payload.seed);
    
    // Monte Carlo pour l'éclairage indirect
    float3 indirectLighting = float3(0, 0, 0);
    if (payload.depth < MAX_RAY_DEPTH - 1) {
        
        // Sampling BRDF pour les réflexions
        float3 wo = -WorldRayDirection();
        float3 wi = SampleBRDF(wo, normal, material, payload.seed);
        
        if (dot(wi, normal) > 0.001f) {
            RayDesc reflectionRay;
            reflectionRay.Origin = hitPosition + normal * 0.001f;
            reflectionRay.Direction = wi;
            reflectionRay.TMin = 0.001f;
            reflectionRay.TMax = 10000.0f;
            
            RayPayload reflectionPayload = (RayPayload)0;
            reflectionPayload.depth = payload.depth + 1;
            reflectionPayload.seed = nextRandom(payload.seed);
            
            TraceRay(scene, RAY_FLAG_NONE, 0xFF, 0, 0, 0, reflectionRay, reflectionPayload);
            
            // BRDF evaluation
            float3 brdf = EvaluatePBR(wo, wi, normal, material);
            float pdf = PdfBRDF(wo, wi, normal, material);
            
            if (pdf > 0.001f) {
                indirectLighting = reflectionPayload.color * brdf * dot(wi, normal) / pdf;
            }
        }
    }
    
    // Émission du matériau
    float3 emission = material.emission;
    
    // Couleur finale
    payload.color = emission + directLighting + indirectLighting;
    payload.normal = normal;
    payload.t = RayTCurrent();
}

// Calcul de l'éclairage direct avec échantillonnage des lumières
float3 CalculateDirectLighting(float3 position, float3 normal, Material material, inout uint seed) {
    float3 lighting = float3(0, 0, 0);
    
    // Échantillonnage de toutes les lumières
    for (uint lightIndex = 0; lightIndex < sceneParams.lightCount; lightIndex++) {
        Light light = GetLight(lightIndex);
        
        float3 lightDir;
        float lightDistance;
        float attenuation;
        
        // Calcul selon le type de lumière
        if (light.type == LIGHT_DIRECTIONAL) {
            lightDir = -light.direction;
            lightDistance = 10000.0f;
            attenuation = 1.0f;
        } else if (light.type == LIGHT_POINT) {
            float3 toLight = light.position - position;
            lightDistance = length(toLight);
            lightDir = toLight / lightDistance;
            attenuation = 1.0f / (lightDistance * lightDistance);
        } else if (light.type == LIGHT_SPOT) {
            float3 toLight = light.position - position;
            lightDistance = length(toLight);
            lightDir = toLight / lightDistance;
            
            float spotAngle = dot(lightDir, -light.direction);
            float spotFalloff = smoothstep(light.outerCone, light.innerCone, spotAngle);
            attenuation = spotFalloff / (lightDistance * lightDistance);
        }
        
        // Test d'ombrage
        bool inShadow = false;
        if (dot(lightDir, normal) > 0.001f) {
            RayDesc shadowRay;
            shadowRay.Origin = position + normal * 0.001f;
            shadowRay.Direction = lightDir;
            shadowRay.TMin = 0.001f;
            shadowRay.TMax = lightDistance - 0.001f;
            
            RayPayload shadowPayload = (RayPayload)0;
            TraceRay(scene, RAY_FLAG_ACCEPT_FIRST_HIT_AND_END_SEARCH, 0xFF, 1, 0, 1, shadowRay, shadowPayload);
            
            inShadow = (shadowPayload.t >= 0.0f);
        }
        
        if (!inShadow && dot(lightDir, normal) > 0.001f) {
            // Évaluation BRDF PBR
            float3 viewDir = -WorldRayDirection();
            float3 brdf = EvaluatePBR(viewDir, lightDir, normal, material);
            
            lighting += light.color * light.intensity * brdf * dot(lightDir, normal) * attenuation;
        }
    }
    
    return lighting;
}

// BRDF Cook-Torrance pour matériaux PBR
float3 EvaluatePBR(float3 wo, float3 wi, float3 n, Material material) {
    float3 h = normalize(wo + wi);
    
    float NdotL = saturate(dot(n, wi));
    float NdotV = saturate(dot(n, wo));
    float NdotH = saturate(dot(n, h));
    float VdotH = saturate(dot(wo, h));
    
    // Distribution term (GGX/Trowbridge-Reitz)
    float alpha = material.roughness * material.roughness;
    float alpha2 = alpha * alpha;
    float denom = NdotH * NdotH * (alpha2 - 1.0) + 1.0;
    float D = alpha2 / (PI * denom * denom);
    
    // Geometric term (Smith's method)
    float k = (material.roughness + 1.0) * (material.roughness + 1.0) / 8.0;
    float GL = NdotL / (NdotL * (1.0 - k) + k);
    float GV = NdotV / (NdotV * (1.0 - k) + k);
    float G = GL * GV;
    
    // Fresnel term (Schlick's approximation)
    float3 F0 = lerp(float3(0.04, 0.04, 0.04), material.albedo, material.metallic);
    float3 F = F0 + (1.0 - F0) * pow(1.0 - VdotH, 5.0);
    
    // Cook-Torrance BRDF
    float3 specular = D * G * F / (4.0 * NdotL * NdotV + 0.001);
    
    // Diffuse term (Lambertian)
    float3 kS = F;
    float3 kD = (1.0 - kS) * (1.0 - material.metallic);
    float3 diffuse = kD * material.albedo / PI;
    
    return diffuse + specular;
}

// Échantillonnage importance selon la BRDF
float3 SampleBRDF(float3 wo, float3 n, Material material, inout uint seed) {
    float r1 = nextRandomFloat(seed);
    float r2 = nextRandomFloat(seed);
    
    // Choisir entre diffuse et spéculaire selon la métallicité
    float specularProbability = lerp(0.1, 0.9, material.metallic);
    
    if (r1 < specularProbability) {
        // Échantillonnage spéculaire (GGX distribution)
        return SampleGGX(wo, n, material.roughness, r1, r2);
    } else {
        // Échantillonnage diffuse (cosine-weighted)
        return SampleCosineHemisphere(n, r1, r2);
    }
}

// Échantillonnage GGX pour les reflets spéculaires
float3 SampleGGX(float3 wo, float3 n, float roughness, float u1, float u2) {
    float alpha = roughness * roughness;
    
    // Échantillonnage de la distribution GGX
    float phi = 2.0 * PI * u1;
    float cosTheta = sqrt((1.0 - u2) / (1.0 + (alpha * alpha - 1.0) * u2));
    float sinTheta = sqrt(1.0 - cosTheta * cosTheta);
    
    // Direction dans l'espace tangent
    float3 h = float3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
    
    // Transformation vers l'espace monde
    float3 up = abs(n.z) < 0.999 ? float3(0, 0, 1) : float3(1, 0, 0);
    float3 tangent = normalize(cross(up, n));
    float3 bitangent = cross(n, tangent);
    
    h = tangent * h.x + bitangent * h.y + n * h.z;
    
    // Direction de réflexion
    return reflect(-wo, h);
}

// Échantillonnage cosine-weighted pour diffuse
float3 SampleCosineHemisphere(float3 n, float u1, float u2) {
    float phi = 2.0 * PI * u1;
    float cosTheta = sqrt(u2);
    float sinTheta = sqrt(1.0 - u2);
    
    float3 dir = float3(sinTheta * cos(phi), sinTheta * sin(phi), cosTheta);
    
    // Transformation vers l'espace monde
    float3 up = abs(n.z) < 0.999 ? float3(0, 0, 1) : float3(1, 0, 0);
    float3 tangent = normalize(cross(up, n));
    float3 bitangent = cross(n, tangent);
    
    return tangent * dir.x + bitangent * dir.y + n * dir.z;
}
```

## Techniques d'optimisation avancées

### Système de LOD adaptatif pour simulation

```cpp
#include <algorithm>
#include <vector>
#include <unordered_map>

// Niveaux de détail pour simulation
enum class SimulationLOD {
    FULL = 0,        // Simulation complète
    SIMPLIFIED = 1,  // Simulation simplifiée
    APPROXIMATE = 2, // Approximation
    DISABLED = 3     // Désactivée
};

struct LODMetrics {
    float distance_to_camera;
    float screen_coverage;
    float importance_score;
    float computational_cost;
    SimulationLOD current_lod;
    float lod_transition_timer;
};

class AdaptiveLODManager {
private:
    std::unordered_map<uint32_t, LODMetrics> entity_metrics;
    float total_budget_ms = 16.67f;  // 60 FPS target
    float current_frame_time = 0.0f;
    
    // Seuils adaptatifs
    float distance_thresholds[4] = {50.0f, 100.0f, 200.0f, 500.0f};
    float coverage_thresholds[4] = {0.01f, 0.005f, 0.001f, 0.0f};
    
public:
    void update_lod_system(float delta_time, const glm::vec3& camera_position) {
        
        // Phase 1: Calcul des métriques pour toutes les entités
        calculate_entity_metrics(camera_position);
        
        // Phase 2: Tri par importance
        auto sorted_entities = sort_entities_by_importance();
        
        // Phase 3: Allocation adaptative du budget
        allocate_simulation_budget(sorted_entities, delta_time);
        
        // Phase 4: Transitions douces entre LOD
        apply_lod_transitions(delta_time);
        
        // Phase 5: Mise à jour des seuils adaptatifs
        update_adaptive_thresholds();
    }
    
private:
    void calculate_entity_metrics(const glm::vec3& camera_pos) {
        for (auto& [entity_id, metrics] : entity_metrics) {
            
            // Distance à la caméra
            glm::vec3 entity_pos = get_entity_position(entity_id);
            metrics.distance_to_camera = glm::length(entity_pos - camera_pos);
            
            // Couverture écran
            metrics.screen_coverage = calculate_screen_coverage(entity_id, camera_pos);
            
            // Score d'importance combiné
            metrics.importance_score = calculate_importance_score(entity_id, metrics);
            
            // Coût computationnel estimé
            metrics.computational_cost = estimate_computational_cost(entity_id, metrics.current_lod);
        }
    }
    
    float calculate_screen_coverage(uint32_t entity_id, const glm::vec3& camera_pos) {
        // Récupération du bounding box de l'entité
        BoundingBox bbox = get_entity_bounds(entity_id);
        
        // Projection sur l'écran
        glm::mat4 view_proj = get_view_projection_matrix();
        
        std::vector<glm::vec4> corners = {
            glm::vec4(bbox.min.x, bbox.min.y, bbox.min.z, 1.0f),
            glm::vec4(bbox.max.x, bbox.min.y, bbox.min.z, 1.0f),
            glm::vec4(bbox.min.x, bbox.max.y, bbox.min.z, 1.0f),
            glm::vec4(bbox.max.x, bbox.max.y, bbox.min.z, 1.0f),
            glm::vec4(bbox.min.x, bbox.min.y, bbox.max.z, 1.0f),
            glm::vec4(bbox.max.x, bbox.min.y, bbox.max.z, 1.0f),
            glm::vec4(bbox.min.x, bbox.max.y, bbox.max.z, 1.0f),
            glm::vec4(bbox.max.x, bbox.max.y, bbox.max.z, 1.0f)
        };
        
        glm::vec2 screen_min(1.0f, 1.0f);
        glm::vec2 screen_max(-1.0f, -1.0f);
        
        for (const auto& corner : corners) {
            glm::vec4 projected = view_proj * corner;
            if (projected.w > 0.0f) {
                glm::vec2 ndc = glm::vec2(projected.x, projected.y) / projected.w;
                screen_min = glm::min(screen_min, ndc);
                screen_max = glm::max(screen_max, ndc);
            }
        }
        
        // Calcul de la surface en pourcentage de l'écran
        glm::vec2 screen_size = screen_max - screen_min;
        return (screen_size.x * screen_size.y) / 4.0f;  // Normalisé par la taille totale de l'écran NDC
    }
    
    float calculate_importance_score(uint32_t entity_id, const LODMetrics& metrics) {
        float base_score = 1.0f;
        
        // Facteur de distance (plus proche = plus important)
        float distance_factor = 1.0f / (1.0f + metrics.distance_to_camera * 0.01f);
        
        // Facteur de couverture écran
        float coverage_factor = std::sqrt(metrics.screen_coverage);
        
        // Facteur de gameplay (entités importantes pour le joueur)
        float gameplay_factor = get_gameplay_importance(entity_id);
        
        // Facteur de mouvement (objets en mouvement plus importants)
        float velocity = glm::length(get_entity_velocity(entity_id));
        float movement_factor = std::min(1.0f, velocity / 10.0f);
        
        return base_score * distance_factor * coverage_factor * gameplay_factor * (1.0f + movement_factor);
    }
    
    std::vector<uint32_t> sort_entities_by_importance() {
        std::vector<uint32_t> entities;
        entities.reserve(entity_metrics.size());
        
        for (const auto& [entity_id, metrics] : entity_metrics) {
            entities.push_back(entity_id);
        }
        
        std::sort(entities.begin(), entities.end(), 
                 [this](uint32_t a, uint32_t b) {
                     return entity_metrics[a].importance_score > entity_metrics[b].importance_score;
                 });
        
        return entities;
    }
    
    void allocate_simulation_budget(const std::vector<uint32_t>& sorted_entities, float delta_time) {
        float remaining_budget = total_budget_ms;
        
        // Allocation greedy basée sur l'importance
        for (uint32_t entity_id : sorted_entities) {
            LODMetrics& metrics = entity_metrics[entity_id];
            
            // Détermination du LOD optimal selon le budget
            SimulationLOD target_lod = determine_target_lod(entity_id, metrics, remaining_budget);
            
            // Application du LOD
            if (target_lod != metrics.current_lod) {
                schedule_lod_transition(entity_id, target_lod);
            }
            
            // Déduction du coût du budget
            float cost = estimate_computational_cost(entity_id, target_lod);
            remaining_budget -= cost;
            
            // Arrêt si budget épuisé
            if (remaining_budget <= 0) {
                // Désactiver les entités restantes
                for (size_t i = &entity_id - &sorted_entities[0] + 1; i < sorted_entities.size(); i++) {
                    schedule_lod_transition(sorted_entities[i], SimulationLOD::DISABLED);
                }
                break;
            }
        }
    }
    
    SimulationLOD determine_target_lod(uint32_t entity_id, const LODMetrics& metrics, 
                                      float available_budget) {
        
        // Coûts pour chaque niveau de LOD
        float costs[4] = {
            estimate_computational_cost(entity_id, SimulationLOD::FULL),
            estimate_computational_cost(entity_id, SimulationLOD::SIMPLIFIED),
            estimate_computational_cost(entity_id, SimulationLOD::APPROXIMATE),
            estimate_computational_cost(entity_id, SimulationLOD::DISABLED)
        };
        
        // Sélection du meilleur LOD selon budget et importance
        for (int lod = 0; lod < 4; lod++) {
            if (costs[lod] <= available_budget) {
                
                // Vérification des seuils de distance et couverture
                if (metrics.distance_to_camera > distance_thresholds[lod] &&
                    metrics.screen_coverage < coverage_thresholds[lod]) {
                    continue;  // Ce LOD n'est pas approprié pour cette distance/taille
                }
                
                return static_cast<SimulationLOD>(lod);
            }
        }
        
        return SimulationLOD::DISABLED;  // Aucun LOD ne rentre dans le budget
    }
    
    float estimate_computational_cost(uint32_t entity_id, SimulationLOD lod) {
        // Coût de base selon le type d'entité
        float base_cost = get_entity_base_cost(entity_id);
        
        // Facteurs de coût selon le LOD
        float lod_multipliers[4] = {1.0f, 0.5f, 0.2f, 0.01f};
        
        return base_cost * lod_multipliers[static_cast<int>(lod)];
    }
    
    void apply_lod_transitions(float delta_time) {
        const float transition_duration = 0.5f;  // 500ms de transition
        
        for (auto& [entity_id, metrics] : entity_metrics) {
            if (metrics.lod_transition_timer > 0.0f) {
                metrics.lod_transition_timer -= delta_time;
                
                if (metrics.lod_transition_timer <= 0.0f) {
                    // Transition terminée
                    apply_lod_to_entity(entity_id, metrics.current_lod);
                }
            }
        }
    }
    
    void update_adaptive_thresholds() {
        // Adaptation basée sur les performances
        if (current_frame_time > total_budget_ms * 1.1f) {
            // Performance dégradée, réduire les seuils (plus agressif)
            for (int i = 0; i < 4; i++) {
                distance_thresholds[i] *= 0.95f;
                coverage_thresholds[i] *= 0.95f;
            }
        } else if (current_frame_time < total_budget_ms * 0.8f) {
            // Performance bonne, augmenter les seuils (plus de qualité)
            for (int i = 0; i < 4; i++) {
                distance_thresholds[i] *= 1.02f;
                coverage_thresholds[i] *= 1.02f;
            }
        }
    }
};

// Système d'instancing pour objets similaires
class InstancedSimulation {
private:
    struct InstanceGroup {
        std::vector<glm::mat4> transforms;
        std::vector<glm::vec3> velocities;
        std::vector<float> masses;
        uint32_t active_count;
        SimulationLOD current_lod;
    };
    
    std::unordered_map<uint32_t, InstanceGroup> instance_groups;
    
public:
    void simulate_instanced_group(uint32_t group_id, float delta_time) {
        InstanceGroup& group = instance_groups[group_id];
        
        switch (group.current_lod) {
            case SimulationLOD::FULL:
                simulate_full_physics_instanced(group, delta_time);
                break;
            case SimulationLOD::SIMPLIFIED:
                simulate_simplified_physics_instanced(group, delta_time);
                break;
            case SimulationLOD::APPROXIMATE:
                simulate_approximate_physics_instanced(group, delta_time);
                break;
            case SimulationLOD::DISABLED:
                // Pas de simulation
                break;
        }
    }
    
private:
    void simulate_full_physics_instanced(InstanceGroup& group, float delta_time) {
        // Simulation complète pour chaque instance
        #pragma omp parallel for
        for (int i = 0; i < static_cast<int>(group.active_count); i++) {
            // Forces gravitationnelles
            glm::vec3 gravity_force = glm::vec3(0, -9.81f, 0) * group.masses[i];
            
            // Intégration Verlet
            group.velocities[i] += (gravity_force / group.masses[i]) * delta_time;
            
            // Mise à jour de la position
            glm::vec3 position = glm::vec3(group.transforms[i][3]);
            position += group.velocities[i] * delta_time;
            group.transforms[i][3] = glm::vec4(position, 1.0f);
            
            // Collision avec le sol
            if (position.y < 0.0f) {
                position.y = 0.0f;
                group.velocities[i].y = -group.velocities[i].y * 0.8f;  // Rebond
                group.transforms[i][3] = glm::vec4(position, 1.0f);
            }
        }
    }
    
    void simulate_simplified_physics_instanced(InstanceGroup& group, float delta_time) {
        // Simulation simplifiée (pas de collisions inter-objets)
        const glm::vec3 gravity(0, -9.81f, 0);
        
        #pragma omp parallel for
        for (int i = 0; i < static_cast<int>(group.active_count); i++) {
            // Intégration simple
            group.velocities[i] += gravity * delta_time;
            
            glm::vec3 position = glm::vec3(group.transforms[i][3]);
            position += group.velocities[i] * delta_time;
            
            // Collision simple avec le sol
            if (position.y < 0.0f) {
                position.y = 0.0f;
                group.velocities[i].y *= -0.5f;
            }
            
            group.transforms[i][3] = glm::vec4(position, 1.0f);
        }
    }
    
    void simulate_approximate_physics_instanced(InstanceGroup& group, float delta_time) {
        // Approximation très simple (trajectoires balistiques)
        for (size_t i = 0; i < group.active_count; i++) {
            glm::vec3 position = glm::vec3(group.transforms[i][3]);
            
            // Trajectoire parabolique simple
            position += group.velocities[i] * delta_time;
            position.y += -4.905f * delta_time * delta_time;  // 0.5 * g * t²
            
            group.transforms[i][3] = glm::vec4(position, 1.0f);
            
            // Recycler les objets qui tombent trop bas
            if (position.y < -10.0f) {
                reset_instance(group, i);
            }
        }
    }
    
    void reset_instance(InstanceGroup& group, size_t index) {
        // Réinitialisation d'une instance (système de particules)
        glm::vec3 spawn_pos(
            (rand() % 100 - 50) * 0.1f,  // X entre -5 et 5
            10.0f,                       // Y à 10m de hauteur
            (rand() % 100 - 50) * 0.1f   // Z entre -5 et 5
        );
        
        group.transforms[index] = glm::translate(glm::mat4(1.0f), spawn_pos);
        group.velocities[index] = glm::vec3(
            (rand() % 100 - 50) * 0.02f,  // Vitesse aléatoire X
            0.0f,                         // Vitesse Y initiale nulle
            (rand() % 100 - 50) * 0.02f   // Vitesse aléatoire Z
        );
    }
};
```

## Conclusion

La simulation physique avancée et le rendu photoréaliste représentent l'aboutissement de décennies de recherche en informatique graphique. L'intégration harmonieuse d'algorithmes de simulation haute performance, de techniques de ray tracing modernes et de systèmes d'optimisation adaptatifs permet de créer des expériences visuelles et interactives d'un réalisme saisissant.

Les futures évolutions incluront l'intelligence artificielle pour la prédiction de comportements physiques complexes, l'optimisation neuromorphique des algorithmes de simulation, et l'exploitation des architectures GPU de nouvelle génération pour repousser encore les limites du temps réel.

---

*Simulation et rendu avancés par l'équipe CyberGarage - Excellence en informatique graphique*