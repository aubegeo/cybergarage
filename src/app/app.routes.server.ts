import { RenderMode, ServerRoute } from '@angular/ssr';
import { ARTICLE_CATALOG } from './shared/content-catalog';

/**
 * Déploiement GitHub Pages : tout doit être prérendu.
 *
 * Pages ne sert que des fichiers statiques et n'exécute aucun serveur Node, donc
 * RenderMode.Server y produirait une page vide. Le site est désormais entièrement
 * généré à la compilation.
 *
 * C'est aussi meilleur pour le référencement et pour la citation par les modèles,
 * puisqu'un robot reçoit du HTML complet sans dépendre d'un serveur qui tourne.
 */
export const serverRoutes: ServerRoute[] = [
  {
    // Les slugs SONT énumérables, ils vivent dans ARTICLE_CATALOG, que le
    // générateur de sitemap lit déjà. L'ancien commentaire affirmait le
    // contraire et empêchait le prérendu de toutes les pages d'article.
    path: 'article/:category/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return Object.entries(ARTICLE_CATALOG).flatMap(([category, slugs]) =>
        slugs.map(id => ({ category, id })),
      );
    },
  },
  // Chemins statiques réels de l'app (voir app.routes.ts), tous prérendus.
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'competences', renderMode: RenderMode.Prerender },
  { path: 'projets', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'automobile', renderMode: RenderMode.Prerender },
  { path: 'dev-info', renderMode: RenderMode.Prerender },
  { path: 'ia-master', renderMode: RenderMode.Prerender },
  { path: 'cybersecurity', renderMode: RenderMode.Prerender },
  { path: 'fpga', renderMode: RenderMode.Prerender },
  { path: 'mechanical', renderMode: RenderMode.Prerender },
  { path: 'electronics', renderMode: RenderMode.Prerender },
  { path: 'pragmatic', renderMode: RenderMode.Prerender },
  { path: 'hpc', renderMode: RenderMode.Prerender },
  { path: 'telecom', renderMode: RenderMode.Prerender },
  { path: 'simulation', renderMode: RenderMode.Prerender },
  {
    // Angular exige que toute route de app.routes.ts soit couverte ici, y compris
    // l'attrape-tout. Sur un hébergement statique il est rendu côté client : le
    // workflow Pages recopie la page prérendue en 404.html, Pages la sert pour
    // toute URL inconnue, et le routeur Angular reprend la main dans le navigateur.
    path: '**',
    renderMode: RenderMode.Client,
  },
];
