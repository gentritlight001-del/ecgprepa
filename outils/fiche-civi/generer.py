#!/usr/bin/env python3
"""PDF d'une fiche de cours de civilisation (une page A4).

    python3 outils/fiche-civi/generer.py outils/fiche-civi/civi-uk-3.html \
        deuxieme_annee/langues/anglais/royaume-uni/fiche-civi-uk-3.pdf

La source est une page HTML de 794 x 1123 px (A4 à 96 dpi). Le script signale un
contenu qui déborde ou un PDF de plus d'une page."""
import os, sys
from playwright.sync_api import sync_playwright

src, dst = os.path.abspath(sys.argv[1]), sys.argv[2]
with sync_playwright() as p:
    try:
        nav = p.chromium.launch()
    except Exception:
        nav = p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium"))
    page = nav.new_page(viewport={"width": 794, "height": 1123})
    page.goto("file://" + src, wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    h = page.evaluate("document.documentElement.scrollHeight")
    page.pdf(path=dst, width="794px", height="1123px", print_background=True,
             margin={"top": "0", "bottom": "0", "left": "0", "right": "0"})
    nav.close()
from pypdf import PdfReader
n = len(PdfReader(dst).pages)
print("✅ 1 page" if n == 1 and h <= 1123 else "❌ %d page(s), hauteur %d px" % (n, h))
