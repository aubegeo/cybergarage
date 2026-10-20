---
title: "Claude Code en août 2026 : /design, auto mode par défaut et permissions en langage naturel"
category: dev-info
date: 2026-08-22
author: Geoffrey Aubert
tags: ["claude-code", "ia", "outillage-dev", "productivite"]
summary: "Tour d'horizon des dernières nouveautés de Claude Code : la skill /design en aperçu, l'auto mode devenu réglage par défaut, des permissions configurables en langage naturel et une poignée d'améliorations de confort au quotidien."
readTime: 7
---

Claude Code continue d'avancer vite, trop vite parfois pour suivre chaque changelog en détail.
L'équipe produit d'Anthropic vient d'envoyer un point d'étape sur les dernières évolutions de
l'outil, plusieurs d'entre elles méritant qu'on s'y arrête, surtout si on l'utilise au
quotidien en contexte professionnel. Voici ce qui change, sans blabla marketing.

## Une nouvelle skill pour partir d'une idée visuelle : /design

La nouveauté la plus visible est une commande `/design`, présentée pour l'instant comme un
aperçu de recherche (research preview, donc à prendre avec les précautions d'usage pour une
fonctionnalité encore instable). L'idée est de partir d'une idée écrite, d'une capture d'écran ou
d'un design existant pour obtenir des « artboards » Claude Design éditables, sans quitter son
terminal Claude Code.

Concrètement, on peut lui demander de reconstruire une interface en réutilisant les styles de
composants déjà présents dans le dépôt (couleurs, typographies, espacements existants), puis
publier le résultat comme un artifact partageable avec l'équipe. Sur les plans Team et
Enterprise, toute personne ajoutée comme éditeur sur cet artifact peut elle-même modifier le
design et publier une nouvelle version, ce qui en fait un outil de collaboration plus que de
simple génération individuelle.

L'usage suggéré par l'équipe est de s'en servir *avant* de coder, avec un prompt du type
« /design a few options for {feature} », pour explorer plusieurs pistes visuelles avant de se
lancer dans l'implémentation. Pour un développeur qui n'a pas d'appétence particulière pour le
design UI (mon cas, avec Angular Material comme filet de sécurité habituel), c'est le genre de
pont entre idée et prototype visuel qui peut faire gagner un aller-retour avec un designer.

## Confort au quotidien : moins de verbosité, moins d'interruptions

Trois petites améliorations visent directement le confort d'usage :

- **Un style de sortie « Concise »**, accessible via `/config` → Output style (ou en réglant
  `"outputStyle": "Concise"` dans `settings.json`). Claude va alors droit au but, sans
  préambule ni narration inutile avant de donner le résultat. C'est une réponse directe à un
  retour récurrent des utilisateurs sur la verbosité par défaut des réponses.
- **L'auto-continue** : quand une limite d'usage est atteinte puis se réinitialise, Claude Code
  reprend automatiquement le tour qui avait été interrompu, plutôt que de laisser la session en
  suspens. Ce comportement est automatique en CLI (désactivable dans `/config` si on préfère
  reprendre la main manuellement), tandis que sur l'app Desktop il faut cocher l'option
  « Auto-continue when limits reset » sur la carte de limite de session, cette option n'étant en
  revanche pas disponible pour la limite hebdomadaire.
- **La sélection d'élément dans le panneau Browser de Claude Code Desktop** : le raccourci
  Cmd+Shift+B ouvre le panneau Browser, puis Cmd+Shift+S active un mode de sélection directe
  d'un élément de la page pour demander à Claude de le modifier précisément. Concrètement, plus
  besoin de décrire en mots quel bouton ou quelle section on veut ajuster, puisqu'on clique dessus.

Ce sont des détails, mais ce sont exactement le genre de frictions qui, cumulées sur une
journée de travail, pèsent sur l'adoption d'un outil.

## L'auto mode devient le réglage par défaut

Un changement plus structurant tient au fait que, depuis le 14 août 2026, l'auto mode est devenu le réglage par
défaut pour les nouvelles sessions sur les plans Pro, Max et Team. Si vous aviez déjà choisi un
mode par défaut personnel avant ce changement, Claude Code demande confirmation avant de
l'écraser. Pour figer un choix une fois pour toutes (par exemple rester en mode plus manuel sur
un projet sensible), le paramètre `defaultMode` dans les settings permet de verrouiller ce
comportement.

En parallèle, l'extension temporaire de 50 % des limites hebdomadaires (déjà en place) est
prolongée jusqu'au 31 août 2026, pour les plans Pro, Max, Team et Enterprise à base de sièges.
L'équipe indique vouloir rendre cette hausse permanente, mais avoir besoin de plus de temps
pour l'intégrer durablement dans la structure des plans. À suivre donc, sans certitude sur la
suite après cette date.

## Configurer l'auto mode en langage naturel

C'est probablement le changement le plus intéressant pour un usage professionnel encadré, puisque les
règles de l'auto mode se rédigent maintenant en phrases simples, directement dans les settings
utilisateur (`~/.claude/settings.json`), sous deux clés distinctes :

- `autoMode.soft_deny` : bloque une action sauf demande directe de l'utilisateur, une entrée
  `"allow"` primant sur cette liste ;
- `autoMode.hard_deny` : bloque une action sans condition, quoi qu'il arrive.

Voici l'exemple que donne l'équipe pour ces deux clés :

```json
{
  "autoMode": {
    "soft_deny": [
      "$defaults",
      "Never run database migrations outside the migrations CLI"
    ],
    "hard_deny": [
      "$defaults",
      "Never send repository contents to third-party code-review APIs"
    ]
  }
}
```

L'entrée spéciale `"$defaults"` conserve les règles intégrées par défaut d'Anthropic en plus
des vôtres, un détail à ne pas oublier si vous voulez ajouter des restrictions sans perdre les
garde-fous existants. Ces réglages vivent dans les settings *utilisateur*, plutôt que dans les settings
*projet*, si bien qu'ils ne peuvent pas être écrasés par la configuration d'un dépôt particulier et
s'appliquent uniformément à tous vos projets.

Techniquement, un classifieur (un modèle séparé) relit ces règles à chaque action pour décider
ce qui doit être autorisé ou bloqué. L'e-mail ne détaille pas davantage son fonctionnement
interne, donc je n'irai pas au-delà de ce point.

Une nouvelle commande, `claude auto-mode critique`, permet d'auditer ses propres règles pour
repérer celles qui seraient ambiguës, redondantes, ou susceptibles de générer des faux positifs, ce qui constitue un bon réflexe à prendre après avoir écrit ses premières règles personnalisées, avant de les
laisser tourner en confiance sur un vrai projet.

## Ce qu'il faut retenir du changelog récent

Quelques entrées de versions récentes valent le détour pour qui suit Claude Code de près :

- **2.1.236** : une variable d'environnement `ANTHROPIC_DEFAULT_MODEL` permet de fixer le modèle
  par défaut des nouvelles sessions. Elle a la priorité la plus basse, si bien qu'un `--model` explicite,
  `ANTHROPIC_MODEL`, un choix `/model` sauvegardé ou un défaut d'organisation priment dessus.
- **2.1.234** : l'auto-continue décrit plus haut, plus l'apparition d'un badge cliquable
  « MR !N » dans le footer quand la branche courante a une merge request GitLab ouverte.
- **2.1.233** : on peut désormais passer une URL de merge request GitLab directement à
  `--worktree` ; Claude Code crée alors la branche à partir de cette MR. Depuis la 2.1.232, les
  marketplaces clonent aussi les URLs `gitlab.com` nues.
- **2.1.232** : des mentions « @ » permettent d'envoyer un message vers une autre session ouverte
  sur la même machine, simplement en tapant `@` suivi de son nom. Cette fonctionnalité reste
  limitée à macOS et Linux et n'est pas disponible via Bedrock, Claude Platform sur AWS, Google
  Cloud Agent Platform, ni Foundry.

## En résumé

Rien de tout cela ne révolutionne l'outil du jour au lendemain, mais l'ensemble dessine une
tendance claire, Claude Code cherchant à réduire la friction de configuration (auto mode par
défaut, règles en langage naturel) tout en élargissant son terrain de jeu au-delà du pur texte
(la skill `/design`, la sélection d'éléments dans le Browser). Pour une équipe qui l'utilise en
production, le point le plus actionnable à court terme reste sans doute la configuration de
l'auto mode via `soft_deny`/`hard_deny`, car c'est le genre de garde-fou qu'il vaut mieux poser
avant d'automatiser davantage plutôt qu'après un incident.

## Sources

- **Source officielle** : communication officielle de l'équipe Claude Code (newsletter produit
  Anthropic), reçue le 22 août 2026.
- Le détail complet de chaque fonctionnalité (comportement exact, disponibilité par plan,
  configuration avancée) est documenté sur la documentation officielle
  [docs.claude.com](https://docs.claude.com), à consulter pour toute mise en œuvre.
