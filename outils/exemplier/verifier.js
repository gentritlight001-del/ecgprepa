// Vérifie la mise en page d'une double page d'étude de cas (exemplier d'HGG).
// Usage : NODE_PATH=$(npm root -g) node outils/exemplier/verifier.js <fichier.dc.html> <capture.png> [dossier-images]
// Sans dossier d'images, chaque image /_blob/<id> est remplacée par un rectangle gris au format
// des schémas cartographiques (1620 x 840) : la mise en page ne dépend que de ce format.
// Avec un dossier (images téléchargées par Artifact read, nommées <id>.<ext>), les vraies images sont utilisées.
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
const [src, png, imgDir] = process.argv.slice(2);
if (!src || !png) { console.error('usage : verifier.js <fichier.dc.html> <capture.png> [dossier-images]'); process.exit(2); }
let h = fs.readFileSync(src, 'utf8');
const gris = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1620" height="840"><rect width="1620" height="840" fill="#cfc8bb"/></svg>');
h = h.replace(/\/_blob\/([0-9a-f]{32})/g, (m, id) => {
  if (imgDir) { const f = fs.readdirSync(imgDir).find(n => n.startsWith(id)); if (f) return 'file://' + path.resolve(imgDir, f); }
  return gris;
});
h = h.replace('<script src="./support.js"></script>', '').replace(/<script type="text\/x-dc"[\s\S]*?<\/script>/, '');
const tmp = path.join(path.dirname(path.resolve(png)), '_verif.html');
fs.writeFileSync(tmp, h);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 2480, height: 1754}});
  await p.goto('file://' + tmp); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => {
    const out = [];
    const pages = [...document.querySelectorAll('section')].slice(0, 2);
    pages.forEach((s, i) => out.push(`Page ${i + 1} : hauteur ${s.scrollHeight} px (doit rester 1754, sinon ça déborde)`));
    // Colonnes : blanc sous le contenu de chaque colonne d'une grille
    document.querySelectorAll('.ec :not(.cp)[style*="grid-template-columns: minmax(0, 1.15fr)"]').forEach((g, k) => {
      const gb = g.getBoundingClientRect();
      const gaps = [...g.children].map(c => { let m = 0; c.querySelectorAll('*').forEach(e => { const r = e.getBoundingClientRect(); if (r.height > 0) m = Math.max(m, r.bottom); }); return Math.round(gb.bottom - m); });
      out.push(`Grille ${k + 1} : blanc sous chaque colonne ${gaps.join(' / ')} px (négatif = débordement, viser 0 à 30)`);
    });
    const h1 = document.querySelector('h1');
    out.push(`Titre : ${Math.round(h1.getBoundingClientRect().height / 51)} ligne(s) (3 au plus)`);
    const cartes = [...document.querySelectorAll('[style*="padding: 12px 16px; flex: 1"]')].map(c => { const p = c.querySelector('p'); return Math.round(c.getBoundingClientRect().bottom - p.getBoundingClientRect().bottom - 12); });
    if (cartes.length) out.push(`Encadrés de la partie 3 : blanc sous le texte ${cartes.join(' / ')} px (viser moins de 30)`);
    const dash = (document.body.innerText.match(/—/g) || []).length;
    out.push(`Tirets cadratins : ${dash} (doit être 0)`);
    return out;
  });
  console.log(r.join('\n'));
  await p.screenshot({path: png});
  await b.close();
  fs.unlinkSync(tmp);
})();
