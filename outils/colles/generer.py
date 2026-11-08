"""PDF des colles de maths (questions de cours, exercices traités).

Usage : python3 outils/colles/generer.py <N>
Lit outils/colles/colle<N>/ (config.json, questions.html, exercices.html) et écrit
deuxieme_annee/maths/colles/pdf/colle<N>-questions-de-cours.pdf et colle<N>-exercices-traites.pdf.
config.json : {"num": N, "theme": "…", "couleurs": {"c", "cd", "cm", "cl", "cn", "ct"}}.
Dans les .html : {{NUM}}, {{THEME}}, formules entre \\( \\) et \\[ \\] (KaTeX),
\\MatEtiq{e'_1}{e'_n}{e_1}{e_n} pour une matrice de passage disposée comme dans le cours.
KaTeX est téléchargé une fois (npm pack) dans outils/colles/.katex/ (ignoré par git).
"""
import json, os, re, subprocess, sys, pathlib, tarfile, io
from playwright.sync_api import sync_playwright
import pypdf

ICI = pathlib.Path(__file__).resolve().parent
RACINE = ICI.parent.parent
SORTIE = RACINE / 'deuxieme_annee/maths/colles/pdf'
KATEX = ICI / '.katex'

def katex():
    if not (KATEX / 'katex.min.js').exists():
        KATEX.mkdir(exist_ok=True)
        tgz = subprocess.run(['npm', 'pack', 'katex@0.16.9', '-q', '--pack-destination', str(KATEX)],
                             capture_output=True, text=True, check=True).stdout.strip().split('\n')[-1]
        with tarfile.open(KATEX / tgz) as t:
            for m in t.getmembers():
                if m.name.startswith('package/dist/'):
                    m.name = m.name[len('package/dist/'):]
                    t.extract(m, KATEX)
        (KATEX / tgz).unlink()
    return KATEX.as_uri()

MACROS = {r"\Sp": r"\operatorname{Sp}", r"\Ker": r"\operatorname{Ker}", r"\rg": r"\operatorname{rg}",
  r"\tr": r"\operatorname{tr}", r"\Mat": r"\operatorname{Mat}", r"\Id": r"\operatorname{Id}",
  r"\Vect": r"\operatorname{Vect}", r"\Card": r"\operatorname{Card}", r"\BB": r"\mathscr{B}",
  r"\MM": r"\mathscr{M}", r"\LL": r"\mathscr{L}", r"\sh": r"\operatorname{sh}", r"\ch": r"\operatorname{ch}",
  r"\argsh": r"\operatorname{argsh}",
  r"\MatEtiq": r"\begin{array}{c} \begin{array}{ccc} \quad #1 & \cdots & #2 \quad \end{array} \\[-2pt] \left(\begin{array}{ccc} \phantom{#1} & \phantom{\cdots} & \phantom{#2} \\ && \\ && \end{array}\right) \end{array} \!\!\begin{array}{l} \\ #3 \\ \vdots \\ #4 \end{array}"}

def typo(t):
    """Espaces insécables avant : ; ! ? et dans les guillemets, apostrophe typographique (hors maths)."""
    parts = re.split(r'(\\\(.*?\\\)|\\\[.*?\\\]|<pre>.*?</pre>|<svg.*?</svg>|<[^>]+>)', t, flags=re.S)
    for i in range(0, len(parts), 2):
        parts[i] = re.sub(r' ([:;!?])', ' \\1', parts[i])
        parts[i] = parts[i].replace('« ', '« ').replace(' »', ' »').replace("'", '’')
    return ''.join(parts)

def main(n):
    D = ICI / f'colle{n}'
    cfg = json.loads((D / 'config.json').read_text())
    k = katex()
    css = ':root{' + ''.join(f'--{a}:{b};' for a, b in cfg['couleurs'].items()) + '}' + (ICI / 'style.css').read_text()
    with sync_playwright() as p:
        chemin = os.environ.get('CHROMIUM_PATH') or next(
            (c for c in ['/opt/pw-browsers/chromium'] if pathlib.Path(c).exists()), None)
        b = p.chromium.launch(**({'executable_path': chemin} if chemin else {}))
        for nom, titre, pdf in [('questions', 'Questions de cours', f'colle{n}-questions-de-cours.pdf'),
                                ('exercices', 'Exercices traités', f'colle{n}-exercices-traites.pdf')]:
            src = D / f'{nom}.html'
            if not src.exists():
                continue
            corps = typo(src.read_text().replace('{{NUM}}', str(cfg['num'])).replace('{{THEME}}', cfg['theme']))
            if '—' in re.sub(r'<[^>]+>', '', corps):
                print(f'⚠ tiret cadratin dans {src.name}')
            html = f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>{titre}</title>
<link rel="stylesheet" href="{k}/katex.min.css"><style>{css}</style>
<script src="{k}/katex.min.js"></script><script src="{k}/contrib/auto-render.min.js"></script></head>
<body>{corps}<script>renderMathInElement(document.body,{{delimiters:[{{left:'\\\\[',right:'\\\\]',display:true}},{{left:'\\\\(',right:'\\\\)',display:false}}],macros:{json.dumps(MACROS)},throwOnError:false,ignoredTags:['script','noscript','style','textarea','pre','code']}});</script></body></html>'''
            tmp = D / f'.{nom}.rendu.html'
            tmp.write_text(html)
            pg = b.new_page(); pg.goto(tmp.as_uri()); pg.wait_for_timeout(600)
            err = pg.eval_on_selector_all('.katex-error', 'e=>e.map(x=>x.title||x.textContent)')
            if err:
                print(nom, 'ERREURS KATEX', err)
            pg.pdf(path=str(SORTIE / pdf), format='A4', print_background=True, display_header_footer=True,
                   header_template='<div></div>',
                   footer_template='<div style="width:100%;text-align:center;font-size:7px;color:#999;font-family:Arial"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
                   margin={'top': '16mm', 'bottom': '16mm', 'left': '15mm', 'right': '15mm'})
            tmp.unlink()
            print(pdf, len(pypdf.PdfReader(str(SORTIE / pdf)).pages), 'pages')
        b.close()

if __name__ == '__main__':
    main(int(sys.argv[1]))
