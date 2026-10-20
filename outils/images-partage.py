#!/usr/bin/env python3
"""Images de partage (aperçu des liens sur WhatsApp, Discord, etc.).

Pour chaque page de contenu SANS balise og:image, crée une image 1200 × 630 px
dans partage/ puis ajoute les balises og:title, og:image et twitter:card dans le
<head> de la page. Les pages qui ont déjà une og:image sont ignorées : on peut donc
relancer le script après chaque nouvel article ou nouveau cours.

    python3 outils/images-partage.py            # toutes les pages concernées
    python3 outils/images-partage.py <fichier>  # une ou plusieurs pages précises
    python3 outils/images-partage.py --refaire <fichier>  # refait l'image d'une page qui en a
                                                          # déjà une (adresse changée : ?v=<date et heure>)

Articles d'actualité au gabarit « a-page » (maquette B) : photo de une en plein cadre,
assombrie à gauche, pastille rouge du pays, titre blanc, filet rouge en bas. Fiches d'œuvres et
fiches auteurs de l'Humanité avec visuel : visuel flou en fond, visuel net à droite, pastille et filet à la couleur
de la fiche. Autres pages : aplat de couleur et titre.

Prérequis : playwright (voir newsletter/outils/installer.sh). Le chemin de Chromium
peut être donné avec la variable CHROMIUM_PATH.
"""
import datetime, glob, html, os, re, sys, tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SITE = 'https://ecg-prepa.fr/'

# Dossiers (et fichiers) dont les pages ont une image de partage.
PERIMETRE = ['actualites/**/*.html', 'Culture-Generale/*.html', 'culture-generale.html',
             'humanite.html', 'humanite/**/*.html', 'premiere_annee/**/*.html',
             'deuxieme_annee/**/*.html', 'flashcards/index.html']

ED = {'monde': 'Actualité mondiale', 'en': 'Actualité anglophone',
      'es': 'Actualité hispanophone', 'de': 'Actualité germanophone'}
MATIERES = {  # nom du dossier -> (libellé, couleur de fond)
    'mathematiques': ('Mathématiques', '#1F5F5B'), 'maths': ('Mathématiques', '#1F5F5B'),
    'hgg': ('HGG', '#3D2B1F'), 'esh': ('ESH', '#3D1F2B'),
    'philosophie': ('Philosophie', '#2D1F3D'), 'langues': ('Langues', '#2A3D5F')}
LANGUES = {'anglais': 'Anglais', 'espagnol': 'Espagnol', 'allemand': 'Allemand'}

GABARIT = """<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link rel="stylesheet" href="file://%(racine)sfonts/fonts.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden}
#c{width:1200px;height:630px;padding:72px 88px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden}
.top{display:flex;justify-content:space-between;align-items:center;gap:32px}
#label{font-family:'DM Mono',monospace;font-size:26px;letter-spacing:.14em;text-transform:uppercase}
#logo{font-family:'Playfair Display',serif;font-weight:700;font-size:34px;white-space:nowrap}
#bar{width:96px;height:8px;margin-bottom:26px}
#title{padding-bottom:14px;font-family:'Playfair Display',serif;font-weight:900;line-height:1.08;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}
#url{font-family:'DM Mono',monospace;font-size:22px;letter-spacing:.16em;text-transform:uppercase;opacity:.8}
</style></head><body>
<div id="c"><div class="top"><div id="label"></div><div id="logo">ECG Prépa</div></div>
<div><div id="bar"></div><div id="title"></div></div>
<div id="url">ecg-prepa.fr</div></div></body></html>"""

# Articles au gabarit « a-page » (maquette B choisie par le propriétaire) : photo de une en
# plein cadre, assombrie à gauche, pastille du pays, titre blanc, filet en bas. Pastille et
# filet prennent la couleur d'accent de l'article (--accent dans son :root), rouge sinon.
GABARIT_PHOTO = """<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link rel="stylesheet" href="file://%(racine)sfonts/fonts.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:#0b0b0c}
#img{position:absolute;inset:0;width:100%%;height:100%%;object-fit:cover;object-position:60%% 30%%}
#voile{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,11,12,.92) 0%%,rgba(11,11,12,.75) 42%%,rgba(11,11,12,0) 75%%)}
#c{position:absolute;inset:0;width:760px;padding:56px 64px;display:flex;flex-direction:column;justify-content:space-between}
#logo{font-family:'Playfair Display',serif;font-weight:700;font-size:32px;color:#fff}
#label{display:inline-block;margin-bottom:20px;padding:8px 14px;background:#b5131f;color:#fff;font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:18px;letter-spacing:.14em;text-transform:uppercase}
#title{font-family:'Fraunces',serif;font-weight:600;line-height:1.08;color:#fff;text-shadow:0 2px 20px rgba(0,0,0,.4);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}
#url{font-family:'IBM Plex Mono',monospace;font-size:18px;letter-spacing:.16em;text-transform:uppercase;color:#d6d6d0}
#filet{position:absolute;left:0;right:0;bottom:0;height:8px;background:#b5131f}
</style></head><body>
<img id="img" alt=""><div id="voile"></div>
<div id="c"><div id="logo">ECG Prépa</div><div><span id="label"></span><div id="title"></div></div>
<div id="url">ecg-prepa.fr · Actualité</div></div><div id="filet"></div></body></html>"""


# Fiches d'œuvres de l'Humanité (cinéma, littérature, art, musique) qui ont un visuel (affiche,
# couverture, œuvre, pochette) : même esprit que la maquette B des articles. Le visuel flou et
# assombri remplit le fond, le visuel net est posé à droite ; à gauche le logo, la pastille de la
# rubrique, le titre blanc en Fraunces et la ligne « auteur · année ». Pastille et filet à la
# couleur de la fiche (--c dans son :root).
GABARIT_VISUEL = """<!doctype html><html lang="fr"><head><meta charset="utf-8">
<link rel="stylesheet" href="file://%(racine)sfonts/fonts.css">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;overflow:hidden;position:relative;background:#0b0b0c}
#fond{position:absolute;inset:-60px;width:calc(100%% + 120px);height:calc(100%% + 120px);object-fit:cover;filter:blur(34px) brightness(.55) saturate(1.1)}
#voile{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,11,12,.9) 0%%,rgba(11,11,12,.7) 50%%,rgba(11,11,12,.25) 100%%)}
#vis{position:absolute;right:72px;top:50%%;transform:translateY(-50%%);object-fit:cover;border-radius:10px;box-shadow:0 24px 60px rgba(0,0,0,.55)}
#c{position:absolute;top:0;bottom:0;left:0;width:700px;padding:56px 64px;display:flex;flex-direction:column;justify-content:space-between}
#logo{font-family:'Playfair Display',serif;font-weight:700;font-size:32px;color:#fff}
#label{display:inline-block;margin-bottom:20px;padding:8px 14px;color:#fff;font-family:'IBM Plex Mono',monospace;font-weight:500;font-size:18px;letter-spacing:.14em;text-transform:uppercase}
#title{font-family:'Fraunces',serif;font-weight:600;line-height:1.08;color:#fff;text-shadow:0 2px 20px rgba(0,0,0,.4);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:4;overflow:hidden}
#meta{margin-top:18px;font-family:'IBM Plex Mono',monospace;font-size:20px;letter-spacing:.06em;color:#e4e4dc}
#url{font-family:'IBM Plex Mono',monospace;font-size:18px;letter-spacing:.16em;text-transform:uppercase;color:#d6d6d0}
#filet{position:absolute;left:0;right:0;bottom:0;height:8px}
#num{display:none;position:absolute;right:56px;top:50%%;transform:translateY(-54%%);font-family:'Fraunces',serif;font-weight:600;font-size:360px;line-height:1;color:transparent;-webkit-text-stroke:3px var(--coul);opacity:.9}
body.sans #fond,body.sans #vis{display:none}
body.sans #num{display:block}
</style></head><body>
<img id="fond" alt=""><div id="voile"></div><div id="num"></div><img id="vis" alt="">
<div id="c"><div id="logo">ECG Prépa</div><div><span id="label"></span><div id="title"></div><div id="meta"></div></div>
<div id="url">ecg-prepa.fr · L'Humanité</div></div><div id="filet"></div></body></html>"""

RUBRIQUES = {'cinema': 'Cinéma', 'litterature': 'Littérature', 'art': 'Art', 'musique': 'Musique'}


def visuel_de(rel, contenu):
    """Fiche d'œuvre de l'Humanité avec visuel : (rubrique, image, couleur, « auteur · année »), sinon None."""
    p = rel.split('/')
    if len(p) != 3 or p[0] != 'humanite' or p[1] not in RUBRIQUES:
        return None
    img = re.search(r'<figure class="ch-hero-visuel[^"]*"[^>]*>\s*<img src="([^"]+)"', contenu)
    if not img:
        return None
    chemin = os.path.normpath(os.path.join(RACINE, os.path.dirname(rel), img.group(1)))
    if not os.path.exists(chemin):
        return None
    c = re.search(r'--c:\s*(#[0-9a-fA-F]{3,8})', contenu)
    meta = re.search(r'<p class="meta">(.*?)</p>', contenu)
    m = html.unescape(re.sub(r'<[^>]+>', '', meta.group(1))).split(' · ')[:2] if meta else []
    return RUBRIQUES[p[1]], chemin, (c.group(1) if c else '#a83a2e'), '\u00a0· '.join(m)


def cours_de(rel, contenu):
    """Cours d'Humanité : (« Cours N », image du héros, couleur, « L'Humanité · 2e année »), sinon None."""
    m = re.search(r'cours-humanite/Cours/cours(\d+)\.html$', rel)
    img = re.search(r'<div class="ch-hero-media"><img src="([^"]+)"', contenu)
    if not m or not img:
        return None
    chemin = os.path.normpath(os.path.join(RACINE, os.path.dirname(rel), img.group(1)))
    c = re.search(r'--accent:\s*(#[0-9a-fA-F]{6})', contenu)
    return 'Cours ' + m.group(1), chemin, (c.group(1) if c else '#a83a2e'), "L'Humanité\u00a0· 2e année"

# Cours ECG (1re et 2e année) : même modèle. Image : celle du héros si elle est sur le site, sinon la
# vignette de l'index de la matière, sinon celle du bloc de données (jour de langue, cours de
# civilisation) ; sans image, un grand numéro du chapitre à la couleur de la matière.
COULEURS = {'mathematiques': '#1f7a73', 'maths': '#1f7a73', 'hgg': '#a5652a', 'esh': '#9b2d4d',
            'philosophie': '#6b4fa0', 'anglais': '#2457a0', 'espagnol': '#b23a26', 'allemand': '#8a6d12',
            'langues': '#2457a0'}


def image_cours(rel, contenu):
    base = os.path.dirname(rel)
    m = re.search(r'class="ch-hero-media"[^>]*>\s*<img src="([^"]+)"', contenu)
    if m and not m.group(1).startswith('http'):
        return m.group(1) if m.group(1).startswith('data:') else os.path.normpath(os.path.join(RACINE, base, m.group(1)))
    autre = re.sub(r'^(premiere|deuxieme)_annee', lambda m: 'deuxieme_annee' if m.group(1) == 'premiere' else 'premiere_annee', base)
    for idx in (os.path.join(base, 'index.html'), os.path.join(os.path.dirname(base), 'index.html'), os.path.join(autre, 'index.html')):
        if os.path.exists(RACINE + idx) and os.path.normpath(RACINE + idx) != os.path.normpath(RACINE + rel):
            lien = os.path.relpath(RACINE + rel, os.path.dirname(RACINE + idx))
            if idx.startswith(autre + '/') and autre != base:
                lien = os.path.basename(rel)
            v = re.search(r'href="%s"><span class="ci-vig"><img src="([^"]+)"' % re.escape(lien), open(RACINE + idx, encoding='utf-8').read())
            if v:
                return os.path.normpath(os.path.join(RACINE, os.path.dirname(idx), v.group(1)))
    m = re.search(r'"image":\s*\{\s*"src":\s*"([^"]+)"', contenu) or re.search(r'\bimage:\s*"([^"]+\.(?:webp|jpg|png))"', contenu)
    if not m and '/quotidien/' in rel:
        m = re.search(r'<img src="(images/[^"]+)"', contenu)
    if m:
        c = os.path.normpath(os.path.join(RACINE, base, m.group(1)))
        if os.path.exists(c):
            return c
    return None


def cours_ecg(rel, contenu, lab):
    """Page de cours de 1re ou 2e année : (pastille, image ou None, couleur, ligne du bas, numéro)."""
    p = rel.split('/')
    if p[0] not in ('premiere_annee', 'deuxieme_annee') or 'http-equiv="refresh"' in contenu:
        return None
    morceaux = lab.split(' · ')
    if len(p) > 3 and p[1] == 'langues' and len(morceaux) > 1:
        morceaux = morceaux[1:]
        if p[-1].startswith('civi-'):
            morceaux.insert(1, 'Civilisation')
        elif '/quotidien/' in rel:
            morceaux.insert(1, 'Au quotidien')
    num = re.search(r'(?:Chapitre|Leçon|Notion|Jour)\s*(\d+)', lab) or re.search(r'(?:chapitre|lecon|notion|colle|ds|civi-[a-z]+)-?(\d+)', p[-1])
    couleur = COULEURS.get(p[2].lower() if len(p) > 3 and p[1] == 'langues' else p[1].lower(), '#2457a0')
    return morceaux[0], image_cours(rel, contenu), couleur, '\u00a0· '.join(morceaux[1:]), (num.group(1).lstrip('0') or '0') if num else ''


def auteur_de(rel, contenu):
    """Fiche auteur de l'Humanité : (« Fiche auteur », portrait, couleur, « naissance – mort »), sinon None."""
    if '/Fiches auteurs/' not in rel or 'class="f-portrait"' not in contenu:
        return None
    img = re.search(r'<figure class="f-portrait">\s*<img src="([^"]+)"', contenu)
    if not img:
        return None
    chemin = os.path.normpath(os.path.join(RACINE, os.path.dirname(rel), img.group(1)))
    c = re.search(r'--accent:\s*(#[0-9a-fA-F]{3,8})', contenu)
    ans = [re.search(r'\b(\d{3,4})\b', html.unescape(x)) for x in
           re.findall(r'<dt>(?:Naissance|Mort)</dt><dd>([^<]*)</dd>', contenu)]
    dates = '\u00a0– '.join(a.group(1) for a in ans if a)
    return 'Fiche auteur', chemin, (c.group(1) if c else '#a83a2e'), dates


def insecables(t):
    """Typographie française : espace insécable avant « : ; ! ? » », après « et n°."""
    t = re.sub(r' ([:;!?»])', '\u00a0\\1', t)
    return re.sub(r'(«|n°) ', '\\1\u00a0', t)

def photo_de(rel, contenu):
    """Article « a-page » : (pays, chemin absolu de la photo de une, couleur d'accent), sinon None."""
    if 'class="a-page"' not in contenu:
        return None
    img = re.search(r'<img class="a-hero-img" src="([^"]+)"', contenu)
    pays = re.search(r'<span class="a-tag t0">([^<]+)</span>', contenu)
    if not img:
        return None
    chemin = os.path.normpath(os.path.join(RACINE, os.path.dirname(rel), img.group(1)))
    accent = re.search(r'--accent:\s*(#[0-9a-fA-F]{3,8})', contenu)
    return (html.unescape(pays.group(1)) if pays else ''), chemin, (accent.group(1) if accent else '#b5131f')


def titre_de(contenu):
    m = re.search(r'<title>([^<]*)</title>', contenu)
    t = html.unescape(m.group(1)).strip() if m else ''
    t = re.sub(r'^ECG Prépa\s*[—-]\s*', '', t)
    t = re.sub(r'\s*[—|]\s*(Civilisation \w+|[\w ]+ ECG|ECG Prépa)\s*$', '', t)
    return t.strip()


def fiche(rel, contenu):
    """Renvoie (clé du fichier image, étiquette, titre, fond, texte, accent, type de logo)."""
    p = rel.split('/')
    t = titre_de(contenu)
    stem = os.path.splitext(p[-1])[0]
    if p[0] == 'actualites':
        code = p[1] if len(p) > 2 else None
        lab = ED.get(code, 'Actualité')
        cle = 'actualites/' + (code + '-' if code else '') + stem
        if not t or t == '—': t = lab
        return cle, lab, t, '#b5131f', '#ffffff', '#ffffff', 'blanc'
    if p[0] == 'Culture-Generale' or rel == 'culture-generale.html':
        d = re.search(r'Dossier n°\s*(\d+)', contenu)
        lab = 'Culture générale' + (' · Dossier n° ' + d.group(1) if d else '')
        return 'culture-generale/' + stem, lab, t or 'Culture générale', '#16161a', '#e8e6e0', '#5bbfa8', 'accent'
    if p[0] == 'humanite' or rel == 'humanite.html':
        sous = {'cinema': 'Cinéma', 'litterature': 'Littérature', 'art': 'Art', 'musique': 'Musique', 'cours-humanite': 'Cours'}.get(p[1] if len(p) > 2 else '', '')
        lab = "L'Humanité" + (' · ' + sous if sous else '')
        t = re.sub(r'^(Littérature|Cinéma|Art|Musique)\s*[—-]\s*', '', t)
        return 'humanite/' + '-'.join(p)[:-5], lab, t or "L'Humanité", '#1c2433', '#e8e6e0', '#7c9ec9', 'accent'
    if p[0] == 'flashcards':
        return 'flashcards', 'Espace de révision', t or 'Flashcards', '#16161a', '#e8e6e0', '#c8a96e', 'accent'
    if p[:3] == ['premiere_annee', 'hgg', 'quotidien'] and len(p) == 4:
        lab = "L'HGG au quotidien"
        t = re.sub(r'\s*·\s*HGG au quotidien$', '', t)
        if stem != 'index':
            d = re.search(r'<body[^>]*data-type="([^"]+)"', contenu)
            lab += ' · ' + (d.group(1) if d else 'Fiche')
        return 'cours/' + '-'.join(p)[:-5], lab, t or "L'HGG au quotidien", '#3D2B1F', '#F5F0E8', '#C9A84C', 'accent'
    if p[0] in ('premiere_annee', 'deuxieme_annee'):
        annee = '1re année' if p[0] == 'premiere_annee' else '2e année'
        mat, fond = MATIERES.get(p[1].lower(), (p[1].capitalize() if len(p) > 2 else 'Cours', '#2A3D5F')) if len(p) > 2 else ('Cours ECG', '#1A1208')
        lab = mat
        if len(p) > 3 and p[1] == 'langues':
            lab += ' · ' + LANGUES.get(p[2].lower(), p[2].capitalize())
        m = re.match(r'^[^:]{0,25}?(Chapitre|Leçon|Notion)\s*(\d+)\s*:\s*(.*)$', t)
        if m and not re.search(r'Chapitre|Leçon|Notion', lab):
            lab += ' · %s %s' % (m.group(1), m.group(2)); t = m.group(3)
        t = re.sub(r'^%s\s*[·—-]\s*' % re.escape(mat), '', t)
        lab += ' · ' + annee
        cle = 'cours/' + '-'.join(p)[:-5]
        return cle, lab, t or mat, fond, '#F5F0E8', '#C9A84C', 'accent'
    return None


def balises(titre, url):
    t = html.escape(titre, quote=True)
    return ('<meta property="og:type" content="article">\n<meta property="og:title" content="%s">\n'
            '<meta property="og:image" content="%s">\n<meta property="og:image:width" content="1200">\n'
            '<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="%s">\n'
            '<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="%s">'
            % (t, url, t, url))


def main():
    from playwright.sync_api import sync_playwright
    args = sys.argv[1:]
    refaire = '--refaire' in args
    args = [a for a in args if a != '--refaire']
    if args:
        pages = [os.path.relpath(os.path.abspath(a), RACINE) for a in args]
    else:
        pages = sorted({os.path.relpath(f, RACINE) for g in PERIMETRE for f in glob.glob(RACINE + g, recursive=True)})
    travail = []
    for rel in pages:
        try:
            contenu = open(RACINE + rel, encoding='utf-8').read()
        except OSError:
            continue
        if ('og:image' in contenu and not refaire) or '</head>' not in contenu:
            continue
        f = fiche(rel, contenu)
        if f:
            travail.append((rel, contenu, f))
    if not travail:
        print('Rien à faire : toutes les pages ont déjà une image de partage.')
        return
    gab = tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8')
    gab.write(GABARIT % {'racine': RACINE}); gab.close()
    gab_photo = tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8')
    gab_photo.write(GABARIT_PHOTO % {'racine': RACINE}); gab_photo.close()
    gab_visuel = tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8')
    gab_visuel.write(GABARIT_VISUEL % {'racine': RACINE}); gab_visuel.close()
    with sync_playwright() as pw:
        chemin = os.environ.get('CHROMIUM_PATH') or ('/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None)
        nav = pw.chromium.launch(executable_path=chemin) if chemin else pw.chromium.launch()
        page = nav.new_page(viewport={'width': 1200, 'height': 630})
        page.goto('file://' + gab.name)
        page.evaluate('document.fonts.ready')
        page_photo = nav.new_page(viewport={'width': 1200, 'height': 630})
        page_photo.goto('file://' + gab_photo.name)
        page_photo.evaluate('document.fonts.ready')
        page_visuel = nav.new_page(viewport={'width': 1200, 'height': 630})
        page_visuel.goto('file://' + gab_visuel.name)
        page_visuel.evaluate('document.fonts.ready')
        for rel, contenu, (cle, lab, titre, fond, fg, accent, logo) in travail:
            sortie = 'partage/' + cle + '.jpg'
            os.makedirs(os.path.dirname(RACINE + sortie), exist_ok=True)
            photo = photo_de(rel, contenu)
            visuel = None if photo else (visuel_de(rel, contenu) or auteur_de(rel, contenu) or cours_de(rel, contenu))
            cours = None if photo or visuel else cours_ecg(rel, contenu, lab)
            if cours:
                pastille, img, couleur, meta, num = cours
                titre = re.sub(r'\s*·\s*Civilisation \w+$', '', titre)
                m = re.match(r'^(Leçon|Chapitre|Notion|Colle)\s*(\d+)\s*[—:–-]\s*(.+)$', titre)
                if m:
                    titre = m.group(3)[:1].upper() + m.group(3)[1:]
                    if m.group(1) not in meta:
                        meta = m.group(1) + ' ' + m.group(2) + (' · ' + meta if meta else '')
                titre = insecables(titre); meta = insecables(meta)
                taille = 64 if len(titre) <= 30 else 56 if len(titre) <= 50 else 48 if len(titre) <= 75 else 42
                page_visuel.evaluate("""([rub, titre, img, taille, couleur, meta, num]) => new Promise(ok => {
                  document.body.classList.toggle('sans', !img); document.body.style.setProperty('--coul', couleur);
                  document.getElementById('url').textContent = 'ecg-prepa.fr · Cours';
                  document.getElementById('num').textContent = num;
                  const l = document.getElementById('label'); l.textContent = rub; l.style.background = couleur;
                  document.getElementById('filet').style.background = couleur;
                  const t = document.getElementById('title'); t.textContent = titre; t.style.fontSize = taille + 'px';
                  document.getElementById('meta').textContent = meta;
                  if (!img) { document.body.style.background = 'radial-gradient(circle at 85% 50%, ' + couleur + '55, #0b0b0c 60%)'; return ok(); }
                  document.body.style.background = '#0b0b0c';
                  let n = 0; const fini = () => { if (++n === 2) ok(); };
                  const v = document.getElementById('vis');
                  v.onload = () => { const W = 420, H = 470, r = Math.min(v.naturalWidth / v.naturalHeight, 1.45);
                    const w = r > W / H ? W : H * r; v.style.width = w + 'px'; v.style.height = w / r + 'px'; fini(); };
                  v.onerror = fini; v.src = img;
                  const f = document.getElementById('fond'); f.onload = f.onerror = fini; f.src = img; })""",
                                     [pastille, titre, (img if not img or img.startswith('data:') else 'file://' + img), taille, couleur, meta, num])
                page_visuel.screenshot(path=RACINE + sortie, type='jpeg', quality=82)
            elif visuel:
                rub, img, couleur, meta = visuel
                if rub.startswith('Cours '):
                    titre = re.sub(r'^Cours Humanité\s*·\s*', '', titre)
                if rub == 'Fiche auteur':
                    h1 = re.search(r'<h1[^>]*>(.*?)</h1>', contenu, re.S)
                    if h1: titre = html.unescape(re.sub(r'<[^>]+>', '', h1.group(1))).strip()
                titre = insecables(titre); meta = insecables(meta)
                taille = 64 if len(titre) <= 30 else 56 if len(titre) <= 50 else 48 if len(titre) <= 75 else 42
                page_visuel.evaluate("""([rub, titre, img, taille, couleur, meta]) => new Promise(ok => {
                  document.body.classList.remove('sans'); document.body.style.background = '#0b0b0c';
                  document.getElementById('url').textContent = "ecg-prepa.fr · L'Humanité";
                  const l = document.getElementById('label'); l.textContent = rub; l.style.background = couleur;
                  document.getElementById('filet').style.background = couleur;
                  const t = document.getElementById('title'); t.textContent = titre; t.style.fontSize = taille + 'px';
                  document.getElementById('meta').textContent = meta;
                  let n = 0; const fini = () => { if (++n === 2) ok(); };
                  const v = document.getElementById('vis');
                  v.onload = () => { const W = 420, H = 470, r = rub.startsWith('Cours ') ? Math.min(v.naturalWidth / v.naturalHeight, 1.3) : v.naturalWidth / v.naturalHeight;
                    const w = r > W / H ? W : H * r; v.style.width = w + 'px'; v.style.height = w / r + 'px'; fini(); };
                  v.onerror = fini; v.src = img;
                  const f = document.getElementById('fond'); f.onload = f.onerror = fini; f.src = img; })""",
                                     [rub, titre, 'file://' + img, taille, couleur, meta])
                page_visuel.screenshot(path=RACINE + sortie, type='jpeg', quality=82)
            elif photo:
                pays, img, accent = photo
                taille = 60 if len(titre) <= 50 else 54 if len(titre) <= 75 else 46 if len(titre) <= 100 else 40
                page_photo.evaluate("""([lab, titre, img, taille, accent]) => new Promise(ok => {
                  const l = document.getElementById('label'); l.textContent = lab; l.style.background = accent;
                  document.getElementById('filet').style.background = accent;
                  const t = document.getElementById('title'); t.textContent = titre; t.style.fontSize = taille + 'px';
                  const i = document.getElementById('img'); i.onload = i.onerror = () => ok(); i.src = img; })""",
                                    [pays or 'Actualité', titre, 'file://' + img, taille, accent])
                page_photo.screenshot(path=RACINE + sortie, type='jpeg', quality=80)
            else:
                taille = 72 if len(titre) <= 55 else 62 if len(titre) <= 85 else 54 if len(titre) <= 110 else 46
                page.evaluate("""([lab, titre, fond, fg, accent, logo, taille]) => {
                  const c = document.getElementById('c'); c.style.background = fond; c.style.color = fg;
                  const l = document.getElementById('label'); l.textContent = lab; l.style.color = accent;
                  document.getElementById('logo').style.color = logo === 'blanc' ? '#fff' : accent;
                  document.getElementById('bar').style.background = accent;
                  const t = document.getElementById('title'); t.textContent = titre; t.style.fontSize = taille + 'px';
                  document.getElementById('url').style.color = fg; }""",
                              [lab, titre, fond, fg, accent, logo, taille])
                page.screenshot(path=RACINE + sortie, type='jpeg', quality=68)
            if 'og:image' in contenu:
                # Image refaite : nouvelle adresse, sinon les réseaux gardent l'ancienne en cache.
                v = datetime.datetime.now().strftime('%Y%m%d%H%M')
                nouveau = re.sub(r'(<meta (?:property="og:image"|name="twitter:image") content=")[^"?]*(?:\?v=\d+)?"',
                                 lambda m: m.group(1) + SITE + sortie + '?v=' + v + '"', contenu)
            else:
                nouveau = contenu.replace('</head>', balises(titre, SITE + sortie) + '\n</head>', 1)
            open(RACINE + rel, 'w', encoding='utf-8').write(nouveau)
        nav.close()
    os.unlink(gab.name)
    os.unlink(gab_photo.name)
    os.unlink(gab_visuel.name)
    print('%d image(s) de partage créée(s) dans partage/.' % len(travail))


if __name__ == '__main__':
    main()
