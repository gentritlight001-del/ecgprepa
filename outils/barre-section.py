#!/usr/bin/env python3
"""Barre du haut commune à chaque grande section (barre-section.css).

Pour chaque page des 4 sections (Cours ECG, Actualité, Culture générale,
L'Humanité), marque la première <nav> de la page :
  - classes « sn sn-<section> » (+ couleur de la matière pour les cours),
  - « sn-logo » sur le logo, « sn-fil » sur le fil d'Ariane,
  - un <div class="nav-right"> s'il manque (auth.js y place la loupe et le compte),
et relie barre-section.css juste avant </head>.

Sans effet sur les pages déjà faites et sur les pages de renvoi : on peut
le relancer sans risque, par exemple après l'ajout d'une page.
Usage : python3 outils/barre-section.py
"""
import glob
import os
import re

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LOGOS = ('nav-logo', 'ix-logo', 'ia-logo', 'logo')
FILS = ('breadcrumb', 'ix-fil', 'ia-fil', 'ariane')
MATIERES = [
    ('mathematiques/', 'maths'), ('maths/', 'maths'), ('esh/', 'esh'),
    ('hgg/', 'hgg'), ('philosophie/', 'philo'),
    ('anglais/', 'anglais'), ('espagnol/', 'espagnol'), ('allemand/', 'allemand'),
]


def section(chemin):
    if chemin == 'cours-ecg.html' or chemin.startswith(('premiere_annee/', 'deuxieme_annee/')):
        classes = ['sn-cours']
        for morceau, matiere in MATIERES:
            if '/' + morceau in '/' + chemin:
                classes.append('sn-' + matiere)
                break
        else:
            if '/langues/' in chemin:
                classes.append('sn-anglais')
        return classes
    if chemin.startswith('actualites/'):
        return ['sn-actu']
    if chemin == 'culture-generale.html' or chemin.startswith('Culture-Generale/'):
        return ['sn-cg']
    if chemin == 'humanite.html' or chemin.startswith('humanite/'):
        return ['sn-hum']
    return None


def ajouter_classe(balise, classes):
    m = re.search(r'\bclass="([^"]*)"', balise)
    if m:
        anciennes = m.group(1).split()
        nouvelles = anciennes + [c for c in classes if c not in anciennes]
        return balise[:m.start()] + 'class="' + ' '.join(nouvelles) + '"' + balise[m.end():]
    return balise[:-1] + ' class="' + ' '.join(classes) + '">'


def marquer_premier(html, noms, classe):
    """Ajoute `classe` à la première balise ouvrante dont une classe est dans `noms`."""
    for m in re.finditer(r'<(\w+)\b[^>]*\bclass="([^"]*)"[^>]*>', html):
        if set(m.group(2).split()) & set(noms):
            return html[:m.start()] + ajouter_classe(m.group(0), [classe]) + html[m.end():], True
    return html, False


def traiter(chemin):
    classes = section(chemin)
    if not classes:
        return False
    fichier = os.path.join(RACINE, chemin)
    with open(fichier, encoding='utf-8') as f:
        s = f.read()
    if 'noindex' in s and 'location.replace' in s:
        return False
    m = re.search(r'<nav\b[^>]*>(.*?)</nav>', s, re.S)
    if not m:
        return False
    ouvrante = re.match(r'<nav\b[^>]*>', m.group(0)).group(0)
    if re.search(r'\bclass="[^"]*\bsn\b', ouvrante):
        return False
    interieur = m.group(1)
    interieur, ok_logo = marquer_premier(interieur, LOGOS, 'sn-logo')
    interieur, ok_fil = marquer_premier(interieur, FILS, 'sn-fil')
    if not (ok_logo and ok_fil):
        print('  ? barre non reconnue :', chemin)
        return False
    if not re.search(r'class="[^"]*\bnav-right\b', interieur):
        interieur = interieur.rstrip() + '\n  <div class="nav-right"></div>\n'
    nav = ajouter_classe(ouvrante, ['sn'] + classes) + interieur + '</nav>'
    s = s[:m.start()] + nav + s[m.end():]
    if 'barre-section.css' not in s:
        prefixe = '../' * chemin.count('/')
        s = s.replace('</head>', '<link rel="stylesheet" href="' + prefixe + 'barre-section.css">\n</head>', 1)
    with open(fichier, 'w', encoding='utf-8') as f:
        f.write(s)
    return True


def main():
    os.chdir(RACINE)
    pages = ['cours-ecg.html', 'culture-generale.html', 'humanite.html']
    for dossier in ('premiere_annee', 'deuxieme_annee', 'actualites', 'Culture-Generale', 'humanite'):
        pages += glob.glob(dossier + '/**/*.html', recursive=True)
    faites = sum(traiter(p) for p in sorted(pages))
    print(f'Barre de section ajoutée à {faites} page(s).')


if __name__ == '__main__':
    main()
