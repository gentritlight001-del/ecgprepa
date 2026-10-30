#!/usr/bin/env python3
"""Pose la voix off (fichiers ElevenLabs) sur une vidéo de chapitre déjà rendue.

  python3 outils/video/voix.py <source.html> <video.mp4> <sortie.mp4> --bloc <audio.mp3>:<premier écran> [...]
          [--decalage <s>] [--jusqua <écran>]

Chaque bloc audio contient plusieurs écrans séparés par des pauses <break time="2.5s" /> : le script les
repère (silences de plus de 2,2 s), coupe la voix écran par écran et place chaque morceau 0,6 s après le
début de son écran. --decalage = instant de la vidéo complète où commence <video.mp4> (vidéo découpée en
parties) ; --jusqua = dernier écran à garder (aperçu). Il signale un morceau plus long que son écran : dans
ce cas, allonger l'écran (champ min du plan) et refaire le rendu.
"""
import argparse, json, subprocess, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from generer import ouvrir  # noqa: E402

DEPART, MARGE = .6, .5


def duree(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f],
                                capture_output=True, text=True, check=True).stdout)


def morceaux(f):
    err = subprocess.run(['ffmpeg', '-hide_banner', '-i', f, '-af', 'silencedetect=noise=-40dB:d=2.2', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    debuts = [float(l.split('silence_start: ')[1].split()[0]) for l in err.splitlines() if 'silence_start' in l]
    fins = [float(l.split('silence_end: ')[1].split()[0]) for l in err.splitlines() if 'silence_end' in l]
    bornes, a = [], 0.0
    for d, e in zip(debuts, fins):
        bornes.append((a, d)); a = e
    if a < duree(f) - .3:
        bornes.append((a, duree(f)))
    return bornes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source'); ap.add_argument('video'); ap.add_argument('sortie')
    ap.add_argument('--bloc', action='append', required=True); ap.add_argument('--decalage', type=float, default=0)
    ap.add_argument('--jusqua', type=int)
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        nav, page = ouvrir(pw, a.source)
        plans = page.evaluate('VIDEO.plans'); nav.close()

    entrees, filtres, n, alerte = [], [], 0, False
    for k, b in enumerate(a.bloc):
        fichier, premier = b.rsplit(':', 1); premier = int(premier)
        ms = morceaux(fichier)
        print(f'{Path(fichier).name} : {len(ms)} écrans ({premier} à {premier + len(ms) - 1})')
        entrees += ['-i', fichier]
        for j, (d, f) in enumerate(ms):
            i = premier - 1 + j; p = plans[i]
            if f - d + DEPART + MARGE > p['dur']:
                alerte = True; print(f'  ⚠ écran {i + 1} : voix de {f - d:.1f} s pour un écran de {p["dur"]:.1f} s')
            t = max(0, p['start'] + DEPART - a.decalage)
            filtres.append(f'[{k + 1}:a]atrim={d:.3f}:{f:.3f},asetpts=PTS-STARTPTS,adelay={int(t * 1000)}:all=1[v{n}]'); n += 1
    fin = []
    if a.jusqua:
        p = plans[a.jusqua - 1]; fin = ['-t', f'{p["start"] + p["dur"] + .6 - a.decalage:.2f}']
    filtres.append(''.join(f'[v{i}]' for i in range(n)) + f'amix=inputs={n}:normalize=0:dropout_transition=0,apad[voix]')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', a.video, *entrees, '-filter_complex', ';'.join(filtres),
                    '-map', '0:v', '-map', '[voix]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', *fin,
                    '-movflags', '+faststart', a.sortie], check=True)
    print(f'{a.sortie} écrit' + (' (avec des écrans trop courts, voir plus haut)' if alerte else ''))


if __name__ == '__main__':
    main()
