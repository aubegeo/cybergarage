import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ArticlesService, ArticleLocal } from '../../shared/services/articles.service';
import { NavigationService } from '../../shared/services/navigation';
import { SeoService } from '../../shared/services/seo';
import { Category } from '../../shared/models/category';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  private readonly cdr = inject(ChangeDetectorRef);
  // Source unique : mêmes catégories que la barre de navigation.
  categories: Category[] = [];

  featuredArticles: ArticleLocal[] = [];
  recentArticles: ArticleLocal[] = [];
  allArticles: ArticleLocal[] = [];
  isLoading = true;

  constructor(
    private articlesService: ArticlesService,
    private navigationService: NavigationService,
    private seoService: SeoService
  ) {}

  ngOnInit() {
    this.seoService.updateSEO({
      title: 'Blog technique — Geoffrey Aubert | CyberGarage',
      description: 'Articles techniques de Geoffrey Aubert : développement, IA, cybersécurité, architecture, électronique et plus. Le savoir derrière la vitrine, expliqué clairement.',
      keywords: ['blog technique', 'Geoffrey Aubert', 'développement', 'IA', 'cybersécurité', 'architecture', 'ByteByteGo'],
      type: 'website',
      url: '/blog'
    });

    this.navigationService.getCategories().subscribe(cats => {
      this.categories = cats;
      this.cdr.markForCheck();
    });

    this.articlesService.getArticles().subscribe(allArticles => {
      const sorted = [...allArticles].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      this.allArticles = sorted;
      this.featuredArticles = sorted.slice(0, 3);
      this.recentArticles = sorted.slice(0, 8);
      this.isLoading = false;
    // markForCheck() est indispensable : l'application tourne SANS zone.js
    // (Angular 21, aucun polyfill déclaré dans angular.json), donc une
    // affectation de champ dans un callback asynchrone ne déclenche aucun
    // rendu. Sans cette ligne la vue reste vide en permanence.
      this.cdr.markForCheck();
    });
  }

  getCategoryArticleCount(categoryId: string): number {
    // Compter sur TOUS les articles, pas sur recentArticles qui n'en garde que 8.
    // Avec l'ancienne version, toute catégorie absente du top 8 affichait « 0 article ».
    return this.allArticles.filter(article => article.category === categoryId).length;
  }

  getCategoryInfo(categoryId: string): Category {
    const found = this.categories.find(cat => cat.id === categoryId);
    if (found) {
      return found;
    }
    // Fallback neutre (catégories ayant des articles mais absentes de la nav, ex. hpc/telecom)
    return {
      id: categoryId as any,
      name: categoryId,
      description: '',
      icon: 'article',
      color: '#7f8c8d',
      route: `/${categoryId}`,
      featured: false,
      articleCount: 0,
    };
  }
}