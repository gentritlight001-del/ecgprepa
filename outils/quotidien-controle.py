#!/usr/bin/env python3
"""Contrôle d'une page « L'anglais au quotidien » avant sa mise en ligne.

    python3 outils/quotidien-controle.py premiere_annee/langues/anglais/quotidien/jour-AAAA-MM-JJ.html

Une ligne ✅/❌ par règle (voir CLAUDE.md, « L'anglais au quotidien »). Code de sortie 1 s'il
reste un ❌ : corriger la page (ou l'index, les listes) et relancer jusqu'à ce que tout soit ✅.
Ouvre la page dans Chromium (auth.js remplacé par un script vide), à 1280 et 390 px.
"""
import functools, http.server, json, os, re, sys, threading
from pathlib import Path

from playwright.sync_api import sync_playwright

RACINE = Path(__file__).resolve().parent.parent
resultats = []


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
    gestion = functools.partial(Silencieux, directory=str(RACINE))
    s = http.server.ThreadingHTTPServer(('127.0.0.1', 0), gestion)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    page = Path(sys.argv[1]).resolve()
    rel = page.relative_to(RACINE).as_posix()
    dossier = page.parent
    langue_dir = dossier.parent                      # premiere_annee/langues/anglais
    langue = langue_dir.name
    html = page.read_text(encoding='utf-8')
    date = re.search(r'jour-(\d{4}-\d{2}-\d{2})\.html$', page.name)
    date = date.group(1) if date else ''

    s = serveur()
    url = 'http://127.0.0.1:%d/%s' % (s.server_address[1], rel)
    with sync_playwright() as p:
        nav = navigateur(p)
        J = None
        for largeur in (1280, 390):
            pg = nav.new_page(viewport={'width': largeur, 'height': 900})
            erreurs = []
            pg.on('pageerror', lambda e: erreurs.append(str(e)))
            pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' else None)
            pg.route('**/auth.js', lambda r: r.fulfill(body='', content_type='application/javascript'))
            pg.goto(url)
            pg.wait_for_timeout(600)
            if largeur == 1280:
                J = pg.evaluate('window.JOUR')
                regle(not erreurs, 'Aucune erreur JavaScript', '; '.join(erreurs[:3]))
                scores = pg.evaluate("""() => {
                  document.querySelectorAll('.g-carte').forEach(c => c.classList.add('ouvert'));
                  return [...document.querySelectorAll('.exo')].map((ex, i) => {
                    ex.querySelectorAll('.trou').forEach((t, k) => t.value = window.JOUR.grammaire[i].exercice.items[k].r[0]);
                    ex.querySelector('.bouton.plein').click();
                    return ex.querySelector('.score').textContent;
                  });
                }""")
                mauvais = [i + 1 for i, sc in enumerate(scores) if 'parfait' not in sc]
                regle(scores and not mauvais, 'Chaque exercice rempli avec r[0] donne « parfait »',
                      'cartes ' + ', '.join(map(str, mauvais)) if mauvais else 'aucun exercice')
                reperes = pg.evaluate("[...new Set([...document.querySelectorAll('.texte .g')].map(g => +g.dataset.g))]")
                attendus = list(range(1, len(J['grammaire']) + 1))
                regle(sorted(reperes) == attendus, 'Un repère [n|…] dans le texte pour chaque carte de grammaire',
                      'repères %s, cartes %s' % (sorted(reperes), attendus))
            largeur_page = pg.evaluate('document.documentElement.scrollWidth')
            regle(largeur_page <= largeur, 'Pas de défilement horizontal à %d px' % largeur, '%d px' % largeur_page)
            pg.close()
        nav.close()
    s.shutdown()

    # Contenu
    g = J['grammaire']
    regle(5 <= len(g) <= 6, '5 ou 6 cartes de grammaire', str(len(g)))
    regle(all(3 <= len(c['exercice']['items']) <= 4 for c in g), '3 ou 4 phrases par exercice')
    regle(4 <= len(J.get('aussi', [])) <= 8, '4 à 8 points dans « Et aussi »', str(len(J.get('aussi', []))))
    ess, th = J['vocabulaire']['essentiels'], J['vocabulaire']['theme']['mots']
    regle(12 <= len(ess) <= 14 and len(ess) % 2 == 0, '12 à 14 essentiels, nombre pair', str(len(ess)))
    regle(12 <= len(th) <= 18 and len(th) % 2 == 0, '12 à 18 mots du thème, nombre pair', str(len(th)))
    regle(all(m.get('ex') for m in ess + th), 'Chaque mot a un exemple')
    regle(len(J['version']) == 3 and len(J['theme']) == 3, 'Version et thème : 3 phrases chacun',
          '%d / %d' % (len(J['version']), len(J['theme'])))
    regle(4 <= len(J['bilan']) <= 5, 'Bilan de 4 ou 5 phrases', str(len(J['bilan'])))
    regle('comprehension' not in J, 'Pas de questions de compréhension')
    regle(J.get('date') == date, 'La date des données correspond au nom du fichier', '%s / %s' % (J.get('date'), date))
    mots = len(re.sub(r'\[\d+\||\{[^|{}]*\|[^{}]*\}|[\[\]]', ' ', ' '.join(J['texte']['paragraphes'])).split())
    regle(230 <= mots <= 370, 'Texte de 250 à 350 mots environ', '%d mots' % mots)

    # Renvois vers les leçons : l'ancre doit exister
    absents = []
    for c in g:
        for l in c.get('liens') or [{'lecon': c.get('lecon'), 'ancre': c.get('ancre')}]:
            absents += [(l['lecon'], l.get('ancre'))]
    for a in J.get('aussi', []):
        absents += [(a.get('lecon'), a.get('ancre'))]
    manquants = []
    for n, ancre in absents:
        f = langue_dir / ('lecon%s.html' % n)
        if not f.exists() or (ancre and ('id="%s"' % ancre) not in f.read_text(encoding='utf-8')):
            manquants.append('leçon %s #%s' % (n, ancre))
    regle(not manquants, 'Chaque renvoi pointe vers une section qui existe', ', '.join(manquants))

    # Listes et données
    index = (dossier / 'index.html').read_text(encoding='utf-8')
    une = re.search(r'<a class="une[^"]*" href="([^"]+)"', index)
    regle(bool(une) and une.group(1) == page.name, 'Carte « Le texte du jour » de l\'index sur ce jour',
          une.group(1) if une else 'carte introuvable')
    premiere = re.search(r'<a class="jour-card[^"]*" href="([^"]+)" data-date="([^"]+)"', index)
    regle(bool(premiere) and premiere.group(1) == page.name and premiere.group(2) == date,
          'Ce jour en tête de la grille « Tous les jours »', premiere.group(0) if premiere else 'grille vide')
    accueil = (langue_dir / 'index.html').read_text(encoding='utf-8')
    regle(('quotidien/' + page.name) in accueil, 'Carte « Le texte du jour » de la page %s à jour' % langue)
    flash = RACINE / 'premiere_annee/langues/flashcards' / (langue + '.js')
    regle(flash.exists() and ('"date":"%s"' % date) in flash.read_text(encoding='utf-8'),
          'Flashcards régénérées (python3 outils/flashcards.py)')
    regle('og:image' in html and 'rel="canonical"' in html, 'Balises og: et canonical (images-partage.py, referencement.py)')

    print()
    if all(resultats):
        print('Tout est bon : la page peut être mise en ligne.')
    else:
        print('%d règle(s) à corriger.' % resultats.count(False))
        sys.exit(1)


if __name__ == '__main__':
    main()
