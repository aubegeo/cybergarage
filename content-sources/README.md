# Catalogues de sources officielles — par catégorie

Un fichier par catégorie du blog. Chaque fichier liste des **idées d'articles** rattachées à
leur **source officielle**. La routine quotidienne et le skill `article-source-officielle`
piochent ici ; le skill `ajouter-source` permet d'y ajouter une source facilement.

## Format d'une entrée
```
- Sujet de l'article — https://url-officielle `[libre]`
```
- `[libre]` = consultable librement · `[payant]` = norme payante (à éviter) · `[fait]` = déjà publié.
- Toujours une **source primaire** (éditeur/organisme officiel), jamais un blog tiers.

## Catégories
| Fichier | Catégorie affichée |
|---|---|
| [automobile.md](automobile.md) | Automobile |
| [dev-info.md](dev-info.md) | Artisan Développeur |
| [ia-master.md](ia-master.md) | IA Master |
| [cybersecurity.md](cybersecurity.md) | Cybersécurité |
| [fpga.md](fpga.md) | FPGA & Embarqué |
| [mechanical.md](mechanical.md) | Mécanique |
| [electronics.md](electronics.md) | Électronique |
| [pragmatic.md](pragmatic.md) | Pragmatic Engineer |
| [hpc.md](hpc.md) | HPC |
| [telecom.md](telecom.md) | Télécom |
| [simulation.md](simulation.md) | Simulation |

## Ajouter une source
- À la main : ouvre le fichier de la catégorie et colle une ligne au format ci-dessus.
- Via le skill : demande « ajoute cette source : <url> » (le skill `ajouter-source` s'en charge),
  ou lance le script :
  ```bash
  python3 .claude/skills/ajouter-source/scripts/add_source.py <categorie> "<sujet>" "<url>" [libre|payant]
  ```
