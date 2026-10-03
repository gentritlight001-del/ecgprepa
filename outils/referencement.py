#!/usr/bin/env python3
"""Référencement : descriptions des pages, balise canonical et plan du site.

    python3 outils/referencement.py

- Ajoute <meta name="description"> et <link rel="canonical"> aux pages de contenu qui n'en ont
  pas (la description est tirée du début de la page ; les descriptions existantes ne sont
  jamais modifiées).
- Écrit statistiques-site.json (chiffres du contenu, lus par la page admin « Statistiques »).
- Régénère sitemap.xml : pages publiques + toutes les pages de contenu, avec la date de la
  dernière modification (date du dernier commit Git de chaque fichier).

Relançable sans risque : à lancer après avoir ajouté une page de contenu.
"""
import datetime, glob, html, json, os, re, subprocess
from html.parser import HTMLParser

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SITE = 'https://ecg-prepa.fr/'

PERIMETRE = ['actualites/**/*.html', 'Culture-Generale/*.html', 'culture-generale.html',
             'humanite.html', 'humanite/**/*.html', 'premiere_annee/**/*.html',
             'deuxieme_annee/**/*.html', 'newsletters.html']
PUBLIQUES = ['accueil.html', 'tarifs.html', 'login.html', 'contact.html', 'cgu.html', 'cgv.html',
             'mentions-legales.html', 'confidentialite.html']
IGNORER = ('hors-ligne.html', '404.html')


class Extracteur(HTMLParser):
    """Récupère les paragraphes du corps de la page (hors menus, scripts et pied de page)."""
    SAUTER = {'script', 'style', 'nav', 'footer', 'head', 'noscript', 'template', 'svg', 'button', 'header'}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.pile, self.blocs, self.cour, self.classe = [], [], None, ''

    def handle_starttag(self, tag, attrs):
        if tag in self.SAUTER:
            self.pile.append(tag)
        if tag == 'p' and not self.pile:
            self.cour = []
            self.classe = dict(attrs).get('class', '') or ''

    def handle_endtag(self, tag):
        if self.pile and self.pile[-1] == tag:
            self.pile.pop()
        if tag == 'p' and self.cour is not None:
            self.blocs.append((self.classe, ' '.join(''.join(self.cour).split())))
            self.cour = None

    def handle_data(self, data):
        if self.cour is not None and not self.pile:
            self.cour.append(data)


def titre_de(contenu):
    m = re.search(r'<title>([^<]*)</title>', contenu)
    t = html.unescape(m.group(1)).strip() if m else ''
    t = re.sub(r'^ECG Prépa\s*[—-]\s*', '', t)
    return re.sub(r'\s*[|—]\s*(ECG Prépa|[\w ]+ ECG|Civilisation \w+)\s*$', '', t).strip()


def couper(texte, n=155):
    texte = ' '.join(texte.split())
    if len(texte) <= n:
        return texte
    c = texte[:n].rsplit(' ', 1)[0].rstrip(' ,;:—-')
    return c + '…'


def description(rel, contenu):
    ex = Extracteur()
    try:
        ex.feed(contenu)
    except Exception:
        pass
    pref = [t for c, t in ex.blocs if re.search(r'intro|lead|deck|subtitle|chapeau', c) and len(t) >= 60]
    autres = [t for c, t in ex.blocs if len(t) >= 80 and '[' not in t[:3]]
    for t in pref + autres:
        t = re.sub(r'\\\(.*?\\\)', '', t)  # formules LaTeX
        if len(t) >= 60:
            if '·' in t and not re.search(r'[.!?]', t):  # simple liste de mots : on ajoute le titre
                t = (titre_de(contenu) + ' : ' + t) if titre_de(contenu) else t
            return couper(t)
    t = titre_de(contenu)
    p = rel.split('/')
    nom = re.sub(r'^Actualité\s*[—-]\s*', '', t) or 'cette rubrique'
    if p[0] == 'actualites':
        return couper('Les articles d\'actualité sur %s : événements, chronologies et analyses pour nourrir la culture générale en prépa ECG.' % nom)
    if rel == 'culture-generale.html':
        return 'Les dossiers de culture générale pour la prépa ECG : fiches thématiques sur les grands sujets de société, d\'économie et de géopolitique.'
    if p[0] == 'humanite' or rel == 'humanite.html':
        return couper('L\'Humanité en prépa ECG : %s. Fiche de cours, plan et pistes pour la dissertation.' % nom)
    if p[0] in ('premiere_annee', 'deuxieme_annee') and 'langues' in p:
        return couper('Cours de civilisation : %s. Chronologie, acteurs clés et analyse pour l\'épreuve de langue en prépa ECG.' % nom)
    if p[0] in ('premiere_annee', 'deuxieme_annee'):
        annee = '1re' if p[0] == 'premiere_annee' else '2e'
        return couper('%s en %s année de prépa ECG : cours, chapitres et fiches de révision.' % (nom, annee))
    return couper((t + '. ' if t else '') + 'Fiches de révision pour la prépa ECG : cours, culture générale et actualité du monde.')


def date_modif(rel):
    r = subprocess.run(['git', '-C', RACINE, 'log', '-1', '--format=%cs', '--', rel], capture_output=True, text=True)
    return r.stdout.strip() or None


def champ_js(bloc, nom):
    m = re.search(nom + r":\s*'((?:[^'\\]|\\.)*)'", bloc)
    if not m:
        return ''
    t = m.group(1).replace("\\'", "'")
    return re.sub(r'\\u([0-9a-fA-F]{4})', lambda x: chr(int(x.group(1), 16)), t)


def statistiques(nb_adresses):
    """Chiffres du contenu du site, pour la page admin « Statistiques »."""
    def compte(motif):
        return len([f for f in glob.glob(RACINE + motif, recursive=True) if not f.endswith('index.html')])
    editions = []
    for code, nom in (('monde', 'Mondiale'), ('en', 'Anglophone'), ('es', 'Hispanophone'), ('de', 'Germanophone')):
        src = open(RACINE + 'actualites/%s/tous-%s.html' % (code, code), encoding='utf-8').read()
        m = re.search(r"id:\s*'([^']+)'(.*?)externalUrl:", src, re.S)
        dernier = None
        if m:
            b = m.group(2)
            mois = re.search(r'month:\s*(\d+),\s*year:\s*(\d+)', src[m.end():m.end() + 400])
            dernier = {'titre': champ_js(b, 'cardTitle'), 'pays': champ_js(b, 'pays'),
                       'mois': int(mois.group(1)) if mois else None, 'annee': int(mois.group(2)) if mois else None}
        editions.append({'code': code, 'nom': nom, 'articles': compte('actualites/%s/articles/*.html' % code), 'dernier': dernier})
    cg_src = open(RACINE + 'culture-generale.html', encoding='utf-8').read()
    fiches = [m for m in re.finditer(r"id:\s*'([^']+)'", cg_src) if m.group(1) != 'identifiant-unique']
    dossiers = [int(n) for f in glob.glob(RACINE + 'Culture-Generale/*.html')
                for n in re.findall(r'Dossier n°\s*(\d+)', open(f, encoding='utf-8').read())[:1]]
    cours = []
    for annee, dossier in (('1re année', 'premiere_annee'), ('2e année', 'deuxieme_annee')):
        for mat in sorted(os.listdir(RACINE + dossier)):
            if os.path.isdir(RACINE + dossier + '/' + mat):
                n = compte('%s/%s/**/*.html' % (dossier, mat))
                if n:
                    cours.append({'annee': annee, 'matiere': mat, 'pages': n})
    sans_image = sum(1 for f in glob.glob(RACINE + 'actualites/*/articles/*.html')
                     if 'og:image' not in open(f, encoding='utf-8').read())
    return {'genere_le': datetime.date.today().isoformat(), 'adresses_plan_du_site': nb_adresses,
            'editions': editions,
            'culture_generale': {'fiches': len(fiches), 'dernier_dossier': max(dossiers) if dossiers else None},
            'humanite': {'cinema': compte('humanite/cinema/*.html'), 'litterature': compte('humanite/litterature/*.html'),
                         'cours': compte('humanite/cours-humanite/**/*.html')},
            'cours': cours, 'images_partage': len(glob.glob(RACINE + 'partage/**/*.jpg', recursive=True)),
            'articles_sans_image_partage': sans_image}


def main():
    pages = sorted({os.path.relpath(f, RACINE) for g in PERIMETRE for f in glob.glob(RACINE + g, recursive=True)})
    pages = [p for p in pages if os.path.basename(p) not in IGNORER]
    ajoutes = 0
    for rel in pages + PUBLIQUES:
        chemin = RACINE + rel
        if not os.path.exists(chemin):
            continue
        c = open(chemin, encoding='utf-8').read()
        if '</head>' not in c:
            continue
        ajout = ''
        if 'name="description"' not in c:
            ajout += '<meta name="description" content="%s">\n' % html.escape(description(rel, c), quote=True)
        if 'rel="canonical"' not in c:
            ajout += '<link rel="canonical" href="%s%s">\n' % (SITE, rel)
        if ajout:
            open(chemin, 'w', encoding='utf-8').write(c.replace('</head>', ajout + '</head>', 1))
            ajoutes += 1
    # Plan du site
    urls = []
    for rel in PUBLIQUES + pages:
        chemin = RACINE + rel
        if not os.path.exists(chemin) or rel in [u[0] for u in urls]:
            continue
        c = open(chemin, encoding='utf-8').read()
        if re.search(r'name="robots"[^>]*noindex', c):
            continue
        urls.append((rel, date_modif(rel)))
    out = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<!-- Généré par outils/referencement.py : ne pas modifier à la main. -->',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for rel, d in urls:
        out.append('  <url><loc>%s%s</loc>%s</url>' % (SITE, rel, '<lastmod>%s</lastmod>' % d if d else ''))
    out.append('</urlset>')
    open(RACINE + 'sitemap.xml', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    open(RACINE + 'statistiques-site.json', 'w', encoding='utf-8').write(json.dumps(statistiques(len(urls)), ensure_ascii=False, indent=1) + '\n')
    print('%d page(s) complétée(s) ; sitemap.xml : %d adresses.' % (ajoutes, len(urls)))


if __name__ == '__main__':
    main()
