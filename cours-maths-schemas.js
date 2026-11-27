/* ══════════════════════════════════════════════════════════════
   Schémas interactifs des chapitres de maths (cours-maths.css).
   Moteur repris de cours-particuliers/schema.js (fiche « La dérivation »).
   <div class="fig" data-schema="secante|reference|trigo" data-titre="…"></div>
   Le script construit le dessin (SVG), les curseurs, les boutons et les
   valeurs lues. Toutes les écritures mathématiques sont en KaTeX (dans le
   SVG par <foreignObject>). Les couleurs viennent du CSS (classes .fig …).
   Ajouter un type = une fonction de dessin et une entrée de TYPES.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── KaTeX ─── */
  function K(tex) {
    if (window.katex) {
      try { return window.katex.renderToString(tex, { throwOnError: false }); } catch (e) { /* repli ci-dessous */ }
    }
    return tex;
  }
  function T(s) {                           /* texte français avec des \( … \) */
    return String(s).replace(/\\\((.+?)\\\)/g, function (_, m) { return K(m); });
  }
  function nb(v, n) {
    if (!isFinite(v)) return '∞';
    n = n == null ? 2 : n;
    var s = (Math.round(v * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n);
    if (/^-0[.,]?0*$/.test(s)) s = s.slice(1);
    return s.replace('.', ',').replace('-', '−');
  }
  function nbT(v, n) { return nb(v, n).replace(',', '{,}').replace('−', '-'); }
  function html(tag, cls, inner) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (inner != null) e.innerHTML = inner;
    return e;
  }

  /* ─── dessin ─── */
  var uid = 0;
  function repere(box, xr, yr) {
    return {
      x0: box[0], y0: box[1], x1: box[2], y1: box[3], cx: 'cm' + (++uid), xr: xr, yr: yr,
      X: function (x) { return box[0] + (x - xr[0]) / (xr[1] - xr[0]) * (box[2] - box[0]); },
      Y: function (y) { return box[3] - (y - yr[0]) / (yr[1] - yr[0]) * (box[3] - box[1]); }
    };
  }
  function axes(r) {
    var xr = r.xr, yr = r.yr;
    var ya = (yr[0] < 0 && yr[1] > 0) ? r.Y(0) : r.y1, xa = (xr[0] < 0 && xr[1] > 0) ? r.X(0) : r.x0;
    return '<line class="ax" x1="' + r.x0 + '" y1="' + ya.toFixed(1) + '" x2="' + r.x1 + '" y2="' + ya.toFixed(1) + '"/>' +
           '<line class="ax" x1="' + xa.toFixed(1) + '" y1="' + r.y1 + '" x2="' + xa.toFixed(1) + '" y2="' + r.y0 + '"/>';
  }
  function clip(r) {
    return '<clipPath id="' + r.cx + '"><rect x="' + r.x0 + '" y="' + (r.y0 - 4) + '" width="' + (r.x1 - r.x0) + '" height="' + (r.y1 - r.y0 + 8) + '"/></clipPath>';
  }
  /* courbe en morceaux : coupée là où f n'est pas définie (trou en 0 pour 1/x…) */
  function courbe(r, f, dom, cls, trou) {
    var d = '', n = 400, a = Math.max(r.xr[0], dom[0]), b = Math.min(r.xr[1], dom[1]), lev = true;
    var haut = r.yr[1] + (r.yr[1] - r.yr[0]), bas = r.yr[0] - (r.yr[1] - r.yr[0]);
    for (var i = 0; i <= n; i++) {
      var x = a + (b - a) * i / n, y = f(x);
      if (trou != null && Math.abs(x - trou) < (b - a) / n * 0.6) { lev = true; continue; }
      if (!isFinite(y) || y > haut || y < bas) { lev = true; continue; }
      d += (lev ? 'M' : 'L') + r.X(x).toFixed(1) + ',' + r.Y(y).toFixed(1);
      lev = false;
    }
    return '<path class="' + (cls || 'cv') + '" d="' + d + '"/>';
  }
  function droite(r, a, fa, m, cls) {
    var xr = r.xr;
    return '<line class="' + cls + '" x1="' + r.X(xr[0]).toFixed(1) + '" y1="' + r.Y(fa + m * (xr[0] - a)).toFixed(1) +
           '" x2="' + r.X(xr[1]).toFixed(1) + '" y2="' + r.Y(fa + m * (xr[1] - a)).toFixed(1) + '"/>';
  }
  function trait(r, x1, y1, x2, y2, cls) {
    return '<line class="' + cls + '" x1="' + r.X(x1).toFixed(1) + '" y1="' + r.Y(y1).toFixed(1) + '" x2="' + r.X(x2).toFixed(1) + '" y2="' + r.Y(y2).toFixed(1) + '"/>';
  }
  function point(r, x, y, cls) {
    return '<circle class="' + (cls || 'pt') + '" cx="' + r.X(x).toFixed(1) + '" cy="' + r.Y(y).toFixed(1) + '" r="8"/>';
  }
  function lbl(x, y, tex, o) {               /* étiquette KaTeX ; (x, y) = ancrage, y au milieu de la ligne */
    o = o || {};
    var w = o.w || 360, h = o.h || 48, an = o.an || 'start';
    var x0 = an === 'end' ? x - w : (an === 'middle' ? x - w / 2 : x);
    var jc = an === 'end' ? 'flex-end' : (an === 'middle' ? 'center' : 'flex-start');
    return '<foreignObject class="fo" x="' + x0.toFixed(1) + '" y="' + (y - h / 2).toFixed(1) + '" width="' + w + '" height="' + h + '">' +
           '<div class="fo-d ' + (o.cls || '') + '" style="justify-content:' + jc + '">' + K(tex) + '</div></foreignObject>';
  }

  /* ─── 1. sécante : de la pente de la sécante au nombre dérivé (f(x) = x², x₀ = 1) ─── */
  function secante(S) {
    var h = S.h, a = 1, b = a + h;
    var f = function (x) { return x * x; };
    var r = repere([70, 24, 930, 300], [-1.6, 3.6], [-1, 9]), fa = f(a), fb = f(b), m = 2 + h;
    var g = '<defs>' + clip(r) + '</defs>' + axes(r) + '<g clip-path="url(#' + r.cx + ')">' +
      courbe(r, f, [-Infinity, Infinity]) + droite(r, a, fa, 2, 'tg') + droite(r, a, fa, m, 'sc') +
      trait(r, a, fa, b, fa, 'gd') + trait(r, b, fa, b, fb, 'gd') +
      point(r, a, fa, 'pt fixe') + point(r, b, fb) + '</g>' +
      lbl(r.X(a) - 16, r.Y(fa) - 26, 'A', { an: 'end', cls: 'b', w: 60 }) +
      lbl(r.X(b) + (h > 0 ? 16 : -16), r.Y(fb) - 22, 'M', { an: h > 0 ? 'start' : 'end', cls: 'o', w: 60 }) +
      lbl((r.X(a) + r.X(b)) / 2, r.Y(fa) + (Math.abs(h) < 0.25 ? 34 : -22), 'h', { an: 'middle', cls: 'g', w: 80 });
    return {
      svg: g,
      infos: [
        { lab: 'Pente de la sécante (AM)', tex: '\\dfrac{f(1+h)-f(1)}{h} = 2 + h = ' + nbT(m, 3), cls: 'o' },
        { lab: 'Pente de la tangente en A', tex: "f'(1) = 2", cls: 'tgt' }
      ],
      note: Math.abs(h) < 0.15 ? '\\(h\\) est presque nul : la sécante se confond presque avec la tangente.'
                               : 'Rapproche \\(h\\) de \\(0\\) : la sécante (orange) se rapproche de la tangente (verte).'
    };
  }

  /* ─── 2. courbes des fonctions de référence ─── */
  var REF = {
    exp:     { tex: 'e^x', f: Math.exp, dom: [-Infinity, Infinity], xr: [-3.2, 3.2], yr: [-1, 8], x: [-3, 2], x0: 1,
               as: [{ y: 0 }], defi: '\\mathbb{R}',
               note: 'Toujours strictement positive et strictement croissante. \\(\\lim_{x \\to -\\infty} e^x = 0\\) (asymptote \\(y = 0\\)) et \\(\\lim_{x \\to +\\infty} e^x = +\\infty\\).' },
    ln:      { tex: '\\ln x', f: Math.log, dom: [1e-6, Infinity], xr: [-0.6, 8], yr: [-3.2, 2.6], x: [0.08, 8], x0: Math.E,
               as: [{ x: 0 }], defi: ']0, +\\infty[',
               note: 'Strictement croissante, \\(\\ln 1 = 0\\) et \\(\\ln e = 1\\). \\(\\lim_{x \\to 0^+} \\ln x = -\\infty\\) (asymptote \\(x = 0\\)) et \\(\\lim_{x \\to +\\infty} \\ln x = +\\infty\\).' },
    carre:   { tex: 'x^2', f: function (x) { return x * x; }, dom: [-Infinity, Infinity], xr: [-3.2, 3.2], yr: [-1, 9], x: [-2.9, 2.9], x0: 1.5,
               as: [], defi: '\\mathbb{R}',
               note: 'Paire : la courbe est symétrique par rapport à l\'axe des ordonnées. Décroissante sur \\(]-\\infty, 0]\\), croissante sur \\([0, +\\infty[\\).' },
    inverse: { tex: '\\dfrac{1}{x}', f: function (x) { return 1 / x; }, dom: [-Infinity, Infinity], trou: 0, xr: [-4.5, 4.5], yr: [-4.5, 4.5], x: [-4, 4], x0: 1,
               as: [], defi: '\\mathbb{R}^*', interdit: 0,
               note: 'Impaire : la courbe est symétrique par rapport à l\'origine. Décroissante sur \\(]-\\infty, 0[\\) et sur \\(]0, +\\infty[\\), mais pas sur \\(\\mathbb{R}^*\\) tout entier.' },
    racine:  { tex: '\\sqrt{x}', f: Math.sqrt, dom: [0, Infinity], xr: [-0.6, 9], yr: [-0.6, 3.6], x: [0, 9], x0: 4,
               as: [], defi: '[0, +\\infty[',
               note: 'Définie en \\(0\\) mais pas dérivable en \\(0\\) : la tangente y est verticale. Croissante sur \\([0, +\\infty[\\).' },
    arctan:  { tex: '\\arctan x', f: Math.atan, dom: [-Infinity, Infinity], xr: [-7, 7], yr: [-2.1, 2.1], x: [-6.5, 6.5], x0: 1,
               as: [{ y: Math.PI / 2, tex: 'y = \\frac{\\pi}{2}' }, { y: -Math.PI / 2, tex: 'y = -\\frac{\\pi}{2}' }], defi: '\\mathbb{R}',
               note: 'Impaire, strictement croissante et bornée : \\(|\\arctan x| < \\frac{\\pi}{2}\\). Deux asymptotes horizontales, \\(y = \\frac{\\pi}{2}\\) et \\(y = -\\frac{\\pi}{2}\\).' }
  };
  var REF_CHOIX = [['exp', 'e^x'], ['ln', '\\ln x'], ['carre', 'x^2'], ['inverse', '\\frac{1}{x}'], ['racine', '\\sqrt{x}'], ['arctan', '\\arctan x']];
  function reference(S) {
    var F = REF[S.f], x = S.x;
    if (F.interdit != null && Math.abs(x - F.interdit) < 0.05) x = S.x = (x < 0 ? -0.05 : 0.05);
    var r = repere([60, 30, 930, 380], F.xr, F.yr), y = F.f(x);
    var g = '<defs>' + clip(r) + '</defs>' + axes(r) + '<g clip-path="url(#' + r.cx + ')">';
    F.as.forEach(function (a) {
      g += a.y != null ? trait(r, F.xr[0], a.y, F.xr[1], a.y, 'as') : trait(r, a.x, F.yr[0], a.x, F.yr[1], 'as');
    });
    g += courbe(r, F.f, F.dom, 'cv', F.trou);
    if (isFinite(y)) g += trait(r, x, 0, x, y, 'gd') + trait(r, 0, y, x, y, 'gd') + point(r, x, y);
    g += '</g>';
    F.as.forEach(function (a) { if (a.tex) g += lbl(r.x1 - 6, r.Y(a.y) + (a.y > 0 ? 22 : -22), a.tex, { an: 'end', cls: 'g sm', w: 200, h: 40 }); });
    g += lbl(r.x0 + 12, r.y0 + 18, 'y = ' + F.tex, { cls: 'b', w: 360 });
    return {
      svg: g,
      infos: [
        { lab: 'Définie sur', tex: F.defi, cls: '' },
        { lab: 'Le point de la courbe', tex: 'x = ' + nbT(x, 2) + ' \\quad f(x) = ' + nbT(y, 3), cls: 'o' }
      ],
      note: F.note
    };
  }

  /* ─── 3. cercle trigonométrique, et courbes de cos et sin ─── */
  var PI = Math.PI;
  function fracPi(n, d) {                    /* n π / d, réduit, en KaTeX */
    if (n === 0) return '0';
    var a = n, b = d;
    while (b) { var t = b; b = a % b; a = t; }
    n /= a; d /= a;
    var num = (n === 1 ? '' : n) + '\\pi';
    return d === 1 ? num : '\\dfrac{' + num + '}{' + d + '}';
  }
  function remarquable(t) {                  /* angle multiple de π/6 ou de π/4 ? */
    var n = Math.round(t * 12 / PI);
    if (Math.abs(t - n * PI / 12) > 1e-6 || (n % 2 && n % 3)) return null;
    return n;
  }
  function exact(v) {                        /* valeur exacte d'un cos ou sin remarquable */
    var m = Math.abs(v), s = v < -1e-9 ? '-' : '';
    var V = [[0, '0'], [0.5, '\\dfrac{1}{2}'], [Math.SQRT1_2, '\\dfrac{1}{\\sqrt{2}}'], [Math.sqrt(3) / 2, '\\dfrac{\\sqrt{3}}{2}'], [1, '1']];
    for (var i = 0; i < V.length; i++) if (Math.abs(m - V[i][0]) < 1e-9) return (V[i][0] === 0 ? '' : s) + V[i][1];
    return null;
  }
  var ANGLES = [0, 2, 3, 4, 6, 12].map(function (n) { return [n * PI / 12, fracPi(n, 12)]; });
  function trigo(S) {
    var t = S.t, c = Math.cos(t), s = Math.sin(t);
    var C = repere([30, 25, 360, 355], [-1.3, 1.3], [-1.3, 1.3]);
    var G = repere([420, 40, 940, 330], [0, 2 * PI], [-1.3, 1.3]);
    var g = axes(C) + '<circle class="cv fin" cx="' + C.X(0) + '" cy="' + C.Y(0) + '" r="' + (C.X(1) - C.X(0)).toFixed(1) + '"/>';
    /* arc de l'angle */
    var ra = 0.28, pa = [];
    for (var i = 0; i <= 40; i++) { var u = t * i / 40; pa.push(C.X(ra * Math.cos(u)).toFixed(1) + ',' + C.Y(ra * Math.sin(u)).toFixed(1)); }
    if (t > 0.02) g += '<polyline class="arc" points="' + pa.join(' ') + '"/>';
    g += trait(C, c, s, c, 0, 'gd') + trait(C, c, s, 0, s, 'gd') +
         trait(C, 0, 0, c, 0, 'seg-c') + trait(C, 0, 0, 0, s, 'seg-s') + trait(C, 0, 0, c, s, 'ray') + point(C, c, s);
    g += lbl(C.X(c * 1.13) + (c >= 0 ? 6 : -6), C.Y(s * 1.13), 'M', { an: c >= 0 ? 'start' : 'end', cls: 'o', w: 50 });
    if (Math.abs(c) > 0.18) g += lbl(C.X(c / 2), C.Y(0) + (s >= 0 ? 26 : -26), '\\cos \\theta', { an: 'middle', cls: 'o sm', w: 140, h: 40 });
    /* « sin θ » de l'autre côté de l'axe que M, loin du rayon OM */
    if (Math.abs(s) > 0.18) g += lbl(C.X(0) + (c >= 0 ? -10 : 10), C.Y(s * 0.6), '\\sin \\theta', { an: c >= 0 ? 'end' : 'start', cls: 'tgt sm', w: 140, h: 40 });
    /* courbes de cos et sin sur [0, 2π] */
    g += axes(G) + courbe(G, Math.cos, [0, 2 * PI], 'cv o2 fin') + courbe(G, Math.sin, [0, 2 * PI], 'cv d2 fin');
    [1, 2, 3, 4].forEach(function (k) {
      var xk = G.X(k * PI / 2);
      g += '<line class="ax" x1="' + xk.toFixed(1) + '" y1="' + (G.Y(0) - 6).toFixed(1) + '" x2="' + xk.toFixed(1) + '" y2="' + (G.Y(0) + 6).toFixed(1) + '"/>' +
           lbl(xk, G.Y(0) + 30, fracPi(k, 2), { an: 'middle', cls: 'g sm', w: 80, h: 46 });
    });
    g += trait(G, t, -1.3, t, 1.3, 'gd') + point(G, t, c) + point(G, t, s, 'pt-t');
    g += lbl(G.x1, G.y0 - 14, '\\color{#c2410c}{\\cos} \\quad \\color{#0f766e}{\\sin}', { an: 'end', cls: 'sm', w: 260, h: 40 });
    var n = remarquable(t), tt = n == null ? nbT(t, 2) : fracPi(n, 12);
    var ce = n == null ? null : exact(c), se = n == null ? null : exact(s);
    return {
      svg: g,
      infos: [
        { lab: 'L\'angle', tex: '\\theta = ' + tt, cls: '' },
        { lab: 'Abscisse de M', tex: '\\cos \\theta = ' + (ce || nbT(c, 3)), cls: 'o' },
        { lab: 'Ordonnée de M', tex: '\\sin \\theta = ' + (se || nbT(s, 3)), cls: 'tgt' }
      ],
      note: 'Le point \\(M\\) du cercle de rayon \\(1\\) a pour coordonnées \\((\\cos \\theta, \\sin \\theta)\\) : d\'où \\(\\cos^2 \\theta + \\sin^2 \\theta = 1\\) et \\(-1 \\leq \\cos \\theta, \\sin \\theta \\leq 1\\).'
    };
  }

  /* ─── fabrique ─── */
  var TYPES = {
    secante: {
      etat: function () { return { h: 1.6 }; },
      ctl: function () { return [{ k: 'h', t: 'range', tex: 'h', min: -1.4, max: 2.4, step: 0.01 }]; },
      draw: secante, hauteur: 340
    },
    reference: {
      etat: function () { return { f: 'exp', x: REF.exp.x0 }; },
      ctl: function (S) {
        var F = REF[S.f];
        return [{ t: 'choix', k: 'f', q: 'Choisis une fonction', opts: REF_CHOIX, apres: function () { S.x = REF[S.f].x0; return true; } },
                { k: 'x', t: 'range', tex: 'x', min: F.x[0], max: F.x[1], step: 0.01 }];
      },
      draw: reference, hauteur: 410
    },
    trigo: {
      etat: function () { return { t: PI / 3 }; },
      ctl: function () {
        return [{ t: 'choix', k: 't', q: 'Angles remarquables', opts: ANGLES },
                { k: 't', t: 'range', tex: '\\theta', min: 0, max: +(2 * PI).toFixed(2), step: 0.01, aimant: ANGLES.map(function (a) { return a[0]; }).concat([5 * PI / 6, 2 * PI / 3, 3 * PI / 4, 7 * PI / 6, 5 * PI / 4, 4 * PI / 3, 3 * PI / 2, 5 * PI / 3, 7 * PI / 4, 11 * PI / 6]) }];
      },
      draw: trigo, hauteur: 380
    }
  };

  function monter(root) {
    var type = root.getAttribute('data-schema'), TT = TYPES[type];
    if (!TT) return;
    var S = TT.etat(), ins = {}, vals = {}, puces = [];
    root.innerHTML = '';
    root.classList.add('fig-i');
    var titre = root.getAttribute('data-titre');
    if (titre) root.appendChild(html('div', 'fig-titre', T(titre)));
    var zone = html('div', 'fig-svg'), infos = html('div', 'fig-info'), ctl = html('div', 'fig-ctl'), note = html('p', 'fig-note');
    root.appendChild(zone); root.appendChild(infos); root.appendChild(ctl); root.appendChild(note);

    function dessiner() {
      var d = TT.draw(S);
      zone.innerHTML = '<svg viewBox="0 0 960 ' + TT.hauteur + '" role="img" aria-label="Schéma interactif">' + d.svg + '</svg>';
      infos.innerHTML = d.infos.map(function (x) {
        return '<span class="fig-i1 ' + x.cls + '"><em>' + x.lab + '</em><b>' + K(x.tex) + '</b></span>';
      }).join('');
      note.innerHTML = T(d.note || '');
    }
    function egal(a, b) { return typeof a === 'number' ? Math.abs(a - b) < 1e-9 : a === b; }
    function synchroniser() {
      Object.keys(ins).forEach(function (k) {
        ins[k].value = S[k];
        if (vals[k]) vals[k].innerHTML = K(ins[k].getAttribute('data-tex') + ' = ' + nbT(+S[k], 2));
      });
      puces.forEach(function (p) { p.bt.setAttribute('aria-pressed', egal(p.v, S[p.k]) ? 'true' : 'false'); });
    }
    function maj() {
      if (S.h != null && Math.abs(S.h) < 0.005) S.h = 0.01;     /* h ≠ 0 */
      synchroniser(); dessiner();
    }
    function construire() {
      var defs = TT.ctl(S);
      ctl.innerHTML = ''; ins = {}; vals = {}; puces = [];
      defs.forEach(function (c) {
        if (c.t === 'choix') {
          var w = html('div', 'fig-c fig-choix', '<span class="fig-q">' + c.q + '</span>');
          var g = html('div', 'fig-seg');
          c.opts.forEach(function (o) {
            var bt = html('button', 'fig-chip', K(o[1]));
            bt.type = 'button';
            bt.addEventListener('click', function () {
              S[c.k] = o[0];
              if (c.apres && c.apres()) construire();
              maj();
            });
            puces.push({ bt: bt, v: o[0], k: c.k });
            g.appendChild(bt);
          });
          w.appendChild(g); ctl.appendChild(w);
        } else {
          var w2 = html('label', 'fig-c fig-range', '<span class="fig-q">Fais glisser le curseur</span><b class="fig-v"></b>');
          var inp = document.createElement('input');
          inp.type = 'range'; inp.min = c.min; inp.max = c.max; inp.step = c.step; inp.value = S[c.k];
          inp.setAttribute('data-tex', c.tex);
          inp.setAttribute('aria-label', 'Curseur ' + c.tex);
          inp.addEventListener('input', function () {
            var v = +inp.value;
            (c.aimant || []).forEach(function (a) { if (Math.abs(v - a) < 0.035) v = a; });
            S[c.k] = v; maj();
          });
          w2.appendChild(inp); ctl.appendChild(w2);
          ins[c.k] = inp; vals[c.k] = w2.querySelector('.fig-v');
        }
      });
    }
    construire(); maj();
  }

  function init() {
    var n = 0;
    function lancer() { Array.prototype.forEach.call(document.querySelectorAll('.fig[data-schema]'), monter); }
    (function attendre() {                   /* KaTeX est chargé avec « defer » */
      if (window.katex || ++n > 100) lancer(); else setTimeout(attendre, 50);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.MathSchema = { monter: monter, init: init };
})();
