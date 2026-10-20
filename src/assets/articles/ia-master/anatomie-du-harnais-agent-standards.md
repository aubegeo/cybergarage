---
title: "Anatomie du harnais d'un agent : ce qui est normalisé, et ce qui ne l'est pas"
category: ia-master
date: 2026-10-02
author: Geoffrey Aubert
tags: ["ia", "agents", "mcp", "agent-skills", "standards", "architecture"]
summary: "Un agent, c'est un modèle plus un harnais. Les listes de composants circulent beaucoup, les spécifications beaucoup moins. Inventaire de ce que couvrent réellement MCP et le format Agent Skills, et de ce qui reste propre à chaque éditeur."
readTime: 5
---

L'équation circule depuis quelques mois dans les milieux produit. Un agent, c'est un modèle plus un harnais, le harnais désignant tout ce qui n'est pas le modèle et qui lui permet d'agir, de se souvenir et de s'arrêter. Les décompositions en six, huit ou dix composants ne manquent pas.

Ce qui manque davantage, c'est l'étape suivante. Pour chacun de ces composants, existe-t-il une spécification publique, ou chaque éditeur fait-il comme il l'entend ? La réponse détermine ce que vous pouvez porter d'un outil à l'autre, et ce que vous reconstruirez à chaque changement.

Voici l'inventaire, fait à partir des spécifications elles-mêmes.

## Ce que MCP normalise

Le [Model Context Protocol](https://modelcontextprotocol.io/specification/latest), dans sa version `2026-07-28`, se décrit comme « an open protocol that enables seamless integration between LLM applications and external data sources and tools ».

La spécification est normative au sens strict. Elle précise que les termes MUST, SHOULD et MAY y sont employés selon la [RFC 2119](https://datatracker.ietf.org/doc/html/rfc2119), et elle s'appuie sur un schéma TypeScript publié.

Trois rôles sont définis. Les **hosts** sont les applications qui initient la connexion, les **clients** sont les connecteurs à l'intérieur de l'host, les **servers** sont les services qui fournissent contexte et capacités. Le transport repose sur JSON-RPC 2.0.

Côté serveur, trois primitives :

Les **resources** apportent du contexte et des données, pour l'utilisateur ou pour le modèle. Les **prompts** sont des messages et des workflows gabarisés. Les **tools** sont des fonctions que le modèle peut exécuter.

Côté client, une primitive, l'**elicitation**, qui permet au serveur de demander une information supplémentaire à l'utilisateur en cours de route.

S'y ajoutent des extensions optionnelles, négociées à l'initialisation, dont **Tasks** pour les opérations longues avec reprise, et **MCP Apps** pour des éléments d'interface rendus dans la conversation.

Autrement dit, MCP couvre la partie outils et contexte du harnais. C'est considérable. C'est aussi délimité.

## Ce que le format Agent Skills normalise

Le second standard concerne la mémoire procédurale, c'est-à-dire le savoir-faire plutôt que les données.

Le format [Agent Skills](https://agentskills.io) a été développé à l'origine par Anthropic, puis publié comme standard ouvert. Sa structure est volontairement minimale. Une skill est un dossier contenant un fichier `SKILL.md`, avec au minimum deux métadonnées, `name` et `description`, suivies des instructions. Le dossier peut embarquer des scripts, des références et des gabarits.

```
ma-skill/
├── SKILL.md          # requis : métadonnées + instructions
├── scripts/          # optionnel : code exécutable
├── references/       # optionnel : documentation
└── assets/           # optionnel : gabarits, ressources
```

Le mécanisme de chargement mérite l'attention, parce qu'il résout un vrai problème de coût. La documentation parle de **progressive disclosure** en trois temps. Au démarrage, l'agent ne charge que le nom et la description de chaque skill, assez pour savoir quand elle pourrait servir. Quand une tâche correspond, il lit le `SKILL.md` complet. Puis il exécute, en chargeant au besoin les fichiers référencés.

La conséquence pratique est qu'on peut maintenir beaucoup de skills avec une empreinte de contexte faible, puisque les instructions complètes ne sont lues que lorsqu'elles servent.

## Ce qui n'est normalisé nulle part

C'est la partie la plus utile de l'inventaire, celle qu'on lit le plus rarement.

**La mémoire factuelle** n'a pas de standard. Ce que l'agent retient de vous entre deux sessions, sous quelle forme et avec quelle politique d'oubli, relève entièrement de l'implémentation. Un agent peut stocker en SQLite, un autre dans un service distant, un troisième dans des fichiers Markdown. Rien ne garantit l'export ni la reprise ailleurs.

**La boucle de raisonnement** non plus. Comment l'agent décide de poursuivre, de redécouper une tâche, de demander confirmation ou de s'arrêter, aucune spécification ne le décrit. C'est pourtant ce qui fait la différence de comportement la plus visible entre deux outils branchés sur le même modèle.

**Les permissions**, et c'est le cas le plus intéressant, sont traitées par MCP, mais pas de la façon qu'on croit. La spécification consacre une section à la sécurité et pose des principes nets. L'utilisateur doit consentir explicitement à tout accès aux données, les descriptions d'outils doivent être considérées comme non fiables sauf si elles viennent d'un serveur de confiance, et l'host doit obtenir un consentement explicite avant d'invoquer un outil.

Mais la spécification ajoute elle-même sa limite, qu'il faut lire attentivement. MCP « cannot enforce these security principles at the protocol level ». Les principes sont écrits, leur application dépend entièrement de l'implémenteur, à qui le texte recommande simplement de construire des flux d'autorisation robustes.

C'est pour cela que les incidents d'agents qui exécutent une commande destructrice ne révèlent pas un angle mort des standards. Le standard dit ce qu'il faut faire. Il n'a simplement aucun moyen de l'imposer.

## Ce que cet inventaire change concrètement

Si vous construisez autour d'un agent, la question « est-ce que je pourrai emporter ça ailleurs ? » a maintenant une réponse par composant.

Vos intégrations d'outils et vos sources de contexte sont portables, à condition de passer par MCP plutôt que par un mécanisme propriétaire. Vos procédures sont portables si vous les écrivez au format Agent Skills, qui est supporté par un nombre croissant de clients.

Votre mémoire accumulée, votre configuration de permissions et le comportement de la boucle ne le sont pas. Ce sont eux qui vous retiendront chez un éditeur, donc c'est là qu'il faut regarder avant de s'engager. Un agent open source avec une base lisible vous laisse une porte de sortie, un service fermé beaucoup moins.

La leçon d'architecture est classique et elle vaut au-delà de l'IA. Ce qui est spécifié se remplace, ce qui est implicite se subit.

## Sources

- Model Context Protocol, spécification version `2026-07-28` : [modelcontextprotocol.io/specification](https://modelcontextprotocol.io/specification/latest)
- Format Agent Skills, standard ouvert développé à l'origine par Anthropic : [agentskills.io](https://agentskills.io)
- RFC 2119, interprétation des mots-clés normatifs : [datatracker.ietf.org/doc/html/rfc2119](https://datatracker.ietf.org/doc/html/rfc2119)
