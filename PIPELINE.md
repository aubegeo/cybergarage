# Pipeline de contenu CyberGarage — guide

Tout ce qu'il faut savoir pour produire et publier des articles de blog, à la main ou en
automatique. Le principe directeur : **chaque article est ancré sur une source officielle**
(vérifiable), dans l'esprit du projet *allgamerules*.

---

## 1. Vue d'ensemble

```
content-sources/<categorie>.md   →  catalogues de sources officielles (tu les enrichis)
        │
        ▼
skill article-source-officielle  →  écrit un article ancré sur une source
        │                            (ou skill youtube-to-article depuis une vidéo)
        ▼
src/assets/articles/<cat>/<slug>.md   +   content-catalog.ts (enregistre le slug)
        │
        ▼
PR GitHub  →  tu relis, tu merges  →  blog + /sitemap.xml à jour automatiquement
```

La **routine quotidienne** (19h) exécute ce flux toute seule et ouvre une PR.

---

## 2. Ajouter une source au catalogue

Les sources vivent dans `content-sources/<categorie>.md` (un fichier par catégorie).

**Via le skill (langage naturel) :**
> « ajoute cette source : https://… » — ou « ajoute ça aux sources de cybersecurity ».

**Via le script (terminal) :**
```bash
python3 .claude/skills/ajouter-source/scripts/add_source.py <categorie> "<sujet>" "<url>" [libre|payant]
```
Exemple :
```bash
python3 .claude/skills/ajouter-source/scripts/add_source.py dev-info "Java Records (JEP 395)" "https://openjdk.org/jeps/395" libre
```
Le script **déduplique** par URL, **valide la catégorie**, et refuse une URL malformée.
`libre` par défaut si le 4ᵉ argument est omis.

**À la main :** ouvre le fichier et colle une ligne au format :
```
- Sujet de l'article — https://url-officielle `[libre]`
```

Catégories valides : `automobile`, `dev-info`, `ia-master`, `cybersecurity`, `fpga`,
`mechanical`, `electronics`, `pragmatic`, `hpc`, `telecom`, `simulation`.

---

## 3. Écrire un article

### a) Depuis une source officielle
Skill **`article-source-officielle`** — dis : « écris un article sourcé sur <sujet> »
ou « prends une source du catalogue dev-info et fais un article ».
Il pioche dans `content-sources/`, récupère la source, rédige un article FR (~800-1500 mots)
avec citations attribuées + section `## Sources`, l'enregistre et vérifie le build.

### b) Depuis une vidéo YouTube
Skill **`youtube-to-article`** — dis : « fais un article à partir de cette vidéo : <url> ».
Il récupère la transcription (`yt-dlp`), la réécrit en article original, crédite la source.

Dans les deux cas, la **catégorie est choisie automatiquement** (le domaine prime sur l'angle ;
ex. embarqué → `fpga`).

---

## 4. Publier

1. Un article = un fichier `src/assets/articles/<categorie>/<slug>.md` avec frontmatter :
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
   (`tags` = tableau JSON sur une ligne ; `readTime` = nombre.)
2. Enregistrer le slug dans `src/app/shared/content-catalog.ts` (`ARTICLE_CATALOG`).
   → **source unique** : le blog ET `/sitemap.xml` se mettent à jour tout seuls.
3. `npx ng build --configuration development` doit passer.
4. Ouvrir une PR (`gh pr create`) → relecture → merge.

---

## 5. La routine automatique

- **Nom :** `article-quotidien-source-officielle` — **tous les jours à 19h00**.
- Elle choisit une catégorie sous-représentée, pioche une source `[libre]` non `[fait]` dans
  `content-sources/`, écrit l'article, vérifie le build, et **ouvre une PR** (ne merge jamais).
- Elle tourne quand l'app Claude est ouverte (sinon au prochain lancement).
- Gérable depuis la section « Scheduled » de la barre latérale (pause / Run now / éditer).

---

## 6. Aide-mémoire des commandes

| Action | Commande |
|---|---|
| Ajouter une source | `python3 .claude/skills/ajouter-source/scripts/add_source.py <cat> "<sujet>" "<url>" [libre\|payant]` |
| Récupérer une transcription YouTube | `python3 .claude/skills/youtube-to-article/scripts/get_transcript.py "<url>"` |
| Build de vérification | `npx ng build --configuration development` |
| Lancer le serveur SSR | `node dist/cybergarage/server/server.mjs` |
| Vérifier le sitemap | `curl -s localhost:4000/sitemap.xml` |

---

## 7. Où se trouve quoi

| Élément | Emplacement |
|---|---|
| Catalogues de sources | `content-sources/<categorie>.md` (+ `README.md`) |
| Articles (Markdown) | `src/assets/articles/<categorie>/<slug>.md` |
| Enregistrement des slugs | `src/app/shared/content-catalog.ts` |
| Skills | `.claude/skills/{article-source-officielle,youtube-to-article,ajouter-source}/` |
| Sitemap (généré) | route Express `/sitemap.xml` dans `src/server.ts` |
