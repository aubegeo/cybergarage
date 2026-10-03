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

Il y a un cliché tenace selon lequel l'embarqué serait un monde à part, peuplé de développeurs restés à l'âge de l'assembleur, à bricoler dans leur coin. La réalité est pourtant presque inverse, car beaucoup des « bonnes pratiques modernes » qu'on (re)découvre côté applicatif (sobriété des ressources, écoconception, pensée système) sont le quotidien de l'embarqué depuis vingt ans, non par mode mais par **contrainte**.

Et ces contraintes reviennent frapper à la porte du monde applicatif : la RAM coûte cher, un data center ne se construit plus d'un claquement de doigts et le patron commence à regarder la facture cloud de travers. Voici ce que la culture embarquée peut nous réapprendre.

## La fin du « monde sans fin »

Pendant des années, le réflexe applicatif a été de répondre à un besoin de mémoire en ajoutant de la RAM, puis à un besoin de tenir la charge en empilant des serveurs, si bien que le matériel faisait figure de variable d'ajustement quasi gratuite.

Côté embarqué, ce luxe n'a jamais existé puisqu'on y conçoit un **produit**, c'est-à-dire une carte avec un ratio prix/puissance calculé au plus juste, qu'on ne pourra pas remplacer tous les deux ans. Le logiciel doit **rentrer dans la boîte** qu'on lui a fabriquée et y rester pendant 10 ou 20 ans. À cela s'ajoute la consommation, car beaucoup d'objets tournent sur batterie, parfois inaccessibles (un pacemaker, un satellite), de sorte qu'optimiser n'est pas une option de confort mais la condition pour que le produit existe.

L'écoconception et le « green IT » formalisent aujourd'hui cette idée côté applicatif, y compris avec une « green AI » naissante, poussée par l'explosion du prix des tokens et des GPU, alors que l'embarqué, lui, fait de la sobriété depuis toujours.

> Sur *GTA Online*, l'exemple culte, un développeur a divisé par deux les temps de chargement en corrigeant un simple parsing, puisque le jeu relisait 40 fois le même fichier au lieu d'une. L'algorithmique compte, ce que savent aussi bien les devs de jeux vidéo que les devs embarqués.

## Penser système, pas programme

Un développeur embarqué ne livre pas « un programme » mais un maillon, puisque son code s'intègre dans une carte électronique, elle-même dans un boîtier mécanique, lui-même dans un écosystème connecté (gateways, autres équipements, cloud), de sorte qu'il est impossible de raisonner sans cette **big picture**.

Ce changement de focale est précieux côté applicatif, où l'on peut facilement coder « dans son coin » sans voir l'ensemble. Penser système, c'est intégrer dès le départ la modularité (pour faire évoluer sans tout réécrire), l'interopérabilité et la durée de vie réelle.

La philosophie qui en découle est très proche de **KISS** et de l'esprit Unix, qui veut un outil par tâche et pas de superflu. En embarqué, on n'embarque que les briques strictement nécessaires, si bien qu'on prendra les algorithmes d'OpenSSL dont on a besoin plutôt que la bibliothèque entière. Si une tâche devient inutile, on retire l'outil et on le remplace, une discipline que nos couches applicatives empilées (« code lasagne ») feraient bien de méditer.

## La boucle de rétroaction impitoyable

Avant que la CI/CD ne soit à la mode, l'embarqué avait déjà sa boucle obligatoire : on développe, on compile, on flashe… et si le code n'est pas assez optimisé, **ça crashe**, car il n'y a pas de mémoire de rab et qu'une fuite mal gérée ou un dépassement suffit à ce que le produit refuse de démarrer. Le matériel impose une rigueur que le serveur, lui, pardonne trop facilement.

Même logique sur l'ordonnancement des tâches, puisque si l'affichage de la radio empêche le freinage d'urgence de s'exécuter, ça se voit immédiatement au test, la contrainte rendant le défaut visible tôt.

Une autre leçon, plus inconfortable, est que **tester en prod est un cauchemar** en embarqué. Reproduire l'environnement d'un client (firewalls, configs, matériels différents) est coûteux et on n'entre pas dans une usine ou une centrale en disant « poussez-vous, je regarde », si bien qu'on conçoit la **debuggabilité en amont**. Quels logs faudra-t-il pour diagnostiquer un bug à distance, des mois plus tard ? Cette question, tout système applicatif devrait se la poser avant la mise en production plutôt qu'après.

## Le risque change tout

Dans l'industrie, une erreur peut blesser, qu'il s'agisse d'un disjoncteur défaillant ou d'un freinage qui ne répond pas, de sorte que le coût n'est plus seulement économique. D'où une culture du **risque** formalisée par des matrices (probabilité × impact) qui décident si l'on s'autorise une fonctionnalité, si on la mitige ou si elle devient obligatoire, la cybersécurité étant passée récemment dans la case « probabilité forte, impact fort ».

Cette exigence explique des choix qui peuvent surprendre :

- **Le cycle en V (voire en W)** survit, parce que les normes (avionique, automobile) imposent des phases de spécification et de validation qui se répondent finement. En pratique, beaucoup font un mix de petites itérations agiles, plus une grosse vérification finale.
- **V&V** regroupe la « vérification » (le produit respecte-t-il les specs ?) et la « validation » (les fonctions attendues sont-elles atteintes ?), deux métiers distincts, souvent deux personnes différentes, sans compter les vérifications normatives (mécaniques, électriques…).
- **La validation formelle** intervient sur du critique (nucléaire, spatial), où l'on réduit volontairement le code source pour pouvoir **prouver mathématiquement** que tous les cas problématiques sont couverts. On choisit parfois un vieux processeur précisément parce qu'on en connaît *tous* les bugs et comment les rattraper.

On peut trouver ça lourd, mais l'idée de fond, **rendre le comportement prévisible et borné**, est universelle.

## IT et OT convergent (et c'est la sécurité qui les pousse)

Longtemps, deux mondes s'ignoraient : l'IT (serveurs, ERP) et l'OT (*Operational Technology* : machines-outils, onduleurs, capteurs agissant sur le monde physique), jusqu'à ce que la cybersécurité fasse tomber le mur. Même des équipements *air-gapped* (isolés du réseau) ont été compromis, l'attaque des centrifugeuses d'enrichissement d'uranium restant l'exemple emblématique.

Aujourd'hui, la convergence va dans les deux sens, puisque l'OT apprend de l'IT la connectivité et la data tandis que l'IT apprend de l'OT la sécurité bas niveau (secure boot, vérification de firmware au démarrage) et surtout la **stabilité**. Les mainframes, ces recoins discrets de l'IT, affichent des uptimes de décennies, patchés à la volée, bâtis dès l'origine dans un mindset de fiabilité absolue. C'est aussi pour ça qu'on peine tant à remplacer le COBOL des banques, car la garantie de stabilité accumulée est difficile à reproduire, même avec des langages modernes comme Rust.

## Nain et Elfe, même combat

L'orateur résumait l'opposition avec l'image du dev embarqué en **nain** (solidité, sobriété, on taille à la hache pour ne garder que l'essentiel) et du dev applicatif en **elfe** (élégance, craft, harmonie du code), deux forces complémentaires plutôt que deux camps.

Et il glissait une dernière mise en garde, en forme d'analogie historique, selon laquelle la bulle de l'IA ressemble moins à la bulle internet qu'à la **bulle ferroviaire** du XIXᵉ siècle, un emballement mêlant logiciel *et* matériel (GPU, data centers, électricité), une flambée des prix, des centaines d'acteurs qui s'endettent… et, souvent, l'État qui paie la facture à la fin. La sagesse du passé, là encore, pourrait nous éclairer.

La conclusion est limpide puisque, plutôt que chacun dans son coin, il faut faire **converger** le craft applicatif et la sobriété de l'embarqué, de sorte qu'on y gagne des deux côtés.

## Source
Article inspiré de la conférence « [OBSERVATOIRE] — Ce que les développeurs "haut niveau" peuvent (re)apprendre des dev embarqués » de **DevQuest** (intervention de Damien, développeur embarqué senior), https://www.youtube.com/watch?v=5lp7JjFbFas
