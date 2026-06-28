import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Category, NavigationItem } from '../models/category';
import { CategoryType } from '../models/article';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();

  private categories: Category[] = [
    {
      id: CategoryType.AUTOMOBILE,
      name: 'Automobile',
      description: 'Technologies et innovations automobiles',
      icon: 'directions_car',
      color: '#FF6B35',
      route: '/automobile',
      featured: true,
      articleCount: 0
    },
    {
      id: CategoryType.DEV_INFO,
      name: 'Artisan Développeur',
      description: 'Craftsmanship logiciel, System Design, bonnes pratiques et soft skills du développeur',
      icon: 'code',
      color: '#4ECDC4',
      route: '/dev-info',
      featured: true,
      articleCount: 0
    },
    {
      id: CategoryType.IA_MASTER,
      name: 'IA Master',
      description: 'Intelligence artificielle, LLM et IA générative appliquée',
      icon: 'smart_toy',
      color: '#6C5CE7',
      route: '/ia-master',
      featured: true,
      articleCount: 0
    },
    {
      id: CategoryType.CYBERSECURITY,
      name: 'Cybersécurité',
      description: 'Sécurité informatique et ethical hacking',
      icon: 'security',
      color: '#FF3E41',
      route: '/cybersecurity',
      featured: true,
      articleCount: 0
    },
    {
      id: CategoryType.FPGA,
      name: 'FPGA & Embarqué',
      description: 'Systèmes embarqués et programmation FPGA',
      icon: 'memory',
      color: '#9B59B6',
      route: '/fpga',
      featured: true,
      articleCount: 0
    },
    {
      id: CategoryType.MECHANICAL,
      name: 'Mécanique',
      description: 'Ingénierie mécanique et conception',
      icon: 'engineering',
      color: '#F39C12',
      route: '/mechanical',
      featured: true,
      articleCount: 0
    },
    {
      id: CategoryType.ELECTRONICS,
      name: 'Électronique',
      description: 'Électronique pure et circuits',
      icon: 'electrical_services',
      color: '#2ECC71',
      route: '/electronics',
      featured: true,
      articleCount: 0
    },
    {
      id: CategoryType.PRAGMATIC,
      name: 'Pragmatic Engineer',
      description: 'Bonnes pratiques d\'ingénierie, leadership et soft skills',
      icon: 'architecture',
      color: '#3498DB',
      route: '/pragmatic',
      featured: true,
      articleCount: 0
    }
  ];

  private navigationItems: NavigationItem[] = [
    { label: 'Accueil', route: '/', icon: 'home' },
    { label: 'Compétences', route: '/competences', icon: 'workspace_premium' },
    { label: 'Projets', route: '/projets', icon: 'work' },
    { label: 'Blog', route: '/blog', icon: 'article' },
    { 
      label: 'Catégories', 
      route: '/categories', 
      icon: 'category',
      children: this.categories.map(cat => ({
        label: cat.name,
        route: cat.route,
        icon: cat.icon
      }))
    },
    { label: 'À propos', route: '/about', icon: 'info' },
    { label: 'Contact', route: '/contact', icon: 'contact_mail' }
  ];

  constructor() {
    this.categoriesSubject.next(this.categories);
  }

  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  getNavigationItems(): NavigationItem[] {
    return this.navigationItems;
  }

  getCategoryByType(type: CategoryType): Category | undefined {
    return this.categories.find(cat => cat.id === type);
  }

  getFeaturedCategories(): Category[] {
    return this.categories.filter(cat => cat.featured);
  }

  updateCategoryArticleCount(categoryId: CategoryType, count: number): void {
    const category = this.categories.find(cat => cat.id === categoryId);
    if (category) {
      category.articleCount = count;
      this.categoriesSubject.next([...this.categories]);
    }
  }
}
