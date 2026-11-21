/* Thème du jour (flashcards/theme.html) : un texte de presse en français à traduire, écrit chaque nuit avec les
   mots des paquets de langue, puis corrigé et noté sur 20 dans le navigateur (theme-correcteur.js).

   Adresse : theme.html#anglais (le plus récent) ou #anglais/AAAA-MM-JJ.
   Données : themes/liste.js (ECG_THEMES, chargé par la page) et themes/<langue>/<date>.js (chargé ici).
   S'adapte à l'élève à partir de ses flashcards (synchro.js) : un mot dont il a déjà vu la carte est souligné en
   vert, sans aide ; les mots nouveaux pour lui ont une traduction cachée, à révéler. Une seule correction par
   thème : réponses, note et « compter comme juste » sont gardés dans D.prefs.themes["<langue>/<date>"], donc
   synchronisés avec le compte ; l'historique et la progression sont dans themes.html (themes-espace.js). Les cartes choisies après la correction vont dans un paquet perso
   « Mes thèmes d'<langue> » (id theme-<langue>) ; celles des fautes reviennent dès le lendemain. */
(function () {
  'use strict';
  var C = window.ECGThemeCorrecteur, SYNC = window.ECGFlashSync;
  var LISTE = window.ECG_THEMES || {};
  var app = document.getElementById('app');
  var LANGUES = {
    anglais: { nom: 'anglais', Nom: 'Anglais', titrePerso: 'Mes thèmes d’anglais', lecons: '../premiere_annee/langues/anglais/', lang: 'en' }
  };
  var TYPES = {
    grammaire: 'Grammaire', 'faux-sens': 'Faux-sens', contresens: 'Contresens', gallicisme: 'Gallicisme',
    barbarisme: 'Barbarisme', oubli: 'Oubli', orthographe: 'Orthographe'
  };
  var GRAVES = { grammaire: 1, 'faux-sens': 1, contresens: 1 };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }
  /* Typographie française (texte français seulement, jamais l'anglais) */
  function typo(s) {
    return String(s == null ? '' : s).replace(/'/g, '’').replace(/ ([:;!?»%])/g, ' $1').replace(/« /g, '« ')
      .replace(/(\d) (\d{3})/g, '$1 $2');
  }
  function t(s) { return typo(esc(s)); }
  /* Explications du corrigé : HTML écrit par nous (<b>), typographie appliquée hors des balises */
  function h(s) { return String(s || '').split(/(<[^>]+>)/).map(function (x) { return x.charAt(0) === '<' ? x : typo(x); }).join(''); }
  function note(x) { return String(Math.round(x * 100) / 100).replace('.', ','); }
  function pl(n, un, plusieurs) { return n + ' ' + (n > 1 ? (plusieurs || un + 's') : un); }
  function dateLongue(d) {
    var x = new Date(d + 'T12:00:00');
    return x.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, function (c) { return c.toUpperCase(); });
  }
  function norme(s) { return String(s || '').trim().toLowerCase(); }
  function sansReperes(s) { return String(s || '').replace(/\(\(|\)\)|\[\[|\]\]/g, ''); }
  function lire(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage bloqué */ } }

  /* ─── Données de l'élève (flashcards) ─── */
  var D = null;
  function donnees() {
    var d = (SYNC && SYNC.charger()) || (SYNC ? SYNC.neuf() : { mes: [], perso: [], srs: {}, prefs: {} });
    if (!d.prefs || typeof d.prefs !== 'object') d.prefs = {};
    if (!d.prefs.themes || typeof d.prefs.themes !== 'object') d.prefs.themes = {};
    if (!Array.isArray(d.mes)) d.mes = [];
    if (!Array.isArray(d.perso)) d.perso = [];
    if (!d.srs || typeof d.srs !== 'object') d.srs = {};
    return d;
  }
  function sauver() { if (SYNC) SYNC.enregistrer(D); }
  function connue(langue, id) { var st = D.srs[langue + '/' + id]; return !!(st && st.s); }
  function persoDe(langue) {
    for (var i = 0; i < D.perso.length; i++) if (D.perso[i].id === 'theme-' + langue) return D.perso[i];
    return null;
  }
  function connecte() { return !!(SYNC && SYNC.etat && SYNC.etat() !== 'non-connecte'); }

  /* ─── Navigation ─── */
  var CHARGES = {};
  function charger(langue, date) {
    var cle = langue + '/' + date;
    if (window.ECG_THEMES_DONNEES && window.ECG_THEMES_DONNEES[cle]) return Promise.resolve(window.ECG_THEMES_DONNEES[cle]);
    if (!CHARGES[cle]) CHARGES[cle] = new Promise(function (ok, ko) {
      var s = document.createElement('script');
      s.src = 'themes/' + langue + '/' + date + '.js?v=' + Math.floor(Date.now() / 60000);
      s.onload = function () { var T = window.ECG_THEMES_DONNEES && window.ECG_THEMES_DONNEES[cle]; if (T) ok(T); else ko(); };
      s.onerror = function () { delete CHARGES[cle]; ko(); };
      document.head.appendChild(s);
    });
    return CHARGES[cle];
  }
  var courant = null;      // { T, langue, cle }
  var reveles = {};        // aides révélées, par thème
  function route() {
    var h0 = decodeURIComponent(location.hash.replace(/^#/, '')), p = h0.split('/');
    var langue = LANGUES[p[0]] ? p[0] : 'anglais';
    var liste = LISTE[langue] || [];
    var date = p[1] || (liste[0] && liste[0].date);
    D = donnees();
    if (!date) { app.innerHTML = '<p class="fc-vide">' + t('Pas encore de thème pour cette langue.') + '</p>'; return; }
    app.innerHTML = '<p class="fc-vide">Chargement du thème…</p>';
    charger(langue, date).then(function (T) {
      courant = { T: T, langue: langue, cle: langue + '/' + date };
      rendre();
    }, function () {
      app.innerHTML = '<p class="fc-vide">' + t('Ce thème n’a pas pu être chargé. Vérifie ta connexion, puis recharge la page.') + '</p>';
    });
  }
  window.addEventListener('hashchange', function () { route(); window.scrollTo(0, 0); });
  if (SYNC) SYNC.surChangement(function () { if (courant) { D = donnees(); rendre(true); } });

  function fil(nom) {
    var c = document.querySelector('.breadcrumb .current');
    if (c) c.textContent = nom;
  }
  function rendre(garderDefilement) {
    var y = window.scrollY;
    var R = D.prefs.themes[courant.cle];
    if (R && Array.isArray(R.r)) pageCorrige(R); else pageTheme();
    if (garderDefilement) window.scrollTo(0, y);
  }

  /* ─── Le thème à traduire ─── */
  function texteFr(p, langue) {
    var k = 0, a = 0;
    return typo(esc(p.fr)).replace(/\(\((.+?)\)\)|\[\[(.+?)\]\]/g, function (x, carte, aide) {
      if (carte != null) {
        var c = (p.cartes || [])[k++];
        return '<span class="' + (c && connue(langue, c.id) ? 'th-connu' : 'th-nouveau') + '">' + carte + '</span>';
      }
      a++;
      return '<span class="th-nouveau">' + aide + '</span>';
    });
  }
  function aidesDe(p, langue) {
    var l = (p.aides || []).map(function (x) { return { fr: x.fr, en: x.en }; });
    (p.cartes || []).forEach(function (c) { if (!connue(langue, c.id)) l.push({ fr: c.fr, en: c.en }); });
    return l;
  }
  function pageTheme() {
    var T = courant.T, L = LANGUES[courant.langue], brouillon = lire('ecg-theme-brouillon:' + courant.cle) || [];
    var rev = reveles[courant.cle] = reveles[courant.cle] || {};
    var aConnus = false;
    T.phrases.forEach(function (p) { (p.cartes || []).forEach(function (c) { if (connue(courant.langue, c.id)) aConnus = true; }); });
    fil('Thème du jour');
    document.title = 'ECG Prépa — Thème : ' + sansReperes(T.titre);
    var html = '<header class="th-tete"><div class="sur">' + t('Thème du jour · ' + L.Nom + ' · ' + dateLongue(T.date)) + '</div>' +
      '<h1>' + t(T.titre) + '</h1>' +
      '<p class="hero-txt">' + t('Cinq phrases à traduire en ' + L.nom + ', écrites avec les mots de tes flashcards et la grammaire de tes derniers jours. Compte 15 minutes.') + '</p></header>' +
      '<section class="th-papier" aria-label="Le texte">' +
        '<div class="th-legende">' + (aConnus ? '<span><i class="l-connu"></i>Dans tes flashcards</span>' : '') +
        '<span><i class="l-nouveau"></i>' + t('Mot nouveau : traduction cachée, à révéler si besoin') + '</span></div>' +
        '<p class="th-texte">' + T.phrases.map(function (p, i) { return '<b class="th-n">' + (i + 1) + '</b>' + texteFr(p, courant.langue); }).join(' ') + '</p>' +
      '</section>' +
      '<section class="th-trad" aria-label="Ta traduction"><h2>Ta traduction</h2>' +
      T.phrases.map(function (p, i) {
        var aides = aidesDe(p, courant.langue);
        return '<div class="th-ligne"><div class="th-fr"><b>' + (i + 1) + '</b>' + t(sansReperes(p.fr)) + '</div>' +
          (aides.length ? '<div class="th-aides">' + aides.map(function (a, k) {
            var id = i + '-' + k;
            return rev[id] ? '<span class="th-aide vue"><span>' + t(a.fr) + '\u00a0: <span lang="' + L.lang + '">' + esc(a.en) + '</span></span></span>'
              : '<button type="button" class="th-aide" data-a="reveler" data-id="' + id + '">' + t(a.fr) + ' · Voir en ' + L.nom + '</button>';
          }).join('') + '</div>' : '') +
          '<label class="sr" for="th-r' + i + '">' + t('Traduction de la phrase ' + (i + 1)) + '</label>' +
          '<textarea id="th-r' + i + '" data-i="' + i + '" rows="3" lang="' + L.lang + '" spellcheck="false" autocomplete="off" autocapitalize="sentences" placeholder="Écris ta traduction…">' + esc(brouillon[i] || '') + '</textarea></div>';
      }).join('') +
      '<div class="th-envoi"><button type="button" class="btn plein gros" data-a="corriger">Corriger mon thème</button>' +
      '<span>' + t('Une seule correction : relis-toi avant. Ta note est gardée ' + (connecte() ? 'dans ton compte.' : 'dans ce navigateur.')) + '</span></div></section>' +
      precedents();
    app.innerHTML = html;
    app.querySelectorAll('textarea').forEach(function (z) {
      z.addEventListener('input', function () {
        var b = lire('ecg-theme-brouillon:' + courant.cle) || [];
        b[+z.getAttribute('data-i')] = z.value;
        ecrire('ecg-theme-brouillon:' + courant.cle, b);
      });
    });
  }

  /* ─── Correction ─── */
  function resultats(R) {
    var T = courant.T, j = R.j || {};
    return T.phrases.map(function (p, i) {
      var r = C.corrigerPhrase(p, R.r[i] || '');
      r.morceaux.forEach(function (m, k) {
        if (m.etat === 'inconnu' && j[i + '-' + k]) { m.etat = 'compte'; m.pts = p.morceaux[k].pts; }
      });
      if (r.morceaux.some(function (m) { return m.etat === 'compte'; })) {
        r.pts = C.arrondi(Math.max(0, r.morceaux.reduce(function (s, m) { return s + m.pts; }, 0) - C.FRAPPE * r.ortho.length));
      }
      return r;
    });
  }
  function corriger() {
    var T = courant.T, r = [];
    T.phrases.forEach(function (p, i) { var z = document.getElementById('th-r' + i); r.push(z ? z.value.trim() : ''); });
    var vides = r.filter(function (x) { return !x; }).length;
    if (vides === r.length) { var z0 = document.getElementById('th-r0'); if (z0) z0.focus(); return; }
    if (vides && !window.confirm(typo((vides > 1 ? vides + ' phrases ne sont pas traduites' : 'Une phrase n’est pas traduite') + ' : elles compteront zéro. Corriger quand même ?'))) return;
    var R = { r: r, j: {}, t: Date.now() };
    R.n = total(resultats(R));
    D.prefs.themes[courant.cle] = R;
    sauver();
    try { localStorage.removeItem('ecg-theme-brouillon:' + courant.cle); } catch (e) { /* rien */ }
    rendre();
    window.scrollTo(0, 0);
  }
  function total(res) { return C.arrondi(res.reduce(function (s, r) { return s + r.pts; }, 0)); }

  function surligner(brut, zones) {
    var mots = String(brut || '').split(/(\s+)/), idx = [], k = 0;
    mots.forEach(function (m, i) { if (m && !/^\s+$/.test(m)) idx.push(i); });
    var classe = {};
    zones.forEach(function (z) {
      var r = C.situer(brut, z.passage);
      if (!r) return;
      for (var a = r[0]; a <= r[1]; a++) if (!classe[a] || z.c === 'faux') classe[a] = z.c;
    });
    var out = '', ouvert = null;
    k = 0;
    mots.forEach(function (m) {
      if (!m) return;
      if (/^\s+$/.test(m)) { out += ' '; return; }
      var c = classe[k++] || null;
      if (c !== ouvert) { if (ouvert) out += '</mark>'; if (c) out += '<mark class="s-' + c + '">'; ouvert = c; }
      out += esc(m);
    });
    if (ouvert) out += '</mark>';
    return out.replace(/ <\/mark>/g, '</mark> ');
  }
  function lienLecon(L, l) {
    if (!l) return '';
    return '<a class="th-lecon" href="' + esc(L.lecons + 'lecon' + l.n + '.html' + (l.ancre ? '#' + l.ancre : '')) + '">' + t('Revoir : Leçon ' + l.n + ' · ' + l.titre) + ' →</a>';
  }
  function carteFaute(L, f) {
    var lourd = GRAVES[f.type];
    return '<li class="th-faute"><div class="th-f-tete"><span class="th-badge' + (lourd ? ' grave' : '') + '">' + t((TYPES[f.type] || f.type) + ' · −' + note(f.pts)) + '</span>' +
      '<span class="th-f-corr"><s lang="' + L.lang + '">' + esc(f.faux) + '</s> → <b lang="' + L.lang + '">' + esc(f.juste) + '</b></span></div>' +
      '<p><b>Pourquoi c’est faux.</b> ' + h(f.pourquoi) + '</p>' +
      '<p><b>La règle.</b> ' + h(f.regle) + '</p>' +
      '<p class="th-ex"><b>Exemple.</b> <span lang="' + L.lang + '">' + esc(f.ex) + '</span> <span class="th-exfr">(' + t(f.exfr) + ')</span></p>' +
      lienLecon(L, f.lecon) + '</li>';
  }
  function pageCorrige(R) {
    var T = courant.T, L = LANGUES[courant.langue], res = resultats(R), n = total(res);
    if (R.n !== n) { R.n = n; sauver(); }
    fil('Thème du jour · Corrigé');
    document.title = 'ECG Prépa — Corrigé : ' + sansReperes(T.titre);
    /* Bilan */
    var parType = {}, nFautes = 0, perteType = {}, connus = 0, remployes = 0, inconnus = 0;
    res.forEach(function (r, i) {
      var p = T.phrases[i];
      r.morceaux.forEach(function (m) {
        if (m.etat === 'inconnu') inconnus++;
        m.fautes.forEach(function (f) { nFautes++; parType[f.type] = (parType[f.type] || 0) + 1; perteType[f.type] = (perteType[f.type] || 0) + f.pts; });
      });
      if (r.ortho.length) { parType.orthographe = (parType.orthographe || 0) + r.ortho.length; perteType.orthographe = (perteType.orthographe || 0) + C.FRAPPE * r.ortho.length; }
      (p.cartes || []).forEach(function (c) { if (connue(courant.langue, c.id)) { connus++; if (r.cartes.indexOf(c.id) !== -1) remployes++; } });
    });
    var pire = Object.keys(perteType).sort(function (a, b) { return perteType[b] - perteType[a]; })[0];
    var phrase = n >= 17 ? 'Excellent thème.' : n >= 14 ? 'Très bon thème.' : n >= 11 ? 'Bon thème.' : n >= 8 ? 'Thème correct, avec des points à reprendre.' : 'Thème difficile : reprends les explications une à une, elles sont faites pour ça.';
    if (pire) phrase += ' Ce qui te coûte le plus de points : ' + (pire === 'orthographe' ? 'l’orthographe' : pire === 'grammaire' ? 'la grammaire' : 'les ' + (TYPES[pire] || pire).toLowerCase() + 's') + '.';
    if (connus && remployes === connus) phrase += ' Les mots de tes flashcards sont tous en place.';
    var cases = [
      ['grammaire', 'faute de grammaire', 'fautes de grammaire'],
      ['sens', 'faux-sens ou contresens', 'faux-sens ou contresens'],
      ['forme', 'gallicisme ou barbarisme', 'gallicismes ou barbarismes'],
      ['orthographe', 'faute de frappe', 'fautes de frappe']
    ].map(function (c) {
      var v = c[0] === 'sens' ? (parType['faux-sens'] || 0) + (parType.contresens || 0) + (parType.oubli || 0)
        : c[0] === 'forme' ? (parType.gallicisme || 0) + (parType.barbarisme || 0) : (parType[c[0]] || 0);
      return '<div class="th-case"><b class="' + (v ? 'rouge' : 'vert') + '">' + v + '</b><span>' + t(v > 1 ? c[2] : c[1]) + '</span></div>';
    });
    if (connus) cases.push('<div class="th-case"><b class="' + (remployes === connus ? 'vert' : 'or') + '">' + remployes + ' / ' + connus + '</b><span>' + t('mots de tes flashcards remployés') + '</span></div>');
    else if (inconnus) cases.push('<div class="th-case"><b class="or">' + inconnus + '</b><span>' + t(inconnus > 1 ? 'passages pas reconnus' : 'passage pas reconnu') + '</span></div>');

    var html = '<header class="th-tete"><div class="sur">' + t('Thème du jour · Corrigé · ' + dateLongue(T.date)) + '</div><h1>' + t(T.titre) + '</h1></header>' +
      '<section class="th-note" aria-label="Ta note"><div class="th-sur20"><b>' + note(n) + '</b><span>/ 20</span></div>' +
      '<div class="th-bilan"><p>' + t(phrase) + '</p><div class="th-cases">' + cases.join('') + '</div></div></section>' +
      '<section class="th-phrases" aria-label="Phrase par phrase"><h2>Phrase par phrase</h2>' +
      res.map(function (r, i) { return articlePhrase(T.phrases[i], r, i, R, L); }).join('') + '</section>' +
      apres(res, L) + precedents();
    app.innerHTML = html;
  }
  function articlePhrase(p, r, i, R, L) {
    var brut = R.r[i] || '', zones = [], items = [];
    r.morceaux.forEach(function (m, k) {
      if (m.etat === 'faute') m.passages.forEach(function (x) { zones.push({ passage: x, c: 'faux' }); });
    });
    r.ortho.forEach(function (o) { zones.push({ passage: o.juste, c: 'faux' }); });
    (r.passagesCartes || []).forEach(function (x, k) { if (connue(courant.langue, r.cartes[k])) zones.push({ passage: x, c: 'bien' }); });
    r.morceaux.forEach(function (m, k) {
      var mc = p.morceaux[k];
      if (m.etat === 'faute') m.fautes.forEach(function (f) { items.push(carteFaute(L, f)); });
      else if (m.etat === 'inconnu' || m.etat === 'compte') {
        var compte = m.etat === 'compte';
        items.push('<li class="th-inconnu' + (compte ? ' compte' : '') + '"><div class="th-f-tete"><span class="th-badge neutre">' + (compte ? 'Compté juste' : 'Pas reconnu') + '</span>' +
          '<span>' + t('« ' + mc.fr + ' »') + ' → <b lang="' + L.lang + '">' + esc(mc.en) + '</b></span></div>' +
          '<p>' + t(compte ? 'Tu as compté ta tournure comme juste (+' + note(mc.pts) + ' point' + (mc.pts > 1 ? 's' : '') + ').'
            : 'Ta traduction de ce passage n’est pas dans les réponses prévues. Compare-la avec la proposition : si elle dit la même chose, dans un anglais correct, compte-la juste.') + '</p>' +
          '<button type="button" class="btn petit" data-a="compter" data-k="' + i + '-' + k + '">' + (compte ? 'Annuler' : 'Compter comme juste') + '</button></li>');
      }
    });
    r.ortho.forEach(function (o) {
      items.push('<li class="th-faute"><div class="th-f-tete"><span class="th-badge">' + t('Orthographe · −' + note(C.FRAPPE)) + '</span>' +
        '<span class="th-f-corr"><s lang="' + L.lang + '">' + esc(o.faux) + '</s> → <b lang="' + L.lang + '">' + esc(o.juste) + '</b></span></div>' +
        '<p>' + t('Une lettre de trop, de moins ou inversée : « ' + o.faux + ' » s’écrit « ' + o.juste + ' ». Le correcteur d’un concours la compte comme une faute d’orthographe.') + '</p></li>');
    });
    (p.cartes || []).forEach(function (c) {
      if (connue(courant.langue, c.id) && r.cartes.indexOf(c.id) !== -1) items.push('<li class="th-bien"><span class="th-badge vert">Bien vu</span><span><b lang="' + L.lang + '">' + esc(c.en) + '</b> ' + t(': la carte de tes flashcards est bien remployée.') + '</span></li>');
    });
    var parfait = r.pts === r.total;
    var score = r.vide ? 'rouge' : parfait ? 'vert' : r.pts >= r.total / 2 ? 'or' : 'rouge';
    return '<article class="th-art"><div class="th-art-tete"><div class="th-fr"><b>' + (i + 1) + '</b>' + t(sansReperes(p.fr)) + '</div>' +
      '<div class="th-score ' + score + '">' + note(r.pts) + ' / ' + note(r.total) + '</div></div>' +
      (r.vide ? '<p class="th-vide">' + t('Pas traduite.') + '</p>' : '<p class="th-eleve" lang="' + L.lang + '">' + surligner(brut, zones) + '</p>') +
      (parfait && !r.ortho.length ? '<p class="th-parfait"><span class="th-badge vert">Parfait</span>' + t(' Rien à reprendre dans cette phrase.') + '</p>' : '') +
      (items.length ? '<ol class="th-items">' + items.join('') + '</ol>' : '') +
      '<div class="th-prop"><span>Proposition</span><p lang="' + L.lang + '">' + esc(p.proposition) + '</p>' +
      ((p.autres || []).length ? '<span>Aussi juste</span>' + p.autres.map(function (a) { return '<p lang="' + L.lang + '">' + esc(a) + '</p>'; }).join('') : '') + '</div></article>';
  }

  /* ─── Et maintenant : cartes à garder ─── */
  function candidats(res) {
    var T = courant.T, q = persoDe(courant.langue), deja = {}, vus = {}, nouveaux = [], fautes = [];
    (q ? q.cartes : []).forEach(function (c) { deja[norme(c.v)] = 1; });
    T.phrases.forEach(function (p) {
      (p.aides || []).forEach(function (a) {
        var k = norme(a.en);
        if (!vus[k]) { vus[k] = 1; nouveaux.push({ r: a.fr, v: a.en, x: '', faute: false, deja: !!deja[k] }); }
      });
    });
    res.forEach(function (r) {
      r.morceaux.forEach(function (m) {
        m.fautes.forEach(function (f) {
          if (!f.carte) return;
          var k = norme(f.carte.en);
          if (!vus[k]) { vus[k] = 1; fautes.push({ r: f.carte.fr, v: f.carte.en, x: f.ex || '', faute: true, deja: !!deja[k] }); }
        });
      });
    });
    return { nouveaux: nouveaux, fautes: fautes };
  }
  var choix = {};
  function apres(res, L) {
    var R = D.prefs.themes[courant.cle], c = candidats(res), lien = 'index.html#paquet/theme-' + courant.langue;
    if (R.aj) {
      return '<section class="th-apres" aria-label="Et maintenant"><h2>Et maintenant</h2><p>' +
        t(R.aj > 0 ? pl(R.aj, 'carte ajoutée', 'cartes ajoutées') + ' au paquet « ' + L.titrePerso + ' » de tes flashcards. Les cartes de tes fautes reviennent dès demain.' : 'Aucune carte ajoutée cette fois.') +
        '</p><div class="th-boutons"><a class="btn plein" href="' + lien + '">' + t('Réviser mes flashcards →') + '</a></div></section>';
    }
    var tous = c.nouveaux.concat(c.fautes);
    if (!tous.length) return '';
    var sel = choix[courant.cle] = choix[courant.cle] || {};
    function puce(x, k) {
      var coche = x.deja ? false : sel[k] !== false;
      return '<label class="th-puce' + (x.faute ? ' faute' : '') + (coche ? ' coche' : '') + (x.deja ? ' deja' : '') + '">' +
        '<input type="checkbox" data-a="choisir" data-k="' + k + '"' + (coche ? ' checked' : '') + (x.deja ? ' disabled' : '') + '>' +
        '<span>' + t(x.r) + '\u00a0: <span lang="' + L.lang + '">' + esc(x.v) + '</span>' + (x.deja ? t(' (déjà dans tes flashcards)') : '') + '</span></label>';
    }
    var nb = tous.filter(function (x, k) { return !x.deja && sel[k] !== false; }).length;
    return '<section class="th-apres" aria-label="Et maintenant"><h2>Et maintenant</h2>' +
      '<p>' + t('Coche les cartes que tu veux garder : rien n’entre dans tes flashcards sans ton accord.') + '</p>' +
      '<div class="th-groupes">' +
      (c.nouveaux.length ? '<fieldset><legend>Les mots nouveaux du thème</legend><div class="th-puces">' + c.nouveaux.map(function (x, k) { return puce(x, k); }).join('') + '</div></fieldset>' : '') +
      (c.fautes.length ? '<fieldset><legend>' + t('Tes fautes, à revoir dès demain') + '</legend><div class="th-puces">' + c.fautes.map(function (x, k) { return puce(x, c.nouveaux.length + k); }).join('') + '</div></fieldset>' : '') +
      '</div><div class="th-boutons"><button type="button" class="btn plein" data-a="ajouter"' + (nb ? '' : ' disabled') + '>' +
      (nb ? 'Ajouter ' + (nb > 1 ? 'les ' + nb + ' cartes cochées' : 'la carte cochée') : 'Aucune carte cochée') + '</button>' +
      '<button type="button" class="lien" data-a="rien">Ne rien ajouter</button></div></section>';
  }
  function ajouter(rien) {
    var R = D.prefs.themes[courant.cle], res = resultats(R), c = candidats(res), tous = c.nouveaux.concat(c.fautes);
    var sel = choix[courant.cle] || {}, L = LANGUES[courant.langue], n = 0;
    if (!rien) {
      var q = persoDe(courant.langue), demain = new Date(); demain.setHours(0, 0, 0, 0); demain.setDate(demain.getDate() + 1);
      if (!q) { q = { id: 'theme-' + courant.langue, titre: L.titrePerso, cree: Date.now(), cartes: [] }; D.perso.push(q); }
      if (D.mes.indexOf(q.id) === -1) D.mes.push(q.id);
      tous.forEach(function (x, k) {
        if (x.deja || sel[k] === false) return;
        var i = 'th-' + courant.cle.replace(/[^a-z0-9]/gi, '') + '-' + k;
        q.cartes.push({ i: i, r: x.r, v: x.v, x: x.x });
        if (x.faute) D.srs[q.id + '/' + i] = { s: 2, p: 0, i: 1, e: 230, n: 1, l: 0, d: demain.getTime() };
        n++;
      });
    }
    R.aj = n || -1;
    sauver();
    rendre(true);
  }

  /* ─── Thèmes précédents ─── */
  function precedents() {
    var l = LISTE[courant.langue] || [];
    var faits = l.filter(function (x) { var R = D.prefs.themes[courant.langue + '/' + x.date]; return R && R.r; }).length;
    return '<a class="th-vers-espace" href="themes.html"><span><b>' + t('Tous mes thèmes') + '</b>' +
      t(pl(l.length, 'thème', 'thèmes') + ' · ' + pl(faits, 'fait', 'faits') + ' · ta progression et tes fautes les plus fréquentes') + '</span><span aria-hidden="true">→</span></a>';
  }


  /* ─── Actions ─── */
  app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]');
    if (!b || b.tagName === 'INPUT') return;
    var a = b.getAttribute('data-a');
    if (a === 'reveler') {
      reveles[courant.cle][b.getAttribute('data-id')] = 1;
      var lang = LANGUES[courant.langue].lang, id = b.getAttribute('data-id').split('-');
      var x = aidesDe(courant.T.phrases[+id[0]], courant.langue)[+id[1]];
      var s = document.createElement('span');
      s.className = 'th-aide vue';
      s.innerHTML = '<span>' + t(x.fr) + '\u00a0: <span lang="' + lang + '">' + esc(x.en) + '</span></span>';
      b.replaceWith(s);
    } else if (a === 'corriger') corriger();
    else if (a === 'compter') {
      var R = D.prefs.themes[courant.cle], k = b.getAttribute('data-k');
      R.j = R.j || {};
      if (R.j[k]) delete R.j[k]; else R.j[k] = 1;
      R.n = total(resultats(R));
      sauver();
      rendre(true);
    } else if (a === 'ajouter') ajouter(false);
    else if (a === 'rien') ajouter(true);
  });
  app.addEventListener('change', function (e) {
    var i = e.target;
    if (i.getAttribute('data-a') !== 'choisir') return;
    var sel = choix[courant.cle] = choix[courant.cle] || {};
    sel[i.getAttribute('data-k')] = i.checked;
    i.closest('.th-puce').classList.toggle('coche', i.checked);
    var nb = app.querySelectorAll('.th-puce input:checked').length, bt = app.querySelector('[data-a="ajouter"]');
    if (bt) { bt.disabled = !nb; bt.textContent = nb ? 'Ajouter ' + (nb > 1 ? 'les ' + nb + ' cartes cochées' : 'la carte cochée') : 'Aucune carte cochée'; }
  });

  route();
  if (SYNC && SYNC.synchroniser) SYNC.synchroniser();
})();
