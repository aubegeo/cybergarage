---
title: "Corrosion spatiale : ce que dit la norme ECSS-Q-ST-70-14C sur les matériaux métalliques"
category: mechanical
date: 2026-09-05
author: Geoffrey Aubert
tags: ["ecss", "corrosion", "materiaux", "spatial", "aerospace"]
summary: "D'après la norme ECSS-Q-ST-70-14C, l'Agence Spatiale Européenne classe les huit formes de corrosion, les environnements et les finitions métalliques autorisées sur le matériel de vol."
readTime: 7
---


Un satellite ou un lanceur ne passe pas sa vie entière dans le vide spatial. Avant le
décollage, il est fabriqué, testé, stocké, transporté et intégré, parfois pendant des
années, dans des environnements terrestres bien plus hostiles pour un métal que l'orbite
elle-même : atmosphère marine, salles blanches, sites de lancement en bord de mer. La norme
européenne **ECSS-Q-ST-70-14C « Corrosion »**, publiée le 1er novembre 2016 par l'ECSS
(European Cooperative for Space Standardization, un effort conjoint de l'ESA, des agences
spatiales nationales et de l'industrie européenne), encadre précisément ce risque. Son
objectif, formulé dans l'introduction du document, est triple : « assess the risk of each
form of corrosion », « describe the corrosion protection requirements needed to mitigate the
risks of corrosion » et « define the acceptance criteria for the protected metal or alloy
system that shows fitness for purpose over the life of the mission ».

C'est un document d'assurance produit et non de conception structurelle au sens des
facteurs de sécurité NASA-STD-5001, ni de processus d'ingénierie système au sens du NASA
Systems Engineering Handbook, puisque l'angle y est purement celui des matériaux, c'est-à-dire
du choix du métal, de la finition, de l'environnement et de la méthode d'essai.

## Un périmètre volontairement restreint

Le texte est explicite sur ce qu'il couvre et ce qu'il ne couvre pas. La norme « specifies
the behaviour of metals and alloys but it does not remove the responsibility for the
degradation of other materials such as polymers or ceramics to be considered », autrement
dit elle ne traite que des matériaux métalliques, même si la dégradation des polymères et
céramiques reste une préoccupation à part entière ailleurs. Plus surprenant encore, la
corrosion sous contrainte (SCC, stress corrosion cracking), pourtant l'une des huit formes
de corrosion décrites plus loin, est explicitement exclue du champ des exigences, puisque le
texte précise que « this document does not cover the requirements for protection against
stress corrosion cracking (SCC) which has its own dedicated standard ECSS-Q-ST-70-36 ». Enfin,
le document couvre les « typical spacecraft and launcher programmes on ground for a period of
no more than 10 years », si bien que c'est la phase sol qui est visée en priorité, même si
les principes peuvent s'appliquer aux équipements de support au sol.

## Les huit formes de corrosion

La norme classe la corrosion en huit familles, détaillées dans son Annexe A (informative).
Selon le texte, « in the European Space Industry most corrosion problems experienced are
associated with general corrosion, galvanic corrosion and pitting », ce qui désigne les
trois formes à surveiller en priorité sur du matériel spatial.

- **Corrosion générale** : « characterised by its relatively uniform progress through a
  structure usually over a large area », la forme la plus courante et la plus prévisible.
- **Corrosion galvanique** : se produit quand deux métaux sont en contact électrique via un
  électrolyte. La norme donne un exemple concret et contre-intuitif avec des vis en acier
  inoxydable sur une structure en aluminium, qui forment en théorie un couple galvanique à
  risque, mais « in practice stainless steel screws are commonly used without any problems
  because the small area of steel relative to the large area of aluminium structure means
  that the current density driving corrosion is low and the effects are negligible ». Le
  rapport de surface anode/cathode compte autant que la nature des métaux.
- **Corrosion caverneuse (crevice)** : apparaît dans les crevasses où l'électrolyte stagne ;
  l'oxygène s'y épuise rapidement, tandis que les chlorures, très mobiles, migrent vers la
  zone appauvrie et forment des chlorures métalliques qui s'hydrolysent en acide, aggravant
  l'attaque localement.
- **Piqûration (pitting)** : décrite comme « one of the most destructive forms of corrosion ».
  Elle démarre quand un film passivant protecteur se rompt localement ; une membrane semi-
  perméable se forme au-dessus du défaut, le pH interne devient plus acide si bien que
  l'attaque s'auto-accélère.
- **Corrosion intergranulaire** : attaque préférentielle des joints de grains, plus
  énergétiques que le reste du réseau cristallin ; en général négligeable, mais parfois
  suffisamment rapide pour faire tomber des grains entiers de la structure.
- **Dealloying / lixiviation sélective** : un élément d'alliage est retiré préférentiellement,
  l'exemple classique cité étant la dézincification du laiton.
- **Corrosion-érosion** : accélération de l'attaque par le mouvement relatif entre le fluide
  corrosif et la surface métallique.
- **Corrosion sous contrainte (SCC)** : un mécanisme de rupture différée où « cracks initiate
  and propagate though a material until the stresses in the remaining ligament exceed the
  material's strength », traité, on l'a vu, par une norme dédiée.

La norme signale aussi un effet secondaire à ne pas négliger, car de l'hydrogène est
souvent généré comme sous-produit de ces réactions et sa dissolution dans le métal peut
provoquer « delayed fracture in titanium, high strength steels and martensitic alloys ».

## Six classes d'environnements, une matrice de tests

Pour qualifier une protection anticorrosion, il faut d'abord classer l'environnement
d'exposition. La Table 5-1 de la norme définit six classes, de sévérité décroissante de la
classe 1 à la classe 6 (à l'exception de la classe 4, traitée à part) :

1. Immersion en eau de mer.
2. Environnement marin atmosphérique (bord de mer).
3. Environnement extérieur continental, avec une précision utile pour l'Europe puisque « most
   of Europe is considered a marine environment », si bien que l'usage de la classe 3 y
   nécessite une justification dédiée basée sur un taux de dépôt de chlorures inférieur à
   5 mg/m²/jour.
4. Systèmes chimiques potentiellement corrosifs ou corrosion d'origine microbienne.
5. Environnement intérieur non contrôlé en humidité.
6. Environnement intérieur en température et humidité contrôlées, non condensant, air sec
   ou purgé à l'azote, avec un maximum de 65 % HR, typiquement une salle blanche.

La Table 5-2 associe à chaque classe une méthode de test précise : essai au brouillard salin
neutre (NSST) selon ISO 9227 (168 h pour la classe 5), essai UV selon ASTM D5894 alterné avec
le NSST pour la classe 3 (7 jours d'UV pour 500 h de NSST), essai d'immersion alternée selon
ISO 11130 pour les classes 1 et 2 (respectivement deux fois la durée maximale d'immersion
prévue et 30 jours) ainsi que l'essai de chaleur humide (« damp heat », détaillé en Annexe C,
à 93 ± 3 % HR et 40 ± 3 °C pendant 240 h) pour la classe 6. La classe 4 n'a pas d'essai
standardisé, la norme prévoyant un « specific test in accordance with corrosive agents »
propre au cas rencontré.

Un point pratique intéressant concerne la salle blanche, car la norme note que malgré une
humidité contrôlée à 55 % ± 10 % HR, où l'on ne s'attend pas à de la corrosion, « a small but
significant number of corrosion issues are reported in clean rooms each year », la plupart
liés non pas à une défaillance du contrôle d'ambiance mais à une **mauvaise circulation
d'air** créant des microclimats locaux où l'eau s'adsorbe en monocouches sur les surfaces.

## Finitions métalliques : ce qui est interdit, ce qui est encadré

La section 5.6 de la norme fixe des règles précises par type de revêtement, avec quelques
interdictions catégoriques.

La plus connue concerne l'étain, puisque « pure Tin plating coating shall not be used in
space applications ». La raison donnée est double, à savoir le risque de formation de
« whiskers » (filaments métalliques susceptibles de court-circuiter des circuits) et une
transformation allotropique appelée « tin pest » à basse température. La parade indiquée
est d'allier l'étain avec au moins 3 % d'un autre métal.

L'argenture est autorisée à condition de respecter la règle « silver plating over copper
shall be > 2 µm », car en dessous de cette épaisseur, un stockage en forte humidité peut
provoquer la formation d'oxyde cuivreux, la « red plague corrosion ». La norme signale aussi
que l'argent est sensible à l'oxygène atomique en orbite basse et peut former des dendrites
en présence de soufre.

Pour le nickelage électrolytique, les exigences dépendent de la résistance mécanique du
substrat, puisqu'un traitement thermique post-dépôt est requis au-delà de 1000 MPa d'UTS et
que, pour les aciers dépassant 1240 MPa d'UTS, ce traitement doit suivre ISO 9588 afin
d'éviter la fragilisation par l'hydrogène. Le chromage suit une logique similaire, avec un
seuil intermédiaire (1100–1240 MPa) nécessitant un cycle de cuisson post-dépôt et un renvoi
vers MIL-STD-1501 au-delà de 1240 MPa. La norme précise aussi que l'interface
nickel-aluminium sur de l'aluminium nickelé « shall be protected from exposure to corrosive
environments », car nickel et aluminium forment une pile galvanique forte à leur interface,
susceptible de provoquer un décollement rapide du placage en cas d'exposition.

## Conception : trois réflexes simples

La section 5.9 formule des exigences de conception qui relèvent presque du bon sens
d'atelier, mais dont l'omission cause une bonne part des problèmes réels :

- **Arêtes coupées** : « the edges of all metals in exterior locations shall be rounded or
  chamfered to permit adhesion of an adequate thickness of protective coatings », un
  revêtement n'adhérant pas correctement sur une arête vive.
- **Drainage et circulation d'air** : le design doit prévenir toute rétention d'eau de pluie,
  d'eau de mer ou d'autres fluides et garantir la circulation de l'air, une restriction du
  flux d'air pouvant piéger de la condensation sur des surfaces internes.
- **Compatibilité galvanique** : tout contact entre métaux dissemblables, y compris entre
  un métal et un composite à base de graphite (traité comme un couple bimétallique à part
  entière), doit être conforme aux exigences de la norme ECSS-Q-ST-70 sur les couples
  galvaniques et être évalué au niveau assemblage.

## Ce qu'il faut retenir

ECSS-Q-ST-70-14C ne prétend pas couvrir toute la dégradation des matériaux spatiaux
puisqu'elle laisse volontairement de côté les polymères, les céramiques et la corrosion sous
contrainte, qui ont leurs propres référentiels. Mais sur son périmètre, elle propose une
grille de lecture rigoureuse : huit mécanismes physico-chimiques identifiés, six classes
d'environnement associées à des protocoles d'essai précis et des règles de finition
métallique qui traduisent directement des retours d'expérience de l'industrie spatiale
européenne, comme l'interdiction de l'étain pur ou le seuil d'épaisseur de l'argenture sur
cuivre. Publiée en 2016 et toujours active, elle reste la référence pour qui doit justifier,
sur dossier, qu'un alliage donné tiendra le sol avant de tenir l'espace.

## Sources
- **Source officielle** : ECSS-Q-ST-70-14C « Space product assurance — Corrosion », 1er novembre 2016, first issue, actif, https://ecss.nl/standard/ecss-q-st-70-14c-corrosion-1-november-2016/
- **PDF intégral** : https://ecss.nl/wp-content/uploads/2016/12/ECSS-Q-ST-70-14C1November2016.pdf
