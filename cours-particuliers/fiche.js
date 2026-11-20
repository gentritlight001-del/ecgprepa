/* ══════════════════════════════════════════════════════════════
   Fiches de cours de l'espace de cours particuliers de maths (seconde, première…).
   - formules en KaTeX : \( … \) dans le texte, \[ … \] en bloc ;
   - gabarit « manuel interactif » (fiche.css) : une partie = section.fx-partie
     avec le cours (.fx-cours) et « À toi de jouer » (aside.fx-exos) en face ;
   - exercices où l'élève tape sa réponse (racines carrées, fractions,
     puissances) : <div class="rep" data-attendu="2√3" data-forme="…"
     data-indice="…"><span class="rep-q">…</span></div>, aperçu KaTeX en direct,
     vérification à la demande, indice sur demande ;
   - questions à choix : <div class="qcm" data-bonne="<n° du bouton, dès 1>"> ;
   - progression : barres de chaque partie (.fx-p-score), panneau replié quand
     la partie est réussie ;
   - UNE SEULE réponse par question : l'élève valide (après confirmation), elle est
     enregistrée dans Supabase (table cp_reponses, supabase/cp-reponses.sql) et ne
     peut plus être modifiée ; la correction d'un exercice s'ouvre quand toutes ses
     questions ont reçu une réponse ;
   - trois modes : « élève » (réponses enregistrées), « lecture » (le professeur
     ouvre la fiche avec ?eleve=<id> et voit les réponses de l'élève), « aperçu »
     (le professeur sans ?eleve : on peut tout refaire, rien n'est enregistré) ;
   - le numéro de la fiche (« Fiche 1 ») est le rang dans lequel le professeur l'a
     ouverte à cet élève (cp_fiches_ouvertes.ouverte_le), pas un numéro de bibliothèque ;
   - un élève ne voit que les fiches que son professeur lui a ouvertes.
   Formes (data-forme) : « nombre » (sans racine), « simplifiee » (a√b
   réduit, racines regroupées, pas de racine au dénominateur).
   ══════════════════════════════════════════════════════════════ */
(function () {
  var N = +(document.body.getAttribute('data-fiche') || 0);
  var VERSION = document.body.getAttribute('data-version');
  var CLE = 'ecg-cp-fiche:' + N + (VERSION ? ':v' + VERSION : '');   /* nouvelle version = exercices déplacés : réponses repartent de zéro */

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
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  /* ─── Contexte : qui regarde la fiche ? ─────────────────── */
  var CTX = { mode: 'apercu', eleve: null, client: null, rows: {} };
  var ETAT = { juste: 'Juste', presque: 'Presque', faux: 'Pas juste' };
  /* Aperçu du professeur seulement : réponses gardées dans le navigateur */
  var MEM = {};
  try { MEM = JSON.parse(localStorage.getItem(CLE) || '{}') || {}; } catch (e) { MEM = {}; }
  function garder() { try { localStorage.setItem(CLE, JSON.stringify(MEM)); } catch (e) {} }

  /* Texte d'un énoncé, formules comprises (\( … \)), pour que le professeur le relise */
  function texteDe(node) {
    if (!node) return '';
    var c = node.cloneNode(true);
    Array.prototype.forEach.call(c.querySelectorAll('.katex'), function (k) {
      var a = k.querySelector('annotation');
      k.parentNode.replaceChild(document.createTextNode('\\(' + (a ? a.textContent : k.textContent) + '\\)'), k);
    });
    return c.textContent.replace(/\s+/g, ' ').trim();
  }
  function enonceDe(item, sel) {
    var exo = item.closest ? item.closest('.exo-cp') : null, t = exo ? exo.querySelector('.exo-t b') : null;
    var q = texteDe(item.querySelector(sel));
    return ((t ? texteDe(t) + ' · ' : '') + q).slice(0, 600);
  }
  function safeTex(texte) { try { return tex(lire(texte)); } catch (e) { return String(texte).replace(/[\\{}]/g, ''); } }

  /* Enregistre la réponse (une seule fois : la clé primaire refuse un second essai) */
  function enregistrer(id, ligne, ok, ko) {
    var cl = CTX.client;
    var corps = { eleve: CTX.eleve, fiche: N, question: id, enonce: ligne.enonce, reponse: ligne.reponse, attendu: ligne.attendu, etat: ligne.etat };
    cl.from('cp_reponses').insert(corps).then(function (r) {
      if (!r.error) { ok(corps); return; }
      if (r.error.code === '23505') {        /* déjà répondu (autre onglet, autre appareil) : on montre la réponse déjà enregistrée */
        cl.from('cp_reponses').select('*').eq('eleve', CTX.eleve).eq('fiche', N).eq('question', id).then(function (s) {
          if (s.data && s.data[0]) ok(s.data[0]); else ko(r.error);
        }, ko);
        return;
      }
      ko(r.error);
    }, ko);
  }

  /* ─── Progression ─────────────────────────────────────────── */
  function reussi(x) {
    var items = x.querySelectorAll('.rep, .qcm');
    return !!items.length && Array.prototype.every.call(items, function (i) { return i.classList.contains('juste'); });
  }
  /* La correction d'un exercice s'ouvre quand toutes ses questions ont reçu une réponse (mode élève) */
  function majCorrections() {
    if (CTX.mode !== 'eleve') return;
    Array.prototype.forEach.call(document.querySelectorAll('details.corr'), function (d) {
      var exo = d.closest('.exo-cp'), s = d.querySelector('summary');
      if (!exo || !s) return;
      if (!s.getAttribute('data-orig')) {
        s.setAttribute('data-orig', s.textContent);
        s.addEventListener('click', function (e) { if (d.classList.contains('verrou')) e.preventDefault(); });
      }
      var items = exo.querySelectorAll('.rep, .qcm');
      var tout = Array.prototype.every.call(items, function (i) { return i.classList.contains('fige'); });
      d.classList.toggle('verrou', !tout);
      if (!tout) { d.open = false; s.textContent = 'Correction : elle s\'ouvre quand tu as répondu à toutes les questions'; }
      else s.textContent = s.getAttribute('data-orig');
    });
  }
  function compter() {
    var exos = document.querySelectorAll('.exo-cp'), ok = 0;
    Array.prototype.forEach.call(exos, function (x) { var r = reussi(x); x.classList.toggle('reussi', r); if (r) ok++; });
    var total = exos.length;
    var sc = document.getElementById('score');
    if (sc) {
      var c = sc.querySelector('.arc'), t = sc.querySelector('.pct');
      var L = 2 * Math.PI * 27;
      if (c) c.setAttribute('stroke-dasharray', (total ? L * ok / total : 0).toFixed(1) + ' ' + L.toFixed(1));
      if (t) t.textContent = (total ? Math.round(100 * ok / total) : 0) + ' %';
      var b = sc.querySelector('b'); if (b) b.textContent = ok + ' sur ' + total;
      var s = sc.querySelector('.txt'); if (s) s.textContent = ok > 1 ? 'exercices réussis' : 'exercice réussi';
    }
    Array.prototype.forEach.call(document.querySelectorAll('.fx-partie'), function (p) {
      var ex = p.querySelectorAll('.exo-cp'), n = 0;
      Array.prototype.forEach.call(ex, function (x) { if (x.classList.contains('reussi')) n++; });
      var z = p.querySelector('.fx-p-score');
      if (z && ex.length) {
        z.classList.toggle('fini', n === ex.length);
        z.innerHTML = n + (n > 1 ? ' exercices réussis' : ' exercice réussi') + ' sur ' + ex.length +
          ' <span class="fx-barres" aria-hidden="true">' + Array.prototype.map.call(ex, function (x) { return '<i' + (x.classList.contains('reussi') ? ' class="ok"' : '') + '></i>'; }).join('') + '</span>';
      }
      var a = p.querySelector('.fx-exos');
      if (a && ex.length) {
        var fini = n === ex.length, avant = a.classList.contains('fini');
        a.classList.toggle('fini', fini);
        if (!fini) a.classList.remove('ouvert');
        if (fini && !avant && compter.pret) a.classList.add('ouvert');   /* on vient de finir : on laisse ouvert */
      }
    });
    majCorrections();
  }

  /* ─── Retour affiché sous une question ────────────────────── */
  function retour(r, etat, html, indice) {
    r.className = 'retour ' + etat;
    r.hidden = !html && !indice;
    r.innerHTML = html || '';
    if (indice) {
      var b = el('button', 'indice-btn', 'Besoin d\'un indice ?');
      b.type = 'button';
      b.addEventListener('click', function () { b.remove(); var d = el('span', 'indice', '<b>Indice :</b> ' + indice); r.appendChild(d); rendre(d); r.hidden = false; });
      r.appendChild(b);
    }
    rendre(r);
  }

  /* ─── Une réponse à taper ─────────────────────────────────── */
  function evaluer(rep, v) {
    var ast;
    try { ast = lire(v); } catch (e) { return { etat: 'illisible' }; }
    var attendu = val(lire(rep.getAttribute('data-attendu'))), x = val(ast);
    var egal = isFinite(x) && Math.abs(x - attendu) < 1e-9 * Math.max(1, Math.abs(attendu));
    if (!egal) return { etat: 'faux' };
    var d = defautForme(ast, rep.getAttribute('data-forme'));
    return d ? { etat: 'presque', defaut: d } : { etat: 'juste' };
  }
  function champ(rep, id) {
    var mode = CTX.mode, indice = rep.getAttribute('data-indice');
    var z = el('div', 'rep-z');
    var boite = el('div', 'rep-champ');
    var input = el('input');
    input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
    input.setAttribute('autocapitalize', 'off'); input.setAttribute('inputmode', 'text');
    input.setAttribute('aria-label', 'Ta réponse' + (rep.querySelector('.rep-q') ? ' : ' + rep.querySelector('.rep-q').textContent.replace(/=\s*$/, '').trim() : ''));
    input.placeholder = 'ta réponse';
    var ap = el('span', 'rep-apercu'); ap.setAttribute('aria-hidden', 'true');
    var bouton = el('button', 'verifier', mode === 'eleve' ? 'Valider' : 'Vérifier'); bouton.type = 'button';
    var etat = el('span', 'etat', 'Juste');
    boite.appendChild(input); boite.appendChild(ap); boite.appendChild(bouton); boite.appendChild(etat);
    var outils = el('div', 'rep-outils');
    [['√', '√()', -1, 'Racine carrée'], ['x²', '^2', 0, 'Au carré'], ['a/b', '/', 0, 'Fraction'], ['( )', '()', -1, 'Parenthèses']].forEach(function (b) {
      var bt = el('button', '', b[0]); bt.type = 'button'; bt.setAttribute('aria-label', b[3]);
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
    outils.appendChild(el('span', '', mode === 'eleve' ? 'Entrée pour valider' : 'Entrée pour vérifier'));
    var ret = el('div', 'retour'); ret.hidden = true; ret.setAttribute('aria-live', 'polite');
    z.appendChild(boite); z.appendChild(outils); z.appendChild(ret);
    rep.appendChild(z);

    var figee = false, confirmation = false, minuteur = null;
    function etats(e) { rep.classList.remove('juste', 'faux', 'presque'); if (e) rep.classList.add(e); }
    function indiceInitial() { if (mode === 'eleve' && indice && !figee) retour(ret, '', '', indice); }
    function apercu() {
      if (figee) return;
      etats(''); retour(ret, '', '');
      annuler();
      var v = input.value.trim();
      if (!v) { ap.textContent = ''; indiceInitial(); return; }
      try { katexDans(ap, tex(lire(v))); ap.classList.remove('illisible'); }
      catch (e) { ap.textContent = '…'; ap.classList.add('illisible'); }
      indiceInitial();
    }

    /* Réponse définitive : champ verrouillé, résultat affiché */
    function figer(ligne) {
      figee = true; CTX.rows[id] = ligne;
      clearTimeout(minuteur);
      input.value = ligne.reponse; input.readOnly = true; input.setAttribute('aria-readonly', 'true');
      rep.classList.add('fige'); etats(ligne.etat);
      etat.textContent = ETAT[ligne.etat] || '';
      outils.hidden = true; bouton.hidden = true;
      try { katexDans(ap, tex(lire(ligne.reponse))); ap.classList.remove('illisible'); } catch (e) { ap.textContent = ''; }
      var msg = '';
      if (ligne.etat === 'presque') { var ev = evaluer(rep, ligne.reponse); msg = 'La valeur est juste. ' + (ev.defaut || ''); }
      else if (ligne.etat === 'faux') msg = 'Pas juste. La bonne réponse : \\(' + safeTex(rep.getAttribute('data-attendu')) + '\\).';
      retour(ret, ligne.etat === 'juste' ? '' : ligne.etat, msg);
      compter();
    }
    function annuler() {
      confirmation = false; clearTimeout(minuteur);
      bouton.textContent = mode === 'eleve' ? 'Valider' : 'Vérifier'; bouton.classList.remove('confirmer'); bouton.disabled = false;
    }
    /* Élève : un premier appui demande confirmation, le second enregistre pour de bon */
    function valider() {
      if (figee) return;
      var v = input.value.trim();
      if (!v) { retour(ret, 'faux', 'Écris ta réponse d\'abord.'); return; }
      var ev = evaluer(rep, v);
      if (ev.etat === 'illisible') { etats('faux'); retour(ret, 'faux', 'Je n\'arrive pas à lire ta réponse. Pour une racine, utilise la touche √ (ou écris sqrt(12)). Rien n\'est enregistré tant que tu ne confirmes pas.'); return; }
      if (!confirmation) {
        confirmation = true; bouton.textContent = 'Confirmer'; bouton.classList.add('confirmer');
        retour(ret, 'presque', 'Une seule réponse possible. Relis-toi : si c\'est bon, appuie sur « Confirmer ».');
        minuteur = setTimeout(function () { annuler(); apercu(); }, 9000);
        return;
      }
      bouton.disabled = true;
      enregistrer(id, { enonce: enonceDe(rep, '.rep-q'), reponse: v, attendu: rep.getAttribute('data-attendu'), etat: ev.etat }, figer, function () {
        annuler(); retour(ret, 'faux', 'Je n\'ai pas pu enregistrer ta réponse. Vérifie ta connexion et réessaie.');
      });
    }
    /* Aperçu du professeur : on peut recommencer */
    function verifierApercu(silence) {
      var v = input.value.trim();
      MEM[id] = v; garder();
      if (!v) { if (!silence) retour(ret, 'faux', 'Écris ta réponse d\'abord.'); return; }
      var ev = evaluer(rep, v);
      if (ev.etat === 'illisible') { etats('faux'); retour(ret, 'faux', 'Je n\'arrive pas à lire ta réponse. Pour une racine, utilise la touche √ (ou écris sqrt(12)).'); compter(); return; }
      if (ev.etat === 'faux') { etats('faux'); retour(ret, 'faux', silence ? '' : 'Pas encore.', silence ? null : (indice || 'relis le cours juste à gauche.')); compter(); return; }
      if (ev.etat === 'presque') { etats('presque'); retour(ret, 'presque', silence ? '' : 'La valeur est juste. ' + ev.defaut); compter(); return; }
      etats('juste'); retour(ret, '', ''); compter();
    }

    if (mode === 'lecture') {
      outils.hidden = true; bouton.hidden = true; input.readOnly = true;
      if (CTX.rows[id]) figer(CTX.rows[id]);
      else { rep.classList.add('sans-reponse'); input.placeholder = 'pas encore répondu'; retour(ret, '', 'Pas encore répondu.'); }
      return;
    }
    input.addEventListener('input', apercu);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (mode === 'eleve') valider(); else verifierApercu(); } });
    bouton.addEventListener('click', function () { if (mode === 'eleve') valider(); else verifierApercu(); });
    if (mode === 'eleve') {
      if (CTX.rows[id]) figer(CTX.rows[id]); else indiceInitial();
    } else if (MEM[id]) { input.value = MEM[id]; apercu(); verifierApercu(true); }
  }

  /* ─── Une question à choix ────────────────────────────────── */
  function qcm(q, id) {
    var mode = CTX.mode, indice = q.getAttribute('data-indice');
    var bts = q.querySelectorAll('.qcm-choix button');
    var ret = el('div', 'retour'); ret.hidden = true; ret.setAttribute('aria-live', 'polite');
    var bonne = +q.getAttribute('data-bonne') - 1;
    var figee = false, choix = -1, confirmation = false, minuteur = null, valider = null;
    Array.prototype.forEach.call(bts, function (b) { b.type = 'button'; });
    q.appendChild(ret);
    if (mode === 'eleve') { valider = el('button', 'verifier qcm-valider', 'Valider mon choix'); valider.type = 'button'; valider.hidden = true; q.appendChild(valider); }
    function indiceInitial() { if (mode === 'eleve' && indice && !figee) retour(ret, '', '', indice); }

    function figer(ligne) {
      figee = true; CTX.rows[id] = ligne; clearTimeout(minuteur);
      var i = -1;
      Array.prototype.forEach.call(bts, function (b, j) { b.disabled = true; b.setAttribute('aria-pressed', 'false'); b.classList.remove('bon', 'mauvais'); if (b.textContent.trim() === ligne.reponse) i = j; });
      if (i >= 0) { bts[i].setAttribute('aria-pressed', 'true'); bts[i].classList.add(i === bonne ? 'bon' : 'mauvais'); }
      if (bts[bonne]) bts[bonne].classList.add('bon');
      q.classList.add('fige'); q.classList.toggle('juste', ligne.etat === 'juste');
      if (valider) valider.hidden = true;
      retour(ret, ligne.etat === 'juste' ? 'ok' : 'faux', ligne.etat === 'juste' ? 'Juste.' : 'Pas juste. La bonne réponse est en vert.');
      compter();
    }
    function annuler() { confirmation = false; clearTimeout(minuteur); if (valider) { valider.textContent = 'Valider mon choix'; valider.classList.remove('confirmer'); valider.disabled = false; } }
    function selectionner(i) {
      choix = i; annuler();
      Array.prototype.forEach.call(bts, function (b, j) { b.setAttribute('aria-pressed', String(j === i)); });
      valider.hidden = false;
      retour(ret, '', '', indice);
    }
    function confirmer() {
      if (figee || choix < 0) return;
      if (!confirmation) {
        confirmation = true; valider.textContent = 'Confirmer'; valider.classList.add('confirmer');
        retour(ret, 'presque', 'Une seule réponse possible. Si ton choix est bon, appuie sur « Confirmer ».');
        minuteur = setTimeout(function () { annuler(); retour(ret, '', '', indice); }, 9000);
        return;
      }
      valider.disabled = true;
      enregistrer(id, { enonce: enonceDe(q, '.qcm-q'), reponse: bts[choix].textContent.trim(), attendu: bts[bonne].textContent.trim(), etat: choix === bonne ? 'juste' : 'faux' }, figer, function () {
        annuler(); retour(ret, 'faux', 'Je n\'ai pas pu enregistrer ta réponse. Vérifie ta connexion et réessaie.');
      });
    }
    /* Aperçu du professeur : on peut recommencer */
    function choisirApercu(i, silence) {
      MEM[id] = i; garder();
      Array.prototype.forEach.call(bts, function (b, j) { b.setAttribute('aria-pressed', String(j === i)); b.classList.remove('bon', 'mauvais'); });
      if (i === bonne) { bts[i].classList.add('bon'); q.classList.add('juste'); retour(ret, 'ok', silence ? '' : 'Juste.'); }
      else {
        bts[i].classList.add('mauvais'); q.classList.remove('juste');
        retour(ret, 'faux', silence ? '' : 'Pas encore.', silence ? null : indice);
      }
      compter();
    }

    if (mode === 'lecture') {
      if (CTX.rows[id]) figer(CTX.rows[id]);
      else { Array.prototype.forEach.call(bts, function (b) { b.disabled = true; }); q.classList.add('sans-reponse'); retour(ret, '', 'Pas encore répondu.'); }
      return;
    }
    if (mode === 'eleve') {
      Array.prototype.forEach.call(bts, function (b, i) { b.addEventListener('click', function () { if (!figee) selectionner(i); }); });
      valider.addEventListener('click', confirmer);
      if (CTX.rows[id]) figer(CTX.rows[id]); else indiceInitial();
      return;
    }
    Array.prototype.forEach.call(bts, function (b, i) { b.addEventListener('click', function () { choisirApercu(i); }); });
    if (typeof MEM[id] === 'number' && bts[MEM[id]]) choisirApercu(MEM[id], true);
  }

  /* ─── Courbe de la fonction racine carrée (curseur) ───────── */
  function courbe(box) {
    var L = 400, H = 220, X0 = 34, Y0 = 194, sx = (L - 52) / 9, sy = 46;   /* x de 0 à 9, y de 0 à 3,5 */
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
  function bandeau(html, cls) {
    var tete = document.querySelector('.fx-tete');
    if (!tete) return;
    var d = el('div', 'fx-bandeau ' + (cls || ''), html);
    tete.parentNode.insertBefore(d, tete);
  }
  function lancer() {
    rendre(document.getElementById('cours'));
    rendre(document.querySelector('.fx-tete'));
    if (CTX.mode === 'lecture') bandeau('<b>Réponses de l\'élève</b> · lecture seule. Tu vois ce qu\'il a répondu à chaque question ; rien ne peut être modifié ici.', 'lecture');
    if (CTX.mode === 'apercu') bandeau('<b>Aperçu du professeur</b> · tu peux tout refaire, rien n\'est enregistré. Pour voir les réponses d\'un élève, ouvre sa fiche depuis « Mes élèves ».', 'apercu');
    Array.prototype.forEach.call(document.querySelectorAll('.rep'), function (l, i) { champ(l, 'r' + i); });
    Array.prototype.forEach.call(document.querySelectorAll('.qcm'), function (q, i) { qcm(q, 'q' + i); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-courbe]'), courbe);
    if (CTX.mode === 'eleve') {
      Array.prototype.forEach.call(document.querySelectorAll('.fx-exos-c'), function (c) {
        c.insertBefore(el('p', 'fx-unique', 'Une seule réponse par question : relis-toi avant de confirmer. Ton professeur peut voir tes réponses.'), c.firstChild);
      });
    }
    Array.prototype.forEach.call(document.querySelectorAll('.fx-exos'), function (a) {
      var b = a.querySelector('.fx-reussi button');
      if (b) b.addEventListener('click', function () { a.classList.add('ouvert'); });
    });
    compter();
    compter.pret = true;
    var raz = document.getElementById('raz');
    if (raz) raz.addEventListener('click', function () {
      if (CTX.mode !== 'apercu') return;
      if (!confirm('Effacer toutes tes réponses de cette fiche ?')) return;
      MEM = {}; garder(); location.reload();
    });
    var imp = document.getElementById('imprimer');
    if (imp) imp.addEventListener('click', function () { window.print(); });
  }
  function quandKatex(f) {
    if (window.renderMathInElement && window.katex) return f();
    var n = 0, t = setInterval(function () { if ((window.renderMathInElement && window.katex) || ++n > 100) { clearInterval(t); f(); } }, 50);
  }
  function badge(texte) {
    var b = document.querySelector('.fx-badges .fx-badge');
    if (b) b.textContent = texte;
  }
  function fermee(msg) {
    document.getElementById('cours').innerHTML = '<p class="fx-ferme">' + msg + '<br><a href="../cours-particuliers.html">← Mon espace</a></p>';
  }

  /* Un élève ne voit que les fiches ouvertes par son professeur ; le professeur voit tout.
     auth.js a déjà fermé la page à tous les autres. */
  document.addEventListener('ecg:pret', function (e) {
    var moi = (e && e.detail) || {};
    var params = new URLSearchParams(location.search), eleve = params.get('eleve');
    var retourLien = document.getElementById('retour-espace');
    var admin = moi.role === 'admin';
    if (admin) {
      if (retourLien) retourLien.href = eleve ? '../cours-particuliers.html?eleve=' + encodeURIComponent(eleve) : '../mes-eleves.html';
      if (retourLien && !eleve) retourLien.textContent = '← Mes élèves';
    }
    if (admin && !eleve) { CTX.mode = 'apercu'; badge('Aperçu'); quandKatex(lancer); return; }
    CTX.mode = admin ? 'lecture' : 'eleve';
    CTX.eleve = admin ? eleve : moi.id;
    ECGAuth.client().then(function (c) {
      CTX.client = c;
      return Promise.all([
        c.from('cp_fiches_ouvertes').select('numero,ouverte_le').eq('eleve', CTX.eleve).order('ouverte_le', { ascending: true }).order('numero', { ascending: true }),
        c.from('cp_reponses').select('*').eq('eleve', CTX.eleve).eq('fiche', N)
      ]);
    }).then(function (rs) {
      var ouv = rs[0].data || [];
      var rang = -1;
      ouv.forEach(function (o, i) { if (o.numero === N) rang = i; });
      if (!admin && (rs[0].error || rang < 0)) { fermee('Cette fiche n\'est pas encore ouverte dans ton espace.'); return; }
      if (rs[1].error && !admin) { fermee('Je n\'arrive pas à charger tes réponses. Réessaie dans un instant.'); return; }
      /* « Fiche 1 » = la première fiche ouverte à cet élève, etc. */
      badge(rang >= 0 ? 'Fiche ' + (rang + 1) : 'Fiche');
      (rs[1].data || []).forEach(function (r) { CTX.rows[r.question] = r; });
      quandKatex(lancer);
    }).catch(function () { fermee('Je n\'arrive pas à ouvrir cette fiche. Réessaie dans un instant.'); });
  });

  window.CPFiche = { lire: lire, val: val, tex: tex, defautForme: defautForme };
})();
