import { Injectable } from '@angular/core';
import { ArticleService } from './article';
import { NavigationService } from './navigation';
import { Observable, combineLatest, map } from 'rxjs';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

@Injectable({
  providedIn: 'root',
})
export class SitemapService {
  private baseUrl = 'https://cybergarage.tech';

  constructor(
    private articleService: ArticleService,
    private navigationService: NavigationService
  ) {}

  generateSitemap(): Observable<string> {
    return combineLatest([
      this.articleService.getArticles(),
      this.navigationService.getCategories()
    ]).pipe(
      map(([articles, categories]) => {
        const urls: SitemapUrl[] = [];

        // Page d'accueil
        urls.push({
          loc: this.baseUrl,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: 'daily',
          priority: 1.0
        });

        // Pages statiques
        urls.push(
          {
            loc: `${this.baseUrl}/about`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.7
          },
          {
            loc: `${this.baseUrl}/contact`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.6
          }
        );

        // Pages de catégories
        categories.forEach(category => {
          urls.push({
            loc: `${this.baseUrl}${category.route}`,
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: 0.8
          });
        });

        // Articles
        articles.forEach(article => {
          urls.push({
            loc: `${this.baseUrl}/article/${article.slug}`,
            lastmod: article.lastModified.toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: article.featured ? 0.9 : 0.7
          });
        });

        return this.generateXML(urls);
      })
    );
  }

  private generateXML(urls: SitemapUrl[]): string {
    const urlElements = urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl-delay pour être respectueux
Crawl-delay: 1

# Disallow des fichiers non pertinents pour le SEO
Disallow: /assets/temp/
Disallow: /api/internal/
Disallow: /*.json$
Disallow: /*.xml$ 
Disallow: /manifest.json
Disallow: /service-worker.js

# Allow des fichiers importants
Allow: /assets/images/
Allow: /assets/icons/`;
  }
}