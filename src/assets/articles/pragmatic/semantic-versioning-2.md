---
title: "Semantic Versioning : donner du sens à vos numéros de version"
category: pragmatic
date: 2026-07-10
author: Geoffrey Aubert
tags: ["versioning", "semver", "api", "dépendances", "bonnes-pratiques"]
summary: "MAJOR.MINOR.PATCH : derrière ces trois nombres, une règle simple qui met fin au « dependency hell ». Ce que dit exactement la spécification Semantic Versioning 2.0.0."
readTime: 5
---

# Semantic Versioning : donner du sens à vos numéros de version

`1.4.2`, `2.0.0`, `3.1.0-beta.1`… Un numéro de version peut n'être qu'une étiquette arbitraire — ou porter une **information précise** sur ce qui a changé. C'est tout l'objet de **Semantic Versioning 2.0.0** ([semver.org](https://semver.org/)), qui transforme le versioning en contrat.

## La règle fondamentale

La spécification est limpide. Étant donné un numéro **`MAJOR.MINOR.PATCH`**, on incrémente :

1. **MAJOR** quand on introduit des changements d'API **incompatibles** ;
2. **MINOR** quand on ajoute des fonctionnalités de manière **rétrocompatible** ;
3. **PATCH** pour des corrections de bugs **rétrocompatibles**.

Textuellement : *« MAJOR version when you make incompatible API changes, MINOR version when you add functionality in a backward compatible manner, PATCH version when you make backward compatible bug fixes. »*

## Les règles de réinitialisation

Un détail que beaucoup oublient : incrémenter un niveau **remet à zéro** ceux d'en dessous.

- On incrémente **MAJOR** dès qu'un changement **casse** l'API publique → MINOR et PATCH repassent à `0` (ex. `1.4.2` → `2.0.0`).
- On incrémente **MINOR** pour toute nouvelle fonctionnalité rétrocompatible → PATCH repasse à `0` (ex. `1.4.2` → `1.5.0`).
- On incrémente **PATCH** uniquement pour des corrections rétrocompatibles (ex. `1.4.2` → `1.4.3`).

Le mot-clé de la spec est **MUST** : ce ne sont pas des suggestions, mais des règles.

## Le cap du 1.0.0

Avant `1.0.0`, tout peut bouger : la spec réserve les versions `0.y.z` au développement initial, où l'API n'est pas stable. Le passage à **`1.0.0`** est un engagement : *« Version 1.0.0 defines the public API. »* À partir de là, les incréments suivent strictement les règles ci-dessus, et vos utilisateurs peuvent dépendre de vous en confiance.

## Pré-releases et métadonnées de build

Deux extensions du format :

- **Pré-release** : ajoutée après un tiret (`1.0.0-alpha`, `1.0.0-alpha.1`). La spec précise qu'une pré-release a une **précédence inférieure** à la version normale associée (`1.0.0-alpha` < `1.0.0`).
- **Métadonnées de build** : ajoutées après un `+` (`1.0.0+20130313144700`). Elles **doivent être ignorées** dans le calcul de précédence.

## Pourquoi ça compte

Semantic Versioning résout ce que la spec appelle le **« dependency hell »** : l'enfer des dépendances, où l'on n'ose plus mettre à jour de peur de tout casser. En rendant l'**intention de chaque changement explicite dans le numéro lui-même**, SemVer permet aux gestionnaires de dépendances (npm, Maven, Cargo…) de raisonner : « accepte les patchs et les minors de `1.x`, mais bloque le passage à `2.0` ». C'est la base de contraintes comme `^1.4.2` ou `~1.4.2`.

Adopter SemVer, c'est passer un **contrat de compatibilité** avec les consommateurs de votre bibliothèque ou de votre API — et se donner un langage commun pour parler de rupture.

## Sources
- **Source officielle** : Semantic Versioning 2.0.0 (Tom Preston-Werner) — https://semver.org/
