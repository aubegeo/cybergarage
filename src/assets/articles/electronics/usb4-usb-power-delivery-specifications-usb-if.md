---
title: "USB4 et USB Power Delivery : ce que dit vraiment la spécification USB-IF"
category: electronics
date: 2026-09-14
author: Geoffrey Aubert
tags: ["usb", "usb4", "usb-c", "electronique"]
summary: "Décryptage, à partir des pages officielles USB-IF, de ce que couvrent réellement les spécifications USB4 et USB Power Delivery : bande passante, partage de lien, tensions et sens de la puissance."
readTime: 8
---

Un câble USB-C aujourd'hui peut transporter de la vidéo 8K, un réseau, du stockage rapide et 240W
de puissance en même temps, dans les deux sens, sur le même fil. Ce n'est pas du marketing mais littéralement ce que définissent deux spécifications maintenues par l'USB Implementers Forum
(USB-IF), l'organisme qui gouverne le standard USB, à savoir **USB4** pour la partie données et **USB Power Delivery (USB PD)** pour la partie énergie. Ces deux textes sont trop souvent résumés en une
ligne (« 80 Gbps », « 240W ») sans qu'on explique ce qu'ils changent structurellement. Voici ce que
disent les pages officielles [usb.org/usb4](https://www.usb.org/usb4) et
[usb.org/usb-charger-pd](https://www.usb.org/usb-charger-pd), sans extrapolation.

## USB4 : une architecture, pas juste un débit

La page officielle décrit USB4 comme « a major update to deliver the next generation of USB
architecture » puis « enabling the highest USB bandwidth available and extending USB Type-C® performance »
([usb.org/usb4](https://www.usb.org/usb4)). Le point important, souvent perdu dans la
communication grand public réduite au chiffre « 80 Gbps », c'est que USB-IF présente d'abord USB4 comme une **architecture** et que cette architecture « complements and builds upon the existing USB 3.2 and 2.0 architectures », de sorte qu'elle ne les remplace pas et vient plutôt se superposer à elles.

Un autre fait central et souvent oublié tient à ce que la source précise que, « based on the Thunderbolt™ protocol
specification contributed by the Intel Corporation, USB4 doubles the maximum aggregate bandwidth of
USB and enables multiple simultaneous data and display protocols ». USB4 hérite donc directement de
la couche protocolaire de Thunderbolt, apportée par Intel au consortium.

Sur le plan des performances, la source cite trois « key characteristics » :
- « Two-lane operation using existing USB Type-C cables and up to 80 Gbps operation over 80 Gbps
certified cables » ;
- « Multiple data and display protocols to efficiently share the maximum aggregate bandwidth over
the bus » ;
- « Backwards compatibility with all previous versions of USB ».

Le point le plus structurant techniquement est le deuxième, puisque USB4 « defines a method to dynamically
share a single high-speed link with multiple end device types to best serve the transfer of data
by type and application ». Concrètement, la spécification ne réserve pas une bande passante fixe à
chaque usage (données, affichage, réseau) mais définit un mécanisme de partage dynamique d'un
lien unique, réparti selon le type de trafic et l'application. C'est ce mécanisme qui permet, par
exemple, à un même port de servir simultanément de sortie d'écran et de bus de stockage sans que
l'un bloque l'autre par une allocation statique.

*Je précise à titre de contexte personnel, qui ne vient pas de la source, que c'est la même logique de « lien logique partagé au-dessus d'un lien physique unique » qu'on retrouve dans des bus internes modernes ou dans le multiplexage réseau. L'idée n'est pas propre à USB4 mais l'USB-IF l'implémente ici au niveau du
connecteur Type-C, ce qui est nouveau pour l'écosystème USB grand public.*

La source précise aussi, à propos de la compatibilité descendante d'USB4, que « Compatibility with existing
USB 3.2, USB 2.0, and Thunderbolt 3 hosts and devices is supported, and the resulting connection
scales to the best mutual capability of the devices being connected. » Autrement dit, brancher un
périphérique USB4 sur un hôte plus ancien ne casse rien puisque la connexion se négocie au plus petit
dénominateur commun compatible.

## L'écran, un cas d'usage explicitement traité

Le rôle du port USB-C comme sortie vidéo n'est pas un usage secondaire toléré par la spécification mais un cas explicitement anticipé, puisque celle-ci indique que « As the USB Type-C connector has evolved into the role as the
external display port of many host products, the USB4 specification provides the host the ability
to optimally scale allocations for display data flow. » L'USB-IF reconnaît donc que l'affichage est
devenu un usage central du connecteur Type-C et conçoit le partage dynamique de bande passante
d'USB4 pour que l'hôte puisse ajuster finement l'allocation dédiée à la vidéo selon les besoins.

## Où trouver le texte de référence

Pour qui veut vérifier la version exacte en vigueur plutôt que se fier à une page marketing, le
catalogue officiel [usb.org/documents](https://www.usb.org/documents) référence le document
téléchargeable correspondant, à savoir « USB4 Specification November 2025.zip », identifié comme « USB4®
Specification v2.0 », classé dans la catégorie « Specification / Base Specification — USB4 ». C'est ce document plutôt que la page de présentation qui fait foi sur le plan technique.

## USB Power Delivery : d'un port qui charge à un port qui négocie

Côté énergie, la page officielle situe le changement de paradigme dès la première phrase, en écrivant que « USB has
evolved from a data interface capable of supplying limited power to a primary provider of power
with a data interface » ([usb.org/usb-charger-pd](https://www.usb.org/usb-charger-pd)). USB Power
Delivery est décrit comme la spécification qui « enables the maximum functionality of USB by
providing more flexible power delivery along with data over a single cable », avec pour objectif
déclaré d'« operate with and build on the existing USB ecosystem » plutôt que de le remplacer.

La montée en puissance récente est datée précisément par la source, qui indique que « Announced in 2021, the USB PD
Revision 3.1 specification is a major update to enable delivering up to 240W of power over full
featured USB Type-C® cable and connector. Prior to this update, USB PD was limited to 100W using a
solution based on 20V using USB Type-C cables rated at 5A. » Le saut de 100W à 240W ne vient donc pas
d'un simple ajustement de courant, mais de l'introduction de nouvelles tensions fixes plus élevées, la source précisant que « New 28V, 36V, and 48V fixed voltages enable up to 140W, 180W and 240W power levels, respectively. »
Un mode complémentaire existe pour les besoins intermédiaires, puisque « An adjustable voltage supply mode
allows the device being powered an ability to request intermediate voltages between 15V and up to
the maximum available fixed voltage of the charger. » La source précise aussi que ce saut de
puissance s'accompagne d'une mise à jour de la spécification connecteur elle-même, puisque « The USB
Type-C specification has also been updated to Release 2.1 to define 240W cable requirements, [...] »

## La puissance n'a plus de sens fixe

Le changement le plus important pour qui conçoit du matériel n'est pas le chiffre de 240W, mais une
phrase courte de la spécification, qui dit que « Power direction is no longer fixed. This enables the product
with the power (Host or Peripheral) to provide the power. » Un port USB-C n'est donc plus par nature
« alimentant » ou « alimenté », puisque le rôle se négocie. L'USB-IF illustre ce principe par des exemples
concrets tirés de la page officielle :
- « A monitor with a supply from the wall can power, or charge, a laptop while still displaying » ;
- « USB power bricks or chargers are able to pass power through a laptop's USB ports » ;
- « Battery powered devices can get increased charging current from a hub and then give it back
temporarily when the user's HDD requires to spin up. »

Ce dernier exemple illustre aussi un autre principe cité par la source, selon lequel USB PD permet d'« optimize
power management across multiple peripherals by allowing each device to take only the power it
requires, and to get more power when required for a given application », de sorte que la puissance allouée n'est pas figée à la connexion et se renégocie selon le besoin instantané. La source ajoute enfin que
« Power Delivery is designed to co-exist with standard USB Battery Charging implementations » et
qu'elle « is covered by the relevant adopters agreements for either USB 2.0, USB 3.0, or USB4
depending on the specification implemented », de sorte que PD n'est pas un protocole propre à USB4 mais s'applique transversalement selon la base USB utilisée.

## Une révision de plus depuis la page de présentation

*Par honnêteté temporelle, il faut signaler que la page de présentation encore en ligne met en avant USB PD Revision 3.1 comme « major update ». Le catalogue officiel de documents référence pourtant déjà une
révision plus récente, « USB_PD_R3.2_V1.2(3).zip — USB Power Delivery Specification Revision 3.2
Version 1.2 », classée comme base specification courante. La source consultée ne détaille pas le
contenu technique de cette révision 3.2, de sorte que je la signale comme une évolution connue, sans
inventer ce qu'elle change concrètement par rapport à la 3.1.*

## Ce qu'il faut retenir

USB4 et USB Power Delivery répondent à deux questions distinctes mais complémentaires, à savoir comment faire circuler plusieurs types de trafic à haute vitesse sur un lien unique partagé dynamiquement et comment faire circuler de la puissance électrique importante dans une direction
qui n'est plus fixée par construction. Les deux spécifications sont conçues pour cohabiter avec
l'existant plutôt que pour l'effacer, avec une compatibilité descendante côté USB4 et une coexistence avec le Battery Charging classique côté PD. C'est cette logique d'empilement progressif, plus que le
chiffre brut de 80 Gbps ou de 240W, qui explique pourquoi un même connecteur USB-C peut aujourd'hui
servir indifféremment de port d'écran, de bus de stockage ou de câble d'alimentation, parfois les trois en même temps sur le même câble.

## Sources
- **Spécification USB4** : USB Implementers Forum, page officielle "USB4®", https://www.usb.org/usb4
- **USB Power Delivery** : USB Implementers Forum, page officielle "USB Charger (USB Power Delivery)", https://www.usb.org/usb-charger-pd
- **Document Library USB-IF** : catalogue officiel des spécifications (USB4 Specification v2.0, USB PD Revision 3.2), https://www.usb.org/documents
