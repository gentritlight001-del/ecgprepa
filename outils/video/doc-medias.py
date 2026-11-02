#!/usr/bin/env python3
"""Extraits vidéo d'un documentaire (outils/video/<source>-doc.html) : télécharge les films d'archives et
découpe chaque extrait en images JPEG 1920 × 1080 à 25 i/s, lues image par image par le montage.

La liste des extraits est dans la source, bloc <script type="application/json" id="clips"> :
  { "<nom>": { "src": "<adresse https>" ou "@<clé>", "debut": s, "fin": s, "vitesse": 1, "recadre": "w:h:x:y", "zoom": 1 } }
« @<clé> » désigne une vidéo fournie par le propriétaire, donnée en option : --fichier mer=<chemin.mp4>.
vitesse < 1 = ralenti (images intermédiaires fondues). zoom > 1 = recadrage serré au centre (masquer un logo).

  python3 outils/video/doc-medias.py outils/video/hgg2-chapitre2-doc.html --fichier mer=<mer.mp4>

Sortie : outils/video/media/<dossier de la source>/<nom>/0001.jpg… et clips.js (nombre d'images par extrait),
jamais versionnés (outils/video/.gitignore). Les sources téléchargées sont gardées dans media/_sources.
"""
import argparse, json, re, subprocess, sys, urllib.request
from pathlib import Path

ICI = Path(__file__).parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source'); ap.add_argument('--fichier', action='append', default=[])
    ap.add_argument('--refaire', action='store_true', help='refaire les extraits déjà découpés')
    a = ap.parse_args()
    html = Path(a.source).read_text()
    m = re.search(r'<script type="application/json" id="clips">(.*?)</script>', html, re.S)
    if not m:
        sys.exit('Bloc id="clips" introuvable dans la source.')
    clips = json.loads(m.group(1))
    dossier = re.search(r"const MEDIA = '([^']+)'", html).group(1)
    sortie = (Path(a.source).parent / dossier).resolve(); sortie.mkdir(parents=True, exist_ok=True)
    sources = ICI / 'media' / '_sources'; sources.mkdir(parents=True, exist_ok=True)
    fichiers = dict(f.split('=', 1) for f in a.fichier)
    compte = {}
    for nom, c in clips.items():
        src = c['src']
        if src.startswith('@'):
            if src[1:] not in fichiers:
                sys.exit(f'{nom} : donner la vidéo avec --fichier {src[1:]}=<chemin>')
            f = Path(fichiers[src[1:]])
        else:
            f = sources / Path(src.split('?')[0]).name
            if not f.exists():
                print(f'téléchargement de {src}', flush=True)
                req = urllib.request.Request(src, headers={'User-Agent': 'Mozilla/5.0 ECGPrepaDoc'})
                with urllib.request.urlopen(req, timeout=600) as r, open(f, 'wb') as o:
                    while (b := r.read(1 << 20)):
                        o.write(b)
        d = sortie / nom
        if d.exists() and any(d.iterdir()) and not a.refaire:
            compte[nom] = len(list(d.glob('*.jpg'))); continue
        d.mkdir(exist_ok=True)
        for x in d.glob('*.jpg'):
            x.unlink()
        v = c.get('vitesse', 1); z = c.get('zoom', 1)
        filtres = []
        if c.get('recadre'):
            filtres.append(f"crop={c['recadre']}")
        filtres += [f'setpts=PTS/{v}' if v != 1 else None,
                    'scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos', 'crop=1920:1080',
                    f'scale={round(1920 * z)}:{round(1080 * z)},crop=1920:1080' if z != 1 else None,
                    'minterpolate=fps=25:mi_mode=blend' if v != 1 else 'fps=25']
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(c['debut']), '-to', str(c['fin']), '-i', str(f),
                        '-an', '-vf', ','.join(x for x in filtres if x), '-q:v', '3', str(d / '%04d.jpg')], check=True)
        compte[nom] = len(list(d.glob('*.jpg')))
        print(f'{nom} : {compte[nom]} images ({compte[nom] / 25:.1f} s)', flush=True)
    (sortie / 'clips.js').write_text('window.CLIPS_N = ' + json.dumps(compte) + ';\n')
    print(f'{len(compte)} extraits dans {sortie}')


if __name__ == '__main__':
    main()
