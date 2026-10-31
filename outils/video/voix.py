#!/usr/bin/env python3
"""Voix off d'une vidéo de chapitre (MP3 ElevenLabs) : c'est la voix qui fixe le tempo de la vidéo.

1. Préparer la voix (un MP3 par bloc, écrans séparés par des pauses <break time="2.5s" />) :
     python3 outils/video/voix.py prepare --bloc <bloc1.mp3>:1 --bloc <bloc2.mp3>:16 ... --dossier <scratchpad>/voix
   Coupe chaque bloc aux pauses de plus de 2,2 s (un morceau par écran), raccourcit les silences entre les
   phrases, accélère la voix (--vitesse, 1,07 par défaut, sans changer sa hauteur), écrit ecran-NNN.wav et
   voix.json (durée de la voix de chaque écran ; un nouveau bloc complète le fichier). --ignorer 4 jette la voix
   de l'écran 4 du texte (écran supprimé de la vidéo) et décale les suivants. La voix est ensuite transcrite
   (Whisper, `pip install faster-whisper`) : mots.json donne l'instant de chaque mot, pour faire apparaître chaque élément
   quand la voix prononce son mot repère.
2. Rendre la vidéo calée sur la voix : chaque écran dure le temps de sa voix plus 0,8 s, et ses
   éléments apparaissent dans ce temps-là :
     python3 outils/video/generer.py <source.html> <video.mp4> --voix <dossier>/voix.json [--plans 1-15]
3. Poser la voix :
     python3 outils/video/voix.py poser <source.html> <video.mp4> <sortie.mp4> --dossier <dossier> [--plans 1-15]
"""
import argparse, json, os, subprocess, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

DEPART = .4   # la voix démarre 0,4 s après le début de son écran (VOIX_DEPART de moteur.js)


def duree(f):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)],
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


def transcrire(dos, ecrans):
    """Instant de chaque mot de la voix (Whisper, sur le morceau déjà resserré) : mots.json, lu par generer.py."""
    import numpy as np
    from faster_whisper import WhisperModel
    modele = WhisperModel('small', device='cpu', compute_type='int8', download_root=os.environ.get('WHISPER_DIR'))
    js = dos / 'mots.json'; mots = json.loads(js.read_text()) if js.exists() else {}
    for n in ecrans:
        brut = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', str(dos / f'ecran-{n:03d}.wav'), '-f', 'f32le', '-ac', '1',
                               '-ar', '16000', '-'], capture_output=True, check=True).stdout
        segs, _ = modele.transcribe(np.frombuffer(brut, np.float32), language='fr', word_timestamps=True)
        mots[str(n)] = [[w.word.strip(), round(w.start, 2)] for s in segs for w in s.words]
    js.write_text(json.dumps(mots, ensure_ascii=False))


def prepare(a):
    dos = Path(a.dossier); dos.mkdir(parents=True, exist_ok=True)
    js = dos / 'voix.json'; durees = json.loads(js.read_text()) if js.exists() else {}
    filtre = ('silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.6:'
              f'stop_threshold=-45dB:stop_silence=0.4,atempo={a.vitesse}')
    ignorer = {int(x) for x in (a.ignorer or '').split(',') if x}
    nouveaux = []
    for b in a.bloc:
        fichier, premier = b.rsplit(':', 1); premier = int(premier)
        ms = morceaux(fichier); faits = []
        for j, (d, f) in enumerate(ms):
            k = premier + j                                   # numéro de l'écran dans le texte de la voix
            if k in ignorer:
                continue
            n = k - sum(1 for x in ignorer if x < k)          # numéro de l'écran dans la vidéo
            faits.append(n); nouveaux.append(n); sortie = dos / f'ecran-{n:03d}.wav'
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f'{d:.3f}', '-to', f'{f:.3f}', '-i', fichier,
                            '-af', filtre, '-ar', '48000', '-ac', '2', str(sortie)], check=True)
            durees[str(n)] = round(duree(sortie), 3)
        print(f'{Path(fichier).name} : {len(ms)} morceaux, écrans {faits[0]} à {faits[-1]} de la vidéo, '
              f'{sum(durees[str(n)] for n in faits):.0f} s de voix')
    js.write_text(json.dumps(durees, sort_keys=True))
    if not a.sans_mots:
        transcrire(dos, nouveaux)                     # seulement les écrans de ces blocs
        print('mots de la voix repérés (mots.json)')


def poser(a):
    from generer import ouvrir
    from playwright.sync_api import sync_playwright
    dos = Path(a.dossier)
    with sync_playwright() as pw:
        nav, page = ouvrir(pw, a.source, str(dos / 'voix.json'))
        plans = page.evaluate('VIDEO.plans'); nav.close()
    p1, p2 = (int(x) for x in a.plans.split('-')) if a.plans else (1, len(plans))
    decalage = plans[p1 - 1]['start'] if a.plans else a.decalage
    entrees, filtres = [], []
    for n in range(p1, p2 + 1):
        f = dos / f'ecran-{n:03d}.wav'
        if not f.exists():
            continue
        t = plans[n - 1]['start'] + DEPART - decalage
        entrees += ['-i', str(f)]
        filtres.append(f'[{len(filtres) + 1}:a]adelay={int(t * 1000)}:all=1[v{len(filtres)}]')
    filtres.append(''.join(f'[v{i}]' for i in range(len(filtres))) + f'amix=inputs={len(filtres)}:normalize=0:dropout_transition=0,apad[voix]')
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', a.video, *entrees, '-filter_complex', ';'.join(filtres),
                    '-map', '0:v', '-map', '[voix]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest',
                    '-movflags', '+faststart', a.sortie], check=True)
    print(f'{a.sortie} : voix de {len(filtres) - 1} écrans posée')


def main():
    ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest='cmd', required=True)
    p = sp.add_parser('prepare'); p.add_argument('--bloc', action='append', required=True)
    p.add_argument('--ignorer', help='écrans du texte de la voix supprimés de la vidéo, ex. 4');
    p.add_argument('--sans-mots', action='store_true', help='ne pas transcrire la voix');
    p.add_argument('--dossier', required=True); p.add_argument('--vitesse', type=float, default=1.07)
    q = sp.add_parser('poser'); q.add_argument('source'); q.add_argument('video'); q.add_argument('sortie')
    q.add_argument('--dossier', required=True); q.add_argument('--plans'); q.add_argument('--decalage', type=float, default=0)
    a = ap.parse_args()
    prepare(a) if a.cmd == 'prepare' else poser(a)


if __name__ == '__main__':
    main()
