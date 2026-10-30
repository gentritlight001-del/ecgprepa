#!/usr/bin/env python3
"""Carrousel de chapitre (cartes 1080 × 1350) : HTML -> images.

    python3 outils/carrousel/generer.py outils/carrousel/hgg2-chapitre1.html \
        deuxieme_annee/hgg/carrousel/chapitre-1 [dossier-png]

Écrit une image WebP par carte (01.webp, 02.webp…) dans le dossier du site et, si un
troisième argument est donné, les PNG pleine taille pour Instagram (jamais versionnés :
les mettre dans le scratchpad). Le HTML d'un chapitre se copie de hgg2-chapitre1.html
(même dossier, feuille style.css) ; chaque carte est une <section class="s"> dont
data-alt donne le texte alternatif repris sur la page du chapitre.
Le script signale un bloc qui sort de sa carte ou chevauche le pied de page."""
import io, json, os, sys
from PIL import Image
from playwright.sync_api import sync_playwright

src, dst = os.path.abspath(sys.argv[1]), sys.argv[2]
png = sys.argv[3] if len(sys.argv) > 3 else None
os.makedirs(dst, exist_ok=True)
if png:
    os.makedirs(png, exist_ok=True)
with sync_playwright() as p:
    try:
        nav = p.chromium.launch()
    except Exception:
        nav = p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium"))
    page = nav.new_page(viewport={"width": 1160, "height": 1430}, device_scale_factor=1)
    page.goto("file://" + src, wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    # Blocs qui débordent : sortent de la carte, ou descendent sur le pied de page.
    soucis = page.evaluate("""[...document.querySelectorAll('.s')].map((s, i) => {
        const r = s.getBoundingClientRect(), pied = s.querySelector('.pied').getBoundingClientRect().top;
        const out = [];
        s.querySelectorAll(':scope > *:not(.haut):not(.pied):not(.tampon)').forEach(el => {
          const b = el.getBoundingClientRect();
          if (b.right > r.right + 1 || b.left < r.left - 1) out.push(el.className + ' sort sur le côté');
          if (b.bottom > pied - 16) out.push(el.className + ' touche le pied (' + Math.round(b.bottom - pied + 16) + ' px)');
        });
        return out; })""")
    alts = []
    for i, s in enumerate(page.query_selector_all(".s"), 1):
        s.scroll_into_view_if_needed()
        img = Image.open(io.BytesIO(s.screenshot())).convert("RGB")
        img.save(os.path.join(dst, "%02d.webp" % i), "WEBP", quality=88)
        if png:
            img.save(os.path.join(png, "%02d.png" % i))
        alts.append(s.get_attribute("data-alt"))
    nav.close()
for i, sc in enumerate(soucis, 1):
    print(("❌ carte %02d : %s" % (i, " ; ".join(sc))) if sc else "✅ carte %02d" % i)
print(json.dumps(alts, ensure_ascii=False, indent=1))
print("Images :", dst, png or "")
