import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Route dynamique : rendu serveur à la demande (pas de prérendu car les
    // paramètres :category/:id ne sont pas connus à la compilation).
    path: 'article/:category/:id',
    renderMode: RenderMode.Server
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
    // Tout le reste (URL inconnue) : rendu à la demande de la page 404,
    // impossible à prérendre puisque les chemins ne sont pas énumérables.
    path: '**',
    renderMode: RenderMode.Server
  }
];
