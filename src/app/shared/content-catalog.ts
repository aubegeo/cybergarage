/**
 * Source unique du contenu du site, utilisable côté navigateur ET côté serveur
 * (aucune dépendance Angular). Sert à la fois :
 *  - au chargement des articles (ArticlesService),
 *  - à la génération automatique du sitemap (src/server.ts).
 *
 * 👉 Pour publier un nouvel article : ajoute son slug ici sous la bonne catégorie.
 *    Le blog ET le sitemap seront à jour automatiquement.
 */

/** Pages "vitrine" statiques (chemins relatifs à la racine). */
export const STATIC_PAGES: string[] = ['', 'competences', 'projets', 'about', 'contact', 'blog'];

/** Catégories possédant une page dédiée (route /<slug>). */
export const CATEGORY_SLUGS: string[] = [
  'automobile', 'dev-info', 'ia-master', 'cybersecurity', 'fpga',
  'mechanical', 'electronics', 'pragmatic', 'hpc', 'telecom', 'simulation',
];

/** Catalogue des articles publiés : catégorie -> liste de slugs (fichiers .md). */
export const ARTICLE_CATALOG: Record<string, string[]> = {
  automobile: [
    'freinage-regeneratif',
    'bev-phev-hev-differences-vehicules-electriques',
    'euro-ncap-notation-etoiles-securite',
  ],
  cybersecurity: [
    'zero-trust-architecture',
    'owasp-top-10-2021',
    'jwt-json-web-token-rfc-7519',
    'oauth-2-rfc-6749',
  ],
  'dev-info': [
    'microservices-docker-kubernetes',
    'java-virtual-threads-jep-444',
    'claude-code-nouveautes-design-auto-mode',
    'java-records-jep-395',
  ],
  'ia-master': [
    'model-context-protocol-mcp',
    'anatomie-du-harnais-agent-standards',
    'auditer-ia-architecture-modele-composant',
    'hermes-agent-separer-le-modele-du-harnais',
    'ia-generative-emploi-informatique-etude-pse',
    'mistral-agentic-search-vs-rag',
    'prompt-engineering-anthropic',
  ],
  electronics: [
    'onduleurs-solaires',
    'bluetooth-channel-sounding',
    'i2c-esp32-esp-idf',
    'kicad-drc-design-rules-checker',
    'usb4-usb-power-delivery-specifications-usb-if',
  ],
  fpga: [
    'traitement-video-temps-reel',
    'lecons-du-dev-embarque',
    'zephyr-rtos-threads-ordonnancement',
  ],
  mechanical: [
    'ecss-corrosion-materiaux-spatiaux',
    'moteur-ingenierie-systeme-nasa',
    'nasa-std-5001-facteurs-securite',
    'verification-qualification-acceptation-nasa',
  ],
  pragmatic: [
    'genai-et-developpeurs-vers-quel-avenir',
    'twelve-factor-app',
    'learn-harness-engineering-revue-cours',
    'conventional-commits',
    'la-passion-retrecit-la-competence-dure',
    'semantic-versioning-2',
  ],
  hpc: [
    'optimisation-gpu',
    'openmp-parallelisme-memoire-partagee',
    'slurm-workload-manager',
    'top500-methodologie-linpack',
  ],
  telecom: [
    'reseaux-intelligents',
    'http-3-quic-rfc-9114',
    'quic-rfc-9000',
    'tls-1-3-rfc-8446',
  ],
  simulation: [
    'simulation-physique',
    'fmi-functional-mock-up-interface',
    'gmsh-algorithmes-maillage',
  ],
};
