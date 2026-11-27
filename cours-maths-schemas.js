/* ══════════════════════════════════════════════════════════════
   Schémas interactifs des chapitres de maths (cours-maths.css).
   Moteur repris de cours-particuliers/schema.js (fiche « La dérivation »).
   <div class="fig" data-schema="secante|reference|trigo|pascal|telescope|produit|transposee|suites|toile|integrale|primitive" data-titre="…"></div>
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


  /* ─── 4. triangle de Pascal : chaque nombre est la somme des deux au-dessus ─── */
  function binom(n, k) {
    if (k < 0 || k > n) return 0;
    var r = 1;
    for (var i = 1; i <= k; i++) r = r * (n - k + i) / i;
    return Math.round(r);
  }
  var PAS_N = 7, PAS_DX = 84, PAS_DY = 52, PAS_W = 820, PAS_CX = 470;
  function pasPos(n, k) { return [PAS_CX + (k - n / 2) * PAS_DX, 34 + n * PAS_DY]; }
  function pascal(S) {
    var n = S.n, k = S.k, g = '', c = pasPos(n, k);
    var par = [[n - 1, k - 1], [n - 1, k]].filter(function (q) { return q[1] >= 0 && q[1] <= q[0]; });
    par.forEach(function (q) {
      var a = pasPos(q[0], q[1]);
      g += '<line class="sc" x1="' + a[0].toFixed(1) + '" y1="' + a[1] + '" x2="' + c[0].toFixed(1) + '" y2="' + c[1] + '"/>';
    });
    for (var i = 0; i <= PAS_N; i++) {
      for (var j = 0; j <= i; j++) {
        var p = pasPos(i, j), sel = (i === n && j === k), pa = par.some(function (q) { return q[0] === i && q[1] === j; });
        g += '<circle class="pas' + (sel ? ' sel' : pa ? ' par' : '') + '" data-clic="' + i + ',' + j + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1] + '" r="23"/>' +
             lbl(p[0], p[1], String(binom(i, j)), { an: 'middle', cls: 'pas-t' + (sel ? ' sel' : pa ? ' par' : ''), w: 60, h: 40 });
      }
      g += lbl(18, pasPos(i, 0)[1], 'n = ' + i, { cls: 'g sm', w: 110, h: 40 });
    }
    var a = binom(n - 1, k - 1), b = binom(n - 1, k);
    var bord = (k === 0 || k === n);
    return {
      svg: g,
      infos: [
        { lab: 'Le nombre choisi', tex: '\\dbinom{' + n + '}{' + k + '} = ' + binom(n, k), cls: '' },
        { lab: 'Formule de Pascal', tex: '\\dbinom{' + (n - 1) + '}{' + (k - 1) + '} + \\dbinom{' + (n - 1) + '}{' + k + '} = ' + a + ' + ' + b + ' = ' + (a + b), cls: 'o' }
      ],
      note: bord ? 'Au bord du triangle, un des deux termes est un \\(\\binom{n-1}{-1}\\) ou un \\(\\binom{n-1}{n}\\), qui vaut \\(0\\) : on retrouve \\(1\\).'
                 : 'Clique sur un nombre (ou utilise les curseurs) : il est la somme des deux nombres situés au-dessus de lui.'
    };
  }

  /* ─── 5. somme télescopique : les termes du milieu s'annulent ─── */
  function telescope(S) {
    var n = S.n, g = '', y0 = 44, dy = 78, xa = 250, xb = 470;
    function frac(k) { return k === 1 ? '1' : '\\dfrac{1}{' + k + '}'; }
    for (var k = 1; k <= n; k++) {
      var y = y0 + (k - 1) * dy, premier = (k === 1), dernier = (k === n);
      g += lbl(40, y, 'k = ' + k, { cls: 'g sm', w: 120, h: 44 });
      g += lbl(xa - 70, y, '\\Big(', { an: 'middle', w: 40, h: 70 }) + lbl(xb + 70, y, '\\Big)', { an: 'middle', w: 40, h: 70 });
      g += lbl(xa, y, frac(k), { an: 'middle', cls: premier ? 'b' : 'barre', w: 90, h: 70 });
      g += lbl((xa + xb) / 2, y, '-', { an: 'middle', w: 40, h: 44 });
      g += lbl(xb, y, frac(k + 1), { an: 'middle', cls: dernier ? 'o' : 'barre', w: 90, h: 70 });
      if (!premier) g += '<line class="bar" x1="' + (xa - 26) + '" y1="' + (y - 18) + '" x2="' + (xa + 26) + '" y2="' + (y + 18) + '"/>';
      if (!dernier) {
        g += '<line class="bar" x1="' + (xb - 26) + '" y1="' + (y - 18) + '" x2="' + (xb + 26) + '" y2="' + (y + 18) + '"/>';
        g += '<line class="gd" x1="' + (xb - 36) + '" y1="' + (y + 26) + '" x2="' + (xa + 36) + '" y2="' + (y + dy - 26) + '"/>';
      }
      if (k < n) g += lbl(xb + 108, y + dy / 2, '+', { an: 'middle', cls: 'g', w: 40, h: 40 });
    }
    var yr = y0 + n * dy - 4;
    g += '<line class="ax" x1="160" y1="' + (yr - 24) + '" x2="580" y2="' + (yr - 24) + '"/>';
    g += lbl(360, yr + 10, 'S_' + n + ' = 1 - \\dfrac{1}{' + (n + 1) + '} = \\dfrac{' + n + '}{' + (n + 1) + '}', { an: 'middle', cls: 'b', w: 520, h: 60 });
    return {
      svg: g,
      hauteur: yr + 50,
      infos: [
        { lab: 'Le premier terme', tex: '1', cls: 'b' },
        { lab: 'Le dernier terme', tex: '-\\dfrac{1}{' + (n + 1) + '}', cls: 'o' }
      ],
      note: 'Chaque \\(-\\frac{1}{k+1}\\) d\'une ligne s\'annule avec le \\(+\\frac{1}{k+1}\\) de la ligne suivante (en pointillés) : il ne reste que le premier et le dernier terme.'
    };
  }


  /* ─── 6. matrices : dessin d'un tableau de coefficients ─── */
  var MCW = 66, MCH = 54;
  function matrice(M, x0, y0, o) {          /* o.on(i, j) → classe de la case ; o.clic : préfixe de data-clic */
    o = o || {};
    var n = M.length, p = M[0].length, g = '', h = n * MCH, w = p * MCW;
    for (var i = 0; i < n; i++) for (var j = 0; j < p; j++) {
      var c = o.on ? o.on(i, j) : '', x = x0 + j * MCW, y = y0 + i * MCH;
      g += '<rect class="cel ' + c + '"' + (o.clic ? ' data-clic="' + o.clic + ',' + i + ',' + j + '"' : '') + ' x="' + (x + 3) + '" y="' + (y + 3) + '" width="' + (MCW - 6) + '" height="' + (MCH - 6) + '" rx="8"/>' +
           lbl(x + MCW / 2, y + MCH / 2, String(M[i][j]).replace('-', '-'), { an: 'middle', cls: 'cel-t ' + c, w: MCW, h: MCH });
    }
    /* parenthèses */
    g += '<path class="par-m" d="M' + (x0 - 2) + ',' + (y0 + 4) + ' q-14,' + (h / 2 - 4) + ' 0,' + (h - 8) + '"/>' +
         '<path class="par-m" d="M' + (x0 + w + 2) + ',' + (y0 + 4) + ' q14,' + (h / 2 - 4) + ' 0,' + (h - 8) + '"/>';
    return g;
  }
  function signe(v) { return v < 0 ? '(' + v + ')' : String(v); }

  /* produit matriciel en tableau : B en haut, A à gauche, C = A × B dans le tableau */
  var PA = [[1, 2, 3], [0, -1, 2]], PB = [[2, 1], [0, 3], [1, -1]];
  function produit(S) {
    var i = S.i, j = S.j, r = PB.length;
    var C = PA.map(function (l) { return PB[0].map(function (_, c) { var t = 0; for (var k = 0; k < r; k++) t += l[k] * PB[k][c]; return t; }); });
    var xb = 330, yb = 46, xa = xb - 3 * MCW - 40, ya = yb + r * MCH + 34;
    var g = '';
    g += lbl(xb + 2 * MCW + 28, yb + r * MCH / 2, 'B', { cls: 'b', w: 60 });
    g += lbl(xa - 28, ya + MCH, 'A', { an: 'end', cls: 'b', w: 60 });
    g += lbl(xb + 2 * MCW + 28, ya + MCH, 'C = A \\times B', { cls: 'b', w: 220 });
    g += '<line class="as" x1="' + (xb - 20) + '" y1="' + (yb - 10) + '" x2="' + (xb - 20) + '" y2="' + (ya + 2 * MCH + 6) + '"/>' +
         '<line class="as" x1="' + (xa - 10) + '" y1="' + (ya - 17) + '" x2="' + (xb + 2 * MCW + 16) + '" y2="' + (ya - 17) + '"/>';
    g += matrice(PB, xb, yb, { on: function (a, b) { return b === j ? 'lu' : ''; } });
    g += matrice(PA, xa, ya, { on: function (a) { return a === i ? 'lu' : ''; } });
    g += matrice(C, xb, ya, { clic: 'c', on: function (a, b) { return a === i && b === j ? 'sel' : 'vide'; } });
    var termes = [], nums = [];
    for (var k = 0; k < r; k++) { termes.push('a_{' + (i + 1) + (k + 1) + '}b_{' + (k + 1) + (j + 1) + '}'); nums.push(signe(PA[i][k]) + ' \\times ' + signe(PB[k][j])); }
    return {
      svg: g,
      infos: [
        { lab: 'Le coefficient choisi', tex: 'c_{' + (i + 1) + (j + 1) + '} = ' + termes.join(' + '), cls: '' },
        { lab: 'Le calcul', tex: nums.join(' + ') + ' = ' + C[i][j], cls: 'o' }
      ],
      note: 'Clique sur une case de \\(C\\) : on la remplit avec la ligne de \\(A\\) à sa gauche et la colonne de \\(B\\) au-dessus d\'elle, terme à terme. \\(A\\) a \\(3\\) colonnes et \\(B\\) a \\(3\\) lignes : le produit est possible.'
    };
  }

  /* transposée : le coefficient (i, j) de A devient le coefficient (j, i) de tA */
  var TA = [[1, 2, 3], [4, 5, 6]];
  function transposee(S) {
    var i = S.i, j = S.j, t = TA[0].map(function (_, c) { return TA.map(function (l) { return l[c]; }); });
    var xa = 90, ya = 80, xt = 450, yt = 40, g = '';
    g += lbl(xa + 1.5 * MCW, ya - 30, 'A \\in \\mathcal{M}_{2,3}(\\mathbb{R})', { an: 'middle', cls: 'b sm', w: 300, h: 40 });
    g += lbl(xt + MCW, yt + 3 * MCH + 30, '{}^tA \\in \\mathcal{M}_{3,2}(\\mathbb{R})', { an: 'middle', cls: 'b sm', w: 300, h: 40 });
    g += '<line class="as" x1="' + (xa + 6) + '" y1="' + (ya + 6) + '" x2="' + (xa + 2 * MCW + 30) + '" y2="' + (ya + 2 * MCH + 30) + '"/>';
    g += matrice(TA, xa, ya, { clic: 'a', on: function (a, b) { return a === i && b === j ? 'sel' : (a === b ? 'diag' : ''); } });
    g += matrice(t, xt, yt, { clic: 't', on: function (a, b) { return a === j && b === i ? 'lu' : (a === b ? 'diag' : ''); } });
    g += '<path class="sc" d="M' + (xa + 3 * MCW + 26) + ',' + (ya + MCH) + ' C' + (xa + 3 * MCW + 90) + ',' + (ya + MCH - 40) + ' ' + (xt - 90) + ',' + (yt + 1.5 * MCH - 40) + ' ' + (xt - 26) + ',' + (yt + 1.5 * MCH) + '" marker-end="url(#fl-t)"/>';
    g = '<defs><marker id="fl-t" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#c2410c"/></marker></defs>' + g;
    return {
      svg: g,
      infos: [
        { lab: 'Dans A', tex: 'a_{' + (i + 1) + ',' + (j + 1) + '} = ' + TA[i][j], cls: 'b' },
        { lab: 'Dans la transposée', tex: '({}^tA)_{' + (j + 1) + ',' + (i + 1) + '} = ' + TA[i][j], cls: 'o' }
      ],
      note: 'Clique sur un coefficient : la ligne \\(' + (i + 1) + '\\) de \\(A\\) devient la colonne \\(' + (i + 1) + '\\) de \\({}^tA\\). Les coefficients diagonaux (en couleur pâle) ne bougent pas.'
    };
  }


  /* ─── 7. suites : les termes u_n pour n de 0 à 20 ─── */
  function suites(S) {
    var q = S.q, geo = S.t === 'geo', xr = [-0.8, 20.8], yr = [-3, 5];
    var r = repere([70, 20, 930, 300], xr, yr), u = [], g = '';
    u[0] = geo ? 1 : 0;
    for (var n = 1; n <= 20; n++) u[n] = geo ? u[n - 1] * q : q * u[n - 1] + 1;
    var conv = geo ? (Math.abs(q) < 1 || Math.abs(q - 1) < 1e-9) : Math.abs(q) < 1;
    var lim = geo ? (Math.abs(q - 1) < 1e-9 ? 1 : 0) : 1 / (1 - q);
    g += '<defs>' + clip(r) + '</defs>' + axes(r);
    [5, 10, 15, 20].forEach(function (k) {
      g += '<line class="ax" x1="' + r.X(k).toFixed(1) + '" y1="' + (r.Y(0) - 6).toFixed(1) + '" x2="' + r.X(k).toFixed(1) + '" y2="' + (r.Y(0) + 6).toFixed(1) + '"/>' +
           lbl(r.X(k), r.Y(0) + 26, String(k), { an: 'middle', cls: 'g sm', w: 60, h: 36 });
    });
    g += '<g clip-path="url(#' + r.cx + ')">';
    if (conv) g += trait(r, xr[0], lim, xr[1], lim, 'gd');
    for (var k = 0; k <= 20; k++) if (isFinite(u[k]) && u[k] > yr[0] - 1 && u[k] < yr[1] + 1) g += point(r, k, u[k], 'pt-s');
    g += '</g>';
    g += lbl(r.x1, r.Y(0) - 22, 'n', { an: 'end', cls: 'g sm', w: 40, h: 36 });
    if (conv && (!geo || lim !== 0)) g += lbl(r.x1 - 6, r.Y(lim) - 22, (geo ? '' : '\\ell = ') + nbT(lim, 2), { an: 'end', cls: 'b sm', w: 200, h: 36 });
    var verdict, qt = nbT(q, 2);
    if (geo) verdict = Math.abs(q - 1) < 1e-9 ? 'q = 1 : \\text{ suite constante, limite } 1' : (Math.abs(q) < 1 ? '|q| < 1 : \\text{ converge vers } 0' : (q > 1 ? 'q > 1 : \\text{ diverge vers } +\\infty' : 'q \\leq -1 : \\text{ pas de limite}'));
    else verdict = Math.abs(q) < 1 ? '|a| < 1 : \\text{ converge vers } \\ell = \\tfrac{1}{1-a} = ' + nbT(lim, 2) : (Math.abs(q - 1) < 1e-9 ? 'a = 1 : u_n = n \\text{, diverge vers } +\\infty' : (q > 1 ? 'a > 1 : \\text{ diverge vers } +\\infty' : 'a \\leq -1 : \\text{ pas de limite}'));
    return {
      svg: g,
      infos: [
        { lab: 'La suite', tex: geo ? 'u_0 = 1, \\quad u_{n+1} = ' + qt + '\\, u_n' : 'u_0 = 0, \\quad u_{n+1} = ' + qt + '\\, u_n + 1', cls: '' },
        { lab: 'Son comportement', tex: verdict, cls: conv ? 'b' : 'o' }
      ],
      note: geo ? 'Les points sont les termes \\(u_n = q^n\\). Au-delà de \\(|q| = 1\\), ils sortent vite du cadre ou oscillent sans se rapprocher d\'une valeur.'
                : 'Le pointillé est le point fixe \\(\\ell\\), solution de \\(\\ell = a\\ell + 1\\). Pour \\(|a| < 1\\), \\(u_n - \\ell\\) est géométrique de raison \\(a\\) et tend vers \\(0\\).'
    };
  }

  /* ─── 8. suite u_{n+1} = f(u_n) : l'escalier (ou l'escargot) ─── */
  var TOILE = {
    racine: { tex: '\\sqrt{x+2}', f: function (x) { return Math.sqrt(x + 2); }, dom: [-2, Infinity], xr: [-0.6, 3.4], u: [-2, 3.3], u0: 0,
              note: 'L\'escalier monte vers l\'intersection avec \\(y = x\\) : la limite vérifie \\(L = \\sqrt{L + 2}\\), d\'où \\(L^2 = L + 2\\) et \\(L = 2\\) (l\'autre solution, \\(-1\\), est négative).' },
    inverse: { tex: '1 + \\dfrac{1}{x}', f: function (x) { return 1 + 1 / x; }, dom: [0.05, Infinity], xr: [0, 3.4], u: [0.35, 3.3], u0: 0.5,
              note: 'Ici les termes tournent autour de la limite (en escargot). \\(L = 1 + \\frac{1}{L}\\) donne \\(L^2 - L - 1 = 0\\), dont la solution positive est \\(L = \\frac{1 + \\sqrt{5}}{2} \\approx 1{,}618\\).' },
    carre:  { tex: 'x^2', f: function (x) { return x * x; }, dom: [-Infinity, Infinity], xr: [-0.15, 1.7], u: [0, 1.25], u0: 0.9,
              note: '\\(L = L^2\\) a deux solutions, \\(0\\) et \\(1\\). Si \\(0 \\leq u_0 < 1\\), la suite tend vers \\(0\\) ; si \\(u_0 > 1\\), elle tend vers \\(+\\infty\\) : l\'équation donne les limites possibles, pas l\'existence.' }
  };
  var TOILE_CHOIX = [['racine', 'f(x) = \\sqrt{x+2}'], ['inverse', 'f(x) = 1 + \\frac{1}{x}'], ['carre', 'f(x) = x^2']];
  function toile(S) {
    var F = TOILE[S.f], u = S.u0, xr = F.xr;
    var r = repere([250, 16, 710, 476], xr, xr), g = '<defs>' + clip(r) + '</defs>' + axes(r) + '<g clip-path="url(#' + r.cx + ')">';
    g += trait(r, xr[0], xr[0], xr[1], xr[1], 'as') + courbe(r, F.f, F.dom);
    var d = 'M' + r.X(u).toFixed(1) + ',' + r.Y(0).toFixed(1), vals = [u];
    for (var k = 0; k < 14; k++) {
      var v = F.f(u);
      if (!isFinite(v) || v > xr[1] * 4) break;
      d += ' L' + r.X(u).toFixed(1) + ',' + r.Y(v).toFixed(1) + ' L' + r.X(v).toFixed(1) + ',' + r.Y(v).toFixed(1);
      u = v; vals.push(v);
    }
    g += '<path class="tl" d="' + d + '"/>' + point(r, vals[0], 0) + '</g>';
    g += lbl(r.X(vals[0]), r.Y(0) + 24, 'u_0', { an: 'middle', cls: 'o sm', w: 60, h: 36 });
    g += lbl(r.x1 + 8, r.Y(xr[1] * 0.96), 'y = x', { cls: 'g sm', w: 120, h: 36 });
    g += lbl(r.x1 + 8, r.y0 + 60, 'y = ' + F.tex, { cls: 'b sm', w: 240, h: 50 });
    return {
      svg: g,
      infos: vals.slice(0, 5).map(function (x, i) { return { lab: i === 0 ? 'Les premiers termes' : ' ', tex: 'u_' + i + ' \\approx ' + nbT(x, 3), cls: i === 0 ? 'o' : '' }; }),
      note: F.note
    };
  }


  /* ─── 9. intégrales : aire algébrique, primitive F(x) = ∫ f ─── */
  function aires(r, f, a, b) {               /* polygones de la partie positive et de la partie négative */
    var n = 160, lo = Math.min(a, b), hi = Math.max(a, b), pos = [], neg = [];
    for (var i = 0; i <= n; i++) {
      var x = lo + (hi - lo) * i / n, y = f(x);
      pos.push(r.X(x).toFixed(1) + ',' + r.Y(Math.max(y, 0)).toFixed(1));
      neg.push(r.X(x).toFixed(1) + ',' + r.Y(Math.min(y, 0)).toFixed(1));
    }
    var b0 = r.X(hi).toFixed(1) + ',' + r.Y(0).toFixed(1) + ' ' + r.X(lo).toFixed(1) + ',' + r.Y(0).toFixed(1);
    return '<polygon class="ai-p" points="' + pos.join(' ') + ' ' + b0 + '"/><polygon class="ai-n" points="' + neg.join(' ') + ' ' + b0 + '"/>';
  }
  var INTF = {
    carre: { tex: 't^2', Ftex: '\\frac{t^3}{3}', f: function (t) { return t * t; }, F: function (t) { return t * t * t / 3; }, xr: [-2, 2.6], yr: [-1, 5.5], a: -1, b: 2,
             note: '\\(t^2 \\geq 0\\) : l\'intégrale est l\'aire sous la courbe. Si \\(a > b\\), elle change de signe : \\(\\int_a^b = -\\int_b^a\\).' },
    sin:   { tex: '\\sin t', Ftex: '-\\cos t', f: Math.sin, F: function (t) { return -Math.cos(t); }, xr: [-1, 7], yr: [-1.6, 1.6], a: 0, b: 4.5,
             note: 'L\'aire au-dessus de l\'axe compte en plus (vert), celle au-dessous en moins (rose) : sur \\([0, 2\\pi]\\), elles se compensent et l\'intégrale est nulle.' },
    cube:  { tex: 't^3 - 3t', Ftex: '\\frac{t^4}{4} - \\frac{3t^2}{2}', f: function (t) { return t * t * t - 3 * t; }, F: function (t) { return t * t * t * t / 4 - 1.5 * t * t; }, xr: [-2.3, 2.3], yr: [-3, 3], a: -1.5, b: 1.5,
             note: 'La fonction est impaire : sur un intervalle symétrique \\([-a, a]\\), les deux aires sont égales et de signes contraires, l\'intégrale est nulle.' }
  };
  var INT_CHOIX = [['carre', 'f(t) = t^2'], ['sin', 'f(t) = \\sin t'], ['cube', 'f(t) = t^3 - 3t']];
  function integrale(S) {
    var F = INTF[S.f], a = S.a, b = S.b;
    var r = repere([60, 20, 930, 330], F.xr, F.yr), g = '<defs>' + clip(r) + '</defs>' + axes(r) + '<g clip-path="url(#' + r.cx + ')">';
    g += aires(r, F.f, a, b) + courbe(r, F.f, [-Infinity, Infinity]);
    g += trait(r, a, 0, a, F.f(a), 'gd') + trait(r, b, 0, b, F.f(b), 'gd') + '</g>';
    g += lbl(r.X(a), r.Y(0) + (F.f(a) >= 0 ? 24 : -24), 'a', { an: 'middle', cls: 'o', w: 40, h: 36 });
    g += lbl(r.X(b), r.Y(0) + (F.f(b) >= 0 ? 24 : -24), 'b', { an: 'middle', cls: 'o', w: 40, h: 36 });
    g += lbl(r.x0 + 12, r.y0 + 18, 'f(t) = ' + F.tex, { cls: 'b', w: 360 });
    var v = F.F(b) - F.F(a);
    return {
      svg: g,
      infos: [
        { lab: 'Une primitive', tex: 'F(t) = ' + F.Ftex, cls: '' },
        { lab: 'L\'intégrale', tex: '\\int_{' + nbT(a, 2) + '}^{' + nbT(b, 2) + '} f(t)\\,dt = F(b) - F(a) \\approx ' + nbT(v, 3), cls: v >= 0 ? 'b' : 'o' }
      ],
      note: F.note
    };
  }
  var PRIM = {
    cos: { tex: '\\cos t', Ftex: '\\sin x', f: Math.cos, F: Math.sin, xr: [-0.3, 6.6], yr: [-1.4, 1.4], x: [0, 6.3], x0: 1 },
    lin: { tex: '1 - t', Ftex: 'x - \\frac{x^2}{2}', f: function (t) { return 1 - t; }, F: function (t) { return t - t * t / 2; }, xr: [-0.3, 3.2], yr: [-2.3, 1.4], x: [0, 3], x0: 0.6 }
  };
  var PRIM_CHOIX = [['cos', 'f(t) = \\cos t'], ['lin', 'f(t) = 1 - t']];
  function primitive(S) {
    var P = PRIM[S.f], x = S.x;
    var L = repere([40, 40, 450, 330], P.xr, P.yr), Rr = repere([520, 40, 930, 330], P.xr, P.yr);
    var fx = P.f(x), Fx = P.F(x), g = '<defs>' + clip(L) + clip(Rr) + '</defs>' + axes(L) + axes(Rr);
    g += '<g clip-path="url(#' + L.cx + ')">' + aires(L, P.f, 0, x) + courbe(L, P.f, [-Infinity, Infinity]) + trait(L, x, 0, x, fx, 'gd') + point(L, x, fx) + '</g>';
    g += '<g clip-path="url(#' + Rr.cx + ')">' + courbe(Rr, P.F, [-Infinity, Infinity], 'cv d2') + droite(Rr, x, Fx, fx, 'sc') + trait(Rr, x, 0, x, Fx, 'gd') +
         '<circle class="pt-t" cx="' + Rr.X(x).toFixed(1) + '" cy="' + Rr.Y(Fx).toFixed(1) + '" r="8"/></g>';
    g += lbl(50, 22, 'f(t) = ' + P.tex, { cls: 'b sm', w: 380, h: 40 }) + lbl(530, 22, 'F(x) = \\int_0^x f(t)\\,dt = ' + P.Ftex, { cls: 'tgt sm', w: 420, h: 40 });
    return {
      svg: g,
      infos: [
        { lab: 'L\'aire coloriée à gauche', tex: 'F(' + nbT(x, 2) + ') \\approx ' + nbT(Fx, 3), cls: 'tgt' },
        { lab: 'La pente de la tangente à droite', tex: 'F\'(' + nbT(x, 2) + ') = f(' + nbT(x, 2) + ') \\approx ' + nbT(fx, 3), cls: 'o' }
      ],
      note: 'Quand \\(x\\) avance, l\'aire grandit à la vitesse \\(f(x)\\) : c\'est \\(F\'(x) = f(x)\\). Là où \\(f\\) est négative, l\'aire compte en moins et \\(F\\) décroît.'
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
    },
    pascal: {
      etat: function () { return { n: 5, k: 2 }; },
      ctl: function () { return [{ k: 'n', t: 'range', tex: 'n', min: 1, max: PAS_N, step: 1 }, { k: 'k', t: 'range', tex: 'k', min: 0, max: PAS_N, step: 1 }]; },
      norm: function (S) { if (S.n < 1) S.n = 1; if (S.k > S.n) S.k = S.n; },
      clic: function (S, v) { var q = v.split(','); if (+q[0] >= 1) { S.n = +q[0]; S.k = +q[1]; } },
      draw: pascal, hauteur: 430, largeur: PAS_W
    },
    telescope: {
      etat: function () { return { n: 4 }; },
      ctl: function () { return [{ k: 'n', t: 'range', tex: 'n', min: 2, max: 6, step: 1 }]; },
      draw: telescope, hauteur: 400, largeur: 720
    },
    produit: {
      etat: function () { return { i: 0, j: 1 }; },
      ctl: function () { return []; },
      clic: function (S, v) { var q = v.split(','); S.i = +q[1]; S.j = +q[2]; },
      draw: produit, hauteur: 360, largeur: 720
    },
    transposee: {
      etat: function () { return { i: 0, j: 2 }; },
      ctl: function () { return []; },
      clic: function (S, v) { var q = v.split(','); if (q[0] === 'a') { S.i = +q[1]; S.j = +q[2]; } else { S.i = +q[2]; S.j = +q[1]; } },
      draw: transposee, hauteur: 300, largeur: 720
    },
    suites: {
      etat: function () { return { t: 'geo', q: 0.8 }; },
      ctl: function (S) {
        return [{ t: 'choix', k: 't', q: 'Choisis une suite', opts: [['geo', '\\text{géométrique}'], ['ag', '\\text{arithmético-géométrique}']], apres: function () { return true; } },
                { k: 'q', t: 'range', tex: S.t === 'geo' ? 'q' : 'a', min: -1.5, max: 1.5, step: 0.05, aimant: [-1, -0.5, 0, 0.5, 1] }];
      },
      draw: suites, hauteur: 330
    },
    toile: {
      etat: function () { return { f: 'racine', u0: 0 }; },
      ctl: function (S) {
        var F = TOILE[S.f];
        return [{ t: 'choix', k: 'f', q: 'Choisis la fonction', opts: TOILE_CHOIX, apres: function () { S.u0 = TOILE[S.f].u0; return true; } },
                { k: 'u0', t: 'range', tex: 'u_0', min: F.u[0], max: F.u[1], step: 0.01 }];
      },
      draw: toile, hauteur: 520
    },
    integrale: {
      etat: function () { return { f: 'sin', a: INTF.sin.a, b: INTF.sin.b }; },
      ctl: function (S) {
        var F = INTF[S.f];
        return [{ t: 'choix', k: 'f', q: 'Choisis une fonction', opts: INT_CHOIX, apres: function () { S.a = INTF[S.f].a; S.b = INTF[S.f].b; return true; } },
                { k: 'a', t: 'range', tex: 'a', min: F.xr[0] + 0.1, max: F.xr[1] - 0.1, step: 0.05 },
                { k: 'b', t: 'range', tex: 'b', min: F.xr[0] + 0.1, max: F.xr[1] - 0.1, step: 0.05 }];
      },
      draw: integrale, hauteur: 360
    },
    primitive: {
      etat: function () { return { f: 'cos', x: 1 }; },
      ctl: function (S) {
        var P = PRIM[S.f];
        return [{ t: 'choix', k: 'f', q: 'Choisis une fonction', opts: PRIM_CHOIX, apres: function () { S.x = PRIM[S.f].x0; return true; } },
                { k: 'x', t: 'range', tex: 'x', min: P.x[0], max: P.x[1], step: 0.02 }];
      },
      draw: primitive, hauteur: 350
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
      zone.innerHTML = '<svg viewBox="0 0 ' + (TT.largeur || 960) + ' ' + (d.hauteur || TT.hauteur) + '" role="img" aria-label="Schéma interactif">' + d.svg + '</svg>';
      infos.innerHTML = d.infos.map(function (x) {
        return '<span class="fig-i1 ' + x.cls + '"><em>' + x.lab + '</em><b>' + K(x.tex) + '</b></span>';
      }).join('');
      note.innerHTML = T(d.note || '');
    }
    function egal(a, b) { return typeof a === 'number' ? Math.abs(a - b) < 1e-9 : a === b; }
    function synchroniser() {
      Object.keys(ins).forEach(function (k) {
        ins[k].value = S[k];
        if (vals[k]) vals[k].innerHTML = K(ins[k].getAttribute('data-tex') + ' = ' + (+ins[k].step >= 1 ? String(S[k]) : nbT(+S[k], 2)));
      });
      puces.forEach(function (p) { p.bt.setAttribute('aria-pressed', egal(p.v, S[p.k]) ? 'true' : 'false'); });
    }
    function maj() {
      if (S.h != null && Math.abs(S.h) < 0.005) S.h = 0.01;     /* h ≠ 0 */
      if (TT.norm) TT.norm(S);
      synchroniser(); dessiner();
    }
    if (TT.clic) zone.addEventListener('click', function (e) {
      var c = e.target.closest ? e.target.closest('[data-clic]') : null;
      if (c) { TT.clic(S, c.getAttribute('data-clic')); maj(); }
    });
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
