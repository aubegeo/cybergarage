---
title: "RAG classique vs Agentic Search : le retrieval devient une investigation"
category: ia-master
date: 2026-09-03
author: Geoffrey Aubert
tags: ["rag", "agentic-search", "mistral", "llm", "retrieval"]
summary: "Mistral AI a lancé Agentic Search, une alternative au RAG classique où le modèle décide lui-même comment chercher dans les documents. Comprendre la différence, et pourquoi elle compte pour un gros corpus documentaire d'entreprise."
readTime: 8
---

# RAG classique vs Agentic Search : le retrieval devient une investigation

Imaginons que je veuille poser une question à un LLM sur les documents internes de mon entreprise : contrats, documentation technique, procédures, pages Confluence. Le modèle ne connaît pas ces documents, et je ne veux évidemment pas le réentraîner à chaque mise à jour. La question devient : comment faire répondre un LLM à partir de mes propres documents ?

C'est le problème que résout le **RAG** (Retrieval-Augmented Generation). Et c'est précisément sur ce terrain que Mistral AI a annoncé, le 20 août 2026, une approche différente : l'[**Agentic Search**](https://mistral.ai/news/agentic-search/).

## Le RAG classique : chercher puis répondre

Le principe du RAG est simple : au lieu de laisser le LLM répondre uniquement à partir de ce qu'il connaît déjà, on va d'abord rechercher des informations pertinentes dans nos propres documents, puis les lui fournir pour qu'il construise sa réponse.

```
Question utilisateur
        ↓
Recherche dans les documents
        ↓
Informations pertinentes
        ↓
LLM
        ↓
Réponse
```

Pourquoi ne pas simplement donner tous les documents au LLM ? Parce qu'avec 10 000, 100 000 ou plusieurs millions de pages, ce serait très coûteux, très lent, et de toute façon impossible à cause de la limite de contexte du modèle. Il faut donc d'abord retrouver les bons passages.

Construire un RAG sérieux implique une chaîne d'étapes qui, prises une à une, semblent anodines mais s'accumulent vite :

- **Chunking** — découper les documents en petits morceaux (chunks) pour pouvoir retrouver précisément la partie intéressante, avec un compromis permanent : trop petit, on perd le contexte ; trop grand, la recherche devient moins précise et plus coûteuse en tokens.
- **Overlap** — faire chevaucher légèrement deux chunks consécutifs pour éviter qu'une information importante soit coupée exactement à leur frontière.
- **Embeddings et recherche vectorielle** — transformer le texte en représentation numérique pour retrouver des passages sémantiquement proches, même si les mots utilisés diffèrent de ceux de la question.
- **Recherche lexicale** — une recherche par mots-clés, plus efficace pour les références précises (numéros de contrat, codes, termes techniques).
- **Recherche hybride** — combiner les deux pour profiter des avantages de chacune.
- **Top-K, query rewriting, reranking, filtres** — respectivement le nombre de résultats conservés, la reformulation automatique de la question, le reclassement des résultats après une première recherche, et la restriction à un sous-ensemble de documents selon des métadonnées.
- **Vérification des sources** — s'assurer que la réponse générée est réellement supportée par les documents récupérés, pour limiter les hallucinations.

Un RAG simple se limite à : Question → Recherche → Top-K → LLM → Réponse. Un RAG avancé ajoute query rewriting, recherche hybride, reranking, vérification. Le pipeline final ressemble à : Question → Query rewriting → Recherche hybride → Top-K → Reranking → Filtres → Vérification → LLM → Réponse — et derrière, il faut encore gérer le chunking, les embeddings, l'indexation, les métadonnées, les performances, le coût, la latence, l'évaluation de la qualité.

Le problème n'est donc plus « comment rechercher des documents ? » mais « comment construire une stratégie de recherche suffisamment intelligente pour chaque question ? ». C'est exactement à ce moment que l'approche agentique devient intéressante.

## Et si le LLM cherchait lui-même ?

L'idée de l'Agentic Search est de ne plus donner directement au modèle quelques résultats en lui disant « voici les documents, réponds ». On lui donne à la place des **outils** pour explorer la base documentaire — search, open, read, grep, navigate — et c'est le modèle qui décide : quoi chercher, quel document ouvrir, quelle partie lire, s'il a assez d'informations, s'il doit relancer une recherche, comparer plusieurs documents, vérifier une information.

Le modèle ne reçoit plus un résultat de recherche figé : il mène une véritable investigation documentaire.

**La différence fondamentale**, telle que je la formule à partir de la documentation Mistral : le RAG classique fournit au modèle un contexte récupéré par une stratégie prédéfinie par le développeur (combien de résultats, comment les traiter). L'Agentic Search donne au modèle les moyens de construire lui-même sa stratégie de recherche, étape par étape : Question → Agent → Search → Read → Analyse → Nouvelle recherche → Open → Comparaison → Vérification → Réponse.

Sur une question d'assurance comme « est-ce que le contrat X couvre ce sinistre, et quelles sont les exclusions applicables ? », l'information peut être répartie entre conditions générales, conditions particulières, une annexe, une clause d'exclusion et un avenant. Un RAG classique peut récupérer plusieurs passages pertinents mais manquer l'avenant qui modifie une clause. Un agent, lui, peut procéder par étapes : rechercher « couverture », lire le contrat, constater qu'il manque les exclusions, rechercher « exclusions », lire l'annexe, découvrir l'existence d'un avenant, le rechercher, le lire, comparer, vérifier, puis répondre. C'est une investigation, pas une simple récupération de chunks.

Cette logique devient particulièrement pertinente sur un gros corpus documentaire d'entreprise : des milliers de pages accumulées sur plusieurs années, des documents qui se référencent entre eux, une documentation récente qui en remplace une ancienne, des termes utilisés différemment selon les projets. Répondre correctement nécessite alors souvent de naviguer entre plusieurs documents plutôt que de retrouver un chunk isolé.

## Les chiffres annoncés par Mistral

Mistral communique des résultats sur deux benchmarks de question-réponse documentaire, détaillés dans sa [documentation officielle](https://docs.mistral.ai/studio/search/agentic-search) :

- **FinanceBench** — 150 questions sur 368 documents financiers déposés à la SEC (10-K/10-Q/8-K), longs et denses en tableaux.
- **OfficeQA Pro** — 133 questions sur 696 bulletins du Trésor américain, des PDF scannés riches en tableaux, dont les réponses sont presque exclusivement numériques.

| Benchmark | RAG présenté | Agentic Search |
|---|---|---|
| FinanceBench | 26,7 % | 86 % |
| OfficeQA Pro | 6,3 % | 51,9 % |

Mistral annonce également une réduction de la consommation de tokens et de la latence dans certains scénarios ([ZDNet](https://www.zdnet.fr/actualites/mistral-ai-lance-une-ia-capable-de-chercher-et-verifier-les-informations-dans-les-documents-500439.htm) confirme l'annonce côté presse généraliste).

Ces chiffres méritent une mise en garde importante, que je reprends telle quelle : ils proviennent de l'évaluation présentée par Mistral elle-même, sur son propre RAG de référence, et **ne signifient pas** qu'« Agentic Search est meilleur que n'importe quel RAG possible ». Un RAG extrêmement bien optimisé — recherche hybride, query rewriting, reranking, stratégie de récupération adaptée, bon chunking, bons embeddings — peut obtenir d'excellents résultats. L'intérêt réel de l'approche agentique est ailleurs : obtenir de très bonnes performances **sans avoir à construire et optimiser manuellement** toute l'orchestration du retrieval.

## Ce que ça change pour le développeur

Avec un RAG classique, une grande partie de la complexité se trouve dans la conception du pipeline de récupération : chunking, embeddings, recherche hybride, query rewriting, reranking, Top-K, filtres, vérification. Avec une approche agentique, une partie de cette logique est confiée à l'agent — mais la complexité ne disparaît pas, elle se déplace. On passe de « je dois programmer toute la stratégie de recherche » à « je dois concevoir les outils, les contraintes et l'environnement permettant à l'agent de mener correctement sa recherche ». Le développeur garde un rôle déterminant : qualité des outils, des sources, des métadonnées, des droits d'accès, des garde-fous et de l'évaluation.

Point notable pour les entreprises soucieuses de confidentialité ou de souveraineté : Mistral présente l'Agentic Search comme utilisable en **self-hosted** selon l'architecture choisie. Mais le self-hosting ne veut pas dire que tous les composants tournent en local par défaut — il faut vérifier précisément ce qui est déployé dans l'infrastructure de l'entreprise : index, moteur de recherche, agent, LLM, OCR, stockage, outils d'accès aux documents.

## Quand utiliser quoi

Pour une question simple, du type « quelle est l'adresse de l'entreprise ? », un RAG classique reste probablement suffisant : rapide, prévisible, relativement simple à maintenir. Pour une question complexe, du type « compare les obligations prévues dans ces trois contrats et vérifie si l'avenant de 2025 modifie les exclusions », l'approche agentique devient nettement plus intéressante : elle permet de rechercher plusieurs documents, naviguer entre les références, approfondir, comparer, vérifier.

Le choix n'est donc pas binaire entre « RAG ou Agentic Search » — il dépend de la complexité de la question et du niveau d'investigation nécessaire. La vraie question à se poser n'est pas « est-ce que l'Agentic Search remplace le RAG ? » mais plutôt « combien de complexité puis-je retirer de mon architecture tout en conservant une excellente précision ? ».

## Conclusion

Le RAG classique dit au LLM : « voici les informations que j'ai trouvées, maintenant réponds ». L'Agentic Search lui dit plutôt : « voici les outils, trouve les informations nécessaires, vérifie-les, puis réponds ». On passe d'un système Recherche → Réponse à un système capable de mener une investigation : Recherche → Analyse → Nouvelle recherche → Lecture → Comparaison → Vérification → Réponse.

Pour des questions simples sur des corpus bien structurés, un RAG classique reste une excellente solution. Mais lorsque les informations sont dispersées dans de nombreux documents qui se référencent entre eux, ou qu'une réponse nécessite plusieurs étapes de recherche et de vérification — le cas typique d'un gros corpus documentaire d'entreprise accumulé sur des années — l'approche agentique devient particulièrement intéressante. Le RAG ne disparaît pas : il devient progressivement un environnement dans lequel un agent peut chercher, raisonner et vérifier.

## Sources
- **Source officielle** : Mistral AI, « Introducing Agentic Search », annonce du 20 août 2026 — https://mistral.ai/news/agentic-search/
- **Documentation officielle** : Mistral AI, Agentic Search (Studio) — https://docs.mistral.ai/studio/search/agentic-search
- **Complément (presse)** : ZDNet, « Mistral AI lance une IA capable de chercher et vérifier les informations dans les documents » — https://www.zdnet.fr/actualites/mistral-ai-lance-une-ia-capable-de-chercher-et-verifier-les-informations-dans-les-documents-500439.htm
