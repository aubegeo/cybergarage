---
title: "The Twelve-Factor App : 12 principes pour des applications prêtes pour le cloud"
category: pragmatic
date: 2026-07-10
author: Geoffrey Aubert
tags: ["architecture", "cloud", "devops", "bonnes-pratiques", "saas"]
summary: "La méthodologie Twelve-Factor App formalise en 12 principes (portabilité, scalabilité, parité dev/prod) ce qui distingue une application cloud-ready d'un logiciel qui souffrira en production, avec une revue des 12 facteurs d'après la source officielle."
readTime: 8
---

Pourquoi certaines applications se déploient sans douleur, scalent horizontalement et se comportent pareil en dev et en prod, tandis que d'autres deviennent un cauchemar dès qu'on quitte le poste du développeur ? En 2011, des ingénieurs de Heroku ont synthétisé, à partir de centaines de déploiements, une méthodologie devenue une référence : **The Twelve-Factor App** ([12factor.net](https://12factor.net)).

L'objectif, tel que défini par la source officielle, est de produire des applications qui utilisent des **formats déclaratifs** (onboarding rapide), **maximisent la portabilité** entre environnements, se **déploient sur le cloud** sans friction, **minimisent l'écart entre dev et prod** et **scalent sans refonte architecturale**, la méthode étant valable dans n'importe quel langage.

Voici les 12 facteurs, avec leur intitulé officiel.

## I. Codebase
*Une seule base de code suivie en gestion de version, plusieurs déploiements.* Un même code alimente le dev, la staging et la prod, qui sont des déploiements différents et non des dépôts différents.

## II. Dependencies
*Déclarer et isoler explicitement les dépendances.* L'application ne présume jamais qu'un paquet existe sur le système puisque tout est déclaré (manifeste) et isolé, ce qui met fin au « ça marche chez moi ».

## III. Config
*Stocker la configuration dans l'environnement.* Tout ce qui varie entre déploiements (identifiants, URLs de services, secrets) vit dans des variables d'environnement, **hors du code**, d'où le corollaire qu'on ne commite jamais un secret.

## IV. Backing Services
*Traiter les services externes comme des ressources attachées.* Base de données, file de messages, cache, service mail… sont des ressources interchangeables, référencées par une URL/configuration. On doit pouvoir remplacer une base locale par une base managée sans changer le code.

## V. Build, Release, Run
*Séparer strictement les étapes de build, de release et de run.* Le build produit un artefact, la release y associe une config, le run l'exécute. Chaque release est immuable et identifiable, ce qui rend les rollbacks triviaux.

## VI. Processes
*Exécuter l'application comme un ou plusieurs processus sans état.* Aucune donnée persistante ne reste en mémoire ou sur le disque local du processus, car tout état durable va dans un backing service, ce qui est **la** condition pour scaler horizontalement.

## VII. Port Binding
*Exposer les services via un port.* L'application est autonome puisqu'elle embarque son serveur et écoute sur un port, sans dépendre d'une injection dans un serveur applicatif externe.

## VIII. Concurrency
*Scaler via le modèle de processus.* On monte en charge en ajoutant des processus (horizontalement), plutôt qu'en grossissant un seul processus, les processus étant des citoyens de première classe.

## IX. Disposability
*Démarrage rapide et arrêt propre (graceful shutdown).* Les processus peuvent être démarrés ou arrêtés à tout moment. Un arrêt propre (finir la requête en cours, relâcher les ressources) rend l'application robuste aux redéploiements et à l'élasticité.

## X. Dev/Prod Parity
*Garder le développement, la staging et la production aussi proches que possible.* Il s'agit de réduire les écarts de temps (déployer souvent), de personnes (ceux qui écrivent déploient) et d'outils (même type de backing services partout), ce qui constitue le meilleur antidote aux bugs « seulement en prod ».

## XI. Logs
*Traiter les logs comme des flux d'événements.* L'application n'écrit pas dans des fichiers mais émet son flux d'événements sur la sortie standard, l'environnement d'exécution se chargeant de le router, l'agréger et l'archiver.

## XII. Admin Processes
*Exécuter les tâches d'administration comme des processus ponctuels.* Les migrations de base et les scripts de maintenance sont lancés dans le **même environnement** et avec le même code que l'application, sans être bricolés à part.

## Pourquoi ça reste d'actualité

Écrite avant l'ère Kubernetes, la méthodologie décrit en réalité l'ADN d'une application **cloud-native** : sans état, configurable par l'environnement, jetable, observable. La plupart des plateformes modernes (conteneurs, orchestrateurs, PaaS) ne font que **présupposer** ces 12 facteurs. Les respecter, c'est se donner la portabilité et la scalabilité *par construction* ; les ignorer, c'est accumuler une dette qui se paie au premier passage à l'échelle.

Pour un lead ou un architecte, les Twelve-Factor forment une excellente **grille de revue**, puisque passer une application au crible de ces 12 points révèle vite ses points de friction futurs.

## Sources
- **Source officielle** : *The Twelve-Factor App*, Adam Wiggins, https://12factor.net
- Détail de chaque facteur : https://12factor.net/ (un chapitre par facteur, ex. https://12factor.net/config)
