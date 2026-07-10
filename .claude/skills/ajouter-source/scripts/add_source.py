#!/usr/bin/env python3
"""Ajoute une source officielle au catalogue d'une catégorie.

Usage:
    python3 add_source.py <categorie> "<sujet>" "<url>" [libre|payant]

- Écrit dans content-sources/<categorie>.md (relatif à la racine du dépôt).
- Refuse une catégorie inconnue et dédoublonne par URL.
- Formate la ligne : "- <sujet> — <url> `[acces]`".
"""
import sys
import os
import re

CATEGORIES = {
    "automobile", "dev-info", "ia-master", "cybersecurity", "fpga",
    "mechanical", "electronics", "pragmatic", "hpc", "telecom", "simulation",
}


def repo_root():
    # scripts/ -> ajouter-source/ -> skills/ -> .claude/ -> racine
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.abspath(os.path.join(here, "..", "..", "..", ".."))


def main():
    if len(sys.argv) < 4:
        print('usage: add_source.py <categorie> "<sujet>" "<url>" [libre|payant]', file=sys.stderr)
        sys.exit(1)

    categorie, sujet, url = sys.argv[1], sys.argv[2].strip(), sys.argv[3].strip()
    acces = sys.argv[4].strip().lower() if len(sys.argv) > 4 else "libre"

    if categorie not in CATEGORIES:
        print(f"Catégorie inconnue : {categorie}\nValides : {', '.join(sorted(CATEGORIES))}", file=sys.stderr)
        sys.exit(2)
    if acces not in ("libre", "payant"):
        print("L'accès doit être 'libre' ou 'payant'.", file=sys.stderr)
        sys.exit(2)
    if not re.match(r"^https?://", url):
        print("L'URL doit commencer par http:// ou https://", file=sys.stderr)
        sys.exit(2)

    path = os.path.join(repo_root(), "content-sources", f"{categorie}.md")
    if not os.path.exists(path):
        print(f"Fichier introuvable : {path}", file=sys.stderr)
        sys.exit(3)

    content = open(path, encoding="utf-8").read()
    if url in content:
        print(f"⚠️  Déjà présent dans {categorie}.md : {url}")
        sys.exit(0)

    line = f"- {sujet} — {url} `[{acces}]`"
    if not content.endswith("\n"):
        content += "\n"
    content += line + "\n"
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"✅ Ajouté à content-sources/{categorie}.md :\n   {line}")


if __name__ == "__main__":
    main()
