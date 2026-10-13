#!/usr/bin/env node
/**
 * Génère src/app/shared/content-catalog.ts depuis le contenu de src/assets/articles/.
 *
 * Pourquoi ce script existe. Jusqu'au 2026-10-13, ARTICLE_CATALOG était maintenu
 * à la main. Comme chaque article ajoute une ligne au même tableau, deux articles
 * préparés en parallèle entraient fatalement en conflit : les 29 PR ouvertes
 * depuis juillet étaient TOUTES en conflit, et il a fallu les regrouper à la main
 * sur une seule branche (commit ba2586e) avant de les fermer. Ce script supprime
 * la cause plutôt que de traiter les conflits un par un.
 *
 * Ce qui est généré et ce qui ne l'est pas :
 *  - ARTICLE_CATALOG est entièrement dérivé du système de fichiers ;
 *  - STATIC_PAGES et CATEGORY_SLUGS restent déclarés ici, car ce sont des choix
 *    de structure du site, pas du contenu. Ils sont en revanche VÉRIFIÉS contre
 *    le disque : un dossier d'articles non déclaré, ou une catégorie déclarée
 *    sans dossier, fait échouer la génération. C'est ce contrôle croisé qui
 *    manquait, et que le regroupement avait dû refaire à la main.
 *
 * Ordre des articles. Date décroissante, l'article le plus récent en premier.
 * Deux raisons : getArticles() et getArticlesByCategory() ne trient pas et
 * rendent l'ordre du catalogue, si bien que le blog listait les articles dans
 * l'ordre des numéros de PR — un article de 2024 arrivait avant un de 2026 ;
 * et un ordre dérivé de la date est reproductible, donc le fichier généré est
 * stable d'une exécution à l'autre.
 *
 * Usage :
 *   node tools/generate-content-catalog.mjs           écrit le fichier
 *   node tools/generate-content-catalog.mjs --check   échoue si le fichier
 *                                                     n'est pas à jour (CI)
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = join(dirname(fileURLToPath(import.meta.url)), '..');
const DOSSIER_ARTICLES = join(RACINE, 'src', 'assets', 'articles');
const CIBLE = join(RACINE, 'src', 'app', 'shared', 'content-catalog.ts');
const CHECK = process.argv.includes('--check');

/** Pages « vitrine » statiques. Structure du site, pas du contenu. */
const STATIC_PAGES = ['', 'competences', 'projets', 'about', 'contact', 'blog'];

/** Catégories possédant une page dédiée. L'ordre est éditorial, il est conservé. */
const CATEGORY_SLUGS = [
  'automobile', 'dev-info', 'ia-master', 'cybersecurity', 'fpga',
  'mechanical', 'electronics', 'pragmatic', 'hpc', 'telecom', 'simulation',
];

const erreurs = [];

function dossiers() {
  return readdirSync(DOSSIER_ARTICLES).filter(n => {
    try { return statSync(join(DOSSIER_ARTICLES, n)).isDirectory(); } catch { return false; }
  });
}

/** La date du frontmatter. Absente, c'est une erreur : l'ordre en dépend. */
function dateDe(categorie, fichier) {
  const chemin = join(DOSSIER_ARTICLES, categorie, fichier);
  const texte = readFileSync(chemin, 'utf-8');
  const m = texte.match(/^date:\s*"?([0-9]{4}-[0-9]{2}-[0-9]{2})"?/m);
  if (!m) {
    erreurs.push(`${categorie}/${fichier} : champ « date: AAAA-MM-JJ » absent du frontmatter`);
    return null;
  }
  return m[1];
}

// --- Contrôle croisé disque / déclaration ------------------------------------
const surDisque = dossiers();
for (const d of surDisque) {
  if (!CATEGORY_SLUGS.includes(d)) {
    erreurs.push(`dossier « ${d} » présent sur le disque mais absent de CATEGORY_SLUGS`);
  }
}
for (const c of CATEGORY_SLUGS) {
  if (!surDisque.includes(c)) {
    erreurs.push(`catégorie « ${c} » déclarée mais sans dossier src/assets/articles/${c}/`);
  }
}

// --- Construction du catalogue ------------------------------------------------
const catalogue = {};
let total = 0;
for (const categorie of CATEGORY_SLUGS) {
  if (!surDisque.includes(categorie)) continue;
  const fichiers = readdirSync(join(DOSSIER_ARTICLES, categorie)).filter(f => f.endsWith('.md'));
  const avecDate = fichiers
    .map(f => ({ slug: f.replace(/\.md$/, ''), date: dateDe(categorie, f) }))
    .filter(a => a.date !== null)
    // Date décroissante, puis slug pour que deux articles du même jour soient
    // ordonnés de façon stable d'une exécution à l'autre.
    .sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : b.date.localeCompare(a.date)));
  if (avecDate.length === 0) {
    erreurs.push(`catégorie « ${categorie} » : aucun article .md exploitable`);
    continue;
  }
  catalogue[categorie] = avecDate.map(a => a.slug);
  total += avecDate.length;
}

if (erreurs.length > 0) {
  console.error('❌ Génération du catalogue refusée :');
  for (const e of erreurs) console.error(`   - ${e}`);
  process.exit(1);
}

// --- Rendu --------------------------------------------------------------------
const cle = c => (/^[a-z][a-z0-9]*$/.test(c) ? c : `'${c}'`);
const contenu = `/**
 * FICHIER GÉNÉRÉ — NE PAS MODIFIER À LA MAIN.
 *
 * Produit par tools/generate-content-catalog.mjs depuis src/assets/articles/.
 * Pour publier un article : déposer le .md dans la bonne catégorie avec un champ
 * « date: AAAA-MM-JJ » dans son frontmatter. Le catalogue, le blog et le sitemap
 * suivent automatiquement.
 *
 * Régénérer :  node tools/generate-content-catalog.mjs
 * Vérifier  :  node tools/generate-content-catalog.mjs --check
 *
 * Source unique du contenu du site, utilisable côté navigateur ET côté serveur
 * (aucune dépendance Angular) : chargement des articles (ArticlesService),
 * routes de prérendu (app.routes.server.ts) et sitemap (src/server.ts).
 */

/** Pages "vitrine" statiques (chemins relatifs à la racine). */
export const STATIC_PAGES: string[] = [${STATIC_PAGES.map(p => `'${p}'`).join(', ')}];

/** Catégories possédant une page dédiée (route /<slug>). */
export const CATEGORY_SLUGS: string[] = [
${CATEGORY_SLUGS.map(c => `  '${c}',`).join('\n')}
];

/** Catalogue des articles publiés : catégorie -> slugs, du plus récent au plus ancien. */
export const ARTICLE_CATALOG: Record<string, string[]> = {
${Object.entries(catalogue).map(([c, slugs]) =>
  `  ${cle(c)}: [\n${slugs.map(s => `    '${s}',`).join('\n')}\n  ],`).join('\n')}
};
`;

if (CHECK) {
  const actuel = readFileSync(CIBLE, 'utf-8');
  if (actuel !== contenu) {
    console.error('❌ content-catalog.ts n\'est pas à jour. Lancer : node tools/generate-content-catalog.mjs');
    process.exit(1);
  }
  console.log(`✅ content-catalog.ts à jour — ${total} articles dans ${Object.keys(catalogue).length} catégories.`);
} else {
  writeFileSync(CIBLE, contenu, 'utf-8');
  console.log(`✅ content-catalog.ts généré — ${total} articles dans ${Object.keys(catalogue).length} catégories.`);
}
