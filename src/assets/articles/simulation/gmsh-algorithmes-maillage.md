---
title: "Gmsh : comment un mailleur open source choisit le bon algorithme pour votre maillage"
category: simulation
date: 2026-07-30
author: Geoffrey Aubert
tags: ["simulation", "maillage", "elements-finis", "open-source", "gmsh"]
summary: "Plongée dans la documentation officielle de Gmsh pour comprendre comment le logiciel transforme une géométrie CAO en maillage éléments finis, et comment choisir entre ses différents algorithmes 2D et 3D."
readTime: 8
---

Avant de lancer un calcul par éléments finis (mécanique des fluides, thermique, structure), il faut un maillage. Et avant d'avoir un maillage, il faut un outil capable de transformer une géométrie (souvent issue d'un CAO) en un ensemble de triangles, tétraèdres ou quadrangles exploitables par un solveur. Dans l'écosystème open source, **Gmsh** occupe une place particulière puisqu'il est à la fois un mailleur, un mini-CAO (via le noyau OpenCASCADE) et un post-processeur, utilisé aussi bien en recherche qu'en bureau d'études.

Ce qui distingue Gmsh de beaucoup d'outils commerciaux, c'est que sa documentation officielle explique *honnêtement* ce qu'il sait bien faire et ce qu'il ne sait pas bien faire, une rareté qui mérite d'être citée. Cet article s'appuie exclusivement sur le manuel officiel (*Gmsh reference manual*, section « Overview of Gmsh » et « Mesh module »).

## Qu'est-ce que Gmsh, concrètement ?

Gmsh se positionne comme un outil capable de :

- « generate unstructured 1D, 2D and 3D simplicial (i.e., using line segments, triangles and tetrahedra) finite element meshes […], with fine control over the element size » ;
- « create simple extruded geometries and meshes, and allow to automatically couple such structured meshes with unstructured ones (using a layer of pyramids in 3D) » ;
- « generate high-order (curved) meshes that conform to the CAD model geometry », avec des outils d'optimisation garantissant la validité de ces maillages courbes ;
- « import geometries from other CAD software in standard exchange formats », via OpenCASCADE, y compris les informations de label et de couleur des fichiers STEP et IGES ;
- « interact with external solvers by defining ONELAB parameters, shared between Gmsh and the solvers », soit un mécanisme pour faire dialoguer maillage et solveur sans coder une intégration sur mesure.

Le manuel précise aussi que Gmsh « can be compiled with or without the GUI […] and all versions can be used either interactively or directly from the command line », ce qui est important pour qui veut l'intégrer dans un pipeline de calcul automatisé (HPC, batch, CI).

## Les algorithmes de maillage non structuré en 2D

C'est sans doute la partie la plus intéressante pour qui débute, puisque Gmsh ne propose pas un algorithme unique mais plusieurs, chacun avec ses forces documentées.

- **MeshAdapt** : « based on local mesh modifications […] edge swaps, splits, and collapses: long edges are split, short edges are collapsed, and edges are swapped if a better geometrical configuration is obtained ». La doc le décrit comme le plus robuste en indiquant que « For very complex curved surfaces the “MeshAdapt” algorithm is the most robust. »
- **Delaunay** : « inspired by the work of the GAMMA team at INRIA. New points are inserted sequentially at the circumcenter of the element that has the largest adimensional circumradius. » Il est présenté comme le plus rapide sur de grandes surfaces planes, le manuel indiquant que « For very large meshes of plane surfaces the “Delaunay” algorithm is the fastest ».
- **Frontal-Delaunay** : « inspired by the work of S. Rebay », recommandé « when high element quality is important ».
- **Frontal-Delaunay for Quads** et **BAMG** : variantes expérimentales, la première pour générer des triangles adaptés à la recombinaison en quadrangles, la seconde pour des triangulations anisotropes.
- **Automatic** : sélectionne « “Delaunay” for plane surfaces and “MeshAdapt” for all other surfaces ».

Le manuel ajoute un détail rassurant sur la robustesse globale : « When the “Delaunay” or “Frontal-Delaunay” algorithms fail, “MeshAdapt” is automatically triggered », ce qui constitue un mécanisme de repli automatique plutôt qu'un simple message d'erreur.

## Et en 3D ?

Le passage à la troisième dimension change la donne, car mailler un volume suppose d'abord de mailler correctement sa surface :

- **Delaunay 3D** : décomposé en trois étapes, à savoir un maillage initial de l'union des volumes sans point interne, la récupération du maillage de surface via l'algorithme de récupération de frontière de H. Si (Tetgen/BR), puis l'insertion de points dans le volume via une version 3D du Delaunay 2D. Le manuel le qualifie de référence en indiquant que « The “Delaunay” algorithm is currently the most robust and is the only one that supports the automatic generation of hybrid meshes with pyramids. »
- **Frontal** : s'appuie sur l'algorithme Netgen de J. Schöberl, tel que décrit dans le manuel.
- **HXT** : « a new efficient and parallel reimplementaton of the Delaunay algorithm ».
- **MMG3D** : algorithme expérimental pour générer des tétraédrisations anisotropes.

Un point technique à retenir pour qui travaille avec des champs de taille de maille avancés tient à ce que « Embedded model entities and general mesh size fields […] are currently only supported by the “Delaunay” and “HXT” algorithms », ce qui constitue un critère de choix concret plutôt qu'une nuance cosmétique.

## Contrôler la taille des éléments

Gmsh ne se contente pas de mailler mais permet de piloter finement la taille des éléments à travers plusieurs mécanismes combinables, décrits dans la section « Specifying mesh element sizes » :

- la taille au niveau des points géométriques (`Mesh.MeshSizeFromPoints`) ;
- la taille dérivée de la courbure des courbes et surfaces (`Mesh.MeshSizeFromCurvature`, exprimée en nombre d'éléments par 2π radians) ;
- des **champs de taille de fond** (*background mesh size fields*) : champs `Box` (taille dans/hors d'une région parallélépipédique), `Distance` (taille selon la distance à des entités du modèle), `MathEval` (fonction mathématique explicite), `PostView` (maillage de fond fourni sous forme de vue de post-traitement, utile pour l'adaptation de maillage itérative), `Extend` (extension de tailles depuis une frontière) et `Min`/`Max` (combinaison d'autres champs).

Le manuel précise aussi la mécanique fine du contrôle, puisque la valeur finale est contrainte dans l'intervalle `[Mesh.MeshSizeMin, Mesh.MeshSizeMax]` (options `-clmin`/`-clmax` en ligne de commande) puis multipliée par `Mesh.MeshSizeFactor` (`-clscale`). Via l'API, cette valeur peut encore être modifiée par un callback C++, C, Python, Julia ou Fortran (`gmsh/model/mesh/setSizeCallback`).

## Le parallélisme, sans magie

Gmsh documente clairement où le calcul parallèle s'applique et où il ne s'applique pas, en écrivant que « 1D and 2D meshing is parallelized using a coarse-grained approach, i.e. curves (resp. surfaces) are each meshed sequentially, but several curves (resp. surfaces) can be meshed at the same time. 3D meshing using HXT is parallelized using a fine-grained approach, i.e. the actual meshing procedure for a single volume is done is parallel. » Autrement dit, paralléliser un maillage 2D revient à répartir des entités indépendantes (courbes ou surfaces, chacune étant maillée séquentiellement) entre threads tandis que HXT parallélise réellement le calcul *à l'intérieur* d'un même volume. Le nombre de threads se règle via l'option `-nt` en ligne de commande, ou les options `General.NumThreads`, `Mesh.MaxNumThreads1D/2D/3D`.

## Ce que Gmsh assume ne pas (encore) bien faire

Une section entière, « … and what Gmsh is not so good at », liste explicitement les limites connues du projet, ce qui est rare dans une documentation technique :

- « Gmsh is not a multi-bloc mesh generator: all meshes produced by Gmsh are conforming in the sense of finite element meshes » ;
- « Gmsh's graphical user interface is only exposing a limited number of the available features » ;
- « While Gmsh can create and manipulate geometries interactively, it is in no way a full-fledged replacement for an advanced CAD system » ;
- « Gmsh uses straightforward OpenGL 1.1 for graphics, without specific tricks to handle very large meshes and post-processing datasets (decimation and automatic level of detail, culling, advanced transparency, etc.) ».

Pour un outil open source maintenu par une petite équipe académique, c'est une manière saine de fixer les attentes, puisque Gmsh n'est ni un mailleur multi-bloc industriel, ni un CAO complet, ni un moteur de visualisation temps réel pour des jeux de données massifs.

## Installation et intégration

Le manuel décrit deux modes d'usage : application autonome (GUI, ligne de commande, scripts `.geo`) ou bibliothèque intégrable via l'API Gmsh, disponible « in C++, C, Python, Julia and Fortran ». Pour Python, l'installation est directe : `pip install --upgrade gmsh` télécharge le SDK binaire et installe les fichiers nécessaires. Un SDK binaire (Windows, Linux, macOS) est aussi distribué directement sur le site du projet pour les autres langages.

## Pourquoi ça compte

Choisir un algorithme de maillage n'est pas un détail puisque cela conditionne la robustesse (MeshAdapt sur une géométrie complexe), la vitesse (Delaunay sur une grande surface plane), la qualité des éléments (Frontal-Delaunay), ou la compatibilité avec des fonctionnalités avancées comme les champs de taille combinés (réservés à Delaunay et HXT). La documentation de Gmsh a le mérite rare de documenter ces arbitrages plutôt que de les cacher derrière un bouton « Auto ».

## Sources

- [Gmsh reference manual — Overview of Gmsh, Mesh module (section 1.2.1 « Choosing the right unstructured algorithm », 1.2.2 « Specifying mesh element sizes », 1.5–1.6 « What Gmsh is (not) good at »)](https://gmsh.info/doc/texinfo/gmsh.html)
