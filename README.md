# CyberGarage

Blog technique d'ingénierie, écrit par **Geoffrey Aubert**, développeur senior Java/Angular.
Chaque article part d'une **source officielle** (spécification, RFC, JEP, norme, documentation
éditeur) et s'en tient à ce que cette source affirme réellement.

Onze domaines sont couverts : automobile, développement, IA, cybersécurité, FPGA et embarqué,
mécanique, électronique, pratiques d'ingénierie, calcul haute performance, télécommunications
et simulation.

## Principe éditorial

Un article ne vaut que par sa vérifiabilité. Trois règles s'appliquent sans exception.

Rien n'est affirmé qui ne figure dans la source citée. Quand un chiffre circule sous une forme
déformée, l'article le rectifie en renvoyant au document d'origine. Et les sources sont listées
en fin d'article, la plus importante en premier, avec la version ou le statut du document quand
c'est pertinent.

## Pile technique

| Élément | Choix |
|---|---|
| Framework | Angular 21, composants standalone, aucun NgModule |
| Rendu | Prérendu statique complet via `@angular/ssr` |
| Détection de changement | Mode **zoneless**, sans `zone.js` |
| Interface | Angular Material et CDK |
| Contenu | Fichiers Markdown avec frontmatter YAML |
| Rendu Markdown | `marked`, formules avec KaTeX, code avec Prism |

Le site est **entièrement prérendu**, les 32 routes étant générées à la compilation. Un robot
d'indexation reçoit donc du HTML complet, texte des articles inclus, sans dépendre d'un serveur
qui tourne.

## Démarrer

```bash
npm install
npm start          # serveur de développement sur http://localhost:4200
```

## Vérifier

```bash
ng build           # build de production, doit sortir en 0
ng test            # tests unitaires via Vitest
```

Pour un build destiné à un sous-chemin, par exemple GitHub Pages :

```bash
ng build --base-href /cybergarage/
```

## Ajouter un article

Le contenu est de la donnée, pas du code.

1. Déposer le fichier dans `src/assets/articles/<catégorie>/<slug>.md`, avec le frontmatter
   attendu : `title`, `category`, `date`, `author`, `tags`, `summary`, `readTime`.
2. Enregistrer le slug dans `ARTICLE_CATALOG` de
   [`src/app/shared/content-catalog.ts`](src/app/shared/content-catalog.ts).

Ce catalogue est la source unique : il alimente l'affichage, le sitemap et la liste des routes
à prérendre. Un article absent du catalogue n'est ni rendu ni référencé.

## Structure

```
src/
├── app/
│   ├── pages/            écrans (accueil, blog, article, pages vitrine)
│   ├── features/         pages de catégorie
│   ├── shared/
│   │   ├── content-catalog.ts    source unique des articles publiés
│   │   └── services/             chargement des articles, SEO, sitemap
│   ├── app.routes.ts             routage applicatif
│   └── app.routes.server.ts      mode de rendu par route (tout en prérendu)
├── assets/articles/      les articles, un dossier par catégorie
└── content-sources/      catalogue des sources officielles par catégorie
```

## Licence

[MIT](LICENSE). Le code est réutilisable librement. Les articles restent la propriété de leur
auteur.
