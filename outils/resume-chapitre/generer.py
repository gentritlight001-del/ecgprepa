#!/usr/bin/env python3
"""Résumé de chapitre (2 pages A4) : HTML -> PDF.

    python3 outils/resume-chapitre/generer.py outils/resume-chapitre/hgg1-chapitre4.html \
        premiere_annee/hgg/chapitre-4/resume-chapitre4.pdf

Le HTML d'un chapitre se copie de hgg1-chapitre4.html (même dossier, feuille style.css).
Le script signale une page qui déborde (contenu plus long que la feuille)."""
import os, sys
from playwright.sync_api import sync_playwright

src, dst = os.path.abspath(sys.argv[1]), sys.argv[2]
with sync_playwright() as p:
    try:
        nav = p.chromium.launch()
    except Exception:
        nav = p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium"))
    page = nav.new_page()
    page.goto("file://" + src, wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    deb = page.evaluate("""[...document.querySelectorAll('.page')].map(pg => {
        const last = pg.lastElementChild.getBoundingClientRect().bottom;
        return Math.round(last - pg.getBoundingClientRect().bottom); })""")
    page.pdf(path=dst, format="A4", print_background=True, prefer_css_page_size=True)
    nav.close()
for i, d in enumerate(deb, 1):
    print(("❌ page %d déborde de %d px : raccourcir le texte" % (i, d)) if d > 0 else ("✅ page %d (marge %d px)" % (i, -d)))
print("PDF :", dst)
