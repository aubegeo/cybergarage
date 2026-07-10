---
name: article-source-officielle
description: Rédige un article de blog CyberGarage rigoureusement ancré sur une (ou plusieurs) source(s) officielle(s) — documentation officielle, spécification, RFC, JEP, standard, norme. Chaque affirmation technique doit être appuyée par la source, et l'article se termine par une section « Sources » citant les URLs officielles. Utilise ce skill quand l'utilisateur veut « un article sourcé », « ancré sur la source officielle », « à la manière d'allgamerules », ou fournit un sujet/une doc officielle à transformer en article. Ne jamais inventer de faits non présents dans la source.
---

# Article ancré sur source officielle (façon *allgamerules*)

Objectif : produire des articles **fiables et vérifiables**, où chaque point technique est
adossé à une **source officielle** (et non à des souvenirs ou à des blogs tiers). C'est un pilier
de crédibilité pour la vitrine de Geoffrey (cible recruteurs / clients).

## Principe directeur
**Zéro affirmation non sourcée.** Si la source officielle ne le dit pas, on ne l'écrit pas —
ou on le signale explicitement comme un ajout de contexte/opinion. En cas de doute sur un détail
(valeur par défaut, mode d'un algo…), rester général plutôt que d'inventer une précision fausse.

## Qu'est-ce qu'une « source officielle » ?
La documentation de l'éditeur/du projet, pas un article tiers. Exemples :
- Java : `openjdk.org/jeps/*`, `docs.oracle.com`, doc Spring officielle.
- Angular : `angular.dev`. Web : `developer.mozilla.org` (MDN), specs W3C/WHATWG.
- Conteneurs/cloud : `docs.docker.com`, `kubernetes.io/docs`.
- Sécurité : `owasp.org`, publications `nist.gov`, RFC (`rfc-editor.org`).
- IA : doc officielle de l'éditeur du modèle (ex. `docs.anthropic.com`), specs (ex. MCP).
- Réseaux/embarqué : RFC, doc constructeur, normes citées nommément.

## Étape 0 — Piocher un sujet + une source
Consulter d'abord le catalogue **`content-sources/<categorie>.md`** (un fichier par catégorie ;
voir `content-sources/README.md`) : ce sont les sources officielles que l'utilisateur enrichit.
Choisir de préférence une entrée `[libre]` non encore marquée `[fait]`, dans une catégorie
sous-représentée (cf. `src/app/shared/content-catalog.ts`). Vérifier que le slug n'existe pas
déjà dans le catalogue. Si l'utilisateur a imposé un sujet, l'utiliser. Après publication, cocher
l'entrée `[fait]` dans le fichier `content-sources/<categorie>.md` correspondant.

## Étape 1 — Récupérer la source
Essayer d'abord l'outil `WebFetch`. Si le site renvoie **403** (fréquent, ex. openjdk.org),
récupérer via curl avec un user-agent navigateur, puis extraire le texte :

```bash
curl -sL -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36" "<URL_OFFICIELLE>" -o /tmp/src.html -w "HTTP %{http_code}\n"
python3 -c "import re;h=open('/tmp/src.html',encoding='utf-8',errors='ignore').read();h=re.sub(r'<script.*?</script>','',h,flags=re.S);h=re.sub(r'<style.*?</style>','',h,flags=re.S);t=re.sub(r'<[^>]+>',' ',h);import sys;print(re.sub(r'\s+',' ',t)[:6000])"
```

Lire attentivement, repérer les formulations officielles importantes (à citer entre guillemets).

## Étape 2 — Rédiger l'article
- **Titre** clair et accrocheur. **Introduction** : le problème / pourquoi le sujet compte.
- **Corps** : 3–6 sections `##`, exemples de code exacts (tirés/déduits de la doc officielle),
  citations courtes des formulations clés (« … ») attribuées à la source.
- **Ton** : pédagogique, direct, en français, esprit ByteByteGo. Auteur : **Geoffrey Aubert**.
- **Honnêteté** : distinguer ce qui vient de la source des ajouts de contexte/opinion.
- **Longueur** : 800–1500 mots.
- **Section finale `## Sources`** : lister les URLs officielles, la plus importante en premier,
  avec le statut/version quand c'est pertinent (ex. « JEP 444, statut Closed/Delivered, JDK 21 »).
  Mettre aussi des **liens inline** vers la source aux endroits clés du texte.

## Étape 3 — Choisir la catégorie (automatique)
Même mapping que le skill `youtube-to-article` (le domaine prime sur l'angle) :
`automobile`, `dev-info` (Artisan Développeur), `ia-master`, `cybersecurity`,
`fpga` (FPGA & Embarqué), `mechanical`, `electronics`, `pragmatic`, `hpc`, `telecom`, `simulation`.
Annoncer la catégorie retenue ; ne demander que si réellement ambigu.

## Étape 4 — Écrire le fichier
`src/assets/articles/<categorie>/<slug>.md`, slug en kebab-case sans accents.
Frontmatter strict (parser dans `articles.service.ts`) :

```markdown
---
title: "Titre"
category: <categorie>
date: AAAA-MM-JJ
author: Geoffrey Aubert
tags: ["tag1", "tag2"]
summary: "Résumé 1–2 phrases."
readTime: 8
---
```
- `tags` : tableau JSON sur une ligne (guillemets doubles, lu via `JSON.parse`).
- `readTime` : nombre (≈200 mots/min). `date` : `AAAA-MM-JJ`.

## Étape 5 — Enregistrer dans le catalogue
Ajouter le slug dans `src/app/shared/content-catalog.ts` → `ARTICLE_CATALOG` (bonne catégorie).
Source unique : le blog ET le `/sitemap.xml` se mettent à jour automatiquement.

## Étape 6 — Vérifier
```bash
npx ng build --configuration development
```
Le build doit passer. Annoncer le chemin du fichier et l'URL (`/article/<categorie>/<slug>`),
rappeler à l'utilisateur de relire, et lister les sources officielles utilisées.

## Garde-fous
- **Vérifiabilité avant tout** : ne jamais présenter comme officiel un fait absent de la source.
- Citer **la source primaire** (l'éditeur), pas un intermédiaire.
- Si la source est payante/inaccessible, le dire et proposer une alternative officielle.
