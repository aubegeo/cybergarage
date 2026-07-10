#!/usr/bin/env python3
"""Récupère la transcription + métadonnées d'une vidéo YouTube via yt-dlp.

Usage:
    python3 get_transcript.py <youtube_url> [outdir]

Sortie : un objet JSON sur stdout avec le titre, la chaîne, la date, la durée,
et le chemin du fichier texte contenant la transcription nettoyée.
Préfère les sous-titres FR, sinon EN, sinon auto-générés.
"""
import sys
import os
import re
import json
import glob
import tempfile
import subprocess


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def clean_vtt(path):
    """Transforme un .vtt (souvent bruité par les sous-titres auto) en texte propre."""
    lines = []
    with open(path, encoding="utf-8", errors="ignore") as f:
        for raw in f:
            line = raw.rstrip("\n")
            if not line or line.startswith("WEBVTT") or "-->" in line:
                continue
            if re.match(r"^\d+$", line):
                continue
            if line.startswith("Kind:") or line.startswith("Language:"):
                continue
            line = re.sub(r"<[^>]+>", "", line)        # balises <c>, timestamps inline
            line = re.sub(r"&nbsp;", " ", line)
            line = line.strip()
            if line:
                lines.append(line)
    # dédoublonnage des lignes consécutives identiques (typique de l'auto-caption)
    out = []
    for l in lines:
        if not out or out[-1] != l:
            out.append(l)
    text = " ".join(out)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def main():
    if len(sys.argv) < 2:
        print("usage: get_transcript.py <youtube_url> [outdir]", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]
    outdir = sys.argv[2] if len(sys.argv) > 2 else tempfile.mkdtemp(prefix="yt2art_")
    os.makedirs(outdir, exist_ok=True)

    meta = run(["yt-dlp", "--dump-json", "--skip-download", url])
    if meta.returncode != 0:
        print(meta.stderr, file=sys.stderr)
        sys.exit(2)
    info = json.loads(meta.stdout.splitlines()[-1])

    vid = info.get("id", "video")
    sub_base = os.path.join(outdir, vid)
    run([
        "yt-dlp", "--skip-download",
        "--write-subs", "--write-auto-subs",
        "--sub-langs", "fr.*,en.*",
        "--sub-format", "vtt",
        "-o", sub_base + ".%(ext)s",
        url,
    ])

    vtts = glob.glob(sub_base + "*.vtt")
    vtts.sort(key=lambda p: (0 if ".fr" in p else 1, p))  # FR d'abord

    transcript, used = "", None
    if vtts:
        used = vtts[0]
        transcript = clean_vtt(used)

    out_txt = os.path.join(outdir, vid + ".txt")
    with open(out_txt, "w", encoding="utf-8") as f:
        f.write(transcript)

    print(json.dumps({
        "id": vid,
        "title": info.get("title", ""),
        "uploader": info.get("uploader", ""),
        "upload_date": info.get("upload_date", ""),
        "duration_sec": info.get("duration", 0),
        "url": info.get("webpage_url", url),
        "subtitle_file": used,
        "transcript_file": out_txt,
        "word_count": len(transcript.split()),
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
