---
name: ajouter-source
description: Ajoute une ou plusieurs sources officielles au catalogue du blog CyberGarage (fichiers content-sources/<categorie>.md), dans lesquels la routine et le skill article-source-officielle piochent leurs sujets. Utilise ce skill quand l'utilisateur veut « ajouter une source », « mettre cette doc/URL dans le catalogue », colle une ou plusieurs URLs officielles à référencer, ou dit « ajoute ça aux sources de <catégorie> ». Déduplique et range dans la bonne catégorie.
---

# Ajouter une source au catalogue

Les catalogues vivent dans `content-sources/<categorie>.md` (un fichier par catégorie, voir
`content-sources/README.md`). Ce skill y ajoute proprement une source officielle.

## Catégories valides
`automobile`, `dev-info`, `ia-master`, `cybersecurity`, `fpga`, `mechanical`, `electronics`,
`pragmatic`, `hpc`, `telecom`, `simulation`.

## Étapes
1. **Récupérer les infos** depuis la demande de l'utilisateur : l'URL (obligatoire), un intitulé
   de sujet, la catégorie, et si la source est `libre` ou `payant`.
2. **Compléter ce qui manque, sans bloquer** :
   - *Catégorie* non précisée → la déduire du sujet/de l'URL (même logique de domaine que le skill
     `article-source-officielle`) et l'annoncer.
   - *Sujet* non fourni → proposer un intitulé court et clair à partir du titre de la page
     (au besoin, récupérer le titre via WebFetch ou `curl`).
   - *Accès* non précisé → `libre` par défaut (mettre `payant` si c'est une norme ISO/IEC/ASME/SAE…).
3. **Vérifier que c'est bien une source officielle** (éditeur/organisme primaire). Sinon, prévenir
   l'utilisateur et demander confirmation.
4. **Ajouter la ligne** via le script (il déduplique par URL et valide la catégorie) :
   ```bash
   python3 .claude/skills/ajouter-source/scripts/add_source.py <categorie> "<sujet>" "<url>" [libre|payant]
   ```
   Pour plusieurs sources, appeler le script une fois par source.
5. **Confirmer** à l'utilisateur ce qui a été ajouté et dans quel fichier.

## Notes
- Ne pas ajouter de doublon : le script s'en charge (il détecte l'URL déjà présente).
- Ne pas marquer `[fait]` ici — ce marqueur est posé par le pipeline de publication une fois
  l'article écrit.
- Commit optionnel : si l'utilisateur le souhaite, commiter le(s) fichier(s) `content-sources/`
  modifié(s) ; sinon laisser la modification dans l'arbre de travail.
