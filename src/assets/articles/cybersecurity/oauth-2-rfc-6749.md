---
title: "OAuth 2.0 démystifié : rôles, grants et tokens"
category: cybersecurity
date: 2026-07-10
author: Geoffrey Aubert
tags: ["oauth", "sécurité", "authorization", "api", "tokens"]
summary: "OAuth 2.0 (RFC 6749) permet à une application d'accéder à des ressources au nom d'un utilisateur sans jamais manipuler son mot de passe. Cet article décrypte les 4 rôles, les types de grant et les tokens, d'après la RFC officielle."
readTime: 7
---

# OAuth 2.0 démystifié : rôles, grants et tokens

« Se connecter avec Google », « autoriser cette app à accéder à votre agenda »… Derrière ces interactions se cache presque toujours **OAuth 2.0**, le cadre d'autorisation standardisé par la [RFC 6749](https://www.rfc-editor.org/rfc/rfc6749) (IETF, *Standards Track*, octobre 2012).

Le problème qu'il résout est fondamental, puisqu'il faut permettre à une application tierce d'accéder à *une partie* de vos données **sans lui confier votre mot de passe**. OAuth introduit une couche d'autorisation qui délivre des **jetons à portée limitée** plutôt que de partager les identifiants.

## Les 4 rôles

Tout OAuth se comprend à partir de ses quatre acteurs :

- **Resource Owner** désigne l'entité qui possède les ressources protégées (typiquement l'utilisateur final).
- **Resource Server** est le serveur qui héberge les ressources et **valide les access tokens**.
- **Client** est l'application qui demande l'accès *au nom* du resource owner.
- **Authorization Server** est celui qui **authentifie** le resource owner et **émet les tokens**.

La séparation entre *authorization server* (qui délivre les jetons) et *resource server* (qui les consomme) est au cœur du modèle.

## Les endpoints

Trois points d'entrée structurent les échanges :

- **Authorization Endpoint** est celui où le resource owner accorde (ou refuse) la permission.
- **Token Endpoint** est celui où le client échange ses justificatifs contre un access token.
- **Redirection Endpoint** correspond à l'URL de callback vers laquelle l'utilisateur est renvoyé après sa décision.

## Les 4 types de grant

Un *grant* est la méthode par laquelle le client obtient un token. La RFC en définit quatre :

- **Authorization Code** est pensé pour les applications web, le client recevant d'abord un **code éphémère** qu'il échange ensuite contre un token, de sorte que les identifiants de l'utilisateur restent invisibles pour le client.
- **Implicit** est conçu pour les applications s'exécutant dans le navigateur, où le token est délivré directement, sans code intermédiaire.
- **Resource Owner Password Credentials** correspond à la soumission directe des identifiants, réservée aux clients **hautement de confiance**.
- **Client Credentials** s'emploie pour les scénarios **serveur-à-serveur**, où le client agit pour son propre compte, sans représenter un utilisateur.

> ⚠️ **Contexte 2026** : la RFC 6749 a depuis été mise à jour (RFC 8252 pour les apps natives, RFC 8996, RFC 9700 pour les bonnes pratiques de sécurité). Les grants **Implicit** et **Password** sont aujourd'hui **déconseillés** au profit d'**Authorization Code + PKCE** ([RFC 7636](https://www.rfc-editor.org/rfc/rfc7636)). Un article fondé sur la seule RFC 6749 doit garder cette évolution en tête.

## Access token vs refresh token

OAuth distingue deux jetons aux rôles distincts :

- **Access Token** est le sésame pour accéder aux ressources protégées, avec une **portée** (*scope*) et une **durée de vie** définies, le jeton étant volontairement court.
- **Refresh Token** sert à **obtenir un nouvel access token** quand le précédent expire, **sans réauthentifier** l'utilisateur.

Ce couple est la clé du compromis sécurité/ergonomie d'OAuth, car il permet d'avoir des access tokens à courte durée de vie (limiter les dégâts en cas de fuite) sans imposer une reconnexion permanente (grâce au refresh token).

## Ce qu'il faut retenir

OAuth 2.0 est un cadre d'**autorisation** et non d'**authentification** (c'est le rôle d'OpenID Connect, bâti par-dessus), dont la force est de découpler l'accès aux ressources de la détention du mot de passe, via des jetons scindés, à portée et durée limitées. Sa subtilité réside dans le choix du bon grant, puisqu'il faut en 2026 privilégier **Authorization Code + PKCE** dans l'immense majorité des cas.

## Sources
- **Source officielle** : RFC 6749 « The OAuth 2.0 Authorization Framework » (IETF, Standards Track, octobre 2012), https://www.rfc-editor.org/rfc/rfc6749
- Mises à jour clés : RFC 8252 (apps natives), RFC 9700 (bonnes pratiques de sécurité), RFC 7636 (PKCE), https://www.rfc-editor.org/rfc/rfc7636
