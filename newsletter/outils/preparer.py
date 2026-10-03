#!/usr/bin/env python3
"""Prépare le numéro de la semaine à partir des articles du site.

    python3 newsletter/outils/preparer.py monde            # mondiale
    python3 newsletter/outils/preparer.py en|es|de          # éditions de langue (version -fr)
    python3 newsletter/outils/preparer.py cg                # culture générale
    python3 newsletter/outils/preparer.py monde --date 2026-10-04   # semaine de cette date

Choisit les 4 articles les plus récents de l'édition (la une + les 3 brèves du bas : ils sont en tête
de la liste du site), puis écrit un JSON de départ dans newsletter/build/ avec tout ce qui se déduit
du site : images, liens, kickers, titres de départ, semaine et période. Les champs à rédiger valent
« À RÉDIGER » ; la suite est dans CLAUDE.md, section 5 (rédaction, recherches web pour les 3
petites actualités et « Le chiffre », remplir.py, controle.py, generer-pdf.py).
"""
import datetime, json, re, sys
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
ED = {'monde': ('Actualité', 'Édition mondiale', 'actualites/monde/tous-monde.html', 'MONDE'),
      'en': ('Actualité', 'Édition anglophone', 'actualites/en/tous-en.html', 'Anglophone'),
      'es': ('Actualité', 'Édition hispanophone', 'actualites/es/tous-es.html', 'Hispanophone'),
      'de': ('Actualité', 'Édition germanophone', 'actualites/de/tous-de.html', 'Germanophone')}
MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
JOURS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
A_ECRIRE = 'À RÉDIGER'


def champ(bloc, nom):
    m = re.search(nom + r":\s*'((?:[^'\\]|\\.)*)'", bloc)
    if not m:
        return ''
    t = m.group(1).replace("\\'", "'")
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda x: chr(int(x.group(1), 16)), t)


def articles_actu(code):
    page = ED[code][2]
    src = (RACINE / page).read_text(encoding='utf-8')
    out = []
    for m in re.finditer(r"id:\s*'([^']+)'(.*?)externalUrl:\s*'([^']+)'", src, re.S):
        bloc = m.group(2)
        out.append(dict(slug=m.group(1), pays=champ(bloc, 'pays'), titre=champ(bloc, 'cardTitle'),
                        theme=champ(bloc, 'theme'), image='actualites/%s/%s' % (code, champ(bloc, 'image')),
                        url='https://ecg-prepa.fr/actualites/%s/%s' % (code, m.group(3))))
    return out[:4]


def articles_cg():
    src = (RACINE / 'culture-generale.html').read_text(encoding='utf-8')
    out = []
    for m in re.finditer(r"id:\s*'([^']+)'(.*?)externalUrl:\s*'Culture-Generale/([^']+)\.html'", src, re.S):
        bloc = m.group(2)
        if m.group(1) == 'identifiant-unique':  # exemple en commentaire dans la liste
            continue
        page = RACINE / 'Culture-Generale' / (m.group(3) + '.html')
        d = re.search(r'Dossier n°\s*(\d+)', page.read_text(encoding='utf-8')) if page.exists() else None
        out.append(dict(slug=m.group(1), pays=('Dossier n° ' + d.group(1)) if d else 'Culture générale',
                        titre=champ(bloc, 'titre'), theme=champ(bloc, 'theme'),
                        image=champ(bloc, 'image'), url='https://ecg-prepa.fr/Culture-Generale/' + m.group(3)))
    return list(reversed(out))[:4]  # les nouvelles fiches sont à la fin de CG_DATA


def main():
    args = sys.argv[1:]
    if not args or args[0] not in list(ED) + ['cg']:
        sys.exit(__doc__)
    code = args[0]
    jour = datetime.date.fromisoformat(args[args.index('--date') + 1]) if '--date' in args else datetime.date.today()
    lundi = jour - datetime.timedelta(days=jour.weekday())
    dimanche = lundi + datetime.timedelta(days=6)
    semaine = lundi.isocalendar()[1]
    arts = articles_cg() if code == 'cg' else articles_actu(code)
    if len(arts) < 4:
        sys.exit('Moins de 4 articles trouvés : vérifier la liste du site.')
    periode = 'Semaine du %d %s au %d %s %d' % (lundi.day, MOIS[lundi.month - 1] if lundi.month != dimanche.month else '',
                                                 dimanche.day, MOIS[dimanche.month - 1], dimanche.year)
    periode = periode.replace('  ', ' ')
    rub, edition = ('Culture générale', 'Culture générale') if code == 'cg' else (ED[code][0], ED[code][1])
    une, b = arts[0], arts[1:]
    champs = {
        'RUBRIQUE': rub, 'EDITION_DROITE': '%s — Semaine %d' % (edition, semaine),
        'SURTITRE': 'La une de la semaine', 'SOUS_TITRE': '%s — l\'essentiel de la semaine en une page' % edition,
        'NUMERO_ET_DATE': 'N° %s — %s %d %s %d' % (A_ECRIRE, JOURS[dimanche.weekday()].capitalize(), dimanche.day, MOIS[dimanche.month - 1], dimanche.year),
        'PERIODE': periode, 'RUBRIQUES': ' · '.join(dict.fromkeys(a['pays'] for a in arts)),
        'UNE_KICKER': une['pays'], 'UNE_URL': une['url'], 'UNE_TITRE': une['titre'], 'UNE_CHAPEAU': A_ECRIRE,
        'UNE_LEGENDE': A_ECRIRE, 'LIEU': A_ECRIRE, 'LIEN_UNE': 'Lire l\'article complet sur le site',
        'TITRE_BREVES': A_ECRIRE, 'CHIFFRE': A_ECRIRE, 'CHIFFRE_TEXTE': A_ECRIRE, 'LIRE': 'Lire →',
        'PIED_GAUCHE': '%s · N° %s' % (edition, A_ECRIRE), 'SOURCES': 'Sources : ' + A_ECRIRE}
    for i in range(1, 5):
        champs.update({'C%d' % i: A_ECRIRE, 'C%d_LIB' % i: A_ECRIRE, 'C%d_SOUS' % i: A_ECRIRE, 'PARA_%d' % i: A_ECRIRE})
    for i in range(1, 4):
        champs.update({'B%d_DATE' % i: A_ECRIRE, 'B%d_TITRE' % i: A_ECRIRE, 'B%d_TEXTE' % i: A_ECRIRE})
        a = b[i - 1]
        champs.update({'A%d_KICKER' % i: a['pays'], 'A%d_URL' % i: a['url'], 'A%d_TITRE' % i: a['titre'],
                       'A%d_TEXTE' % i: A_ECRIRE, 'A%d_TAG' % i: a['pays']})
    nom = '%s-%s' % ('mondiale' if code == 'monde' else 'culture-generale' if code == 'cg' else code, lundi.isoformat())
    suffixe = '-fr' if code in ('en', 'es', 'de') else ''
    contenu = {'sortie': 'newsletter/build/%s%s.html' % (nom, suffixe), 'langue': 'fr',
               'images': {'UNE': une['image'], '1': b[0]['image'], '2': b[1]['image'], '3': b[2]['image']},
               'champs': champs}
    contenu['mot' if code in ('monde', 'cg') else 'vocabulaire'] = (
        {'MOT': A_ECRIRE, 'ETYMOLOGIE': A_ECRIRE, 'ORIGINE': A_ECRIRE, 'DEFINITION': A_ECRIRE, 'USAGE': A_ECRIRE}
        if code in ('monde', 'cg') else {'titre': 'Le vocabulaire', 'entrees': [[A_ECRIRE, A_ECRIRE]]})
    sortie = RACINE / 'newsletter' / 'build' / (nom + suffixe + '.json')
    sortie.parent.mkdir(parents=True, exist_ok=True)
    sortie.write_text(json.dumps(contenu, ensure_ascii=False, indent=1), encoding='utf-8')
    print('Brouillon écrit : %s' % sortie.relative_to(RACINE))
    print('Une : %s (%s)' % (une['titre'], une['pays']))
    for i, a in enumerate(b, 1):
        print('Brève %d : %s (%s)' % (i, a['titre'], a['pays']))
    print('Il reste à rédiger tous les champs « %s » (voir CLAUDE.md, section 5).' % A_ECRIRE)


if __name__ == '__main__':
    main()
