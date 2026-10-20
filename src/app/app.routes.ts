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
    // ArticleViewerComponent est purement presentationnel (@Input article), il ne
    // peut pas servir de composant de route : rien ne remplissait son input, donc
    // toute page d'article affichait « Aucun article selectionne ».
    loadComponent: () => import('./pages/article/article-page').then(m => m.ArticlePageComponent),
    data: { renderMode: 'prerender' }
  },
  {
    path: 'automobile',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'automobile' }
  },
  {
    path: 'dev-info',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'dev-info' }
  },
  {
    path: 'ia-master',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'ia-master' }
  },
  {
    path: 'cybersecurity',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'cybersecurity' }
  },
  {
    path: 'fpga',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'fpga' }
  },
  {
    path: 'mechanical',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'mechanical' }
  },
  {
    path: 'electronics',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'electronics' }
  },
  {
    path: 'pragmatic',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'pragmatic' }
  },
  {
    path: 'hpc',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'hpc' }
  },
  {
    path: 'telecom',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'telecom' }
  },
  {
    path: 'simulation',
      loadComponent: () => import('./features/category/category-page.component')
        .then(m => m.CategoryPageComponent),
      data: { category: 'simulation' }
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFoundComponent)
  }
];
