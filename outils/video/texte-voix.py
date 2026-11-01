#!/usr/bin/env python3
"""Texte de voix off calé sur la vidéo muette (le propriétaire s'enregistre lui-même par-dessus).

Le texte (<source>-voix-video.txt) a un bloc [N] par écran ; chaque ligne commence par @k, le k-ième élément de
l'écran (dans l'ordre d'apparition) : la phrase se dit quand cet élément apparaît, jusqu'à la ligne suivante.

  python3 outils/video/texte-voix.py <source.html> --contenu 1-20
      montre, pour ces écrans, la durée et chaque élément avec son instant d'apparition (pour écrire le texte).
  python3 outils/video/texte-voix.py <source.html> <texte> [--sortie <doc.txt>]
      simule la lecture (2,6 mots/s, débit posé ; une phrase part quand son élément apparaît, ou à la fin de la
      précédente) : chaque phrase doit commencer au plus 2 s après son élément et l'écran finir avant la transition.
      Écrit le texte à lire, avec l'heure de chaque phrase dans la vidéo muette.
"""
import argparse, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
DEBIT = 2.6     # mots par seconde, au plus (voix posée)
DEPART = .3     # on commence à parler un peu après l'apparition de l'élément
FIN = .4        # marge en fin d'écran (fondu)
RETARD = 2.0    # retard toléré d'une phrase sur l'apparition de son élément


def lire_video(source):
    from generer import ouvrir
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        nav, page = ouvrir(pw, source)
        r = {'plans': page.evaluate('VIDEO.plans'), 'contenu': page.evaluate('VIDEO.contenu()'), 'sp': page.evaluate('SP')}
        nav.close()
    return r


def lire_texte(f):
    ecrans, n = {}, None
    for l in Path(f).read_text().splitlines():
        l = l.strip()
        if not l or l.startswith('#'):
            continue
        m = re.fullmatch(r'\[(\d+)\]', l)
        if m:
            n = int(m[1]); ecrans[n] = []; continue
        m = re.match(r'@(\d+)\s+(.*)', l)
        if not m or n is None:
            sys.exit(f'ligne illisible : {l[:60]}')
        ecrans[n].append((int(m[1]), m[2]))
    return ecrans


mm = lambda s: f'{int(s // 60):02d}:{s % 60:04.1f}'
mots = lambda s: len(re.findall(r"[\w’'-]+", s))
NOMS = {'cover': 'Couverture', 'these': "L'idée du chapitre", 'essentiel': "L'essentiel en 30 secondes", 'sommaire': 'Le plan',
        'partie': 'Carton de partie', 'dates': 'Les 8 dates repères', 'bilan': 'Bilan', 'retenir': 'À retenir', 'fin': 'Fin'}


def titre(v, i):
    k = v['plans'][i]['sp']
    return f"{k} · {v['sp'][k][1]}" if k in v['sp'] else NOMS.get(k, k)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('source'); ap.add_argument('texte', nargs='?')
    ap.add_argument('--contenu'); ap.add_argument('--sortie')
    a = ap.parse_args()
    v = lire_video(a.source)
    P, C = v['plans'], v['contenu']

    if a.contenu:
        d, _, f = a.contenu.partition('-')
        for i in range(int(d) - 1, int(f or d)):
            print(f"\n[{i + 1}] {titre(v, i)} · {P[i]['dur']:.1f} s")
            for k, (t, typ, txt) in enumerate(C[i]):
                print(f'  @{k + 1} {t:5.1f}s {typ[:12]:12} {txt[:240]}')
        return

    T = lire_texte(a.texte)
    err, doc, total = [], [], 0
    manque = sorted(set(range(1, len(P) + 1)) - set(T))
    if manque:
        err.append(f'écrans sans texte : {manque}')
    doc += ['VOIX OFF · texte calé sur la vidéo muette', '',
            "Chaque écran commence à l'heure indiquée. Chaque phrase se dit à partir de son heure, quand",
            "l'élément dont elle parle apparaît à l'écran, et doit être finie avant la phrase suivante.", '']
    for n in sorted(T):
        i = n - 1; p = P[i]; segs = T[n]
        doc += ['', f"[{n}]  {mm(p['start'])}  ·  {titre(v, i)}  ·  {p['dur']:.0f} s", '']
        prec, fin = 0, 0
        for j, (k, txt) in enumerate(segs):
            if k < 1 or k > len(C[i]):
                err.append(f'écran {n} : @{k} n\'existe pas ({len(C[i])} éléments)'); continue
            t0 = C[i][k - 1][0]
            if t0 < prec:
                err.append(f'écran {n} : @{k} avant la phrase précédente')
            debut = max(t0 + DEPART, fin); m = mots(txt); total += m
            if debut > t0 + RETARD:
                err.append(f'écran {n} @{k} : la phrase précédente déborde, celle-ci part {debut - t0:.1f} s après son élément')
            fin = debut + m / DEBIT
            doc += [f"  {mm(p['start'] + debut)}   {txt}"]
            prec = t0
        if fin > p['dur'] - FIN:
            err.append(f'écran {n} : {fin - p["dur"] + FIN:.1f} s de trop (environ {int((fin - p["dur"] + FIN) * DEBIT) + 1} mots)')
        if '—' in ' '.join(x for _, x in segs):
            err.append(f'écran {n} : tiret cadratin')
    for e in err:
        print('❌', e)
    print(f"{'✅' if not err else '❌'} {len(T)} écrans, {total} mots ({total / (P[-1]['start'] + P[-1]['dur']) * 60:.0f} mots par minute en moyenne)")
    if a.sortie:
        Path(a.sortie).write_text('\n'.join(doc) + '\n')
    sys.exit(1 if err else 0)


if __name__ == '__main__':
    main()
