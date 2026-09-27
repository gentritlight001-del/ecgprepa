"""Remplit le gabarit à partir d'un fichier de contenu JSON (un JSON par PDF).

Usage :
    python newsletter/outils/remplir.py newsletter/build/<numero>-fr.json [...]

Le JSON (voir newsletter/outils/exemple-contenu.json) contient :
  "sortie"      : chemin du HTML à écrire (dans newsletter/build/)
  "langue"      : fr | en | es | de — attribut lang, étiquette « Le chiffre »
                  traduite, espaces insécables françaises si fr
  "images"      : {"UNE": chemin, "1": chemin, "2": chemin, "3": chemin}
                  (webp, jpg ou png ; convertis en JPEG base64, en couleur)
  "champs"      : tous les {{CHAMPS}} du gabarit (sans les accolades)
  et SOIT "vocabulaire" : {"titre": "Le vocabulaire", "entrees": [["mot", "traduction"], ...]}
  SOIT "mot"   : {"MOT": ..., "ETYMOLOGIE": ..., "ORIGINE": ..., "DEFINITION": ..., "USAGE": ...}

Le <style> du gabarit n'est jamais modifié : seuls les champs, les jetons
d'images et le bloc de l'encadré (variante A ou B du gabarit) sont remplacés.
"""
import base64
import io
import json
import re
import sys
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parents[2]
GABARIT = RACINE / "newsletter" / "gabarit-newsletter.html"
CHIFFRE = {"fr": "Le chiffre", "en": "The figure", "es": "La cifra", "de": "Die Zahl"}
LARGEUR = {"UNE": 1400, "1": 700, "2": 700, "3": 700}


def image(chemin, largeur):
    chemin = Path(chemin)
    if not chemin.is_absolute():
        chemin = RACINE / chemin
    if not chemin.exists():
        # même nom, autre extension (certaines images du site sont en .jpg)
        autres = sorted(chemin.parent.glob(chemin.stem + ".*"))
        if not autres:
            sys.exit(f"Image introuvable : {chemin} — chercher le bon nom avec "
                     f"grep -o 'images/[^\"]*' dans l'article.")
        chemin = autres[0]
    im = Image.open(chemin).convert("RGB")
    if im.width > largeur:
        im = im.resize((largeur, round(im.height * largeur / im.width)), Image.LANCZOS)
    tampon = io.BytesIO()
    im.save(tampon, "JPEG", quality=82)
    return "data:image/jpeg;base64," + base64.b64encode(tampon.getvalue()).decode()


def typo_fr(t):
    t = re.sub(r"«\s*", "« ", t)
    t = re.sub(r"\s*»", " »", t)
    return re.sub(r" ([:;%?!])", " \\1", t)


def remplir(fichier):
    c = json.loads(Path(fichier).read_text(encoding="utf-8"))
    langue = c.get("langue", "fr")
    h = GABARIT.read_text(encoding="utf-8")
    h = h.replace('<html lang="fr">', f'<html lang="{langue}">', 1)

    # Encadré du bas de la colonne de droite
    bloc_a = re.compile(r'<div class="vocab">\s*<div class="side-head">Le vocabulaire</div>.*?</table>\s*</div>', re.S)
    if "mot" in c:
        m = c["mot"]
        encadre = ('<div class="vocab">\n        <div class="side-head">Le mot du numéro</div>\n'
                   '        <div class="motblock">\n'
                   f'          <div class="mot">{m["MOT"]}</div>\n'
                   f'          <div class="etym">{m["ETYMOLOGIE"]}</div>\n'
                   f'          <p>{m["ORIGINE"]}</p>\n'
                   f'          <p>{m["DEFINITION"]}</p>\n'
                   f'          <p><span class="lab">En dissertation —</span> {m["USAGE"]}</p>\n'
                   '        </div>\n      </div>')
    else:
        v = c["vocabulaire"]
        lignes = "\n".join(f'          <tr><td class="de">{a}</td><td class="fr">{b}</td></tr>' for a, b in v["entrees"])
        encadre = (f'<div class="vocab">\n        <div class="side-head">{v.get("titre", "Le vocabulaire")}</div>\n'
                   f'        <table>\n{lignes}\n        </table>\n      </div>')
    h, n = bloc_a.subn(lambda _: encadre, h, count=1)
    assert n == 1, "bloc vocabulaire du gabarit introuvable"
    # la variante B restée en commentaire n'a plus d'utilité
    h = re.sub(r"\s*<!-- VARIANTE B.*?-->", "", h, count=1, flags=re.S)

    for cle, val in c["champs"].items():
        h = h.replace("{{" + cle + "}}", typo_fr(val) if langue == "fr" else val)
    for cle, chemin in c["images"].items():
        h = h.replace(f"__IMG_{cle}__", image(chemin, LARGEUR.get(cle, 700)))
    h = h.replace('<div class="lab">Le chiffre</div>', f'<div class="lab">{CHIFFRE[langue]}</div>', 1)

    corps = re.sub(r"<!--.*?-->", "", h, flags=re.S)
    restes = sorted(set(re.findall(r"\{\{[A-Z0-9_]+\}\}|__IMG_[A-Z0-9]+__", corps)))
    if restes:
        sys.exit(f"{fichier} : champs non remplis {restes}")
    sortie = RACINE / c["sortie"]
    sortie.parent.mkdir(parents=True, exist_ok=True)
    sortie.write_text(h, encoding="utf-8")
    print(f"écrit : {sortie.relative_to(RACINE)}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    for f in sys.argv[1:]:
        remplir(f)
