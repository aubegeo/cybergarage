---
title: "HTTP/3 et QUIC : pourquoi le web abandonne TCP"
category: telecom
date: 2026-07-10
author: Geoffrey Aubert
tags: ["réseau", "http3", "quic", "performance", "tls"]
summary: "HTTP/3 (RFC 9114) transporte la sémantique HTTP non plus sur TCP, mais sur QUIC, au-dessus d'UDP. À la clé : la fin du head-of-line blocking et une sécurité intégrée. Décryptage à partir de la RFC officielle."
readTime: 7
---

# HTTP/3 et QUIC : pourquoi le web abandonne TCP

Pendant trente ans, le web a reposé sur une constante : HTTP au-dessus de TCP. HTTP/1.1, puis HTTP/2, ont fait évoluer la couche applicative, mais le transport restait TCP. **HTTP/3** rompt avec cette habitude : il conserve la sémantique HTTP mais change de transport, en s'appuyant sur **QUIC**, au-dessus d'**UDP**.

Cet article s'appuie sur la [RFC 9114](https://www.rfc-editor.org/rfc/rfc9114.html) (« HTTP/3 »), document *Standards Track* publié en juin 2022, édité par M. Bishop.

## L'idée : la même sémantique HTTP, un autre transport

La RFC est claire sur le principe : HTTP/3 **mappe la sémantique HTTP sur QUIC**. Les concepts que vous connaissez — méthodes, en-têtes, codes de statut, corps de requête/réponse — ne changent pas. Ce qui change, c'est *comment* ces messages voyagent sur le réseau.

La motivation est explicite : *« QUIC has the capability to improve the performance of HTTP compared to a TCP mapping. »* Autrement dit, on ne réinvente pas HTTP ; on lui donne un transport plus performant.

## Le problème résolu : le head-of-line blocking

C'est le cœur du sujet. HTTP/2 permettait déjà de multiplexer plusieurs requêtes sur une seule connexion. Mais ce multiplexage se faisait **au-dessus de TCP**, qui garantit une livraison strictement ordonnée : si un paquet est perdu, TCP bloque *tout* le flux en attendant sa retransmission. Résultat, une seule perte de paquet gelait l'ensemble des requêtes multiplexées — le fameux **head-of-line blocking**.

QUIC résout cela en intégrant le multiplexage **dans le transport lui-même**, via des *streams* indépendants. Comme le résume la RFC, les streams QUIC opèrent indépendamment : la perte d'un paquet sur un stream ne bloque pas les autres. Chaque requête progresse à son rythme, sans être otage de la voisine.

## La sécurité n'est plus une option

Autre rupture : avec HTTP/3, le chiffrement n'est pas une couche ajoutée par-dessus, c'est une **fondation**. QUIC intègre **TLS 1.3 au niveau du transport**. Il n'y a pas de « HTTP/3 en clair » comme il existait un HTTP sans TLS : la sécurité fait partie du protocole de transport, ce qui élimine aussi une partie de l'overhead d'établissement de connexion.

## QPACK : compresser les en-têtes sans ordre garanti

HTTP/2 compressait les en-têtes avec HPACK. Mais HPACK a une dépendance forte : il *« relies on in-order transmission »* — une garantie que QUIC, justement, ne fournit pas (c'est tout l'intérêt de ses streams indépendants). HTTP/3 introduit donc **QPACK** ([RFC 9204](https://www.rfc-editor.org/rfc/rfc9204.html)), conçu pour compresser efficacement les en-têtes tout en tolérant une livraison non ordonnée.

C'est un bel exemple d'effet en cascade : changer de transport oblige à repenser les briques qui présupposaient l'ordre de TCP.

## Le modèle de streams

HTTP/3 organise la communication sur plusieurs types de streams QUIC :

- des **streams bidirectionnels**, ouverts par le client, portent les couples requête/réponse ;
- des **streams unidirectionnels** servent notamment au *server push* et aux **streams de contrôle**, qui véhiculent les informations de pilotage de la connexion.

Cette séparation nette (données vs contrôle) clarifie l'architecture du protocole.

## Comment un navigateur découvre HTTP/3

Une connexion démarre rarement directement en HTTP/3. Le serveur **annonce** sa disponibilité via l'en-tête **`Alt-Svc`** (*Alternative Services*). Concrètement, une réponse peut contenir :

```
Alt-Svc: h3=":50781"
```

Le client apprend ainsi qu'un service HTTP/3 (`h3`) est joignable, et pourra basculer dessus pour les échanges suivants.

## Ce que ça change, côté ingénierie

Pour un développeur ou un architecte, quelques implications concrètes :

- **UDP doit passer.** HTTP/3 circule sur UDP ; pare-feux et équipements réseau doivent l'autoriser, sinon le client retombe sur HTTP/2 (TCP).
- **Le gain est net sur réseaux dégradés.** C'est en mobilité, sur des liens à perte de paquets, que la disparition du head-of-line blocking se fait le plus sentir.
- **TLS 1.3 est obligatoire.** Pas de demi-mesure : le chiffrement est intrinsèque.

HTTP/3 illustre une idée d'architecture puissante : quand une couche (le transport) devient le facteur limitant, il est parfois plus efficace de la remplacer que d'empiler des contournements par-dessus. En déplaçant le multiplexage là où il doit être — dans le transport — QUIC règle à la racine un problème que HTTP/2 ne pouvait que contourner.

## Sources
- **Source officielle** : RFC 9114 « HTTP/3 », IETF, Standards Track, juin 2022 (éd. M. Bishop) — https://www.rfc-editor.org/rfc/rfc9114.html
- QUIC (transport) : RFC 9000 — https://www.rfc-editor.org/rfc/rfc9000.html
- QPACK (compression d'en-têtes) : RFC 9204 — https://www.rfc-editor.org/rfc/rfc9204.html
