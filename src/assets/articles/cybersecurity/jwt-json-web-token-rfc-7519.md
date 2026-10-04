---
title: "JWT (RFC 7519) : ce que dit vraiment la spécification des JSON Web Tokens"
category: cybersecurity
date: 2026-09-18
author: Geoffrey Aubert
tags: ["sécurité", "jwt", "rfc", "authentification", "oauth"]
summary: "Le JWT est partout dans l'authentification moderne, mais rarement lu à la source, d'où ce décryptage de la RFC 7519 qui en détaille la structure, les claims enregistrés, la validation et les considérations de sécurité, avec les formulations exactes de la spécification."
readTime: 8
---

# JWT (RFC 7519) : ce que dit vraiment la spécification des JSON Web Tokens

Le JWT (*JSON Web Token*) s'est imposé comme le format de facto pour transporter des informations d'authentification et d'autorisation entre un client et un serveur (sessions stateless, tokens OAuth 2.0, SSO). Mais la plupart des développeurs le manipulent via une bibliothèque sans jamais avoir ouvert le texte qui le définit, à savoir la [RFC 7519](https://www.rfc-editor.org/rfc/rfc7519), publiée en mai 2015 par l'IETF. Elle en donne une définition précise et volontairement minimale, qu'il vaut la peine de connaître pour éviter les erreurs d'implémentation les plus courantes.

## Ce qu'est officiellement un JWT

La RFC définit le JWT comme *« a compact, URL-safe means of representing claims to be transferred between two parties »*, soit un moyen compact et sûr pour les URL de représenter des réclamations (*claims*) à transférer entre deux parties. Ces réclamations sont encodées sous forme d'objet JSON, qui sert soit de charge utile (*payload*) à une structure JWS (JSON Web Signature), soit de texte en clair chiffré par une structure JWE (JSON Web Encryption).

Autrement dit, un JWT n'est pas un format cryptographique en soi mais un conteneur de claims JSON, dont la protection (signature ou chiffrement) est déléguée à deux autres spécifications de la famille JOSE (JSON Object Signing and Encryption), respectivement RFC 7515 (JWS) et RFC 7516 (JWE).

## La structure en trois parties

Un JWT sérialisé sous forme JWS (le cas le plus courant en pratique) se compose de trois segments encodés en base64url et séparés par des points :

```
en-tête.charge_utile.signature
```

Exemple donné en annexe de la spécification :

```
eyJ0eXAiOiJKV1QiLA0KICJhbGciOiJIUzI1NiJ9.
eyJpc3MiOiJqb2UiLA0K...dBjftJeZ4CVP...
```

- **L'en-tête JOSE** (*JOSE Header*) décrit les opérations cryptographiques appliquées au JWT.
- **La charge utile** (*claims set*) contient l'ensemble des réclamations, sous forme d'objet JSON.
- **La signature** (ou le chiffrement pour un JWE) protège l'intégrité (et éventuellement la confidentialité) des deux premiers segments.

## Les claims enregistrés (Section 4.1)

La RFC réserve un jeu de noms de claims à usage standardisé, tous optionnels, dans un registre IANA. Ce sont les seuls dont la sémantique est fixée par la spécification elle-même :

| Claim | Nom complet | Définition officielle |
|-------|-------------|------------------------|
| `iss` | Issuer | *« identifies the principal that issued the JWT »* |
| `sub` | Subject | *« identifies the principal that is the subject of the JWT »* |
| `aud` | Audience | *« identifies the recipients that the JWT is intended for »* |
| `exp` | Expiration Time | *« identifies the expiration time on or after which the JWT MUST NOT be accepted »* |
| `nbf` | Not Before | *« identifies the time before which the JWT MUST NOT be accepted »* |
| `iat` | Issued At | *« identifies the time at which the JWT was issued »* |
| `jti` | JWT ID | *« provides a unique identifier for the JWT »* |

Un exemple minimal de charge utile utilisant plusieurs de ces claims :

```json
{
  "iss": "https://auth.example.com",
  "sub": "user-42",
  "aud": "https://api.example.com",
  "exp": 1893456000,
  "iat": 1893452400
}
```

Rien n'empêche d'ajouter des claims « privés » (propres à une application) ou « publics » (enregistrés dans le registre IANA ou identifiés par un nom résistant aux collisions, typiquement une URI), puisque la RFC ne limite pas le contenu du claims set aux sept noms ci-dessus.

## JWS, JWE et JWT imbriqués

La spécification distingue explicitement deux façons de protéger un JWT :

- **JWS (signé)** : les claims sont signés numériquement ou protégés par MAC. C'est le cas d'usage le plus répandu, le contenu restant lisible en clair (base64url n'est pas du chiffrement) mais toute altération y étant détectable.
- **JWE (chiffré)** : les claims sont chiffrés, le claims set devenant le texte en clair chiffré par la structure JWE.

Elle définit aussi le **JWT imbriqué** (*Nested JWT*) comme *« A JWT in which nested signing and/or encryption are employed »*, un JWT servant alors de charge utile à une structure JWS ou JWE englobante, par exemple pour signer puis chiffrer un même ensemble de claims.

## Validation : les étapes de la Section 7.2

La RFC détaille une procédure de validation qu'une implémentation doit suivre pour accepter un JWT, notamment :

1. Vérifier la présence d'au moins un point (`.`) séparateur.
2. Décoder l'en-tête JOSE en base64url et vérifier qu'il s'agit de JSON UTF-8 valide.
3. Déterminer s'il s'agit d'une structure JWS ou JWE.
4. Valider selon les règles propres à JWS ou JWE (signature ou déchiffrement).
5. Si l'en-tête `cty` (Content Type) vaut `"JWT"`, répéter le processus sur la charge utile déchiffrée/vérifiée (cas imbriqué).
6. Décoder la charge utile finale en base64url et vérifier qu'il s'agit de JSON UTF-8 valide.

C'est à ce stade (après vérification cryptographique) que les claims `exp`, `nbf`, etc. doivent être contrôlés par l'application consommatrice, la RFC ne rendant pas cette vérification automatique mais en posant seulement la sémantique.

## Algorithmes : obligatoires vs recommandés (Section 8)

Pour garantir l'interopérabilité minimale entre implémentations, la RFC impose un socle d'algorithmes de signature :

- **Obligatoires** : `HS256` (HMAC-SHA256) et `"alg":"none"` (JWT non sécurisé, voir plus bas).
- **Recommandés** : `RS256` (RSASSA-PKCS1-v1_5 avec SHA-256) et `ES256` (ECDSA sur la courbe P-256 avec SHA-256).

## Le piège du JWT « none »

La Section 6 autorise explicitement des JWT sans protection cryptographique (*« JWTs MAY also be created without a signature or encryption »*) en utilisant `"alg":"none"` avec une signature vide, l'intégrité étant alors assurée par un autre mécanisme (par exemple un canal de transport déjà authentifié). C'est une fonctionnalité légitime de la spécification, mais c'est aussi historiquement l'une des principales sources de vulnérabilités JWT en production, du fait de bibliothèques mal configurées qui acceptent un token dont l'attaquant a simplement remplacé `alg` par `none`, contournant ainsi toute vérification de signature. La RFC ne l'interdit pas ; c'est à l'implémentation de restreindre explicitement les algorithmes acceptés côté vérification.

## Considérations de sécurité (Section 11)

Quelques principes que la spécification énonce directement :

- Le contenu d'un JWT ne peut être considéré comme fiable que s'il est protégé cryptographiquement (signé et/ou chiffré) et si cette protection est effectivement vérifiée par le destinataire.
- Lorsqu'un JWT doit être à la fois signé et chiffré, la RFC recommande de *« sign the message and then encrypt the result »*, soit signer d'abord puis chiffrer ensuite.
- Les informations sensibles au regard de la vie privée doivent être chiffrées et/ou transmises sur un canal protégé (TLS), le contenu d'un JWS restant lisible par quiconque intercepte le token.

## Ce que la RFC ne couvre pas

Il est utile de noter ce que la RFC 7519 ne définit pas : ni le mécanisme de révocation d'un token, ni la gestion du renouvellement (*refresh*), ni un format standard pour stocker le token côté client. Ces aspects relèvent de choix d'architecture applicative, souvent normalisés séparément, par exemple dans les profils OAuth 2.0 qui s'appuient sur le JWT comme format de token d'accès ou d'identité (JWT Bearer Token, OpenID Connect ID Token).

## Sources

- [RFC 7519, JSON Web Token (JWT)](https://www.rfc-editor.org/rfc/rfc7519), IETF, mai 2015, spécification de référence.
- [RFC 7515, JSON Web Signature (JWS)](https://www.rfc-editor.org/rfc/rfc7515), IETF, format de signature utilisé par la majorité des JWT.
- [RFC 7516, JSON Web Encryption (JWE)](https://www.rfc-editor.org/rfc/rfc7516), IETF, format de chiffrement pour les JWT chiffrés.
