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
  automobile: ['freinage-regeneratif'],
  cybersecurity: ['zero-trust-architecture', 'owasp-top-10-2021'],
  'dev-info': ['microservices-docker-kubernetes', 'java-virtual-threads-jep-444'],
  'ia-master': ['model-context-protocol-mcp', 'auditer-ia-architecture-modele-composant'],
  electronics: ['onduleurs-solaires'],
  fpga: ['traitement-video-temps-reel', 'lecons-du-dev-embarque'],
  mechanical: [],
  pragmatic: ['genai-et-developpeurs-vers-quel-avenir', 'twelve-factor-app'],
  hpc: ['optimisation-gpu'],
  telecom: ['reseaux-intelligents', 'http-3-quic-rfc-9114'],
  simulation: ['simulation-physique'],
};
