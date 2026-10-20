---
title: "Le moteur d'ingénierie système de la NASA : 17 processus pour ne pas perdre le contrôle d'un projet complexe"
category: mechanical
date: 2026-07-12
author: Geoffrey Aubert
tags: ["ingenierie-systeme", "NASA", "gestion-de-projet", "verification-validation", "cycle-de-vie"]
summary: "Le NASA Systems Engineering Handbook (NASA/SP-2016-6105 Rev2) formalise l'ingénierie système en 17 processus organisés autour d'un « moteur » et d'un cycle de vie en sept phases, ce que détaille la source officielle, qui montre aussi pourquoi la méthode dépasse largement l'aérospatial."
readTime: 8
---

Un lanceur, une sonde martienne ou un rover partagent avec n'importe quel projet technique ambitieux un même problème, à savoir que des centaines de sous-systèmes conçus par des équipes différentes doivent finir par former **un seul produit qui fonctionne**, dans les délais, dans le budget, sans surprise le jour du lancement. La NASA a formalisé sa réponse à ce problème dans le **NASA Systems Engineering Handbook** (référence officielle **NASA/SP-2016-6105 Rev2**, qui succède à la révision de 2007), un document destiné à « fournir une orientation générale et des informations sur l'ingénierie système utiles à la communauté NASA ». Ce n'est pas un manuel réservé aux fusées mais une méthode pour piloter la complexité technique, qui éclaire directement ce que font, à leur échelle, un lead dev ou un architecte logiciel.

## Ce que la NASA appelle « ingénierie système »

La source pose une définition précise, qu'il vaut la peine de citer intégralement, selon laquelle l'ingénierie système est « une approche méthodique et multidisciplinaire pour la conception, la réalisation, la gestion technique, l'exploitation et le retrait d'un système ». Un « système », dans ce cadre, est « la combinaison d'éléments qui fonctionnent ensemble pour produire la capacité requise pour répondre à un besoin », matériel, logiciel, équipements, installations, personnel, processus et procédures compris.

Le point important, souligné par le handbook, est que la valeur ajoutée par le système dans son ensemble, au-delà de ce que chaque partie apporte isolément, vient principalement de **la façon dont les parties sont interconnectées**. C'est exactement le problème qu'affronte un architecte logiciel face à un système distribué, puisque la valeur, tout comme le risque, se cache dans les interfaces plutôt que dans les composants pris séparément.

## Le « moteur » à 17 processus

Le cœur du handbook est ce qu'il appelle le **SE Engine** (le moteur d'ingénierie système), défini par la norme interne NPR 7123.1 *(NASA Systems Engineering Processes and Requirements)*. Il regroupe **17 processus techniques communs**, répartis en trois familles :

**Processus de conception système** (System Design) :
1. Définition des attentes des parties prenantes (Stakeholder Expectations Definition)
2. Définition des exigences techniques (Technical Requirements Definition)
3. Décomposition logique (Logical Decomposition)
4. Définition de la solution de conception (Design Solution Definition)

**Processus de réalisation du produit** (Product Realization) :
5. Implémentation du produit
6. Intégration du produit
7. Vérification du produit
8. Validation du produit
9. Transition du produit

**Processus de gestion technique transversale** (Technical Management), qui traversent tout le projet :
10. Planification technique
11. Gestion des exigences
12. Gestion des interfaces
13. Gestion des risques techniques
14. Gestion de la configuration
15. Gestion des données techniques
16. Évaluation technique
17. Analyse de décision

Le handbook précise que « tous les 17 processus sont applicables à tous les projets », mais que « le niveau de formalisme, la profondeur de documentation et les échelles de temps varient selon le type, la taille et la complexité du projet ». Autrement dit, le squelette ne change pas et seul le degré de rigueur s'adapte, un principe qu'un lead dev applique déjà, consciemment ou pas, quand il calibre la revue de code ou la documentation d'architecture selon la criticité du composant.

Autre détail utile pour qui travaille en environnement qualité aéronautique, le handbook fournit une table de correspondance explicite entre ces 17 processus et la norme **AS9100** (le référentiel qualité de l'aérospatiale commerciale), ce qui prouve que ce cadre n'est pas une lubie interne mais s'aligne sur un standard industriel plus large.

## Vérification et validation : deux questions différentes

C'est sans doute la distinction la plus citée du document et elle mérite d'être reprise mot pour mot parce qu'elle est souvent confondue en pratique :

> « La vérification d'un produit apporte la preuve de conformité aux exigences, à savoir que le produit peut satisfaire chaque énoncé « shall » [obligation contractuelle], démontré par un test, une analyse, une inspection ou une démonstration (ou une combinaison de ceux-ci). »

> « La validation d'un produit montre que le produit accomplit l'usage prévu dans l'environnement prévu, c'est-à-dire qu'il répond aux attentes du client et des autres parties prenantes, démontré par un test, une analyse, une inspection ou une démonstration. »

En clair, la vérification répond à « ai-je construit le produit correctement, conformément à ce qui était écrit dans la spec ? » tandis que la validation répond à « ai-je construit le bon produit, celui qui répond au vrai besoin ? ». Le handbook insiste sur le fait que la validation « peut être réalisée à chaque phase de développement en utilisant les produits de la phase (par exemple des modèles), pas seulement à la livraison ». C'est un rappel direct contre la tentation de tout reporter en fin de projet, qu'on parle d'un satellite ou d'une mise en production logicielle.

## Le dilemme de l'ingénieur système et le prix de la correction tardive

Le handbook formalise sous le nom de **« Systems Engineer's Dilemma »** une tension que tout responsable technique reconnaît :

> « À chaque solution rentable : pour réduire le coût à risque constant, la performance doit être réduite. Pour réduire le risque à coût constant, la performance doit être réduite. Pour réduire le coût à performance constante, des risques plus élevés doivent être acceptés. Pour réduire le risque à performance constante, des coûts plus élevés doivent être acceptés. »

Coût, risque et performance sont liés, si bien qu'on ne bouge jamais un seul curseur. Le document ajoute que, dans ce triangle, **le temps se comporte comme une forme de coût**, puisque repousser un jalon a le même effet budgétaire qu'ajouter des ressources.

Le handbook illustre ensuite, avec une courbe adaptée de l'INCOSE (norme de référence en ingénierie système), pourquoi les décisions précoces pèsent disproportionnellement lourd en notant que « pendant la conception, seuls environ 15 % des coûts pourraient être dépensés, mais la conception elle-même engagera environ 75 % du coût total du cycle de vie ». La raison est mécanique, car la façon dont un système est conçu déterminera le coût de sa fabrication, de son intégration, de son exploitation et de sa maintenance. Un défaut non détecté avant la vérification finale coûte, selon la même figure, un ordre de grandeur, voire plusieurs, de plus à corriger qu'un défaut trouvé pendant la conception. C'est le même raisonnement qui justifie, en développement logiciel, de préférer une revue d'architecture en amont à un correctif en production.

## Un cycle de vie en sept phases, verrouillé par des jalons

Pour discipliner l'exécution, la NASA découpe chaque projet spatial en sept phases (norme NPR 7120.5), séparées par des **Key Decision Points (KDP)**, c'est-à-dire « les événements où l'autorité de décision détermine si le programme/projet est prêt à progresser vers la phase suivante ». Une décision de poursuivre peut être conditionnée à des réserves à lever dans un délai convenu ; à défaut, le projet peut être arrêté.

| Phase | Objet |
|---|---|
| Pre-Phase A | Études de concept visant à explorer les idées et évaluer la faisabilité |
| Phase A | Développement du concept et de la technologie |
| Phase B | Conception préliminaire et finalisation de la technologie |
| Phase C | Conception finale et fabrication |
| Phase D | Assemblage du système, intégration, tests, lancement |
| Phase E | Exploitation et maintien en condition |
| Phase F | Clôture |

Chaque transition s'appuie sur des revues formelles, de la MCR (revue du concept de mission) jusqu'à l'ORR (revue de préparation opérationnelle) en passant par la SRR (revue des exigences système), la PDR (revue de conception préliminaire) et la CDR (revue de conception critique). Le handbook précise que le moteur SE (les 17 processus) « tourne » plusieurs fois au fil de ces phases : cinq fois pour les processus de conception et de réalisation entre la Pre-Phase A et la Phase D, sept fois pour les processus de gestion technique transversale, de la Pre-Phase A à la Phase F. L'idée est que les mêmes processus se répètent à chaque niveau du système (sous-système, système, segment) et pas seulement une fois globalement.

## Pourquoi ça dépasse l'aérospatial

Rien dans ce cadre n'est spécifique aux fusées, puisque la définition d'exigences vérifiables, la distinction vérification/validation, la gestion de configuration, l'analyse de décision structurée et le principe « corriger tôt coûte moins cher » s'appliquent à tout système suffisamment complexe pour qu'aucune personne seule n'en ait la vue complète (un système d'information bancaire, une chaîne de production industrielle ou une plateforme logicielle distribuée). Le NASA Systems Engineering Handbook ne prétend pas inventer l'ingénierie système ; il la documente avec une rigueur et un niveau de retour d'expérience (le handbook cite explicitement les leçons tirées de l'accident de la navette Columbia et du rapport Diaz) qui en font une référence solide pour quiconque doit structurer la conduite d'un projet technique complexe, bien au-delà de la NASA elle-même.

## Sources

- **Source officielle** : NASA Systems Engineering Handbook, NASA/SP-2016-6105 Rev2 (6 février 2019), NASA Office of the Chief Engineer, [PDF officiel](https://www.nasa.gov/wp-content/uploads/2018/09/nasa_systems_engineering_handbook_0.pdf), page de référence [nasa.gov/reference/systems-engineering-handbook](https://www.nasa.gov/reference/systems-engineering-handbook/)
- Norme citée par la source pour le cycle de vie des projets spatiaux : NPR 7120.5, *NASA Space Flight Program and Project Management Requirements*
- Norme citée par la source pour les processus techniques : NPR 7123.1, *NASA Systems Engineering Processes and Requirements*
