---
title: "Auditer une architecture IA : le modèle n'est qu'un composant de plus"
category: ia-master
date: 2026-08-21
author: Geoffrey Aubert
tags: ["ia", "architecture", "audit", "llm", "ingenierie-logicielle"]
summary: "Premier volet d'une série sur l'audit de logiciels IA, qui explique pourquoi la bonne question n'est jamais « quel modèle ? » mais « où est la frontière entre ce composant et le reste du système ? »."
readTime: 7
---

# Auditer une architecture IA : le modèle n'est qu'un composant de plus

Dès qu'un projet embarque de l'IA, la conversation part presque toujours du même endroit :
« quel modèle utilisez-vous ? », « GPT ou Claude ? », « quelle taille de contexte ? ». Ce sont
des questions de configuration, pas des questions d'architecture. Et c'est exactement le
réflexe qu'il faut casser en premier quand on audite un logiciel construit autour d'une IA,
puisque le modèle n'est pas l'architecture mais un composant de plus dans l'architecture, avec ses
entrées, ses sorties, ses pannes possibles et une frontière qu'il faut savoir dessiner.

C'est le premier article d'une série en sept parties sur l'audit de logiciels IA : après
l'architecture, viendront la qualité et l'évaluation, les données, la sécurité spécifique à
l'IA (prompt injection, permissions des tools), les coûts et la performance, la conformité
(RGPD, AI Act) et enfin l'observabilité en production.

## Le modèle n'est pas magique, c'est un composant non déterministe

Google documente ses propres pratiques d'ingénierie ML dans un guide public,
*Rules of Machine Learning*, signé Martin Zinkevich. La toute première règle donne le ton :
*« Don't be afraid to launch a product without machine learning. »* Autrement dit, si un
heuristique simple fait 50 % du travail, ne sautez pas directement sur le modèle. La règle 3
prolonge l'idée en recommandant *« Choose machine learning over a complex heuristic »* seulement quand
l'heuristique devient elle-même trop complexe pour être maintenue.

Ce qui compte ici pour un audit d'architecture, ce n'est pas le débat « faut-il de l'IA ? »,
mais ce qu'il révèle, à savoir qu'un modèle est un composant qu'on choisit d'introduire dans un système
existant, au même titre qu'un cache Redis ou une file de messages. Il a un rôle précis, des
alternatives plus simples à considérer avant lui et surtout un **coût de maintenance**, que la
règle 4 rappelle en ces termes, *« The first model provides the biggest boost to your product, so it
doesn't need to be fancy. But you will run into many more infrastructure issues than you
expect. »* La majorité des problèmes ne viennent pas du modèle, mais de l'infrastructure
autour.

## Dessiner la frontière : ce qui est déterministe, ce qui ne l'est pas

En Java, on isole un composant instable derrière une interface depuis toujours, ce qui est la
base du principe d'inversion de dépendance. Un audit d'architecture IA commence par vérifier
que ce réflexe a bien été appliqué au modèle :

```java
public interface DocumentClassifier {
    ClassificationResult classify(Document doc);
}

public class RuleBasedClassifier implements DocumentClassifier {
    // logique déterministe existante : mots-clés, regex, seuils métier
}

public class LlmClassifier implements DocumentClassifier {
    private final LlmClient client;
    private final Duration timeout;

    public ClassificationResult classify(Document doc) {
        // appel non déterministe : peut timeout, peut halluciner un label
        // inexistant, peut varier d'un run à l'autre sur la même entrée
    }
}
```

Ce découpage n'est pas cosmétique. Il rend possible ce que la règle 5 de Google appelle
*« test the infrastructure independently from the machine learning »*, c'est-à-dire tester le pipeline
(récupération des données, format de sortie, intégration) sans dépendre du comportement du
modèle lui-même. Dans un audit, la question concrète à se poser est de savoir s'il est possible de **remplacer le modèle par
un mock et de faire tourner les tests d'intégration**. Si la réponse est non, la frontière n'a
jamais été tracée, puisque le modèle est enchevêtré dans le reste du code, exactement comme une
requête SQL construite par concaténation est enchevêtrée dans la logique métier qui l'entoure.

## Ne pas jeter l'intuition métier qui existait avant l'IA

Sur une migration Oracle PL/SQL vers Java/PostgreSQL, le piège classique n'est pas technique
mais humain, puisqu'il consiste à porter chaque procédure stockée ligne à ligne sans se demander ce qu'elle
encode réellement. Certaines de ces procédures, écrites et retouchées sur quinze ans, ne
sont plus de la « règle métier documentée » mais des heuristiques empiriques que
plusieurs générations de développeurs ont ajustées à la marge, sans jamais les remettre à
plat.

La règle 7 de Google nomme précisément ce piège côté IA avec la formule *« Turn heuristics into features,
or handle them externally. »* Avant de laisser un modèle « réinventer » un comportement,
l'audit doit vérifier qu'on a d'abord extrait ce que l'heuristique existante sait déjà faire
(un score, un seuil, une blacklist) plutôt que de le redemander en langage naturel à un
LLM qui n'a aucune idée de l'historique métier réel. C'est le même travail d'archéologie que
sur une base Oracle héritée, qui consiste à comprendre *pourquoi* une règle existe avant de décider si elle
doit devenir une feature, un prompt, ou rester du code classique.

## Le vrai risque d'architecture : la panne silencieuse

La règle 10 de Google mérite d'être citée en entier tant elle s'applique telle quelle à un
système IA en production, puisqu'elle énonce que *« This is a problem that occurs more for machine learning
systems than for other kinds of systems. […] The machine learning system will adjust, and
behavior will continue to be reasonably good, decaying gradually. »* Une base de données mal
alimentée renvoie une erreur explicite. Un modèle mal alimenté renvoie une réponse plausible,
polie et fausse, sans jamais planter.

Sur un moteur de rapprochement de transactions financières, ce risque est déjà connu sous
une autre forme, celle d'un score de matching calculé sur une donnée de référence obsolète qui ne
provoque pas d'exception mais continue simplement à produire des rapprochements de moins
bonne qualité, en silence, jusqu'à ce qu'un audit ou une réclamation client le révèle. La
même vigilance s'impose sur la couche IA, où il faut se demander quel comportement de repli (fallback) existe si
le modèle timeout, renvoie un format inattendu ou dérive silencieusement. Un audit
d'architecture qui ne pose pas cette question laisse passer le risque le plus coûteux de
tous, celui qu'on ne voit qu'après coup.

## Ce qu'un audit d'architecture doit vérifier concrètement

- Le modèle est-il isolé derrière une interface stable, remplaçable par un mock en test ?
- Existe-t-il un chemin de repli explicite (timeout, erreur de format, contenu vide) plutôt
  qu'un silence qui dégrade la qualité sans alerter personne ?
- Les heuristiques ou règles métier préexistantes ont-elles été extraites et réutilisées, ou
  a-t-on redemandé au modèle de les redécouvrir à l'aveugle ?
- Une tâche confiée au modèle pourrait-elle être couverte, en tout ou partie, par une règle
  simple et déterministe, moins chère, plus rapide et plus facile à auditer ?

Aucune de ces questions ne demande de comprendre l'attention ou le fine-tuning. Ce sont des
questions d'architecture ordinaire, posées à un composant qui se trouve être un modèle, plutôt que
des questions réservées à un « expert IA ».

## Sources
- **Source officielle** : « Rules of Machine Learning: Best Practices for ML Engineering »,
  Martin Zinkevich, Google for Developers, https://developers.google.com/machine-learning/guides/rules-of-ml
