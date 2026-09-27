#!/usr/bin/env python3
"""
Génère le PDF d'une newsletter ECG Prépa à partir d'un fichier HTML rempli,
et vérifie qu'il tient sur une seule page A4.

Usage :
    python generer-pdf.py build/numero.html "out/FR - Newsletter Germanophone - Semaine du 14 septembre 2026.pdf"

Sorties :
    - le PDF demandé
    - une capture PNG à côté du PDF, à relire avant de livrer
Code de retour 1 si la page déborde ou si le PDF fait plus d'une page.
"""

import os
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

POLICES = Path(__file__).resolve().parent / "fonts" / "polices.css"
LARGEUR = 794          # A4 à 96 dpi
HAUTEUR_MAX = 1123     # hauteur utile d'une page A4


def generer(html: Path, pdf: Path) -> int:
    pdf.parent.mkdir(parents=True, exist_ok=True)
    png = pdf.with_suffix(".png")

    with sync_playwright() as p:
        try:
            nav = p.chromium.launch()
        except Exception:
            # Environnement cloud Claude Code : Chromium préinstallé à un chemin fixe
            chemin = os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium")
            nav = p.chromium.launch(executable_path=chemin)
        page = nav.new_page(viewport={"width": LARGEUR, "height": HAUTEUR_MAX})
        page.goto(html.resolve().as_uri())
        # Lora et Poppins sont fournies dans newsletter/fonts/ : elles sont chargées
        # ici, sans toucher au <style> du gabarit, pour un rendu identique partout.
        if POLICES.exists():
            page.add_style_tag(url=POLICES.as_uri())
        page.evaluate("document.fonts.ready")
        page.wait_for_timeout(800)

        hauteur = page.evaluate("document.querySelector('.paper').scrollHeight")

        page.pdf(
            path=str(pdf),
            format="A4",
            print_background=True,
            margin={"top": "0", "bottom": "0", "left": "0", "right": "0"},
            prefer_css_page_size=True,
        )
        page.screenshot(path=str(png), full_page=True)

        liens = page.evaluate("document.querySelectorAll('a[href^=\"http\"]').length")
        nav.close()

    try:
        from pypdf import PdfReader
        pages = len(PdfReader(str(pdf)).pages)
    except ImportError:
        pages = None

    print(f"hauteur .paper : {hauteur} px (maximum {HAUTEUR_MAX})")
    print(f"liens cliquables : {liens}")
    if pages is not None:
        print(f"pages du PDF   : {pages}")
    print(f"PDF            : {pdf}")
    print(f"capture        : {png}")

    if hauteur > HAUTEUR_MAX or (pages is not None and pages > 1):
        print(
            "\nLA PAGE DEBORDE. Raccourcir la rédaction, en commençant par la colonne "
            "la plus haute. Ne jamais toucher aux polices, aux images, aux marges ni "
            "au nombre de lignes du vocabulaire."
        )
        return 1

    print("\nUne seule page : OK. Relire la capture avant de livrer.")
    return 0


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__)
        sys.exit(2)
    sys.exit(generer(Path(sys.argv[1]), Path(sys.argv[2])))
