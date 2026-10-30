#!/usr/bin/env python3
"""Rend une vidéo de chapitre (outils/video/<source>.html) en MP4 1920 × 1080.

  python3 outils/video/generer.py <source.html> --controle
      vérifie la mise en page (blocs qui débordent, titres trop longs) et donne la durée.
  python3 outils/video/generer.py <source.html> --images <dossier> [--temps 12.5,40,...]
      écrit des images fixes (par défaut : la fin de chaque plan) pour relecture.
  python3 outils/video/generer.py <source.html> <sortie.mp4> [--fps 25] [--workers 4] [--voix voix.json] [--plans 1-15]
      rend toutes les images (en parallèle, par tranches) et les monte avec ffmpeg ; avec --voix, chaque écran
      dure le temps de sa voix (voix.py) ; --plans ne rend qu'une suite d'écrans.

La page expose window.VIDEO (moteur.js) : render(t) dessine l'image à l'instant t, sans horloge.
"""
import argparse, os, subprocess, sys, tempfile, time
from multiprocessing import Process
from pathlib import Path

CHROMIUM = os.environ.get('CHROMIUM_PATH', '/opt/pw-browsers/chromium')


def ouvrir(pw, source, voix=None):
    try:
        nav = pw.chromium.launch()
    except Exception:
        exe = next(Path(CHROMIUM).glob('chromium-*/chrome-linux/chrome'), None) if Path(CHROMIUM).is_dir() else Path(CHROMIUM)
        nav = pw.chromium.launch(executable_path=str(exe))
    page = nav.new_page(viewport={'width': 1920, 'height': 1080})
    erreurs = []
    page.on('pageerror', lambda e: erreurs.append(str(e)))
    if voix:  # durées de la voix off par écran (voix.py prepare) : la voix fixe le tempo
        page.add_init_script(f'window.VOIX = {Path(voix).read_text()};')
    page.goto(Path(source).resolve().as_uri())
    page.wait_for_function('window.VIDEO && document.fonts.status === "loaded"', timeout=60000)
    # Les polices ne se chargent qu'à leur premier usage : on les demande toutes avant de mesurer ou de rendre.
    page.evaluate('''Promise.all(['900 50px "Big Shoulders Display"', '800 50px "Big Shoulders Display"', '700 20px "IBM Plex Sans Condensed"',
      '600 20px "IBM Plex Sans Condensed"', '400 20px "Libre Franklin"', '600 20px "Libre Franklin"', '400 20px Newsreader', '500 20px Newsreader',
      '600 20px Newsreader', 'italic 400 20px Newsreader', '400 20px "IBM Plex Mono"', '500 20px "IBM Plex Mono"', '700 20px "Playfair Display"']
      .map(f => document.fonts.load(f, 'AÉé')))''')
    page.evaluate('''Promise.all([...document.images].map(i => i.decode().catch(() => null)))''')
    manquantes = page.evaluate('[...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute("src"))')
    if erreurs:
        sys.exit('Erreur JS : ' + erreurs[0])
    if manquantes:
        sys.exit('Images introuvables : ' + ', '.join(manquantes))
    return nav, page


def tranche(source, debut, fin, fps, sortie, voix=None, t0=0.0):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        nav, page = ouvrir(pw, source, voix)
        ff = subprocess.Popen(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', str(fps), '-c:v', 'mjpeg', '-i', '-',
                               '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', str(fps), sortie], stdin=subprocess.PIPE)
        for i in range(debut, fin):
            page.evaluate(f'VIDEO.render({t0 + i / fps})')
            ff.stdin.write(page.screenshot(type='jpeg', quality=94))
            if (i - debut) % 600 == 0:
                print(f'  tranche {debut}-{fin} : {i - debut}/{fin - debut}', flush=True)
        ff.stdin.close(); ff.wait(); nav.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source'); ap.add_argument('sortie', nargs='?')
    ap.add_argument('--controle', action='store_true'); ap.add_argument('--images'); ap.add_argument('--temps')
    ap.add_argument('--fps', type=int, default=25); ap.add_argument('--workers', type=int, default=4)
    ap.add_argument('--voix', help='durées de la voix (voix.py prepare)'); ap.add_argument('--plans', help='écrans à rendre, ex. 1-15')
    a = ap.parse_args()
    from playwright.sync_api import sync_playwright

    if a.controle or a.images:
        with sync_playwright() as pw:
            nav, page = ouvrir(pw, a.source, a.voix)
            duree = page.evaluate('VIDEO.duree'); plans = page.evaluate('VIDEO.plans')
            if a.controle:
                err = page.evaluate('VIDEO.controle()')
                for e in err: print('❌', e)
                print(f'{"✅" if not err else "❌"} {len(plans)} plans, durée {int(duree // 60)} min {duree % 60:04.1f} s')
            if a.images:
                Path(a.images).mkdir(parents=True, exist_ok=True)
                temps = [float(x) for x in a.temps.split(',')] if a.temps else [p['start'] + p['dur'] - .05 for p in plans]
                for i, t in enumerate(temps):
                    page.evaluate(f'VIDEO.render({t})')
                    page.screenshot(path=f'{a.images}/{i + 1:03d}.jpg', type='jpeg', quality=85)
                print(f'{len(temps)} images dans {a.images}')
            nav.close()
            sys.exit(1 if a.controle and err else 0)

    if not a.sortie:
        sys.exit('Indiquer le fichier MP4 de sortie.')
    with sync_playwright() as pw:
        nav, page = ouvrir(pw, a.source, a.voix)
        duree = page.evaluate('VIDEO.duree'); plans = page.evaluate('VIDEO.plans'); nav.close()
    t0 = 0.0
    if a.plans:
        p1, p2 = (int(x) for x in a.plans.split('-'))
        t0 = plans[p1 - 1]['start']; duree = plans[p2 - 1]['start'] + plans[p2 - 1]['dur'] + (.5 if p2 == len(plans) else 0) - t0
    n = int(duree * a.fps)
    print(f'{n} images ({duree:.1f} s) en {a.workers} tranches')
    tmp = Path(tempfile.mkdtemp(prefix='video-'))
    bornes = [round(n * k / a.workers) for k in range(a.workers + 1)]
    debut = time.time()
    procs = [Process(target=tranche, args=(a.source, bornes[k], bornes[k + 1], a.fps, str(tmp / f'{k}.mp4'), a.voix, t0)) for k in range(a.workers)]
    for p in procs: p.start()
    for p in procs: p.join()
    if any(p.exitcode for p in procs):
        sys.exit('Une tranche a échoué.')
    (tmp / 'liste.txt').write_text(''.join(f"file '{tmp / f'{k}.mp4'}'\n" for k in range(a.workers)))
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', str(tmp / 'liste.txt'), '-c', 'copy', '-movflags', '+faststart', a.sortie], check=True)
    print(f'{a.sortie} : {duree / 60:.1f} min, rendu en {(time.time() - debut) / 60:.1f} min')


if __name__ == '__main__':
    main()
