#!/usr/bin/env python3
"""Ajoute (ou remplace) l'affiche d'un film / la couverture d'un livre sur une fiche de l'Humanité.

    python3 outils/fiche-visuel.py humanite/cinema/robocop.html /chemin/affiche.jpg
    python3 outils/fiche-visuel.py humanite/litterature/la-peste.html /chemin/couverture.jpg

L'image est convertie en WebP (1600 px maximum) et rangée dans le dossier images/ de la
rubrique ; le visuel et le fond flou du bandeau sont insérés dans la page. Pas de légende
sous l'image (le troisième argument, facultatif, ne sert qu'en cas de besoin particulier).
"""
import re
import sys
from pathlib import Path

from PIL import Image

if len(sys.argv) < 3:
    sys.exit(__doc__)

page = Path(sys.argv[1])
src = Path(sys.argv[2])
legende = sys.argv[3] if len(sys.argv) > 3 else ""
if len(legende) > 34:
    print(f"Attention : légende de {len(legende)} caractères, elle sera coupée à l'écran (34 conseillés).")

html = page.read_text(encoding="utf-8")
if '<div class="ch-hero-inner">' not in html:
    sys.exit("Cette page n'a pas le bandeau de fiche attendu (ch-hero-inner).")

nom = page.stem + ("-affiche" if page.parent.name == "cinema" else "-couverture") + ".webp"
dossier = page.parent / "images"
dossier.mkdir(exist_ok=True)
im = Image.open(src).convert("RGB")
im.thumbnail((1600, 1600))
im.save(dossier / nom, "WEBP", quality=86)

alt = ("Affiche : " if page.parent.name == "cinema" else "Couverture : ") + \
    re.search(r"<h1>(.*?)</h1>", html, re.S).group(1).strip()
fond = f'<div class="ch-hero-fond" style="background-image:url(\'images/{nom}\')" aria-hidden="true"></div>\n  '
fig = (f'<figure class="ch-hero-visuel"><img src="images/{nom}" alt="{alt}" loading="eager">'
       + (f"<figcaption>{legende}</figcaption>" if legende else "") + "</figure>\n    ")

# on retire un éventuel visuel précédent, puis on insère le nouveau
html = re.sub(r'\s*<div class="ch-hero-fond".*?</div>', "", html, count=1, flags=re.S)
html = re.sub(r'\s*<figure class="ch-hero-visuel">.*?</figure>', "", html, count=1, flags=re.S)
html = html.replace('<div class="ch-hero">\n', '<div class="ch-hero">\n  ' + fond, 1)
html = html.replace('<div class="ch-hero-inner">\n', '<div class="ch-hero-inner">\n    ' + fig, 1)
page.write_text(html, encoding="utf-8")
print(f"{page} : visuel ajouté ({dossier / nom})")
