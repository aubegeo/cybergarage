---
title: "Conventional Commits 1.0.0 : structurer ses messages de commit pour de vrai"
category: pragmatic
date: 2026-08-31
author: Geoffrey Aubert
tags: ["git", "conventions", "changelog", "semver", "bonnes-pratiques"]
summary: "Une convention légère au-dessus des messages de commit, qui rend l'historique lisible par les humains et exploitable par les machines. Revue de la spécification Conventional Commits 1.0.0."
readTime: 8
---

Combien de fois avez-vous lu un historique Git peuplé de messages du type « fix », « wip », « update stuff » ? Ce n'est pas seulement inélégant, puisque l'historique obtenu ne permet de rien tirer automatiquement. La spécification **Conventional Commits** propose de résoudre ce problème avec une contrainte minimale. Telle que définie par la [source officielle](https://www.conventionalcommits.org/en/v1.0.0/), il s'agit d'« une convention légère au-dessus des messages de commit » (« a lightweight convention on top of commit messages ») qui « fournit un ensemble simple de règles pour créer un historique de commit explicite ; ce qui facilite l'écriture d'outils automatisés par-dessus ».

Il faut surtout retenir que cette convention **s'articule avec le Semantic Versioning (SemVer)**, en décrivant dans les commits eux-mêmes les fonctionnalités, correctifs et changements cassants apportés au code.

## La structure de base

La spec définit un format précis :

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

Deux types sont au cœur du dispositif, chacun corrélé à un niveau SemVer :
- **`fix`** : corrige un bug dans le code, ce qui est corrélé à un `PATCH` en SemVer.
- **`feat`** : introduit une nouvelle fonctionnalité, ce qui est corrélé à un `MINOR` en SemVer.

Un **breaking change** (changement cassant), quel que soit le type de commit auquel il est associé, est corrélé à un `MAJOR`. Il peut être signalé de deux façons : par un footer `BREAKING CHANGE:`, ou par un `!` juste après le type/scope, avant les deux-points.

D'autres types que `fix`/`feat` sont autorisés. La spec cite en exemple `@commitlint/config-conventional`, qui se base sur la convention Angular et recommande notamment `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, `test`. Il faut noter un point souvent mal compris, à savoir que **ces types additionnels n'ont par eux-mêmes aucun effet implicite sur le versionnage sémantique**, sauf s'ils incluent explicitement un breaking change.

## Les règles précises (MUST / SHOULD / MAY)

La spécification utilise le vocabulaire normatif de la RFC 2119 (`MUST`, `SHOULD`, `MAY`). Voici les règles clés :

- Les commits **doivent** (`MUST`) être préfixés par un type (un nom, `feat`, `fix`, etc.) suivi de l'`OPTIONAL scope`, de l'`OPTIONAL !`, puis d'un `REQUIRED` deux-points suivi d'un espace.
- `feat` **doit** être utilisé quand un commit ajoute une nouvelle fonctionnalité.
- `fix` **doit** être utilisé quand un commit corrige un bug.
- Un scope **peut** (`MAY`) être fourni ; il **doit** consister en un nom entre parenthèses, ex. `fix(parser):`.
- Une description **doit** suivre immédiatement le `: ` après le type/scope.
- Un body plus long **peut** être fourni après la description courte ; il **doit** commencer après une ligne vide et il est libre, de sorte qu'il **peut** contenir plusieurs paragraphes.
- Un ou plusieurs footers **peuvent** être fournis, une ligne vide après le body. Chaque footer **doit** consister en un token-mot suivi de `: ` ou ` #`, puis d'une valeur, selon un format inspiré de la convention des « git trailers ». Le token **doit** utiliser des tirets à la place des espaces (ex. `Acked-by`), à l'exception de `BREAKING CHANGE` qui échappe à cette règle.
- Les breaking changes **doivent** être indiqués soit dans le préfixe type/scope, soit en footer. En footer, le texte **doit** être en majuscules, `BREAKING CHANGE`, suivi de `: ` et d'une description. Dans le préfixe, ils **doivent** être indiqués par un `!` juste avant le `:`. Si le `!` est utilisé, le footer `BREAKING CHANGE:` **peut** être omis, la description du commit servant alors elle-même à décrire le changement cassant.
- Les éléments de la spec **ne doivent pas** (`MUST NOT`) être traités comme sensibles à la casse par les implémenteurs, à l'exception de `BREAKING CHANGE` qui **doit** rester en majuscules. `BREAKING-CHANGE` **doit** être considéré comme synonyme de `BREAKING CHANGE` en tant que token de footer.

## Exemples officiels

La spécification fournit une série d'exemples que je reprends tels quels, car ce sont eux qui illustrent le mieux les règles ci-dessus.

Commit avec description et footer de breaking change :

```
feat: allow provided config object to extend other configs

BREAKING CHANGE: `extends` key in config file is now used for extending other config files
```

Commit avec `!` pour signaler un breaking change directement dans le préfixe :

```
feat!: send an email to the customer when a product is shipped
```

Avec un scope et un `!` :

```
feat(api)!: send an email to the customer when a product is shipped
```

Avec `!` **et** footer `BREAKING CHANGE` (les deux peuvent coexister) :

```
feat!: drop support for Node 6

BREAKING CHANGE: use JavaScript features not available in Node 6.
```

Commit sans body, minimal :

```
docs: correct spelling of CHANGELOG
```

Commit avec scope, sans breaking change :

```
feat(lang): add Polish language
```

Commit avec body multi-paragraphe et plusieurs footers :

```
fix: prevent racing of requests

Introduce a request id and a reference to latest request. Dismiss
incoming responses other than from latest request.

Remove timeouts which were used to mitigate the racing issue but are
obsolete now.

Reviewed-by: Z
Refs: #123
```

## Pourquoi s'imposer cette contrainte

La section officielle « Why Use Conventional Commits » liste des bénéfices concrets, tous directement exploitables par des outils :

- Générer automatiquement des **CHANGELOGs**.
- Déterminer automatiquement un **bump de version sémantique** (à partir des types de commits).
- **Communiquer** la nature des changements aux coéquipiers, au public, aux parties prenantes.
- Déclencher des **process de build et de publication**.
- Faciliter la **contribution** aux projets grâce à un historique de commits plus structuré, ce qui aide à explorer un historique plus détaillé.

C'est exactement le même principe que SemVer côté versionnage, à savoir une contrainte syntaxique minimale en échange de laquelle on gagne de l'automatisation fiable.

## Ce que dit la FAQ officielle

Quelques clarifications utiles issues de la FAQ de la spécification :

- **Développement initial** : il est recommandé de procéder « comme si le produit était déjà publié », même en phase de développement précoce.
- **Casse des types** : n'importe quelle casse peut être utilisée pour les types, mais il faut rester cohérent.
- **Un commit à cheval sur plusieurs types** : la recommandation est de revenir en arrière et de faire plusieurs commits séparés si possible, ce qui pousse vers des commits et des pull requests plus organisés.
- **Est-ce que ça ralentit le développement rapide ?** La réponse officielle mérite d'être citée telle quelle, puisqu'elle affirme que « It discourages moving fast in a disorganized way. It helps you be able to move fast long term across multiple projects with varied contributors. » Autrement dit, cela décourage d'aller vite de façon désorganisée tout en permettant d'aller vite *durablement*, sur plusieurs projets et avec des contributeurs variés.
- **Relation avec SemVer** : `fix` → `PATCH`, `feat` → `MINOR`, un `BREAKING CHANGE` (quel que soit le type) → `MAJOR`.
- **Erreur dans le type d'un commit** : avant merge/release, on peut corriger via `git rebase -i` ; après release, cela dépend des outils utilisés.
- **Tous les contributeurs doivent-ils respecter la convention ?** Non, car avec un workflow de squash au merge, c'est le mainteneur qui peut nettoyer le message final, sans imposer de charge supplémentaire aux contributeurs occasionnels.
- **Gestion des reverts** : la spec ne définit pas explicitement de comportement pour les commits qui annulent un changement précédent. La recommandation est d'utiliser le type `revert`, avec un footer référençant les SHA des commits annulés, par exemple :

```
revert: let us never again speak of the noodle incident

Refs: 676104e, a215868
```

## En pratique, dans une équipe

Je tiens à souligner ici, en tant qu'ajout de contexte personnel (ce n'est pas dans la spec), que Conventional Commits ne vaut que si l'outillage suit derrière, avec `commitlint` pour valider les messages et `semantic-release` ou équivalent pour automatiser le versionnage et le changelog. Sans ça, la convention reste une discipline manuelle, utile mais fragile dès que l'équipe grandit. La bonne nouvelle, comme le rappelle la FAQ officielle, c'est qu'un workflow de squash-merge permet à un mainteneur seul de garantir la cohérence de l'historique, sans exiger que chaque contributeur connaisse la spec par cœur.

## Conclusion

Conventional Commits n'invente rien de conceptuellement nouveau puisqu'elle formalise une pratique déjà répandue (le préfixe `feat:`/`fix:` existait avant la spec dans beaucoup de projets, notamment via la convention Angular). Sa valeur tient à sa précision : des règles `MUST`/`MAY` non ambiguës, un vocabulaire fixe (`feat`, `fix`, `BREAKING CHANGE`) et une corrélation explicite avec SemVer. Il en résulte un historique Git qui redevient une source de données fiable, capable d'alimenter changelog, versionnage et pipelines de release sans intervention humaine.

## Sources
- **Source officielle** : Conventional Commits, spécification version 1.0.0, https://www.conventionalcommits.org/en/v1.0.0/ (licence Creative Commons CC BY 3.0)
