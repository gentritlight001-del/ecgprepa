// Vérifie un schéma cartographique (planche 1720 x 1048 de la toile « Schémas cartographiques du Proche et Moyen-Orient »)
// et en fait la capture PNG, au format attendu par l'exemplier (étape 6 : recadrage (52, 160, 1672, 1000)).
// Usage : NODE_PATH=$(npm root -g) node outils/schema-carto/verifier.js <schema.dc.html> <capture.png>
// Écrit aussi <capture>-x2.png (même image en double résolution, à envoyer au propriétaire).
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
const [src, png] = process.argv.slice(2);
if (!src || !png) { console.error('usage : verifier.js <schema.dc.html> <capture.png>'); process.exit(2); }
let h = fs.readFileSync(src, 'utf8');
h = h.replace('<script src="./support.js"></script>', '').replace(/<script type="text\/x-dc"[\s\S]*?<\/script>/, '')
     .replace(/<\/?x-dc>/g, '').replace(/<\/?helmet>/g, '');
const tmp = path.join(path.dirname(path.resolve(png)), '_schema-verif.html');
fs.writeFileSync(tmp, h);
(async () => {
  const b = await chromium.launch();
  let ko = 0;
  const ligne = (ok, txt) => { if (!ok) ko++; console.log((ok ? '✅ ' : '❌ ') + txt); };
  for (const scale of [1, 2]) {
    const p = await b.newPage({viewport: {width: 1720, height: 1048}, deviceScaleFactor: scale});
    await p.goto('file://' + tmp); await p.waitForTimeout(1500);
    if (scale === 2) { await p.screenshot({path: png.replace(/\.png$/, '-x2.png')}); await p.close(); break; }
    await p.screenshot({path: png});
    const r = await p.evaluate(() => {
      const root = document.querySelector('div[style*="width: 1720px"]');
      const carte = [...root.children].find(d => d.style.width === '1000px' && d.style.height === '808px');
      const leg = [...root.children].find(d => d.style.left === '1112px');
      const h1 = document.querySelector('h1');
      const out = {};
      out.racine = [root.offsetWidth, root.offsetHeight];
      out.carte = carte ? [carte.offsetLeft, carte.offsetTop, carte.offsetWidth, carte.offsetHeight] : null;
      out.titre = Math.round(h1.getBoundingClientRect().height / 44);
      if (leg) { let m = 0, t = 1e9; [...leg.children].forEach(c => { const r = c.getBoundingClientRect(); m = Math.max(m, r.bottom); t = Math.min(t, r.top); }); out.legende = [Math.round(t), Math.round(m)]; }
      // Lignes de légende : un seul figuré par ligne, texte sur 3 lignes au plus
      out.lignes = leg ? [...leg.querySelectorAll(':scope > div')].filter(d => d.querySelector('span')).map(d => {
        const s = d.querySelector('span'); const sym = d.firstElementChild;
        return [s.textContent.slice(0, 40), Math.round(s.getBoundingClientRect().height / 19), sym.children.length];
      }) : [];
      // Étiquettes blanches de la carte
      const etiq = carte ? [...carte.querySelectorAll('div')].filter(d => /255, 255, 255/.test(d.style.background) && d.children.length <= 1 && d.textContent.trim() && d.style.borderRadius !== '50%' && !(parseFloat(getComputedStyle(d).letterSpacing) > 1)) : [];
      const cb = carte.getBoundingClientRect();
      out.etiq = etiq.map(d => {
        const rg = document.createRange(); rg.selectNodeContents(d); const t = rg.getBoundingClientRect(); const o = d.getBoundingClientRect();
        return {txt: d.textContent.trim(), o: [o.left, o.top, o.right, o.bottom], vide: Math.round(o.width - t.width), centre: getComputedStyle(d).textAlign, dehors: o.left < cb.left || o.right > cb.right || o.top < cb.top || o.bottom > cb.bottom};
      });
      out.tirets = (document.body.innerText.match(/—/g) || []).length;
      out.points = [...document.querySelectorAll('div')].filter(d => /^\d\. /.test(d.textContent) && d.children.length === 0 && /…|\.\.\./.test(d.textContent)).length;
      return out;
    });
    ligne(r.racine[0] === 1720 && r.racine[1] === 1048, `Planche ${r.racine.join(' × ')} (1720 × 1048)`);
    ligne(r.carte && r.carte.join() === '64,176,1000,808', `Carte à ${r.carte} (64, 176, 1000 × 808)`);
    ligne(r.titre <= 1, `Titre sur ${r.titre} ligne(s) (1)`);
    ligne(r.legende && r.legende[0] >= 176 && r.legende[1] <= 984, `Légende de ${r.legende} px (entre 176 et 984, centrée sur la carte)`);
    ligne(r.lignes.length >= 9 && r.lignes.length <= 14, `${r.lignes.length} figurés (9 à 14)`);
    const longs = r.lignes.filter(l => l[1] > 3); ligne(!longs.length, `Lignes de légende de 3 lignes au plus${longs.length ? ' : ' + longs.map(l => l[0]).join(' | ') : ''}`);
    const doubles = r.lignes.filter(l => l[2] > 1); ligne(!doubles.length, `Un seul figuré par ligne${doubles.length ? ' : ' + doubles.map(l => l[0]).join(' | ') : ''}`);
    ligne(r.points === 0, `Titres de parties sans points de suspension`);
    const larges = r.etiq.filter(e => e.vide > 24); ligne(!larges.length, `Encadrés ajustés au texte (24 px de jeu au plus, marges comprises)${larges.length ? ' : ' + larges.map(e => e.txt + ' +' + e.vide).join(', ') : ''}`);
    const noncentre = r.etiq.filter(e => e.centre !== 'center'); ligne(!noncentre.length, `Texte centré dans les encadrés${noncentre.length ? ' : ' + noncentre.map(e => e.txt).join(', ') : ''}`);
    const dehors = r.etiq.filter(e => e.dehors); ligne(!dehors.length, `Étiquettes dans le cadre${dehors.length ? ' : ' + dehors.map(e => e.txt).join(', ') : ''}`);
    const chev = [];
    for (let i = 0; i < r.etiq.length; i++) for (let j = i + 1; j < r.etiq.length; j++) {
      const a = r.etiq[i].o, c = r.etiq[j].o;
      if (a[0] < c[2] - 1 && c[0] < a[2] - 1 && a[1] < c[3] - 1 && c[1] < a[3] - 1) chev.push(r.etiq[i].txt + ' / ' + r.etiq[j].txt);
    }
    ligne(!chev.length, `Étiquettes sans chevauchement${chev.length ? ' : ' + chev.join(', ') : ''}`);
    ligne(r.tirets === 0, `Tirets cadratins : ${r.tirets}`);
    await p.close();
  }
  await b.close();
  fs.unlinkSync(tmp);
  console.log(ko ? `\n${ko} point(s) à corriger. Regarder aussi la capture : ${png}` : `\nTout est bon. Regarder quand même la capture : ${png}`);
  process.exit(ko ? 1 : 0);
})();
