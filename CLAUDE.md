# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm start` / `ng serve` — dev server at http://localhost:4200, auto-reload
- `ng build` — production build (output to `dist/cybergarage`), `ng build --watch --configuration development` for a watched dev build
- `ng test` — unit tests via Vitest (jsdom environment)
- `ng test --watch` is not configured by default; run a single spec by path: `ng test --include='**/seo.spec.ts'`
- `node dist/cybergarage/server/server.mjs` (`npm run serve:ssr:cybergarage`) — run the built SSR server
- `ng generate component path/to/name` — scaffold a new standalone component (project default style is scss; standalone components, no NgModule, per Angular 21 defaults)

There is no configured lint command (no `ng lint` / ESLint script present).

## Architecture

Angular 21 app (standalone components, SSR via `@angular/ssr`). Built with Angular Material + CDK. Markdown articles are rendered with `marked`, math with KaTeX, code highlighting with Prism — both loaded dynamically client-side in `article-viewer.ts` via `<script>`/CSS injection from CDN, not bundled.

### Routing and rendering modes
- Routes are defined in [src/app/app.routes.ts](src/app/app.routes.ts), all lazy-loaded (`loadComponent`/`loadChildren`).
- `src/app/app.routes.server.ts` controls SSR/prerender behavior per route. Currently everything prerenders except `article/:category/:id`, which is explicitly forced to `renderMode: 'ssr'` (per-request render, not prerender) because article content/IDs are dynamic.
- Most feature areas (`automobile`, `hpc`, `telecom`, `simulation`) are now plain standalone components loaded directly via `loadComponent`.
- Other feature areas (`dev-info`, `cybersecurity`, `fpga`, `mechanical`, `electronics`, `pragmatic`) still go through `loadChildren` into an `*-module.ts` + `*-routing-module.ts` pair. **These NgModules are vestigial** — e.g. `automobile-module.ts` contains the comment "Ce module n'est plus utilisé depuis la conversion en composant standalone." When converting one of these remaining modules to standalone, follow the pattern already used for `automobile`/`hpc`/etc.: switch `app.routes.ts` to `loadComponent` pointing at the component directly, then delete the module/routing-module files.

### Articles: two parallel, **not interchangeable** systems
There are two separate article models/services that look similar but are unrelated and not interoperable:
- [src/app/shared/services/article.ts](src/app/shared/services/article.ts) (`ArticleService`) + [src/app/shared/models/article.ts](src/app/shared/models/article.ts) (`Article`, `CategoryType` enum) — used by `ArticleViewerComponent` and `SitemapService`. Currently seeded with in-memory sample data (`loadSampleArticles`), not file-backed.
- [src/app/shared/services/articles.service.ts](src/app/shared/services/articles.service.ts) (`ArticlesService`) — loads real content at runtime via `HttpClient` from `/assets/articles/<category>/<slug>.md` (browser-only, guarded by `isPlatformBrowser`), parsing YAML-like frontmatter itself (hand-rolled parser, not a real YAML lib) into `ArticleLocal`. Has its own category catalog (`categoryConfig`/`articleCatalog`) separate from `CategoryType`.

Before changing "how articles work," check which of these two a given component actually consumes — don't assume changes to one propagate to the other.

### Article content as data
Real markdown articles live in `src/assets/articles/<category>/<slug>.md` with YAML frontmatter (`title`, `category`, `date`, `author`, `tags`, `summary`, `readTime`). `angular.json` has an explicit asset glob (`**/*.md` from `src/assets/articles` → `/assets/articles`) so these are copied into the build output and fetched at runtime rather than imported at build time. Adding a new article means: drop the `.md` file in the right category folder, and register its slug in the relevant catalog (`ArticlesService.articleCatalog`, and `ArticleService`'s sample data if that path is used too).

### Layout structure
`src/app/core/layout/{header,footer}` hold the persistent chrome; `src/app/shared/components/navigation` builds nav from `NavigationService` (`src/app/shared/services/navigation.ts`), which is the source of truth for category metadata used in nav (separate again from `ArticlesService.categoryConfig` and `CategoryType`).
