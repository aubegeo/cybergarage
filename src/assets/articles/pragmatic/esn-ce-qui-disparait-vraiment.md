---
title: "Ce qu'une ESN vend vraiment et laquelle de ces deux choses l'IA fait disparaître"
category: pragmatic
date: 2026-10-19
author: Geoffrey Aubert
tags: ["esn", "ia", "carriere", "architecture", "tma"]
summary: "Une vidéo désigne les sociétés de services informatiques comme grandes perdantes de la dissolution du secret de fabrication. Je suis développeur dans une ESN, j'ai donc vérifié les faits avancés avant de décider si je devais m'inquiéter. L'argument ne tient que sur un point, reste à savoir lequel."
readTime: 8
---

Une vidéo passée cette semaine affirme que l'intelligence artificielle est en train de tuer les
logiciels fermés, où elle désigne quatre grands perdants. Le troisième est nommément les
sociétés de services informatiques. Comme je suis développeur dans une ESN, j'ai fait ce que je
fais avec n'importe quelle affirmation de ce genre, je suis allé vérifier les faits avant de
décider si je devais m'inquiéter.

La conclusion est inconfortable dans les deux sens. Une partie de l'argument ne résiste pas à la
vérification, tandis que la partie qui résiste est plus sérieuse que ce que la vidéo en dit.

## Les faits avancés, une fois vérifiés

Le premier exemple est réel. Brandon Thomas, développeur à Atlanta, a publié **Artcraft**, un
ensemble de sept applications écrites en Rust qui reprennent les fonctions de Photoshop,
Illustrator, Premiere, Lightroom, After Effects, InDesign et Acrobat Pro. Elles sont gratuites,
open source, construites avec Claude Opus 5.5, leur auteur ayant accompagné la sortie d'un « Software is
over » qui a beaucoup circulé.

Ce que la vidéo ne dit pas, c'est que ces applications sont en alpha précoce avec des manques
reconnus publiquement, que leur auteur a **déjà rétracté** sa promesse d'atteindre la parité
fonctionnelle en un mois et que sa motivation déclarée portait sur les frais de résiliation
d'Adobe, qui ont valu à l'éditeur un règlement de 150 millions de dollars avec le gouvernement
américain. Des juristes ont par ailleurs soulevé des questions de *trade dress* et de
rétro-ingénierie assistée.

Le second exemple est réel aussi, mais c'est là que le contexte retourne la lecture. Shantanu
Narayen a bien annoncé son départ d'Adobe en mars 2026 après dix-huit ans, l'action perdant alors
plus de 7 %, au plus bas depuis trois ans. Sauf que le trimestre présenté ce jour-là
**dépassait les attentes**, avec un chiffre d'affaires record de 6,4 milliards de dollars en
hausse de 12 % sur un an et 1,9 milliard de bénéfice net. Adobe n'a donné aucune raison au
départ de son dirigeant. Et sur le même appel de résultats, le revenu récurrent des produits
dits « AI-first », dont Firefly, avait **plus que triplé** en un an.

Autrement dit, l'entreprise présentée comme détruite par l'intelligence artificielle croissait
de 12 % et triplait ses revenus issus de l'IA au moment précis où son cours chutait. Les faits
sont exacts, la chaîne causale est choisie.

## L'argument qui tient

Il reste un passage que la vérification ne démonte pas, celui précisément qui concerne directement
les ESN. Je le cite entier parce qu'il est juste.

> « un modèle qui vend surtout deux choses, des jours facturés et une dépendance, et l'IA est en
> train d'attaquer les deux. Chaque gain de productivité réduit le nombre de jours à facturer et
> chaque système qui devient lisible grâce à l'IA réduit mécaniquement cette dépendance. »

Ce raisonnement n'a besoin d'aucun chiffre pour tenir, ce qui le distingue du reste de la vidéo.
Il nomme deux mécanismes structurels qui visent effectivement ce qui est vendu, pas ce
qui est produit. Une prestation facturée en jours-hommes a pour assiette le nombre de jours, et
une mission de maintenance sur un système ancien a pour garantie de reconduction le fait que
personne d'autre ne sache le lire.

## Ce que l'argument oublie

Le premier mécanisme a une force contraire que la vidéo passe sous silence. Un projet qui demande
quarante pour cent de jours en moins ne conduit pas nécessairement un client à acheter moins de
jours, puisqu'il peut tout aussi bien en lancer davantage. Chaque saut de productivité du
développeur, des compilateurs aux frameworks jusqu'à l'industrialisation du cloud, a jusqu'ici
fait grossir le secteur plutôt que le réduire.

Ce n'est pas une garantie et je ne la présenterai pas comme telle, car l'ampleur du saut actuel
n'a pas d'équivalent dans les précédents. Mais une mécanique présentée à sens unique, dans un
domaine où l'histoire est ambiguë, mérite d'être signalée comme telle.

## Ce que l'argument sous-estime

Le second mécanisme est en revanche plus dangereux que la vidéo ne le formule, puisqu'il l'est
spécifiquement en France. Une part importante du chiffre d'affaires des ESN françaises provient
de la tierce maintenance applicative, c'est-à-dire de l'entretien de systèmes anciens. C'est
littéralement la situation que la vidéo décrit comme « le vieux système que seul le consultant
comprend ».

Si un modèle rend lisible un COBOL de trente ans ou un Java de vingt ans en quelques semaines,
ce n'est pas une productivité qui augmente, c'est une garantie de reconduction qui disparaît. La
dépendance n'était pas un service rendu au client, elle était un effet de bord de l'illisibilité,
et un effet de bord ne se défend pas devant un acheteur qui a désormais le moyen de vérifier.

C'est donc là, plutôt que sur le nombre de jours, que je regarderais si j'avais à parier sur le
segment le plus exposé.

## Qui parle et ce qu'il vend

Un dernier élément compte pour lire cette vidéo correctement. Deux phrases avant de désigner les
ESN comme troisième grand perdant, son auteur invite les professionnels inquiets à rejoindre son
cercle payant, dont les liens sont en description, en précisant que c'est précisément sur ce
genre de projet qu'il les accompagne. La vidéo se termine d'ailleurs par un appel à candidature
et l'annonce d'un hackathon.

Cela ne rend pas l'argument faux, puisque je viens d'écrire qu'une de ses deux branches est solide.
Mais cela explique pourquoi il est présenté au maximum de sa menace, sans la force contraire du
premier mécanisme ni la concentration réelle du risque sur le second. Un raisonnement nuancé
vend moins bien qu'une dissolution annoncée.

Le titre lui-même repose sur un chiffre de cinq cents milliards de dollars présenté sans source,
qui désigne la dette privée avancée à des éditeurs logiciels sur des multiples de revenu plutôt
que de bénéfice. Le phénomène existe, le montant n'est pas établi.

## Ce que j'en retiens pour ma propre trajectoire

Les deux choses que ce mécanisme attaque sont précises. Facturer des jours pour exécuter une
spécification et être le seul à pouvoir lire un système que personne n'a documenté. Ce sont
deux positions de rente, au sens strict, puisque leur valeur ne vient pas de ce qu'elles
apportent mais de ce qu'elles empêchent.

Ce que le mécanisme n'attaque pas, en revanche, c'est décider quoi construire et en porter la
responsabilité devant un client, diagnostiquer ce qui casse en production quand plus personne ne
sait pourquoi et répondre d'un système dans la durée. Un modèle qui lit un COBOL ne prend pas
la décision de le remplacer ou de le garder, pas plus qu'il ne signe le compte rendu.

La conclusion de la vidéo est qu'une entreprise, comme une carrière, se protège par ce qui reste
difficile à faire. Sur ce point je suis d'accord, car c'est la seule phrase que je garderais.
Simplement, ce qui reste difficile n'est pas de produire plus vite, puisque c'est exactement ce
que l'outil vient de rendre facile. Ce qui reste difficile est de savoir ce qui est vrai dans un
système que l'on n'a pas écrit et d'en répondre. Ce n'est pas une compétence qu'on démontre par
un score à un test, elle se démontre par un corpus de cas où l'on a trouvé ce que personne
n'avait vu.
