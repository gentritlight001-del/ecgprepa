/* ══════════════════════════════════════════════════════════════
   Schémas interactifs des fiches de cours particuliers.
   Un schéma = <div class="fig" data-schema="secante|tangente|derivee|variations"
   data-titre="…"></div> : le script construit le dessin (SVG), les curseurs
   et les valeurs lues. Les couleurs viennent du CSS (fiche.css, classes .fig …).
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  /* fonctions proposées : f, f', domaine, fenêtre du dessin, plages de a et de h */
  var FUN = {
    carre:   { nom: 'x²',   dnom: '2x',      f: function (x) { return x * x; },     d: function (x) { return 2 * x; },
               dom: [-Infinity, Infinity], xr: [-3, 3],   yr: [-1, 9],    a: [-2.5, 2.5], a0: 1,   h0: 1.5, hm: 3,
               dxr: [-3, 3], dyr: [-6.5, 6.5] },
    cube:    { nom: 'x³',   dnom: '3x²',     f: function (x) { return x * x * x; }, d: function (x) { return 3 * x * x; },
               dom: [-Infinity, Infinity], xr: [-2.5, 2.5], yr: [-9, 9],   a: [-2, 2],     a0: 1,   h0: 1,   hm: 2,
               dxr: [-2.5, 2.5], dyr: [-1, 20] },
    racine:  { nom: '√x',   dnom: '1 ÷ (2√x)', f: function (x) { return Math.sqrt(x); }, d: function (x) { return 1 / (2 * Math.sqrt(x)); },
               dom: [0, Infinity], xr: [0, 9],  yr: [-0.3, 3.6], a: [0.6, 8],   a0: 2,   h0: 2,   hm: 3,
               dxr: [0, 9], dyr: [-0.1, 1.6] },
    inverse: { nom: '1/x',  dnom: '−1 ÷ x²', f: function (x) { return 1 / x; },    d: function (x) { return -1 / (x * x); },
               dom: [0.0001, Infinity], xr: [0, 6], yr: [-0.3, 5.5], a: [0.6, 5],   a0: 1.5, h0: 1.5, hm: 3,
               dxr: [0, 6], dyr: [-5.5, 0.6] }
  };
  var CHOIX = [['carre', 'x²'], ['cube', 'x³'], ['racine', '√x'], ['inverse', '1/x']];

  function fmt(v, n) {
    if (!isFinite(v)) return '∞';
    n = n == null ? 2 : n;
    var s = (Math.round(v * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n);
    return s.replace('.', ',').replace('-', '−');
  }
  function html(tag, cls, inner) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (inner != null) e.innerHTML = inner;
    return e;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* repère : pavé (x0, y0, x1, y1) de la vue, fenêtre xr × yr */
  function repere(box, xr, yr) {
    var r = {
      x0: box[0], y0: box[1], x1: box[2], y1: box[3],
      X: function (x) { return box[0] + (x - xr[0]) / (xr[1] - xr[0]) * (box[2] - box[0]); },
      Y: function (y) { return box[3] - (y - yr[0]) / (yr[1] - yr[0]) * (box[3] - box[1]); }
    };
    r.cx = 'c' + (++uid);
    return r;
  }
  function axes(r, xr, yr) {
    var ya = (yr[0] < 0 && yr[1] > 0) ? r.Y(0) : r.y1;
    var xa = (xr[0] < 0 && xr[1] > 0) ? r.X(0) : r.x0;
    return '<line class="ax" x1="' + r.x0 + '" y1="' + ya.toFixed(1) + '" x2="' + r.x1 + '" y2="' + ya.toFixed(1) + '"/>' +
           '<line class="ax" x1="' + xa.toFixed(1) + '" y1="' + r.y1 + '" x2="' + xa.toFixed(1) + '" y2="' + r.y0 + '"/>';
  }
  function clip(r) {
    return '<clipPath id="' + r.cx + '"><rect x="' + r.x0 + '" y="' + (r.y0 - 4) + '" width="' + (r.x1 - r.x0) + '" height="' + (r.y1 - r.y0 + 8) + '"/></clipPath>';
  }
  function courbe(r, f, xr, dom, cls) {
    var pts = [], n = 240, a = Math.max(xr[0], dom[0]), b = Math.min(xr[1], dom[1]);
    for (var i = 0; i <= n; i++) {
      var x = a + (b - a) * i / n, y = f(x);
      if (isFinite(y)) pts.push(r.X(x).toFixed(1) + ',' + r.Y(y).toFixed(1));
    }
    return '<polyline class="' + (cls || 'cv') + '" points="' + pts.join(' ') + '"/>';
  }
  function droite(r, xr, a, fa, m, cls) {
    var xa = xr[0], xb = xr[1];
    return '<line class="' + cls + '" x1="' + r.X(xa).toFixed(1) + '" y1="' + r.Y(fa + m * (xa - a)).toFixed(1) +
           '" x2="' + r.X(xb).toFixed(1) + '" y2="' + r.Y(fa + m * (xb - a)).toFixed(1) + '"/>';
  }
  function point(r, x, y, cls) {
    return '<circle class="' + (cls || 'pt') + '" cx="' + r.X(x).toFixed(1) + '" cy="' + r.Y(y).toFixed(1) + '" r="8"/>';
  }
  function txt(x, y, cls, s, anchor) {
    return '<text class="t ' + (cls || '') + '" x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"' + (anchor ? ' text-anchor="' + anchor + '"' : '') + '>' + s + '</text>';
  }

  /* ─── 1. sécante : du taux de variation au nombre dérivé ─── */
  function secante(S) {
    var F = FUN[S.f], a = S.a, h = S.h, b = a + h;
    var r = repere([70, 24, 930, 300], F.xr, F.yr), fa = F.f(a), fb = F.f(b), m = (fb - fa) / h, d = F.d(a);
    var g = '<defs>' + clip(r) + '</defs>' + axes(r, F.xr, F.yr) + '<g clip-path="url(#' + r.cx + ')">' +
      courbe(r, F.f, F.xr, F.dom) + droite(r, F.xr, a, fa, d, 'tg') + droite(r, F.xr, a, fa, m, 'sc') +
      '<line class="gd" x1="' + r.X(a).toFixed(1) + '" y1="' + r.Y(fa).toFixed(1) + '" x2="' + r.X(b).toFixed(1) + '" y2="' + r.Y(fa).toFixed(1) + '"/>' +
      '<line class="gd" x1="' + r.X(b).toFixed(1) + '" y1="' + r.Y(fa).toFixed(1) + '" x2="' + r.X(b).toFixed(1) + '" y2="' + r.Y(fb).toFixed(1) + '"/>' +
      point(r, a, fa, 'pt fixe') + point(r, b, fb) + '</g>' +
      txt(r.X(a) - 12, r.Y(fa) - 14, 'b', 'A', 'end') + txt(r.X(b) + 12, r.Y(fb) - 14, 'o', 'M');
    return {
      svg: g,
      infos: [
        ['Pente de la sécante (AM)', fmt(m, 3), 'o'],
        ['Nombre dérivé f′(a)', fmt(d, 3), 'tgt'],
        ['Écart', fmt(Math.abs(m - d), 3), '']
      ],
      note: 'taux de variation entre a et a + h : ( f(a + h) − f(a) ) ÷ h'
    };
  }

  /* ─── 2. tangente : équation et approximation affine ─── */
  function tangente(S) {
    var F = FUN[S.f], a = S.a, h = S.h, b = a + h;
    var r = repere([70, 24, 930, 300], F.xr, F.yr), fa = F.f(a), d = F.d(a), fb = F.f(b), tb = fa + d * h, p = fa - d * a;
    var g = '<defs>' + clip(r) + '</defs>' + axes(r, F.xr, F.yr) + '<g clip-path="url(#' + r.cx + ')">' +
      courbe(r, F.f, F.xr, F.dom) + droite(r, F.xr, a, fa, d, 'tg') +
      '<line class="gd" x1="' + r.X(b).toFixed(1) + '" y1="' + r.Y(fb).toFixed(1) + '" x2="' + r.X(b).toFixed(1) + '" y2="' + r.Y(tb).toFixed(1) + '" style="stroke:#c2410c;stroke-width:4;stroke-dasharray:none"/>' +
      point(r, a, fa, 'pt fixe') + '<circle class="pt" cx="' + r.X(b).toFixed(1) + '" cy="' + r.Y(fb).toFixed(1) + '" r="6.5"/>' +
      '<circle cx="' + r.X(b).toFixed(1) + '" cy="' + r.Y(tb).toFixed(1) + '" r="6.5" class="pt-t"/></g>' +
      txt(r.X(a) - 12, r.Y(fa) - 14, 'b', 'A', 'end');
    return {
      svg: g,
      infos: [
        ['Équation de la tangente', 'y = ' + fmt(d, 2) + ' x ' + (p < 0 ? '−' : '+') + ' ' + fmt(Math.abs(p), 2), 'tgt'],
        ['f(a + h)', fmt(fb, 4), ''],
        ['Approximation f(a) + f′(a)·h', fmt(tb, 4), 'tgt'],
        ['Erreur', fmt(Math.abs(fb - tb), 4), 'o']
      ],
      note: 'y = f(a) + f′(a)(x − a) : plus h est petit, plus la tangente colle à la courbe'
    };
  }

  /* ─── 3. fonction dérivée : f à gauche, f′ à droite ─── */
  function derivee(S) {
    var F = FUN[S.f], a = S.a;
    var L = repere([50, 40, 460, 300], F.xr, F.yr), R = repere([530, 40, 930, 300], F.dxr, F.dyr);
    var fa = F.f(a), d = F.d(a);
    var g = '<defs>' + clip(L) + clip(R) + '</defs>' + axes(L, F.xr, F.yr) + axes(R, F.dxr, F.dyr) +
      '<g clip-path="url(#' + L.cx + ')">' + courbe(L, F.f, F.xr, F.dom) + droite(L, F.xr, a, fa, d, 'tg') + point(L, a, fa, 'pt fixe') + '</g>' +
      '<g clip-path="url(#' + R.cx + ')">' + courbe(R, F.d, F.dxr, F.dom, 'cv d2') +
      '<line class="gd" x1="' + R.X(a).toFixed(1) + '" y1="' + R.Y(d).toFixed(1) + '" x2="' + R.X(a).toFixed(1) + '" y2="' + ((F.dyr[0] < 0 && F.dyr[1] > 0) ? R.Y(0) : R.y1).toFixed(1) + '"/>' +
      '<circle class="pt-t" cx="' + R.X(a).toFixed(1) + '" cy="' + R.Y(d).toFixed(1) + '" r="8"/></g>' +
      txt(60, 28, 'b', 'f(x) = ' + F.nom) + txt(540, 28, 'tgt', 'f′(x) = ' + F.dnom);
    return {
      svg: g,
      infos: [['a', fmt(a, 2), ''], ['f(a)', fmt(fa, 3), ''], ['f′(a) = pente de la tangente', fmt(d, 3), 'tgt']],
      note: 'le point du graphique de droite a pour ordonnée la pente de la tangente à gauche'
    };
  }

  /* ─── 4. variations : f(x) = x³ − 3kx, signe de f′ ─── */
  function variations(S) {
    var k = S.k, a = S.a, xr = [-2.3, 2.3], yr = [-6.2, 6.2];
    var f = function (x) { return x * x * x - 3 * k * x; }, d = function (x) { return 3 * x * x - 3 * k; };
    var r = repere([70, 24, 930, 250], xr, yr), fa = f(a), da = d(a), rac = k > 0 ? Math.sqrt(k) : null;
    var g = '<defs>' + clip(r) + '</defs>' + axes(r, xr, yr) + '<g clip-path="url(#' + r.cx + ')">' + courbe(r, f, xr, [-Infinity, Infinity]) +
      droite(r, xr, a, fa, da, 'tg') + point(r, a, fa, 'pt fixe');
    if (rac) {
      g += point(r, -rac, f(-rac), 'pt ex') + point(r, rac, f(rac), 'pt ex');
    }
    g += '</g>';
    /* bandeau du signe de f′ */
    var ys = 276, hs = 60, X = r.X, bandes = [];
    if (rac) {
      bandes = [[xr[0], -rac, 'pos'], [-rac, rac, 'neg'], [rac, xr[1], 'pos']];
    } else {
      bandes = [[xr[0], xr[1], 'pos']];
    }
    bandes.forEach(function (b) {
      var x0 = X(b[0]), x1 = X(b[1]);
      g += '<rect x="' + x0.toFixed(1) + '" y="' + ys + '" width="' + (x1 - x0).toFixed(1) + '" height="' + hs + '" class="' + (b[2] === 'pos' ? 'bd-p' : 'bd-n') + '"/>' +
           txt((x0 + x1) / 2, ys + 26, '', b[2] === 'pos' ? 'f′(x) &gt; 0' : 'f′(x) &lt; 0', 'middle') +
           txt((x0 + x1) / 2, ys + 50, 'g', b[2] === 'pos' ? 'f croît ↗' : 'f décroît ↘', 'middle');
    });
    g += '<line class="mk" x1="' + X(a).toFixed(1) + '" y1="' + (ys - 6) + '" x2="' + X(a).toFixed(1) + '" y2="' + (ys + hs + 6) + '"/>';
    var etat = da > 0.005 ? 'f′(a) &gt; 0 : f croît autour de a' : (da < -0.005 ? 'f′(a) &lt; 0 : f décroît autour de a' : 'f′(a) = 0 : tangente horizontale');
    return {
      svg: g,
      infos: [
        ['Fonction', 'f(x) = x³ − ' + (Math.abs(k - 1) < 1e-9 ? '3' : fmt(3 * k, 1)) + 'x', ''],
        ['f′(a)', fmt(da, 2), 'tgt'],
        ['Autour de a', da > 0.005 ? 'f croît' : (da < -0.005 ? 'f décroît' : 'tangente horizontale'), ''],
        ['Extremums', rac ? 'en −' + fmt(rac, 2) + ' (max) et ' + fmt(rac, 2) + ' (min)' : 'aucun : f′ ≥ 0 partout', 'o']
      ],
      note: 'ici f′(x) = 3x² − 3k : change k pour faire apparaître ou disparaître les extremums',
      etat: etat
    };
  }

  /* ─── fabrique ─── */
  var TYPES = {
    secante: {
      etat: function () { var F = FUN.carre; return { f: 'carre', a: F.a0, h: F.h0 }; },
      ctl: function (S, F) {
        var hmin = Math.max(-F.hm, F.dom[0] + 0.05 - S.a), hmax = Math.min(F.hm, F.dom[1] - 0.05 - S.a);
        return [
          { k: 'f', t: 'select' },
          { k: 'a', t: 'range', label: 'a', min: F.a[0], max: F.a[1], step: 0.05 },
          { k: 'h', t: 'range', label: 'h', min: hmin, max: hmax, step: 0.05 },
          { k: 'moitie', t: 'button', label: 'h ÷ 2' }
        ];
      },
      draw: secante, defaut: 'Fais glisser h vers 0 : la sécante tend vers la tangente.'
    },
    tangente: {
      etat: function () { return { f: 'carre', a: 1, h: 0.4 }; },
      ctl: function (S, F) {
        var hmin = Math.max(-1.2, F.dom[0] + 0.05 - S.a), hmax = Math.min(1.2, F.dom[1] - 0.05 - S.a);
        return [
          { k: 'f', t: 'select' },
          { k: 'a', t: 'range', label: 'a', min: F.a[0], max: F.a[1], step: 0.05 },
          { k: 'h', t: 'range', label: 'h', min: hmin, max: hmax, step: 0.01 }
        ];
      },
      draw: tangente, defaut: 'Change a et h : compare f(a + h) et l’approximation affine.'
    },
    derivee: {
      etat: function () { return { f: 'carre', a: 1 }; },
      ctl: function (S, F) {
        return [
          { k: 'f', t: 'select' },
          { k: 'a', t: 'range', label: 'a', min: F.a[0], max: F.a[1], step: 0.05 }
        ];
      },
      draw: derivee, defaut: 'Déplace a : la pente de la tangente trace la courbe de f′.'
    },
    variations: {
      etat: function () { return { k: 1, a: -1.6 }; },
      ctl: function (S) {
        return [
          { k: 'k', t: 'range', label: 'k', min: -1, max: 2, step: 0.1 },
          { k: 'a', t: 'range', label: 'a', min: -2.2, max: 2.2, step: 0.05 }
        ];
      },
      draw: variations, defaut: ''
    }
  };

  function monter(root) {
    var type = root.getAttribute('data-schema'), T = TYPES[type];
    if (!T) return;
    var S = T.etat(), ins = {};
    var aH = (type === 'secante' || type === 'tangente');
    root.innerHTML = '';
    root.classList.add('fig-i');
    var titre = root.getAttribute('data-titre') || T.defaut;
    if (titre) root.appendChild(html('div', 'fig-titre', titre));
    var zone = html('div', 'fig-svg'), infos = html('div', 'fig-info'), ctl = html('div', 'fig-ctl'), note = html('p', 'fig-note');
    root.appendChild(zone); root.appendChild(infos); root.appendChild(ctl); root.appendChild(note);

    function bornesH() {
      var F = FUN[S.f], hm = type === 'tangente' ? 1.2 : F.hm;
      return [Math.max(-hm, F.dom[0] + 0.05 - S.a), Math.min(hm, F.dom[1] - 0.05 - S.a)];
    }
    function normaliser() {
      if (!aH) return;
      var bh = bornesH();
      S.h = clamp(S.h, bh[0], bh[1]);
      if (Math.abs(S.h) < 1e-9) S.h = Math.min(0.05, bh[1]);
    }
    function synchroniser() {
      var F = FUN[S.f];
      if (ins.a && F) { ins.a.min = F.a[0]; ins.a.max = F.a[1]; }
      if (ins.h) { var bh = bornesH(); ins.h.min = bh[0]; ins.h.max = bh[1]; }
      Object.keys(ins).forEach(function (k) {
        ins[k].value = S[k];
        var v = ins[k].parentNode.querySelector('.fig-v');
        if (v) v.textContent = fmt(+S[k], 2);
      });
    }
    function dessiner() {
      var d = T.draw(S);
      zone.innerHTML = '<svg viewBox="0 0 960 ' + (type === 'variations' ? 350 : 340) + '" role="img" aria-label="Schéma interactif">' + d.svg + '</svg>';
      infos.innerHTML = d.infos.map(function (x) { return '<span class="fig-i1"><em>' + x[0] + '</em><b class="' + x[2] + '">' + x[1] + '</b></span>'; }).join('');
      note.textContent = d.note || '';
    }
    function maj() { normaliser(); synchroniser(); dessiner(); }
    function construire() {
      var F = FUN[S.f] || null, defs = T.ctl(S, F);
      ctl.innerHTML = ''; ins = {};
      defs.forEach(function (c) {
        if (c.t === 'select') {
          var w = html('label', 'fig-c fig-select', '<span>Fonction</span>');
          var sel = document.createElement('select');
          CHOIX.forEach(function (o) {
            var op = document.createElement('option');
            op.value = o[0]; op.textContent = 'f(x) = ' + o[1]; if (o[0] === S.f) op.selected = true;
            sel.appendChild(op);
          });
          sel.addEventListener('change', function () {
            S.f = sel.value;
            var G = FUN[S.f];
            S.a = G.a0;
            if (aH) S.h = type === 'tangente' ? 0.4 : G.h0;
            construire(); maj();
          });
          w.appendChild(sel); ctl.appendChild(w);
        } else if (c.t === 'range') {
          var w2 = html('label', 'fig-c fig-range', '<span>' + c.label + ' =</span><b class="fig-v"></b>');
          var inp = document.createElement('input');
          inp.type = 'range'; inp.min = c.min; inp.max = c.max; inp.step = c.step; inp.value = S[c.k];
          inp.setAttribute('aria-label', c.label);
          inp.addEventListener('input', function () { S[c.k] = +inp.value; maj(); });
          w2.appendChild(inp); ctl.appendChild(w2); ins[c.k] = inp;
        } else {
          var bt = html('button', 'fig-btn', c.label);
          bt.type = 'button';
          bt.addEventListener('click', function () {
            if (Math.abs(S.h / 2) >= 0.0005) S.h = S.h / 2;
            maj();
          });
          ctl.appendChild(bt);
        }
      });
    }
    construire(); maj();
  }

  function init() {
    Array.prototype.forEach.call(document.querySelectorAll('.fig[data-schema]'), monter);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.CPSchema = { monter: monter, init: init };
})();
