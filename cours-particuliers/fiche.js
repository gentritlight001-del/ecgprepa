/* ══════════════════════════════════════════════════════════════
   Fiches de cours de l'espace de cours particuliers (maths seconde).
   - formules en KaTeX : \( … \) dans le texte, \[ … \] en bloc ;
   - exercices où l'élève tape sa réponse (racines carrées, fractions,
     puissances) : <label class="rep" data-attendu="2√3" data-forme="…"
     data-indice="…">, aperçu KaTeX en direct, vérification à la demande ;
   - questions à choix : <div class="qcm" data-bonne="<n° du bouton, dès 1>"> ;
   - réponses gardées dans le navigateur (localStorage ecg-cp-fiche:<n>) ;
   - un élève ne voit que les fiches que son professeur lui a ouvertes.
   Formes (data-forme) : « nombre » (sans racine), « simplifiee » (a√b
   réduit, racines regroupées, pas de racine au dénominateur).
   ══════════════════════════════════════════════════════════════ */
(function () {
  var N = +(document.body.getAttribute('data-fiche') || 0);
  var CLE = 'ecg-cp-fiche:' + N;

  /* ─── Lecture d'une réponse tapée ─────────────────────────── */
  function lexer(s) {
    s = s.replace(/\s+/g, '').replace(/^[a-z]=/i, '').replace(/sqrt|racine|rac/gi, '√').replace(/pi/gi, 'π')
      .replace(/[−–]/g, '-').replace(/[×·x*]/g, '*').replace(/÷|:/g, '/').replace(/²/g, '^2').replace(/³/g, '^3');
    var t = [], i = 0, m;
    while (i < s.length) {
      var c = s[i];
      if ((m = /^\d+(?:[.,]\d+)?/.exec(s.slice(i)))) { t.push({ k: 'n', v: parseFloat(m[0].replace(',', '.')), s: m[0].replace('.', ',') }); i += m[0].length; continue; }
      if ('+-*/^()√π'.indexOf(c) !== -1) { t.push({ k: c }); i++; continue; }
      throw new Error('caractère');
    }
    return t;
  }
  function lire(s) {
    var t = lexer(s), p = 0;
    if (!t.length) throw new Error('vide');
    function voir() { return t[p] && t[p].k; }
    function prendre(k) { if (voir() !== k) throw new Error('attendu ' + k); p++; }
    function debutAtome() { var k = voir(); return k === 'n' || k === '(' || k === '√' || k === 'π'; }
    function expr() {
      var a = terme();
      while (voir() === '+' || voir() === '-') { var o = t[p++].k; a = { t: o, a: a, b: terme() }; }
      return a;
    }
    function terme() {
      var a = unaire();
      for (;;) {
        if (voir() === '*' || voir() === '/') { var o = t[p++].k; a = { t: o, a: a, b: unaire() }; }
        else if (debutAtome()) a = { t: '*', a: a, b: puissance(), imp: true };
        else return a;
      }
    }
    function unaire() {
      if (voir() === '-') { p++; return { t: 'neg', a: unaire() }; }
      if (voir() === '+') { p++; return unaire(); }
      return puissance();
    }
    function puissance() {
      var a = atome();
      if (voir() === '^') { p++; a = { t: '^', a: a, b: unaire() }; }
      return a;
    }
    function atome() {
      var k = voir();
      if (k === 'n') return { t: 'n', v: t[p].v, s: t[p++].s };
      if (k === 'π') { p++; return { t: 'pi' }; }
      if (k === '(') { p++; var e = expr(); prendre(')'); return { t: '()', a: e }; }
      if (k === '√') {
        p++;
        if (!voir()) throw new Error('racine vide');
        return { t: '√', a: voir() === '(' ? (p++, (function () { var e = expr(); prendre(')'); return e; })()) : puissance() };
      }
      throw new Error('inattendu');
    }
    var r = expr();
    if (p < t.length) throw new Error('reste');
    return r;
  }
  function val(n) {
    switch (n.t) {
      case 'n': return n.v;
      case 'pi': return Math.PI;
      case '()': return val(n.a);
      case 'neg': return -val(n.a);
      case '+': return val(n.a) + val(n.b);
      case '-': return val(n.a) - val(n.b);
      case '*': return val(n.a) * val(n.b);
      case '/': return val(n.a) / val(n.b);
      case '^': return Math.pow(val(n.a), val(n.b));
      case '√': var x = val(n.a); return x < 0 ? NaN : Math.sqrt(x);
    }
  }
  function nu(n) { return n.t === '()' ? nu(n.a) : n; }
  function tex(n) {
    switch (n.t) {
      case 'n': return n.s.replace(',', '{,}');
      case 'pi': return '\\pi';
      case '()': return '\\left(' + tex(n.a) + '\\right)';
      case 'neg': return '-' + tex(n.a);
      case '+': return tex(n.a) + '+' + tex(n.b);
      case '-': return tex(n.a) + '-' + tex(n.b);
      case '*':
        var b = nu(n.b);
        return tex(n.a) + (n.imp && (b.t === '√' || b.t === 'pi' || n.b.t === '()') ? '' : '\\times ') + tex(n.b);
      case '/': return '\\dfrac{' + tex(nu(n.a)) + '}{' + tex(nu(n.b)) + '}';
      case '^': return '{' + tex(n.a) + '}^{' + tex(nu(n.b)) + '}';
      case '√': return '\\sqrt{' + tex(nu(n.a)) + '}';
    }
  }
  function racines(n, dansDen, l) {
    l = l || [];
    if (!n || typeof n !== 'object') return l;
    if (n.t === '√') l.push({ n: n, den: !!dansDen });
    if (n.t === '/') { racines(n.a, dansDen, l); racines(n.b, true, l); return l; }
    if (n.a) racines(n.a, dansDen, l);
    if (n.b) racines(n.b, dansDen, l);
    return l;
  }
  function entier(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
  function pgcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  /* Coefficient entier d'un produit de nombres et de racines (2√5 → 2), sinon null. */
  function coef(n) {
    n = nu(n);
    if (n.t === 'n') return entier(n.v) ? Math.round(n.v) : null;
    if (n.t === '√') return 1;
    if (n.t === '*') { var a = coef(n.a), b = coef(n.b); return a == null || b == null ? null : a * b; }
    return null;
  }
  function fractionNonReduite(n) {
    if (!n || typeof n !== 'object') return null;
    if (n.t === '/') {
      var a = coef(n.a), b = coef(n.b);
      if (a != null && b != null && racines(n.b).length === 0 && pgcd(a, b) > 1) return 'Simplifie la fraction : ' + a + ' et ' + b + ' ont un diviseur commun.';
    }
    return fractionNonReduite(n.a) || fractionNonReduite(n.b);
  }
  /* Ce qui empêche la réponse d'être sous la forme demandée (ou null). */
  function defautForme(ast, forme) {
    var rs = racines(ast);
    if (forme === 'nombre') return rs.length ? 'Calcule la racine : la réponse s\'écrit sans le symbole \\(\\sqrt{\\ }\\).' : null;
    if (forme !== 'simplifiee') return null;
    var fr = fractionNonReduite(ast);
    if (fr) return fr;
    var vus = {};
    for (var i = 0; i < rs.length; i++) {
      var r = val(rs[i].n.a);
      if (rs[i].den) return 'Il reste une racine au dénominateur : multiplie en haut et en bas par cette racine.';
      if (!entier(r)) return 'Sépare la racine : \\(\\sqrt{\\dfrac{a}{b}} = \\dfrac{\\sqrt{a}}{\\sqrt{b}}\\), puis enlève la racine du dénominateur.';
      if (r > 0) {
        var R = Math.round(r);
        if (entier(Math.sqrt(R))) return 'La racine de \\(' + R + '\\) se calcule : c\'est \\(' + Math.round(Math.sqrt(R)) + '\\).';
        for (var k = Math.floor(Math.sqrt(R)); k > 1; k--) if (R % (k * k) === 0) return 'Simplifie encore : \\(' + R + ' = ' + (k * k) + ' \\times ' + (R / (k * k)) + '\\), et \\(' + (k * k) + '\\) est un carré.';
        if (vus[R]) return 'Regroupe les termes en \\(\\sqrt{' + R + '}\\) : tu peux encore réduire.';
        vus[R] = 1;
      }
    }
    return null;
  }

  /* ─── KaTeX ───────────────────────────────────────────────── */
  function rendre(el) {
    if (window.renderMathInElement) {
      renderMathInElement(el, { delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }], throwOnError: false });
    }
  }
  function katexDans(el, t) {
    if (window.katex) { try { katex.render(t, el, { throwOnError: false }); return; } catch (e) {} }
    el.textContent = t;
  }

  /* ─── Mémoire ─────────────────────────────────────────────── */
  var MEM = {};
  try { MEM = JSON.parse(localStorage.getItem(CLE) || '{}') || {}; } catch (e) { MEM = {}; }
  function garder() { try { localStorage.setItem(CLE, JSON.stringify(MEM)); } catch (e) {} }

  /* ─── Exercices ───────────────────────────────────────────── */
  function retour(el, etat, html) {
    el.className = 'retour ' + etat;
    el.innerHTML = html;
    el.hidden = !html;
    rendre(el);
  }
  function compter() {
    var exos = document.querySelectorAll('.exo-cp'), ok = 0;
    Array.prototype.forEach.call(exos, function (x) {
      var items = x.querySelectorAll('.rep, .qcm');
      var tous = items.length && Array.prototype.every.call(items, function (i) { return i.classList.contains('juste'); });
      x.classList.toggle('reussi', !!tous);
      if (tous) ok++;
    });
    var c = document.getElementById('score');
    if (c) c.innerHTML = exos.length ? '<b>' + ok + '</b> exercice' + (ok > 1 ? 's' : '') + ' réussi' + (ok > 1 ? 's' : '') + ' sur ' + exos.length : '';
  }

  function champ(lab, id) {
    var input = document.createElement('input');
    input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
    input.setAttribute('autocapitalize', 'off'); input.setAttribute('aria-label', 'Ta réponse');
    var outils = document.createElement('span');
    outils.className = 'rep-outils';
    [['√', '√()', -1, 'Racine carrée'], ['x²', '^2', 0, 'Au carré'], ['a/b', '/', 0, 'Fraction'], ['(', '(', 0, 'Parenthèse ouvrante'], [')', ')', 0, 'Parenthèse fermante']].forEach(function (b) {
      var bt = document.createElement('button');
      bt.type = 'button'; bt.textContent = b[0]; bt.setAttribute('aria-label', b[3]);
      bt.addEventListener('mousedown', function (e) { e.preventDefault(); });
      bt.addEventListener('click', function () {
        var d = input.selectionStart == null ? input.value.length : input.selectionStart, f = input.selectionEnd == null ? d : input.selectionEnd;
        input.value = input.value.slice(0, d) + b[1] + input.value.slice(f);
        var pos = d + b[1].length + b[2];
        input.focus(); input.setSelectionRange(pos, pos);
        apercu();
      });
      outils.appendChild(bt);
    });
    var bouton = document.createElement('button');
    bouton.type = 'button'; bouton.className = 'verifier'; bouton.textContent = 'Vérifier';
    var ap = document.createElement('span'); ap.className = 'rep-apercu'; ap.setAttribute('aria-hidden', 'true');
    var ret = document.createElement('span'); ret.className = 'retour'; ret.hidden = true; ret.setAttribute('aria-live', 'polite');

    var ligne = document.createElement('span'); ligne.className = 'rep-ligne';
    ligne.appendChild(input); ligne.appendChild(bouton);
    lab.appendChild(ligne); lab.appendChild(outils); lab.appendChild(ap); lab.appendChild(ret);

    function apercu() {
      lab.classList.remove('juste', 'faux');
      retour(ret, '', '');
      var v = input.value.trim();
      if (!v) { ap.textContent = ''; return; }
      try { katexDans(ap, tex(lire(v))); ap.classList.remove('illisible'); }
      catch (e) { ap.textContent = 'Écriture incomplète…'; ap.classList.add('illisible'); }
    }
    function verifier(silence) {
      var v = input.value.trim();
      MEM[id] = v; garder();
      if (!v) { if (!silence) retour(ret, 'faux', 'Écris ta réponse d\'abord.'); return; }
      var ast;
      try { ast = lire(v); } catch (e) { retour(ret, 'faux', 'Je n\'arrive pas à lire ta réponse. Pour une racine, utilise le bouton √ (ou écris sqrt(12)).'); return; }
      var attendu = val(lire(lab.getAttribute('data-attendu'))), x = val(ast);
      var egal = isFinite(x) && Math.abs(x - attendu) < 1e-9 * Math.max(1, Math.abs(attendu));
      if (!egal) {
        lab.classList.add('faux'); lab.classList.remove('juste');
        if (!silence) retour(ret, 'faux', 'Pas encore.' + (lab.getAttribute('data-indice') ? ' <b>Indice :</b> ' + lab.getAttribute('data-indice') : ' Relis la propriété au-dessus.'));
        compter(); return;
      }
      var d = defautForme(ast, lab.getAttribute('data-forme'));
      if (d) { lab.classList.remove('juste'); lab.classList.add('faux'); if (!silence) retour(ret, 'presque', 'La valeur est juste. ' + d); compter(); return; }
      lab.classList.add('juste'); lab.classList.remove('faux');
      retour(ret, 'ok', 'Bravo, c\'est juste.');
      compter();
    }
    input.addEventListener('input', apercu);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); verifier(); } });
    bouton.addEventListener('click', function () { verifier(); });
    if (MEM[id]) { input.value = MEM[id]; apercu(); verifier(true); }
  }

  function qcm(q, id) {
    var bts = q.querySelectorAll('button');
    var ret = document.createElement('p'); ret.className = 'retour'; ret.hidden = true; ret.setAttribute('aria-live', 'polite');
    q.appendChild(ret);
    function choisir(i, silence) {
      MEM[id] = i; garder();
      Array.prototype.forEach.call(bts, function (b, j) { b.setAttribute('aria-pressed', String(j === i)); b.classList.remove('bon', 'mauvais'); });
      var bonne = +q.getAttribute('data-bonne') - 1;
      if (i === bonne) { bts[i].classList.add('bon'); q.classList.add('juste'); retour(ret, 'ok', 'Bravo, c\'est juste.'); }
      else {
        bts[i].classList.add('mauvais'); q.classList.remove('juste');
        retour(ret, 'faux', silence ? '' : 'Pas encore.' + (q.getAttribute('data-indice') ? ' <b>Indice :</b> ' + q.getAttribute('data-indice') : ''));
      }
      compter();
    }
    Array.prototype.forEach.call(bts, function (b, i) { b.type = 'button'; b.addEventListener('click', function () { choisir(i); }); });
    if (typeof MEM[id] === 'number' && bts[MEM[id]]) choisir(MEM[id], true);
  }

  /* ─── Courbe de la fonction racine carrée (curseur) ───────── */
  function courbe(box) {
    var L = 360, H = 200, X0 = 34, Y0 = 176, sx = (L - 50) / 9, sy = 40;   /* x de 0 à 9, y de 0 à 3,5 */
    function px(x) { return X0 + x * sx; }
    function py(y) { return Y0 - y * sy; }
    var d = '', i;
    for (i = 0; i <= 180; i++) { var x = i / 20; d += (i ? 'L' : 'M') + px(x).toFixed(1) + ' ' + py(Math.sqrt(x)).toFixed(1); }
    var g = '';
    for (i = 1; i <= 9; i++) g += '<line x1="' + px(i) + '" y1="' + py(0) + '" x2="' + px(i) + '" y2="' + py(3.5) + '" class="q"/><text x="' + px(i) + '" y="' + (Y0 + 15) + '" class="g">' + i + '</text>';
    for (i = 1; i <= 3; i++) g += '<line x1="' + px(0) + '" y1="' + py(i) + '" x2="' + px(9) + '" y2="' + py(i) + '" class="q"/><text x="' + (X0 - 8) + '" y="' + (py(i) + 4) + '" class="g" text-anchor="end">' + i + '</text>';
    box.innerHTML =
      '<svg viewBox="0 0 ' + L + ' ' + H + '" role="img" aria-label="Courbe de la fonction racine carrée pour x de 0 à 9 : elle part de l\'origine et monte de moins en moins vite.">' + g +
      '<line x1="' + px(0) + '" y1="' + py(0) + '" x2="' + (px(9) + 8) + '" y2="' + py(0) + '" class="ax"/><line x1="' + px(0) + '" y1="' + py(0) + '" x2="' + px(0) + '" y2="' + (py(3.5) - 6) + '" class="ax"/>' +
      '<text x="' + (X0 - 8) + '" y="' + (Y0 + 15) + '" class="g" text-anchor="end">0</text>' +
      '<path d="' + d + '" class="c"/>' +
      '<line class="guide gx"/><line class="guide gy"/><circle r="6" class="pt"/></svg>' +
      '<label class="curseur">Déplace le point : <input type="range" min="0" max="9" step="0.01" value="4"></label>' +
      '<p class="lecture"></p>';
    var r = box.querySelector('input'), c = box.querySelector('.pt'), gx = box.querySelector('.gx'), gy = box.querySelector('.gy'), lec = box.querySelector('.lecture');
    function maj() {
      var x = +r.value, y = Math.sqrt(x);
      c.setAttribute('cx', px(x)); c.setAttribute('cy', py(y));
      gx.setAttribute('x1', px(x)); gx.setAttribute('x2', px(x)); gx.setAttribute('y1', py(0)); gx.setAttribute('y2', py(y));
      gy.setAttribute('x1', px(0)); gy.setAttribute('x2', px(x)); gy.setAttribute('y1', py(y)); gy.setAttribute('y2', py(y));
      var fx = function (v) { return (Math.round(v * 100) / 100).toString().replace('.', '{,}'); };
      katexDans(lec, 'x = ' + fx(x) + ' \\quad\\longrightarrow\\quad \\sqrt{x} \\approx ' + fx(y));
    }
    r.addEventListener('input', maj);
    maj();
  }

  /* ─── Démarrage ───────────────────────────────────────────── */
  function lancer() {
    rendre(document.getElementById('cours'));
    Array.prototype.forEach.call(document.querySelectorAll('.rep'), function (l, i) { champ(l, 'r' + i); });
    Array.prototype.forEach.call(document.querySelectorAll('.qcm'), function (q, i) { qcm(q, 'q' + i); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-courbe]'), courbe);
    compter();
    var raz = document.getElementById('raz');
    if (raz) raz.addEventListener('click', function () {
      if (!confirm('Effacer toutes tes réponses de cette fiche ?')) return;
      MEM = {}; garder(); location.reload();
    });
  }
  function quandKatex(f) {
    if (window.renderMathInElement && window.katex) return f();
    var n = 0, t = setInterval(function () { if ((window.renderMathInElement && window.katex) || ++n > 100) { clearInterval(t); f(); } }, 50);
  }

  /* Un élève ne voit que les fiches ouvertes par son professeur ;
     le propriétaire voit tout (aperçu). auth.js a déjà fermé la page
     à tous les autres. */
  document.addEventListener('ecg:pret', function (e) {
    var moi = (e && e.detail) || {};
    var params = new URLSearchParams(location.search), eleve = params.get('eleve');
    var retourLien = document.getElementById('retour-espace');
    if (moi.role === 'admin') {
      if (retourLien) retourLien.href = eleve ? '../cours-particuliers.html?eleve=' + encodeURIComponent(eleve) : '../mes-eleves.html';
      if (retourLien && !eleve) retourLien.textContent = '← Mes élèves';
      quandKatex(lancer);
      return;
    }
    ECGAuth.client().then(function (c) {
      return c.from('cp_fiches_ouvertes').select('numero').eq('eleve', moi.id).eq('numero', N);
    }).then(function (r) {
      if (r.error || !r.data || !r.data.length) {
        document.getElementById('cours').innerHTML = '<p class="chargement">Cette fiche n\'est pas encore ouverte dans ton espace.<br><a href="../cours-particuliers.html">← Mon espace</a></p>';
        return;
      }
      quandKatex(lancer);
    }).catch(function () { quandKatex(lancer); });
  });

  window.CPFiche = { lire: lire, val: val, tex: tex, defautForme: defautForme };
})();
