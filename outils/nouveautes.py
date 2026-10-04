#!/usr/bin/env python3
"""Nouveautés du site : liste des derniers contenus mis en ligne.

    python3 outils/nouveautes.py

Écrit `nouveautes.js` (window.ECG_NOUVEAUTES), lu par l'accueil (`index.html`, section
« Les nouveautés ») et par la page `nouveautes.html` (fil complet).

Contenus suivis : articles d'actualité des quatre éditions (listes ACTU_DATA), dossiers de
culture générale (CG_DATA), fiches de l'Humanité (cinéma, littérature) et chapitres de cours
(chapitres et notions de philosophie, 1re et 2e année).

La date de mise en ligne d'une page est retenue une fois pour toutes dans
`outils/nouveautes-dates.json` : date du commit qui a ajouté le fichier, ou maintenant pour
une page pas encore commitée. Relançable sans risque : à lancer avant chaque mise en ligne.
"""
import datetime, glob, html, json, os, re, subprocess

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
DATES = RACINE + 'outils/nouveautes-dates.json'
SORTIE = RACINE + 'nouveautes.js'
PAR_TYPE = 40  # entrées gardées par type dans nouveautes.js

EDITIONS = {'monde': 'Monde', 'en': 'Anglais', 'es': 'Espagnol', 'de': 'Allemand'}
MATIERES = {'hgg': 'HGG', 'esh': 'ESH', 'maths': 'Maths', 'mathematiques': 'Maths',
            'philosophie': 'Philosophie'}
ANNEES = {'premiere_annee': '1re année', 'deuxieme_annee': '2e année'}


def lire(chemin):
    with open(RACINE + chemin, encoding='utf-8') as f:
        return f.read()


def js_chaine(s):
    """Décode une chaîne JS entre apostrophes (\\', \\u00a0…)."""
    return re.sub(r'\\u([0-9a-fA-F]{4})|\\(.)',
                  lambda m: chr(int(m.group(1), 16)) if m.group(1) else m.group(2), s)


def objets_js(texte, nom):
    """Objets { clé: 'valeur', … } du tableau `nom` (ACTU_DATA, CG_DATA)."""
    i = texte.find(nom)
    if i < 0:
        return []
    fin = texte.find('];', i)
    objets = []
    for bloc in re.findall(r'\{([^{}]*)\}', texte[i:fin]):
        o = {k: js_chaine(v) for k, v in re.findall(r"(\w+)\s*:\s*'((?:[^'\\]|\\.)*)'", bloc)}
        if o:
            objets.append(o)
    return objets


def titre_page(contenu):
    m = re.search(r'<title>([^<]*)</title>', contenu)
    t = html.unescape(m.group(1)).strip() if m else ''
    return re.sub(r'^ECG Prépa\s*[—-]\s*', '', t).strip()


def premiere_image(chemin, contenu):
    m = re.search(r'''(?:src="|url\(['"]?)(images/[^"')]+\.(?:webp|jpe?g|png))''', contenu)
    if not m:
        return ''
    img = os.path.join(os.path.dirname(chemin), m.group(1))
    return img if os.path.exists(RACINE + img) else ''


def image_si_existe(chemin):
    return chemin if chemin and os.path.exists(RACINE + chemin) else ''


# ─── Recensement des contenus ───

def actualites():
    for code, edition in EDITIONS.items():
        liste = 'actualites/%s/tous-%s.html' % (code, code)
        for o in objets_js(lire(liste), 'ACTU_DATA'):
            url = o.get('externalUrl', '')
            if not url.startswith('articles/'):
                continue
            chemin = 'actualites/%s/%s' % (code, url)
            if not os.path.exists(RACINE + chemin):
                continue
            titre = o.get('cardTitle') or titre_page(lire(chemin))
            image = 'actualites/%s/%s' % (code, o['image']) if o.get('image') else ''
            yield {'t': code, 'rubrique': 'Actu ' + edition, 'meta': o.get('pays', ''),
                   'titre': titre, 'url': chemin, 'image': image_si_existe(image)}


def culture_generale():
    for o in objets_js(lire('culture-generale.html'), 'CG_DATA'):
        chemin = o.get('externalUrl', '')
        if not chemin or not os.path.exists(RACINE + chemin):
            continue
        yield {'t': 'cg', 'rubrique': 'Culture générale', 'meta': o.get('theme', ''),
               'titre': o.get('titre', ''), 'url': chemin,
               'image': image_si_existe(o.get('image', ''))}


def humanite():
    for rub, nom in (('cinema', 'Cinéma'), ('litterature', 'Littérature')):
        for chemin in sorted(glob.glob(RACINE + 'humanite/%s/*.html' % rub)):
            chemin = chemin[len(RACINE):]
            if os.path.basename(chemin) in ('index.html', rub + '.html'):
                continue
            contenu = lire(chemin)
            titre = re.sub(r'^(Cinéma|Littérature)\s*[—-]\s*', '', titre_page(contenu))
            yield {'t': 'humanite', 'rubrique': 'Humanité', 'meta': nom, 'titre': titre,
                   'url': chemin, 'image': premiere_image(chemin, contenu), 'portrait': True}


def cours():
    chemins = glob.glob(RACINE + 'premiere_annee/**/*.html', recursive=True) + \
        glob.glob(RACINE + 'deuxieme_annee/**/*.html', recursive=True)
    for chemin in sorted(chemins):
        chemin = chemin[len(RACINE):]
        if not re.match(r'(chapitre-?\d+|notion-\d+)', os.path.basename(chemin)):
            continue
        parties = chemin.split('/')
        matiere = MATIERES.get(parties[1])
        if not matiere:
            continue
        contenu = lire(chemin)
        m = re.match(r'.*?(Chapitre|Notion)\s*(\d+)\s*:\s*(.+)$', titre_page(contenu))
        if not m:
            continue
        yield {'t': 'cours', 'rubrique': 'Cours',
               'meta': '%s %s · %s %s' % (matiere, ANNEES[parties[0]], m.group(1).lower(), m.group(2)),
               'titre': m.group(3).strip(), 'url': chemin,
               'image': premiere_image(chemin, contenu)}


# ─── Dates de mise en ligne ───

def dates_git():
    """Chemin → date (ISO) du commit qui l'a ajouté (un fichier renommé garde sa date)."""
    try:
        if subprocess.run(['git', 'rev-parse', '--is-shallow-repository'], cwd=RACINE,
                          capture_output=True, text=True).stdout.strip() == 'true':
            subprocess.run(['git', 'fetch', '-q', '--unshallow', 'origin'], cwd=RACINE,
                           capture_output=True)
        sortie = subprocess.run(['git', '-c', 'core.quotepath=off', 'log', '--reverse', '-M',
                                 '--diff-filter=AR', '--name-status', '--format=@%aI'],
                                cwd=RACINE, capture_output=True, text=True).stdout
    except OSError:
        return {}
    dates, date = {}, None
    for ligne in sortie.splitlines():
        if ligne.startswith('@'):
            date = ligne[1:]
            continue
        champs = ligne.split('\t')
        if champs[0] == 'A' and len(champs) == 2:
            dates.setdefault(champs[1], date)
        elif champs[0].startswith('R') and len(champs) == 3:
            dates[champs[2]] = dates.get(champs[1], date)
    return dates


def main():
    elements = list(actualites()) + list(culture_generale()) + list(humanite()) + list(cours())
    try:
        with open(DATES, encoding='utf-8') as f:
            dates = json.load(f)
    except (OSError, ValueError):
        dates = {}

    manquantes = [e['url'] for e in elements if e['url'] not in dates]
    if manquantes:
        git = dates_git()
        maintenant = datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat()
        for url in manquantes:
            dates[url] = git.get(url) or maintenant
        with open(DATES, 'w', encoding='utf-8') as f:
            json.dump(dict(sorted(dates.items())), f, ensure_ascii=False, indent=0)
            f.write('\n')

    for e in elements:
        e['date'] = dates[e['url']]
    # Plus récent d'abord ; à date égale, l'ordre des listes du site (le premier = le plus récent).
    rang = {id(e): i for i, e in enumerate(elements)}
    elements.sort(key=lambda e: (datetime.datetime.fromisoformat(e['date']).timestamp(), -rang[id(e)]),
                  reverse=True)

    gardes, compte = [], {}
    for e in elements:
        compte[e['t']] = compte.get(e['t'], 0) + 1
        if compte[e['t']] <= PAR_TYPE:
            gardes.append(e)

    with open(SORTIE, 'w', encoding='utf-8') as f:
        f.write('/* Généré par outils/nouveautes.py — ne pas modifier à la main. */\n')
        f.write('window.ECG_NOUVEAUTES = ')
        json.dump(gardes, f, ensure_ascii=False, indent=0)
        f.write(';\n')
    print('nouveautes.js : %d contenus (%d nouvelles dates)' % (len(gardes), len(manquantes)))


if __name__ == '__main__':
    main()
