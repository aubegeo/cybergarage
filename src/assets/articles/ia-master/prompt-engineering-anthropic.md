---
title: "Prompt engineering avec Claude : les techniques officielles d'Anthropic"
category: ia-master
date: 2026-07-10
author: Geoffrey Aubert
tags: ["ia", "llm", "prompt-engineering", "claude", "anthropic"]
summary: "Avant de fine-tuner ou de changer de modèle, il y a le prompt, puisque la documentation officielle d'Anthropic recense un ensemble de techniques pour guider Claude et indique surtout quand le prompt engineering est le bon levier."
readTime: 6
---

# Prompt engineering avec Claude : les techniques officielles d'Anthropic

Face à un modèle qui ne répond pas tout à fait comme on le voudrait, le premier réflexe n'est ni le fine-tuning ni le changement de modèle mais **d'améliorer le prompt**. La [documentation officielle d'Anthropic](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) formalise cette démarche. Cet article s'appuie sur cette source.

## D'abord : est-ce le bon levier ?

La doc souligne un point souvent négligé, à savoir que le prompt engineering ne résout pas *tout*, puisqu'elle prévient que *« latency and cost can be sometimes more easily improved by selecting a different model »*, autrement dit que la latence et le coût se règlent parfois mieux en changeant de modèle qu'en peaufinant un prompt.

La doc pose aussi trois prérequis avant même de commencer à optimiser :

1. une **définition claire des critères de succès** pour votre cas d'usage ;
2. des **moyens de tester empiriquement** contre ces critères ;
3. un **premier jet de prompt** à améliorer.

Le message est celui d'un ingénieur, puisqu'on n'optimise pas à l'aveugle mais contre des **évaluations**.

## Les techniques recensées

La doc énumère l'éventail des techniques de prompting, *« from clarity and examples to XML structuring, role prompting, thinking, and prompt chaining »*. Décryptons-les :

- **Être clair et direct**, c'est dire explicitement ce que l'on attend. Un modèle n'a pas votre contexte implicite ; l'ambiguïté est l'ennemie du résultat.
- **Donner des exemples (multishot)**, c'est montrer plutôt que décrire. Quelques exemples bien choisis cadrent le format et le style attendus mieux qu'une longue consigne.
- **Laisser Claude réfléchir (*thinking* / chain of thought)** consiste à demander un raisonnement étape par étape avant la réponse finale, ce qui améliore la qualité sur les tâches complexes.
- **Structurer avec des balises XML** revient à délimiter les parties du prompt (contexte, instructions, données) avec des balises, ce qui rend l'intention non ambiguë et la sortie plus fiable.
- **Attribuer un rôle (*role prompting* via system prompt)** revient à cadrer la posture du modèle (« tu es un relecteur de code exigeant… ») pour orienter le ton et l'expertise.
- **Chaîner les prompts (*prompt chaining*)** consiste à découper une tâche complexe en plusieurs prompts successifs, chacun sur une sous-tâche, plutôt qu'un méga-prompt fourre-tout.

La doc renvoie vers sa page *« Prompting best practices »* comme **référence vivante** à jour pour les derniers modèles, ce qui est un bon réflexe puisque le prompt engineering évolue avec les modèles.

## Les outils fournis

Anthropic ne laisse pas le développeur seul face à la page blanche. La **Claude Console** propose des outils de prompting : un **générateur de prompt** (pour partir d'un premier jet), des **templates et variables** et un **améliorateur de prompt**, ce qui permet d'industrialiser la démarche plutôt que de bricoler.

## Ce qu'il faut retenir

Le prompt engineering est une **discipline d'ingénieur** et non de la magie, puisqu'on part de critères de succès, qu'on itère contre des évaluations et qu'on mobilise un répertoire de techniques (clarté, exemples, raisonnement explicite, balises XML, rôle, chaînage). Mais la première question reste stratégique, à savoir si le prompt est vraiment le bon levier ou s'il faut agir ailleurs (modèle, RAG, architecture), ce que la doc officielle a l'honnêteté de rappeler.

## Sources
- **Source officielle** : « Prompt engineering overview », documentation Anthropic, https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
- Référence détaillée à jour : « Prompting best practices » (Anthropic), https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices
