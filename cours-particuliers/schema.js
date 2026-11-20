/* ══════════════════════════════════════════════════════════════
   Schémas interactifs des fiches de cours particuliers (dérivation).
   <div class="fig" data-schema="secante|derivee|variations" data-titre="…"></div>
   Le script construit le dessin (SVG), le ou les curseurs et les valeurs lues.
   Toutes les écritures mathématiques sont en KaTeX (dans le SVG par
   <foreignObject>). Les couleurs viennent du CSS (fiche.css, classes .fig …).
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
  /* texte français avec des \( … \) : les formules passent par KaTeX */
  function T(s) {
    return String(s).replace(/\\\((.+?)\\\)/g, function (_, m) { return K(m); });
  }
  function nb(v, n) {                       /* nombre en écriture française, pour du texte */
    if (!isFinite(v)) return '∞';
    n = n == null ? 2 : n;
    var s = (Math.round(v * Math.pow(10, n)) / Math.pow(10, n)).toFixed(n);
    return s.replace('.', ',').replace('-', '−');
  }
  function nbT(v, n) {                      /* … et pour KaTeX */
    return nb(v, n).replace(',', '{,}').replace('−', '-');
  }
  function html(tag, cls, inner) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (inner != null) e.innerHTML = inner;
    return e;
  }

  /* ─── fonctions proposées (schéma « dérivée ») ─── */
  var FUN = {
    carre:   { tex: 'x^2',  dtex: '2x',
               f: function (x) { return x * x; },     d: function (x) { return 2 * x; },
               dom: [-Infinity, Infinity], xr: [-3, 3], yr: [-1, 9], a: [-2.5, 2.5], a0: 1,
               dxr: [-3, 3], dyr: [-6.5, 6.5] },
    cube:    { tex: 'x^3',  dtex: '3x^2',
               f: function (x) { return x * x * x; }, d: function (x) { return 3 * x * x; },
               dom: [-Infinity, Infinity], xr: [-2.5, 2.5], yr: [-9, 9], a: [-2, 2], a0: 1,
               dxr: [-2.5, 2.5], dyr: [-1, 20] },
    racine:  { tex: '\\sqrt{x}', dtex: '\\dfrac{1}{2\\sqrt{x}}',
               f: function (x) { return Math.sqrt(x); }, d: function (x) { return 1 / (2 * Math.sqrt(x)); },
               dom: [0, Infinity], xr: [0, 9], yr: [-0.3, 3.6], a: [0.6, 8], a0: 2,
               dxr: [0, 9], dyr: [-0.1, 1.6] },
    inverse: { tex: '\\dfrac{1}{x}', dtex: '-\\dfrac{1}{x^2}',
               f: function (x) { return 1 / x; },    d: function (x) { return -1 / (x * x); },
               dom: [0.0001, Infinity], xr: [0, 6], yr: [-0.3, 5.5], a: [0.6, 5], a0: 1.5,
               dxr: [0, 6], dyr: [-5.5, 0.6] }
  };
  var CHOIX = [['carre', 'x^2'], ['cube', 'x^3'], ['racine', '\\sqrt{x}'], ['inverse', '\\frac{1}{x}']];

  /* ─── dessin ─── */
  var uid = 0;
  function repere(box, xr, yr) {
    return {
      x0: box[0], y0: box[1], x1: box[2], y1: box[3], cx: 'c' + (++uid),
      X: function (x) { return box[0] + (x - xr[0]) / (xr[1] - xr[0]) * (box[2] - box[0]); },
      Y: function (y) { return box[3] - (y - yr[0]) / (yr[1] - yr[0]) * (box[3] - box[1]); }
    };
  }
  function axes(r, xr, yr) {
    var ya = (yr[0] < 0 && yr[1] > 0) ? r.Y(0) : r.y1, xa = (xr[0] < 0 && xr[1] > 0) ? r.X(0) : r.x0;
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
    return '<line class="' + cls + '" x1="' + r.X(xr[0]).toFixed(1) + '" y1="' + r.Y(fa + m * (xr[0] - a)).toFixed(1) +
           '" x2="' + r.X(xr[1]).toFixed(1) + '" y2="' + r.Y(fa + m * (xr[1] - a)).toFixed(1) + '"/>';
  }
  function trait(r, x1, y1, x2, y2, cls) {
    return '<line class="' + cls + '" x1="' + r.X(x1).toFixed(1) + '" y1="' + r.Y(y1).toFixed(1) + '" x2="' + r.X(x2).toFixed(1) + '" y2="' + r.Y(y2).toFixed(1) + '"/>';
  }
  function point(r, x, y, cls) {
    return '<circle class="' + (cls || 'pt') + '" cx="' + r.X(x).toFixed(1) + '" cy="' + r.Y(y).toFixed(1) + '" r="8"/>';
  }
  /* étiquette KaTeX posée dans le SVG ; (x, y) = point d'ancrage, y au milieu de la ligne */
  function lbl(x, y, tex, o) {
    o = o || {};
    var w = o.w || 360, h = o.h || 48, an = o.an || 'start';
    var x0 = an === 'end' ? x - w : (an === 'middle' ? x - w / 2 : x);
    var jc = an === 'end' ? 'flex-end' : (an === 'middle' ? 'center' : 'flex-start');
    return '<foreignObject class="fo" x="' + x0.toFixed(1) + '" y="' + (y - h / 2).toFixed(1) + '" width="' + w + '" height="' + h + '">' +
           '<div class="fo-d ' + (o.cls || '') + '" style="justify-content:' + jc + '">' + K(tex) + '</div></foreignObject>';
  }

  /* ─── 1. sécante : de la pente de la sécante au nombre dérivé (f(x) = x², a = 1) ─── */
  function secante(S) {
    var h = S.h, a = 1, b = a + h, xr = [-1.6, 3.6], yr = [-1, 9];
    var f = function (x) { return x * x; };
    var r = repere([70, 24, 930, 300], xr, yr), fa = f(a), fb = f(b), m = 2 + h;
    var g = '<defs>' + clip(r) + '</defs>' + axes(r, xr, yr) + '<g clip-path="url(#' + r.cx + ')">' +
      courbe(r, f, xr, [-Infinity, Infinity]) + droite(r, xr, a, fa, 2, 'tg') + droite(r, xr, a, fa, m, 'sc') +
      trait(r, a, fa, b, fa, 'gd') + trait(r, b, fa, b, fb, 'gd') +
      point(r, a, fa, 'pt fixe') + point(r, b, fb) + '</g>' +
      lbl(r.X(a) - 16, r.Y(fa) - 26, 'A', { an: 'end', cls: 'b', w: 60 }) +
      lbl(r.X(b) + (h > 0 ? 16 : -16), r.Y(fb) - 22, 'M', { an: h > 0 ? 'start' : 'end', cls: 'o', w: 60 }) +
      lbl((r.X(a) + r.X(b)) / 2, r.Y(fa) + (Math.abs(h) < 0.25 ? 34 : -22), 'h', { an: 'middle', cls: 'g', w: 80 });
    var etat = Math.abs(h) < 0.15 ? '\\(h\\) est presque nul : la sécante se confond presque avec la tangente.'
             : 'Rapproche \\(h\\) de \\(0\\) : la sécante (orange) se rapproche de la tangente (bleue).';
    return {
      svg: g,
      infos: [
        { lab: 'Pente de la sécante (AM)', tex: '\\dfrac{f(1+h)-f(1)}{h} = 2 + h = ' + nbT(m, 3), cls: 'o' },
        { lab: 'Pente de la tangente en A', tex: "f'(1) = 2", cls: 'tgt' }
      ],
      note: etat
    };
  }

  /* ─── 2. fonction dérivée : f à gauche, f′ à droite ─── */
  function derivee(S) {
    var F = FUN[S.f], a = S.a;
    var L = repere([50, 40, 460, 300], F.xr, F.yr), R = repere([530, 40, 930, 300], F.dxr, F.dyr);
    var fa = F.f(a), d = F.d(a);
    var yAxeR = (F.dyr[0] < 0 && F.dyr[1] > 0) ? 0 : F.dyr[0];
    var g = '<defs>' + clip(L) + clip(R) + '</defs>' + axes(L, F.xr, F.yr) + axes(R, F.dxr, F.dyr) +
      '<g clip-path="url(#' + L.cx + ')">' + courbe(L, F.f, F.xr, F.dom) + droite(L, F.xr, a, fa, d, 'tg') + point(L, a, fa, 'pt fixe') + '</g>' +
      '<g clip-path="url(#' + R.cx + ')">' + courbe(R, F.d, F.dxr, F.dom, 'cv d2') + trait(R, a, d, a, yAxeR, 'gd') +
      '<circle class="pt-t" cx="' + R.X(a).toFixed(1) + '" cy="' + R.Y(d).toFixed(1) + '" r="8"/></g>' +
      lbl(60, 24, 'f(x) = ' + F.tex, { cls: 'b', w: 380 }) + lbl(540, 24, "f'(x) = " + F.dtex, { cls: 'tgt', w: 380 });
    return {
      svg: g,
      infos: [
        { lab: 'Le point choisi', tex: 'a = ' + nbT(a, 2), cls: '' },
        { lab: 'Pente de la tangente', tex: "f'(a) = " + nbT(d, 3), cls: 'tgt' }
      ],
      note: 'Le point du graphique de droite a pour hauteur la pente de la tangente tracée à gauche.'
    };
  }

  /* ─── 3. variations : f(x) = x³ − 3x, signe de f′ ─── */
  function variations(S) {
    var a = S.a, xr = [-2.3, 2.3], yr = [-4.6, 4.6];
    var f = function (x) { return x * x * x - 3 * x; }, da = 3 * a * a - 3;
    var r = repere([70, 24, 930, 250], xr, yr), fa = f(a);
    var g = '<defs>' + clip(r) + '</defs>' + axes(r, xr, yr) + '<g clip-path="url(#' + r.cx + ')">' + courbe(r, f, xr, [-Infinity, Infinity]) +
      droite(r, xr, a, fa, da, 'tg') + point(r, -1, 2, 'pt ex') + point(r, 1, -2, 'pt ex') + point(r, a, fa, 'pt fixe') + '</g>';
    g += lbl(r.X(-1) + 24, r.Y(2) - 16, '\\text{maximum : } f(-1) = 2', { cls: 'b', w: 420 });
    g += lbl(r.X(1) - 24, r.Y(-2) + 26, '\\text{minimum : } f(1) = -2', { an: 'end', cls: 'b', w: 420 });
    var ys = 276, hs = 66, X = r.X;
    [[xr[0], -1, true], [-1, 1, false], [1, xr[1], true]].forEach(function (b) {
      var x0 = X(b[0]), x1 = X(b[1]), xm = (x0 + x1) / 2;
      g += '<rect x="' + x0.toFixed(1) + '" y="' + ys + '" width="' + (x1 - x0).toFixed(1) + '" height="' + hs + '" class="' + (b[2] ? 'bd-p' : 'bd-n') + '"/>' +
           lbl(xm, ys + 20, b[2] ? "f'(x) > 0" : "f'(x) < 0", { an: 'middle', cls: 'sm', w: 260, h: 40 }) +
           lbl(xm, ys + 48, b[2] ? 'f \\nearrow' : 'f \\searrow', { an: 'middle', cls: 'g sm', w: 260, h: 40 });
    });
    g += '<line class="mk" x1="' + X(a).toFixed(1) + '" y1="' + (ys - 6) + '" x2="' + X(a).toFixed(1) + '" y2="' + (ys + hs + 6) + '"/>';
    var ph = Math.abs(da) < 0.05;
    return {
      svg: g,
      infos: [
        { lab: 'Pente de la tangente', tex: "f'(a) = 3a^2 - 3 = " + nbT(da, 2), cls: 'tgt' },
        { lab: 'Ce que ça dit de f', tex: ph ? "f'(a) = 0 \\ \\text{: tangente horizontale}" : (da > 0 ? "f'(a) > 0 \\ \\text{: } f \\text{ croît}" : "f'(a) < 0 \\ \\text{: } f \\text{ décroît}"), cls: '' }
      ],
      note: 'La tangente est horizontale aux extremums (\\(a = -1\\) et \\(a = 1\\)) : c’est là que \\(f\'\\) change de signe.'
    };
  }

  /* ─── fabrique ─── */
  var TYPES = {
    secante: {
      etat: function () { return { h: 1.6 }; },
      ctl: function () { return [{ k: 'h', t: 'range', tex: 'h', min: -1.4, max: 2.4, step: 0.01 }]; },
      draw: secante, hauteur: 340
    },
    derivee: {
      etat: function () { return { f: 'carre', a: 1 }; },
      ctl: function (S) { var F = FUN[S.f]; return [{ t: 'choix' }, { k: 'a', t: 'range', tex: 'a', min: F.a[0], max: F.a[1], step: 0.05 }]; },
      draw: derivee, hauteur: 340
    },
    variations: {
      etat: function () { return { a: -1.7 }; },
      ctl: function () { return [{ k: 'a', t: 'range', tex: 'a', min: -2.2, max: 2.2, step: 0.05 }]; },
      draw: variations, hauteur: 350
    }
  };

  function monter(root) {
    var type = root.getAttribute('data-schema'), TT = TYPES[type];
    if (!TT) return;
    var S = TT.etat(), ins = {}, vals = {};
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
    function synchroniser() {
      Object.keys(ins).forEach(function (k) {
        ins[k].value = S[k];
        if (vals[k]) vals[k].innerHTML = K(ins[k].getAttribute('data-tex') + ' = ' + nbT(+S[k], 2));
      });
    }
    function maj() {
      if (S.h != null && Math.abs(S.h) < 0.005) S.h = 0.01;     /* h ≠ 0 */
      synchroniser(); dessiner();
    }
    function construire() {
      var defs = TT.ctl(S);
      ctl.innerHTML = ''; ins = {}; vals = {};
      defs.forEach(function (c) {
        if (c.t === 'choix') {
          var w = html('div', 'fig-c fig-choix', '<span class="fig-q">Choisis une fonction</span>');
          var g = html('div', 'fig-seg');
          CHOIX.forEach(function (o) {
            var bt = html('button', 'fig-chip', K('f(x) = ' + o[1]));
            bt.type = 'button';
            bt.setAttribute('aria-pressed', o[0] === S.f ? 'true' : 'false');
            bt.addEventListener('click', function () {
              S.f = o[0]; S.a = FUN[S.f].a0;
              construire(); maj();
            });
            g.appendChild(bt);
          });
          w.appendChild(g); ctl.appendChild(w);
        } else {
          var w2 = html('label', 'fig-c fig-range', '<span class="fig-q">Fais glisser le curseur</span><b class="fig-v"></b>');
          var inp = document.createElement('input');
          inp.type = 'range'; inp.min = c.min; inp.max = c.max; inp.step = c.step; inp.value = S[c.k];
          inp.setAttribute('data-tex', c.tex);
          inp.setAttribute('aria-label', 'Curseur ' + c.tex);
          inp.addEventListener('input', function () { S[c.k] = +inp.value; maj(); });
          w2.appendChild(inp); ctl.appendChild(w2);
          ins[c.k] = inp; vals[c.k] = w2.querySelector('.fig-v');
        }
      });
    }
    construire(); maj();
  }

  function init() {
    var n = 0;
    function lancer() {
      Array.prototype.forEach.call(document.querySelectorAll('.fig[data-schema]'), monter);
    }
    /* KaTeX est chargé avec « defer » : on l'attend un instant si besoin */
    (function attendre() {
      if (window.katex || ++n > 100) lancer(); else setTimeout(attendre, 50);
    })();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.CPSchema = { monter: monter, init: init };
})();
