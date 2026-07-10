---
name: youtube-to-article
description: Transforme une vidéo YouTube en article de blog pour CyberGarage. Utilise ce skill quand l'utilisateur fournit une URL YouTube et veut en faire un article : récupère la transcription, la retravaille en un article original et structuré en français, écrit le fichier Markdown dans la bonne catégorie et l'enregistre dans le catalogue. Déclencheurs : « fais un article à partir de cette vidéo », « transforme cette vidéo YouTube en article », une URL youtube.com/youtu.be accompagnée d'une intention de publication sur le blog.
---

# YouTube → Article de blog CyberGarage

Transforme une vidéo YouTube intéressante en un **article original** publié sur le blog.
Le but n'est PAS de recopier la transcription, mais de s'en servir comme matière première
pour produire un contenu **retravaillé, structuré et qui apporte de la valeur**, dans l'esprit
pédagogique de CyberGarage (vulgarisation claire, façon ByteByteGo).

## Prérequis
- `yt-dlp` et `python3` installés (déjà présents sur cette machine).

## Classification automatique de la catégorie
Le skill choisit **tout seul** la catégorie, à partir du titre + de la transcription. Mapping :

| Sujet de la vidéo | Catégorie (`slug`) |
|---|---|
| Voiture, VE, moteur, mobilité | `automobile` |
| Code, craft, clean code, System Design, microservices, langages | `dev-info` |
| IA, LLM, machine learning, prompt, RAG, agents | `ia-master` |
| Sécurité, hacking, cryptographie, pentest | `cybersecurity` |
| FPGA, VHDL/Verilog, systèmes embarqués, microcontrôleurs, bare-metal, RTOS | `fpga` (catégorie « FPGA & Embarqué ») |
| Mécanique, CAO, matériaux, thermodynamique | `mechanical` |
| Électronique, circuits, PCB, composants | `electronics` |
| Méthodo, leadership, bonnes pratiques, soft skills, gestion de projet | `pragmatic` |
| Calcul haute perf, GPU, parallélisme | `hpc` |
| Réseaux, 5G/6G, IoT, télécoms | `telecom` |
| Modélisation, simulation numérique, physique | `simulation` |

Règles :
1. Choisir la catégorie **la plus spécifique** qui colle au sujet principal. Le **domaine**
   prime sur l'angle : une vidéo ancrée dans le monde de l'embarqué/hardware va dans `fpga`
   même si elle parle de bonnes pratiques ou de mindset (ne pas la mettre dans `pragmatic`).
2. **Annoncer** la catégorie retenue à l'utilisateur (une phrase), sans bloquer.
3. Ne demander confirmation **que si** c'est réellement ambigu (2 catégories aussi plausibles)
   ou si l'utilisateur a imposé une catégorie.

## Étape 1 — Récupérer la transcription

```bash
python3 .claude/skills/youtube-to-article/scripts/get_transcript.py "<URL_YOUTUBE>"
```

Le script renvoie un JSON (titre, chaîne, date, durée, `transcript_file`, `word_count`).
Lire le fichier `transcript_file` pour obtenir le texte brut.

- Si `word_count` est 0 ou très faible : la vidéo n'a pas de sous-titres exploitables.
  Le signaler à l'utilisateur et lui proposer de coller la transcription manuellement.

## Étape 2 — Retravailler en article (le cœur du travail)

À partir de la transcription, **rédiger un article original en français**. Ne jamais coller
la transcription telle quelle. Appliquer ces règles :

1. **Réécriture intégrale** : reformuler, structurer, condenser. Une transcription orale est
   répétitive et décousue ; l'article doit être dense et lisible.
2. **Structure** : titre accrocheur, introduction (le problème / pourquoi c'est intéressant),
   2 à 5 sections avec sous-titres `##`, une conclusion. Listes, exemples de code, analogies
   quand c'est pertinent.
3. **Valeur ajoutée** : ajouter du contexte, des précisions, des liens logiques que la vidéo
   sous-entend. Corriger les imprécisions éventuelles.
4. **Honnêteté & attribution** : terminer par une section *« Source »* qui crédite la vidéo
   et la chaîne avec le lien. Ne pas présenter le contenu comme une retranscription officielle.
5. **Ton** : pédagogique, direct, en français, à la première personne du blog quand c'est naturel.
6. **Longueur cible** : 800–1500 mots selon la richesse de la source.

## Étape 3 — Écrire le fichier Markdown

Créer le fichier dans la bonne catégorie :
`src/assets/articles/<categorie>/<slug>.md`

- `<slug>` : titre en kebab-case, sans accents (ex. `optimiser-une-jvm-en-production`).
- Frontmatter **exactement** dans ce format (le parser maison est strict — voir notes) :

```markdown
---
title: "Titre de l'article"
category: <categorie>
date: AAAA-MM-JJ
author: Geoffrey Aubert
tags: ["tag1", "tag2", "tag3"]
summary: "Résumé en une à deux phrases."
readTime: 7
---

# Titre de l'article

Le corps de l'article en Markdown...

## Source
Article inspiré de la vidéo « <titre vidéo> » de <chaîne> — <URL>.
```

Notes sur le frontmatter (parser dans `src/app/shared/services/articles.service.ts`) :
- `tags` doit être un tableau **JSON sur une seule ligne** avec des guillemets doubles
  (il est lu via `JSON.parse`).
- `readTime` est un **nombre** (minutes de lecture estimées : ~200 mots/min).
- `date` au format `AAAA-MM-JJ`. Utiliser la date du jour pour la publication.

## Étape 4 — Enregistrer l'article dans le catalogue

Sans cette étape, l'article ne s'affiche pas. Ajouter le `<slug>` dans
`src/app/shared/content-catalog.ts`, dans `ARTICLE_CATALOG`, sous la bonne catégorie :

```ts
'dev-info': ['microservices-docker-kubernetes', 'mon-nouveau-slug'],
```

C'est la **source unique** : le blog ET le sitemap (`/sitemap.xml`, généré dynamiquement par
`src/server.ts`) seront à jour automatiquement. Aucune édition de XML à faire.

## Étape 5 — Vérifier

```bash
npx ng build --configuration development
```

Le build doit passer sans erreur. Annoncer à l'utilisateur le chemin du fichier créé et l'URL
de l'article (`/article/<categorie>/<slug>`), et lui rappeler de relire/valider le contenu.
Le sitemap se met à jour tout seul (route serveur), rien d'autre à faire pour le SEO.

## Catégories disponibles
`automobile`, `dev-info` (Artisan Développeur), `ia-master` (IA Master), `cybersecurity`,
`fpga`, `mechanical`, `electronics`, `pragmatic` (Pragmatic Engineer), `hpc`, `telecom`,
`simulation`.

## Garde-fous
- Toujours **créditer la source**. C'est une réécriture inspirée, pas du plagiat.
- Si la vidéo est de faible qualité, factuellement douteuse ou hors sujet pour le blog,
  le dire à l'utilisateur plutôt que de produire un article médiocre.
- Faire **relire** l'article par l'utilisateur avant toute idée de publication.
