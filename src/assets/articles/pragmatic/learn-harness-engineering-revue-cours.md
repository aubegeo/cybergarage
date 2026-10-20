---
title: "learn-harness-engineering : ce qu'un cours à 18 000 étoiles apporte vraiment"
category: pragmatic
date: 2026-10-03
author: Geoffrey Aubert
tags: ["ia", "agents", "methode", "harnais", "revue", "verification"]
summary: "Un cours open source sur l'ingénierie du harnais a dépassé 18 000 étoiles en six mois. Ce qu'il apporte de solide, ce qu'il faut vérifier soi-même, puis le résultat obtenu en appliquant sa grille d'audit à cinq dépôts réels."
readTime: 8
---

Depuis le printemps 2026, une idée s'est imposée dans la manière de parler des agents de code. Un agent se décompose en un modèle plus un harnais, le harnais désignant tout ce qui entoure les poids du modèle et qui lui permet d'agir, de se souvenir et de s'arrêter. OpenAI a publié sa vision de la question, Anthropic la sienne. Le mot est désormais entré au Technology Radar de Thoughtworks.

Restait l'étape que personne ne faisait. Transformer cette idée en quelque chose qu'un développeur puisse appliquer lundi matin à son propre dépôt. C'est ce que tente [learn-harness-engineering](https://github.com/walkinglabs/learn-harness-engineering), un cours open source sous licence MIT, créé le 29 mars 2026, qui compte aujourd'hui 14 chapitres, 8 projets, un script d'audit, une skill réutilisable et des traductions en quinze langues.

Il affiche aussi près de 18 000 étoiles, ce qui ne prouve rien du tout. La question utile n'est pas de savoir si le dépôt est populaire mais de savoir ce qu'on peut en tirer, sous quelles conditions.

## L'apport central, une grille auditable

La contribution la plus solide du cours tient en une décomposition. Le chapitre 2 énonce qu'un harnais comporte cinq sous-systèmes, en associant surtout à chacun d'eux un artefact concret.

| Sous-système | Artefact minimal | Ce qu'il empêche |
|---|---|---|
| Instructions | `AGENTS.md` ou `CLAUDE.md` | L'agent redécouvre le projet à chaque session |
| Outils | Portée des permissions, configuration MCP | L'agent sait quoi faire mais ne peut pas le faire |
| Environnement | Lockfile, version de runtime épinglée, Docker | Le « ça marche chez moi » appliqué à un agent |
| État | `PROGRESS.md`, `feature_list.json` | La perte de continuité entre deux sessions |
| Feedback | Commandes de vérification documentées | L'agent déclare victoire sans preuve |

L'intérêt de cette grille n'est pas son originalité conceptuelle, elle reformule ce qu'OpenAI et Anthropic écrivent de leur côté. Son intérêt est qu'elle est falsifiable. Chaque ligne se vérifie par la présence ou l'absence d'un fichier, ce qui la distingue de la plupart des listes de bonnes pratiques qui circulent sur le sujet.

Le cours fournit d'ailleurs l'outil correspondant, `tools/audit-harness.sh`, 543 lignes de bash sans aucune dépendance, qui parcourt un dépôt et renvoie un verdict par sous-système, avec distinction entre critique et recommandé. Un code de sortie non nul quand un contrôle critique échoue, ce qui le rend branchable sur une CI.

## Le démontage des harnais existants

C'est la partie la plus difficile à trouver ailleurs. Une section compare, produit par produit, la manière dont quatre harnais réels sont construits, sans parler du modèle qu'ils enveloppent.

Claude Code y figure comme un environnement d'exécution complet, avec mémoire en couches, compactage, permissions, hooks et sous-agents. Codex pousse la logique du dépôt comme source de vérité jusqu'au bout, en réduisant `AGENTS.md` à une page de sommaire et en isolant chaque tâche dans un worktree. Pi part d'un noyau minimal extensible, avec un prompt système court et un chargement à la demande. DeepSeek Harness définit son harnais comme un runtime indépendant du modèle, où même la boucle de l'agent est un plugin.

Pour qui conçoit une architecture autour d'un agent, cette comparaison vaut plus que les chapitres théoriques. Elle montre que les mêmes mécanismes se réalisent de quatre façons incompatibles entre elles, ce qui est exactement l'information dont on a besoin avant de s'engager sur un outil.

## Les deux chapitres qui vont plus loin

Les chapitres 13 et 14 sortent du cadre initial. Ce sont les plus intéressants parce qu'ils documentent un déplacement en cours.

Le chapitre 13 décrit le passage du prompt à la boucle. Il retrace quatre étapes, du dialogue pas à pas jusqu'à la boucle autonome dont la condition d'arrêt est confiée à un juge indépendant, parce que l'agent qui produit le code est un très mauvais évaluateur de son propre travail. Il s'appuie sur des déclarations datées et attribuées, dont celle de Boris Cherny, responsable de Claude Code chez Anthropic, qui affirme ne plus écrire de prompts mais des boucles qui en écrivent. Il nomme aussi quatre coûts silencieux de cette automatisation, la dette de vérification, l'érosion de la compréhension, l'abandon cognitif et l'explosion de la consommation de jetons.

Le chapitre 14 passe de la boucle au graphe, avec nœuds, arêtes, état partagé et règles de routage. Son argument le plus utile porte sur ce qu'un point de contrôle interne ne peut pas corriger. Tant que le vérificateur et le producteur partagent un même contexte, ils partagent aussi le même angle mort. La question de savoir si l'objectif poursuivi était le bon ne peut structurellement pas être posée.

## Ce qu'il faut vérifier avant de s'en servir

Un cours n'est pas une spécification. Celui-ci donne quatre raisons concrètes de le traiter comme une source secondaire.

**Les cinq sous-systèmes ne sont pas les mêmes selon l'endroit où on les lit.** Le chapitre 2 et le script d'audit retiennent instructions, outils, environnement, état et feedback. La skill `harness-creator` livrée dans le même dépôt retient instructions, état, vérification, portée et cycle de vie. Deux listes de cinq éléments qui n'en partagent que deux. Le découpage est donc un support pédagogique, pas une taxonomie stabilisée. Il ne faut pas lui demander la rigueur d'une norme.

**Les chiffres ont été étiquetés après coup.** Trois commits du 30 septembre 2026 portent des intitulés sans ambiguïté, l'un ajoute des sources ou marque les exemples comme illustratifs, un autre remplace les chiffres sans source des chapitres 3 à 5, le troisième annonce un audit complet des preuves du cours. Conséquence visible, l'étude de cas du chapitre 2, celle où un taux de réussite passe de 20 % à près de 100 % en quatre itérations, porte désormais la mention explicite que le scénario et ses valeurs sont supposés pour l'explication et ne proviennent pas d'une expérience publiée. Pendant six mois, ces pourcentages circulaient sans cet avertissement.

**L'outil d'audit renvoyait des verdicts faussement positifs.** Le commit `3f85661c`, du même jour, corrige deux contrôles. Le premier vérifiait que le fichier d'instructions tienne sous 200 lignes sans jamais tester la borne basse, de sorte qu'un `AGENTS.md` de trois lignes obtenait un PASS. Le second cherchait le mot `progress` dans le texte, de sorte que l'expression « work in progress » suffisait à valider le contrôle « les fichiers d'état sont énumérés ». Le message de commit précise que la découverte vient de l'audit d'un vrai dépôt, dont le fichier d'instructions ne passait le contrôle qu'à cause d'un identifiant contenant le mot par hasard.

**La popularité affichée ne se traduit pas en usage.** Le dépôt réunit près de 18 000 étoiles pour 78 abonnés aux notifications, soit 0,43 %. Mettre une étoile ne coûte rien, s'abonner suppose qu'on suive réellement le projet. Sur un dépôt dont l'activité provient majoritairement d'un seul auteur, l'écart invite à juger le contenu sur pièces plutôt que sur son compteur.

À l'inverse, il faut créditer le cours de ce qu'il fait bien. Son chiffre le plus mis en avant est exact. Anthropic a documenté une comparaison à modèle constant, Opus 4.5 sur le même énoncé, 9 dollars en 20 minutes sans harnais pour un résultat non fonctionnel, 200 dollars en 6 heures avec un trio planificateur, générateur et évaluateur pour un résultat utilisable. Vérification faite contre l'article d'origine, montants, durées et composition correspondent. Et le chapitre 14 consacre une section entière à démonter des chiffres de marketing circulant sur le sujet du graphe, en retrouvant leur source réelle et en montrant que les deux pourcentages comparés ne partagent pas la même référence. Un cours capable d'auditer les affirmations des autres puis les siennes reste plus fiable qu'un cours qui n'audite rien.

## Ce que la grille donne appliquée pour de vrai

Une grille ne vaut que par ce qu'elle révèle, alors je l'ai passée sur cinq de mes propres dépôts, en reproduisant ses contrôles à la main plutôt qu'en exécutant un script téléchargé.

| Dépôt | Instructions | Feedback | État | Environnement |
|---|---|---|---|---|
| tumblrPost | 361 lignes | 2 commandes | absent | non épinglé |
| tablet-app | 137 lignes | 3 commandes | absent | non épinglé |
| automotocool-app | 97 lignes | aucune | absent | non épinglé |
| cybergarage | 37 lignes | 2 commandes | absent | non épinglé |
| gestion-finance-app | 8 lignes | aucune | absent | non épinglé |

Le résultat est net. Le sous-système instructions existe partout, les quatre autres sont absents partout. Aucun de ces dépôts ne possède de fichier d'état, de version de runtime épinglée ni de liste de fonctionnalités. Deux d'entre eux ne nomment même aucune commande de vérification, alors que c'est précisément le sous-système que le cours désigne comme le meilleur rapport entre effort et gain.

Le cas le plus parlant est le dernier de la liste. Huit lignes d'instructions, aucune contrainte dure, aucune commande de vérification, sur le dépôt qui héberge des traitements programmés quotidiens et des migrations de base de données. C'est-à-dire exactement le dépôt où une erreur part en silence parce que personne ne regarde au moment où elle se produit.

Aucun de ces constats ne demandait de lire le cours. Tous demandaient une grille pour les rendre visibles. C'est la seule chose qu'on doit attendre d'un document de ce genre.

## Ce qu'il faut en retenir

Ce dépôt se situe dans une catégorie particulière, celle des travaux de synthèse qui valent par leur capacité à transformer un discours en liste de contrôle. Il ne remplace ni les articles d'origine d'OpenAI et d'Anthropic, ni les spécifications sur lesquelles les harnais commencent à s'appuyer, [MCP et le format Agent Skills notamment](/article/ia-master/anatomie-du-harnais-agent-standards). Il les complète en répondant à une autre question, celle de savoir ce qu'il reste à construire soi-même.

L'usage raisonnable consiste donc à prendre la grille, les gabarits et le script, tous sous licence MIT, puis à laisser de côté les chiffres. Un cours s'utilise comme une grille à appliquer, jamais comme une autorité à citer. Le dépôt lui-même en fournit la démonstration, puisqu'il a dû auditer ses propres preuves six mois après les avoir publiées.

## Sources

- Dépôt du cours, licence MIT : [github.com/walkinglabs/learn-harness-engineering](https://github.com/walkinglabs/learn-harness-engineering)
- Commits d'audit des preuves et correction des contrôles faussement positifs, 30 septembre 2026 : [historique du dépôt](https://github.com/walkinglabs/learn-harness-engineering/commits/main)
- Anthropic, conception de harnais pour le développement d'applications longues, source du chiffrage 9 dollars contre 200 dollars : [anthropic.com/engineering/harness-design-long-running-apps](https://www.anthropic.com/engineering/harness-design-long-running-apps)
- Anthropic, harnais efficaces pour agents longue durée : [anthropic.com/engineering/effective-harnesses-for-long-running-agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)
- OpenAI, ingénierie du harnais : [openai.com/index/harness-engineering](https://openai.com/index/harness-engineering/)
- Métriques du dépôt relevées le 3 octobre 2026 via l'API GitHub, 17 961 étoiles, 1 901 forks, 78 abonnés, 265 commits
