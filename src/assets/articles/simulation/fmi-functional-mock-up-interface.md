---
title: "FMI : le standard qui fait parler entre eux les simulateurs multi-physiques"
category: simulation
date: 2026-08-26
author: Geoffrey Aubert
tags: ["FMI", "co-simulation", "simulation", "interoperabilite", "systemes-embarques"]
summary: "FMI 3.0 est le standard ouvert qui permet d'échanger des modèles dynamiques entre outils de simulation via un simple ZIP, sans dépendre d'un éditeur unique. Tour d'horizon de ses trois interfaces, de la structure d'un FMU et de son API C."
readTime: 8
---

Imaginez un projet automobile où le modèle du moteur vient d'un outil, celui de la boîte de
vitesses d'un autre, celui de la dynamique du véhicule d'un troisième tandis que le contrôleur logiciel
est simulé dans un quatrième environnement. Sans standard commun, faire dialoguer ces briques
relève du bricolage : connecteurs propriétaires, réécritures manuelles, verrouillage chez un seul
éditeur. C'est exactement le problème que résout le **Functional Mock-up Interface (FMI)**.

FMI est décrit par sa spécification officielle comme « a free standard that defines a container
and an interface to exchange dynamic models using a combination of XML files, binaries and C
code, distributed as a ZIP file ». Autrement dit, il s'agit d'un format d'échange indépendant de l'outil
qui a généré le modèle et de l'outil qui va l'exécuter. Le standard est maintenu par le **Modelica
Association Project FMI (MAP FMI)**, qui a pris la suite du consortium européen MODELISAR
(2008-2011). Il revendique aujourd'hui plus de 200 outils compatibles et son développement se
fait ouvertement sur GitHub (`modelica/fmi-standard`).

Cet article couvre la version **FMI 3.0** (spécification 3.0.2), la révision majeure du standard,
et ce qu'elle change par rapport à FMI 2.0.

## Un FMU : un modèle emballé dans un ZIP

L'unité de base du standard est le **FMU** (Functional Mock-up Unit), à savoir « one ZIP file »
contenant tout ce qu'il faut pour intégrer un modèle dans un autre environnement. Sa structure
type comprend :

- `modelDescription.xml`, la carte d'identité du modèle ;
- `binaries/`, les bibliothèques compilées (`.dll`, `.so`) prêtes à charger ;
- `sources/`, le code C source, si le fournisseur choisit de le distribuer plutôt que de ne
  livrer que des binaires ;
- `documentation/`, la doc associée au modèle ;
- `resources/`, des fichiers annexes utilisés à l'exécution (tables, cartographies, etc.) ;
- `extra/`, des données spécifiques à un outil ou un usage particulier.

Le fichier `modelDescription.xml` « defines the structure and content of a model description
file », puisqu'on y trouve chaque variable du modèle avec sa **causality** (`input`, `output`,
`parameter`, `local`, `independent`), sa **variability** (`constant`, `fixed`, `tunable`,
`discrete`, `continuous`), son état initial, mais surtout sa **value reference**, c'est-à-dire un
identifiant numérique qui sert de clé pour accéder à cette variable via l'API C. C'est ce fichier XML qui
permet à un outil d'importer un FMU sans avoir eu accès au code source de son fournisseur.

Un principe directeur explicite de la spec mérite d'être cité, car il explique pourquoi ce format
tient la route en production, puisqu'il y est écrit qu'« It is possible to compile, link and
distribute an FMU without knowing the environment in which the FMU will be loaded ». Le fournisseur
du modèle et l'intégrateur qui l'utilise n'ont besoin de rien se dire à l'avance, il leur suffit de
respecter la même version du standard. La spec insiste aussi sur un faible overhead à l'exécution et une empreinte
mémoire réduite, en gardant les informations statiques dans le XML plutôt que dans les binaires.

Il faut aussi savoir que la spécification ne couvre pas la génération du FMU, puisqu'elle précise
que « This document does not describe how to generate an FMU from a modeling environment. » FMI
standardise l'échange et non la fabrication, de sorte que chaque outil de modélisation (Modelica,
Simulink, etc.) reste libre dans sa façon de produire un FMU conforme.

## Trois interfaces, trois façons de piloter le temps

C'est sans doute le point le plus structurant du standard, puisque FMI ne propose pas un seul mode
de couplage mais trois, qui se distinguent par **qui contrôle le pas de temps et l'intégration
numérique**.

### Model Exchange (ME)

« The Model Exchange interface exposes an ODE to an external solver of an importer. » Le FMU ne
contient ici aucun solveur, puisqu'il se contente d'exposer ses équations différentielles (état,
dérivées, événements) tandis que l'environnement importateur fournit son propre intégrateur
numérique pour faire avancer le temps. C'est le mode le plus fin, dans la mesure où l'outil hôte
garde un contrôle total sur le pas d'intégration et peut fusionner les équations de plusieurs
modèles dans un seul système résolu ensemble.

### Co-Simulation (CS)

« The Co-Simulation interface is designed both for the coupling of simulation tools, and the
coupling of subsystem models. » Ici, à l'inverse, le FMU embarque son propre solveur. L'outil
hôte ne fait qu'avancer le FMU d'un pas de temps à la fois via un appel de fonction dédié, sans
connaître le détail de son intégration interne. C'est le mode privilégié pour coupler des outils
de simulation hétérogènes qui ne veulent (ou ne peuvent) pas exposer leurs équations internes, ce
qui sert typiquement à protéger la propriété intellectuelle d'un modèle fournisseur.

### Scheduled Execution (SE)

Nouvelle en FMI 3.0, cette interface « has similarities to the Model Exchange interface: the
first externalizes a scheduling algorithm ». Le modèle est ici découpé en **partitions**
activées indépendamment par un ordonnanceur externe, plutôt qu'exécutées selon une boucle de
simulation unique. C'est pensé pour coller aux contraintes des systèmes embarqués temps réel, où
différentes parties d'un même modèle peuvent tourner à des cadences ou des priorités différentes.

Ce choix entre les trois interfaces n'est pas cosmétique puisqu'il détermine littéralement où réside
la responsabilité de la précision numérique, à savoir dans l'outil hôte (ME), dans le FMU (CS) ou
dans un ordonnanceur dédié (SE).

## L'API C : une séquence d'appels normalisée

FMI définit son interface de programmation en **C99**, répartie sur trois en-têtes :
`fmi3PlatformTypes.h`, `fmi3FunctionTypes.h` et `fmi3Functions.h`. Une simulation en
Co-Simulation suit typiquement cette séquence :

```c
// 1. Instantiation du FMU pour l'interface Co-Simulation
fmi3Instance instance = fmi3InstantiateCoSimulation(
    "modele_moteur", instantiationToken, resourcePath,
    fmi3False, fmi3False, /* ... */);

// 2. Entrée / sortie du mode d'initialisation
fmi3EnterInitializationMode(instance, fmi3False, 0.0, 0.0, fmi3False, 0.0);
// ... fixer les paramètres et conditions initiales via fmi3SetFloat64, fmi3SetInt32, etc.
fmi3ExitInitializationMode(instance);

// 3. Boucle de simulation pas à pas
double time = 0.0;
while (time < tFinal) {
    // fmi3SetFloat64 pour pousser les entrées du pas courant
    fmi3DoStep(instance, time, stepSize, fmi3True,
               &eventEncountered, &terminateSimulation, &earlyReturn, &lastSuccessfulTime);
    // fmi3GetFloat64 pour récupérer les sorties du pas courant
    time += stepSize;
}

// 4. Terminaison et libération
fmi3Terminate(instance);
fmi3FreeInstance(instance);
```

Selon l'interface, `fmi3DoStep` (CS) est remplacé par une boucle pilotée par `fmi3SetTime` côté
importateur (ME), ou par `fmi3ActivateModelPartition` déclenché par l'ordonnanceur (SE).

L'accès aux variables se fait exclusivement via des paires get/set typées, à savoir
`fmi3GetFloat64`/`fmi3SetFloat64`, `fmi3GetInt32`/`fmi3SetInt32`, `fmi3GetBoolean`/
`fmi3SetBoolean`, `fmi3GetString`/`fmi3SetString`, `fmi3GetBinary`/`fmi3SetBinary` ainsi que
`fmi3GetClock`/`fmi3SetClock` pour les Clocks, chacune prenant en paramètre un tableau de
`fmi3ValueReference`, les identifiants numériques définis dans `modelDescription.xml`. Pour la
sauvegarde et la reprise d'état (utile pour le rollback en co-simulation ou pour paralléliser des
scénarios), le standard fournit `fmi3GetFMUState`/`fmi3SetFMUState` ainsi que
`fmi3Serialize`/`fmi3DeserializeFMUState`, qui permettent de figer puis restaurer l'état complet
d'un FMU à un instant donné.

## Ce que FMI 3.0 change par rapport à FMI 2.0

FMI 3.0 n'est pas une simple mise à jour cosmétique. Parmi les évolutions notables listées par la
spécification :

- **Scheduled Execution** : une troisième interface entièrement nouvelle, pensée pour l'embarqué
  temps réel.
- **Clocks** : « introduction of Clocks to more exactly control timing of events and evaluation
  of model partitions across FMUs », soit un mécanisme de synchronisation d'événements plus précis
  entre plusieurs FMUs.
- **Terminals** : « introduction of terminals to group variables semantically to ease connecting
  compatible signals », ce qui revient à regrouper des variables qui forment un connecteur logique
  (par exemple les trois phases d'un signal électrique) pour fiabiliser les branchements entre
  modèles.
- **Types étendus** : Int8, UInt16, Float32 et un type binaire, en plus des types déjà présents
  en 2.0.
- **Variables tableaux multi-dimensionnelles**, stockées en ordre *row-major*.
- **Paramètres structurels modifiables à l'exécution**, pour changer la taille d'un tableau sans
  réinstancier le FMU.
- **Co-simulation renforcée** : retour anticipé (*early return*), Event Mode, Intermediate Update
  Mode ainsi que l'usage des Clocks pour un contrôle plus fin du couplage.
- **Dérivées adjointes** et une section `BuildConfiguration` dans le modelDescription, pour
  faciliter la recompilation d'un FMU distribué avec ses sources.

Ces ajouts répondent à des besoins concrets remontés par l'industrie, puisque les Clocks et le Scheduled
Execution ciblent explicitement les architectures embarquées multi-cadences, tandis que les
terminaux et les types étendus fiabilisent l'intégration de modèles complexes issus d'outils très
différents.

## Pourquoi ce standard compte

FMI n'invente pas la simulation multi-physique mais il en résout le problème d'intégration. Sans
lui, chaque couplage entre deux outils de simulation redevient un projet d'ingénierie logicielle
à part entière. Avec lui, un fournisseur de composant peut livrer un modèle sous forme de FMU
sans révéler ses équations (mode Co-Simulation), un intégrateur système peut fusionner des
sous-modèles dans un solveur unique (mode Model Exchange) et un ingénieur embarqué peut
ordonnancer des partitions de modèle selon les contraintes temps réel de sa cible (mode Scheduled
Execution). Le tout repose sur un format d'échange (un ZIP, un XML, quelques en-têtes C) suffisamment
simple pour être implémenté indépendamment par plus de 200 outils, du logiciel commercial au
solveur open source.

## Sources

- **Spécification officielle** : FMI 3.0.2, Modelica Association Project FMI, https://fmi-standard.org/docs/3.0.2/
- **Site du standard FMI**, https://fmi-standard.org/
- **Guide d'implémentation FMI**, https://modelica.github.io/fmi-guides/main/fmi-guide/
