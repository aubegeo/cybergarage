import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Route dynamique : rendu serveur à la demande (pas de prérendu car les
    // paramètres :category/:id ne sont pas connus à la compilation).
    path: 'article/:category/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
