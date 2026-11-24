// Exporte une double page d'étude de cas (exemplier d'HGG) en PDF d'une page (2480 x 1754 px).
// Usage : NODE_PATH=$(npm root -g) node outils/exemplier/pdf.js <fichier.dc.html> <dossier-images> <sortie.pdf>
// <dossier-images> : les images de l'étude téléchargées avec Artifact read (path = id de l'asset),
// nommées <id>.<ext>. Elles sont converties en JPEG (qualité 85) pour que le PDF reste vers 2 Mo.
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path'), {execFileSync} = require('child_process');
const [src, imgDir, out] = process.argv.slice(2);
if (!src || !imgDir || !out) { console.error('usage : pdf.js <fichier.dc.html> <dossier-images> <sortie.pdf>'); process.exit(2); }
let h = fs.readFileSync(src, 'utf8');
const ids = [...new Set([...h.matchAll(/\/_blob\/([0-9a-f]{32})/g)].map(m => m[1]))];
for (const id of ids) {
  const f = fs.readdirSync(imgDir).find(n => n.startsWith(id) && !n.endsWith('.pdf.jpg'));
  if (!f) { console.error('image manquante : ' + id); process.exit(1); }
  const jpg = path.resolve(imgDir, id + '.pdf.jpg');
  if (!fs.existsSync(jpg)) execFileSync('python3', ['-c', 'import sys;from PIL import Image;Image.open(sys.argv[1]).convert("RGB").save(sys.argv[2],"JPEG",quality=85)', path.resolve(imgDir, f), jpg]);
  h = h.split('/_blob/' + id).join('file://' + jpg);
}
h = h.replace('<script src="./support.js"></script>', '').replace(/<script type="text\/x-dc"[\s\S]*?<\/script>/, '');
h = h.replace('<style>', '<style>@page{size:2480px 1754px;margin:0}html,body{margin:0}');
const tmp = path.join(path.dirname(path.resolve(out)), '_pdf.html');
fs.writeFileSync(tmp, h);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({viewport: {width: 2480, height: 1754}});
  await p.goto('file://' + tmp, {waitUntil: 'networkidle'});
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  await p.pdf({path: out, width: '2480px', height: '1754px', printBackground: true, pageRanges: '1'});
  await b.close(); fs.unlinkSync(tmp);
  console.log('PDF écrit : ' + out);
})();
