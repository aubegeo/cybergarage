---
title: "Hermes Agent : séparer le modèle du harnais, et ce que cette promesse vaut vraiment"
category: ia-master
date: 2026-10-02
author: Geoffrey Aubert
tags: ["ia", "agents", "hermes", "llm", "architecture", "open-source"]
summary: "Vous passez des semaines à apprendre votre métier à un agent, puis le modèle change. Hermes Agent, de Nous Research, promet de pouvoir basculer sans rien réécrire. Lecture de la documentation officielle, et examen des limites de cette promesse."
readTime: 6
---

# Hermes Agent : séparer le modèle du harnais, et ce que cette promesse vaut vraiment

Il y a un coût caché dans le travail avec un agent IA. Il n'apparaît sur aucune facture. Vous passez des semaines à lui expliquer votre métier, à corriger ses réponses, à construire des procédures autour de lui. Puis un meilleur modèle sort, ou celui que vous utilisez change de tarif, ou votre outil perd l'accès à un fournisseur.

La question devient alors simple à formuler et difficile à régler. Pouvez-vous changer de moteur sans jeter tout ce que vous avez bâti autour ?

[Hermes Agent](https://github.com/NousResearch/hermes-agent), publié par Nous Research sous licence MIT, répond frontalement à cette question. Voyons ce que la documentation officielle affirme, ce qui survit réellement à un changement de modèle, et où la promesse rencontre ses limites.

## Ce que le projet revendique

Le dépôt le décrit comme « The self-improving AI agent built by Nous Research ». Sur la portabilité, la formulation est sans ambiguïté. La documentation annonce « Use any model you want », en citant Nous Portal, OpenRouter, OpenAI ou votre propre endpoint, et précise que la bascule se fait avec la commande `hermes model`, « no code changes, no lock-in ».

C'est une promesse d'architecture plus que de fonctionnalité. L'idée est que le modèle devienne un paramètre de configuration, interchangeable, pendant que tout le reste persiste.

## Ce qui persiste autour du moteur

Quatre couches sont décrites dans la documentation officielle. Ce sont elles qui portent la valeur accumulée.

La **mémoire** s'appuie sur SQLite avec recherche plein texte FTS5. Le dépôt parle de « Agent-curated memory with periodic nudges » et de « FTS5 session search with LLM summarization for cross-session recall ». Concrètement, l'agent retrouve ce qui a été dit dans des conversations antérieures sans que vous ayez à le réexpliquer.

Les **skills** constituent une mémoire procédurale. Le projet annonce « Autonomous skill creation after complex tasks » et des compétences qui « self-improve during use ». Point notable pour la portabilité, le dépôt se déclare « Compatible with the agentskills.io open standard », ce qui ouvre la possibilité de ne pas dépendre d'un format propriétaire.

Le **cron intégré** permet des automatisations planifiées exprimées en langage naturel, avec « delivery to any platform ».

La **passerelle de messagerie** expose l'agent sur Telegram, Discord, Slack, WhatsApp, Signal et en CLI, « all from a single gateway process ».

S'ajoutent sept backends d'exécution, du local au Docker en passant par SSH, Modal ou Vercel Sandbox, avec une persistance serverless pour deux d'entre eux. Le dépôt indique qu'on peut le faire tourner « on a $5 VPS, a GPU cluster, or serverless infrastructure ».

## Où la promesse rencontre ses limites

Ce qui suit n'est pas dans la documentation. C'est une analyse qu'il faut distinguer de ce que le projet affirme.

« No code changes » est exact au sens littéral. Vous changez une valeur de configuration et l'agent interroge un autre fournisseur. Mais changer de modèle sans changer de code n'est pas la même chose que changer de modèle sans changer de comportement.

Une skill créée pendant que tournait le modèle A est une procédure façonnée par A. Elle encode implicitement sa façon de découper une tâche, sa tolérance aux instructions ambiguës, sa manière de se tromper. Rebranchée sur un modèle B qui raisonne autrement, elle reste syntaxiquement valide et peut parfaitement produire des résultats différents. La configuration a basculé, pas la calibration.

Le même raisonnement vaut pour la mémoire. Les résumés de conversations stockés pour le rappel inter-sessions ont été produits par un modèle donné. Ils portent ses choix de ce qui méritait d'être retenu.

Rien de tout cela ne disqualifie l'approche. Mais la bonne attente est « je garde mon capital et je le recalibre », pas « je bascule et tout fonctionne à l'identique ». La différence se mesure en jours de réglage, pas en semaines de reconstruction, ce qui reste un gain considérable.

## Le verrou se déplace, il ne disparaît pas

Second point d'analyse. En rendant le modèle interchangeable, vous rendez le harnais indispensable.

Vos skills, votre mémoire, vos tâches planifiées et vos passerelles vivent désormais dans Hermes. Le format des skills suit un standard ouvert, ce qui atténue le problème, mais la mémoire en SQLite, la configuration du cron et le routage des passerelles sont propres au projet.

La licence MIT et le caractère open source changent beaucoup de choses ici. Vous pouvez lire le schéma, exporter la base, forker le projet. Ce n'est pas comparable à une dépendance envers un service fermé. Mais l'exercice de sortie n'est pas gratuit pour autant. Mieux vaut le savoir avant d'y investir six mois de méthodes.

## Trois points d'attention avant d'essayer

L'installation recommandée est `curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash`. C'est pratique et c'est une décision de confiance. Vous exécutez un script distant avec les droits de votre session. Télécharger le script, le lire, puis l'exécuter coûte deux minutes.

Attention aussi aux sites satellites. Une recherche sur « Hermes Agent » remonte plusieurs domaines d'apparence officielle qui ne le sont pas. Les seules adresses à considérer sont le dépôt GitHub de Nous Research et le domaine de documentation qui y est lié.

Enfin, le Tool Gateway du projet route la recherche web, la génération d'images et la synthèse vocale à travers un abonnement Nous Portal. Le dépôt précise qu'on peut apporter ses propres clés par outil, la passerelle étant « per-backend, not all-or-nothing ». À vérifier selon ce que vous voulez garder chez vous.

## Ce qu'il faut en retenir

L'idée architecturale est juste et elle dépasse largement ce projet. Séparer le moteur du harnais est ce qui permet de ne pas repartir de zéro à chaque génération de modèles. C'est exactement le raisonnement qu'on applique depuis longtemps aux bases de données ou aux files de messages.

Hermes Agent en propose une implémentation open source, documentée et sous licence permissive. La promesse « no lock-in » est tenue sur le plan de la configuration. Elle demande simplement d'être lue pour ce qu'elle est, une portabilité technique, et non une garantie que vos méthodes se comporteront identiquement derrière un autre modèle.

## Sources

- Dépôt officiel Nous Research, licence MIT : [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
- Documentation officielle liée depuis le dépôt : [hermes-agent.nousresearch.com/docs](https://hermes-agent.nousresearch.com/docs/user-guide/cli)
- Standard ouvert de skills cité par le projet : [agentskills.io](https://agentskills.io)
