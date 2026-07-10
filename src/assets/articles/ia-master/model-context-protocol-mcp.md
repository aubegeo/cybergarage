---
title: "Le Model Context Protocol (MCP) : l'USB-C des applications IA"
category: ia-master
date: 2026-07-10
author: Geoffrey Aubert
tags: ["ia", "mcp", "llm", "agents", "interopérabilité"]
summary: "Comment connecter proprement un modèle d'IA à vos données et vos outils sans réinventer une intégration à chaque fois ? Le Model Context Protocol, standard ouvert, répond à cette question. Décryptage à partir de la documentation officielle."
readTime: 7
---

# Le Model Context Protocol (MCP) : l'USB-C des applications IA

Un modèle de langage, seul, ne sait rien de votre calendrier, de votre base de données ou de vos fichiers. Pour qu'un assistant IA devienne réellement utile, il faut le **connecter** au monde extérieur. Le problème : jusqu'ici, chaque intégration était sur mesure — un connecteur par outil, par application, par modèle. Une explosion combinatoire.

Le **Model Context Protocol (MCP)** répond exactement à ce problème. Cet article s'appuie sur la [documentation officielle](https://modelcontextprotocol.io).

## Définition officielle

La doc est directe : *« MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems. »* Un **standard ouvert** pour brancher des applications d'IA (Claude, ChatGPT…) à des sources de données, des outils et des workflows.

L'analogie officielle est excellente et mérite d'être citée :

> *« Think of MCP like a USB-C port for AI applications. Just as USB-C provides a standardized way to connect electronic devices, MCP provides a standardized way to connect AI applications to external systems. »*

Autrement dit : au lieu de N×M intégrations (N applications × M outils), on définit **une seule interface standard**. On construit une fois, on branche partout — la doc parle de *« build once and integrate everywhere »*.

## L'architecture : client / serveur

MCP repose sur un modèle **client-serveur** :

- Une **application hôte** (l'assistant IA : Claude, un IDE comme VS Code ou Cursor…) intègre un **client** MCP.
- Ce client se connecte à un ou plusieurs **serveurs** MCP, chacun exposant un périmètre précis de données ou de capacités.

Le serveur est le composant que l'on écrit pour **exposer son propre système** (sa base, son API, ses fichiers) au modèle, de façon standardisée. Côté hôte, rien à réécrire : s'il parle MCP, il sait parler à n'importe quel serveur MCP.

## Ce qu'un serveur expose

Un serveur MCP met à disposition trois grandes catégories de capacités. La doc officielle les résume en évoquant *« data sources (e.g. local files, databases), tools (e.g. search engines, calculators) and workflows (e.g. specialized prompts) »* :

- **Resources** — des données que le modèle peut lire (fichiers, enregistrements, contenu d'API). C'est le « contexte » au sens propre.
- **Tools** — des actions que le modèle peut déclencher (rechercher, calculer, écrire quelque part, appeler une API).
- **Prompts** — des workflows/gabarits réutilisables, des invites spécialisées prêtes à l'emploi.

Cette séparation est saine : on distingue clairement ce que le modèle peut **lire** (resources), ce qu'il peut **faire** (tools) et les **modes d'emploi** fournis (prompts).

## Ce que ça débranche concrètement

La doc donne des exemples parlants de ce que MCP permet :

- un agent qui accède à votre Google Calendar et à Notion pour devenir un assistant réellement personnalisé ;
- Claude Code qui génère une application web entière à partir d'une maquette Figma ;
- un chatbot d'entreprise connecté à plusieurs bases de données pour analyser la donnée en langage naturel.

## Pourquoi c'est important (surtout pour un architecte)

La doc décline le bénéfice selon le rôle : pour les **développeurs**, MCP *« reduces development time and complexity »* ; pour les **applications IA**, il ouvre l'accès à un écosystème de données et d'outils ; pour l'**utilisateur final**, il rend l'assistant plus capable.

Du point de vue architecture, l'intérêt est le même que pour n'importe quel bon standard d'intégration (pensez à JDBC pour les bases, ou à USB pour le matériel) : il **découple** les applications IA des systèmes qu'elles consomment. On évite le couplage fort et propriétaire, on capitalise sur un écosystème (Claude, ChatGPT, VS Code, Cursor… supportent déjà MCP), et on rend ses propres services réutilisables par n'importe quel hôte compatible.

Le risque de ce genre de standard reste classique — gouvernance, sécurité des serveurs exposés, gestion des permissions — mais l'idée de fond est solide : arrêter de recâbler l'IA à la main à chaque nouveau système.

## Sources
- **Source officielle** : « What is the Model Context Protocol (MCP)? » — documentation officielle MCP, https://modelcontextprotocol.io/introduction
- Concepts et architecture : https://modelcontextprotocol.io/docs/learn/architecture
