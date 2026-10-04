---
title: "Slurm : comment un ordonnanceur open source pilote la majorité des supercalculateurs"
category: hpc
date: 2026-09-29
author: Geoffrey Aubert
tags: ["hpc", "slurm", "cluster", "ordonnancement", "calcul-parallele"]
summary: "Plongée dans Slurm Workload Manager, l'ordonnateur de jobs open source qui répartit le travail sur la plupart des clusters HPC : architecture, files de partitions, commandes clés et intégration MPI."
readTime: 7
---

# Slurm : comment un ordonnanceur open source pilote la majorité des supercalculateurs

Quand on pense "supercalculateur", on imagine des armoires de racks et des benchmarks TOP500.
Mais avant même de faire tourner le moindre calcul, il faut résoudre un problème plus terre à
terre : qui a le droit d'utiliser quels nœuds, pendant combien de temps, et dans quel ordre
quand tout le monde veut la même ressource en même temps. C'est le rôle de **Slurm Workload
Manager**, développé par SchedMD, présenté dans sa documentation officielle comme
« an open source, fault-tolerant, and highly scalable cluster management and job scheduling
system for large and small Linux clusters » ([quickstart.html](https://slurm.schedmd.com/quickstart.html)).
Autrement dit : Slurm ne fait pas le calcul lui-même, il décide qui calcule, où, et quand — sans
nécessiter de modification du noyau Linux.

Pour un développeur habitué au monde applicatif (Kubernetes, files de jobs Kafka, cron), Slurm
est un cousin conceptuel : un ordonnanceur de ressources avec file d'attente et priorités, mais
pensé pour des jobs parallèles qui peuvent occuper des milliers de nœuds pendant des heures ou
des jours.

## Trois fonctions, pas plus

La documentation résume le rôle de Slurm en trois points précis. Il sert à :

1. **Allouer l'accès aux ressources** — exclusif ou non — à des nœuds de calcul, pour une durée
   donnée, afin que les utilisateurs puissent effectuer du travail.
2. **Fournir un framework** pour démarrer, exécuter et surveiller du travail — typiquement un
   job parallèle — sur l'ensemble des nœuds alloués.
3. **Arbitrer la contention** pour les ressources en gérant une file d'attente de travail en
   attente.

Ce triptyque — allocation, exécution/supervision, arbitrage — est la même logique que celle
qu'on retrouve dans n'importe quel ordonnanceur de ressources, mais appliquée à une échelle où
une "ressource" est un nœud de calcul entier avec ses CPU, sa mémoire et parfois ses GPU, pas un
simple conteneur.

## Une architecture à deux niveaux, tolérante aux pannes

Slurm repose sur une architecture de démons relativement simple à décrire : chaque nœud de
calcul du cluster exécute un démon **`slurmd`**, pendant qu'un nœud de gestion central exécute
le démon **`slurmctld`**, qui peut lui-même être basculé sur un nœud de secours en cas de panne.
Les communications entre ces composants sont hiérarchiques et conçues pour rester tolérantes aux
pannes, ce qui est indispensable dès qu'on parle de clusters de plusieurs milliers de nœuds : un
seul point de défaillance rigide serait inacceptable à cette échelle.

## Les quatre entités que Slurm manipule

La doc officielle structure tout le modèle mental de Slurm autour de quatre notions :

- **Nodes** — la ressource de calcul de base.
- **Partitions** — des regroupements logiques de nœuds, potentiellement chevauchants, qu'on peut
  voir comme des files de jobs distinctes. Chaque partition peut porter ses propres contraintes :
  taille maximale de job, limite de temps, utilisateurs autorisés, etc.
- **Jobs** — une allocation de ressources accordée à un utilisateur pendant une période donnée.
- **Job steps** — des ensembles de tâches, potentiellement exécutées en parallèle, au sein d'un
  même job.

C'est cette hiérarchie job → job steps qui distingue vraiment Slurm d'un simple ordonnanceur de
tâches unitaires : un seul job peut contenir plusieurs étapes, chacune pouvant lancer du travail
parallèle sur tout ou partie des nœuds alloués au job.

## Les commandes qu'on utilise vraiment

Slurm expose un ensemble de commandes utilisateur qui recouvrent tout le cycle de vie d'un
calcul :

- **`sbatch`** soumet un script de job pour une exécution différée (le mode "batch" classique).
- **`srun`** soumet un job ou lance des job steps en temps réel.
- **`salloc`** alloue des ressources de manière interactive, typiquement pour lancer un shell.
- **`squeue`** affiche l'état des jobs et des job steps, triés par priorité.
- **`sinfo`** affiche l'état des partitions et des nœuds.
- **`scancel`** annule un job ou un job step, ou lui envoie un signal.
- **`scontrol`** est l'outil d'administration pour consulter et modifier l'état de Slurm.
- **`sacct`** donne les informations de comptabilité des jobs actifs ou terminés.
- **`sattach`** rattache stdin/stdout/stderr et les signaux à un job ou step en cours.
- **`sbcast`** transfère un fichier du disque local vers le disque local des nœuds alloués.
- **`sview`** fournit une interface graphique sur l'ensemble.

Dans la doc, une sortie type de `sinfo` montre des partitions nommées comme `debug*` ou `batch`,
avec leur état (UP/DOWN), leur limite de temps, leur nombre de nœuds et la liste des nœuds en
notation compacte (par exemple `adev[1-5]`). Une sortie type de `squeue` liste `JOBID`,
`PARTITION`, `NAME`, `USER`, `ST` (l'état — `R` pour Running, `PD` pour Pending), `TIME`,
`NODES` et `NODELIST(REASON)`. Les raisons de mise en attente les plus courantes sont
"Resources" (le job attend que les ressources demandées se libèrent) ou "Priority" (le job est
derrière un autre job plus prioritaire dans la file).

Un exemple simple illustre le lancement direct d'une tâche : `srun -N3 -l /bin/hostname` exécute
la commande sur 3 nœuds, chaque sortie étant préfixée par le numéro de la tâche qui l'a produite.
Côté batch, un script contenant des directives `#SBATCH` (par exemple `#SBATCH --time=1`) peut
être soumis avec `sbatch -n4 -w "adev[9-10]" -o my.stdout my.script` — et la documentation
précise que les options passées en ligne de commande surchargent celles écrites dans le script.

## Pas de disque partagé automatique

Un point souvent sous-estimé quand on découvre Slurm avec un réflexe "cloud" : Slurm ne migre pas
automatiquement les fichiers d'un job vers les nœuds qui l'exécutent. Il faut soit un système de
fichiers partagé au niveau du cluster (NFS, Lustre...), soit distribuer explicitement les
exécutables et données avec `sbcast`, qui transfère un fichier depuis le disque local vers le
disque local des nœuds alloués — utile notamment sur les nœuds sans disque partagé. `salloc
-N1024 bash`, par exemple, crée une allocation de 1024 nœuds et lance un shell interactif dans
ce contexte ; encore faut-il ensuite que l'exécutable soit accessible sur tous ces nœuds.

## Bonnes pratiques : job steps et job arrays

La documentation insiste sur un point de conception important pour l'efficacité du cluster :
« regrouper le travail lié en plusieurs job steps au sein d'un seul job Slurm » plutôt que de
soumettre des jobs séparés, ce qui réduit l'overhead d'ordonnancement. Pour les besoins
répétitifs — une même exécution à faire tourner sur de nombreux jeux de paramètres identiques en
ressources —, les **job arrays** sont présentés comme « un mécanisme efficace pour gérer une
collection de jobs batch » : ils sont administrés comme une entité unique, ce qui permet par
exemple de tous les annuler d'un coup plutôt que job par job.

## Et le support MPI dans tout ça ?

Slurm ne réinvente pas MPI, il s'interface avec lui, et la documentation distingue trois modes
d'intégration selon l'implémentation MPI utilisée :

1. Slurm lance directement les tâches et initialise les communications via les APIs PMI2 ou
   PMIx — le cas de la plupart des implémentations MPI modernes.
2. Slurm crée l'allocation de ressources, puis `mpirun` lance les tâches en s'appuyant sur
   l'infrastructure Slurm — un schéma associé aux anciennes versions d'OpenMPI.
3. Slurm crée l'allocation, mais `mpirun` lance les tâches par un autre mécanisme (SSH/RSH),
   entièrement hors du contrôle de Slurm. Dans ce dernier cas, la documentation recommande
   d'utiliser `pam_slurm_adopt` ainsi qu'un epilog pour purger ces tâches orphelines une fois le
   job terminé.

Ce détail sur le mode 3 rappelle une réalité pratique du HPC : tout ce qui échappe à
l'ordonnanceur central peut laisser des processus fantômes sur les nœuds si on ne nettoie pas
explicitement derrière soi.

## Pourquoi ça compte, même si vous ne faites pas de calcul scientifique

Slurm équipe une large part des clusters de recherche et industriels dans le monde, et son
modèle — partitions comme files contraintes, jobs composés de steps, arbitrage par priorité —
est une référence utile même en dehors du calcul scientifique pur : c'est un cas d'école
d'ordonnanceur de ressources à grande échelle, dans un registre différent de Kubernetes (orienté
services longue durée) mais tout aussi rigoureux sur la tolérance aux pannes et la gestion de la
contention.

## Sources
- **Source officielle** : documentation officielle SchedMD, guide de démarrage Slurm (version 26.05) — https://slurm.schedmd.com/quickstart.html
- Page de documentation générale Slurm — https://slurm.schedmd.com/documentation.html
