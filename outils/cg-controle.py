#!/usr/bin/env python3
"""Contrôle d'un dossier de culture générale (gabarit « bento ») avant sa mise en ligne.

    python3 outils/cg-controle.py Culture-Generale/<slug>.html [autre.html ...]

Une ligne ✅/❌ par règle (voir CLAUDE.md, « Dossiers de culture générale »). Code de sortie 1 s'il
reste un ❌ : corriger la page et relancer jusqu'à ce que tout soit ✅. Ouvre la page dans Chromium
(auth.js remplacé par un script vide) à 1920, 1440, 1280, 1000 et 390 px.
"""
import functools, http.server, os, re, sys, threading
from pathlib import Path

from playwright.sync_api import sync_playwright

RACINE = Path(__file__).resolve().parent.parent
resultats = []
LARGEURS = (1920, 1440, 1280, 1000, 390)


def regle(ok, texte, detail=''):
    resultats.append(ok)
    print(('✅ ' if ok else '❌ ') + texte + ('' if ok or not detail else ' → ' + detail))


def navigateur(p):
    try:
        return p.chromium.launch()
    except Exception:
        return p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/opt/pw-browsers/chromium'))


def serveur():
    class Silencieux(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Silencieux, directory=str(RACINE)))
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


# Mesures faites dans la page. Le nombre de lignes d'un paragraphe vient de sa hauteur (la lettrine
# de l'analyse fausse un comptage par rectangles de texte).
MESURES = """() => {
  const L = e => { const r = document.createRange(); r.selectNodeContents(e); return new Set([...r.getClientRects()].filter(x => x.width > 2).map(x => Math.round(x.top))).size; };
  const bas = e => Math.round(e.getBoundingClientRect().bottom);
  const basTexte = e => { const r = document.createRange(); r.selectNodeContents(e); return Math.round(Math.max(...[...r.getClientRects()].map(x => x.bottom))); };
  const q = s => document.querySelector(s), qa = s => [...document.querySelectorAll(s)];
  const hLignes = e => { const cs = getComputedStyle(e); return (e.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / parseFloat(cs.lineHeight); };
  const grilles = {};
  ['.pts5', '.branches', '.cp'].forEach(sel => { const c = q(sel); if (c) grilles[sel] = { titres: qa(sel + ' strong').map(L), textes: qa(sel + ' small').map(L), hautTitres: qa(sel + ' strong').map(e => Math.round(e.getBoundingClientRect().top)) }; });
  const pic = q('.title3 ~ .img3 img, .img3 img');
  const idee = q('.idee'), tip = q('.tip'), band = q('.band p'), cols = qa('.cols2 p');
  const blancs = qa('.txt').map(t => { const ps = [...t.querySelectorAll('p, blockquote')]; const dernier = ps[ps.length - 1]; return Math.round(t.getBoundingClientRect().bottom - dernier.getBoundingClientRect().bottom - parseFloat(getComputedStyle(t).paddingBottom)); });
  return {
    sw: document.documentElement.scrollWidth,
    h1: q('h1') ? L(q('h1')) : 0,
    band: band ? L(band) : 0,
    analyse: cols.map(e => +(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)).toFixed(2)),
    idee: idee && tip ? { ideeBas: basTexte(idee), tipBas: bas(tip), tipTexteBas: basTexte(tip) } : null,
    images: qa('img').map(i => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0, nat: i.naturalWidth, rendu: Math.round(i.getBoundingClientRect().width), hauteurRendu: Math.round(i.getBoundingClientRect().height), natH: i.naturalHeight })),
    grilles, blancs,
    hero: ['.title3', '.img3'].map(s => q(s) ? Math.round(q(s).getBoundingClientRect().height) : null),
  };
}"""


def texte_visible(html):
    t = re.sub(r'<(script|style)\b.*?</\1>', '', html, flags=re.S)
    t = re.sub(r'<title>.*?</title>', '', t, flags=re.S)
    return t


def controle(page_path):
    page = Path(page_path).resolve()
    rel = page.relative_to(RACINE).as_posix()
    html = page.read_text(encoding='utf-8')
    slug = page.stem
    print('\n== ' + rel)

    # ── Fichier ──
    visible = texte_visible(html)
    regle('—' not in visible, 'Aucun tiret cadratin hors <title> et scripts',
          'trouvé : ' + ' | '.join(re.findall(r'.{25}—.{25}', visible.replace('\n', ' '))[:2]))
    regle('class="sn sn-cg"' in html, 'Barre du site « sn sn-cg » (sans sn-dossier)')
    regle('barre-section.css' in html and '../auth.js' in html and '../favoris.js' in html,
          'auth.js, favoris.js et barre-section.css liés')
    regle(all(k in html for k in ('og:image', 'og:title', 'canonical', 'name="description"')),
          'Balises og:, description et canonical présentes (à garder de l’ancienne page)')
    regle(re.search(r'<title>ECG Prépa — [^<]+</title>', html) is not None, '<title> au format « ECG Prépa — Titre »')
    regle('class="toc"' not in html and 'id="p"' not in html, 'Pas de sommaire ni de barre de progression')
    regle('à relier' not in html.lower() and 'href="#"' not in html, 'Aucun lien ni texte de maquette (« à relier », href="#")')
    texte = re.sub(r'<[^>]+>', '\x00', visible)
    espaces = re.findall(r'[^\s\x00] [:;!?»%]|« ', texte)
    regle(not espaces, 'Typographie française : espace insécable avant : ; ! ? » % et après «',
          'espaces simples : ' + ', '.join(sorted(set(espaces))[:6]))
    regle('Dossier n°' in html, 'Numéro de dossier affiché (kicker)')
    regle(len(re.findall(r'class="b (?:vis|sch|camps|gl|tlv|duo)', html)) >= 3 or 'class="branches"' in html,
          'Au moins 3 blocs de schéma ou de repères (voir CLAUDE.md : schémas variés et pertinents)')

    # ── Liens et images ──
    manquants = []
    for href in re.findall(r'(?:href|src)="([^"#:]+?)(?:#[^"]*)?"', html):
        if href.startswith(('http', '//', 'mailto', 'javascript')) or not re.search(r'\.[a-z0-9]+$', href):
            continue
        if not (page.parent / href).resolve().exists():
            manquants.append(href)
    for href in re.findall(r'url\(([^)]+)\)', html):
        if not href.startswith(('http', 'data:')) and not (page.parent / href.strip('\'"')).resolve().exists():
            manquants.append(href)
    regle(not manquants, 'Tous les liens, images et fonds existent', ', '.join(manquants[:5]))

    cg = (RACINE / 'culture-generale.html').read_text(encoding='utf-8')
    regle(("externalUrl: 'Culture-Generale/%s.html'" % slug) in cg, 'Dossier présent dans CG_DATA (culture-generale.html)')

    # ── Page ouverte dans Chromium ──
    s = serveur()
    url = 'http://127.0.0.1:%d/%s' % (s.server_address[1], rel)
    with sync_playwright() as p:
        nav = navigateur(p)
        mesures = {}
        for l in LARGEURS:
            pg = nav.new_page(viewport={'width': l, 'height': 900})
            erreurs = []
            pg.on('pageerror', lambda e: erreurs.append(str(e)))
            pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else None)
            pg.on('requestfailed', lambda r: erreurs.append('requête échouée ' + r.url.split('/')[-1]))
            pg.route('**/auth.js', lambda r: r.fulfill(body='', content_type='application/javascript'))
            pg.goto(url)
            pg.wait_for_timeout(500)
            pg.evaluate("""async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, 0); }""")
            pg.wait_for_timeout(300)
            m = pg.evaluate(MESURES)
            m['erreurs'] = erreurs
            mesures[l] = m
            pg.close()
        nav.close()
    s.shutdown()

    def partout(f, minimum=0):
        return [l for l in LARGEURS if l >= minimum and not f(mesures[l])]

    regle(all(not mesures[l]['erreurs'] for l in LARGEURS), 'Aucune erreur JS ni requête échouée',
          ' | '.join(sorted({e for l in LARGEURS for e in mesures[l]['erreurs']})[:3]))
    regle(all(mesures[l]['sw'] <= l for l in LARGEURS), 'Pas de défilement horizontal',
          ', '.join('%d px : %d' % (l, mesures[l]['sw']) for l in LARGEURS if mesures[l]['sw'] > l))
    regle(all(i['ok'] for l in LARGEURS for i in mesures[l]['images']), 'Toutes les images chargées')
    hero_ok = True
    detail = ''
    for l in LARGEURS:
        for i in mesures[l]['images']:
            if i['rendu'] > i['nat'] * 1.02 and i['nat'] > 0 and 'img3' in html:
                hero_ok = False
                detail = '%s affichée à %d px pour %d px réels (%d px)' % (i['src'], i['rendu'], i['nat'], l)
    regle(hero_ok, 'Aucune image agrandie au-delà de sa taille réelle (jamais floue)', detail)
    regle(not partout(lambda m: m['h1'] <= 3, 1000), 'Titre du héros sur 3 lignes maximum (≥ 1000 px)')
    regle(not partout(lambda m: m['band'] <= 2, 1280), 'Citation (bandeau) sur 2 lignes maximum (≥ 1280 px)',
          ', '.join('%d px : %d lignes' % (l, mesures[l]['band']) for l in LARGEURS if l >= 1280 and mesures[l]['band'] > 2))
    regle(not partout(lambda m: len(m['analyse']) == 2 and abs(m['analyse'][0] - m['analyse'][1]) < 0.3, 1280),
          'Analyse : deux colonnes de même hauteur (≥ 1280 px)',
          ', '.join('%d px : %s' % (l, mesures[l]['analyse']) for l in LARGEURS if l >= 1280))

    def idee_ok(m):
        i = m['idee']
        return i is not None and abs(i['ideeBas'] - i['tipBas']) <= 6 and 12 <= i['tipBas'] - i['tipTexteBas'] <= 32
    regle(not partout(idee_ok, 1280), 'Dans une copie : l’idée-force et le « piège à éviter » finissent à la même ligne',
          ', '.join('%d px : %s' % (l, mesures[l]['idee']) for l in LARGEURS if l >= 1280))

    def grilles_ok(m):
        for g in m['grilles'].values():
            if len(set(g['titres'])) != 1 or g['titres'][0] != 1 or len(set(g['textes'])) != 1:
                return False
        return True
    regle(not partout(grilles_ok, 1280), 'Cartes en rangée : titres sur une ligne, descriptions de même longueur (≥ 1280 px)',
          ', '.join('%d px : %s' % (l, {k: (v['titres'], v['textes']) for k, v in mesures[l]['grilles'].items()}) for l in LARGEURS if l >= 1280 and not grilles_ok(mesures[l])))
    regle(not partout(lambda m: all(b <= 90 for b in m['blancs']), 1280),
          'Pas de grand blanc sous le texte des cartes de récit (≤ 90 px)',
          ', '.join('%d px : %s' % (l, mesures[l]['blancs']) for l in LARGEURS if l >= 1280 and any(b > 90 for b in mesures[l]['blancs'])))
    regle(not partout(lambda m: m['hero'][0] is not None and m['hero'][0] == m['hero'][1], 1280),
          'Titre et photo du héros à la même hauteur (≥ 1280 px)',
          ', '.join('%d px : %s' % (l, mesures[l]['hero']) for l in LARGEURS if l >= 1280))


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(2)
    for chemin in sys.argv[1:]:
        controle(chemin)
    total, ok = len(resultats), sum(resultats)
    print('\n%d règles : %d ✅, %d ❌' % (total, ok, total - ok))
    sys.exit(0 if ok == total else 1)


if __name__ == '__main__':
    main()
