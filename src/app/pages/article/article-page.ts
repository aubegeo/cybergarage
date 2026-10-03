import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArticleViewerComponent } from '../../shared/components/article-viewer/article-viewer';
import { ArticlesService, ArticleLocal } from '../../shared/services/articles.service';
import { SeoService } from '../../shared/services/seo';
import { Article, CategoryType } from '../../shared/models/article';

/**
 * Page d'un article, pour la route `article/:category/:id`.
 *
 * Pourquoi ce composant existe. La route chargeait directement
 * ArticleViewerComponent, qui est purement présentationnel et n'accepte qu'un
 * `@Input() article`. Utilisé comme composant de route, rien ne remplissait cet
 * input, de sorte que toute page d'article affichait « Aucun article
 * sélectionné ». Ce composant fait le travail manquant, lire les paramètres de
 * route, charger l'article depuis ArticlesService (les fichiers Markdown) puis
 * le passer au viewer.
 *
 * ArticlesService est la source de vérité, et non ArticleService qui ne portait
 * que trois articles d'exemple codés en mémoire. Les deux services coexistent et
 * ne sont pas interopérables, voir le CLAUDE.md du dépôt.
 */
@Component({
  selector: 'app-article-page',
  imports: [CommonModule, RouterLink, ArticleViewerComponent],
  template: `
    @if (article) {
      <app-article-viewer [article]="article" />
    } @else if (isLoading) {
      <div class="state">
        <p>Chargement de l'article…</p>
      </div>
    } @else {
      <div class="state">
        <h1>Article introuvable</h1>
        <p>
          Aucun article ne correspond à cette adresse. Il a peut-être été renommé
          depuis que le lien a été créé.
        </p>
        <a routerLink="/blog">Retour au blog</a>
      </div>
    }
  `,
  styles: [`
    .state {
      max-width: 48rem;
      margin: 4rem auto;
      padding: 0 1rem;
      text-align: center;
    }
    .state h1 { margin-bottom: 1rem; }
    .state a { text-decoration: underline; }
  `],
})
export class ArticlePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly articlesService = inject(ArticlesService);
  private readonly seo = inject(SeoService);
  private readonly cdr = inject(ChangeDetectorRef);

  article: Article | null = null;
  isLoading = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('id');
      const category = params.get('category') ?? '';
      if (!slug) {
        this.isLoading = false;
        this.cdr.markForCheck();
        return;
      }

      this.articlesService.getArticleBySlug(slug).subscribe(found => {
        this.article = found ? this.toArticle(found, category) : null;
        this.isLoading = false;
        if (this.article) {
          this.seo.updateArticleSEO(this.article, `/article/${category}/${slug}`);
        }
        // Obligatoire : l'application tourne sans zone.js (Angular 21, aucun
        // polyfill déclaré), donc une affectation dans un callback asynchrone ne
        // provoque aucun rendu par elle-même.
        this.cdr.markForCheck();
      });
    });
  }

  /**
   * ArticlesService renvoie un ArticleLocal (frontmatter Markdown), le viewer
   * attend un Article. La conversion est explicite pour que la divergence entre
   * les deux modèles reste visible plutôt que masquée par un cast.
   *
   * `category` est converti sans validation parce que CategoryType ne déclare
   * que huit catégories alors que le site en publie onze (hpc, telecom et
   * simulation manquent à l'énumération). Le viewer ne s'en sert que pour
   * l'affichage, donc la valeur brute suffit.
   */
  private toArticle(local: ArticleLocal, routeCategory: string): Article {
    const published = new Date(local.date);
    return {
      id: local.id,
      title: local.title,
      slug: local.slug ?? local.id,
      summary: local.summary,
      content: local.content,
      author: local.author,
      publishedDate: published,
      lastModified: published,
      category: (local.category || routeCategory) as CategoryType,
      tags: local.tags ?? [],
      readTimeMinutes: local.readTime,
      featured: false,
      seoMetadata: {
        description: local.summary,
        keywords: local.tags ?? [],
      },
    };
  }
}
