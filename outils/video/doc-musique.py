#!/usr/bin/env python3
"""Musique (et voix off) du documentaire du chapitre 2 d'HGG 2e année (hgg2-chapitre2-doc.html).

Pose les pistes de la feuille de montage (hgg2-chapitre2-doc-plans.md, section « Montage ») sur la vidéo muette,
calées sur les séquences et non sur des minutes fixes : si la voix allonge ou raccourcit une séquence, la musique suit.
Avec la voix (--voix <dossier> de voix.py synthese), la musique est baissée de --baisse dB (18 par défaut) pendant les
phrases et remonte entre elles (attaque 0,25 s, relâche 0,6 s ; un silence de moins de 0,45 s ne la fait pas remonter).

  python3 outils/video/doc-musique.py outils/video/hgg2-chapitre2-doc.html <muet.mp4> <sortie.mp4> \\
      --musiques <dossier des MP3> [--voix <scratchpad>/voix]

Les MP3 (Pixabay, fournis par le propriétaire, jamais versionnés) sont reconnus par un mot de leur nom.
"""
import argparse, json, subprocess, sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
SR = 48000
X = 2.2   # fondu enchaîné entre deux pistes (s)

# piste (mot du nom du fichier), première et dernière séquence, décalage dans la piste (s), gain (dB)
PISTES = [
    ('dark-score', 1, 3, 0, 0),
    ('suspense-music', 4, 6, 0, -2.5),
    ('suspense-626525', 7, 7, 0, -2.5),
    ('tense', 8, 10, 0, -2.5),
    ('dark-score', 11, 12, 40, 0),
    ('inspiring', 13, 18, None, -4.5),   # None : calée par la fin, son dernier temps fort (99 s) sur la coupe finale
]
FIN_EPIQUE = 99.0


def lire(f, debut, duree):
    brut = subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', f'{max(0, debut):.3f}', '-t', f'{duree:.3f}', '-i', str(f),
                           '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(brut, np.float32).reshape(-1, 2).copy()


def duree(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)],
                                capture_output=True, text=True, check=True).stdout)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source'); ap.add_argument('video'); ap.add_argument('sortie')
    ap.add_argument('--musiques', required=True); ap.add_argument('--voix')
    ap.add_argument('--baisse', type=float, default=18)
    a = ap.parse_args()

    from generer import ouvrir
    from playwright.sync_api import sync_playwright
    dos = Path(a.voix) if a.voix else None
    with sync_playwright() as pw:
        nav, page = ouvrir(pw, a.source, str(dos / 'voix.json') if dos else None)
        plans = {p['n']: p for p in page.evaluate('VIDEO.plans')}; total = page.evaluate('VIDEO.duree'); nav.close()
    total = min(total, duree(a.video))
    N = int(total * SR); mus = np.zeros((N, 2), np.float32)
    mp3 = sorted(Path(a.musiques).glob('*.mp3'))

    for k, (mot, s1, s2, dec, gain) in enumerate(PISTES):
        f = next((m for m in mp3 if mot in m.name), None)
        if not f:
            sys.exit(f'piste « {mot} » introuvable dans {a.musiques}')
        debut = plans[s1]['start']
        fin = total if k == len(PISTES) - 1 else plans[PISTES[k + 1][1]]['start'] + X
        long = fin - debut
        if dec is None:
            dec = FIN_EPIQUE - long
        if dec < 0:                       # piste trop courte : elle commence plus tard dans la séquence
            debut -= dec; long += dec; dec = 0
        dec = min(dec, max(0, duree(f) - long))
        y = lire(f, dec, long) * 10 ** (gain / 20)
        n = len(y); env = np.ones(n, np.float32); x = min(int(X * SR), n)
        if k:
            env[:x] = np.linspace(0, 1, x)
        q = x if k < len(PISTES) - 1 else min(int(.8 * SR), n)
        env[-q:] = np.minimum(env[-q:], np.linspace(1, 0, q))
        i = int(debut * SR); j = min(N, i + n)
        mus[i:j] += (y * env[:, None])[:j - i]
        print(f'{f.name[:40]:40} {debut:6.1f} → {fin:6.1f} s, depuis {dec:5.1f} s de la piste, {gain:+.1f} dB')

    voix = np.zeros((N, 2), np.float32)
    if dos:
        for n, p in plans.items():
            w = dos / f'ecran-{n:03d}.wav'
            if not w.exists():
                continue
            y = lire(w, 0, 3600); i = int((p['start'] + p.get('voix', .4)) * SR); j = min(N, i + len(y))
            voix[i:j] += y[:j - i]
        # enveloppe de parole : RMS par fenêtre de 20 ms
        h = SR // 50; m = N // h
        rms = np.sqrt((voix[:m * h].mean(axis=1) ** 2).reshape(m, h).mean(axis=1))
        parle = rms > 10 ** (-40 / 20)
        # combler les silences courts (< 0,45 s) entre deux phrases
        idx = np.flatnonzero(parle)
        for u, v in zip(idx[:-1], idx[1:]):
            if 1 < v - u <= 22:
                parle[u:v] = True
        bas = 10 ** (-a.baisse / 20); g = np.ones(m, np.float32); cur = 1.0
        att, rel = 1 - np.exp(-1 / (.08 * 50)), 1 - np.exp(-1 / (.2 * 50))   # ≈ 0,25 s pour baisser, 0,6 s pour remonter
        # anticiper l'attaque de 0,25 s pour que la musique soit déjà basse au premier mot
        cible = np.where(np.convolve(parle, np.ones(13), 'full')[12:12 + m] > 0, bas, 1.0)
        for t in range(m):
            cur += (cible[t] - cur) * (att if cible[t] < cur else rel); g[t] = cur
        gain = np.interp(np.arange(N), np.arange(m) * h + h / 2, g).astype(np.float32)
        mus *= gain[:, None]
    mix = np.clip(mus + voix, -1, 1)
    tmp = Path(a.sortie).with_suffix('.wav')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ac', '2', '-ar', str(SR), '-i', '-', str(tmp)],
                   input=mix.astype(np.float32).tobytes(), check=True)
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', a.video, '-i', str(tmp), '-map', '0:v', '-map', '1:a',
                    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', a.sortie], check=True)
    tmp.unlink()
    print(f'{a.sortie} : {total / 60:.1f} min, musique{" baissée de %g dB sous la voix" % a.baisse if dos else " seule"}')


if __name__ == '__main__':
    main()
