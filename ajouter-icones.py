#!/usr/bin/env python3
"""
Ajoute les déclarations d'icônes dans le <head> de toutes les pages du site.

À lancer depuis le dossier racine du site (celui qui contient index.html) :

    python3 ajouter-icones.py

Le script ne touche pas aux pages déjà équipées, et n'écrit rien tant que
tu ne confirmes pas.
"""
import os
import sys

BLOC = """<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0d0d0f">
<meta name="apple-mobile-web-app-title" content="ECG">
"""

racine = os.getcwd()
if not os.path.exists(os.path.join(racine, "index.html")):
    sys.exit("À lancer depuis le dossier qui contient index.html.")

candidats = []
for dossier, _, fichiers in os.walk(racine):
    for nom in fichiers:
        if not nom.endswith(".html"):
            continue
        chemin = os.path.join(dossier, nom)
        with open(chemin, encoding="utf-8", errors="ignore") as fh:
            texte = fh.read()
        if 'rel="icon"' in texte or "</head>" not in texte:
            continue
        candidats.append(chemin)

print("%d page(s) à modifier." % len(candidats))
if not candidats:
    sys.exit(0)
if input("Continuer ? [o/N] ").strip().lower() not in ("o", "oui", "y"):
    sys.exit("Annulé.")

for chemin in candidats:
    with open(chemin, encoding="utf-8", errors="ignore") as fh:
        texte = fh.read()
    texte = texte.replace("</head>", BLOC + "</head>", 1)
    with open(chemin, "w", encoding="utf-8") as fh:
        fh.write(texte)

print("Terminé : %d page(s) mises à jour." % len(candidats))
