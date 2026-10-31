#!/usr/bin/env python3
"""PDF du cours focus d'un chapitre (mode focus imprimé, A4).

    python3 outils/cours-focus-pdf.py deuxieme_annee/hgg/chapitre-1-hgg.html \
        deuxieme_annee/hgg/resume-chapitre1.pdf

Sert le dépôt en local, ouvre la page en mode focus (auth.js remplacé par un script
vide), puis l'imprime avec la mise en page @media print de la page (bloc « Impression
du cours focus »). Sans pied de page."""
import functools, http.server, os, sys, threading
from playwright.sync_api import sync_playwright

RACINE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src, dst = sys.argv[1], sys.argv[2]
rel = os.path.relpath(os.path.abspath(src), RACINE)

class Silencieux(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
H = functools.partial(Silencieux, directory=RACINE)
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
threading.Thread(target=srv.serve_forever, daemon=True).start()
url = "http://127.0.0.1:%d/%s" % (srv.server_address[1], rel)

with sync_playwright() as p:
    try:
        nav = p.chromium.launch()
    except Exception:
        nav = p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH", "/opt/pw-browsers/chromium"))
    page = nav.new_page(viewport={"width": 1280, "height": 900})
    page.route("**/auth.js", lambda r: r.fulfill(body="", content_type="text/javascript"))
    page.add_init_script("localStorage.setItem('ecg-cours:focus','1')")
    page.goto(url, wait_until="networkidle")
    page.evaluate("document.fonts.ready")
    if not page.evaluate("document.body.classList.contains('focus') && !!document.querySelector('#cours .fc')"):
        sys.exit("❌ pas de cours focus (.fc) sur cette page")
    page.emulate_media(media="print")
    page.pdf(path=dst, format="A4", print_background=True,
             margin={"top": "8mm", "bottom": "8mm", "left": "8mm", "right": "8mm"})
    nav.close()
srv.shutdown()
from pypdf import PdfReader
print("✅ %s : %d pages" % (dst, len(PdfReader(dst).pages)))
