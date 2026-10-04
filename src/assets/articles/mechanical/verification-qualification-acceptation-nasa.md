---
title: "Vérification, qualification, acceptation, certification : ce que la NASA distingue (et que beaucoup d'ingénieurs confondent)"
category: mechanical
date: 2026-07-13
author: Geoffrey Aubert
tags: ["ingenierie-systeme", "verification-validation", "nasa", "mecanique", "qualite"]
summary: "Le NASA Systems Engineering Handbook distingue rigoureusement vérification, validation, qualification, acceptation et certification, une clarification directement utile à tout ingénieur mécanique, même hors spatial."
readTime: 7
---

## Un vocabulaire flou, une source qui ne l'est pas

Sur un projet mécanique, on entend souvent les mots « vérifié », « qualifié », « validé »,
« certifié » employés presque comme des synonymes. Un banc d'essai « valide » une pièce. Un
composant « certifié conforme » alors qu'il n'a en réalité subi qu'une inspection visuelle. Cette
imprécision n'est pas anodine, car elle peut faire livrer un produit qui n'a jamais été testé dans les
conditions qu'il rencontrera réellement.

La NASA, qui conçoit du matériel dont l'échec n'est pas une option (un instrument qui part sur
Mars ne se répare pas), a formalisé ces notions dans son **NASA Systems Engineering Handbook**
(référence officielle **NASA/SP-2016-6105 Rev2**, qui remplace la révision de 2007). Ce document
définit précisément cinq notions que l'industrie mécanique et aérospatiale confond régulièrement.
Elles s'appliquent bien au-delà du spatial, puisque tout ingénieur qui conçoit du matériel physique
destiné à fonctionner de manière fiable y trouve un cadre directement transposable.

## Vérification et validation : deux questions différentes

Le handbook pose la distinction fondatrice en une phrase :

> « Simply put, the Product Verification Process answers the critical question, "Was the end
> product realized right?" The Product Validation Process addresses the equally critical
> question, "Was the right end product realized?" »

Autrement dit :
- **La vérification** répond à « ai-je bien construit le produit ? » en comparant le produit
  réalisé à ses exigences spécifiées (un cahier des charges, une spécification d'interface).
- **La validation** répond à « ai-je construit le bon produit ? » en comparant le produit aux
  attentes réelles des parties prenantes, telles que décrites dans le concept d'opérations
  (ConOps).

Un produit peut parfaitement passer la vérification (il respecte chaque exigence écrite) et
échouer la validation (les exigences elles-mêmes étaient mal formulées ou incomplètes). Le
handbook précise aussi que ces deux activités reposent sur des référentiels distincts, puisque « Verification
testing relates back to the approved requirements set (such as an SRD) […]. Validation relates
back to the ConOps document. » Confondre les deux, c'est risquer de vérifier consciencieusement
un produit qui ne répond pas au vrai besoin.

## Les quatre méthodes de vérification

Le handbook définit quatre méthodes pour prouver qu'une exigence est satisfaite, décrites dans la
section 5.3 (« Methods of Verification ») :

- **Analyse (Analysis)** : « The use of mathematical modeling and analytical techniques to
  predict the suitability of a design […]. Analysis is generally used when a prototype;
  engineering model; or fabricated, assembled, and integrated product is not available. »
  Elle est utilisée quand le produit physique n'existe pas encore (calculs de structure, simulation,
  vérification par similarité avec un produit ayant déjà volé).
- **Démonstration (Demonstration)** : « Showing that the use of an end product achieves the
  individual specified requirement. It is generally a basic confirmation of performance
  capability, differentiated from testing by the lack of detailed data gathering. » Le handbook donne
  pour exemple la vérification que toutes les commandes sont accessibles au pilote en le faisant
  s'installer dans une maquette de cockpit.
- **Inspection** : « The visual examination of a realized end product. Inspection is generally
  used to verify physical design features or specific manufacturer identification. » Le handbook
  cite l'exemple d'une goupille de sécurité devant porter un fanion rouge « Remove Before Flight »,
  si bien qu'une inspection visuelle suffit à vérifier cette exigence.
- **Test** : « The use of an end product to obtain detailed data needed to verify performance or
  provide sufficient information to verify performance through further analysis. […] Testing
  produces data at discrete points for each specified requirement under controlled conditions and
  is the most resource-intensive verification technique. » Le handbook résume la philosophie
  à l'aide d'un mot d'ordre du domaine spatial, *« Test as you fly, and fly as you test. »*

Le choix de la méthode n'est pas arbitraire, puisque le test est le plus coûteux en ressources mais
produit les données les plus fiables, que l'analyse est la seule option quand le matériel n'existe
pas encore et que l'inspection suffit pour des caractéristiques purement visuelles ou administratives.

## Vérification, qualification, acceptation, certification : la chaîne de confiance

C'est sans doute la distinction la plus utile et la moins connue en dehors du spatial. Le handbook
consacre un encadré dédié (« Differences Between Verification, Qualification, Acceptance and
Certification ») à quatre notions qu'on associe trop souvent en une seule étape :

| Notion | Définition (NASA SE Handbook) | Fréquence |
|---|---|---|
| **Vérification** | « A formal process, using the method of test, analysis, inspection or demonstration, to confirm that a system and its associated hardware and software components satisfy all specified requirements. » | Une fois, quel que soit le nombre d'unités produites (tant que la conception ne change pas) |
| **Qualification** | « Activities performed to ensure that the flight unit design will meet functional and performance requirements in anticipated environmental conditions. A subset of the verification program is performed at the extremes of the environmental envelope […]. » | Une fois, sur les extrêmes de l'enveloppe environnementale |
| **Acceptation** | « A smaller subset of the verification program […] performed on each of the flight units as they are manufactured […] to show that the manufacturing/workmanship of the unit conforms to the design that was previously verified/qualified. » | Sur **chaque** unité produite |
| **Certification** | « The audit process by which the body of evidence that results from the verification activities and other activities are provided to the appropriate certifying authority to indicate the design is certified for flight/use. » | Une fois, c'est un audit du dossier de preuves, pas un test en soi |

La logique est cohérente : on **vérifie** une conception une seule fois contre l'ensemble de ses
exigences ; on la **qualifie** en la poussant aux extrêmes de son environnement prévu pour établir
des marges de fonctionnement ; on **accepte** ensuite chaque exemplaire produit en série, avec un
sous-ensemble de tests plus léger, pour s'assurer que la fabrication n'a pas introduit de défaut ;
et la **certification** est l'acte final où une autorité tierce audite l'ensemble des preuves
accumulées pour autoriser l'usage. Sur un projet mécanique classique, ignorer cette distinction
conduit à des dérives fréquentes : traiter un test d'acceptation comme s'il valait qualification,
ou l'inverse, c'est-à-dire sur-tester chaque unité de série avec la rigueur d'une campagne de qualification,
ce qui coûte cher sans apporter d'information supplémentaire.

## Le processus de vérification produit : cinq activités

Le handbook structure le Product Verification Process en cinq activités majeures :

1. **Préparer** la conduite de la vérification (procédures, ressources, articles à tester
   disponibles) ;
2. **Réaliser** la vérification ;
3. **Analyser** les résultats obtenus ;
4. **Rédiger** un rapport de vérification ;
5. **Capitaliser** les livrables produits durant l'activité.

Le handbook insiste sur le fait que l'approche de vérification doit être *adaptée* (« tailored »)
au projet, puisque le type de projet, les enjeux de coût et de calendrier et l'analyse de risque (par
exemple une AMDEC, dite *Failure Mode and Effects Analysis* ou FMEA dans le texte) influencent
directement l'étendue du programme de vérification retenu. Le document fournit même, en table
5.3-1, la structure attendue d'une procédure et d'un rapport de vérification : identification de
l'article testé, objectifs, configuration d'essai, écarts par rapport à la configuration
opérationnelle, critères d'acceptation avec tolérances et conclusions signées attestant de la
recevabilité des résultats.

## Pourquoi ça compte hors du spatial

On pourrait penser ce vocabulaire réservé aux projets où l'échec coûte une mission. En réalité, la
même logique s'applique dès qu'un produit mécanique doit fonctionner de manière fiable dans un
environnement contraint : un actionneur automobile, un capteur industriel, un équipement médical.
Utiliser précisément ces cinq mots (vérification, validation, qualification, acceptation,
certification) plutôt que les employer indifféremment, c'est éviter une ambiguïté qui peut coûter
cher en fin de projet, quand on découvre qu'un produit « validé » n'a en réalité subi qu'une
inspection visuelle.

## Sources

- **NASA Systems Engineering Handbook**, NASA/SP-2016-6105 Rev2 (supersedes SP-2007-6105 Rev1,
  décembre 2007), [nasa.gov/reference/systems-engineering-handbook](https://www.nasa.gov/reference/systems-engineering-handbook/),
  PDF : [nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf](https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf),
  section 5.3 « Product Verification Process » (distinction vérification/qualification/
  acceptation/certification, méthodes de vérification), section 2.4 (vérification vs validation).
