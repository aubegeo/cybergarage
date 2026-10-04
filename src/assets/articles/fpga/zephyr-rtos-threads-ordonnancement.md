---
title: "Zephyr RTOS : comment les threads coopératifs et préemptibles structurent le temps réel embarqué"
category: fpga
date: 2026-08-14
author: Geoffrey Aubert
tags: ["zephyr", "rtos", "embarque", "temps-reel", "ordonnancement"]
summary: "Zephyr, l'OS temps réel open source porté par la Linux Foundation, distingue deux familles de threads — coopératifs et préemptibles — dont la priorité détermine finement qui s'exécute et quand. Plongée dans le modèle de threads du noyau, directement depuis la documentation officielle du projet."
readTime: 8
---

# Zephyr RTOS : comment les threads coopératifs et préemptibles structurent le temps réel embarqué

Sur un serveur, un thread qui attend un peu plus longtemps que prévu passe rarement inaperçu. Sur un microcontrôleur qui pilote un capteur, un actionneur ou une liaison radio, ce même retard peut être la différence entre un système qui fonctionne et un système qui rate sa fenêtre temporelle. C'est précisément le problème que Zephyr, l'OS temps réel open source de la Linux Foundation, adresse au niveau du noyau — via un modèle de threads volontairement explicite sur qui peut interrompre qui, et quand.

Zephyr se définit comme « a small-footprint kernel designed for use on resource-constrained and embedded systems: from simple embedded environmental sensors and LED wearables to sophisticated embedded controllers, smart watches, and IoT wireless applications », selon la [documentation officielle du projet](https://docs.zephyrproject.org/latest/introduction/index.html). Il tourne sur un large éventail d'architectures — ARC, ARM (Cortex-M, Cortex-A, Cortex-R), x86, MIPS, OpenRISC, RISC-V, SPARC V8, Xtensa — et il est distribué sous licence Apache 2.0. Son organisation interne repose sur des « subsystems » : chaque sous-système « handles specific functionality or provides certain services » (réseau, système de fichiers, pilotes, gestion d'énergie…), le tout pensé pour rester configurable et n'embarquer que ce dont l'application a réellement besoin — la doc le résume ainsi : « Allows an application to incorporate only the capabilities it needs as it needs them. »

Au cœur de ce noyau, une brique fait tout le travail de temps réel : le thread.

## Le thread comme objet noyau

Dans Zephyr, un thread n'est pas une simple fonction lancée en tâche de fond : c'est un objet noyau à part entière, décrit par la documentation comme « used for application processing that is too lengthy or too complex to be performed by an ISR ». Autrement dit, tout ce qui ne peut pas être traité directement dans un gestionnaire d'interruption (ISR) — parce que c'est trop long ou trop complexe — devient un thread. Et Zephyr ne fixe aucune limite arbitraire à leur nombre : « Any number of threads can be defined by an application (limited only by available RAM). »

Chaque thread embarque plusieurs propriétés définies à la création : une zone de pile dimensionnable, un bloc de contrôle (`k_thread`), un point d'entrée pouvant recevoir jusqu'à trois arguments, une priorité d'ordonnancement, un jeu d'options, un délai de démarrage optionnel, et un mode d'exécution — superviseur par défaut, ou utilisateur restreint si `CONFIG_USERSPACE` est activé.

Son cycle de vie suit une mécanique précise :

- **Création** : soit immédiate (`K_NO_WAIT`), soit différée d'un délai annulable ; si ce délai vaut `K_FOREVER`, le thread reste inactif jusqu'à un appel explicite à `k_thread_start()`.
- **Terminaison** : c'est au thread lui-même de libérer ses ressources (mutex détenus, mémoire allouée) — la doc est claire sur ce point, le noyau ne les réclame pas automatiquement à sa mort.
- **Abandon** (`k_thread_abort()`) : peut être déclenché manuellement, ou automatiquement suite à une erreur fatale, comme le déréférencement d'un pointeur nul.
- **Suspension / reprise** (`k_thread_suspend()` / `k_thread_resume()`).
- **Attente d'un autre thread** (`k_thread_join()`), pour bloquer jusqu'à la terminaison d'un thread donné.
- **Sommeil** (`k_sleep()`), que la documentation distingue explicitement de la suspension : le réveil y est automatique, au terme du délai, sans intervention externe.

## Ready, unready, running : trois mots, deux catégories

Zephyr distingue deux états structurants pour un thread : « ready » — aucun facteur ne bloque son exécution — et « unready », qui recouvre plusieurs situations différentes : le thread n'a pas encore démarré, il attend un objet noyau, il attend l'expiration d'un timeout, il est suspendu, ou il est terminé/abandonné.

Un détail de vocabulaire mérite d'être noté, parce qu'il change la façon de raisonner sur l'ordonnanceur : la documentation précise que « Ready » est un état de thread, tandis que « Running » est un état d'ordonnancement, qui ne s'applique qu'aux threads déjà « Ready ». Ce ne sont donc pas deux états symétriques du même niveau : être « ready » qualifie l'éligibilité du thread, être « running » qualifie une décision de l'ordonnanceur à un instant donné parmi l'ensemble des threads éligibles.

## Deux mémoires de pile, deux usages

Zephyr propose deux familles de macros pour déclarer les piles de threads, avec un compromis clair entre performance mémoire et surface d'usage :

- **`K_KERNEL_STACK`** — des piles réservées au noyau, jamais utilisables en mode utilisateur, plus économes en mémoire.
- **`K_THREAD_STACK`** — des piles utilisables par des threads en mode utilisateur, dont l'alignement est contraint par le MPU (Memory Protection Unit).

Une allocation dynamique est également possible via `k_thread_stack_alloc()`, et sa libération via `k_thread_stack_free()`.

## Priorités : la clé de voûte de l'ordonnancement

C'est ici que Zephyr révèle sa vocation temps réel. Chaque thread possède une priorité représentée par un entier, qui peut être négatif ou non négatif — et la convention est celle des systèmes Unix : plus la valeur est basse, plus la priorité est haute. Un thread de priorité 4 passe donc avant un thread de priorité 7, et un thread de priorité -2 passe avant les deux.

Cette échelle de priorités définit deux grandes classes de threads :

- **Thread coopératif** (priorité négative) : une fois qu'il s'exécute, il reste actif jusqu'à ce qu'il se rende lui-même « unready » — rien ni personne ne le supplante entre-temps, sauf une interruption matérielle.
- **Thread préemptible** (priorité ≥ 0) : il peut être supplanté à tout moment par un thread coopératif, ou par un thread préemptible de priorité égale ou supérieure.

Cette distinction n'est pas un détail d'implémentation, c'est un outil de conception. En choisissant délibérément une priorité négative pour une tâche critique — par exemple un traitement de signal qui ne doit surtout pas être interrompu au milieu de son calcul — le développeur garantit un déterminisme que du code purement préemptible ne peut pas offrir. À l'inverse, rendre une tâche préemptible permet à l'ordonnanceur de réagir vite à un événement plus prioritaire, au prix d'un partage du temps CPU plus complexe à raisonner.

La documentation insiste d'ailleurs sur un point de philosophie : « The scheduler does not make heuristic decisions to re-prioritize threads. Thread priorities are set and changed only at the application's request. » Autrement dit, pas d'ajustement automatique et opaque façon *nice* évolutif : c'est l'application qui décide, et qui peut à tout moment faire basculer un thread préemptible en coopératif ou l'inverse. Ce choix de conception rend le comportement du système prévisible — une qualité recherchée dès qu'on touche au temps réel.

L'étendue de ces priorités n'est pas figée : elle se configure via `CONFIG_NUM_COOP_PRIORITIES` et `CONFIG_NUM_PREEMPT_PRIORITIES`. Avec, par exemple, 5 priorités coopératives et 10 préemptives configurées, les plages disponibles s'étendent de -5 à -1 pour les threads coopératifs et de 0 à 9 pour les threads préemptibles.

Au sommet de cet espace de priorités se trouve encore une sous-classe particulière : les priorités **Meta-IRQ** (`CONFIG_NUM_METAIRQ_PRIORITIES`), une catégorie de priorités coopératives capable de préempter absolument tous les autres threads — y compris des threads coopératifs ayant posé un verrou d'ordonnanceur — tout en restant elle-même interruptible par une interruption matérielle. C'est le mécanisme que Zephyr documente par ailleurs comme permettant d'implémenter un comportement d'« interrupt bottom half » ou de « tasklet », pour traiter très vite le strict nécessaire suite à une interruption, sans bloquer le reste du système plus que nécessaire.

## Ce que ce modèle change concrètement

Ce découpage coopératif/préemptible, combiné à des priorités numériques explicites et modifiables uniquement à la demande de l'application, donne au développeur embarqué un contrôle fin sur les garanties temporelles de son système. Ce n'est pas un hasard si la documentation présente, parmi les fonctionnalités clés du noyau, des stratégies d'ordonnancement aussi variées que le *time-slicing* entre threads préemptibles de priorité égale, l'ordonnancement *Earliest Deadline First* (EDF), ou le choix entre plusieurs structures de file prête (liste chaînée simple, arbre rouge-noir, multi-queue). Autant d'options qui permettent d'adapter le comportement du noyau au profil exact de l'application — d'un simple capteur environnemental à un contrôleur industriel plus sophistiqué — sans jamais perdre de vue l'objectif premier d'un RTOS : rendre le pire cas prévisible, pas seulement le cas moyen rapide.

## Sources
- **Source officielle** : Zephyr Project, documentation « Introduction » — https://docs.zephyrproject.org/latest/introduction/index.html
- **Source officielle** : Zephyr Project, documentation « Threads » (Kernel Services) — https://docs.zephyrproject.org/latest/kernel/services/threads/index.html
