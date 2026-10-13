/**
 * FICHIER GÉNÉRÉ — NE PAS MODIFIER À LA MAIN.
 *
 * Produit par tools/generate-content-catalog.mjs depuis src/assets/articles/.
 * Pour publier un article : déposer le .md dans la bonne catégorie avec un champ
 * « date: AAAA-MM-JJ » dans son frontmatter. Le catalogue, le blog et le sitemap
 * suivent automatiquement.
 *
 * Régénérer :  node tools/generate-content-catalog.mjs
 * Vérifier  :  node tools/generate-content-catalog.mjs --check
 *
 * Source unique du contenu du site, utilisable côté navigateur ET côté serveur
 * (aucune dépendance Angular) : chargement des articles (ArticlesService),
 * routes de prérendu (app.routes.server.ts) et sitemap (src/server.ts).
 */

/** Pages "vitrine" statiques (chemins relatifs à la racine). */
export const STATIC_PAGES: string[] = ['', 'competences', 'projets', 'about', 'contact', 'blog'];

/** Catégories possédant une page dédiée (route /<slug>). */
export const CATEGORY_SLUGS: string[] = [
  'automobile',
  'dev-info',
  'ia-master',
  'cybersecurity',
  'fpga',
  'mechanical',
  'electronics',
  'pragmatic',
  'hpc',
  'telecom',
  'simulation',
];

/** Catalogue des articles publiés : catégorie -> slugs, du plus récent au plus ancien. */
export const ARTICLE_CATALOG: Record<string, string[]> = {
  automobile: [
    'bev-phev-hev-differences-vehicules-electriques',
    'euro-ncap-notation-etoiles-securite',
    'freinage-regeneratif',
  ],
  'dev-info': [
    'claude-code-nouveautes-design-auto-mode',
    'java-records-jep-395',
    'java-virtual-threads-jep-444',
    'microservices-docker-kubernetes',
  ],
  'ia-master': [
    'anatomie-du-harnais-agent-standards',
    'hermes-agent-separer-le-modele-du-harnais',
    'ia-generative-emploi-informatique-etude-pse',
    'mistral-agentic-search-vs-rag',
    'auditer-ia-architecture-modele-composant',
    'model-context-protocol-mcp',
    'prompt-engineering-anthropic',
  ],
  cybersecurity: [
    'jwt-json-web-token-rfc-7519',
    'oauth-2-rfc-6749',
    'owasp-top-10-2021',
    'zero-trust-architecture',
  ],
  fpga: [
    'zephyr-rtos-threads-ordonnancement',
    'lecons-du-dev-embarque',
    'traitement-video-temps-reel',
  ],
  mechanical: [
    'ecss-corrosion-materiaux-spatiaux',
    'nasa-std-5001-facteurs-securite',
    'verification-qualification-acceptation-nasa',
    'moteur-ingenierie-systeme-nasa',
  ],
  electronics: [
    'usb4-usb-power-delivery-specifications-usb-if',
    'kicad-drc-design-rules-checker',
    'bluetooth-channel-sounding',
    'i2c-esp32-esp-idf',
    'onduleurs-solaires',
  ],
  pragmatic: [
    'learn-harness-engineering-revue-cours',
    'conventional-commits',
    'la-passion-retrecit-la-competence-dure',
    'semantic-versioning-2',
    'twelve-factor-app',
    'genai-et-developpeurs-vers-quel-avenir',
  ],
  hpc: [
    'slurm-workload-manager',
    'top500-methodologie-linpack',
    'openmp-parallelisme-memoire-partagee',
    'optimisation-gpu',
  ],
  telecom: [
    'quic-rfc-9000',
    'http-3-quic-rfc-9114',
    'tls-1-3-rfc-8446',
    'reseaux-intelligents',
  ],
  simulation: [
    'fmi-functional-mock-up-interface',
    'gmsh-algorithmes-maillage',
    'simulation-physique',
  ],
};
