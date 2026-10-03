---
title: "On ne disparaît pas, on monte d'un étage : ce que la GenAI change vraiment pour les devs"
category: pragmatic
date: 2026-06-28
author: Geoffrey Aubert
tags: ["genai", "intelligence-artificielle", "spec-driven-development", "soft-skills", "management"]
summary: "Entre le discours LinkedIn de la fin des devs et la réalité du terrain, retour sur ce que l'histoire de l'informatique nous apprend déjà sur les vagues d'abstraction, et sur ce qui va vraiment compter demain dans le métier."
readTime: 8
---

# On ne disparaît pas, on monte d'un étage : ce que la GenAI change vraiment pour les devs

Impossible d'ouvrir LinkedIn ces derniers mois sans tomber sur un post annonçant la fin des
développeurs : études plaçant le métier en tête des professions « menacées », promesses
marketing de x100 sur la productivité, juniors qu'on n'embaucherait plus. Le tout produit un
mélange d'excitation et d'angoisse qui en dit finalement plus sur notre rapport au changement
que sur l'IA elle-même.

Le besoin en informatique, lui, n'a jamais été aussi fort puisque le monde continue de se
digitaliser sans ralentir et que la GenAI ne fait que révéler une demande déjà là, celle des
idées qu'on n'avait jamais le temps ni les ressources de développer. La vraie question n'est
donc pas de savoir si l'on va disparaître mais de comprendre comment notre rôle change.

## On ne disparaît pas, on monte d'un étage

L'histoire de l'informatique répond déjà en partie à cette question, car à chaque vague
d'abstraction la même peur est revenue. Le câblage manuel cède la place à l'assembleur et l'on
craint pour les opérateurs qui branchaient des câbles, alors qu'en réalité on arrête juste de
gérer des registres pour s'occuper de la mémoire. L'assembleur cède la place aux langages haut
niveau et l'on craint de perdre la maîtrise du hardware, alors que sans cette abstraction on
n'aurait jamais construit les systèmes d'aujourd'hui. Les langages cèdent la place aux
frameworks, si bien que plus personne n'écrit un serveur Java avec les seules instructions du
langage puisque tout le monde passe par Spring Boot ou équivalent.

À chaque étape, le métier ne s'est pas effacé, il s'est élevé d'un niveau d'abstraction à
l'autre, des signaux binaires à la mémoire, puis aux structures de données, aux librairies et
maintenant aux **intentions et aux specs**. Un conférencier racontait récemment une anecdote
éclairante, celle d'un ancien camarade de promo, parti en filière thermique, qui concevait des
systèmes pour les moteurs d'Airbus, tandis que lui, en filière informatique, passait son temps à
écrire du code, à *fabriquer* le moteur plutôt qu'à le *concevoir*. La GenAI rebat précisément
cette carte, puisqu'elle pousse à devenir enfin de vrais ingénieurs, capables de réfléchir à des
systèmes de haut niveau, plutôt que des exécutants de syntaxe.

## Le vrai goulot d'étranglement, c'est nous

Cette montée en abstraction ne va pas sans frictions, déjà visibles dans les équipes qui
adoptent ces outils massivement. Avec un milliard de commits poussés en 2025, l'IA ne remplace
personne et décuple la production, ce qui n'est pas automatiquement une bonne nouvelle.

- **Le goulot d'étranglement humain.** Un moteur de Ferrari ne sert à rien attelé à une charrette.
  Une équipe de dev augmentée produit plus vite que les PO ne peuvent cadrer le besoin et que les
  QA ne peuvent valider le résultat. Et même en supposant ce problème résolu, un client a-t-il
  vraiment envie de voir son interface changer dix fois par jour parce qu'on a décidé de viser le
  x10 ?
- **La dette technique qui s'accélère.** L'IA répond à la demande qu'on lui fait, sans se
  demander si une fonctionnalité similaire n'a pas déjà été codée la semaine précédente. Mal
  cadrée, elle duplique plutôt qu'elle ne mutualise, si bien que le code généré, produit en
  masse, devient une dette jetable à grande échelle. Sans compter le coût écologique, puisqu'un
  prompt pèse à peu près autant que 10 à 25 recherches Google et que générer 400 à 500 lignes de
  code consomme l'équivalent d'une charge de smartphone.
- **La sécurité, version supply chain.** Des attaquants déposent sur npm des librairies aux noms
  parfaitement crédibles, conçues pour être trouvées et installées automatiquement par un agent
  qui « fait une recherche », avant d'exfiltrer des données une fois en place. D'autres glissent
  du texte invisible (caractères cachés, police blanche sur fond blanc) dans un dépôt ou un email
  pour y injecter un prompt que personne ne voit à l'œil nu. Une approche **zero trust** devient
  la norme dès qu'un agent peut chercher et installer des dépendances à votre place.

À cela s'ajoute une fatigue bien réelle, puisqu'une étude de 2024 (dont les conclusions tiennent
probablement encore) montrait que 77 % des salariés ressentaient une charge de travail accrue à
cause de l'IA. La capacité de production décuplée se traduit d'abord en pression, pas seulement
en gain de temps, ce qui est un sujet à porter explicitement en entreprise plutôt qu'à balayer au
nom de la vélocité.

## Spec-Driven Development : l'avènement du vrai TDD

Un reproche revient souvent : « l'IA ne reproduit jamais deux fois le même code ». C'est
pourtant aussi vrai d'un développeur humain, puisque si l'on redemande le même algorithme à la
même personne une semaine plus tard, le résultat ne sera pas identique au caractère près. Ce qui
garantit la qualité n'a jamais été le code en lui-même, mais les exigences fonctionnelles et les
tests qui le valident.

C'est exactement le principe du **Spec-Driven Development (SDD)**, qui consiste à poser les
exigences fonctionnelles, les tests et les contraintes *avant* de laisser un agent générer le
code. Les adeptes du craft n'ont rien découvert de nouveau ici, mais écrire les tests avant le
code n'a jamais été aussi pertinent que maintenant que cette discipline sert aussi à cadrer une
IA.

Reste une nuance importante, car entendre qu'une entreprise comme GitHub fait générer « 100 % du
code » par l'IA ne signifie pas qu'il n'est jamais relu. Cela suppose des pipelines agentiques
extrêmement matures, que 95 à 98 % du marché n'a tout simplement pas encore, si bien que pour la
quasi totalité des équipes la qualité dépendra encore longtemps de la relecture humaine et de la
personne qui signe le commit.

## Ce qui compte désormais : architecture, communication, esprit critique

Si la syntaxe et le boilerplate perdent de la valeur, d'autres compétences en gagnent nettement :
l'architecture et le design système, la sécurité et l'accessibilité, autant de décisions qui
restent des actes d'ingénierie, pas de génération automatique. Driver un agent revient à encadrer
un stagiaire sous stéroïdes, car il faut une vision claire de la direction à prendre, que l'IA
seule ne fournit pas. D'où l'idée que le rôle de développeur devient aussi, en partie, celui d'un
**coach d'IA**.

La communication devient la compétence numéro 1 (se faire comprendre par une machine, en cadrant
un prompt ou une spec, autant que par des humains), suivie de près par l'esprit critique,
indispensable pour évaluer ce qu'une IA produit sans le valider aveuglément. Et le gain de
productivité ne devrait pas servir uniquement à produire plus vite mais surtout à libérer du temps
pour les bonnes questions, celles qui définissent la direction réelle d'un produit ou d'une
équipe, sans quoi on retombe dans le piège classique où chaque heure gagnée est immédiatement
réinvestie dans plus de production, jamais dans plus de recul.

## Reprendre la main en entreprise : permis de prompter et personas

Sur le terrain, quelques leviers concrets se dégagent pour une adoption plus saine. Le **shadow
AI** (un développeur qui installe un agent sur son poste avec sa licence personnelle, sans en
parler à personne) doit être proscrit, puisqu'il est impossible de garantir une quelconque qualité
ou sécurité dans ces conditions. L'expérimentation assumée, elle, doit au contraire être
encouragée. Répartir la veille technologique entre plusieurs personnes de l'équipe (l'une sur un
écosystème, l'autre sur un autre) évite qu'une seule personne porte seule cette charge cognitive
tout en permettant à chacun d'apporter ensuite ce qu'il a appris aux autres.

Avant de distribuer des licences à toute une équipe, un **permis de prompter** s'impose, puisqu'on
ne donne pas les clés d'une voiture sans permis de conduire, alors pourquoi le ferait-on avec un
agent capable d'installer des dépendances ou de toucher à du code en production ? Une entreprise
accompagnée sur ces sujets a par exemple structuré son adoption autour de quatre programmes
internes, taillés pour quatre profils différents : *AsmGenny*, un espace sans jugement pour poser
même les questions les plus débutantes ; *Made with Genny*, où les early adopters font des démos
régulières de ce qu'ils découvrent ; *Open Talk*, pour donner la parole aux réfractaires (dont
les inquiétudes sur l'impact écologique ou humain sont parfaitement légitimes) ; et un *AI Dojo*
pour s'entraîner concrètement.

Reste la question des juniors, qu'il serait facile de sacrifier au nom de la vélocité. Le trinôme
senior-junior-IA garde le junior dans un rôle actif (relecture, conception, questionnement du
refactoring) plutôt que de l'écarter parce que l'IA « code plus vite ». Et il faut accepter une
montée en charge progressive, car annoncer un x10 dès le lundi suivant une formation est
contre-productif, alors que viser un x2 sur plusieurs mois rassure des équipes déjà sous pression
et laisse le temps d'apprendre réellement à s'en servir.

> « L'IA ne remplacera pas les développeurs. Ce sont les développeurs qui utilisent l'IA qui vont
> remplacer ceux qui ne l'utilisent pas. »

Le risque n'a donc jamais vraiment été technologique mais tient à l'écart qui se crée entre ceux
qui apprennent à piloter ces outils et ceux qui les subissent. La responsabilité de ce qui est
livré, elle, ne change pas de main, car c'est toujours la personne qui signe le commit qui en
porte la qualité.

## Source

Article inspiré de la conférence « [FORGE] - Quel avenir pour les devs à l'ère de la GenAI ? »
de Jean-François Garot, Engineering Director chez Sphère (Nantes), pour DevQuest, https://www.youtube.com/watch?v=jgsm6StQfNQ.
