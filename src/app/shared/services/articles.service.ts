import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject, map, catchError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Article, CategoryType } from '../models/article';

export interface ArticleMeta {
  title: string;
  category: string;
  date: string;
  author: string;
  tags: string[];
  summary: string;
  readTime: number;
  slug?: string;
}

export interface ArticleLocal extends ArticleMeta {
  id: string;
  content: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  route: string;
  articleCount: number;
  icon?: string;
  color?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticlesService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  public categories$ = this.categoriesSubject.asObservable();
  
  private articlesSubject = new BehaviorSubject<ArticleLocal[]>([]);
  public articles$ = this.articlesSubject.asObservable();

  // Configuration des catégories
  private readonly categoryConfig: Category[] = [
    {
      id: 'automobile',
      name: 'Automobile',
      description: 'Ingénierie automobile et véhicules électriques',
      route: '/automobile',
      articleCount: 0,
      icon: 'directions_car',
      color: '#FF6B35'
    },
    {
      id: 'cybersecurity',
      name: 'Cybersécurité',
      description: 'Sécurité informatique et protection des données',
      route: '/cybersecurity',
      articleCount: 0,
      icon: 'security',
      color: '#FF3E41'
    },
    {
      id: 'dev-info',
      name: 'Artisan Développeur',
      description: 'Craftsmanship logiciel, System Design, bonnes pratiques et soft skills du développeur',
      route: '/dev-info',
      articleCount: 0,
      icon: 'code',
      color: '#4ECDC4'
    },
    {
      id: 'ia-master',
      name: 'IA Master',
      description: 'Intelligence artificielle, LLM et IA générative appliquée',
      route: '/ia-master',
      articleCount: 0,
      icon: 'smart_toy',
      color: '#6C5CE7'
    },
    {
      id: 'electronics',
      name: 'Électronique',
      description: 'Conception électronique et systèmes embarqués',
      route: '/electronics',
      articleCount: 0,
      icon: 'memory',
      color: '#2ECC71'
    },
    {
      id: 'fpga',
      name: 'FPGA',
      description: 'Programmation FPGA et logique reconfigurable',
      route: '/fpga',
      articleCount: 0,
      icon: 'developer_board',
      color: '#9B59B6'
    },
    {
      id: 'mechanical',
      name: 'Mécanique',
      description: 'Ingénierie mécanique et simulation',
      route: '/mechanical',
      articleCount: 0,
      icon: 'precision_manufacturing',
      color: '#F39C12'
    },
    {
      id: 'pragmatic',
      name: 'Pragmatic Engineer',
      description: 'Solutions pratiques, retours d\'expérience et soft skills',
      route: '/pragmatic',
      articleCount: 0,
      icon: 'lightbulb',
      color: '#3498DB'
    },
    {
      id: 'hpc',
      name: 'HPC',
      description: 'Calcul haute performance et optimisation GPU',
      route: '/hpc',
      articleCount: 0,
      icon: 'speed',
      color: '#8E44AD'
    },
    {
      id: 'telecom',
      name: 'Télécom',
      description: 'Réseaux et télécommunications avancées',
      route: '/telecom',
      articleCount: 0,
      icon: 'signal_cellular_alt',
      color: '#E74C3C'
    },
    {
      id: 'simulation',
      name: 'Simulation',
      description: 'Modélisation et simulation numérique',
      route: '/simulation',
      articleCount: 0,
      icon: 'timeline',
      color: '#27AE60'
    }
  ];

  // Catalogue des articles disponibles
  private readonly articleCatalog: { [category: string]: string[] } = {
    automobile: ['freinage-regeneratif'],
    cybersecurity: ['zero-trust-architecture'],
    'dev-info': ['microservices-docker-kubernetes'],
    'ia-master': [],
    electronics: ['onduleurs-solaires'],
    fpga: ['traitement-video-temps-reel'],
    mechanical: [],
    pragmatic: [],
    hpc: ['optimisation-gpu'],
    telecom: ['reseaux-intelligents'],
    simulation: ['simulation-physique']
  };

  constructor() {
    this.initializeCategories();
    this.loadArticles();
  }

  private initializeCategories(): void {
    // Calcul du nombre d'articles par catégorie
    const categoriesWithCount = this.categoryConfig.map(category => ({
      ...category,
      articleCount: this.articleCatalog[category.id]?.length || 0
    }));
    
    this.categoriesSubject.next(categoriesWithCount);
  }

  private async loadArticles(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const articles: ArticleLocal[] = [];
    
    for (const [category, articleSlugs] of Object.entries(this.articleCatalog)) {
      for (const slug of articleSlugs) {
        try {
          const article = await this.loadArticleFromFile(category, slug);
          if (article) {
            articles.push(article);
          }
        } catch (error) {
          console.warn(`Failed to load article ${category}/${slug}:`, error);
        }
      }
    }
    
    this.articlesSubject.next(articles);
  }

  private async loadArticleFromFile(category: string, slug: string): Promise<ArticleLocal | null> {
    try {
      const filePath = `/assets/articles/${category}/${slug}.md`;
      const response = await this.http.get(filePath, { responseType: 'text' }).toPromise();
      
      if (response) {
        const parsed = this.parseMarkdownFile(response);
        return {
          id: slug, // Utiliser le slug comme ID
          ...parsed.meta,
          content: parsed.content,
          slug: slug
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error loading article ${category}/${slug}:`, error);
      return null;
    }
  }

  private parseMarkdownFile(content: string): { meta: ArticleMeta; content: string } {
    // Parse du front matter YAML
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      throw new Error('Invalid markdown file format');
    }
    
    const [, frontMatter, markdownContent] = match;
    const meta = this.parseFrontMatter(frontMatter);
    
    return {
      meta,
      content: markdownContent.trim()
    };
  }

  private parseFrontMatter(frontMatter: string): ArticleMeta {
    const lines = frontMatter.split('\n');
    const meta: any = {};
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value: any = line.substring(colonIndex + 1).trim();
        
        // Remove quotes
        value = value.replace(/^["']|["']$/g, '');
        
        // Parse arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = JSON.parse(value);
        }
        
        // Parse numbers only for specific fields that should be numbers
        if (key === 'readTime' && !isNaN(Number(value)) && value !== '') {
          value = Number(value);
        }
        
        meta[key] = value;
      }
    }
    
    return meta as ArticleMeta;
  }

  // API publique
  getCategories(): Observable<Category[]> {
    return this.categories$;
  }

  getArticles(): Observable<ArticleLocal[]> {
    return this.articles$;
  }

  getArticlesByCategory(categoryId: string): Observable<ArticleLocal[]> {
    return this.articles$.pipe(
      map(articles => articles.filter(article => article.category === categoryId))
    );
  }

  getArticleBySlug(slug: string): Observable<ArticleLocal | undefined> {
    return this.articles$.pipe(
      map(articles => articles.find(article => article.slug === slug))
    );
  }

  getCategoryById(categoryId: string): Observable<Category | undefined> {
    return this.categories$.pipe(
      map(categories => categories.find(category => category.id === categoryId))
    );
  }

  getFeaturedArticles(limit: number = 3): Observable<ArticleLocal[]> {
    return this.articles$.pipe(
      map(articles => {
        // Trier par date (plus récent en premier) et prendre les premiers
        return articles
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      })
    );
  }

  getLatestArticles(limit: number = 5): Observable<ArticleLocal[]> {
    return this.articles$.pipe(
      map(articles => {
        return articles
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, limit);
      })
    );
  }

  searchArticles(query: string): Observable<ArticleLocal[]> {
    if (!query.trim()) {
      return of([]);
    }
    
    const searchTerm = query.toLowerCase();
    
    return this.articles$.pipe(
      map(articles => {
        return articles.filter(article => 
          article.title.toLowerCase().includes(searchTerm) ||
          article.summary.toLowerCase().includes(searchTerm) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
          article.content.toLowerCase().includes(searchTerm)
        );
      })
    );
  }

  // Méthodes utilitaires
  getCategoryIcon(categoryId: string): string {
    const category = this.categoryConfig.find(c => c.id === categoryId);
    return category?.icon || 'article';
  }

  getCategoryColor(categoryId: string): string {
    const category = this.categoryConfig.find(c => c.id === categoryId);
    return category?.color || '#666';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categoryConfig.find(c => c.id === categoryId);
    return category?.name || categoryId;
  }
}