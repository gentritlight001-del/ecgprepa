#!/usr/bin/env python3
"""Flashcards : rassemble le vocabulaire de toutes les pages du jour, langue par langue.

    python3 outils/flashcards.py

Lit le bloc <script id="donnees"> de chaque `premiere_annee/langues/<langue>/quotidien/jour-*.html`
(listes `essentiels` et `theme.mots`) et écrit `premiere_annee/langues/flashcards/<langue>.js`
(window.ECG_FLASHCARDS['<langue>']) et la liste des langues qui en ont (`langues.js`), lus par
l'espace flashcards
(`premiere_annee/langues/flashcards/index.html`).

Ne jamais modifier les fichiers générés à la main. Relançable sans risque : à lancer à chaque
mise en ligne d'un nouveau jour.
"""
import glob, json, os, re

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SORTIE = RACINE + 'premiere_annee/langues/flashcards/'

CHAINE = r'"((?:[^"\\]|\\.)*)"'
MOT = re.compile(r'\{\s*en:\s*' + CHAINE + r',\s*fr:\s*' + CHAINE + r'(?:,\s*ex:\s*' + CHAINE + r')?\s*\}')


def js(s):
    return json.loads('"' + s + '"') if s else ''


def champ(bloc, nom):
    m = re.search(r'\b' + nom + r':\s*' + CHAINE, bloc)
    return js(m.group(1)) if m else ''


def mots(bloc):
    return [{'en': js(a), 'fr': js(b), 'ex': js(c or '')} for a, b, c in MOT.findall(bloc)]


def lire_jour(chemin):
    texte = open(chemin, encoding='utf-8').read()
    m = re.search(r'<script id="donnees">(.*?)</script>', texte, re.S)
    if not m:
        return None
    d = m.group(1)
    v = d.find('vocabulaire:')
    if v < 0:
        return None
    voc = d[v:]
    e, t = voc.find('essentiels:'), voc.find('theme:')
    fin = voc.find('\n  },', t)
    num = re.search(r'\bnumero:\s*(\d+)', d)
    return {
        'numero': int(num.group(1)) if num else 0,
        'date': champ(d, 'date'),
        'titre': champ(d, 'titre'),
        'page': os.path.basename(chemin),
        'essentiels': mots(voc[e:t]),
        'theme': {'titre': champ(voc[t:], 'titre'), 'mots': mots(voc[t:fin if fin > 0 else None])},
    }


def main():
    os.makedirs(SORTIE, exist_ok=True)
    langues = []
    for dossier in sorted(glob.glob(RACINE + 'premiere_annee/langues/*/quotidien/')):
        langue = dossier.rstrip('/').split('/')[-2]
        jours = [j for j in (lire_jour(c) for c in glob.glob(dossier + 'jour-*.html')) if j]
        jours.sort(key=lambda j: j['date'], reverse=True)
        with open(SORTIE + langue + '.js', 'w', encoding='utf-8') as f:
            f.write('/* Généré par outils/flashcards.py : ne pas modifier à la main. */\n')
            f.write('window.ECG_FLASHCARDS = window.ECG_FLASHCARDS || {};\n')
            f.write('window.ECG_FLASHCARDS[%s] = %s;\n' % (json.dumps(langue),
                    json.dumps({'jours': jours}, ensure_ascii=False, separators=(',', ':'))))
        langues.append(langue)
        n = sum(len(j['essentiels']) + len(j['theme']['mots']) for j in jours)
        print('%s.js : %d jour(s), %d cartes' % (langue, len(jours), n))
    with open(SORTIE + 'langues.js', 'w', encoding='utf-8') as f:
        f.write('/* Généré par outils/flashcards.py : ne pas modifier à la main. */\n')
        f.write('window.ECG_FLASHCARDS_LANGUES = %s;\n' % json.dumps(langues))


if __name__ == '__main__':
    main()
