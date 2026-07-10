---
title: "OWASP Top 10 (2021) : les 10 risques de sécurité web à connaître"
category: cybersecurity
date: 2026-07-10
author: Geoffrey Aubert
tags: ["sécurité", "owasp", "web", "vulnérabilités", "appsec"]
summary: "L'OWASP Top 10 est la référence mondiale des risques de sécurité des applications web. Tour d'horizon des 10 catégories de l'édition 2021, chacune renvoyée à sa fiche officielle OWASP."
readTime: 9
---

# OWASP Top 10 (2021) : les 10 risques de sécurité web à connaître

L'**OWASP Top 10** est le document de sensibilisation le plus reconnu en sécurité applicative web. Publié par l'*Open Worldwide Application Security Project*, il classe les dix catégories de risques les plus critiques, à partir de données collectées sur un large ensemble d'applications et complétées par une enquête auprès des professionnels du secteur.

Voici l'édition **2021**, chaque risque étant rattaché à sa **fiche officielle OWASP** — dans l'esprit « une affirmation, une source ».

## A01:2021 – Broken Access Control
[Fiche officielle](https://owasp.org/Top10/A01_2021-Broken_Access_Control/). Le contrôle d'accès défaillant est **passé n°1**. Il s'agit de tous les cas où un utilisateur peut agir en dehors de ses permissions : accéder aux données d'autrui, modifier un identifiant dans l'URL (IDOR), élever ses privilèges. À corriger côté serveur, jamais en se fiant au client.

## A02:2021 – Cryptographic Failures
[Fiche officielle](https://owasp.org/Top10/A02_2021-Cryptographic_Failures/). Anciennement « Sensitive Data Exposure ». Le risque porte sur la **protection des données** : chiffrement absent ou faible, algorithmes obsolètes, secrets en clair, absence de TLS. La question centrale : quelles données sont sensibles, et sont-elles protégées en transit **et** au repos ?

## A03:2021 – Injection
[Fiche officielle](https://owasp.org/Top10/A03_2021-Injection/). SQL, NoSQL, OS, LDAP… l'injection survient quand des données non fiables sont interprétées comme des commandes. Le **Cross-Site Scripting (XSS)** est désormais intégré à cette catégorie. Parade : requêtes paramétrées, validation et échappement systématiques.

## A04:2021 – Insecure Design
[Fiche officielle](https://owasp.org/Top10/A04_2021-Insecure_Design/). **Nouvelle catégorie** en 2021, et un changement de philosophie majeur : certaines failles ne viennent pas d'un bug d'implémentation mais d'une **conception non sécurisée**. On ne peut pas « patcher » un design absent de contrôles — d'où l'importance du *threat modeling* et des patterns sécurisés dès la conception.

## A05:2021 – Security Misconfiguration
[Fiche officielle](https://owasp.org/Top10/A05_2021-Security_Misconfiguration/). Configurations par défaut, services inutiles activés, messages d'erreur trop bavards, en-têtes de sécurité manquants, permissions cloud trop larges. Un classique aggravé par la multiplication des composants à configurer.

## A06:2021 – Vulnerable and Outdated Components
[Fiche officielle](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/). On hérite des vulnérabilités de ses dépendances. Sans inventaire (SBOM) ni veille sur les CVE, une bibliothèque obsolète devient une porte d'entrée. La chaîne d'approvisionnement logicielle est un sujet à part entière.

## A07:2021 – Identification and Authentication Failures
[Fiche officielle](https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/). Mots de passe faibles tolérés, absence de MFA, gestion de session bancale (jetons prévisibles, expiration absente), attaques par bourrage d'identifiants. L'authentification reste un point d'entrée privilégié des attaquants.

## A08:2021 – Software and Data Integrity Failures
[Fiche officielle](https://owasp.org/Top10/A08_2021-Software_and_Data_Integrity_Failures/). **Nouvelle catégorie** centrée sur l'**intégrité** : mises à jour non signées, pipelines CI/CD compromis, désérialisation non sûre. Elle répond directement aux attaques sur la supply chain qui se sont multipliées.

## A09:2021 – Security Logging and Monitoring Failures
[Fiche officielle](https://owasp.org/Top10/A09_2021-Security_Logging_and_Monitoring_Failures/). Sans journalisation ni supervision adéquates, une intrusion peut passer inaperçue pendant des mois. Ce risque ne cause pas directement la brèche, mais conditionne la **capacité à la détecter et à y répondre**.

## A10:2021 – Server-Side Request Forgery (SSRF)
[Fiche officielle](https://owasp.org/Top10/A10_2021-Server-Side_Request_Forgery_%28SSRF%29/). **Nouvelle catégorie**, ajoutée via l'enquête auprès des professionnels. Le SSRF permet de forcer le serveur à émettre des requêtes vers des cibles choisies par l'attaquant (souvent des ressources internes), en abusant d'une fonctionnalité qui récupère une URL fournie par l'utilisateur.

## Comment s'en servir

L'OWASP Top 10 n'est pas une checklist de conformité exhaustive : c'est un **document de sensibilisation** et un point de départ. Pour un développeur, c'est la grille mentale à avoir en écrivant du code. Pour un lead ou un architecte, c'est un support de revue et de formation d'équipe. Trois tendances de l'édition 2021 méritent d'être retenues : la montée du **contrôle d'accès** au premier rang, l'apparition de l'**Insecure Design** (la sécurité se pense dès la conception), et la prise en compte de l'**intégrité de la chaîne logicielle**.

## Sources
- **Source officielle** : OWASP Top 10:2021 — https://owasp.org/Top10/
- Chaque catégorie dispose de sa fiche officielle dédiée (liens A01 à A10 ci-dessus), publiée par l'Open Worldwide Application Security Project.
