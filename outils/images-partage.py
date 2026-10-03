#!/usr/bin/env python3
"""Images de partage (aperçu des liens sur WhatsApp, Discord, etc.).

Pour chaque page de contenu SANS balise og:image, crée une image 1200 × 630 px
dans partage/ puis ajoute les balises og:title, og:image et twitter:card dans le
<head> de la page. Les pages qui ont déjà une og:image sont ignorées : on peut donc
relancer le script après chaque nouvel article ou nouveau cours.

    python3 outils/images-partage.py            # toutes les pages concernées
    python3 outils/images-partage.py <fichier>  # une ou plusieurs pages précises

Prérequis : playwright (voir newsletter/outils/installer.sh). Le chemin de Chromium
peut être donné avec la variable CHROMIUM_PATH.
"""
import glob, html, os, re, sys, tempfile

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + '/'
SITE = 'https://ecg-prepa.fr/'

# Dossiers (et fichiers) dont les pages ont une image de partage.
PERIMETRE = ['actualites/**/*.html', 'Culture-Generale/*.html', 'culture-generale.html',
             'humanite.html', 'humanite/**/*.html', 'premiere_annee/**/*.html',
             'deuxieme_annee/**/*.html']

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
        sous = {'cinema': 'Cinéma', 'litterature': 'Littérature', 'cours-humanite': 'Cours'}.get(p[1] if len(p) > 2 else '', '')
        lab = "L'Humanité" + (' · ' + sous if sous else '')
        t = re.sub(r'^(Littérature|Cinéma)\s*[—-]\s*', '', t)
        return 'humanite/' + '-'.join(p)[:-5], lab, t or "L'Humanité", '#1c2433', '#e8e6e0', '#7c9ec9', 'accent'
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
    if len(sys.argv) > 1:
        pages = [os.path.relpath(os.path.abspath(a), RACINE) for a in sys.argv[1:]]
    else:
        pages = sorted({os.path.relpath(f, RACINE) for g in PERIMETRE for f in glob.glob(RACINE + g, recursive=True)})
    travail = []
    for rel in pages:
        try:
            contenu = open(RACINE + rel, encoding='utf-8').read()
        except OSError:
            continue
        if 'og:image' in contenu or '</head>' not in contenu:
            continue
        f = fiche(rel, contenu)
        if f:
            travail.append((rel, contenu, f))
    if not travail:
        print('Rien à faire : toutes les pages ont déjà une image de partage.')
        return
    gab = tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8')
    gab.write(GABARIT % {'racine': RACINE}); gab.close()
    with sync_playwright() as pw:
        chemin = os.environ.get('CHROMIUM_PATH') or ('/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None)
        nav = pw.chromium.launch(executable_path=chemin) if chemin else pw.chromium.launch()
        page = nav.new_page(viewport={'width': 1200, 'height': 630})
        page.goto('file://' + gab.name)
        page.evaluate('document.fonts.ready')
        for rel, contenu, (cle, lab, titre, fond, fg, accent, logo) in travail:
            taille = 72 if len(titre) <= 55 else 62 if len(titre) <= 85 else 54 if len(titre) <= 110 else 46
            page.evaluate("""([lab, titre, fond, fg, accent, logo, taille]) => {
              const c = document.getElementById('c'); c.style.background = fond; c.style.color = fg;
              const l = document.getElementById('label'); l.textContent = lab; l.style.color = accent;
              document.getElementById('logo').style.color = logo === 'blanc' ? '#fff' : accent;
              document.getElementById('bar').style.background = accent;
              const t = document.getElementById('title'); t.textContent = titre; t.style.fontSize = taille + 'px';
              document.getElementById('url').style.color = fg; }""",
                          [lab, titre, fond, fg, accent, logo, taille])
            sortie = 'partage/' + cle + '.jpg'
            os.makedirs(os.path.dirname(RACINE + sortie), exist_ok=True)
            page.screenshot(path=RACINE + sortie, type='jpeg', quality=68)
            nouveau = contenu.replace('</head>', balises(titre, SITE + sortie) + '\n</head>', 1)
            open(RACINE + rel, 'w', encoding='utf-8').write(nouveau)
        nav.close()
    os.unlink(gab.name)
    print('%d image(s) de partage créée(s) dans partage/.' % len(travail))


if __name__ == '__main__':
    main()
