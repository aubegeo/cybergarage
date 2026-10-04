---
title: "OpenMP : programmer le parallélisme à mémoire partagée sans réinventer les threads"
category: hpc
date: 2026-07-24
author: Geoffrey Aubert
tags: ["openmp", "hpc", "parallelisme", "c", "calcul-haute-performance"]
summary: "Comment l'API OpenMP transforme une boucle séquentielle en calcul parallèle avec quelques directives, d'après la spécification officielle : modèle fork-join, worksharing-loop, réductions et ordonnancement."
readTime: 8
---

## Le problème : paralléliser sans réécrire son programme

Écrire du code multi-thread à la main (créer des `pthread`, gérer des mutex, répartir manuellement des plages d'indices entre threads) est fastidieux et source d'erreurs. OpenMP répond à ce problème en proposant une API qui, selon la description officielle du projet, « supports multi-platform shared-memory parallel programming in C/C++ and Fortran » et offre « a portable, scalable model with a simple and flexible interface for developing parallel applications on platforms from the desktop to the supercomputer ». Concrètement, on annote son code séquentiel existant avec des directives (`#pragma omp ...`) et le compilateur se charge de générer le code multi-thread correspondant.

C'est cette approche incrémentale, qui consiste à partir d'un programme séquentiel qui fonctionne et à le paralléliser section par section, qui a fait le succès d'OpenMP dans le calcul haute performance, du poste de travail au supercalculateur. L'API est maintenue par l'OpenMP Architecture Review Board (ARB) et sa spécification est publiée gratuitement sur [openmp.org](https://www.openmp.org/specifications/). La version actuelle est OpenMP 6.0 (novembre 2024) ; cet article s'appuie sur les mécanismes stables de la spécification 5.0, inchangés dans leurs grandes lignes depuis.

## Le modèle fork-join : la directive `parallel`

Tout programme OpenMP repose sur le même principe, selon lequel un thread unique (le thread « maître ») rencontre une région de code annotée et une équipe de threads est créée pour l'exécuter en parallèle, ce qui constitue le modèle *fork-join*.

La spécification décrit la directive `parallel` avec la syntaxe C/C++ suivante :

```c
#pragma omp parallel [clause[ [,] clause] ... ] new-line
   structured-block
```

Quand un thread rencontre cette directive, « une équipe de threads est créée pour exécuter la région parallèle ». Le thread qui a rencontré la directive devient le thread maître, numéroté zéro, tandis que « tous les threads de l'équipe, y compris le maître, exécutent la région ». La spécification précise aussi la synchronisation de sortie, puisque « il existe une barrière implicite à la fin d'une région parallèle » et que, une fois celle-ci franchie, « seul le thread maître de l'équipe reprend l'exécution » du code qui suit.

La directive accepte plusieurs clauses pour contrôler ce comportement :

- `num_threads(integer-expression)` fixe le nombre de threads de l'équipe.
- `if([parallel :] scalar-expression)` n'active le parallélisme que si la condition est vraie.
- `default(shared | none)` définit le partage par défaut des variables.
- `private(list)` / `firstprivate(list)` / `shared(list)` contrôlent explicitement la visibilité de chaque variable.
- `reduction(...)` accumule un résultat de façon sûre entre threads (voir plus bas).
- `proc_bind(master | close | spread)` influence le placement des threads sur les cœurs physiques.

Un exemple minimal :

```c
#include <omp.h>
#include <stdio.h>

int main(void) {
    #pragma omp parallel num_threads(4)
    {
        int id = omp_get_thread_num();
        printf("Thread %d sur %d\n", id, omp_get_num_threads());
    }
    return 0;
}
```

Ici, quatre threads exécutent le même bloc de code et chacun affiche son propre identifiant, ce qui en fait la brique de base, même si seule elle duplique le travail plutôt que de le répartir.

## Répartir le travail : le construct `for`

Pour distribuer les itérations d'une boucle entre les threads d'une équipe déjà créée, OpenMP propose un *worksharing construct* dédié. La spécification (section 2.9.2) définit sa syntaxe C/C++ :

```c
#pragma omp for [clause[ [,] clause] ... ] new-line
   for-loops
```

et en résume le rôle ainsi, « the worksharing-loop construct specifies that the iterations of one or more associated loops will be executed in parallel by threads in the team in the context of their implicit tasks ». Autrement dit, `for` ne crée pas de nouveaux threads mais répartit les itérations entre les threads d'une région `parallel` déjà ouverte. C'est pourquoi on le combine presque toujours ainsi :

```c
#pragma omp parallel for
for (int i = 0; i < n; i++) {
    resultat[i] = calcul_couteux(donnees[i]);
}
```

La spécification liste les clauses disponibles pour ce construct, notamment `private(list)`, `firstprivate(list)`, `lastprivate(list)`, `reduction(...)`, `collapse(n)` (pour fusionner des boucles imbriquées), `ordered`, `nowait` et `schedule(...)`. Par défaut, un **barrier implicite** ferme la boucle, de sorte que tous les threads attendent que la dernière itération soit terminée avant de continuer. La clause `nowait` supprime cette synchronisation quand elle n'est pas nécessaire.

## Ordonnancer les itérations avec `schedule`

Toutes les itérations d'une boucle ne coûtent pas forcément le même temps. La clause `schedule([modifier[, modifier]:]kind[, chunk_size])`, documentée dans la même section, permet de choisir comment les itérations sont réparties :

- `static` réalise un découpage fixe et prévisible en blocs contigus, décidé à la compilation ou au lancement.
- Avec `dynamic`, chaque thread demande un nouveau bloc d'itérations dès qu'il a terminé le précédent, utile quand la charge par itération est irrégulière.
- `guided` fonctionne comme `dynamic`, mais avec des blocs de taille décroissante.
- `auto` et `runtime` laissent le compilateur ou une variable d'environnement décider.

```c
#pragma omp parallel for schedule(dynamic, 100)
for (int i = 0; i < n; i++) {
    resultat[i] = calcul_a_duree_variable(donnees[i]);
}
```

Ce choix a un impact direct sur les performances, car un `schedule(static)` minimise l'overhead d'ordonnancement mais peut laisser des threads inactifs si la charge est déséquilibrée, tandis qu'un `schedule(dynamic)` équilibre mieux la charge au prix d'une synchronisation plus fréquente.

## Agréger un résultat sans corrompre la mémoire partagée : `reduction`

Accumuler une somme, un produit, un minimum ou un maximum dans une boucle parallélisée est un piège classique, puisque plusieurs threads qui écrivent au même moment dans la même variable produisent une *race condition*. La clause `reduction([reduction-modifier ,] reduction-identifier : list)`, valable aussi bien sur `parallel` que sur `for`, résout ce problème en donnant à chaque thread sa propre copie privée de la variable, initialisée selon l'opérateur choisi, puis en combinant les copies à la fin de la région :

```c
double somme = 0.0;
#pragma omp parallel for reduction(+:somme)
for (int i = 0; i < n; i++) {
    somme += valeurs[i];
}
```

Aucun verrou explicite ni aucune section critique n'est à écrire à la main, puisque la combinaison finale est gérée par le runtime OpenMP conformément à la sémantique décrite dans la spécification.

## Ce qu'il faut retenir

OpenMP ne remplace pas une compréhension du parallélisme (savoir où sont les dépendances entre itérations reste indispensable), mais il évite d'écrire à la main la gestion des threads, des verrous et de la répartition du travail pour les cas les plus courants. Trois directives suffisent à couvrir l'essentiel des besoins en calcul scientifique et en HPC : `parallel` pour créer l'équipe de threads, `for` pour répartir une boucle et `reduction` pour agréger un résultat sans race condition. Le reste (`schedule`, `collapse`, `nowait`, `proc_bind`) sert à ajuster finement les performances une fois que la version parallèle fonctionne correctement.

## Sources

- OpenMP Architecture Review Board, Spécification officielle (versions 1.0 à 6.0, PDF et HTML) : [openmp.org/specifications](https://www.openmp.org/specifications/)
- OpenMP 5.0 Specification, section 2.6, *parallel Construct* : [openmp.org/spec-html/5.0/openmpse14.html](https://www.openmp.org/spec-html/5.0/openmpse14.html)
- OpenMP 5.0 Specification, section 2.9.2, *Worksharing-Loop Construct* : [openmp.org/spec-html/5.0/openmpsu41.html](https://www.openmp.org/spec-html/5.0/openmpsu41.html)
- OpenMP, À propos du projet et de l'ARB : [openmp.org/about](https://www.openmp.org/about/)
