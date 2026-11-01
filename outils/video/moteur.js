/* Moteur des vidéos de chapitre (outils/video/generer.py).
   La page définit SP (titres des sous-parties), PARTIES et PLANS ; le moteur construit chaque plan,
   calcule le temps de lecture de chaque bloc et expose render(t), qui dessine l'image à l'instant t.
   Rien ne dépend de l'horloge du navigateur : chaque image est calculée, donc rendue à l'identique. */
(function () {
  const VX = window.VOIX || null;  // durées de la voix off par écran (voix.py) : la voix fixe alors le tempo
  const OUT = VX ? .45 : .6;       // fondu de sortie d'un plan (s)
  const VOIX_DEPART = .4, VOIX_TRAINE = .8;
  /* Format vertical 9:16 (1080 × 1920, generer.py --format 9:16) : mêmes plans, mêmes durées, colonnes empilées
     dans l'ordre des blocs, agrandies ou réduites pour remplir l'écran (VIDEO.controle signale les écrans trop petits). */
  const V = window.FORMAT === '9:16';
  if (V) document.documentElement.classList.add('v916');
  const LECTURE = 3.5;            // mots lus par seconde (texte posé)
  const PINS = ['var(--a3)', 'var(--a1)', 'var(--a2)', '#c9a227'];
  const TAPE = ['rgba(242,214,117,.82)', 'rgba(214,228,222,.86)', 'rgba(239,190,160,.8)'];
  let doc = 0, pinN = 0, tapeN = 0, seed = 7;
  /* Chapitre de la source (const CHAP = { n: 3, suite: 4 } dans la page) : numéro de la couverture, du tampon, du bilan,
     et chapitre suivant de l'écran de fin (sa vignette vignettes/chapitre-N.webp ; suite: 0 si le chapitre suivant n'existe pas encore). */
  const CH = Object.assign({ n: 1 }, typeof CHAP !== 'undefined' ? CHAP : {});
  const SUITE = CH.suite ?? CH.n + 1;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

  const $ = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const ty = s => s == null ? '' : String(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/ ([:;!?»%])/g, ' $1')
    .replace(/« /g, '« ')
    .replace(/(\d) (\d{3})(?!\d)/g, '$1 $2')
    .replace(/(\d) (\d{3})(?!\d)/g, '$1 $2');
  const mots = s => String(s || '').replace(/<[^>]+>|\*/g, ' ').split(/\s+/).filter(Boolean).length;
  const eo = p => 1 - Math.pow(1 - p, 3);
  const eio = p => p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  const back = p => { const c = 1.9; return p <= 0 ? 0 : 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); };

  /* Nombres qui défilent : « ~15 000 km », « 0,935 », « 55 % ». Une année seule ne défile pas. */
  function nombre(s) {
    const m = String(s).match(/(\d[\d   ]*(?:,\d+)?)/);
    if (!m) return null;
    const raw = m[1].trim(), dec = (raw.split(',')[1] || '').length;
    const num = parseFloat(raw.replace(/[\s  ]/g, '').replace(',', '.'));
    const post = String(s).slice(m.index + raw.length);   // garde l'espace entre le nombre et son unité
    if (!dec && /^\d{4}$/.test(raw) && num >= 1400 && num <= 2100 && !/%|\$/.test(post)) return null;
    if (!dec && num < 10) return null;   // un petit entier qui défile resterait presque tout le temps à 0
    return { pre: String(s).slice(0, m.index), num, dec, post };   // chiffre en nowrap : une espace ordinaire suffit
  }
  const fmt = (v, d) => v.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });

  /* Horloge de lecture d'un plan */
  class Horloge {
    constructor(t0) { this.t = t0; }
    lire(n, min = 2.4) { const s = this.t; this.t += Math.max(min, .7 + n / LECTURE); return s; }
    pause(x) { this.t += x; }
  }

  let P = null; // plan en cours de construction
  const A = (el, a, t, d = .8, x = {}) => { P.anims.push(Object.assign({ el, a, t, d }, x)); return el; };
  /* Mots repères : chaque élément apparaît quand la voix prononce son mot repère (transcription faite par voix.py).
     Repère d'un élément = son champ v (ou vs[i] pour les éléments d'une liste), sinon ses mots en gras, son chiffre, sa date
     ou ses premiers mots. Sans repère trouvé, l'élément garde une apparition proportionnelle au temps de la voix. */
  const VM = window.VOIX_MOTS || null;
  const STOP = new Set('les des une est par pour avec dans sur aux que qui son ses leur leurs plus mais elle ils elles cette ces entre comme tout tous'.split(' '));
  const norm = s => String(s || '').replace(/<[^>]+>|\*/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/(\d)[\s\u00a0\u202f](?=\d{3}\b)/g, '$1').split(/[^a-z0-9]+/).filter(Boolean);
  const sig = toks => toks.filter(w => /^\d+$/.test(w) || (w.length >= 3 && !STOP.has(w)));
  const forts = x => [...String(x || '').matchAll(/\*\*(.+?)\*\*/g)].map(m => m[1]);
  function ancre(t, ...cues) { if (VM) P.ancres.push({ t, cues: cues.flat().filter(Boolean) }); }
  function surligne(el, t) { el.querySelectorAll('strong').forEach((s, i) => A(s, 'mark', t + .4 + i * .3, .6)); }
  function punaise(el, t) { const p = $('i', 'pin'); p.style.setProperty('--pin', PINS[pinN++ % PINS.length]); el.prepend(p); A(p, 'pop', t + .25, .5); }
  function scotch(fig, t, places) {
    places.forEach(([css, r]) => {
      const s = $('span', 'sc'); Object.assign(s.style, css); s.style.background = TAPE[tapeN++ % TAPE.length];
      fig.append(s); A(s, 'tape', t + .35, .45, { rot: r });
    });
  }
  function titreMots(el, txt, t, pas = .07) {
    let em = false;
    el.innerHTML = '';
    ty(txt).split(' ').forEach((w, i) => {
      if (w.startsWith('<em>')) em = true;
      const clean = w.replace(/<\/?em>/g, '');
      const wm = $('span', 'wm'), sp = $('span', 'w', em ? '<em>' + clean + '</em>' : clean);
      wm.append(sp); el.append(wm, ' ');
      A(sp, 'word', t + i * pas, .7);
      if (w.endsWith('</em>')) em = false;
    });
  }

  /* ---------- Blocs ---------- */
  const BLOCS = {
    p(b, h) {
      const e = $('p', 'b-p' + (b.fort ? ' fort' : ''), ty(b.x)); const t = h.lire(mots(b.x));
      A(e, b.fort ? 'left' : 'up', t); surligne(e, t); ancre(t, b.v, forts(b.x), b.x); return e;
    },
    def(b, h) {
      const e = $('div', 'def', `<span class="dk">Définition</span><span class="dm">${ty(b.m)}${b.qui ? ` <small>${ty(b.qui)}</small>` : ''}</span><p>${ty(b.x)}</p>`);
      const t = h.lire(mots(b.x) + mots(b.m) + 2); A(e, 'up', t); surligne(e, t + .3); ancre(t, b.v, b.m, forts(b.x)); return e;
    },
    fiche(b, h) {
      const e = $('div', 'fi', `${b.kk ? `<span class="fk">${ty(b.kk)}</span>` : ''}${b.t ? `<h5>${ty(b.t)}</h5>` : ''}<p>${ty(b.x)}</p>`);
      e.style.transform = `rotate(${b.rot ?? (rnd() - .5) * 1.4}deg)`;
      const t = h.lire(mots(b.x) + mots(b.t) + mots(b.kk) * .5); A(e, 'up', t, .8, { rot: parseFloat(e.style.transform.slice(7)) }); punaise(e, t); surligne(e, t); ancre(t, b.v, b.t, forts(b.x), b.x); return e;
    },
    duo(b, h) {
      const e = $('div', 'duo' + (b.v ? ' v' : ''));
      [b.a, b.b].forEach(([t, x, kk], k) => e.append(BLOCS.fiche({ t, x, kk, v: b.vs && b.vs[k] }, h)));
      return e;
    },
    cards(b, h) {
      const e = $('div', 'cards'); const nc = b.cols || b.cards.length;
      e.style.gridTemplateColumns = `repeat(${V ? (nc >= 4 ? 2 : 1) : nc},1fr)`;
      b.cards.forEach(([t, x, kk], k) => e.append(BLOCS.fiche({ t, x, kk, v: b.vs && b.vs[k] }, h)));
      return e;
    },
    stats(b, h) {
      const e = $('div', 'stats' + (b.petit ? ' petit' : '')); e.style.setProperty('--n', V ? Math.min(2, b.cols || b.items.length) : b.cols || b.items.length);
      b.items.forEach(([n, x], i) => {
        const f = $('div', 'fi' + ((b.r ?? -1) === i ? ' r' : ''), `<b></b><span>${ty(x)}</span>`);
        f.style.transform = `rotate(${(rnd() - .5) * 1.6}deg)`;
        const t = h.lire(mots(x) + 2, 2.2); A(f, 'up', t, .8, { rot: parseFloat(f.style.transform.slice(7)) }); punaise(f, t); ancre(t, b.vs && b.vs[i], n, x);
        const bb = f.querySelector('b'), nb = nombre(n);
        if (nb) A(bb, 'count', t + .2, 1.4, nb); else bb.innerHTML = ty(n);
        e.append(f);
      });
      return e;
    },
    bars(b, h) {
      const e = $('div', 'bars'); if (b.lw) e.style.setProperty('--lw', b.lw + 'px');
      const vals = b.rows.map(r => parseFloat(String(r[1]).replace(',', '.')));
      const max = b.max || Math.max(...vals) * 1.04;
      const t = h.lire(b.rows.length * 2.2 + mots(b.src) * .3, 3); A(e, 'up', t); punaise(e, t); ancre(t, b.v, b.rows[0][0], b.lab);
      b.rows.forEach((r, i) => {
        const row = $('div', 'row' + ((b.r || []).includes(i) ? ' r' : ''), `<span>${ty(r[0])}</span><div class="tr"><i></i></div><b></b>`);
        A(row.querySelector('i'), 'w', t + .5 + i * .22, 1.1, { v: vals[i] / max * 100 });
        A(row.querySelector('b'), 'count', t + .5 + i * .22, 1.1, nombre(String(r[1]) + (b.u || '')));
        e.append(row);
      });
      if (b.src) e.append($('p', 'src', ty(b.src)));
      return e;
    },
    vbars(b, h) {
      const e = $('div', 'vb'); e.style.setProperty('--vh', (b.vh || 380) + 'px');
      const t = h.lire(b.rows.length * 1.3 + 3, 4); A(e, 'up', t); punaise(e, t); ancre(t, b.v, b.lab);
      if (b.leg) { const l = $('div', 'leg'); b.leg.forEach(([c, n]) => { const s = $('span', '', `<i></i>${ty(n)}`); s.querySelector('i').style.setProperty('--c', c); l.append(s); }); e.append(l); }
      const cols = $('div', 'cols'), ax = $('div', 'ax');
      const vals = b.rows.map(r => parseFloat(String(r[1]).replace(/\s/g, '').replace(',', '.')));
      const max = b.max || Math.max(...vals) * 1.12;
      b.rows.forEach((r, i) => {
        const c = $('div', 'vc', '<b></b><i></i>'); if (r[2]) c.style.setProperty('--c', r[2]);
        A(c.querySelector('i'), 'h', t + .5 + i * .2, 1.1, { v: vals[i] / max * 88 });
        A(c.querySelector('b'), 'count', t + .5 + i * .2, 1.1, nombre(r[1]));
        cols.append(c); ax.append($('span', '', ty(r[0])));
      });
      e.append(cols, ax); if (b.src) e.append($('p', 'src', ty(b.src)));
      return e;
    },
    frise(b, h) {
      const e = $('div', 'frise' + (b.serre ? ' serre' : '')); if (b.dw) e.style.setProperty('--dw', b.dw + 'px');
      const ol = $('ol'), ligne = $('i', 'ligne'); ol.append(ligne);
      const t0 = h.t; A(e, 'up', t0 - .1); punaise(e, t0 - .1);
      const lis = b.ev.map(([d, t, x], i) => {
        const li = $('li', i === b.ev.length - 1 ? 'cur' : '', `<i class="dot"></i><span class="d">${ty(d)}</span><span class="t">${t ? `<b>${ty(t)}</b> ` : ''}${ty(x || '')}</span>`);
        const s = h.lire(mots(t) + mots(x) + 1, 2); A(li, 'left', s); A(li.querySelector('.dot'), 'pop', s + .1, .5); surligne(li, s); ancre(s, b.vs && b.vs[i], d, t);
        return li;
      });
      A(ligne, 'gy', t0, h.t - t0);
      lis.reverse().forEach(li => ol.append(li));
      e.append(ol); return e;
    },
    list(b, h) {
      const e = $('ol', 'liste' + (b.serre ? ' serre' : ''));
      const t0 = h.t; A(e, 'up', t0 - .1); punaise(e, t0 - .1);
      b.items.forEach((x, i) => {
        const li = $('li', '', `<i>${b.puce || String(i + 1).padStart(2, '0')}</i><span>${ty(x)}</span>`);
        const s = h.lire(mots(x), 2); A(li, 'left', s); surligne(li, s); ancre(s, b.vs && b.vs[i], forts(x), x); e.append(li);
      });
      return e;
    },
    quote(b, h) {
      const e = $('div', 'coupure', `<span class="ck">${ty(b.kk)}</span><h5>${ty(b.t)}</h5>${b.x ? `<p>${ty(b.x)}</p>` : ''}`);
      const r = b.rot ?? (rnd() - .5) * 1.6; e.style.transform = `rotate(${r}deg)`;
      const t = h.lire(mots(b.t) + mots(b.x) + 1); A(e, 'drop', t, .9, { rot: r }); surligne(e, t); ancre(t, b.v, b.t, b.kk);
      scotch(e, t, [[{ left: '42%', top: '-18px', transform: 'rotate(-3deg)' }, -3]]);
      return e;
    },
    photo(b, h) {
      doc++;
      const f = $('figure', 'tir', `<div class="cadre"><img src="${IMG}${b.img}" alt=""></div><figcaption><b>Doc. ${doc}</b> · ${ty(b.cap)}</figcaption>`);
      f.querySelector('.cadre').style.setProperty('--h', (b.h || 480) + 'px');
      if (b.pos) f.querySelector('img').style.objectPosition = b.pos;
      const r = b.rot ?? (rnd() - .5) * 2.4; f.style.transform = `rotate(${r}deg)`;
      const t = h.lire(mots(b.cap) * .45 + 1, b.min ?? 1.6); A(f, 'drop', t, 1, { rot: r }); ancre(t, b.v);
      A(f.querySelector('img'), 'kb', 0, 0, { plan: true, dx: (rnd() - .5) * 4, dy: (rnd() - .5) * 3 });
      scotch(f, t, rnd() < .5 ? [[{ left: '8%', top: '-16px', transform: 'rotate(-6deg)' }, -6], [{ right: '-34px', bottom: '60px', width: '110px', transform: 'rotate(-60deg)' }, -60]]
        : [[{ right: '10%', top: '-16px', transform: 'rotate(5deg)' }, 5], [{ left: '-30px', bottom: '70px', width: '100px', transform: 'rotate(58deg)' }, 58]]);
      return f;
    },
    photos2(b, h) {
      const e = $('div', 'photos2');
      b.p.forEach(x => e.append(BLOCS.photo(Object.assign({ h: b.h || 330 }, x), h)));
      return e;
    },
    portrait(b, h) {
      const e = $('div', 'portrait' + (b.mini ? ' mini' : ''));
      const pola = $('figure', 'pola', `<img src="${IMG}${b.img}" alt="">`); const r = (rnd() - .5) * 5; pola.style.transform = `rotate(${r}deg)`;
      const corps = $('div', '', `<span class="pk">${ty(b.kk)}</span><h4>${ty(b.nom)}</h4><h6>${ty(b.t)}</h6>`);
      const t = h.lire(mots(b.t) + 3); A(pola, 'drop', t, .9, { rot: r }); ancre(t, b.v, b.nom); scotch(pola, t, [[{ left: '30%', top: '-16px', transform: 'rotate(-4deg)' }, -4]]);
      A(corps, 'up', t + .2);
      b.x.forEach((x, k) => { const p = $('p', '', ty(x)); const s = h.lire(mots(x)); A(p, 'up', s); surligne(p, s); ancre(s, b.vs && b.vs[k], forts(x), x); corps.append(p); });
      e.append(pola, corps); return e;
    },
    svg(b, h) {
      const e = $('div', 'schema'); const t = h.lire(b.mots || 12, b.min || 6); A(e, 'up', t); punaise(e, t); ancre(t, b.v);
      SCHEMAS[b.nom](e, t, h); return e;
    }
  };

  /* ---------- Schémas animés ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const S = (tag, at, parent) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (parent) parent.append(e); return e; };
  const SCHEMAS = {
    /* Modèle de la métropole latino-américaine (Janoschka) : gradient radioconcentrique, cône de richesse, îlots fermés */
    metropole(e, t) {
      e.append($('div', 'lab', 'Modèle de la métropole latino-américaine'));
      const sv = S('svg', { viewBox: '0 0 760 500' }); e.append(sv);
      const cx = 235, cy = 250, R = 225;
      [[R, '#efe4d9'], [R * .74, '#e6d2c2'], [R * .48, '#dcbfa9'], [R * .24, '#cfa98d']].forEach(([r, c], i) => {
        A(S('circle', { cx, cy, r, fill: c, stroke: '#fff', 'stroke-width': 3 }, sv), 'zoom', t + .3 + i * .25, .8, { o: `${cx}px ${cy}px` });
      });
      const pt = a => [cx + R * Math.cos(a * Math.PI / 180), cy + R * Math.sin(a * Math.PI / 180)];
      const [x1, y1] = pt(-34), [x2, y2] = pt(2);
      A(S('path', { d: `M${cx},${cy} L${x1},${y1} A${R},${R} 0 0 1 ${x2},${y2} Z`, fill: 'var(--a1)', opacity: .85 }, sv), 'zoom', t + 1.5, 1, { o: `${cx}px ${cy}px` });
      A(S('rect', { x: cx - 20, y: cy - 20, width: 40, height: 40, fill: 'var(--ink)' }, sv), 'zoom', t + 1.2, .6, { o: `${cx}px ${cy}px` });
      [[cx + 120, cy - 52], [cx + 175, cy - 28], [cx - 140, cy + 105], [cx + 30, cy + 175], [cx - 165, cy - 80], [cx + 110, cy + 110]].forEach(([x, y], i) => {
        A(S('rect', { x: x - 14, y: y - 14, width: 28, height: 28, fill: i < 2 ? '#fff' : 'var(--a3)', stroke: i < 2 ? 'var(--a3)' : '#fff', 'stroke-width': 4 }, sv), 'zoom', t + 2.4 + i * .2, .5, { o: `${x}px ${y}px` });
      });
      const leg = [['var(--ink)', ['CBD, le centre', 'des affaires']], ['var(--a1)', ['Cône de richesse']], ['#cfa98d', ['Pauvreté croissante', 'vers la périphérie']], ['var(--a3)', ['Îlots fermés : gated', 'communities, malls']]];
      let y = 120;
      leg.forEach(([c, lignes], i) => {
        const g = S('g', {}, sv); S('rect', { x: 500, y, width: 22, height: 22, fill: c }, g);
        const tx = S('text', { x: 534, y: y + 18, 'font-size': 21, fill: '#1b2622' }, g);
        lignes.forEach((l, k) => { S('tspan', { x: 534, dy: k ? 25 : 0 }, tx).textContent = l; });
        A(g, 'fade', t + 3.4 + i * .3, .6); y += 40 + lignes.length * 25;
      });
    },
    /* Les maquiladoras : conception au Nord, assemblage au Sud */
    maquila(e, t) {
      e.append($('div', 'lab', 'Un système productif transfrontalier'));
      const sv = S('svg', { viewBox: '0 0 760 440' }); e.append(sv);
      const fr = S('line', { x1: 0, y1: 215, x2: 760, y2: 215, stroke: 'var(--a3)', 'stroke-width': 5, 'stroke-dasharray': '16 10' }, sv); A(fr, 'draw', t + .2, 1, { len: 800 });
      const tx = (x, y, s, w, c, a = 'middle') => { const e = S('text', { x, y, 'font-size': s, 'font-weight': w, fill: c, 'text-anchor': a }, sv); return e; };
      const n = tx(20, 36, 22, 700, 'var(--a1)', 'start'); n.textContent = 'ÉTATS-UNIS · SAN DIEGO, EL PASO, CALEXICO'; A(n, 'fade', t + .4);
      const s = tx(20, 425, 22, 700, 'var(--a3)', 'start'); s.textContent = 'MEXIQUE · TIJUANA, CIUDAD JUÁREZ, MEXICALI'; A(s, 'fade', t + .6);
      const boite = (x, y, l1, l2, c, d) => {
        const g = S('g', {}, sv); S('rect', { x, y, width: 250, height: 104, rx: 8, fill: '#fff', stroke: c, 'stroke-width': 4 }, g);
        const a = S('text', { x: x + 125, y: y + 44, 'font-size': 25, 'font-weight': 700, fill: c, 'text-anchor': 'middle' }, g); a.textContent = l1;
        const b = S('text', { x: x + 125, y: y + 78, 'font-size': 19, fill: '#2d3b36', 'text-anchor': 'middle' }, g); b.textContent = l2;
        A(g, 'fade', d, .6); return g;
      };
      boite(40, 70, 'Conception', 'recherche, composants', 'var(--a1)', t + 1);
      boite(470, 70, 'Marché', 'produits finis vendus', 'var(--a1)', t + 4.2);
      boite(255, 290, 'Assemblage', 'main-d’œuvre bon marché', 'var(--a3)', t + 2.6);
      const fl = (d, c, at, lab, lx, ly) => {
        const p = S('path', { d, fill: 'none', stroke: c, 'stroke-width': 6, 'marker-end': 'url(#fl' + (c.includes('a3') ? 'r' : 'v') + ')' }, sv); A(p, 'draw', at, 1.1, { len: 420 });
        const l = tx(lx, ly, 19, 600, c); l.textContent = lab; A(l, 'fade', at + .6);
      };
      const defs = S('defs', {}, sv);
      [['flv', 'var(--a1)'], ['flr', 'var(--a3)']].forEach(([id, c]) => { const m = S('marker', { id, viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto' }, defs); S('path', { d: 'M0,0 L10,5 L0,10 z', fill: c }, m); });
      fl('M165,180 C165,250 240,300 262,320', 'var(--a1)', t + 1.8, 'composants sans droits', 108, 302);
      fl('M500,330 C580,300 600,250 595,184', 'var(--a3)', t + 3.4, 'réexportation', 680, 262);
    },
    /* La « valse des paradigmes » : chaque modèle de développement s'achève dans une crise (HGG 2e année, chapitre 3) */
    valse(e, t) {
      e.append($('div', 'lab', 'La « valse des paradigmes »'));
      const sv = S('svg', { viewBox: '0 0 760 470' }); e.append(sv);
      const tx = (x, y, l, o) => { const el = S('text', Object.assign({ x, y, 'font-size': 21, fill: 'var(--ink)', 'text-anchor': 'middle' }, o), sv); l.forEach((m, k) => { S('tspan', { x, dy: k ? 24 : 0 }, el).textContent = m; }); return el; };
      S('line', { x1: 20, y1: 340, x2: 740, y2: 340, stroke: 'var(--rule)', 'stroke-width': 3 }, sv);
      const ph = [[['Agro-minier', 'exportateur'], '1929', 'Grande Dépression'], [['ISI', '(CEPAL)'], '1982', 'Crise de la dette'], [['Consensus', 'de Washington'], '1994-2001', 'Tequila, Argentine'], [['Néo-', 'extractivisme'], '2014', 'Fin du supercycle']];
      ph.forEach(([nom, an, crise], k) => {
        const x0 = 20 + k * 172, x1 = x0 + 158, c = k % 2 ? 'var(--a3)' : 'var(--a1)', d = t + .4 + k * 1.1;
        const v = S('path', { d: `M${x0},340 C${x0 + 60},330 ${x1 - 60},${190 - k * 12} ${x1 - 12},${165 - k * 12} L${x1},340`, fill: 'none', stroke: c, 'stroke-width': 7, 'stroke-linejoin': 'round' }, sv);
        A(v, 'draw', d, 1, { len: 520 });
        A(tx(x0 + 82, 100 - k * 12, nom, { 'font-weight': 700, fill: c, 'font-size': 22 }), 'fade', d + .2, .6);
        const pt = S('circle', { cx: x1, cy: 340, r: 9, fill: 'var(--a3)' }, sv); A(pt, 'zoom', d + .9, .5, { o: `${x1}px 340px` });
        A(tx(Math.min(x1 - 30, 690), 380, [an], { 'font-weight': 700, 'font-size': 23 }), 'fade', d + .9, .5);
        A(tx(Math.min(x1 - 30, 690), 408, [crise], { 'font-size': 18, fill: 'var(--dim)' }), 'fade', d + 1, .5);
      });
    },
    /* La production de pétrole du Venezuela (AIE), en milliers de barils par jour */
    venezuela(e, t) {
      e.append($('div', 'lab', 'Pétrole du Venezuela, milliers de barils par jour'));
      const sv = S('svg', { viewBox: '0 0 760 430' }); e.append(sv);
      const X = a => 70 + (a - 1996) * (640 / 30), Y = v => 370 - v * (300 / 4000);
      S('line', { x1: 50, y1: 370, x2: 740, y2: 370, stroke: 'var(--rule)', 'stroke-width': 3 }, sv);
      [2000, 2010, 2020].forEach(a => { const l = S('text', { x: X(a), y: 405, 'font-size': 19, fill: 'var(--dim)', 'text-anchor': 'middle' }, sv); l.textContent = a; });
      const sx = X(2019), sa = S('line', { x1: sx, y1: 60, x2: sx, y2: 370, stroke: 'var(--a3)', 'stroke-width': 3, 'stroke-dasharray': '10 8' }, sv); A(sa, 'draw', t + 2.2, .8, { len: 320 });
      const sl = S('text', { x: sx - 10, y: 56, 'font-size': 19, 'font-weight': 700, fill: 'var(--a3)', 'text-anchor': 'end' }, sv); sl.textContent = 'Sanctions contre PDVSA, 2019'; A(sl, 'fade', t + 2.6);
      const pts = [[1998, 3656, 'Record 1998'], [2012, 3200, '2012'], [2020, 383, 'Creux 2020'], [2025, 1034, '2025']];
      const d = 'M' + pts.map(([a, v]) => `${X(a)},${Y(v)}`).join(' L');
      A(S('path', { d, fill: 'none', stroke: 'var(--a1)', 'stroke-width': 7, 'stroke-linejoin': 'round' }, sv), 'draw', t + .4, 2.4, { len: 900 });
      pts.forEach(([a, v, l], k) => {
        const x = X(a), y = Y(v), at = t + .5 + k * .7;
        A(S('circle', { cx: x, cy: y, r: 10, fill: k === 2 ? 'var(--a3)' : 'var(--a1)' }, sv), 'zoom', at, .5, { o: `${x}px ${y}px` });
        const g = S('text', { x: x + (k === 3 ? -16 : 14), y: y + (k === 2 ? 30 : -18), 'font-size': 24, 'font-weight': 700, fill: 'var(--ink)', 'text-anchor': k === 3 ? 'end' : 'start' }, sv);
        S('tspan', {}, g).textContent = v.toLocaleString('fr-FR').replace(/\s/g, ' ') + ' ';
        S('tspan', { 'font-size': 18, 'font-weight': 400, fill: 'var(--dim)' }, g).textContent = l;
        A(g, 'fade', at + .2, .5);
      });
    },
    /* Un corridor bi-océanique et son « effet tunnel » */
    corridor(e, t) {
      e.append($('div', 'lab', 'Un corridor bi-océanique'));
      const sv = S('svg', { viewBox: '0 0 760 380' }); e.append(sv);
      const box = (x, w, l1, l2, l3, c, at) => {
        const g = S('g', {}, sv); S('rect', { x, y: 110, width: w, height: 128, rx: 8, fill: '#fff', stroke: c, 'stroke-width': 4 }, g);
        [[l1, 150, 24, 700, c], [l2, 182, 19, 400, 'var(--txt)'], [l3, 206, 19, 400, 'var(--txt)']].forEach(([l, y, f, w2, col]) => {
          const tt = S('text', { x: x + w / 2, y, 'font-size': f, 'font-weight': w2, fill: col, 'text-anchor': 'middle' }, g); tt.textContent = l;
        });
        A(g, 'fade', at, .6);
      };
      const zone = S('rect', { x: 230, y: 96, width: 300, height: 156, fill: 'var(--rule)', opacity: .6 }, sv); A(zone, 'fade', t + .3, .8);
      const zl = S('text', { x: 380, y: 80, 'font-size': 19, 'font-weight': 700, fill: 'var(--dim)', 'text-anchor': 'middle' }, sv); zl.textContent = 'INTÉRIEUR À DÉSENCLAVER'; A(zl, 'fade', t + .5);
      const zs = S('text', { x: 380, y: 280, 'font-size': 18, fill: 'var(--dim)', 'text-anchor': 'middle' }, sv); zs.textContent = 'Andes, Amazonie, Bolivie, Paraguay'; A(zs, 'fade', t + .5);
      const route = S('line', { x1: 220, y1: 174, x2: 540, y2: 174, stroke: 'var(--ink)', 'stroke-width': 8, 'stroke-dasharray': '22 12' }, sv); A(route, 'draw', t + 1.4, 1.2, { len: 330 });
      box(10, 220, 'Façade atlantique', 'São Paulo,', 'Buenos Aires', 'var(--a1)', t + .8);
      box(540, 210, 'Façade pacifique', 'ports chiliens et', 'péruviens → Asie', 'var(--a3)', t + 2.4);
      const tl = S('text', { x: 380, y: 330, 'font-size': 22, 'font-weight': 700, fill: 'var(--a3)', 'text-anchor': 'middle' }, sv); tl.textContent = 'Effet tunnel : seules les extrémités en profitent';
      A(tl, 'fade', t + 3.4);
    }
  };

  /* ---------- Plans ---------- */
  function corps(cls) { return $('div', 'body' + (cls ? ' ' + cls : '')); }
  const SPECIAUX = {
    cover(d, h) {
      const s = P.box;
      const f = BLOCS.photo({ img: d.img, cap: d.cap, h: 470, rot: -.8, min: .2 }, h); f.classList.add('cv-photo'); s.append(f);
      const et = $('div', 'cv-etiq', `<div class="piece"><b>${String(CH.n).padStart(2, '0')}</b><span>Chapitre<br>HGG · 2e année</span></div><h1></h1><p>${ty(d.sous)}</p>`);
      et.style.transform = 'rotate(.5deg)'; if (d.haut && !V) et.style.top = d.haut + 'px'; s.append(et);   // haut : étiquette remontée pour un titre sur 3 lignes
      const t = h.lire(4, 2.2); A(et, 'up', t, .9, { rot: .5 }); titreMots(et.querySelector('h1'), d.titre, t + .4, .12);
      A(et.querySelector('p'), 'up', h.lire(mots(d.sous)));
      const tp = $('div', 'tampon', `<span>ECG Prépa</span><b>Cours</b><span>Chapitre ${CH.n}</span>`); Object.assign(tp.style, V ? { right: '70px', top: '1500px' } : { right: '170px', top: '600px' }); s.append(tp);
      A(tp, 'stamp', h.lire(1, 1.6), .5, { rot: -14 });
    },
    these(d, h) {
      const b = corps('plein'); P.box.append(b);
      const c = $('div', 'col'); c.style.gap = '44px'; b.append(c);
      const k = $('div', 'kick', ty(d.kk)); c.append(k); A(k, 'up', .5);
      const g = $('h2', 'grand'); g.style.fontSize = V ? '118px' : '128px'; c.append(g); titreMots(g, d.titre, .7, .1); h.lire(9);
      const l = $('p', 'b-p fort', ty(d.lead)); l.style.fontSize = '40px'; c.append(l); const t = h.lire(mots(d.lead)); A(l, 'left', t); surligne(l, t);
    },
    essentiel(d, h) {
      const b = corps('plein'); P.box.append(b);
      const c = $('div', 'col'); c.style.gap = '50px'; b.append(c);
      const k = $('h2', 'grand'); k.style.fontSize = '84px'; c.append(k); titreMots(k, d.titre, .5); h.lire(3);
      const g = $('div', 'num3'); c.append(g);
      d.items.forEach(([t, x], i) => {
        const f = BLOCS.fiche({ t, x, rot: [-.8, .6, -.4][i] }, h); f.prepend($('span', 'gn', String(i + 1).padStart(2, '0'))); g.append(f);
      });
    },
    chiffres(d, h) {
      const b = corps('plein'); P.box.append(b);
      const c = $('div', 'col'); c.style.gap = '70px'; b.append(c);
      const k = $('h2', 'grand'); k.style.fontSize = '84px'; c.append(k); titreMots(k, d.titre, .5); h.lire(3);
      c.append(BLOCS.stats({ items: d.items, r: 1 }, h));
    },
    sommaire(d, h) {
      const b = corps('plein'); P.box.append(b);
      const c = $('div', 'col'); b.append(c);
      const k = $('div', 'kick', 'Le plan du chapitre'); k.style.marginBottom = '20px'; c.append(k); A(k, 'up', .5);
      const ol = $('ol', 'som'); c.append(ol);
      PARTIES.forEach(pa => {
        const li = $('li', '', `<span class="rn">${pa.n}</span><div><h4>${ty(pa.titre)}</h4><p>${(pa.sps.length > 4 ? pa.sps.map(s => s + ' ' + (SP[s][2] || SP[s][1])).join('&ensp;·&ensp;') : pa.sps.map(s => s + ' · ' + (SP[s][2] || SP[s][1])).join('<br>'))}</p></div>`);
        li.style.setProperty('--c', pa.c); ol.append(li); A(li, 'left', h.lire(mots(pa.titre) + 4));
      });
    },
    partie(d, h) {
      const pa = PARTIES.find(x => x.n === d.n); P.el.style.setProperty('--c', pa.c);
      P.box.append($('div', 'pt-fond'));
      const num = $('div', 'pt-num', pa.n); P.box.append(num); A(num, 'fade', .3, 1.2);
      const nb = pa.sps.length > 4, tx = $('div', 'pt-txt' + (nb ? ' nombreux' : ''), `<div class="kick">Partie ${pa.n}</div><h2 class="grand"></h2><ol></ol>`); P.box.append(tx);
      A(tx.querySelector('.kick'), 'up', .5); titreMots(tx.querySelector('h2'), pa.titre, .7, .09); h.lire(mots(pa.titre) + 2);
      pa.sps.forEach(s => { const li = $('li', '', `<i>${s}</i><span>${ty(nb ? SP[s][2] || SP[s][1] : SP[s][1])}</span>`); tx.querySelector('ol').append(li); A(li, 'left', h.lire(mots(SP[s][1]) * .6 + 1, 1.4)); });
      const f = BLOCS.photo({ img: d.img, cap: d.cap, h: 480, rot: 1.2, min: .2 }, new Horloge(1)); f.classList.add('pt-photo'); P.box.append(f);
    },
    dates(d, h) {
      const k = $('div', 'kick', 'À savoir par cœur'); Object.assign(k.style, { position: 'absolute', left: V ? '60px' : '96px', top: V ? '150px' : '110px' }); P.box.append(k); A(k, 'up', .4);
      const g = $('h2', 'grand'); Object.assign(g.style, { position: 'absolute', left: V ? '60px' : '96px', top: V ? '190px' : '150px', fontSize: V ? '104px' : '110px' }); P.box.append(g); titreMots(g, 'Les 8 dates repères', .6); h.lire(3);
      const z = $('div', 'dates'); P.box.append(z);
      const axe = $('i', 'axe'); z.append(axe);
      const n = d.ev.length, t0 = h.t;
      d.ev.forEach(([an, x, c], k) => {            // la plus récente à gauche ; apparition de la plus ancienne à la plus récente
        const i = n - 1 - k, el = $('div', 'dt', `<i class="pt"></i><b>${an}</b><span>${ty(x)}</span>`);
        el.style.setProperty('--c', c);
        if (V) {                                   // axe vertical, la plus récente en haut, dates de part et d'autre
          const gauche = i % 2 === 0, pt = el.querySelector('.pt');
          el.style.top = (i * (1180 / (n - 1))) + 'px'; el.style.left = gauche ? '20px' : '520px'; el.classList.add(gauche ? 'g' : 'd');
          pt.style.left = gauche ? '447px' : '-53px';
          z.append(el); const s = h.lire(mots(x) + 2, 2); A(el, 'left', s); A(pt, 'pop', s, .5);
          return;
        }
        el.style.left = (100 + i * (1528 / (n - 1))) + 'px';
        const haut = i % 2 === 0; el.style.top = haut ? '40px' : '290px';
        const pt = el.querySelector('.pt'); pt.style.top = haut ? '197px' : '-53px';
        if (haut) { el.insertBefore(el.querySelector('span'), el.querySelector('b')); }
        z.append(el); const s = h.lire(mots(x) + 2, 2); A(el, haut ? 'up' : 'down', s); A(pt, 'pop', s, .5);
      });
      A(axe, V ? 'gy' : 'gx', t0 - .3, 2);
      const leg = $('div', 'leg', PARTIES.map(pa => `<span style="--c:${pa.c}"><i></i>Partie ${pa.n}</span>`).join('')); z.append(leg); A(leg, 'fade', t0);
    },
    bilan(d, h) {
      const b = corps('plein'); P.box.append(b); const c = $('div', 'col'); c.style.gap = '46px'; b.append(c);
      const k = $('div', 'kick', `Bilan · Chapitre ${CH.n}`); c.append(k); A(k, 'up', .4);
      const ph = $('p', 'bilan-ph', ty(d.phrase)); c.append(ph); const t = h.lire(mots(d.phrase)); A(ph, 'left', t); surligne(ph, t);
      const g = $('div', 'bil3'); c.append(g);
      d.items.forEach(([tt, x], i) => { const f = BLOCS.fiche({ t: tt, x, rot: 0 }, h); f.style.setProperty('--c', PARTIES[i].c); f.prepend($('span', 'gn', PARTIES[i].n)); g.append(f); });
    },
    retenir(d, h) {
      const b = corps('plein'); P.box.append(b); const c = $('div', 'col'); c.style.gap = '40px'; b.append(c);
      const n = $('div', 'noir', `<div class="kick">À retenir</div><p>${ty(d.idee)}</p>`); c.append(n); const t = h.lire(mots(d.idee) + 2); A(n, 'up', t); surligne(n, t);
      const lab = $('div', 'lab', 'Notions clés'); lab.style.margin = '0 0 -14px'; c.append(lab); A(lab, 'fade', h.t);
      const g = $('div', 'notions'); c.append(g);
      d.notions.forEach(([tt, x]) => g.append(BLOCS.fiche({ t: tt, x }, h)));
      const p = BLOCS.p({ x: d.copie, fort: 1 }, h); c.append(p);
    },
    fin(d, h) {
      const b = corps('plein'); P.box.append(b); const c = $('div', 'col'); c.style.gap = '40px'; c.style.alignItems = 'flex-start'; b.append(c);
      const l = $('div', 'fin-logo', 'ECG Prépa'); c.append(l); A(l, 'up', .5);
      const p = $('p', 'b-p', ty(d.x)); p.style.fontSize = '40px'; c.append(p); A(p, 'up', h.lire(mots(d.x)));
      const s = $('div', 'suite', `${SUITE ? `<img src="${IMG}../vignettes/chapitre-${SUITE}.webp" alt="">` : ''}<div><small>${ty(d.suiteK || 'La suite · Chapitre ' + SUITE)}</small><h5>${ty(d.suite)}</h5></div>`); c.append(s);
      A(s, 'up', h.lire(8)); h.pause(2);
      const tp = $('div', 'tampon', '<span>ecg-prepa.fr</span><b>HGG</b><span>2e année</span>'); Object.assign(tp.style, V ? { right: '80px', top: '1380px' } : { right: '180px', top: '300px' }); P.box.append(tp); A(tp, 'stamp', 2.6, .5, { rot: -12 });
    }
  };

  /* ---------- Calage sur les mots de la voix ---------- */
  // même début de mot (accords et conjugaisons tolérés) : 5 lettres pour un mot court, la longueur moins 2 pour un long (« milliard » ≠ « millions »)
  const egal = (a, c) => { if (/^\d+$/.test(c)) return a === c; const n = Math.min(c.length, Math.max(5, c.length - 2)); return a.length >= n && a.slice(0, n) === c.slice(0, n); };
  function calerMots(P, i, fin) {
    const mots = VM && VM[i + 1]; if (!mots) return null;
    const tok = [];
    mots.forEach(([w, s]) => norm(w).forEach(x => tok.push([x, s])));
    for (let k = tok.length - 2; k >= 0; k--) if (/^\d+$/.test(tok[k][0]) && /^\d{3}$/.test(tok[k + 1][0])) { tok[k][0] += tok[k + 1][0]; tok.splice(k + 1, 1); }
    const pts = [[0, 0]]; let cur = 0;
    const cherche = cue => {
      const c = sig(norm(cue)); if (!c.length) return -1;
      for (let k = cur; k < tok.length; k++) {
        if (!egal(tok[k][0], c[0])) continue;
        if (c.length > 1 && !tok.slice(k + 1, k + 4).some(([w]) => egal(w, c[1]))) continue;
        return k;
      }
      return -1;
    };
    P.ancres.slice().sort((a, b) => a.t - b.t).forEach(a => {
      for (const cue of a.cues) {
        const k = cherche(cue); if (k < 0) continue;
        const r = VOIX_DEPART + tok[k][1] - .25, [t0, r0] = pts[pts.length - 1];
        if (a.t > t0 + .01 && r > r0 + .1) { pts.push([a.t, r]); cur = k + 1; a.ok = cue; }
        break;
      }
    });
    const [tl, rl] = pts[pts.length - 1];
    if (fin > tl) pts.push([fin, Math.max(rl + .1, P.dur - .3)]);
    return pts;
  }
  function mapw(pts, t) {
    for (let k = 1; k < pts.length; k++) if (t <= pts[k][0]) { const [a, b] = [pts[k - 1], pts[k]]; return a[1] + (t - a[0]) * (b[1] - a[1]) / (b[0] - a[0]); }
    const [a] = pts.slice(-1); return a[1] + (t - a[0]);
  }

  /* ---------- Construction ---------- */
  const scene = document.getElementById('scene');
  const plans = [];
  let debut = 0;
  PLANS.forEach((d, i) => {
    P = { d, anims: [], el: $('section', 'plan'), box: $('div', 'box'), sp: d.sp || null, ancres: [] }; P.el.append(P.box);
    const h = new Horloge(.55);
    if (d.tpl) SPECIAUX[d.tpl](d, h);
    else {
      const prev = PLANS[i - 1];
      const head = $('div', 'head', `<small>${ty(SP[d.sp][0])}</small><h3><i>${d.sp}</i>${ty(SP[d.sp][1])}</h3>`);
      P.el.append(head); P.head = head;
      const g = V ? '1fr' : d.g || '1fr';
      const b = corps(); b.style.gridTemplateColumns = g; P.box.append(b);
      const cols = g.split(' ').map(() => { const c = $('div', 'col'); b.append(c); return c; });
      d.b.forEach(bl => {
        const wrap = $('div', 'blk');
        if (bl.lab && !['bars', 'vbars', 'frise', 'list'].includes(bl.k)) { const l = $('div', 'lab', ty(bl.lab)); wrap.append(l); A(l, 'fade', h.t - .2, .5); }
        else if (bl.lab) { /* étiquette dans la fiche */ }
        const el = BLOCS[bl.k](bl, h);
        if (bl.lab && ['bars', 'vbars', 'frise', 'list'].includes(bl.k)) el.prepend($('div', 'lab', ty(bl.lab)));
        wrap.append(el); cols[V ? 0 : bl.c || 0].append(wrap);
      });
      if (d.flex && !V) cols.forEach((c, k) => { if (d.flex[k]) c.style.justifyContent = d.flex[k]; });
    }
    P.dur = Math.max(d.min || 0, h.t + (d.fin ?? 1.6)); P.k = 1;
    if (VX && VX[i + 1] != null) {                      // écran calé sur sa voix : les apparitions se resserrent dans le temps de la phrase
      const cible = Math.max(d.min || 0, 4, VX[i + 1] + VOIX_DEPART + VOIX_TRAINE);   // 4 s au moins pour voir l'écran
      P.k = Math.max(1, h.t / Math.max(1, cible - .3)); P.dur = cible;
      P.warp = calerMots(P, i, h.t);
    }
    P.anims.forEach(an => {                              // instants réels d'apparition (calés sur la voix s'il y en a une)
      if (an.a === 'kb') return;
      if (!P.warp) { an.rt = an.t / P.k; an.rd = an.d / P.k; return; }
      an.rt = mapw(P.warp, an.t);
      an.rd = an.d > 1.5 ? Math.max(.3, mapw(P.warp, an.t + an.d) - an.rt) : an.d / Math.max(1, P.k);
    });
    P.start = debut; debut += P.dur;
    P.part = d.sp ? d.sp.split('.')[0] : (d.n || null);
    scene.append(P.el); plans.push(P);
  });
  plans.forEach((p, i) => {
    p.sameNext = !!(p.sp && plans[i + 1] && plans[i + 1].sp === p.sp);
    p.samePrev = !!(p.sp && plans[i - 1] && plans[i - 1].sp === p.sp);
  });
  const DUREE = debut + OUT;

  /* Progression par partie */
  const prog = document.querySelector('.prog');
  const segs = PARTIES.map(pa => {
    const ps = plans.filter(p => p.part === pa.n);
    const a = ps[0].start, b = ps[ps.length - 1].start + ps[ps.length - 1].dur;
    const s = $('div', 'seg', `<i></i><b>${V ? 'Partie ' + pa.n : pa.n + ' · ' + ty(pa.court)}</b>`); s.style.setProperty('--c', pa.c); s.style.flex = String(b - a);
    prog.append(s); return { el: s, a, b };
  });
  const volets = plans.filter(p => p.d.tpl === 'partie').map(p => ({ t: p.start, n: p.d.n, c: PARTIES.find(x => x.n === p.d.n).c }));
  const volet = document.getElementById('volet');

  function applique(an, l, p) {
    const el = an.el;
    if (an.a === 'kb') { const q = Math.min(1, Math.max(0, l / (p.dur + OUT))), z = VX ? .14 : .08, m = VX ? 2 : 1; el.style.transform = `scale(${1.03 + z * q}) translate(${an.dx * m * q}%,${an.dy * m * q}%)`; return; }
    let x = (l - an.rt) / an.rd; x = x < 0 ? 0 : x > 1 ? 1 : x; const e = eo(x);
    const r = an.rot || 0;
    switch (an.a) {
      case 'up': el.style.opacity = e; el.style.transform = `translateY(${(1 - e) * 34}px) rotate(${r}deg)`; break;
      case 'down': el.style.opacity = e; el.style.transform = `translateY(${-(1 - e) * 34}px)`; break;
      case 'left': el.style.opacity = e; el.style.transform = `translateX(${-(1 - e) * 40}px)`; break;
      case 'word': el.style.transform = `translateY(${(1 - e) * 105}%)`; break;
      case 'drop': el.style.opacity = Math.min(1, x * 1.7); el.style.transform = `translateY(${-(1 - e) * 26}px) scale(${1.05 - .05 * e}) rotate(${r + (1 - e) * 3}deg)`; break;
      case 'tape': el.style.opacity = x > 0 ? 1 : 0; el.style.transform = `rotate(${r}deg) scaleX(${e})`; break;
      case 'pop': el.style.opacity = x > 0 ? 1 : 0; el.style.transform = `scale(${back(x)})`; break;
      case 'stamp': el.style.opacity = Math.min(1, x * 2); el.style.transform = `rotate(${r}deg) scale(${1.9 - .9 * e})`; break;
      case 'fade': el.style.opacity = e; break;
      case 'mark': el.style.backgroundSize = `${e * 100}% .42em`; break;
      case 'w': el.style.width = (an.v * e) + '%'; break;
      case 'h': el.style.height = (an.v * e) + '%'; break;
      case 'gy': el.style.transform = `scaleY(${eio(x)})`; break;
      case 'gx': el.style.transform = `scaleX(${eio(x)})`; break;
      case 'zoom': el.style.transformOrigin = an.o; el.style.transformBox = 'view-box'; el.style.opacity = x > 0 ? 1 : 0; el.style.transform = `scale(${back(x)})`; break;
      case 'draw': el.style.strokeDasharray = an.len; el.style.strokeDashoffset = an.len * (1 - e); break;
      case 'count': if (an.num != null) el.textContent = an.pre + fmt(an.num * e, an.dec) + an.post; break;
    }
  }

  /* Vertical : le corps commence sous le titre de sous-partie (sur 1 à 3 lignes), puis chaque colonne trop haute est
     agrandie (ou réduite) par zoom de ses blocs pour remplir l'espace entre le titre et le pied. Mesures faites dans l'état final du plan. */
  let vPret = !V;
  const ZOOM_MAX = 1.45;   // agrandissement maximal (lisibilité sur téléphone)
  function vMiseEnPage() {
    vPret = true;
    for (const p of plans) {
      p.el.style.display = 'block';
      for (const an of p.anims) applique(an, p.dur - .01, p);
      const b = p.box.querySelector('.body');
      if (b && p.head) b.style.top = Math.round(p.head.getBoundingClientRect().bottom + 40) + 'px';
      p.echelle = 9;
      p.box.querySelectorAll('.body > .col').forEach(c => {   // zoom des blocs : le texte se recompose dans la largeur
        const ks = [...c.children], z = x => ks.forEach(k => { k.style.zoom = x; }), larges = [...c.querySelectorAll('.stats, .stats b, .bars .row b')],
          tient = () => c.scrollHeight <= c.clientHeight + 1 && larges.every(b => b.scrollWidth <= b.clientWidth + 1);   // chiffres sur une ligne
        let lo = .5, hi = ZOOM_MAX;
        z(hi); if (tient()) lo = hi;
        else for (let n = 0; n < 9; n++) { const m = (lo + hi) / 2; z(m); if (tient()) lo = m; else hi = m; }
        z(lo); p.echelle = Math.min(p.echelle, lo);
      });
      if (p.echelle === 9) p.echelle = 1;
      p.el.style.display = 'none';
    }
  }

  function render(t) {
    if (!vPret) vMiseEnPage();
    for (const p of plans) {
      const l = t - p.start, vis = l >= 0 && l < p.dur + OUT;
      p.el.style.display = vis ? 'block' : 'none';
      if (!vis) continue;
      const fo = l > p.dur ? 1 - (l - p.dur) / OUT : 1, f = eio(Math.max(0, fo));
      p.box.style.opacity = f; p.box.style.translate = VX ? `${-(1 - f) * 70}px 0` : `0 ${-(1 - f) * 16}px`;
      if (p.head) {
        const ein = p.samePrev ? 1 : eo(Math.min(1, Math.max(0, (l - .05) / .7)));
        p.head.style.opacity = (p.sameNext ? 1 : f) * ein;
        p.head.style.transform = p.samePrev ? '' : `translateY(${(1 - ein) * -20}px)`;
      }
      for (const an of p.anims) applique(an, l, p);
    }
    segs.forEach(s => { const q = Math.min(1, Math.max(0, (t - s.a) / (s.b - s.a))); s.el.querySelector('i').style.width = q * 100 + '%'; s.el.classList.toggle('on', t >= s.a && t < s.b); });
    let vx = -101;
    for (const v of volets) { const q = (t - v.t + .55) / 1.1; if (q > 0 && q < 1) { vx = -101 + eio(q) * 202; volet.style.background = v.c; volet.querySelector('b').textContent = v.n; } }
    volet.style.transform = `translateX(${vx}%)`;
  }

  /* Contrôle de mise en page : plans dont un bloc déborde de la zone de contenu */
  function controle() {
    const err = [];
    plans.forEach((p, i) => {
      render(p.start + p.dur - .01);
      if (V) {
        if (p.echelle < .9) err.push(`plan ${i + 1} (${p.sp || p.d.tpl}) : texte réduit à ${Math.round(p.echelle * 100)} % pour tenir en 9:16 (alléger l'écran)`);
        const r9 = p.el.getBoundingClientRect();
        p.el.querySelectorAll('.box *:not(.pt-fond):not(.pt-num)').forEach(k => { const rk = k.getBoundingClientRect(); if (rk.width && (rk.right > r9.right + 2 || rk.bottom > r9.bottom - 90)) err.push(`plan ${i + 1} : élément hors cadre (${k.className || k.tagName})`); });
        p.el.style.display = 'none'; return;
      }
      p.el.querySelectorAll('.body').forEach(b => {
        const r = b.getBoundingClientRect();
        b.querySelectorAll('.col').forEach(c => {
          const rc = c.getBoundingClientRect();
          [...c.children].forEach(k => { const rk = k.getBoundingClientRect(); if (rk.top < rc.top - 2 || rk.bottom > rc.bottom + 2) err.push(`plan ${i + 1} (${p.sp || p.d.tpl}) : colonne trop haute (${Math.round(rc.top - rk.top)} / ${Math.round(rk.bottom - rc.bottom)} px)`); });
        });
        b.querySelectorAll('.blk').forEach(k => { const rk = k.getBoundingClientRect(); if (rk.right > r.right + 2) err.push(`plan ${i + 1} : bloc qui déborde à droite de ${Math.round(rk.right - r.right)} px`); });
      });
      if (p.head) { const rg = document.createRange(); rg.selectNodeContents(p.head.querySelector('h3')); if (rg.getBoundingClientRect().right > p.head.getBoundingClientRect().right + 2) err.push(`plan ${i + 1} : titre de sous-partie trop long`); }
      p.el.style.display = 'none';
    });
    return err;
  }

  const reperes = () => plans.map(p => p.ancres.map(a => [Math.round(a.t * 10) / 10, a.ok || null, a.cues.map(c => sig(norm(c)).slice(0, 2).join(' '))]));
  const debug = i => ({ warp: plans[i].warp, anims: plans[i].anims.filter(a => a.a === "up").map(a => [a.t, a.rt, a.rd, a.el.textContent.slice(0, 20)]) });
  /* Contenu de chaque écran dans l'ordre d'apparition : [instant dans l'écran (s), type, texte] (outils/video/texte-voix.py) */
  function contenu() {
    const TYPES = new Set(['up', 'left', 'down', 'drop']);
    return plans.map(p => {
      render(p.start + p.dur - .01);
      const an = p.anims.filter(x => TYPES.has(x.a) && x.el.nodeType === 1);
      const els = new Set(an.map(x => x.el));
      const r = an.filter(x => ![...els].some(e => e !== x.el && x.el.contains(e)))
        .map(x => [Math.round(x.rt * 10) / 10, x.el.className || x.el.tagName.toLowerCase(), x.el.innerText.replace(/\s+/g, ' ').trim()])
        .sort((a, b) => a[0] - b[0]);
      p.el.style.display = 'none';
      return r;
    });
  }
  window.VIDEO = { render, duree: DUREE, controle, reperes, debug, contenu, plans: plans.map(p => ({ start: p.start, dur: p.dur, sp: p.sp || p.d.tpl })), echelles: () => plans.map(p => p.echelle) };
})();
