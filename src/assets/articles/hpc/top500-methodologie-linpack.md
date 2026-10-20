---
title: "TOP500 : comment classe-t-on vraiment les supercalculateurs les plus puissants au monde"
category: hpc
date: 2026-08-22
author: Geoffrey Aubert
tags: ["hpc", "top500", "linpack", "supercalculateurs"]
summary: "Depuis 1993, le classement TOP500 ordonne les supercalculateurs mondiaux sur un unique benchmark, Linpack. Voici ce que mesure réellement ce test, quelles sont ses limites assumées et pourquoi il reste la référence du secteur."
readTime: 7
---

Deux fois par an, en juin et en novembre, le monde du calcul haute performance retient son
souffle, puisque le [TOP500](https://top500.org/project/) publie son classement des 500 supercalculateurs
les plus puissants de la planète. Derrière ce rituel bisannuel se cache une question simple en
apparence mais redoutable à trancher, celle de savoir comment comparer équitablement des machines qui n'ont
souvent rien en commun, qu'il s'agisse de l'architecture, du nombre de cœurs, de la mémoire ou du réseau d'interconnexion.

La réponse du projet TOP500 tient en un mot, **Linpack**, c'est-à-dire un unique benchmark appliqué à toutes
les machines de la même façon depuis plus de trente ans, de sorte que comprendre ce que mesure Linpack ainsi que ce
qu'il ne mesure pas revient à comprendre ce que veut vraiment dire une place dans ce classement.

## Un seul test pour toutes les machines : Linpack

Le [projet TOP500](https://top500.org/project/) explique son choix méthodologique fondateur en indiquant que « The benchmark we decided on was
Linpack, which means that systems are ranked only by their ability to solve a set of linear
equations, A x = b, using a dense random matrix A ».

Concrètement, la variante utilisée est HPL (High-Performance Linpack), décrite dans la
[FAQ officielle](https://top500.org/resources/frequently-asked-questions/) comme « a software
package that solves a (random) dense linear system in double precision (64 bits) arithmetic on
distributed-memory computers ». Autrement dit, on prend une matrice dense de valeurs aléatoires,
on résout le système A x = b en arithmétique 64 bits et on chronomètre le nombre d'opérations
flottantes réalisées par seconde.

La FAQ précise également l'objectif du test en indiquant que « The Linpack Benchmark is a measure of a computer's
floating-point rate of execution. It is determined by running a computer program that solves a
dense system of linear equations. » Elle se montre aussi honnête sur sa nature, puisqu'elle avance que « This benchmark attempts
to measure the best performance of a machine in solving a system of equations. The problem size
and software can be chosen to produce the best performance. » Ce n'est donc pas un test dans des
conditions « par défaut », puisque les opérateurs de la machine choisissent la taille du problème et les
optimisations logicielles pour tirer le meilleur résultat possible.

## Rmax, Rpeak et pourquoi l'écart entre les deux compte

Le classement repose sur deux chiffres, qui reviennent systématiquement dans les tableaux du
TOP500 :

- **Rmax** est la performance flottante maximale réellement mesurée en exécutant Linpack sur la
  machine.
- **Rpeak** est la performance théorique crête du système, soit un plafond calculé et non mesuré.

La FAQ détaille comment ce plafond théorique est obtenu en précisant que « The theoretical peak is based not on
an actual performance from a benchmark run, but on a paper computation to determine the
theoretical peak rate of execution of floating point operations for the machine. » Le calcul est
« determined by counting the number of floating-point additions and multiplications (in full
precision) that can be completed during a period of time, usually the cycle time of the machine. »

L'intérêt de comparer Rmax à Rpeak, c'est de mesurer l'efficacité réelle d'une machine. Et sur ce
point, le projet TOP500 justifie son choix de benchmark par une observation empirique, à savoir que « Linpack
delivers performance figures that occupy the upper end of any other application performance » et que
« no other realistic application delivers a better efficiency (Rmax/Rpeak) of a system. » Linpack
serait donc, selon ses créateurs, l'un des tests qui rapproche le plus la performance mesurée de
la performance théorique, ce qui constitue un argument central pour justifier trente ans d'usage du même
benchmark.

## Des règles de soumission strictes

Le TOP500 n'accepte pas n'importe quel résultat. La FAQ impose que les calculs « must be computed
using full precision. By full precision we generally mean 64 bit floating point arithmetic or
higher. » Chaque soumission doit aussi documenter la configuration exacte utilisée, à savoir « the specific
information on the computer on which the test was run, the compiler, the optimization that was
used, and the site it was run on. »

Une restriction algorithmique, citée ici telle quelle, illustre à quel point la
méthodologie cherche à éviter les raccourcis, la FAQ stipulant que « using Strassen's Algorithm will distort the true
execution rate. As a result we do not allow Strassen's Algorithm to be used for the TOP500
reporting. » Strassen est un algorithme de multiplication matricielle asymptotiquement plus rapide
que la méthode classique, mais son usage aurait faussé la comparaison entre machines, si bien qu'il est
explicitement banni du calcul du score.

## Les limites que le TOP500 reconnaît lui-même

Ce qui distingue une méthodologie sérieuse d'un simple classement marketing, c'est sa capacité à
documenter ses propres limites, ce que le TOP500 fait sans détour puisque la FAQ rappelle que « the
performance of a computer is a complicated issue, a function of many interrelated quantities »
en citant pêle-mêle « the application, the algorithm, the size of the problem, the high-level
language, the implementation, the human level of effort used to optimize the program, the
compiler's ability to optimize, the age of the compiler, the operating system, the architecture
of the computer, and the hardware characteristics. »

La conséquence est assumée, la FAQ précisant que « The results presented for this benchmark suites should not be extolled as
measures of total system performance [...] but, rather, as reference points for further
evaluations. » Autrement dit, une place au classement TOP500 ne dit rien, à elle seule, sur la
performance d'une machine pour une application scientifique donnée, par exemple la chimie quantique, la prévision
météo, l'entraînement de modèles d'IA, etc.

La FAQ va plus loin en pointant une faiblesse structurelle de Linpack lui-même, en affirmant que « Linpack is not
the most efficient software for solving matrix problems. This is mainly due to the way the
algorithm and resulting software accesses memory. The memory access patterns of the algorithm has
disregard for the multi-layered memory hierarchies of RISC architecture and vector computers,
thereby spending too much time moving data instead of doing useful floating-point operations. »

*À titre de contexte personnel, c'est précisément cette limite (un algorithme intensif en calcul mais peu
exigeant en accès mémoire) qui a motivé la communauté HPC à développer des benchmarks
complémentaires comme HPCG ou des classements annexes comme le Green500. Le FAQ officiel du
TOP500 ne détaille pas leur fonctionnement technique, je ne m'y risque donc pas ici, la seule chose à retenir
étant qu'ils existent en complément de Linpack pour éclairer d'autres facettes de la
performance (efficacité mémoire, efficacité énergétique).*

## Une histoire de plus de trente ans

Le projet TOP500 a démarré en 1993 pour moderniser d'anciennes statistiques de supercalculateurs.
Depuis, les listes sont publiées deux fois par an, en juin et en novembre, sans interruption, comme
le confirme la FAQ selon laquelle « The TOP500 list has been updated twice a year since June 1993 ». L'archive
couvre donc, en continu, la période 1993-2026.

Le projet, fondé par Hans Werner Meuer (1936-2014), est aujourd'hui dirigé par Jack
Dongarra, Erich Strohmaier, Horst Simon et Martin Meuer. La page officielle du projet indique que
la stabilité du même benchmark a permis, sur « the past 20 years » (formulation de la source, non
datée précisément), de « benchmark systems that cover a performance range of 12 orders of
magnitude », soit un facteur mille milliards entre les machines comparées sur cette période. Le
texte source ne précise pas l'année de rédaction de cette phrase ni si le chiffre a été mis à jour
depuis ; l'écart réel entre les toutes premières machines du classement (1993) et les
supercalculateurs exaflopiques actuels est vraisemblablement plus grand aujourd'hui.

*À titre de contexte personnel, c'est cette continuité méthodologique, bien plus que le classement d'une
édition particulière, qui donne au TOP500 sa valeur historique. On peut discuter de la pertinence
de Linpack pour évaluer une charge de travail précise ; on ne peut pas nier l'intérêt d'avoir
gardé la même règle du jeu pendant plus de trente ans pour observer l'évolution du calcul haute
performance dans son ensemble.*

## Ce qu'il faut retenir

Le TOP500 ne prétend pas mesurer « la meilleure machine du monde » dans l'absolu, mais mesure, avec
un protocole unique et documenté, la capacité d'un système à résoudre un système linéaire dense en
double précision, le plus vite possible. Rmax donne la performance mesurée, Rpeak le plafond
théorique et leur rapport donne une indication d'efficacité que ses créateurs jugent
représentative, tout en avertissant explicitement que les résultats sont des « reference points
for further evaluations », pas un verdict universel sur la performance applicative réelle.

Comprendre cette nuance, c'est comprendre pourquoi un supercalculateur peut dominer le TOP500 tout
en étant loin d'être le plus adapté à telle ou telle charge de travail scientifique, mais aussi pourquoi
la communauté HPC continue, en parallèle, à développer d'autres benchmarks pour combler ce que
Linpack ne mesure pas.

## Sources
- **Source officielle** : TOP500, page Project/History, https://top500.org/project/
- **Source officielle** : TOP500, Frequently Asked Questions, https://top500.org/resources/frequently-asked-questions/
