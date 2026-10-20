---
title: "Bluetooth Channel Sounding : mesurer une distance sans se faire piéger par un relais"
category: electronics
date: 2026-08-07
author: Geoffrey Aubert
tags: ["bluetooth", "channel-sounding", "rf", "iot", "sécurité"]
summary: "Introduite dans le Bluetooth Core Specification 6.0, la fonctionnalité Channel Sounding permet de mesurer une distance centimétrique entre deux appareils tout en résistant aux attaques par relais. Cet article la décrypte à partir des documents officiels du Bluetooth SIG."
readTime: 8
---

Un badge de voiture sans clé qui déverrouille le véhicule alors qu'il est resté posé sur la table de la cuisine, à vingt mètres de là, illustre le principe d'une attaque par relais (« relay attack »), qui exploite le fait qu'un système Bluetooth ou RFID classique ne sait pas *vraiment* mesurer une distance puisqu'il se contente d'estimer, via la puissance du signal reçu (RSSI), si l'appareil est « proche ». Un attaquant équipé de deux boîtiers radio peut relayer le signal entre le badge et la voiture sans jamais le posséder physiquement.

Le Bluetooth SIG (l'organisme qui édite la norme Bluetooth) a introduit une réponse technique à ce problème dans le **Bluetooth Core Specification 6.0**, à savoir la fonctionnalité **Channel Sounding**. Elle permet à deux appareils Bluetooth Low Energy de calculer leur distance réelle avec une précision de l'ordre de la dizaine de centimètres, tout en résistant à ce type d'attaque. Cet article s'appuie sur les pages techniques officielles du Bluetooth SIG consacrées à Channel Sounding et à l'aperçu du Core 6.0.

## Le problème : le RSSI ne mesure pas une distance

Historiquement, un appareil Bluetooth qui veut estimer la proximité d'un autre appareil se base sur l'atténuation du signal radio reçu. Cette approche a deux défauts majeurs : elle est peu précise (les réflexions, obstacles et interférences font varier le RSSI sans rapport avec la distance réelle) et elle est trivialement falsifiable, puisqu'un attaquant peut amplifier ou relayer le signal pour faire croire à une proximité qui n'existe pas.

Channel Sounding répond aux deux problèmes à la fois, en traitant la précision par des mesures physiques directes de propagation radio et la sécurité par un mécanisme cryptographique intégré au protocole.

## Deux méthodes de mesure combinées

La spécification définit deux techniques complémentaires, que les documents officiels du SIG décrivent ainsi :

Dans le **Phase-Based Ranging (PBR)**, un appareil « initiateur » émet un signal vers un « réflecteur » sur plusieurs fréquences successives ; le réflecteur renvoie le signal et la distance est calculée à partir des différences de phase mesurées entre signal émis et signal reçu, à chacune de ces fréquences.

Dans le **Round-Trip Time (RTT)**, l'initiateur envoie des paquets brouillés cryptographiquement vers le réflecteur, qui les retourne ; la distance se déduit du temps de trajet aller-retour du paquet. Le SIG présente cette méthode comme une « secure distance bounding », une vérification indépendante servant de contre-mesure contre les attaques de type homme-du-milieu (MITM).

C'est la combinaison des deux qui fait la force du mécanisme, le PBR apportant la précision fine tandis que le RTT apporte la garantie cryptographique qu'aucun tiers n'a pu relayer ou retarder artificiellement l'échange. Le SIG parle d'une architecture de « sécurité robuste et multicouche ».

## Ce que le Core 6.0 ajoute concrètement au protocole

L'aperçu technique du Core Specification 6.0 détaille les briques ajoutées pour rendre Channel Sounding possible :

- **Une nouvelle couche physique**, la PHY *LE 2M 2BT* (BT = 2.0), conçue pour mieux résister aux attaques au niveau physique.
- **Un canal et un lien physiques dédiés**, à savoir le *Channel Sounding Physical Channel* et le *Channel Sounding Physical Link*.
- **Une largeur de canal RF resserrée**, avec 72 canaux d'1 MHz chacun (contre 2 MHz pour le Bluetooth classique), ce qui repousse l'ambiguïté de mesure de distance jusqu'à environ 150 mètres.
- **Trois algorithmes de sélection de canal** (CSA #3a en mode 0, CSA #3b et CSA #3c en option pour les étapes hors mode 0), qui déterminent l'ordre dans lequel les fréquences sont testées.
- **Un cadre de sécurité dédié**, comprenant des flux de bits randomisés pour le brouillage RTT, un générateur de nombres pseudo-aléatoires déterministe (DRBG) et une métrique appelée *Normalized Attack Detector Metric* (NADM) qui aide à détecter une tentative de manipulation du signal.

Sur le plan architectural, l'échange se déroule sur une connexion ACL chiffrée, en topologie 1:1 entre un rôle *Initiator* et un rôle *Reflector*, avec une hiérarchie temporelle en quatre niveaux : *procédures → événements → sous-événements → étapes* (« steps »). C'est à ce niveau le plus fin, l'étape, qu'une mesure PBR ou RTT individuelle est effectuée.

Le contrôleur radio transmet ensuite ces mesures brutes à la couche applicative via l'interface HCI (Host Controller Interface), laissant le calcul final de distance à la charge du système hôte, la spécification ne définissant volontairement pas d'algorithme unique afin de laisser chaque implémentation adapter le calcul à son cas d'usage.

## Précision et portée annoncées

D'après les documents officiels du SIG, les premières implémentations de Channel Sounding visent une précision de l'ordre de **±20 cm**, avec un objectif à terme de **10 cm**, sur une portée maximale théorique de **150 mètres** en pleine puissance d'émission des deux appareils. À titre de comparaison, une estimation par RSSI seul se compte en général en mètres plutôt qu'en centimètres.

## Cas d'usage visés

Le Bluetooth SIG met en avant plusieurs familles d'applications pour cette fonctionnalité :

- **Clés numériques** (« digital keys ») pour voitures, portes, portails, coffres et vélos en libre-service, où le verrou ne s'ouvre que si l'appareil autorisé est physiquement à portée mesurée et non simplement « détecté ».
- **Localisation d'objets** (type *Find My*), avec une distance réelle plutôt qu'une simple estimation de proximité.
- **Interfaces homme-machine (HMI) et sécurité personnelle**, avec une restriction d'accès à une machine ou une zone en fonction de la distance réelle de l'opérateur.
- **Appareils intelligents**, avec un changement automatique d'état (actif/inactif) selon la proximité effective.

Le calendrier communiqué par le SIG prévoyait l'arrivée des briques technologiques habilitantes (puces, modules, piles logicielles) à partir de 2025, suivie des produits finis intégrant la fonctionnalité (téléphones, tags, porte-clés) la même année.

## Ce que ça change, côté ingénierie électronique

Pour qui conçoit un objet connecté intégrant du Bluetooth LE, Channel Sounding a plusieurs implications concrètes :

- **Ce n'est pas une fonctionnalité logicielle pure**, car elle exige un support radio au niveau du contrôleur (nouvelle PHY, canal dédié), donc un choix de puce/module Bluetooth compatible Core 6.0 dès la conception matérielle.
- **La sécurité est intégrée au protocole et non ajoutée en couche applicative**, puisque le brouillage cryptographique du RTT fait partie de la procédure radio elle-même, ce qui réduit la surface d'attaque comparé à une vérification de distance implémentée « à la main » au-dessus d'un simple RSSI.
- **Le calcul final reste ouvert**, la spécification ne figeant pas l'algorithme de distance exploitant les mesures PBR/RTT, si bien que deux implémentations conformes peuvent afficher des précisions différentes, ce qui est un point à vérifier lors du choix d'un composant.

Channel Sounding illustre une approche qu'on retrouve dans plusieurs standards radio récents, dans laquelle, plutôt que de corriger les failles d'une métrique existante (le RSSI) par des heuristiques applicatives, la norme déplace la garantie de sécurité au niveau physique et protocolaire, là où elle peut réellement être vérifiée.

## Sources
- **Source officielle** : Bluetooth SIG, *Bluetooth® Channel Sounding*, https://www.bluetooth.com/learn-about-bluetooth/feature-enhancements/channel-sounding/
- Bluetooth SIG, *Bluetooth® Core Specification 6.0 feature overview* (v1.1, 15 janvier 2025, Martin Woolley), https://www.bluetooth.com/core-specification-6-feature-overview/
- Bluetooth SIG, Liste des spécifications officielles (Core Specification, addenda, suppléments), https://www.bluetooth.com/specifications/specs/
