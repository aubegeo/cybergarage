---
title: "QUIC (RFC 9000) : le transport qui remplace TCP sous HTTP/3"
category: telecom
date: 2026-09-03
author: Geoffrey Aubert
tags: ["QUIC", "RFC 9000", "HTTP/3", "UDP", "réseaux", "transport"]
summary: "QUIC est le protocole de transport défini par la RFC 9000 : multiplexage sans blocage en tête de ligne, migration de connexion, 0-RTT. Comment il fonctionne, sourcé sur le texte officiel de l'IETF."
readTime: 9
---

## Le problème que QUIC vient résoudre

Sur le blog, on a déjà couvert [HTTP/3 (RFC 9114)](/article/telecom/http-3-quic-rfc-9114), qui définit comment le protocole HTTP s'exprime au-dessus de QUIC. Mais HTTP/3 ne fait que consommer un transport, puisque c'est QUIC, spécifié par la RFC 9000 de l'IETF, qui fait le vrai travail de plomberie réseau. Comprendre QUIC, c'est comprendre pourquoi HTTP/3 tient les promesses qu'il fait.

La RFC 9000 le résume ainsi dès son abstract :

> « This document defines the core of the QUIC transport protocol. QUIC provides applications with flow-controlled streams for structured communication, low-latency connection establishment, and network path migration. »

La RFC annonce donc trois promesses, à savoir des flux (streams) avec contrôle de flux, un établissement de connexion à faible latence et une capacité de migration entre chemins réseau, le tout par-dessus UDP alors que TCP dominait le transport fiable depuis des décennies.

## Pourquoi UDP et pas une évolution de TCP

La RFC est explicite sur le choix architectural, puisque QUIC encapsule ses propres paquets dans des datagrammes UDP « to better facilitate deployment in existing systems and networks ». TCP est implémenté dans le noyau des systèmes d'exploitation et dans d'innombrables middleboxes (pare-feux, NAT, load balancers) qui interprètent son comportement. Modifier TCP en profondeur (par exemple pour éliminer le head-of-line blocking) nécessiterait de faire évoluer cette infrastructure partout à la fois, un chantier quasi impossible à l'échelle d'Internet.

En s'appuyant sur UDP, QUIC peut être implémenté entièrement en espace utilisateur (dans une bibliothèque applicative) et déployé progressivement, sans dépendre d'une mise à jour des systèmes d'exploitation ou des équipements réseau intermédiaires. C'est un choix pragmatique bien plus qu'un choix de performance brute d'UDP en tant que tel.

La RFC précise aussi que QUIC « authenticates the entirety of each packet and encrypts as much of each packet as is practical », de sorte que la sécurité n'est pas une option ajoutée après coup mais une propriété structurelle. Le handshake QUIC intègre directement celui de TLS 1.3 :

> « QUIC integrates the TLS handshake [TLS13], although using a customized framing for protecting packets. »

## Les streams : le vrai changement par rapport à TCP

TCP expose une seule connexion comme un unique flux d'octets ordonné. Si un paquet se perd, tout ce qui suit (même des données appartenant logiquement à une requête différente) reste bloqué en attendant la retransmission. C'est le fameux head-of-line blocking, que HTTP/2 avait tenté de contourner en multiplexant plusieurs flux logiques sur une seule connexion TCP, sans y parvenir complètement puisque la perte reste au niveau TCP, donc globale à la connexion.

QUIC résout ce problème à la racine en définissant nativement plusieurs streams indépendants à l'intérieur d'une même connexion :

> « Streams in QUIC provide a lightweight, ordered byte-stream abstraction to an application. Streams can be unidirectional or bidirectional. [...] QUIC does not provide any means of ensuring ordering between bytes on different streams. »

Chaque stream est identifié par un entier 62 bits, dont les deux bits de poids faible encodent à la fois qui l'a initié et son type :

| Bits | Type de stream |
|------|-----------------|
| 0x00 | Initié par le client, bidirectionnel |
| 0x01 | Initié par le serveur, bidirectionnel |
| 0x02 | Initié par le client, unidirectionnel |
| 0x03 | Initié par le serveur, unidirectionnel |

Concrètement, la perte d'un paquet UDP ne bloque que les données du ou des streams qu'il transportait, si bien que les autres streams de la même connexion continuent d'avancer. C'est ce mécanisme qui permet à un navigateur de charger plusieurs ressources HTTP/3 en parallèle sur une seule connexion QUIC sans que la perte d'un paquet pour l'une ne gèle les autres.

La RFC précise qu'un stream peut être ouvert, alimenté et fermé par une seule frame `STREAM` et que « streams can also be long-lived and can last the entire duration of a connection », ce qui rend la création d'un stream délibérément peu coûteuse.

## L'identifiant de connexion : la clé de la migration

Sous TCP, une connexion est définie par un quadruplet (IP source, port source, IP destination, port destination). Changer de réseau (passer du Wi-Fi à la 4G, par exemple) change l'IP source et casse donc la connexion TCP.

QUIC découple l'identité de la connexion de l'adresse réseau grâce au Connection ID :

> « The primary function of a connection ID is to ensure that changes in addressing at lower protocol layers (UDP, IP) do not cause packets for a QUIC connection to be delivered to the wrong endpoint. »

Chaque endpoint choisit les identifiants que son pair doit utiliser pour lui envoyer des paquets, indépendamment de l'adresse IP ou du port. Cela ouvre la voie à la migration de connexion (section 9 de la RFC), de sorte qu'un client peut continuer d'utiliser la même connexion QUIC après un changement de réseau, sans reconstruire de handshake.

La RFC est cependant stricte sur qui peut migrer :

> « This document limits migration of connections to new client addresses [...]. Clients are responsible for initiating all migrations. »

Une migration n'est validée qu'après une procédure de validation de chemin (`PATH_CHALLENGE` / `PATH_RESPONSE`), pour éviter qu'un attaquant n'utilise la migration comme vecteur d'amplification de trafic vers une victime usurpée. Et pour des raisons de vie privée, la RFC recommande d'utiliser des Connection ID différents sur chaque chemin réseau, afin qu'un observateur passif ne puisse pas corréler l'activité d'un même utilisateur entre deux réseaux :

> « Using a stable connection ID on multiple network paths would allow a passive observer to correlate activity between those paths. »

## Le handshake et le 0-RTT

QUIC fusionne ce que TCP + TLS traitent en deux étapes séparées (poignée de main TCP puis négociation TLS) en une seule phase. La RFC décrit une option encore plus agressive, le 0-RTT, qui permet au client d'envoyer des données applicatives dès le premier paquet, avant même d'avoir reçu de réponse du serveur, à condition d'avoir déjà communiqué avec lui par le passé (via un ticket de session).

Le compromis est documenté sans ambiguïté :

> « 0-RTT allows application data to be sent by a client before receiving a response from the server. However, 0-RTT provides no protection against replay attacks. »

Autrement dit, le 0-RTT échange une garantie de sécurité (résistance au rejeu) contre une latence réduite. C'est pour cette raison que les frameworks qui exposent le 0-RTT (comme les serveurs HTTP/3) le réservent en général aux requêtes idempotentes.

Pour que les algorithmes de détection de perte restent cohérents, la RFC organise les numéros de paquets en trois espaces distincts, à savoir Initial, Handshake et Application data (ce dernier regroupant à la fois les paquets 0-RTT et 1-RTT), ce que la RFC justifie ainsi :

> « 0-RTT and 1-RTT data exist in the same packet number space to make loss recovery algorithms easier to implement between the two packet types. »

## Ce que QUIC ne fait pas tout seul

La portée exacte de la RFC 9000 mérite d'être notée, puisqu'elle définit le cœur du transport (streams, connexions, migration, structure des paquets), mais délègue explicitement deux sujets à des documents compagnons :

> « An algorithm for detecting and recovering from loss of data is described in Section 6 of [QUIC-RECOVERY]. QUIC depends on congestion control to avoid network congestion. An exemplary congestion control algorithm is described in Section 7 of [QUIC-RECOVERY]. »

Ces documents compagnons sont la RFC 9002 (perte et contrôle de congestion) et la RFC 9001 (intégration de TLS). QUIC n'est donc pas un protocole monolithique mais une famille de RFC qui se répondent : 9000 pour le transport, 9001 pour la sécurité, 9002 pour la fiabilité et 9114 pour le mapping HTTP/3 déjà couvert sur ce blog.

## Ce qu'il faut retenir

QUIC n'est pas « TCP plus rapide » mais une réponse structurelle à des limites que TCP ne peut pas résoudre sans casser des décennies de déploiement, à savoir le head-of-line blocking au niveau transport, le couplage rigide entre connexion et adresse IP et la lenteur du handshake en deux temps. En s'appuyant sur UDP et en intégrant TLS 1.3 nativement, QUIC réalloue ces responsabilités à l'espace applicatif, ce qui explique aussi pourquoi son adoption a été rapide malgré la complexité additionnelle, puisque les navigateurs et les serveurs peuvent l'implémenter et le faire évoluer sans attendre les mises à jour des systèmes d'exploitation ou des équipements réseau intermédiaires.

## Sources

- RFC 9000, *QUIC: A UDP-Based Multiplexed and Secure Transport*, IETF, Standard proposé (2021), [https://www.rfc-editor.org/rfc/rfc9000](https://www.rfc-editor.org/rfc/rfc9000)
- RFC 9001, *Using TLS to Secure QUIC*, [https://www.rfc-editor.org/rfc/rfc9001](https://www.rfc-editor.org/rfc/rfc9001)
- RFC 9002, *QUIC Loss Detection and Congestion Control*, [https://www.rfc-editor.org/rfc/rfc9002](https://www.rfc-editor.org/rfc/rfc9002)
- RFC 9114, *HTTP/3*, déjà traitée sur ce blog, [https://www.rfc-editor.org/rfc/rfc9114](https://www.rfc-editor.org/rfc/rfc9114)
