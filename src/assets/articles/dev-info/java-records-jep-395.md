---
title: "Java Records : des porteurs de données transparents et immuables"
category: dev-info
date: 2026-07-10
author: Geoffrey Aubert
tags: ["java", "records", "immutabilité", "jep-395", "poo"]
summary: "Finalisés dans Java 16 (JEP 395), les records offrent une syntaxe concise pour déclarer des classes-porteurs de données immuables. Ce qu'ils génèrent, leurs contraintes, et ce qu'ils ne cherchent PAS à être — d'après la source officielle."
readTime: 6
---

# Java Records : des porteurs de données transparents et immuables

Combien de fois avez-vous écrit une classe Java « bête » — quelques champs, un constructeur, des getters, `equals()`, `hashCode()`, `toString()` — juste pour transporter de la donnée ? Les **records**, finalisés dans **Java 16** par le [JEP 395](https://openjdk.org/jeps/395), répondent à ce besoin avec une syntaxe minimale.

## Définition officielle

Le JEP les définit comme *« classes that act as transparent carriers for immutable data »* — des porteurs transparents de données immuables, que l'on peut voir comme des *« nominal tuples »* (tuples nommés).

L'exemple canonique du JEP tient sur une ligne :

```java
record Point(int x, int y) { }
```

Cette en-tête `(int x, int y)` est la **description d'état** (*state description*) du record.

## Ce que le compilateur génère pour vous

Parce qu'un record fait « la revendication sémantique » d'être un porteur transparent de sa donnée, il acquiert automatiquement de nombreux membres standards. Pour l'exemple ci-dessus :

- un **champ privé et `final`** par composant (`x`, `y`) ;
- un **accesseur public** par composant (`x()`, `y()`) ;
- un **constructeur canonique** `Point(int x, int y)` ;
- des implémentations de **`equals()`**, **`hashCode()`** et **`toString()`** dérivées de l'état.

Tout ce qui était boilerplate est désormais dérivé de la seule déclaration.

## Les contraintes (et leur raison d'être)

Un record n'est pas un `POJO` déguisé. Le JEP impose des règles qui **font sens** :

- une classe record est **implicitement `final`** et **ne peut pas être `abstract`** ;
- ses champs dérivés des composants sont **`final`** ;
- elle a pour superclasse implicite `Record`.

Le JEP explique pourquoi : ces restrictions soulignent que *« the API of a record class is defined solely by its state description, and cannot be enhanced later by another class »*. L'état, c'est l'API — rien de plus.

## Le constructeur compact

Besoin de valider ou de normaliser les données à la construction ? Le **constructeur compact** permet d'écrire la logique sans répéter l'affectation des champs :

```java
record Range(int min, int max) {
    Range {                     // constructeur compact
        if (min > max)
            throw new IllegalArgumentException("min > max");
    }
}
```

À noter, une garantie apportée par le JEP : il est devenu une **erreur de compilation** d'affecter un champ d'instance dans le corps du constructeur — ce qui renforce l'usage prévu (valider, pas muter).

## Ce que les records ne sont PAS

Un point que le JEP tient à clarifier dans ses *Non-Goals* : ce n'est **pas** une « guerre au boilerplate ». L'objectif n'est pas de raccourcir le code pour le raccourcir, mais d'offrir *« an object-oriented construct that expresses a simple aggregation of values »* et d'aider à **modéliser des données immuables plutôt qu'un comportement extensible**. Les records préservent aussi le typage nominal et la compatibilité de migration de Java.

Autrement dit : si votre classe a une identité, un cycle de vie, du comportement riche ou de l'héritage, ce n'est pas un record. Si c'est un simple agrégat de valeurs immuables (un point, une paire clé/valeur, un DTO, le résultat d'une requête), c'est exactement le bon outil.

## En pratique

Les records brillent particulièrement pour les DTO, les objets de valeur (*value objects*) du DDD, les clés composites, ou les résultats intermédiaires d'un `Stream`. Et ils s'intègrent avec le *pattern matching* (JEP 440, *record patterns*), ce qui ouvre un style de programmation par déstructuration très expressif.

## Sources
- **Source officielle** : JEP 395 « Records », statut *Closed/Delivered*, finalisé dans JDK 16 — https://openjdk.org/jeps/395
