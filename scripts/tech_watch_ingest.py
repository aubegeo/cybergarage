#!/usr/bin/env python3
"""
Second cerveau CyberGarage — veille technique automatique.

Interroge des flux RSS/Atom **officiels** (blogs d'éditeurs, releases GitHub
de projets open source, organismes de standardisation) pertinents pour les
catégories du blog, filtre le bruit avec Ollama local (qwen2.5:7b-instruct),
et alimente directement `content-sources/<categorie>.md` avec les nouvelles
sources jugées exploitables — le même catalogue que la routine
`article-quotidien-source-officielle` et le skill `article-source-officielle`
consomment déjà.

Réutilise `.claude/skills/ajouter-source/scripts/add_source.py` pour l'écriture
(dédoublonnage par URL déjà géré là-bas) plutôt que de dupliquer cette logique.

Aucune dépendance externe : stdlib uniquement (urllib, xml.etree).

Usage :
    python3 scripts/tech_watch_ingest.py [--dry-run]

--dry-run : n'écrit rien (ni content-sources/, ni data/tech_watch_seen.json),
            affiche juste ce qui serait fait. Utile pour valider un nouveau
            flux ou tester après une modification du prompt Ollama.
"""
from __future__ import annotations

import json
import re
import ssl
import subprocess
import sys
import urllib.error
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from xml.etree import ElementTree as ET

try:
    import certifi
    _SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    # Le python.org framework (/Library/Frameworks/Python.framework) n'a pas
    # de chaîne de certs système par défaut tant que "Install Certificates.command"
    # n'a pas tourné — certifi (dispo par défaut avec cet installeur) contourne ça
    # sans dépendre d'une étape manuelle sur la machine qui exécute le LaunchAgent.
    _SSL_CTX = None

ROOT = Path(__file__).resolve().parent.parent
SEEN_FILE = ROOT / "data" / "tech_watch_seen.json"
CONTENT_SOURCES = ROOT / "content-sources"
ADD_SOURCE_SCRIPT = ROOT / ".claude" / "skills" / "ajouter-source" / "scripts" / "add_source.py"

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120 Safari/537.36")

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "qwen2.5:7b-instruct"  # même modèle retenu pour parisSportif (cf. sa mémoire second-cerveau-architecture) — le plus stable en A/B testé là-bas

# Ne considérer que les entrées publiées récemment — sans ça, le tout premier
# run (ou un flux qui republie de vieux billets dans son ordre XML) rejoue des
# mois de backlog d'un coup. 21 jours couvre large la fenêtre entre deux runs
# quotidiens tout en bornant un cold start.
MAX_AGE_DAYS = 21

# Combien d'ajouts au catalogue max par exécution — garde-fou indépendant du
# filtre Ollama : même si plusieurs flux publient beaucoup le même jour, on
# préfère étaler sur plusieurs runs plutôt que noyer content-sources/ d'un coup
# (chaque entrée doit rester repérable par Geoffrey avant d'être piochée par
# la routine article-quotidien-source-officielle).
MAX_ADDED_PER_RUN = 8

CATEGORIES = {
    "automobile", "dev-info", "ia-master", "cybersecurity", "fpga",
    "mechanical", "electronics", "pragmatic", "hpc", "telecom", "simulation",
}

# (nom du flux, URL, catégorie suggérée par défaut — Ollama peut la corriger
# si le contenu réel ne correspond pas, ex. RFC Editor couvre plusieurs
# catégories du blog selon la RFC publiée).
#
# Chaque flux a été vérifié manuellement (curl + UA navigateur) avant d'être
# ajouté ici — plusieurs candidats évidents (NIST CSRC, blog Espressif, NHTSA,
# Euro NCAP, ParaView, gmsh, sre.google) n'ont AUCUN flux RSS/Atom public
# fonctionnel trouvé (404 ou flux vide) et ont été écartés. `automobile` n'a
# donc aucun flux automatisé pour l'instant — la catégorie reste alimentée
# uniquement via content-sources/automobile.md à la main.
#
# huggingface.co/blog a été testé puis retiré (01/09) : c'est une plateforme
# multi-tenant (n'importe quel partenaire y publie — IBM, NXP, ServiceNow...),
# pas un flux "officiel Hugging Face" au sens où l'entend ajouter-source —
# quasiment tous les billets passaient le filtre Ollama alors qu'il s'agit en
# grande partie de billets invités, pas de doc primaire de l'éditeur.
#
# Les flux "releases GitHub" (Angular, OpenJDK, Spring Boot, Ollama, MCP,
# Zephyr, FreeRTOS, OpenFOAM) ont aussi été testés puis retirés (01/09) :
# ce sont des changelogs auto-générés (liste de commits/PR, souvent sans
# aucune prose), pas des annonces — vérifié sur Angular ("22.1.4", "zone.js
# 0.16.3") et Ollama ("v0.33.3") : le filtre Ollama les acceptait à tort
# faute de matière narrative à distinguer d'une vraie annonce. Les blogs
# officiels des mêmes projets (déjà dans la liste) couvrent cet angle.
# Conséquence assumée : `fpga` et `simulation` n'ont plus de flux automatisé
# (comme `automobile`) — mêmes limites, mêmes raisons : pas de flux narratif
# officiel trouvé qui tienne la route.
FEEDS: list[tuple[str, str, str]] = [
    ("Angular — blog",              "https://blog.angular.dev/feed",                                          "dev-info"),
    ("Inside Java (OpenJDK/Oracle)","https://inside.java/feed.xml",                                            "dev-info"),
    ("Spring — blog",               "https://spring.io/blog.atom",                                             "dev-info"),
    ("PyTorch — blog",              "https://pytorch.org/blog/feed.xml",                                       "ia-master"),
    ("OWASP — actualités",          "https://owasp.org/feed.xml",                                              "cybersecurity"),
    ("RFC Editor — nouvelles RFC",  "https://www.rfc-editor.org/rfcrss.xml",                                   "telecom"),
    ("KiCad — blog",                "https://www.kicad.org/blog/index.xml",                                    "electronics"),
    ("Arduino — blog",              "https://blog.arduino.cc/feed/",                                           "electronics"),
    ("RISC-V — blog",               "https://riscv.org/feed/",                                                 "fpga"),
    ("TOP500 — actualités",         "https://www.top500.org/news/feed/",                                       "hpc"),
    ("NVIDIA Developer — blog",     "https://developer.nvidia.com/blog/feed",                                  "hpc"),
    ("NASA — actualités",           "https://www.nasa.gov/news-release/feed/",                                 "mechanical"),
    ("ESA — Ingénierie spatiale",   "https://www.esa.int/rssfeed/Our_Activities/Space_Engineering_Technology", "mechanical"),
    ("Martin Fowler — blog",        "https://martinfowler.com/feed.atom",                                      "pragmatic"),
    ("Aphyr (Jepsen) — blog",       "https://aphyr.com/posts.atom",                                            "pragmatic"),
]


@dataclass
class Item:
    source: str
    title: str
    link: str
    summary: str
    published: datetime | None
    suggested_category: str


def _local(tag: str) -> str:
    """Nom de balise XML sans le préfixe de namespace (`{ns}tag` -> `tag`)."""
    return tag.rsplit("}", 1)[-1]


def _parse_date(raw: str) -> datetime | None:
    raw = raw.strip()
    if not raw:
        return None
    try:
        dt = parsedate_to_datetime(raw)  # RFC 822 (RSS pubDate)
    except (TypeError, ValueError):
        try:
            dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))  # ISO 8601 (Atom)
        except ValueError:
            return None
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def fetch(url: str) -> bytes | None:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=15, context=_SSL_CTX) as r:
            return r.read()
    except (urllib.error.URLError, TimeoutError) as e:
        print(f"  ⚠ indisponible : {e}")
        return None


def parse_feed(name: str, url: str, suggested_category: str) -> tuple[int, list[Item]]:
    """Retourne (nb d'entrées brutes du flux, items exploitables et récents).
    Le nombre brut sert à repérer un flux mort (0 item) plutôt qu'un flux
    simplement sans nouveauté aujourd'hui."""
    data = fetch(url)
    if data is None:
        return 0, []
    try:
        root = ET.fromstring(data)
    except ET.ParseError as e:
        print(f"  ⚠ XML invalide : {e}")
        return 0, []

    entries = [el for el in root.iter() if _local(el.tag) in ("item", "entry")]
    cutoff = datetime.now(timezone.utc) - timedelta(days=MAX_AGE_DAYS)
    items: list[Item] = []
    for el in entries:
        title, summary, pub_raw = "", "", ""
        links: list[tuple[str, str]] = []  # (rel, href)
        for child in el:
            tag = _local(child.tag)
            if tag == "title":
                title = (child.text or "").strip()
            elif tag == "link":
                href = child.get("href") or (child.text or "").strip()
                links.append((child.get("rel") or "alternate", href))
            elif tag in ("description", "summary", "content") and not summary:
                summary = re.sub(r"<[^>]+>", " ", child.text or "").strip()
            elif tag in ("pubDate", "published", "updated") and not pub_raw:
                pub_raw = (child.text or "").strip()
        link = next((h for r, h in links if r == "alternate" and h), None) or (links[0][1] if links else "")
        published = _parse_date(pub_raw)
        if not title or not link:
            continue
        if published is not None and published < cutoff:
            continue  # trop vieux — probablement du backlog, pas une nouveauté
        items.append(Item(name, title, link, summary[:500], published, suggested_category))
    return len(entries), items


def classify_item(item: Item) -> dict | None:
    """Demande à Ollama si l'item est une source officielle exploitable et,
    si oui, dans quelle catégorie et sous quel intitulé. Retourne None si
    rejeté ou si Ollama est indisponible (on ne bloque jamais le run pour ça)."""
    prompt = (
        "Tu tries une veille technique pour un blog qui écrit des articles "
        "strictement sourcés sur de la documentation ou des annonces "
        "OFFICIELLES d'un éditeur/projet primaire — jamais un blog tiers, un "
        "article invité publié par un partenaire sur la plateforme de "
        "quelqu'un d'autre (ex: \"Comment l'entreprise X utilise Y\"), une "
        "étude de cas client, du contenu marketing générique, ou un simple "
        "patch mineur sans substance.\n\n"
        f"Flux : \"{item.source}\" (catégorie suggérée : {item.suggested_category})\n"
        f"Titre : {item.title}\n"
        f"Résumé : {item.summary[:400]}\n\n"
        "Catégories possibles : automobile, dev-info, ia-master, cybersecurity, "
        "fpga, mechanical, electronics, pragmatic, hpc, telecom, simulation.\n\n"
        "Réponds UNIQUEMENT en JSON strict, sans texte autour, avec ce format "
        'exact : {"garder": bool, "categorie": "une des catégories ci-dessus", '
        '"sujet": "intitulé court en français (8 mots max)"}. '
        'En cas de doute, réponds "garder": false — ne garde que ce qui est '
        "clairement une annonce ou une documentation technique officielle et "
        "substantielle, capable de porter à elle seule un article de "
        "800-1500 mots avec du contenu vérifiable et attribuable à l'éditeur "
        "primaire lui-même."
    )
    body = json.dumps({
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
        "format": "json",
    }).encode("utf-8")
    req = urllib.request.Request(
        OLLAMA_URL, data=body, headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            outer = json.loads(r.read().decode("utf-8"))
        payload = json.loads(outer["response"])
    except Exception as e:
        print(f"  ⚠ Ollama indisponible/erreur : {e}")
        return None

    if not payload.get("garder"):
        return None
    categorie = str(payload.get("categorie", "")).strip()
    if categorie not in CATEGORIES:
        categorie = item.suggested_category
    sujet = str(payload.get("sujet", "")).strip()
    if not sujet:
        return None
    return {"categorie": categorie, "sujet": sujet}


def load_seen() -> set[str]:
    if SEEN_FILE.exists():
        return set(json.loads(SEEN_FILE.read_text(encoding="utf-8")))
    return set()


def save_seen(seen: set[str]) -> None:
    SEEN_FILE.parent.mkdir(parents=True, exist_ok=True)
    SEEN_FILE.write_text(json.dumps(sorted(seen), ensure_ascii=False, indent=2), encoding="utf-8")


def already_in_catalog(url: str) -> bool:
    return any(url in f.read_text(encoding="utf-8") for f in CONTENT_SOURCES.glob("*.md"))


def add_to_catalog(categorie: str, sujet: str, url: str, dry_run: bool) -> bool:
    if dry_run:
        print(f"  [dry-run] ajouterait → {categorie} : {sujet} — {url}")
        return True
    result = subprocess.run(
        [sys.executable, str(ADD_SOURCE_SCRIPT), categorie, sujet, url, "libre"],
        capture_output=True, text=True,
    )
    for line in result.stdout.strip().splitlines():
        print(f"  {line}")
    if result.returncode != 0:
        for line in result.stderr.strip().splitlines():
            print(f"  {line}")
        return False
    return True


def _git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True)


def _current_branch() -> str:
    r = _git("rev-parse", "--abbrev-ref", "HEAD")
    return r.stdout.strip() if r.returncode == 0 else ""


def commit_and_push(entries: list[tuple[str, str, str]]) -> None:
    """Committe et pousse UNIQUEMENT content-sources/ sur master — jamais les
    autres fichiers qui pourraient traîner dans l'arbre de travail (le script
    ne doit jamais embarquer par accident du travail en cours sans rapport).
    N'échoue jamais bruyamment : une panne réseau/push ne doit pas empêcher
    les prochains runs (le commit reste local, rattrapable à la main)."""
    if not entries:
        return
    branch = _current_branch()
    if branch != "master":
        print(f"  ⚠ Sur la branche '{branch}', pas 'master' — commit/push sautés "
              f"(les ajouts restent dans le fichier, non committés).")
        return

    _git("add", "content-sources/")
    lines = [f"- {cat}: {sujet}" for cat, sujet, _url in entries]
    msg = (
        f"Second cerveau : ajoute {len(entries)} source(s) au catalogue\n\n"
        + "\n".join(lines)
        + "\n\nAjout automatique via scripts/tech_watch_ingest.py (veille RSS + Ollama)."
    )
    commit = _git("commit", "-m", msg)
    if commit.returncode != 0:
        print(f"  ⚠ git commit a échoué : {commit.stderr.strip()}")
        return
    print(f"  ✓ committé : {commit.stdout.strip().splitlines()[0] if commit.stdout.strip() else 'ok'}")

    pull = _git("pull", "--rebase", "origin", "master")
    if pull.returncode != 0:
        print(f"  ⚠ git pull --rebase a échoué : {pull.stderr.strip()} "
              f"— le commit reste local, à pousser/résoudre à la main.")
        return

    push = _git("push", "origin", "master")
    if push.returncode != 0:
        print(f"  ⚠ git push a échoué : {push.stderr.strip()} "
              f"— le commit reste local, à pousser à la main.")
        return
    print("  ✓ poussé sur origin/master")


def run(dry_run: bool = False) -> None:
    seen = load_seen()
    evaluated = 0
    added_entries: list[tuple[str, str, str]] = []  # (categorie, sujet, url)

    for name, url, suggested in FEEDS:
        if len(added_entries) >= MAX_ADDED_PER_RUN:
            print(f"→ {name} — ignoré (plafond de {MAX_ADDED_PER_RUN} ajouts atteint pour ce run)")
            continue
        print(f"→ {name}")
        raw_n, items = parse_feed(name, url, suggested)
        new_items = [it for it in items if it.link not in seen]
        for item in new_items:
            if len(added_entries) >= MAX_ADDED_PER_RUN:
                break
            seen.add(item.link)
            if already_in_catalog(item.link):
                continue
            evaluated += 1
            verdict = classify_item(item)
            if verdict is None:
                continue
            if add_to_catalog(verdict["categorie"], verdict["sujet"], item.link, dry_run):
                added_entries.append((verdict["categorie"], verdict["sujet"], item.link))
        print(f"  {raw_n} entrée(s) du flux, {len(new_items)} récente(s) (<{MAX_AGE_DAYS}j) évaluée(s)")

    if not dry_run:
        save_seen(seen)
        commit_and_push(added_entries)
    print(f"\n{evaluated} candidat(s) évalué(s) par Ollama, {len(added_entries)} ajouté(s) au catalogue.")
    if dry_run:
        print("(dry-run : rien n'a été écrit sur disque)")


if __name__ == "__main__":
    run(dry_run="--dry-run" in sys.argv)
