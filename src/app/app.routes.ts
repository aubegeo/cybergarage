import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'blog',
    loadComponent: () => import('./pages/blog/blog.component').then(m => m.BlogComponent)
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.AboutComponent)
  },
  {
    path: 'competences',
    loadComponent: () => import('./features/competences/competences.component').then(m => m.CompetencesComponent)
  },
  {
    path: 'projets',
    loadComponent: () => import('./features/projets/projets.component').then(m => m.ProjetsComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.ContactComponent)
  },
  {
    path: 'article/:category/:id',
    loadComponent: () => import('./shared/components/article-viewer/article-viewer').then(m => m.ArticleViewerComponent),
    data: { renderMode: 'ssr' }
  },
  {
    path: 'automobile',
    loadComponent: () => import('./features/automobile/automobile.component').then(m => m.AutomobileComponent)
  },
  {
    path: 'dev-info',
    loadComponent: () => import('./features/dev-info/dev-info.component').then(m => m.DevInfoComponent)
  },
  {
    path: 'ia-master',
    loadComponent: () => import('./features/ia-master/ia-master.component').then(m => m.IaMasterComponent)
  },
  {
    path: 'cybersecurity',
    loadChildren: () => import('./features/cybersecurity/cybersecurity-module').then(m => m.CybersecurityModule)
  },
  {
    path: 'fpga',
    loadChildren: () => import('./features/fpga/fpga-module').then(m => m.FpgaModule)
  },
  {
    path: 'mechanical',
    loadChildren: () => import('./features/mechanical/mechanical-module').then(m => m.MechanicalModule)
  },
  {
    path: 'electronics',
    loadChildren: () => import('./features/electronics/electronics-module').then(m => m.ElectronicsModule)
  },
  {
    path: 'pragmatic',
    loadChildren: () => import('./features/pragmatic/pragmatic-module').then(m => m.PragmaticModule)
  },
  {
    path: 'hpc',
    loadComponent: () => import('./features/hpc/hpc.component').then(m => m.HpcComponent)
  },
  {
    path: 'telecom',
    loadComponent: () => import('./features/telecom/telecom.component').then(m => m.TelecomComponent)
  },
  {
    path: 'simulation',
    loadComponent: () => import('./features/simulation/simulation.component').then(m => m.SimulationComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent)
  }
];
