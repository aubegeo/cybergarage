---
title: "Ce que les devs applicatifs peuvent réapprendre du dev embarqué"
category: fpga
date: 2026-06-28
author: Geoffrey Aubert
tags: ["embarqué", "ingénierie", "sobriété", "architecture", "bonnes-pratiques"]
summary: "L'embarqué traîne une réputation de monde poussiéreux. En réalité, beaucoup de bonnes pratiques qu'on redécouvre côté applicatif y sont la norme depuis des décennies : sobriété, pensée système, gestion du risque. Tour d'horizon de ces leçons."
readTime: 7
---

# Ce que les devs applicatifs peuvent réapprendre du dev embarqué

Il y a un cliché tenace : l'embarqué serait un monde à part, peuplé de développeurs restés à l'âge de l'assembleur, à bricoler dans leur coin. La réalité est presque inverse. Beaucoup des « bonnes pratiques modernes » qu'on (re)découvre côté applicatif — sobriété des ressources, écoconception, pensée système — sont le quotidien de l'embarqué depuis vingt ans. Non par mode, mais par **contrainte**.

Et ces contraintes reviennent frapper à la porte du monde applicatif : la RAM coûte cher, un data center ne se construit plus d'un claquement de doigts, et le patron commence à regarder la facture cloud de travers. Voici ce que la culture embarquée peut nous réapprendre.

## La fin du « monde sans fin »

Pendant des années, le réflexe applicatif a été simple : besoin de plus de mémoire ? On ajoute de la RAM. Besoin de tenir la charge ? On empile des serveurs. Le matériel était une variable d'ajustement quasi gratuite.

Côté embarqué, ce luxe n'a jamais existé. On conçoit un **produit** : une carte avec un ratio prix/puissance calculé au plus juste, qu'on ne pourra pas remplacer tous les deux ans. Le logiciel doit **rentrer dans la boîte** qu'on lui a fabriquée, et y rester pendant 10 ou 20 ans. À cela s'ajoute la consommation : beaucoup d'objets tournent sur batterie, parfois inaccessibles (un pacemaker, un satellite). Optimiser n'est pas une option de confort, c'est la condition pour que le produit existe.

L'écoconception et le « green IT » formalisent aujourd'hui cette idée côté applicatif — y compris une « green AI » naissante, poussée par l'explosion du prix des tokens et des GPU. L'embarqué, lui, fait de la sobriété depuis toujours.

> L'exemple culte : sur *GTA Online*, un développeur a divisé par deux les temps de chargement en corrigeant un simple parsing — le jeu relisait 40 fois le même fichier au lieu d'une. L'algorithmique, ça compte. Les devs de jeux vidéo le savent ; les devs embarqués aussi.

## Penser système, pas programme

Un développeur embarqué ne livre pas « un programme ». Il livre un maillon : son code s'intègre dans une carte électronique, elle-même dans un boîtier mécanique, lui-même dans un écosystème connecté (gateways, autres équipements, cloud). Impossible de raisonner sans cette **big picture**.

Ce changement de focale est précieux côté applicatif, où l'on peut facilement coder « dans son coin » sans voir l'ensemble. Penser système, c'est intégrer dès le départ la modularité (pour faire évoluer sans tout réécrire), l'interopérabilité, et la durée de vie réelle.

La philosophie qui en découle est très proche de **KISS** et de l'esprit Unix : un outil par tâche, pas de superflu. En embarqué, on n'embarque que les briques strictement nécessaires — on prendra les algorithmes d'OpenSSL dont on a besoin, pas la bibliothèque entière. Si une tâche devient inutile, on retire l'outil et on le remplace. Une discipline que nos couches applicatives empilées (« code lasagne ») feraient bien de méditer.

## La boucle de rétroaction impitoyable

Avant que la CI/CD ne soit à la mode, l'embarqué avait déjà sa boucle obligatoire : on développe, on compile, on flashe… et si le code n'est pas assez optimisé, **ça crashe**. Pas de mémoire de rab : une fuite mal gérée, un dépassement, et le produit refuse de démarrer. Le matériel impose une rigueur que le serveur, lui, pardonne trop facilement.

Même logique sur l'ordonnancement des tâches : si l'affichage de la radio empêche le freinage d'urgence de s'exécuter, ça se voit immédiatement au test. La contrainte rend le défaut visible tôt.

Autre leçon, plus inconfortable : **tester en prod est un cauchemar** en embarqué. Reproduire l'environnement d'un client (firewalls, configs, matériels différents) est coûteux, et on n'entre pas dans une usine ou une centrale en disant « poussez-vous, je regarde ». Conséquence : on conçoit la **debuggabilité en amont**. Quels logs faudra-t-il pour diagnostiquer un bug à distance, des mois plus tard ? Une question que tout système applicatif devrait se poser avant la mise en production, pas après.

## Le risque change tout

Dans l'industrie, une erreur peut blesser. Un disjoncteur défaillant, un freinage qui ne répond pas : le coût n'est plus seulement économique. D'où une culture du **risque** formalisée par des matrices (probabilité × impact) qui décident si l'on s'autorise une fonctionnalité, si on la mitige, ou si elle devient obligatoire — la cybersécurité étant passée, récemment, dans la case « probabilité forte, impact fort ».

Cette exigence explique des choix qui peuvent surprendre :

- **Le cycle en V (voire en W)** survit, parce que les normes (avionique, automobile) imposent des phases de spécification et de validation qui se répondent finement. En pratique, beaucoup font un mix : petites itérations agiles, plus une grosse vérification finale.
- **V&V** : « vérification » (le produit respecte-t-il les specs ?) et « validation » (les fonctions attendues sont-elles atteintes ?) sont deux métiers distincts, souvent deux personnes différentes — sans compter les vérifications normatives (mécaniques, électriques…).
- **La validation formelle** : sur du critique (nucléaire, spatial), on réduit volontairement le code source pour pouvoir **prouver mathématiquement** que tous les cas problématiques sont couverts. On choisit parfois un vieux processeur précisément parce qu'on en connaît *tous* les bugs et comment les rattraper.

On peut trouver ça lourd. Mais l'idée de fond — **rendre le comportement prévisible et borné** — est universelle.

## IT et OT convergent (et c'est la sécurité qui les pousse)

Longtemps, deux mondes s'ignoraient : l'IT (serveurs, ERP) et l'OT (*Operational Technology* : machines-outils, onduleurs, capteurs agissant sur le monde physique). Jusqu'à ce que la cybersécurité fasse tomber le mur. Même des équipements *air-gapped* (isolés du réseau) ont été compromis — l'attaque des centrifugeuses d'enrichissement d'uranium reste l'exemple emblématique.

Aujourd'hui, la convergence va dans les deux sens. L'OT apprend de l'IT la connectivité et la data ; l'IT apprend de l'OT la sécurité bas niveau (secure boot, vérification de firmware au démarrage) et surtout la **stabilité**. Les mainframes, ces recoins discrets de l'IT, affichent des uptimes de décennies, patchés à la volée — bâtis dès l'origine dans un mindset de fiabilité absolue. C'est aussi pour ça qu'on peine tant à remplacer le COBOL des banques : la garantie de stabilité accumulée est difficile à reproduire, même avec des langages modernes comme Rust.

## Nain et Elfe, même combat

L'orateur résumait l'opposition avec une image : le dev embarqué en **nain** (solidité, sobriété, on taille à la hache pour ne garder que l'essentiel) et le dev applicatif en **elfe** (élégance, craft, harmonie du code). Deux forces complémentaires plutôt que deux camps.

Et il glissait une dernière mise en garde, en forme d'analogie historique : la bulle de l'IA ressemble moins à la bulle internet qu'à la **bulle ferroviaire** du XIXᵉ siècle — un emballement mêlant logiciel *et* matériel (GPU, data centers, électricité), une flambée des prix, des centaines d'acteurs qui s'endettent… et, souvent, l'État qui paie la facture à la fin. La sagesse du passé, là encore, pourrait nous éclairer.

La conclusion est limpide : plutôt que chacun dans son coin, faire **converger** le craft applicatif et la sobriété de l'embarqué. On y gagne des deux côtés.

## Source
Article inspiré de la conférence « [OBSERVATOIRE] — Ce que les développeurs "haut niveau" peuvent (re)apprendre des dev embarqués » de **DevQuest** (intervention de Damien, développeur embarqué senior) — https://www.youtube.com/watch?v=5lp7JjFbFas
