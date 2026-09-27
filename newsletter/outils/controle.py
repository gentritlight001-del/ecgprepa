"""Contrôle de mise en page d'une newsletter avant rendu PDF.

Usage :
    python newsletter/outils/controle.py newsletter/build/<fichier>.html [...]

Vérifie toutes les règles de CLAUDE.md qui se mesurent : une seule page,
aucun blanc, titres du bas sur 2 lignes, vocabulaire sur une ligne, etc.
Chaque ligne ❌ indique quoi corriger. Tout doit être ✅ avant de livrer.
"""
import os
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

RACINE = Path(__file__).resolve().parents[2]
POLICES = RACINE / "newsletter" / "fonts" / "polices.css"
HAUTEUR_MAX = 1120   # .paper à 1123 px donne déjà un PDF de 2 pages
TOLERANCE = 6        # px d'écart admis pour dire que deux colonnes « finissent ensemble »

MESURE = r"""() => {
  const $ = s => document.querySelector(s);
  const bas = e => e ? Math.round(e.getBoundingClientRect().bottom) : null;
  const lignes = e => e ? Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)) : null;
  const corps = $('.body-2col'), milieu = corps.getBoundingClientRect().left + corps.getBoundingClientRect().width / 2;
  let col1 = 0, col2 = 0;
  corps.querySelectorAll('p').forEach(p => { for (const r of p.getClientRects()) {
    if (r.left < milieu) col1 = Math.max(col1, r.bottom); else col2 = Math.max(col2, r.bottom); } });
  const vocab = [...document.querySelectorAll('.vocab tr')];
  const hLigne = vocab.length ? Math.min(...vocab.map(t => t.getBoundingClientRect().height)) : 0;
  return {
    paper: $('.paper').scrollHeight,
    titreUne: lignes($('h2.lead-title')),
    chapeau: lignes($('.deck')),
    col1: Math.round(col1), col2: Math.round(col2),
    lienUne: bas($('.readmore')),
    lead: bas([...$('.col-lead').children].pop()),
    side: bas([...$('.col-side').children].pop()),
    breves: [...document.querySelectorAll('.brief p')].map(lignes),
    titresBas: [...document.querySelectorAll('.bcol h3')].map(lignes),
    videBas: [...document.querySelectorAll('.bcol')].map(c =>
      Math.round(c.querySelector('.tagrow').getBoundingClientRect().top - c.querySelector('p').getBoundingClientRect().bottom)),
    nbVocab: vocab.length,
    vocabSur2: vocab.filter(t => t.getBoundingClientRect().height > hLigne * 1.5).map(t => t.textContent.trim()),
    motDuNumero: !!$('.motblock'),
  };
}"""


def navigateur(p):
    try:
        return p.chromium.launch()
    except Exception:
        return p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium"))


def controler(page, fichier):
    html = fichier.read_text(encoding="utf-8")
    corps = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    restes = sorted(set(re.findall(r"\{\{[A-Z0-9_]+\}\}|__IMG_[A-Z0-9]+__", corps)))

    page.goto(fichier.resolve().as_uri())
    page.add_style_tag(url=POLICES.as_uri())
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(500)
    m = page.evaluate(MESURE)

    res = []
    def ok(cond, texte, conseil=""):
        res.append((bool(cond), texte, conseil))

    ok(not restes, f"Champs remplis {restes if restes else ''}", "remplacer les champs restants")
    ok(m["paper"] <= HAUTEUR_MAX, f"Hauteur .paper = {m['paper']} px (max {HAUTEUR_MAX})",
       "raccourcir la colonne la plus haute (.col-side ou .col-lead)")
    ok(m["paper"] >= HAUTEUR_MAX - 20, f"Pas de blanc en bas de page ({HAUTEUR_MAX - m['paper']} px libres)",
       "allonger la une ET la colonne de droite d'une ou deux lignes")
    ok(m["titreUne"] <= 2, f"Titre de une sur {m['titreUne']} ligne(s) (max 2)", "raccourcir le titre de une")
    ok(m["chapeau"] <= 3, f"Chapeau sur {m['chapeau']} ligne(s) (max 3)", "raccourcir le chapeau")
    ok(abs(m["col1"] - m["col2"]) <= TOLERANCE,
       f"Texte de une : fin col. 1 = {m['col1']}, fin col. 2 (lien) = {m['col2']}",
       "col. 2 plus basse → raccourcir PARA_3/PARA_4 ; plus haute → les allonger")
    ok(abs(m["side"] - m["lead"]) <= 18,
       f"Colonne de droite : bas = {m['side']}, bas de la une = {m['lead']}",
       ("ajouter des entrées de vocabulaire" if not m["motDuNumero"] else "allonger les paragraphes du « mot du numéro »")
       if m["side"] < m["lead"] else
       ("retirer des entrées au-delà de 12" if not m["motDuNumero"] else "raccourcir les paragraphes du « mot du numéro »"))
    ok(all(b <= 3 for b in m["breves"]), f"Brèves de droite : {m['breves']} lignes (max 3)", "raccourcir la brève trop longue")
    ok(all(t == 2 for t in m["titresBas"]), f"Titres du bas : {m['titresBas']} lignes (2 chacun)",
       "reformuler le titre qui ne fait pas 2 lignes")
    ok(all(v <= 4 for v in m["videBas"]), f"Brèves du bas jusqu'à la ligne « Lire → » : vide {m['videBas']} px",
       "allonger le texte qui laisse un vide (ou raccourcir celui qui fait descendre les autres)")
    if not m["motDuNumero"]:
        ok(m["nbVocab"] >= 12, f"Vocabulaire : {m['nbVocab']} entrées (min 12)", "ajouter des entrées")
        ok(not m["vocabSur2"], f"Vocabulaire sur une ligne {m['vocabSur2'] if m['vocabSur2'] else ''}",
           "raccourcir ou remplacer l'entrée trop longue")

    print(f"\n{fichier.name}")
    for bon, texte, conseil in res:
        print(("  ✅ " if bon else "  ❌ ") + texte + ("" if bon or not conseil else f"  → {conseil}"))
    return all(b for b, _, _ in res)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    tout_bon = True
    with sync_playwright() as p:
        b = navigateur(p)
        page = b.new_page(viewport={"width": 794, "height": 1123})
        for f in sys.argv[1:]:
            tout_bon &= controler(page, Path(f))
        b.close()
    print("\nTout est bon : lancer generer-pdf.py." if tout_bon else "\nÀ corriger avant de lancer generer-pdf.py.")
    sys.exit(0 if tout_bon else 1)


if __name__ == "__main__":
    main()
