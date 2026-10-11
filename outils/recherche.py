#!/usr/bin/env python3
"""Recherche dans tout le site : index des pages de contenu.

    python3 outils/recherche.py

Écrit `recherche-index.json`, lu par `recherche.js` (fenêtre de recherche ouverte par la loupe
du menu, Ctrl+K ou « / »).

Pour chaque page : titre, rubrique, description et titres des parties (avec l'ancre la plus
proche, pour y mener directement). Le texte n'est pas recopié (il pèserait plus de 10 Mo) :
l'index donne, pour chaque mot, la liste des pages où il apparaît. Arrivé sur la page,
`recherche.js` surligne les mots cherchés et descend jusqu'au premier. Les pages
dont le contenu est construit par un script (cours de civilisation, DS de langues, jours de
langues…) sont lues dans leur bloc `<script id="donnees">`.

Format : {"pages": [[adresse, titre, rubrique, catégorie, description, [[titre de partie,
ancre], …]], …], "mots": "mot1 mot2 …" (sans accents, en minuscules, triés), "p": [pages de
chaque mot : écarts entre numéros de page, moins 1, en base 36, séparés par des points]}.

Relançable sans risque : à lancer avant chaque mise en ligne (ne jamais modifier
`recherche-index.json` à la main).
"""
import glob, html, json, os, re, sys, unicodedata
from html.parser import HTMLParser

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from referencement import PERIMETRE, titre_de  # noqa: E402

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SORTIE = RACINE + 'recherche-index.json'
IGNORER = ('hors-ligne.html', '404.html')
MATIERES = {'hgg': 'HGG', 'esh': 'ESH', 'maths': 'Maths', 'mathematiques': 'Maths',
            'philosophie': 'Philosophie', 'langues': 'Langues', 'anglais': 'Anglais',
            'espagnol': 'Espagnol', 'allemand': 'Allemand'}
EDITIONS = {'monde': 'Actu Monde', 'en': 'Actu Anglais', 'es': 'Actu Espagnol', 'de': 'Actu Allemand'}
VIDES = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param',
         'source', 'track', 'wbr'}
SAUTER = {'script', 'style', 'nav', 'footer', 'head', 'noscript', 'template', 'svg', 'button',
          'select', 'textarea', 'math'}
BLOCS = {'p', 'div', 'li', 'td', 'th', 'tr', 'section', 'article', 'aside', 'br', 'blockquote',
         'dd', 'dt', 'figcaption', 'h5', 'h6', 'span', 'ul', 'ol', 'table', 'header', 'main'}
TITRES = {'h1', 'h2', 'h3', 'h4'}
# Titres faits avec des <div> : « ap-sub » des articles, « section-title » des leçons, etc.
CLASSE_TITRE = re.compile(r'^(ap-sub|[\w-]*(section|part|chapter|chapitre)-title|[\w-]*sous-titre-partie)$')
# Mots trop courants pour être cherchés (français, anglais, espagnol, allemand).
VIDES_DE_SENS = set("""
le la les de des du un une et en au aux qu que qui dans par pour sur avec ce ces cet cette se sa son ses
est sont ne pas plus il elle ils elles on nous vous leur leurs mais ou donc ni car lui y a
the of and to in is are was were for on with as by that this it its at from be an or not has have
el los las y del por con para una su sus lo al es un como mas o
der die das und den dem des ein eine einen ist im mit von zu auf nicht sich er sie es auch
""".split())


def propre(t):
    t = t.replace('İ', 'I').replace('ẞ', 'SS')  # minuscule plus longue que la majuscule
    return ' '.join(t.split())


def sans_accents(t):
    return ''.join(c for c in unicodedata.normalize('NFD', t.lower()) if not unicodedata.combining(c))


def mots(t):
    t = sans_accents(t).replace('œ', 'oe').replace('æ', 'ae').replace('ß', 'ss')
    return {m for m in re.findall(r'[a-z0-9]+', t) if len(m) >= 2 and len(m) <= 30 and m not in VIDES_DE_SENS}


class Lecteur(HTMLParser):
    """Découpe le corps de la page en parties [titre, ancre, texte]."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.pile = []        # (balise, id, rôle) des éléments ouverts
        self.saut = 0         # profondeur dans une balise ignorée
        self.titre = None     # morceaux du titre en cours
        self.parties = [['', '', []]]
        self.donnees = []     # contenu des <script id="donnees">
        self.dans_donnees = False

    def ancre(self):
        for _, i, _ in reversed(self.pile):
            if i:
                return i
        return ''

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'script' and a.get('id') == 'donnees':
            self.dans_donnees = True
        if tag in VIDES:
            if tag == 'br':
                self.ecrire(' ')
            return
        role = ''
        if tag in SAUTER or a.get('aria-hidden') == 'true':
            role = 'saut'
            self.saut += 1
        elif not self.saut and self.titre is None and (
                tag in TITRES or any(CLASSE_TITRE.match(c) for c in (a.get('class') or '').split())):
            role = 'titre'
            self.titre = []
            self.titre_ancre = a.get('id') or self.ancre()
        self.pile.append((tag, a.get('id') or '', role))
        if not self.saut and tag in BLOCS:
            self.ecrire(' ')

    def handle_endtag(self, tag):
        if tag == 'script':
            self.dans_donnees = False
        if tag in VIDES or not any(t == tag for t, _, _ in self.pile):
            return
        while self.pile:
            t, _, role = self.pile.pop()
            if role == 'saut':
                self.saut -= 1
            elif role == 'titre':
                self.fin_titre()
            if t == tag:
                break
        if not self.saut and tag in BLOCS:
            self.ecrire(' ')

    def fin_titre(self):
        texte, self.titre = propre(''.join(self.titre)), None
        if 0 < len(texte) <= 200:
            self.parties.append([texte, self.titre_ancre, []])
        else:
            self.ecrire(' ' + texte + ' ')

    def handle_data(self, data):
        if self.dans_donnees:
            self.donnees.append(data)
        if self.saut:
            return
        self.ecrire(data)

    def ecrire(self, t):
        (self.titre if self.titre is not None else self.parties[-1][2]).append(t)


JETON = re.compile(r'//[^\n]*|/\*.*?\*/|"((?:[^"\\\n]|\\.)*)"|\'((?:[^\'\\\n]|\\.)*)\'|`((?:[^`\\]|\\.)*)`', re.S)


def textes_donnees(js):
    """Phrases contenues dans un bloc de données JS (chaînes d'au moins trois mots)."""
    out = []
    for m in JETON.finditer(js):
        s = m.group(1) or m.group(2) or m.group(3)
        if not s:
            continue
        s = re.sub(r'\\u([0-9a-fA-F]{4})', lambda x: chr(int(x.group(1), 16)), s)
        s = re.sub(r'\\(.)', r'\1', s)
        s = re.sub(r'\[\d+\|([^\]]*)\]', r'\1', s)          # repères de grammaire [n|…]
        s = re.sub(r'\{([^|{}]*)\|[^{}]*\}', r'\1', s)       # aides au vocabulaire {mot|sens}
        s = html.unescape(re.sub(r'<[^>]+>', ' ', s))
        if len(s.split()) >= 3 and re.search(r'[A-Za-zÀ-ÿ]{3}', s):
            out.append(propre(s))
    return ' '.join(out)


def rubrique(rel):
    """(catégorie pour les filtres, libellé affiché)."""
    p = rel.split('/')
    if p[0] == 'actualites':
        return 'actu', EDITIONS.get(p[1], 'Actualités') if len(p) > 2 else 'Actualités'
    if p[0] == 'Culture-Generale' or rel == 'culture-generale.html':
        return 'cg', 'Culture générale'
    if p[0] == 'humanite' or rel == 'humanite.html':
        return 'humanite', 'Humanité'
    if p[0] in ('premiere_annee', 'deuxieme_annee') and len(p) > 2:
        annee = '1re année' if p[0] == 'premiere_annee' else '2e année'
        if p[1] == 'langues':
            langue = MATIERES.get(p[2], 'Langues') if len(p) > 3 else 'Langues'
            return 'langues', '%s · %s' % (langue, annee)
        if p[1] == 'hgg' and len(p) > 3 and p[2] == 'quotidien':
            return 'cours', 'HGG au quotidien'
        return 'cours', '%s · %s' % (MATIERES.get(p[1], p[1].capitalize()), annee)
    return 'autre', 'ECG Prépa'


def lire_page(rel):
    c = open(RACINE + rel, encoding='utf-8').read()
    if re.search(r'name="robots"[^>]*noindex', c):
        return None
    lec = Lecteur()
    try:
        lec.feed(c)
        lec.close()
    except Exception:
        pass
    titre = re.sub(r'^Actualité\s*[—-]\s*', '', titre_de(c)) or rel
    m = re.search(r'<meta name="description" content="([^"]*)"', c)
    desc = html.unescape(m.group(1)) if m else ''
    parties = []
    for t, a, morceaux in lec.parties:
        texte = propre(''.join(morceaux))
        if parties and (not t or t == parties[-1][0]):
            parties[-1][2] += ' ' + texte
        else:
            parties.append([t, a, texte])
    d = textes_donnees(''.join(lec.donnees))
    if d:
        parties[0][2] += ' ' + d
    # Le premier titre reprend souvent le titre de la page : inutile de le répéter.
    for p in parties:
        if p[0] and sans_accents(p[0]) in sans_accents(titre):
            p[0] = ''
    cat, lib = rubrique(rel)
    return {'u': rel, 't': titre, 'c': cat, 'r': lib, 'd': desc,
            'parties': [[t, a, mots(t + ' ' + texte)] for t, a, texte in parties]}


def base36(n):
    chiffres = '0123456789abcdefghijklmnopqrstuvwxyz'
    s = ''
    while True:
        n, r = divmod(n, 36)
        s = chiffres[r] + s
        if not n:
            return s


def main():
    pages = sorted({os.path.relpath(f, RACINE) for g in PERIMETRE for f in glob.glob(RACINE + g, recursive=True)})
    pages = [p for p in pages if os.path.basename(p) not in IGNORER]
    lues = [x for x in (lire_page(p) for p in pages) if x]
    liste, index = [], {}
    for n, pg in enumerate(lues):
        titres = [[t, a] for t, a, _ in pg['parties'] if t]
        liste.append([pg['u'], pg['t'], pg['r'], pg['c'], pg['d'], titres])
        for m in set().union(*(ms for _, _, ms in pg['parties'])) | mots(pg['t']):
            index.setdefault(m, []).append(n)
    vocab = sorted(index)
    postes = []
    for m in vocab:
        prec, ecarts = -1, []
        for n in index[m]:
            ecarts.append(base36(n - prec - 1))
            prec = n
        postes.append('.'.join(ecarts))
    with open(SORTIE, 'w', encoding='utf-8') as f:
        json.dump({'genere': 'outils/recherche.py, ne pas modifier à la main', 'pages': liste,
                   'mots': ' '.join(vocab), 'p': postes},
                  f, ensure_ascii=False, separators=(',', ':'))
    print('recherche-index.json : %d pages, %d mots, %.1f Mo.'
          % (len(liste), len(vocab), os.path.getsize(SORTIE) / 1e6))


if __name__ == '__main__':
    main()
