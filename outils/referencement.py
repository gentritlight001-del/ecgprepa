#!/usr/bin/env python3
"""Référencement : descriptions des pages, balise canonical et plan du site.

    python3 outils/referencement.py

- Ajoute <meta name="description"> et <link rel="canonical"> aux pages de contenu qui n'en ont
  pas (la description est tirée du début de la page ; les descriptions existantes ne sont
  jamais modifiées).
- Régénère sitemap.xml : pages publiques + toutes les pages de contenu, avec la date de la
  dernière modification (date du dernier commit Git de chaque fichier).

Relançable sans risque : à lancer après avoir ajouté une page de contenu.
"""
import glob, html, os, re, subprocess
from html.parser import HTMLParser

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SITE = 'https://ecg-prepa.fr/'

PERIMETRE = ['actualites/**/*.html', 'Culture-Generale/*.html', 'culture-generale.html',
             'humanite.html', 'humanite/**/*.html', 'premiere_annee/**/*.html',
             'deuxieme_annee/**/*.html', 'newsletters.html']
PUBLIQUES = ['accueil.html', 'nouveautes.html', 'tarifs.html', 'login.html', 'contact.html', 'cgu.html', 'cgv.html',
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
    print('%d page(s) complétée(s) ; sitemap.xml : %d adresses.' % (ajoutes, len(urls)))


if __name__ == '__main__':
    main()
