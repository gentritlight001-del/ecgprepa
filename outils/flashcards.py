#!/usr/bin/env python3
"""Flashcards : bibliothèque de paquets prêts à l'emploi de l'espace flashcards (`flashcards/`).

    python3 outils/flashcards.py

Rassemble :
  - les langues au quotidien : vocabulaire (`essentiels` et `theme.mots`) du bloc
    <script id="donnees"> de chaque `premiere_annee/langues/<langue>/quotidien/jour-*.html` ;
    un paquet par langue (identifiant = la langue), une partie par jour ;
  - les chapitres de cours : tableau `const DECK = [...]` (cartes « prêtes à l'emploi » :
    [partie, rubrique, question, réponse]) et `const PARTS = {...}` de toute page de
    `premiere_annee/`, `deuxieme_annee/` et `humanite/`. Un futur chapitre d'ESH, de maths ou de
    philo qui en a entre dans la bibliothèque sans rien changer ici.

Écrit `flashcards/donnees/catalogue.js` (window.ECG_FC_CATALOGUE : liste des paquets, sans les
cartes) et `flashcards/donnees/<id>.js` (window.ECG_FC_CARTES['<id>'] : les cartes d'un paquet,
chargées à la demande). Ne jamais modifier ces fichiers à la main. Relançable sans risque : à
lancer à chaque mise en ligne (nouveau jour de langue, nouveau chapitre).
"""
import glob, hashlib, html, json, os, re

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SORTIE = RACINE + 'flashcards/donnees/'
ENTETE = '/* Généré par outils/flashcards.py : ne pas modifier à la main. */\n'

LANGUES = {'anglais': 'Anglais', 'espagnol': 'Espagnol', 'allemand': 'Allemand'}
MATIERES = {'hgg': 'hgg', 'esh': 'esh', 'maths': 'maths', 'mathematiques': 'maths',
            'philosophie': 'philo', 'philo': 'philo'}
ANNEES = {'premiere_annee': 1, 'deuxieme_annee': 2}

CHAINE = r'"((?:[^"\\]|\\.)*)"'
MOT = re.compile(r'\{\s*en:\s*' + CHAINE + r',\s*fr:\s*' + CHAINE + r'(?:,\s*ex:\s*' + CHAINE + r')?\s*\}')


def cle(texte):
    """Identifiant court et stable d'une carte (la progression y est rattachée)."""
    return hashlib.md5(texte.strip().lower().encode('utf-8')).hexdigest()[:10]


def propre(s):
    """Texte simple : sans balises, entités décodées, espaces resserrés (sauf retours à la ligne)."""
    s = re.sub(r'<br\s*/?>', '\n', s or '')
    s = html.unescape(re.sub(r'</?[a-zA-Z][^<>]*>', '', s))
    return '\n'.join(re.sub(r'[ \t]+', ' ', l).strip() for l in s.split('\n')).strip()


# ─── Langues au quotidien ────────────────────────────────────────────────────────────────────

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


def paquets_langues():
    paquets = []
    for langue, nom in LANGUES.items():
        dossier = RACINE + 'premiere_annee/langues/%s/quotidien/' % langue
        jours = [j for j in (lire_jour(c) for c in glob.glob(dossier + 'jour-*.html')) if j]
        if not jours:
            continue
        jours.sort(key=lambda j: j['date'], reverse=True)
        cartes, vus, parties = [], set(), []
        for j in jours:   # le plus récent d'abord : un mot revenu garde son dernier exemple
            gid = j['date']
            n = 0
            for rub, liste in (('Essentiel', j['essentiels']), (j['theme']['titre'] or 'Thème', j['theme']['mots'])):
                for m in liste:
                    mot = propre(m['en'])
                    if not mot or mot.lower() in vus:
                        continue
                    vus.add(mot.lower())
                    cartes.append({'i': cle(mot), 'r': propre(m['fr']), 'v': mot, 'x': propre(m['ex']),
                                   'g': gid, 's': rub})
                    n += 1
            parties.append({'id': gid, 'nom': 'Jour %d · %s' % (j['numero'], j['titre']), 'n': n,
                            'date': j['date']})
        paquets.append({
            'id': langue, 'matiere': 'langues', 'annee': 1, 'type': 'vocabulaire',
            'titre': '%s au quotidien' % nom, 'court': nom,
            'sous': 'Le vocabulaire de tous les textes du jour',
            'recto': 'Français', 'verso': nom,
            'lien': 'premiere_annee/langues/%s/quotidien/index.html' % langue,
            'revoir': 'ecg-%s-quotidien-a-revoir' % langue,
            'maj': jours[0]['date'], 'parties': parties, 'cartes': cartes,
        })
    return paquets


# ─── Chapitres (tableau DECK des pages de cours) ─────────────────────────────────────────────

class LecteurJS:
    """Lit un littéral JS fait de tableaux, d'objets simples, de chaînes et de nombres
    (apostrophes ou guillemets, commentaires, virgules finales)."""

    def __init__(self, texte, i):
        self.t, self.i = texte, i

    def blanc(self):
        t = self.t
        while self.i < len(t):
            if t[self.i].isspace():
                self.i += 1
            elif t.startswith('//', self.i):
                self.i = t.find('\n', self.i)
            elif t.startswith('/*', self.i):
                self.i = t.find('*/', self.i) + 2
            else:
                break

    def valeur(self):
        self.blanc()
        c = self.t[self.i]
        if c == '[':
            return self.suite(']', lambda: self.valeur())
        if c == '{':
            o = {}

            def paire():
                self.blanc()
                k = self.chaine() if self.t[self.i] in '"\'' else self.mot()
                self.blanc()
                assert self.t[self.i] == ':'
                self.i += 1
                o[k] = self.valeur()
            self.suite('}', paire)
            return o
        if c in '"\'`':
            return self.chaine()
        return self.mot()

    def suite(self, fin, element):
        self.i += 1
        liste = []
        while True:
            self.blanc()
            if self.t[self.i] == fin:
                self.i += 1
                return liste
            r = element()
            if r is not None:
                liste.append(r)
            self.blanc()
            if self.t[self.i] == ',':
                self.i += 1

    def mot(self):
        m = re.compile(r'[\w.$-]+').match(self.t, self.i)
        self.i = m.end()
        return m.group(0)

    def chaine(self):
        q = self.t[self.i]
        self.i += 1
        out = []
        while self.t[self.i] != q:
            c = self.t[self.i]
            if c == '\\':
                n = self.t[self.i + 1]
                if n == 'u':
                    out.append(chr(int(self.t[self.i + 2:self.i + 6], 16)))
                    self.i += 6
                    continue
                out.append({'n': '\n', 't': '\t', 'r': ''}.get(n, n))
                self.i += 2
                continue
            out.append(c)
            self.i += 1
        self.i += 1
        return ''.join(out)


def litteral(texte, nom):
    m = re.search(r'\bconst ' + nom + r'\s*=\s*', texte)
    if not m:
        return None
    try:
        return LecteurJS(texte, m.end()).valeur()
    except (AssertionError, IndexError, AttributeError, ValueError):
        print('⚠ %s illisible' % nom)
        return None


def titre_page(texte):
    m = re.search(r'<title>([^<]*)</title>', texte)
    t = html.unescape(m.group(1)).strip() if m else ''
    return re.sub(r'^ECG Prépa\s*[—-]\s*', '', t).strip()


def paquet_chapitre(chemin):
    texte = open(chemin, encoding='utf-8').read()
    deck = litteral(texte, 'DECK')
    if not deck:
        return None
    parts = litteral(texte, 'PARTS') or {}
    rel = os.path.relpath(chemin, RACINE)
    morceaux = rel.split('/')
    titre = titre_page(texte)
    num = re.search(r'(\d+)', os.path.basename(chemin))
    num = int(num.group(1)) if num else 0
    if morceaux[0] == 'humanite':
        matiere, annee = 'humanite', 0
        court = 'Cours %d' % num
        titre = re.sub(r'^Cours Humanité\s*·\s*', '', titre)
        pid = 'humanite-cours%d' % num
    else:
        annee = ANNEES.get(morceaux[0], 0)
        matiere = MATIERES.get(morceaux[1], morceaux[1])
        court = 'Chapitre %d' % num
        titre = re.sub(r'^[A-Za-zÀ-ÿ]+ Chapitre \d+\s*:\s*', '', titre)
        pid = '%s%d-ch%d' % (matiere, annee, num)
    cartes, vus = [], set()
    for c in deck:
        if not isinstance(c, list) or len(c) < 4:
            continue
        q, a = propre(c[2]), propre(c[3])
        k = cle(q)
        if not q or not a or k in vus:
            continue
        vus.add(k)
        cartes.append({'i': k, 'r': q, 'v': a, 'g': str(c[0]), 's': propre(c[1])})
    ordre = []
    for c in cartes:
        if c['g'] not in ordre:
            ordre.append(c['g'])
    parties = [{'id': g, 'nom': propre(parts.get(g, 'Partie ' + g)), 'n': sum(1 for c in cartes if c['g'] == g)}
               for g in ordre]
    return {
        'id': pid, 'matiere': matiere, 'annee': annee, 'num': num, 'type': 'cours',
        'titre': titre, 'court': court, 'sous': '',
        'recto': 'Question', 'verso': 'Réponse', 'lien': rel,
        'parties': parties, 'cartes': cartes,
    }


def paquets_chapitres():
    chemins = []
    for d in ('premiere_annee', 'deuxieme_annee', 'humanite'):
        chemins += glob.glob(RACINE + d + '/**/*.html', recursive=True)
    paquets = []
    for chemin in sorted(chemins):
        with open(chemin, encoding='utf-8') as f:
            if 'const DECK' not in f.read():
                continue
        p = paquet_chapitre(chemin)
        if p and p['cartes']:
            paquets.append(p)
    paquets.sort(key=lambda p: (p['matiere'], p['annee'], p['num']))
    return paquets


def main():
    os.makedirs(SORTIE, exist_ok=True)
    paquets = paquets_langues() + paquets_chapitres()
    catalogue = []
    gardes = {'catalogue.js'}
    for p in paquets:
        cartes = p.pop('cartes')
        p['n'] = len(cartes)
        p['v'] = cle(json.dumps(cartes, ensure_ascii=False))   # change quand le paquet change
        catalogue.append(p)
        nom = p['id'] + '.js'
        gardes.add(nom)
        with open(SORTIE + nom, 'w', encoding='utf-8') as f:
            f.write(ENTETE)
            f.write('window.ECG_FC_CARTES = window.ECG_FC_CARTES || {};\n')
            f.write('window.ECG_FC_CARTES[%s] = %s;\n' % (json.dumps(p['id']),
                    json.dumps(cartes, ensure_ascii=False, separators=(',', ':'))))
        print('%-22s %4d cartes  %s' % (p['id'], p['n'], p['titre']))
    with open(SORTIE + 'catalogue.js', 'w', encoding='utf-8') as f:
        f.write(ENTETE)
        f.write('window.ECG_FC_CATALOGUE = %s;\n' % json.dumps(catalogue, ensure_ascii=False, indent=1))
    for vieux in glob.glob(SORTIE + '*.js'):
        if os.path.basename(vieux) not in gardes:
            os.remove(vieux)
    print('%d paquets, %d cartes' % (len(catalogue), sum(p['n'] for p in catalogue)))


if __name__ == '__main__':
    main()
