import { Component, OnInit, ChangeDetectorRef, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ArticleService } from '../../shared/services/article';
import { NavigationService } from '../../shared/services/navigation';
import { SeoService } from '../../shared/services/seo';
import { sameAs } from '../../shared/site';
import { ArticleViewerComponent } from '../../shared/components/article-viewer/article-viewer';
import { Article } from '../../shared/models/article';
import { Category } from '../../shared/models/category';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, ArticleViewerComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  featuredArticles$: Observable<Article[]>;
  categories$: Observable<Category[]>;
  latestArticles$: Observable<Article[]>;
  selectedArticle: Article | null = null;

  constructor(
    private articleService: ArticleService,
    private navigationService: NavigationService,
    private seoService: SeoService
  ) {
    this.featuredArticles$ = this.articleService.getFeaturedArticles(3);
    this.categories$ = this.navigationService.getCategories();
    this.latestArticles$ = this.articleService.getLatestArticles(5);
  }

  ngOnInit(): void {
    // SEO marque personnelle pour la page d'accueil
    this.seoService.updateSEO({
      title: 'Geoffrey Aubert — Développeur Senior Java / Angular | CyberGarage',
      description: 'Portfolio et blog technique de Geoffrey Aubert, développeur senior Java/Angular en route vers Lead Dev & Architecte. Compétences, projets et articles : ma vitrine d\'ingénieur devenu artisan développeur.',
      keywords: [
        'Geoffrey Aubert', 'développeur senior', 'Java', 'Angular', 'lead developer',
        'architecte logiciel', 'portfolio développeur', 'System Design', 'IA', 'ByteByteGo'
      ],
      type: 'website',
      url: '/',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'CyberGarage — Geoffrey Aubert',
        description: 'Portfolio et blog technique de Geoffrey Aubert, développeur senior Java/Angular.',
        url: 'https://cybergarage.tech',
        author: {
          '@type': 'Person',
          name: 'Geoffrey Aubert',
          jobTitle: 'Développeur Senior Java / Angular',
          ...(sameAs().length ? { sameAs: sameAs() } : {})
        }
      }
    });
    
    // Charger le premier article featured par défaut
    this.featuredArticles$.subscribe(articles => {
      if (articles.length > 0) {
        this.selectedArticle = articles[0];
      }
    // markForCheck() est indispensable : l'application tourne SANS zone.js
    // (Angular 21, aucun polyfill déclaré dans angular.json), donc une
    // affectation de champ dans un callback asynchrone ne déclenche aucun
    // rendu. Sans cette ligne la vue reste vide en permanence.
      this.cdr.markForCheck();
    });
  }

  onArticleSelect(article: Article): void {
    this.selectedArticle = article;
  }

  getCategoryColor(category: Category): string {
    return category.color;
  }

  getCategoryIcon(category: Category): string {
    return category.icon;
  }
}
