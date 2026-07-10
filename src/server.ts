import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { SITE } from './app/shared/site';
import { STATIC_PAGES, CATEGORY_SLUGS, ARTICLE_CATALOG } from './app/shared/content-catalog';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Sitemap généré dynamiquement à partir de la source unique de contenu
 * (src/app/shared/content-catalog.ts). Ajouter un article au catalogue suffit
 * à le faire apparaître ici — aucune édition manuelle de XML.
 */
function buildSitemap(): string {
  const base = SITE.baseUrl.replace(/\/$/, '');
  const today = new Date().toISOString().split('T')[0];

  const entries: { loc: string; priority: number; changefreq: string }[] = [];
  const add = (path: string, priority: number, changefreq: string) =>
    entries.push({ loc: `${base}${path}`, priority, changefreq });

  for (const page of STATIC_PAGES) {
    add(page === '' ? '/' : `/${page}`, page === '' ? 1.0 : 0.8, 'weekly');
  }
  for (const cat of CATEGORY_SLUGS) {
    add(`/${cat}`, 0.6, 'monthly');
  }
  for (const [cat, slugs] of Object.entries(ARTICLE_CATALOG)) {
    for (const slug of slugs) {
      add(`/article/${cat}/${slug}`, 0.5, 'yearly');
    }
  }

  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${e.loc}</loc><lastmod>${today}</lastmod>` +
        `<changefreq>${e.changefreq}</changefreq><priority>${e.priority.toFixed(1)}</priority></url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

app.get('/sitemap.xml', (_req, res) => {
  res.type('application/xml').send(buildSitemap());
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
