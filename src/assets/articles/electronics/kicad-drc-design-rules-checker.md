---
title: "KiCad DRC : le vérificateur de règles qui évite les PCB défectueux"
category: electronics
date: 2026-08-19
author: Geoffrey Aubert
tags: ["kicad", "pcb", "drc", "conception-electronique", "fabrication"]
summary: "Le Design Rules Checker de KiCad détecte automatiquement courts-circuits, clearances insuffisantes et défauts de fabrication avant l'envoi en production et se configure via des règles personnalisées."
readTime: 9
---

# KiCad DRC : le vérificateur de règles qui évite les PCB défectueux

Un PCB qui a l'air propre à l'écran peut cacher un court-circuit invisible à l'œil, une piste
trop fine pour supporter le courant prévu, ou un espacement entre pastilles insuffisant pour
la précision du fabricant. Ce genre de défaut ne se voit pas en zoomant sur le schéma et ne se
découvre en général que quand les cartes reviennent de production, cassées ou instables. C'est
exactement le problème que résout le **Design Rules Checker (DRC)** de KiCad, un outil qui
vérifie systématiquement, avant fabrication, que la carte respecte toutes les contraintes
définies et que le routage correspond bien au schéma.

Selon la [documentation officielle KiCad 10.0](https://docs.kicad.org/10.0/en/pcbnew/pcbnew.html#design-rule-checking),
le DRC « est utilisé pour vérifier que le PCB respecte toutes les exigences établies dans la
boîte de dialogue Board Setup et que tous les pads sont connectés conformément à la netlist ou
au schéma ». KiCad empêche déjà certaines violations pendant le routage interactif, mais « de
nombreuses autres ne peuvent pas être empêchées automatiquement », d'où l'importance de lancer
le DRC systématiquement avant de générer les fichiers de fabrication.

## Comment fonctionne le DRC

Le DRC se lance depuis l'icône dédiée de la barre d'outils ou via le menu *Inspect > Design
Rules Checker*. Deux options principales encadrent son exécution :

- **Refill all zones before performing DRC** : les zones de cuivre sont recalculées avant
  chaque passage. La désactiver « peut entraîner des résultats DRC incorrects » si les zones
  n'ont pas été remplies manuellement au préalable.
- **Test for parity between PCB and schematic** : en plus des règles de conception, le DRC
  compare le PCB au schéma pour repérer les divergences (option sans effet en mode standalone
  de l'éditeur PCB).

Après exécution, les violations apparaissent réparties dans trois onglets : règles de
conception, éléments non connectés et différences schéma/PCB, plus un onglet listant les
tests ignorés. Chaque violation liste les objets concernés ; un clic centre la vue dessus et
un menu contextuel propose des actions ciblées, par exemple lancer l'outil de résolution de
clearance directement sur les objets en infraction, ou comparer une empreinte avec sa version
en bibliothèque.

Un rapport peut être exporté via le bouton *Save…*, en texte brut (`.rpt`) ou en JSON. Le même
rapport peut aussi être généré en ligne de commande avec `kicad-cli`.

### Gérer les violations : exclusion, sévérité, ignore

KiCad ne force pas un traitement binaire de chaque violation. Un clic droit permet de :

- **Exclure** une violation précise (avec ou sans commentaire explicatif) sans toucher aux
  autres occurrences du même type ;
- **Changer la sévérité** d'un type de violation entre *erreur* et *avertissement*, pour tout
  le projet ;
- **Ignorer tout** un type de test, qui bascule alors dans l'onglet des tests ignorés.

La documentation prévient explicitement que passer une règle en *Ignore* dans la section
*Violation Severity* du Board Setup « désactive complètement la vérification correspondante »
et doit être utilisé « avec prudence ». Les exclusions et les ignorances sont mémorisées d'un
run à l'autre.

## Deux outils d'inspection complémentaires

Pour les cartes à règles complexes, il est parfois difficile de savoir quelle règle s'applique
à quel objet. KiCad fournit deux outils dédiés, accessibles depuis le menu *Inspect* :

- **Clearance Resolution** : en sélectionnant deux objets, affiche le clearance requis entre
  eux sur chaque couche cuivre, ainsi que la règle qui produit cette valeur. Il couvre aussi les
  clearances de trous et les clearances physiques (cuivre ou non).
- **Constraints Resolution** : pour un objet sélectionné, affiche toutes les contraintes de
  conception qui s'y appliquent.

## Les grandes familles de vérifications

La documentation regroupe les checks DRC en six catégories, chacune ciblant un type de risque
différent.

### Electrical : les défauts qui court-circuitent la carte

Ce sont les vérifications les plus critiques. Elles couvrent notamment :

- **Items shorting two nets** (erreur) : deux objets cuivre de nets différents se touchent,
  sauf si c'est volontaire via un *net tie*.
- **Clearance violation** (erreur) : distance insuffisante entre deux objets cuivre de nets
  différents. Le clearance autorisé « peut venir du clearance minimum au niveau de la carte,
  des réglages de net class, ou de règles personnalisées ».
- **Creepage violation** (erreur) : distance de creepage (le chemin le long des surfaces
  isolantes, pertinent en haute tension) insuffisante entre deux nets.
- **Via non connectée ou connectée sur une seule couche** (avertissement) : signal qu'une
  connexion prévue manque peut-être.
- **Thermal relief connection to zone incomplete** (erreur) : pas assez de connexions
  thermiques (spokes) entre un pad et une zone.

### Design for manufacturing : ce qui bloque ou fragilise la fabrication

C'est la catégorie la plus fournie, avec des règles très concrètes pour un fabricant de PCB :

- **Track width** (erreur) : largeur de piste hors de la plage configurée. La documentation
  précise un piège fréquent, puisqu'une largeur « optimale » définie par net class sert au routeur
  interactif mais ne définit ni minimum ni maximum, si bien que « aucune violation DRC ne sera signalée »
  sans configuration explicite via des règles personnalisées.
- **Annular width** et **Hole size out of range** (erreur) : anneau de cuivre autour d'un trou,
  ou diamètre de perçage, hors des capacités du fabricant.
- **Drilled hole too close to other hole** (erreur) : deux trous percés physiquement trop
  proches, car le foret peut dévier ou être endommagé. Les micro-vias, percées au laser, ne sont
  pas concernées par cette règle.
- **Courtyards overlap** (erreur) : les courtyards (zone d'encombrement mécanique) de deux
  empreintes se chevauchent, risque de collision physique de composants.
- **Board edge clearance violation** (erreur) : objet cuivre trop proche du bord de la carte.
- **Copper sliver** (avertissement) : fins éclats de cuivre en forme de coin, « qui peuvent
  causer des problèmes de fabrication, de fiabilité ou électriques ».
- **Solder mask aperture bridges items with different nets** (erreur) : une seule ouverture de
  masque de soudure expose deux nets différents, risque de pont de soudure lors de l'assemblage.

### Schematic parity : la cohérence schéma/PCB

Ces règles comparent le PCB au schéma : empreintes en double, manquantes ou en trop, attributs
(valeur, DNP, exclusion BOM) désynchronisés, correspondance de net entre pad et pin. La
documentation recommande d'utiliser *Update PCB from Schematic* ou *Update Schematic from PCB*
selon la source d'erreur pour resynchroniser les deux.

### Signal integrity : le routage haute vitesse

Ces vérifications ciblent surtout les paires différentielles :

- **Track length out of range** et **Skew between tracks out of range** (erreur) : longueur ou
  différence de longueur entre pistes hors tolérance, configurables via des règles
  personnalisées (`length`, `skew`).
- **Differential pair gap out of range** (erreur) : écart entre les deux pistes d'une paire
  différentielle hors plage, vérifié uniquement sur les portions couplées (parallèles).
- **Differential uncoupled length too long** (erreur) : portion non couplée (par exemple lors
  du fanout depuis une empreinte) trop longue.

### Readability : la lisibilité de la sérigraphie

Chevauchement de sérigraphie avec un autre élément de sérigraphie, découpe par une ouverture de
masque de soudure, débordement hors du bord de carte, hauteur/épaisseur de texte hors plage,
texte miroir mal orienté. Ces défauts n'affectent pas l'électrique mais compliquent
l'identification des composants à l'assemblage ou en maintenance.

### Miscellaneous : le reste, non moins important

Zones de cuivre de nets différents qui se chevauchent (court-circuit), îlots de cuivre isolés,
pads avec des réglages « probablement une erreur » (*padstack is questionable*, la
documentation listant une dizaine de cas précis, comme des trous métallisés sans pastille cuivre
sur aucune couche), trous non métallisés dans le courtyard d'une autre empreinte, empreinte
absente des bibliothèques actives, etc.

## Aller plus loin : règles personnalisées et sévérité configurable

Chaque type de violation a une sévérité par défaut (erreur, avertissement, ou ignoré), mais
« toutes les sévérités sont configurables » depuis la section *Violation Severity* du Board
Setup. Beaucoup de contraintes plus fines (angle de piste, longueur de segment, nombre de vias
sur une connexion, clearance physique) ne sont *pas* actives par défaut et nécessitent des
**custom rules** dédiées pour être vérifiées du tout. D'autres, comme la clearance de
sérigraphie, disposent d'un réglage minimal au niveau de la carte (*board-level silkscreen
minimum item clearance*), les règles personnalisées permettant d'aller plus loin.

La documentation mentionne aussi un mécanisme de violation manuelle selon lequel placer une variable de
texte comme `${DRC_ERROR TODO}` ou `${DRC_WARNING ...}` sur n'importe quelle couche du PCB
génère une violation DRC nommée, utile pour flaguer un point à revoir sans quitter l'éditeur.

## Conclusion

Le DRC de KiCad n'est pas une simple case à cocher avant export des Gerbers mais un
ensemble structuré de vérifications électriques, mécaniques, de fabricabilité, de cohérence
schéma/PCB et de signal integrity, chacune avec sa propre sévérité par défaut et sa possibilité
de configuration fine via des règles personnalisées. Le vrai gain n'est pas seulement d'éviter
les erreurs grossières comme un court-circuit mais de rendre visibles, avant l'envoi en
fabrication, des contraintes que l'œil ne détecte jamais : un clearance à quelques microns
près, un courtyard qui empiète de peu, une piste différentielle légèrement trop longue. Prendre
le temps de comprendre chaque catégorie de check et d'ajuster les sévérités et les règles
personnalisées au cas d'usage réel de la carte, évite des allers-retours de fabrication
coûteux, en temps comme en argent.

## Sources
- **Source officielle** : Documentation KiCad 10.0, PCB Editor, section « Design rules checking » (DRC), https://docs.kicad.org/10.0/en/pcbnew/pcbnew.html#design-rule-checking
