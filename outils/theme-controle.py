#!/usr/bin/env python3
"""Contrôle d'un thème du jour (flashcards/themes/<langue>/<date>.js), avant sa mise en ligne.

    python3 outils/theme-controle.py flashcards/themes/anglais/2026-11-21.js

Une ligne ✅/❌ par règle, code de sortie 1 s'il reste un ❌ (comme quotidien-controle.py). Vérifie que :
- chaque phrase vaut 4 points (total 20), autant de ((…)) que de cartes et de [[…]] que d'aides ;
- les cartes existent dans le paquet de la langue (flashcards/donnees/<langue>.js) ;
- la proposition, les « autres » et les « tests » (traductions justes mais différentes) ont tous 4 / 4 :
  aucun motif de faute ne touche une traduction juste, aucune bonne tournure ne manque ;
- chaque faute prévue a sa phrase `test`, qui la déclenche bien, et une explication complète ;
- chaque renvoi vers une leçon tombe sur une section qui existe ;
- le thème est dans flashcards/themes/liste.js, avec le même titre ;
- aucun tiret cadratin.
Il faut Node (le moteur de correction est flashcards/theme-correcteur.js, le même que sur le site).
"""
import json
import os
import re
import subprocess
import sys

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""
const path = require('path');
const racine = process.argv[1], fichier = process.argv[2];
global.window = {};
require(path.join(racine, 'flashcards/themes/liste.js'));
require(fichier);
const C = require(path.join(racine, 'flashcards/theme-correcteur.js'));
const cle = Object.keys(window.ECG_THEMES_DONNEES)[0];
const T = window.ECG_THEMES_DONNEES[cle];
const out = { cle, titre: T.titre, langue: T.langue, date: T.date, phrases: [], liste: (window.ECG_THEMES || {})[T.langue] || [] };
try { require(path.join(racine, 'flashcards/donnees/' + T.langue + '.js')); } catch (e) {}
const paquet = (window.ECG_FC_CARTES || {})[T.langue] || [];
const ids = new Set(paquet.map(c => c.i));
T.phrases.forEach((p, i) => {
  const r = { n: i + 1, total: p.morceaux.reduce((a, m) => a + m.pts, 0), erreurs: [], marqueurs: [], cartesInconnues: [], fautes: 0, tests: 0, lecons: [] };
  const nc = (p.fr.match(/\(\(/g) || []).length, na = (p.fr.match(/\[\[/g) || []).length;
  if (nc !== (p.cartes || []).length) r.marqueurs.push(`${nc} mots ((…)) pour ${(p.cartes || []).length} cartes`);
  if (na !== (p.aides || []).length) r.marqueurs.push(`${na} mots [[…]] pour ${(p.aides || []).length} aides`);
  (p.cartes || []).forEach(c => { if (!ids.has(c.id)) r.cartesInconnues.push(c.id + ' (' + c.en + ')'); });
  const justes = [p.proposition, ...(p.autres || []), ...(p.tests || [])];
  r.tests = (p.tests || []).length;
  justes.forEach(t => {
    let res;
    try { res = C.corrigerPhrase(p, t); } catch (e) { r.erreurs.push('motif invalide : ' + e.message); return; }
    if (res.pts !== res.total) {
      const detail = res.morceaux.map((m, k) => m.etat === 'ok' ? null : `morceau ${k + 1} « ${p.morceaux[k].fr} » : ${m.etat}` + (m.fautes.length ? ' (' + m.fautes.map(f => f.faux).join(', ') + ')' : '')).filter(Boolean);
      if (res.ortho.length) detail.push('frappe : ' + res.ortho.map(o => o.faux + ' → ' + o.juste).join(', '));
      r.erreurs.push(`${res.pts} / ${res.total} pour une traduction juste : « ${t} » → ${detail.join(' ; ')}`);
    }
    (p.cartes || []).forEach(c => { if (c.re && t === p.proposition && !res.cartes.includes(c.id)) r.erreurs.push(`la proposition n'emploie pas la carte « ${c.en} » (motif ${c.re})`); });
  });
  p.morceaux.forEach((m, k) => (m.fautes || []).forEach(f => {
    r.fautes++;
    ['type', 'faux', 'juste', 'pourquoi', 'regle', 'ex', 'exfr', 'test'].forEach(ch => { if (!f[ch]) r.erreurs.push(`faute « ${f.faux || '?'} » : champ ${ch} manquant`); });
    if (!(f.pts > 0)) r.erreurs.push(`faute « ${f.faux} » : points manquants`);
    if (f.lecon) r.lecons.push({ n: f.lecon.n, ancre: f.lecon.ancre || '', faux: f.faux });
    if (!f.test) return;
    const res = C.corrigerPhrase(p, f.test);
    if (!res.morceaux[k].fautes.includes(f)) r.erreurs.push(`la phrase test de « ${f.faux} » ne déclenche pas la faute (morceau ${k + 1} : ${res.morceaux[k].etat}) : ${C.normaliser(f.test)}`);
  }));
  out.phrases.push(r);
});
console.log(JSON.stringify(out));
"""


def main():
    if len(sys.argv) != 2:
        print(__doc__)
        sys.exit(2)
    fichier = os.path.abspath(sys.argv[1])
    texte = open(fichier, encoding='utf-8').read()
    try:
        res = subprocess.run(['node', '-e', JS, RACINE, fichier], capture_output=True, text=True, check=True)
    except subprocess.CalledProcessError as e:
        print('❌ Le fichier ne se charge pas :', e.stderr.strip()[:2000])
        sys.exit(1)
    d = json.loads(res.stdout)
    ok = True

    def ligne(bon, texte_ok, texte_ko=None, details=()):
        nonlocal ok
        print(('✅ ' if bon else '❌ ') + (texte_ok if bon else (texte_ko or texte_ok)))
        if not bon:
            ok = False
            for x in details:
                print('   · ' + x)

    ph = d['phrases']
    total = sum(p['total'] for p in ph)
    ligne(len(ph) == 5 and all(p['total'] == 4 for p in ph) and total == 20,
          'Cinq phrases de 4 points (total 20)',
          f'Barème : {len(ph)} phrases, total {total} (attendu : 5 phrases de 4 points)',
          [f"phrase {p['n']} : {p['total']} points" for p in ph if p['total'] != 4])
    ligne(not any(p['marqueurs'] for p in ph), 'Repères ((…)) et [[…]] en accord avec cartes et aides', None,
          [f"phrase {p['n']} : {m}" for p in ph for m in p['marqueurs']])
    ligne(not any(p['cartesInconnues'] for p in ph), 'Cartes présentes dans le paquet de la langue', None,
          [f"phrase {p['n']} : carte inconnue {c}" for p in ph for c in p['cartesInconnues']])
    ligne(all(p['tests'] >= 2 for p in ph), 'Au moins deux traductions de test par phrase', None,
          [f"phrase {p['n']} : {p['tests']} test(s)" for p in ph if p['tests'] < 2])
    ligne(all(p['fautes'] >= 2 for p in ph), 'Au moins deux fautes prévues par phrase', None,
          [f"phrase {p['n']} : {p['fautes']} faute(s)" for p in ph if p['fautes'] < 2])
    errs = [f"phrase {p['n']} : {e}" for p in ph for e in p['erreurs']]
    ligne(not errs, 'Traductions justes à 4 / 4, fautes prévues bien détectées et complètes', None, errs)

    # Renvois vers les leçons
    mauvais = []
    dossier = {'anglais': 'premiere_annee/langues/anglais', 'espagnol': 'premiere_annee/langues/espagnol',
               'allemand': 'premiere_annee/langues/allemand'}.get(d['langue'])
    for p in ph:
        for l in p['lecons']:
            f = os.path.join(RACINE, dossier or '', f"lecon{l['n']}.html")
            if not os.path.exists(f):
                mauvais.append(f"« {l['faux']} » : lecon{l['n']}.html introuvable")
            elif l['ancre'] and f'id="{l["ancre"]}"' not in open(f, encoding='utf-8').read():
                mauvais.append(f"« {l['faux']} » : pas de section #{l['ancre']} dans lecon{l['n']}.html")
    ligne(not mauvais, 'Renvois vers les leçons valides', None, mauvais)

    entree = [e for e in d['liste'] if e.get('date') == d['date']]
    ligne(bool(entree) and entree[0].get('titre') == d['titre'], 'Thème présent dans flashcards/themes/liste.js',
          'Thème absent de flashcards/themes/liste.js, ou titre différent',
          [f"titre attendu : {d['titre']}"])
    if entree:
        ligne(d['liste'][0].get('date') == d['date'] or d['liste'][0].get('date', '') > d['date'],
              'Liste rangée du plus récent au plus ancien', 'Le thème le plus récent doit être en tête de la liste')

    tirets = [i + 1 for i, l in enumerate(texte.split('\n')) if '—' in l]
    ligne(not tirets, 'Aucun tiret cadratin', None, [f'ligne {n}' for n in tirets])
    sys.exit(0 if ok else 1)


if __name__ == '__main__':
    main()
