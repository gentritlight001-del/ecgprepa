/* Espace flashcards d'ECG Prépa (flashcards/index.html).

   - Bibliothèque : paquets prêts à l'emploi lus dans donnees/catalogue.js (généré par
     outils/flashcards.py) ; les cartes d'un paquet (donnees/<id>.js) sont chargées à la demande.
   - Mes paquets : paquets de la bibliothèque ajoutés par l'élève + paquets perso (cartes créées,
     importées ou copiées). On peut ignorer une carte d'un paquet tout fait.
   - Révision espacée (inspirée d'Anki / SM-2) : étapes d'apprentissage de 1 et 10 min, puis
     intervalles en jours qui grandissent avec la facilité de la carte. Entraînement libre à côté.
   - Tout est gardé dans le navigateur (localStorage « ecg-flashcards:v1:<e-mail> »), avec
     sauvegarde et restauration en fichier. Le paquet « À revoir » des pages du jour de langues
     (ecg-<langue>-quotidien-a-revoir) reste synchronisé.
   - Les cartes perso créées dans un chapitre (surligneur, « + Ma carte ») rejoignent le paquet
     du chapitre. */
(function () {
  'use strict';

  var CATALOGUE = window.ECG_FC_CATALOGUE || [];
  var LIB = {};
  CATALOGUE.forEach(function (p) { LIB[p.id] = p; });

  var MATIERES = [
    { id: 'langues', nom: 'Langues', c: '#7c9ec9', bientot: 'Le vocabulaire des textes du jour' },
    { id: 'hgg', nom: 'HGG', c: '#c8a96e' },
    { id: 'esh', nom: 'ESH', c: '#8fc79a' },
    { id: 'maths', nom: 'Maths', c: '#6fb7c9' },
    { id: 'philo', nom: 'Philosophie', c: '#a99ad6' },
    { id: 'humanite', nom: 'Humanité', c: '#c97c9e' }
  ];
  var MAT = {};
  MATIERES.forEach(function (m) { MAT[m.id] = m; });
  var COULEURS = ['#e0a46a', '#7c9ec9', '#8fc79a', '#c97c9e', '#a99ad6', '#6fb7c9', '#d9c36a', '#e07a7a'];
  var ANNEE = { 0: '', 1: '1re année', 2: '2e année' };

  var MIN = 60000, JOUR = 86400000;
  var PAS = [1, 10];        // étapes d'apprentissage (minutes)
  var PAS_RE = [10];        // réapprentissage après un oubli
  var MAITRISE = 21;        // intervalle (jours) à partir duquel une carte est « maîtrisée »

  /* ─── Petits outils ─── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function typo(s) {
    return String(s == null ? '' : s).replace(/ ([:;!?%»])/g, '\u00a0$1').replace(/« /g, '«\u00a0');
  }
  function t(s) { return esc(typo(s)); }
  function paragraphes(s) {
    return String(s || '').split('\n').filter(Boolean).map(function (l) { return '<p>' + t(l) + '</p>'; }).join('');
  }
  function pl(n, un, plusieurs) { return n + '\u00a0' + (n > 1 ? (plusieurs || un + 's') : un); }
  function melanger(l) {
    for (var i = l.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var x = l[i]; l[i] = l[j]; l[j] = x; }
    return l;
  }
  function deux(n) { return (n < 10 ? '0' : '') + n; }
  function jourCle(ms) { var d = new Date(ms == null ? Date.now() : ms); return d.getFullYear() + '-' + deux(d.getMonth() + 1) + '-' + deux(d.getDate()); }
  function debutJour(ms) { var d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); }
  function plusJours(ms, n) { var d = new Date(debutJour(ms)); d.setDate(d.getDate() + n); return d.getTime(); }
  function finJour(ms) { return plusJours(ms, 1) - 1; }
  function dateCourte(ms) { return new Date(ms).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }); }
  function uid(p) { return p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function norme(s) { return String(s || '').replace(/<[^>]+>/g, '').trim().toLowerCase(); }
  function lireJSON(cle, defaut) {
    try { var v = JSON.parse(localStorage.getItem(cle) || 'null'); return v == null ? defaut : v; } catch (e) { return defaut; }
  }
  var ICO = {
    crayon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    poubelle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
    oeil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    barre: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><path d="M3 3l18 18"/></svg>',
    fermer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    jouer: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5Z"/></svg>'
  };

  /* ─── Données de l'élève ─── */
  function cleStock() {
    var u = null;
    try { u = window.ECGAuth && window.ECGAuth.current && window.ECGAuth.current(); } catch (e) { u = null; }
    return 'ecg-flashcards:v1' + (u && u.email ? ':' + u.email : '');
  }
  var CLE = cleStock();
  function neuf() {
    return { v: 1, mes: [], perso: [], srs: {}, ign: {}, hist: {}, nouv: {},
             prefs: { nouv: 20, parties: {}, sens: {}, saisie: {} } };
  }
  function lireDonnees() {
    var d = lireJSON(CLE, null), n = neuf(), k;
    if (!d || typeof d !== 'object') return n;
    for (k in n) if (d[k] == null || typeof d[k] !== typeof n[k] || Array.isArray(d[k]) !== Array.isArray(n[k])) d[k] = n[k];
    for (k in n.prefs) if (d.prefs[k] == null) d.prefs[k] = n.prefs[k];
    var auj = jourCle();
    for (k in d.nouv) if (k !== auj) delete d.nouv[k];
    d.mes = d.mes.filter(function (id) { return LIB[id] || d.perso.some(function (p) { return p.id === id; }); });
    d.perso.forEach(function (p) { if (d.mes.indexOf(p.id) === -1) d.mes.push(p.id); });
    return d;
  }
  var D = lireDonnees();
  function sauver() {
    try { localStorage.setItem(CLE, JSON.stringify(D)); }
    catch (e) { toast('Le navigateur n’a pas pu enregistrer ta progression (stockage plein ou bloqué).'); }
  }
  window.addEventListener('storage', function (e) {
    if (e.key === CLE && !S) { D = lireDonnees(); rendre(); }
  });

  function perso(id) { for (var i = 0; i < D.perso.length; i++) if (D.perso[i].id === id) return D.perso[i]; return null; }
  function estMien(id) { return D.mes.indexOf(id) !== -1; }
  function paquet(id) {
    var l = LIB[id];
    if (l) {
      var p = Object.assign({ perso: false, couleur: (MAT[l.matiere] || {}).c || '#c8a96e' }, l);
      var mes = cartesDuChapitre(id);
      if (mes.length) p.parties = l.parties.concat([{ id: 'mes', nom: 'Mes cartes du chapitre', n: mes.length }]);
      return p;
    }
    var q = perso(id);
    if (!q) return null;
    return { id: q.id, perso: true, titre: q.titre, court: q.titre, matiere: 'perso', type: 'perso', annee: 0,
             couleur: q.couleur || COULEURS[0], recto: 'Recto', verso: 'Verso', parties: [], n: q.cartes.length };
  }
  function bidirectionnel(p) { return p && (p.type === 'vocabulaire' || p.type === 'perso'); }
  function etiquette(p) {
    if (p.perso) return 'Paquet perso';
    var m = MAT[p.matiere] ? MAT[p.matiere].nom : p.matiere;
    return m + (ANNEE[p.annee] ? ' · ' + ANNEE[p.annee] : '');
  }

  /* ─── Cartes ─── */
  var CHARGES = {};
  function chargerCartes(ids) {
    window.ECG_FC_CARTES = window.ECG_FC_CARTES || {};
    return Promise.all(ids.filter(function (id) { return LIB[id]; }).map(function (id) {
      if (!CHARGES[id]) CHARGES[id] = new Promise(function (ok) {
        if (window.ECG_FC_CARTES[id]) return ok();
        var s = document.createElement('script');
        s.src = 'donnees/' + encodeURIComponent(id) + '.js?v=' + LIB[id].v;
        s.onload = s.onerror = function () { ok(); };
        document.head.appendChild(s);
      });
      return CHARGES[id];
    }));
  }
  function charges(ids) {
    return ids.every(function (id) { return !LIB[id] || (window.ECG_FC_CARTES && window.ECG_FC_CARTES[id]); });
  }
  /* Exécute tout de suite si les cartes sont déjà là (pas de saut de la page), sinon après chargement */
  function avecCartes(ids, f) {
    if (charges(ids)) return f();
    app.innerHTML = '<p class="fc-vide">Chargement…</p>';
    chargerCartes(ids).then(f);
  }
  /* Cartes perso créées dans les chapitres (surligneur des pages de cours) */
  var CHAP = null;
  function cartesDuChapitre(id) {
    var l = LIB[id];
    if (!l || l.type !== 'cours') return [];
    if (!CHAP) {
      CHAP = {};
      try {
        for (var k = 0; k < localStorage.length; k++) {
          var cle = localStorage.key(k);
          if (!cle || cle.indexOf('ecg-hl:v1:') !== 0) continue;
          var d = lireJSON(cle, null);
          var cs = d && d.sheet && Array.isArray(d.sheet.cards) ? d.sheet.cards : [];
          if (!cs.length) continue;
          var chemin = cle.slice(10);
          try { chemin = decodeURIComponent(chemin); } catch (e) { /* tel quel */ }
          chemin = chemin.replace(/^\/+/, '').replace(/\.html$/, '');
          CHAP[chemin] = (CHAP[chemin] || []).concat(cs);
        }
      } catch (e) { /* stockage indisponible */ }
    }
    return (CHAP[l.lien.replace(/\.html$/, '')] || []).filter(function (c) { return c && c.q && c.a; }).map(function (c) {
      return { i: 'm-' + c.id, r: String(c.q), v: String(c.a), x: '', g: 'mes', s: 'Ma carte' };
    });
  }
  function cartesDe(id) {
    var q = perso(id);
    if (q) return q.cartes.map(function (c) { return { i: c.i, r: c.r, v: c.v, x: c.x || '', g: '', s: '' }; });
    return ((window.ECG_FC_CARTES || {})[id] || []).concat(cartesDuChapitre(id));
  }
  function motsARevoir(id) {
    var l = LIB[id], set = {};
    if (l && l.revoir) lireJSON(l.revoir, []).forEach(function (m) { if (m && m.en) set[norme(m.en)] = 1; });
    return set;
  }
  function partiesChoisies(id) {
    var sel = D.prefs.parties[id];
    return Array.isArray(sel) && sel.length ? sel : null;
  }
  /* Cartes retenues pour réviser : sans les cartes ignorées, limitées aux parties choisies */
  function selection(id) {
    var sel = partiesChoisies(id);
    var revoir = sel && sel.indexOf('revoir') !== -1 ? motsARevoir(id) : null;
    return cartesDe(id).filter(function (c) {
      if (D.ign[id + '/' + c.i]) return false;
      return !sel || sel.indexOf(c.g) !== -1 || (revoir && revoir[norme(c.v)]);
    });
  }

  /* ─── Répétition espacée ─── */
  function nouvRestantes(id) {
    var j = D.nouv[jourCle()] || {};
    return Math.max(0, (D.prefs.nouv || 20) - (j[id] || 0));
  }
  function stats(id, cartes) {
    var fin = finJour(Date.now());
    var o = { total: 0, nouv: 0, due: 0, m: 0, e: 0 };
    (cartes || selection(id)).forEach(function (c) {
      o.total++;
      var st = D.srs[id + '/' + c.i];
      if (!st || !st.s) { o.nouv++; return; }
      if (st.d <= fin) o.due++;
      if (st.s === 2 && st.i >= MAITRISE) o.m++; else o.e++;
    });
    o.nouvDispo = Math.min(o.nouv, nouvRestantes(id));
    o.aFaire = o.due + o.nouvDispo;
    return o;
  }
  /* Nouvel état d'une carte après une note : 1 à revoir, 2 difficile, 3 bien, 4 facile */
  function noter(avant, note, now) {
    var st = avant && avant.s ? Object.assign({}, avant) : { s: 0, p: 0, i: 0, e: 250, n: 0, l: 0, d: 0 };
    st.n = (st.n || 0) + 1;
    function diplome(i) {
      st.s = 2; st.p = 0;
      st.i = Math.min(365, Math.max(1, Math.round(i)));
      st.d = plusJours(now, st.i);
    }
    if (st.s === 2) {
      var i = st.i || 1, e = st.e / 100;
      if (note === 1) {
        st.l = (st.l || 0) + 1; st.e = Math.max(130, st.e - 20);
        st.i = Math.max(1, Math.round(i * 0.3)); st.s = 3; st.p = 0; st.d = now + PAS_RE[0] * MIN;
      } else if (note === 2) { st.e = Math.max(130, st.e - 15); diplome(Math.max(i + 1, i * 1.2)); }
      else if (note === 3) diplome(Math.max(i + 1, i * e));
      else { st.e += 15; diplome(Math.max(i + 2, i * e * 1.3)); }
      return st;
    }
    var re = st.s === 3, pas = re ? PAS_RE : PAS;
    if (st.s === 0) { st.s = 1; st.p = 0; }
    if (note === 1) { st.p = 0; st.d = now + pas[0] * MIN; }
    else if (note === 2) { st.d = now + (st.p === 0 && pas.length > 1 ? (pas[0] + pas[1]) / 2 : pas[st.p]) * MIN; }
    else if (note === 3) {
      if (st.p + 1 < pas.length) { st.p++; st.d = now + pas[st.p] * MIN; }
      else diplome(re ? st.i : 1);
    } else diplome(re ? st.i + 1 : 4);
    return st;
  }
  function delai(st, now) {
    if (st.s !== 2) {
      var m = Math.max(1, Math.round((st.d - now) / MIN));
      return m < 60 ? m + '\u00a0min' : Math.round(m / 60) + '\u00a0h';
    }
    var i = st.i;
    if (i < 31) return i + '\u00a0j';
    if (i < 365) return Math.round(i / 30) + '\u00a0mois';
    return '1\u00a0an';
  }
  function serie() {
    var n = 0, d = Date.now();
    if (!D.hist[jourCle(d)]) d = plusJours(d, -1);
    while (D.hist[jourCle(d)]) { n++; d = plusJours(d, -1); }
    return n;
  }
  /* Cartes à revoir chacun des 7 prochains jours (aujourd'hui compris) */
  function prevision(ids) {
    var now = Date.now(), fins = [], out = [0, 0, 0, 0, 0, 0, 0];
    for (var k = 0; k < 7; k++) fins.push(finJour(plusJours(now, k)));
    ids.forEach(function (id) {
      selection(id).forEach(function (c) {
        var st = D.srs[id + '/' + c.i];
        if (!st || !st.s) return;
        for (var k = 0; k < 7; k++) if (st.d <= fins[k]) { out[k]++; break; }
      });
      out[0] += stats(id).nouvDispo;
    });
    return out;
  }

  /* Paquet « À revoir » des pages du jour de langues : gardé en phase avec la révision */
  function synchroRevoir(it, note) {
    var l = LIB[it.p];
    if (!l || !l.revoir) return;
    var liste = lireJSON(l.revoir, []);
    if (!Array.isArray(liste)) liste = [];
    var cle = norme(it.c.v), dedans = liste.some(function (m) { return norme(m.en) === cle; });
    if (note === 1 && !dedans) liste.push({ en: it.c.v, fr: it.c.r, ex: it.c.x || '', date: it.c.g || '' });
    else if (note >= 3 && dedans) liste = liste.filter(function (m) { return norme(m.en) !== cle; });
    else return;
    try { localStorage.setItem(l.revoir, JSON.stringify(liste)); } catch (e) { /* stockage indisponible */ }
  }

  /* ─── Rendu général ─── */
  var app = document.getElementById('app');
  var S = null;           // séance en cours
  var vueCourante = '';

  function onglets(actif) {
    var due = 0;
    D.mes.forEach(function (id) { due += stats(id).aFaire; });
    return '<nav class="fc-onglets" aria-label="Sections">' +
      '<a href="#" class="' + (actif === 'mes' ? 'actif' : '') + '">Mes paquets' + (due ? '<b>' + due + '</b>' : '') + '</a>' +
      '<a href="#bibliotheque" class="' + (actif === 'biblio' ? 'actif' : '') + '">Bibliothèque</a></nav>';
  }
  function barreMaitrise(s) {
    var tot = s.total || 1;
    return '<div class="maitrise" role="img" aria-label="' + s.m + ' maîtrisées, ' + s.e + ' en cours, ' + s.nouv + ' nouvelles">' +
      '<i class="m" style="width:' + (100 * s.m / tot) + '%"></i><i class="e" style="width:' + (100 * s.e / tot) + '%"></i></div>';
  }
  function legende(s) {
    return '<div class="legende"><span class="m">' + s.m + ' maîtrisée' + (s.m > 1 ? 's' : '') + '</span><span class="e">' + s.e +
      ' en cours</span><span>' + pl(s.nouv, 'nouvelle') + '</span></div>';
  }

  function rendre() {
    var h = location.hash.replace(/^#/, '');
    try { h = decodeURIComponent(h); } catch (e) { /* tel quel */ }
    var morceaux = h.split('/'), vue = morceaux[0], arg = morceaux.slice(1).join('/');
    document.body.classList.toggle('etude', vue === 'seance' && !!S);
    if (vue !== 'seance') S = null;
    vueCourante = h;
    if (LIB[vue] || perso(vue)) return pagePaquet(vue);       // ancien lien : flashcards/#anglais
    if (vue === 'paquet') return pagePaquet(arg);
    if (vue === 'bibliotheque') return pageBiblio(arg);
    if (vue === 'seance' && S) return rendreSeance();
    if (vue === 'seance') { location.replace('#'); return; }
    return pageAccueil();
  }
  window.addEventListener('hashchange', function () { rendre(); window.scrollTo(0, 0); });
  function aller(h) { if (location.hash.replace(/^#/, '') === h) rendre(); else location.hash = h; }

  /* ─── Accueil : mes paquets ─── */
  function tuile(id) {
    var p = paquet(id), s = stats(id), sel = partiesChoisies(id);
    return '<article class="paquet" style="--c:' + p.couleur + '">' +
      '<div class="paquet-tag">' + t(etiquette(p)) + (p.court && !p.perso && p.court !== p.titre && p.type === 'cours' ? ' · ' + t(p.court) : '') + '</div>' +
      '<h3><a href="#paquet/' + encodeURIComponent(id) + '">' + t(p.titre) + '</a></h3>' +
      '<div class="paquet-compte"><span class="due"><b>' + s.due + '</b> à réviser</span><span><b>' + s.nouvDispo + '</b> nouvelle' + (s.nouvDispo > 1 ? 's' : '') +
      '</span><span>' + pl(s.total, 'carte') + (sel ? ' (sélection)' : '') + '</span></div>' +
      barreMaitrise(s) +
      '<div class="paquet-actions">' +
      (s.aFaire ? '<button type="button" class="btn plein petit" data-a="reviser" data-id="' + esc(id) + '">' + ICO.jouer + 'Réviser · ' + s.aFaire + '</button>'
        : '<button type="button" class="btn petit" data-a="libre" data-id="' + esc(id) + '"' + (s.total ? '' : ' disabled') + '>Entraînement libre</button>') +
      '<a class="btn petit" href="#paquet/' + encodeURIComponent(id) + '">' + (p.perso ? 'Gérer les cartes' : 'Ouvrir') + '</a></div></article>';
  }

  function pageAccueil() {
    avecCartes(D.mes, function () {
      if (vueCourante !== '' && vueCourante !== 'accueil') return;
      var due = 0, nouv = 0, encours = 0, maitr = 0, total = 0;
      D.mes.forEach(function (id) { var s = stats(id); due += s.due; nouv += s.nouvDispo; encours += s.e; maitr += s.m; total += s.total; });
      var aFaire = due + nouv, prev = prevision(D.mes), max = Math.max.apply(null, prev.concat([1]));
      var auj = D.hist[jourCle()] || 0, ser = serie();
      var noms = ['Auj.', 'Dem.'];
      for (var k = 2; k < 7; k++) noms.push(new Date(plusJours(Date.now(), k)).toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''));

      var revue;
      if (!D.mes.length) {
        revue = '<div><div class="gros">0<small>paquet pour l’instant</small></div><p class="detail" style="margin-top:12px">' +
          t('Ajoute des paquets tout faits depuis la bibliothèque (langues, chapitres d’HGG, Humanité) ou crée tes propres cartes.') + '</p></div>' +
          '<div class="paquet-actions"><a class="btn plein grand" href="#bibliotheque">Parcourir la bibliothèque</a><button type="button" class="btn grand" data-a="creer">Créer un paquet</button></div>';
      } else if (aFaire) {
        revue = '<div><div class="gros">' + aFaire + '<small>carte' + (aFaire > 1 ? 's' : '') + ' à réviser aujourd’hui</small></div>' +
          '<p class="detail" style="margin-top:12px"><b>' + due + '</b> révision' + (due > 1 ? 's' : '') + ' prévue' + (due > 1 ? 's' : '') + ' et <b>' + nouv + '</b> nouvelle' + (nouv > 1 ? 's' : '') + typo(' carte' + (nouv > 1 ? 's' : '') + ' : chaque carte revient juste avant que tu l’oublies.') + '</p></div>' +
          '<div class="paquet-actions"><button type="button" class="btn plein grand" data-a="tout">' + ICO.jouer + 'Réviser maintenant</button></div>';
      } else {
        revue = '<div><div class="gros">0<small>carte à réviser</small></div><p class="detail" style="margin-top:12px">' +
          typo('Tout est à jour. ') + (prev[1] ? 'Demain\u00a0: <b>' + pl(prev[1], 'carte') + '</b>.' : '') + ' ' + t('Tu peux t’entraîner librement sur un paquet en attendant.') + '</p></div>' +
          '<div class="paquet-actions"><a class="btn grand" href="#bibliotheque">Ajouter un paquet</a></div>';
      }

      var html = onglets('mes') +
        '<header><div class="fc-sur">Espace de révision</div><h1>Flashcards</h1>' +
        '<p class="fc-lead">' + t('Tes cartes et les paquets du site, révisés au bon moment : ce que tu sais revient de plus en plus rarement, ce que tu oublies revient vite.') + '</p></header>' +
        '<section class="fc-tableau"><div class="fc-revue">' + revue + '</div>' +
        '<div class="fc-chiffres">' +
        '<div class="fc-chiffre"><b>' + ser + '</b><span>jour' + (ser > 1 ? 's' : '') + ' de suite</span></div>' +
        '<div class="fc-chiffre"><b>' + auj + '</b><span>carte' + (auj > 1 ? 's' : '') + ' vue' + (auj > 1 ? 's' : '') + ' aujourd’hui</span></div>' +
        '<div class="fc-chiffre"><b>' + maitr + '</b><span>maîtrisée' + (maitr > 1 ? 's' : '') + ' sur ' + total + '</span></div>' +
        '<div class="fc-chiffre"><b>' + encours + '</b><span>en cours d’apprentissage</span></div>' +
        '<div class="fc-prevision"><h3>Les 7 prochains jours</h3><div class="fc-barres">' +
        prev.map(function (n, k) { return '<div class="fc-barre" title="' + pl(n, 'carte') + '"><em>' + (n || '') + '</em><i style="height:' + Math.round(48 * n / max) + 'px"></i>' + noms[k] + '</div>'; }).join('') +
        '</div></div></div></section>' +
        '<section><div class="fc-tete-section"><h2>Mes paquets</h2><p>' + pl(D.mes.length, 'paquet') + '</p></div><div class="fc-grille">' +
        D.mes.map(tuile).join('') +
        '<article class="paquet nouveau"><h3>Créer un paquet</h3><p>' + t('Tes propres cartes : une par une, ou toute une liste collée d’un coup.') + '</p><button type="button" class="btn" data-a="creer">' + ICO.plus + 'Nouveau paquet</button></article>' +
        '<article class="paquet nouveau"><h3>Paquets tout faits</h3><p>' + t('Vocabulaire des langues au quotidien, chapitres d’HGG, Humanité ; bientôt l’ESH, les maths et la philo.') + '</p><a class="btn" href="#bibliotheque">Bibliothèque</a></article>' +
        '</div></section>' +
        reglages();
      app.innerHTML = html;
    });
  }

  function reglages() {
    var n = D.prefs.nouv || 20;
    return '<section><div class="fc-tete-section"><h2>Réglages</h2></div><div class="fc-reglages">' +
      '<div class="fc-panneau"><h3>Nouvelles cartes par jour</h3><p>' + t('Par paquet. 20 est un bon rythme ; baisse-le si les révisions s’accumulent.') + '</p>' +
      '<select data-a="nouv" aria-label="Nouvelles cartes par jour">' + [5, 10, 15, 20, 30, 50, 100].map(function (v) { return '<option value="' + v + '"' + (v === n ? ' selected' : '') + '>' + v + '</option>'; }).join('') + '</select></div>' +
      '<div class="fc-panneau"><h3>Sauvegarde</h3><p>' + t('Ta progression est gardée dans ce navigateur. Fais une sauvegarde pour la retrouver sur un autre appareil.') + '</p>' +
      '<div class="fc-outils"><button type="button" class="btn petit" data-a="sauvegarde">Télécharger</button><button type="button" class="btn petit" data-a="restaurer">Restaurer</button></div></div>' +
      '<div class="fc-panneau"><h3>Comment ça marche ?</h3><p>' + t('Après chaque carte, dis si tu la savais : « À revoir » la fait revenir dans la séance, « Bien » l’éloigne d’un jour, puis de 3, 7, 18 jours… Quelques minutes par jour suffisent.') + '</p></div>' +
      '</div></section>';
  }

  /* ─── Bibliothèque ─── */
  function pageBiblio(matiere) {
    if (!charges(D.mes)) return avecCartes(D.mes, function () { if (vueCourante.split('/')[0] === 'bibliotheque') pageBiblio(matiere); });
    var parMat = {};
    CATALOGUE.forEach(function (p) { (parMat[p.matiere] = parMat[p.matiere] || []).push(p); });
    if (!MAT[matiere]) matiere = MATIERES.filter(function (m) { return parMat[m.id]; })[0] ? MATIERES.filter(function (m) { return parMat[m.id]; })[0].id : 'langues';
    var m = MAT[matiere], liste = parMat[matiere] || [];
    var html = onglets('biblio') +
      '<header><div class="fc-sur">Bibliothèque</div><h1>Paquets tout faits</h1>' +
      '<p class="fc-lead">' + t('Ajoute un paquet à tes révisions : il se met à jour tout seul (nouveaux textes du jour, nouveaux chapitres) et ta progression est gardée.') + '</p></header>' +
      '<nav class="fc-matieres" aria-label="Matières">' + MATIERES.map(function (x) {
        var n = (parMat[x.id] || []).length;
        return '<a class="matiere' + (x.id === matiere ? ' actif' : '') + (n ? '' : ' bientot') + '" style="--c:' + x.c + '" href="#bibliotheque/' + x.id + '"><b>' + t(x.nom) + '</b><span>' + (n ? pl(n, 'paquet') : 'Bientôt') + '</span></a>';
      }).join('') + '</nav>';
    if (!liste.length) {
      html += '<div class="fc-bientot"><b>' + t(m.nom) + ' : bientôt</b>' +
        t('Les cartes des chapitres de ' + (matiere === 'maths' ? 'maths' : matiere === 'philo' ? 'philosophie' : m.nom) + ' arriveront ici au fil de leur mise en ligne. En attendant, crée ton propre paquet.') +
        '<div style="margin-top:16px"><button type="button" class="btn" data-a="creer">' + ICO.plus + 'Créer un paquet</button></div></div>';
    } else {
      var groupes = {};
      liste.forEach(function (p) { (groupes[p.annee] = groupes[p.annee] || []).push(p); });
      Object.keys(groupes).sort().forEach(function (a) {
        var ps = groupes[a], tous = ps.every(function (p) { return estMien(p.id); });
        var nom = matiere === 'langues' ? 'Au quotidien · 1re année' : matiere === 'humanite' ? 'Cours' : ANNEE[a] || 'Paquets';
        html += '<section class="fc-groupe"><div class="fc-groupe-tete"><h3>' + t(nom) + '</h3>' +
          (ps.length > 1 ? '<button type="button" class="lien' + (tous ? ' dim' : '') + '" data-a="tout-ajouter" data-ids="' + esc(ps.map(function (p) { return p.id; }).join(',')) + '"' + (tous ? ' disabled' : '') + '>' + (tous ? 'Tous ajoutés' : 'Tout ajouter') + '</button>' : '') + '</div>' +
          ps.map(function (p) {
            var mien = estMien(p.id);
            var sous = pl(p.n, 'carte') + ' · ' + (p.type === 'vocabulaire' ? pl(p.parties.length, 'texte') + ' du jour' : pl(p.parties.length, 'partie'));
            return '<div class="ligne" style="--c:' + m.c + '"><div class="ligne-num">' + t(p.court) + '</div>' +
              '<div class="ligne-titre"><a href="#paquet/' + encodeURIComponent(p.id) + '">' + t(p.titre) + '</a><small>' + sous + '</small></div>' +
              '<div class="ligne-actions"><a class="btn petit" href="#paquet/' + encodeURIComponent(p.id) + '">Voir</a>' +
              (mien ? '<button type="button" class="btn petit ok" data-a="retirer" data-id="' + esc(p.id) + '" title="Retirer de mes paquets">✓ Dans mes paquets</button>'
                : '<button type="button" class="btn petit plein" data-a="ajouter" data-id="' + esc(p.id) + '">' + ICO.plus + 'Ajouter</button>') +
              '</div></div>';
          }).join('') + '</section>';
      });
    }
    app.innerHTML = html;
  }

  /* ─── Page d'un paquet ─── */
  var recherche = '';
  function pagePaquet(id) {
    var p = paquet(id);
    if (!p) { app.innerHTML = onglets('') + '<p class="fc-vide">' + t('Ce paquet n’existe pas ou a été supprimé.') + ' <a class="lien" href="#">Retour à mes paquets</a></p>'; return; }
    avecCartes([id], function () {
      if (vueCourante !== 'paquet/' + id && vueCourante !== id) return;
      dessinerPaquet(p);
    });
  }
  function dessinerPaquet(p) {
    var id = p.id, s = stats(id), mien = estMien(id), toutes = cartesDe(id);
    var sel = partiesChoisies(id) || [];
    var revoirN = p.revoir ? Object.keys(motsARevoir(id)).length : 0;
    var lien = p.lien ? '<a href="../' + esc(p.lien) + '">' + (p.type === 'vocabulaire' ? 'Les textes du jour' : 'Ouvrir le ' + (p.matiere === 'humanite' ? 'cours' : 'chapitre')) + ' →</a>' : '';
    var html = '<a class="fc-retour" href="' + (mien ? '#' : '#bibliotheque/' + p.matiere) + '">← ' + (mien ? 'Mes paquets' : 'Bibliothèque') + '</a>' +
      '<header class="fc-paquet-tete" style="--c:' + p.couleur + '"><div><div class="fc-sur">' + t(etiquette(p)) + (p.type === 'cours' ? ' · ' + t(p.court) : '') + '</div>' +
      '<h1>' + t(p.titre) + '</h1><div class="infos"><span><b>' + toutes.length + '</b> carte' + (toutes.length > 1 ? 's' : '') + '</span>' +
      '<span><b>' + s.due + '</b> à réviser</span><span><b>' + s.nouv + '</b> jamais vue' + (s.nouv > 1 ? 's' : '') + '</span>' + lien + '</div></div>' +
      '<div class="fc-lancer">' +
      '<button type="button" class="btn plein grand" data-a="reviser" data-id="' + esc(id) + '"' + (s.aFaire ? '' : ' disabled') + '>' + ICO.jouer + (s.aFaire ? 'Réviser · ' + s.aFaire : 'Rien à réviser') + '</button>' +
      '<button type="button" class="btn" data-a="libre" data-id="' + esc(id) + '"' + (s.total ? '' : ' disabled') + '>Entraînement libre · ' + s.total + '</button>' +
      (p.perso ? '' : mien ? '<button type="button" class="btn ok" data-a="retirer" data-id="' + esc(id) + '">✓ Dans mes paquets</button>'
        : '<button type="button" class="btn" data-a="ajouter" data-id="' + esc(id) + '">' + ICO.plus + 'Ajouter à mes paquets</button>') +
      '</div></header>' +
      '<div>' + barreMaitrise(s) + '<div style="margin-top:8px">' + legende(s) + '</div></div>';

    var panneau = '';
    if (p.parties.length > 1 || revoirN) {
      panneau += '<div class="fc-reglage"><span>' + (p.type === 'vocabulaire' ? 'Textes' : 'Parties') + '</span><div class="puces">' +
        '<button type="button" class="puce' + (sel.length ? '' : ' actif') + '" data-a="partie" data-id="' + esc(id) + '" data-g="">Tout</button>' +
        (revoirN ? '<button type="button" class="puce revoir' + (sel.indexOf('revoir') !== -1 ? ' actif' : '') + '" data-a="partie" data-id="' + esc(id) + '" data-g="revoir">À revoir<small>' + revoirN + '</small></button>' : '') +
        p.parties.map(function (g) {
          return '<button type="button" class="puce' + (sel.indexOf(g.id) !== -1 ? ' actif' : '') + '" data-a="partie" data-id="' + esc(id) + '" data-g="' + esc(g.id) + '" title="' + esc(typo(g.nom)) + '">' +
            t(p.type === 'vocabulaire' ? g.nom.split(' · ')[0] + ' · ' + dateCourte(new Date(g.id + 'T12:00:00').getTime()) : g.nom) + '<small>' + g.n + '</small></button>';
        }).join('') + '</div></div>';
    }
    if (bidirectionnel(p)) {
      var sens = D.prefs.sens[id] || 'normal', saisie = !!D.prefs.saisie[id];
      var a = p.recto, b = p.verso;
      panneau += '<div class="fc-reglage"><span>Sens</span><div class="puces">' +
        [['normal', a + ' → ' + b], ['inverse', b + ' → ' + a], ['mixte', 'Les deux']].map(function (x) {
          return '<button type="button" class="puce' + (sens === x[0] ? ' actif' : '') + '" data-a="sens" data-id="' + esc(id) + '" data-v="' + x[0] + '">' + t(x[1]) + '</button>';
        }).join('') + '</div></div>' +
        '<div class="fc-reglage"><span>Réponse</span><div class="puces">' +
        '<button type="button" class="puce' + (saisie ? '' : ' actif') + '" data-a="saisie" data-id="' + esc(id) + '" data-v="0">Je retourne la carte</button>' +
        '<button type="button" class="puce' + (saisie ? ' actif' : '') + '" data-a="saisie" data-id="' + esc(id) + '" data-v="1">Je tape la réponse</button></div></div>';
    }
    var outils = '<div class="fc-outils">' +
      (p.perso ? '<button type="button" class="btn petit" data-a="importer" data-id="' + esc(id) + '">Importer une liste</button>' +
                 '<button type="button" class="btn petit" data-a="renommer" data-id="' + esc(id) + '">Renommer</button>'
               : '<button type="button" class="btn petit" data-a="copier" data-id="' + esc(id) + '">Copier dans un paquet perso</button>') +
      '<button type="button" class="btn petit" data-a="exporter" data-id="' + esc(id) + '">Exporter (Anki, Quizlet)</button>' +
      '<button type="button" class="btn petit" data-a="zero" data-id="' + esc(id) + '">Remettre à zéro</button>' +
      (p.perso ? '<button type="button" class="btn petit danger" data-a="supprimer-paquet" data-id="' + esc(id) + '">Supprimer le paquet</button>' : '') +
      '</div>';
    html += '<section class="fc-panneau">' + panneau + outils + '</section>';

    if (p.perso) {
      html += '<section class="fc-panneau"><h2 style="font-size:1.2rem">Ajouter une carte</h2><form class="form-carte" data-f="ajout" data-id="' + esc(id) + '">' +
        '<div class="champ"><label for="f-r">Recto (question, mot en français…)</label><textarea id="f-r" name="r" rows="2" required></textarea></div>' +
        '<div class="champ"><label for="f-v">Verso (réponse, traduction…)</label><textarea id="f-v" name="v" rows="2" required></textarea></div>' +
        '<div class="champ large"><label for="f-x">Exemple ou remarque (facultatif)</label><input id="f-x" name="x" autocomplete="off"></div>' +
        '<div class="pied"><small>' + t('Ctrl + Entrée pour ajouter et enchaîner') + '</small><button type="submit" class="btn plein">' + ICO.plus + 'Ajouter la carte</button></div></form></section>';
    }

    html += '<section><div class="fc-liste-tete"><h2>' + pl(toutes.length, 'carte') + '</h2>' +
      (toutes.length > 8 ? '<input type="search" class="recherche" data-a="chercher" placeholder="Chercher une carte" value="' + esc(recherche) + '" aria-label="Chercher une carte">' : '') +
      '</div><div class="cartes-liste" id="liste" style="margin-top:14px"></div></section>';
    app.innerHTML = html;
    dessinerListe(p);
  }
  function etatCarte(id, c) {
    if (D.ign[id + '/' + c.i]) return '<span class="etat i">Ignorée</span>';
    var st = D.srs[id + '/' + c.i];
    if (!st || !st.s) return '<span class="etat">Nouvelle</span>';
    if (st.d <= finJour(Date.now())) return '<span class="etat d">À réviser</span>';
    if (st.s === 2 && st.i >= MAITRISE) return '<span class="etat m" title="Prochaine révision le ' + dateCourte(st.d) + '">Maîtrisée</span>';
    return '<span class="etat e">Le ' + dateCourte(st.d) + '</span>';
  }
  var limiteListe = 150;
  function dessinerListe(p) {
    var box = document.getElementById('liste');
    if (!box) return;
    var id = p.id, q = norme(recherche), toutes = cartesDe(id);
    var cs = q ? toutes.filter(function (c) { return norme(c.r + ' ' + c.v + ' ' + (c.x || '')).indexOf(q) !== -1; }) : toutes;
    if (!cs.length) { box.innerHTML = '<div class="carte-ligne"><span class="v">' + (toutes.length ? 'Aucune carte ne correspond.' : t(p.perso ? 'Ce paquet est vide : ajoute ta première carte ci-dessus, ou importe une liste.' : 'Ce paquet est vide.')) + '</span></div>'; return; }
    box.innerHTML = cs.slice(0, limiteListe).map(function (c) {
      var ign = !!D.ign[id + '/' + c.i];
      var outils = p.perso
        ? '<button type="button" class="ico" data-a="modifier" data-id="' + esc(id) + '" data-c="' + esc(c.i) + '" title="Modifier" aria-label="Modifier">' + ICO.crayon + '</button>' +
          '<button type="button" class="ico danger" data-a="supprimer-carte" data-id="' + esc(id) + '" data-c="' + esc(c.i) + '" title="Supprimer" aria-label="Supprimer">' + ICO.poubelle + '</button>'
        : c.g === 'mes' ? '' : '<button type="button" class="ico" data-a="ignorer" data-id="' + esc(id) + '" data-c="' + esc(c.i) + '" title="' + (ign ? 'Remettre dans les révisions' : 'Ne plus réviser cette carte') + '" aria-label="' + (ign ? 'Rétablir' : 'Ignorer') + '">' + (ign ? ICO.oeil : ICO.barre) + '</button>';
      return '<div class="carte-ligne' + (ign ? ' ignoree' : '') + '" data-c="' + esc(c.i) + '"><div class="r">' + t(c.r) + '</div>' +
        '<div class="v">' + t(c.v) + (c.x ? '<span class="x">' + t(c.x) + '</span>' : '') + '</div>' +
        '<div class="meta">' + etatCarte(id, c) + '<div class="outils">' + outils + '</div></div></div>';
    }).join('') + (cs.length > limiteListe ? '<div class="plus-de"><button type="button" class="lien" data-a="plus" data-id="' + esc(id) + '">Afficher les ' + (cs.length - limiteListe) + ' autres cartes</button></div>' : '');
  }

  /* ─── Séance ─── */
  function lancer(ids, mode, plus) {
    ids = ids.filter(function (id) { return paquet(id); });
    if (mode === 'srs') ids.forEach(function (id) { if (!estMien(id)) { D.mes.unshift(id); sauver(); } });
    return chargerCartes(ids).then(function () {
      var now = Date.now(), fin = finJour(now), file = [], attente = [];
      if (mode === 'libre') {
        ids.forEach(function (id) { selection(id).forEach(function (c) { file.push({ p: id, c: c }); }); });
        melanger(file);
      } else {
        var rev = [], nouv = [];
        ids.forEach(function (id) {
          var reste = plus || nouvRestantes(id);
          selection(id).forEach(function (c) {
            var st = D.srs[id + '/' + c.i];
            if (!st || !st.s) { if (reste > 0) { nouv.push({ p: id, c: c }); reste--; } }
            else if (st.d <= fin) (st.s === 2 ? rev : attente).push({ p: id, c: c, d: st.d });
          });
        });
        melanger(rev);
        var ratio = nouv.length ? rev.length / nouv.length : 0, r = 0;
        nouv.forEach(function (x, k) { var cible = Math.floor((k + 1) * ratio); while (r < cible && r < rev.length) file.push(rev[r++]); file.push(x); });
        while (r < rev.length) file.push(rev[r++]);
      }
      if (!file.length && !attente.length) { toast(mode === 'libre' ? 'Aucune carte dans ce paquet.' : 'Rien à réviser pour l’instant.'); return; }
      var titre = ids.length === 1 ? paquet(ids[0]).titre : 'Tous mes paquets';
      S = { ids: ids, mode: mode, file: file, attente: attente, fait: 0, vues: 0, bonnes: 0, rates: 0, debut: now,
            carte: null, retournee: false, annuler: null, titre: titre, retour: (S && S.retour) || location.hash || '#', verdict: null };
      suivante(true);
      if (location.hash !== '#seance') location.hash = 'seance'; else rendre();
    });
  }
  function choisirSens(id) {
    var p = paquet(id);
    if (!bidirectionnel(p)) return 'normal';
    var s = D.prefs.sens[id] || 'normal';
    return s === 'mixte' ? (Math.random() < 0.5 ? 'normal' : 'inverse') : s;
  }
  function suivante(silence) {
    var now = Date.now();
    S.attente.sort(function (a, b) { return a.d - b.d; });
    S.carte = S.attente.length && S.attente[0].d <= now ? S.attente.shift()
      : S.file.length ? S.file.shift() : S.attente.length ? S.attente.shift() : null;
    S.retournee = false; S.verdict = null; S.saisi = '';
    if (S.carte) S.carte.sens = choisirSens(S.carte.p);
    if (!silence) rendreSeance();
  }
  function compteurs() {
    var n = 0, a = S.attente.length, r = 0;
    S.file.forEach(function (it) {
      var st = D.srs[it.p + '/' + it.c.i];
      if (S.mode === 'libre' || !st || !st.s) n++; else if (st.s === 2) r++; else a++;
    });
    return { n: n, a: a, r: r };
  }
  function typeCourant() {
    if (!S.carte || S.mode === 'libre') return '';
    var st = D.srs[S.carte.p + '/' + S.carte.c.i];
    return !st || !st.s ? 'n' : st.s === 2 ? 'r' : 'a';
  }
  function faces(it) {
    var c = it.c, inv = it.sens === 'inverse';
    return { recto: inv ? c.v : c.r, verso: inv ? c.r : c.v };
  }
  function rendreSeance() {
    document.body.classList.add('etude');
    if (!S.carte) return finSeance();
    var it = S.carte, p = paquet(it.p), f = faces(it), now = Date.now();
    var restant = S.file.length + S.attente.length + 1, total = S.fait + restant;
    var cpt = compteurs(), cur = typeCourant();
    if (cur) cpt[cur]++;
    var saisie = bidirectionnel(p) && D.prefs.saisie[it.p];
    var st = D.srs[it.p + '/' + it.c.i];
    var badge = S.mode === 'libre' ? '' : !st || !st.s ? '<span class="badge nouv">Nouvelle</span>' : st.s === 3 ? '<span class="badge rev">Oubliée</span>' : st.s === 1 ? '<span class="badge">Apprentissage</span>' : '<span class="badge">Révision</span>';
    var long = f.recto.length > 90, longV = f.verso.length > 60 || f.verso.indexOf('\n') !== -1;
    var verdict = '';
    if (S.retournee && S.verdict) {
      verdict = '<div class="verdict ' + S.verdict + '">' + (S.verdict === 'juste' ? 'Exact\u00a0!' : S.verdict === 'presque' ? 'Presque\u00a0: tu as écrit «\u00a0' + esc(S.saisi) + '\u00a0»' : (S.saisi ? 'Ta réponse\u00a0: <s>' + esc(S.saisi) + '</s>' : 'Pas de réponse')) + '</div>';
    }
    var sensTxt = bidirectionnel(p) ? (it.sens === 'inverse' ? p.verso + ' → ' + p.recto : p.recto + ' → ' + p.verso) : '';
    var html = '<div class="seance">' +
      '<div class="seance-haut"><button type="button" class="ico" data-a="quitter" title="Quitter (Échap)" aria-label="Quitter la séance">' + ICO.fermer + '</button>' +
      '<div class="titre"><b>' + t(S.titre) + '</b> · ' + (S.mode === 'libre' ? 'entraînement libre' : 'révision') + '</div>' +
      (S.mode === 'libre' ? '<div class="seance-compte"><span class="n">' + restant + ' restante' + (restant > 1 ? 's' : '') + '</span></div>'
        : '<div class="seance-compte" title="Nouvelles · en apprentissage · révisions"><span class="n' + (cur === 'n' ? ' cur' : '') + '">' + cpt.n + '</span><span class="a' + (cur === 'a' ? ' cur' : '') + '">' + cpt.a + '</span><span class="r' + (cur === 'r' ? ' cur' : '') + '">' + cpt.r + '</span></div>') +
      '</div><div class="seance-jauge"><i style="width:' + Math.round(100 * S.fait / total) + '%"></i></div>' +
      '<div class="carte' + (S.retournee ? ' retournee' : '') + '" tabindex="0" data-a="retourner" role="button" aria-label="' + (S.retournee ? 'Carte retournée' : 'Retourner la carte') + '">' +
      '<div class="carte-haut"><span>' + t(S.ids.length > 1 ? (p.court || p.titre) : (it.c.s || p.court || '')) + '</span>' + badge + '</div>' +
      '<div class="carte-corps"><div class="carte-recto' + (long ? ' long' : '') + '">' + t(f.recto) + '</div>' +
      '<div class="carte-verso">' + verdict + '<div class="trad' + (longV ? ' long' : '') + '">' + (longV ? paragraphes(f.verso) : t(f.verso)) + '</div>' +
      (it.c.x ? '<div class="ex">' + t(it.c.x) + '</div>' : '') + '</div></div>' +
      (sensTxt ? '<div class="carte-sens">' + t(sensTxt) + '</div>' : '') + '</div>';
    if (!S.retournee) {
      html += saisie ? '<form class="saisie" data-f="saisie"><input name="rep" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ta réponse en ' + esc((it.sens === 'inverse' ? p.recto : p.verso).toLowerCase()) + '" aria-label="Ta réponse"><button type="submit" class="btn plein">Vérifier</button></form>'
        : '<button type="button" class="montrer" data-a="retourner">Voir la réponse</button>';
    } else if (S.mode === 'libre') {
      html += '<div class="notes deux"><button type="button" class="note n1' + (S.verdict && S.verdict !== 'juste' ? ' suggere' : '') + '" data-a="libre-note" data-v="0"><b>À revoir</b><small>revient vite</small></button>' +
        '<button type="button" class="note n3' + (S.verdict === 'juste' ? ' suggere' : '') + '" data-a="libre-note" data-v="1"><b>Je savais</b><small>carte suivante</small></button></div>';
    } else {
      var sug = S.verdict === 'juste' ? 3 : S.verdict === 'presque' ? 2 : S.verdict === 'faux' ? 1 : 0;
      html += '<div class="notes">' + [[1, 'À revoir'], [2, 'Difficile'], [3, 'Bien'], [4, 'Facile']].map(function (x) {
        return '<button type="button" class="note n' + x[0] + (sug === x[0] ? ' suggere' : '') + '" data-a="note" data-v="' + x[0] + '"><b>' + x[1] + '</b><small>' + delai(noter(st, x[0], now), now) + '</small></button>';
      }).join('') + '</div>';
    }
    html += '<div class="seance-aide"><span class="clavier">' + (S.retournee ? (S.mode === 'libre' ? '<kbd>←</kbd> à revoir · <kbd>→</kbd> je savais' : '<kbd>1</kbd> <kbd>2</kbd> <kbd>3</kbd> <kbd>4</kbd> pour noter') : '<kbd>Espace</kbd> pour retourner') + ' · <kbd>Échap</kbd> pour quitter</span>' +
      (S.annuler ? '<button type="button" class="lien" data-a="annuler">↶ Annuler la dernière réponse</button>' : '<span></span>') + '</div></div>';
    app.innerHTML = html;
    var champ = app.querySelector('.saisie input');
    if (champ) champ.focus(); else if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
  function sansAccents(s) { return s.normalize ? s.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : s; }
  function leven(a, b) {
    if (Math.abs(a.length - b.length) > 3) return 9;
    var v = []; for (var j = 0; j <= b.length; j++) v[j] = j;
    for (var i = 1; i <= a.length; i++) {
      var prec = v[0]; v[0] = i;
      for (j = 1; j <= b.length; j++) { var tmp = v[j]; v[j] = Math.min(v[j] + 1, v[j - 1] + 1, prec + (a[i - 1] === b[j - 1] ? 0 : 1)); prec = tmp; }
    }
    return v[b.length];
  }
  function comparer(saisi, attendu) {
    function n(s) { return s.toLowerCase().replace(/[’`]/g, '\'').replace(/[.,;:!?¡¿"«»…]/g, ' ').replace(/\s+/g, ' ').trim(); }
    var a = n(saisi);
    if (!a) return 'faux';
    var brut = attendu.replace(/\([^)]*\)/g, ' ');
    var options = [n(brut)].concat(brut.split(/[,;/]| ou | or /).map(n)).filter(Boolean);
    var opt = /^(to|a|an|the) /;
    var art = /^(der|die|das|ein|eine|el|la|los|las|un|una|le|les|l') ?/;
    if (options.some(function (o) { return o === a || o.replace(opt, '') === a.replace(opt, ''); })) return 'juste';
    if (options.some(function (o) {
      var x = sansAccents(o.replace(opt, '')), y = sansAccents(a.replace(opt, ''));
      return x === y || x.replace(art, '') === y.replace(art, '') || leven(x, y) <= (x.length > 6 ? 2 : 1);
    })) return 'presque';
    return 'faux';
  }
  function retourner() {
    if (!S || !S.carte || S.retournee) return;
    var champ = app.querySelector('.saisie input');
    if (champ) {
      S.saisi = champ.value.trim();
      S.verdict = comparer(S.saisi, faces(S.carte).verso);
    }
    S.retournee = true;
    rendreSeance();
  }
  function instantane() {
    var it = S.carte, k = it.p + '/' + it.c.i, auj = jourCle(), l = LIB[it.p];
    return { it: it, k: k, srs: D.srs[k] ? Object.assign({}, D.srs[k]) : null, file: S.file.slice(), attente: S.attente.slice(),
             fait: S.fait, vues: S.vues, bonnes: S.bonnes, rates: S.rates, hist: D.hist[auj] || 0,
             nouv: (D.nouv[auj] || {})[it.p] || 0, revoir: l && l.revoir ? localStorage.getItem(l.revoir) : null };
  }
  function repondre(note) {
    if (!S || !S.carte || !S.retournee) return;
    var it = S.carte, k = it.p + '/' + it.c.i, now = Date.now(), auj = jourCle();
    S.annuler = instantane();
    var avant = D.srs[k], st = noter(avant, note, now);
    D.srs[k] = st;
    if (!avant || !avant.s) { D.nouv[auj] = D.nouv[auj] || {}; D.nouv[auj][it.p] = (D.nouv[auj][it.p] || 0) + 1; }
    D.hist[auj] = (D.hist[auj] || 0) + 1;
    S.vues++;
    if (note >= 3) S.bonnes++; else if (note === 1) S.rates++;
    if (st.s !== 2) S.attente.push({ p: it.p, c: it.c, d: st.d }); else S.fait++;
    synchroRevoir(it, note);
    sauver(); suivante();
  }
  function repondreLibre(sait) {
    if (!S || !S.carte || !S.retournee) return;
    var it = S.carte, auj = jourCle();
    S.annuler = instantane();
    D.hist[auj] = (D.hist[auj] || 0) + 1;
    S.vues++;
    if (sait) { S.fait++; S.bonnes++; }
    else { S.rates++; S.file.splice(Math.min(3, S.file.length), 0, { p: it.p, c: it.c }); synchroRevoir(it, 1); }
    sauver(); suivante();
  }
  function annuler() {
    if (!S || !S.annuler) return;
    var a = S.annuler, auj = jourCle(), l = LIB[a.it.p];
    if (a.srs) D.srs[a.k] = a.srs; else delete D.srs[a.k];
    D.hist[auj] = a.hist;
    if (D.nouv[auj]) D.nouv[auj][a.it.p] = a.nouv;
    if (l && l.revoir) { try { if (a.revoir == null) localStorage.removeItem(l.revoir); else localStorage.setItem(l.revoir, a.revoir); } catch (e) { /* rien */ } }
    S.file = a.file; S.attente = a.attente; S.fait = a.fait; S.vues = a.vues; S.bonnes = a.bonnes; S.rates = a.rates;
    S.carte = a.it; S.retournee = true; S.annuler = null;
    sauver(); rendreSeance();
  }
  function finSeance() {
    var duree = Math.max(1, Math.round((Date.now() - S.debut) / MIN));
    var taux = S.vues ? Math.round(100 * S.bonnes / S.vues) : 0;
    var prev = prevision(S.ids);
    var encore = S.mode !== 'libre' && S.ids.some(function (id) { return stats(id).nouv > 0; });
    app.innerHTML = '<div class="seance"><div class="seance-haut"><button type="button" class="ico" data-a="quitter" aria-label="Fermer">' + ICO.fermer + '</button><div class="titre"><b>' + t(S.titre) + '</b></div></div>' +
      '<div class="fin"><h2>' + (S.vues ? 'Séance terminée' : 'Rien à réviser') + '</h2>' +
      '<div class="fin-chiffres"><div><b>' + S.vues + '</b><span>réponse' + (S.vues > 1 ? 's' : '') + '</span></div><div><b>' + taux + '\u00a0%</b><span>de réussite</span></div><div><b>' + duree + '\u00a0min</b><span>de travail</span></div></div>' +
      '<p>' + (S.mode === 'libre' ? t(S.rates ? 'Les cartes ratées ont été revues jusqu’à ce que tu les saches.' : 'Aucune erreur, bravo.')
        : t(prev[1] ? 'Prochaine révision demain : ' + pl(prev[1], 'carte') + '. Reviens chaque jour, quelques minutes suffisent.' : 'Les cartes reviendront d’elles-mêmes au bon moment.')) + '</p>' +
      '<div class="fin-actions"><button type="button" class="btn plein" data-a="quitter">Terminer</button>' +
      (encore ? '<button type="button" class="btn" data-a="encore">10 nouvelles cartes de plus</button>' : '') +
      (S.mode === 'libre' ? '<button type="button" class="btn" data-a="refaire">Recommencer</button>' : '') + '</div></div></div>';
  }
  function quitter() {
    var retour = S ? S.retour : '#';
    S = null;
    document.body.classList.remove('etude');
    if (!retour || retour === '#' || retour === '#seance') {
      history.replaceState(null, '', location.pathname + location.search);
      rendre();
    } else location.replace(retour);
    window.scrollTo(0, 0);
  }

  /* ─── Fenêtres et notifications ─── */
  var toastEl = null, toastMinuteur = 0;
  function toast(msg, bouton, action) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = t(msg) + (bouton ? '<button type="button">' + t(bouton) + '</button>' : '');
    if (bouton) toastEl.querySelector('button').onclick = function () { toastEl.classList.remove('visible'); action(); };
    toastEl.classList.add('visible');
    clearTimeout(toastMinuteur);
    toastMinuteur = setTimeout(function () { toastEl.classList.remove('visible'); }, bouton ? 6000 : 3200);
  }
  function fenetre(titre, corps, boutons, auMontage) {
    var fond = document.createElement('div');
    fond.className = 'fenetre-fond';
    fond.innerHTML = '<div class="fenetre" role="dialog" aria-modal="true" aria-label="' + esc(titre) + '"><h2>' + t(titre) + '</h2>' + corps +
      '<div class="pied">' + boutons.map(function (b, k) { return '<button type="button" class="btn ' + (b.classe || '') + '" data-k="' + k + '">' + t(b.libelle) + '</button>'; }).join('') + '</div></div>';
    var avant = document.activeElement;
    function fermer() { fond.remove(); document.removeEventListener('keydown', clavier, true); if (avant && avant.focus) avant.focus(); }
    function clavier(e) { if (e.key === 'Escape') { e.stopPropagation(); fermer(); } }
    fond.addEventListener('click', function (e) {
      if (e.target === fond) return fermer();
      var b = e.target.closest('[data-k]');
      if (!b) return;
      var f = boutons[+b.getAttribute('data-k')];
      if (!f.action || f.action(fond.querySelector('.fenetre')) !== false) fermer();
    });
    document.addEventListener('keydown', clavier, true);
    document.body.appendChild(fond);
    var champ = fond.querySelector('input, textarea, select');
    (champ || fond.querySelector('.btn')).focus();
    if (auMontage) auMontage(fond.querySelector('.fenetre'));
    return fermer;
  }
  function confirmer(titre, texte, libelle, action) {
    fenetre(titre, '<p>' + t(texte) + '</p>', [{ libelle: 'Annuler' }, { libelle: libelle, classe: 'danger', action: action }]);
  }
  function choixCouleur(actuelle) {
    return '<div class="champ"><label>Couleur</label><div class="couleurs">' + COULEURS.map(function (c) {
      return '<button type="button" style="--c:' + c + '" data-couleur="' + c + '" class="' + (c === actuelle ? 'actif' : '') + '" aria-label="Couleur ' + c + '"></button>';
    }).join('') + '</div></div>';
  }
  function brancherCouleurs(f) {
    f.querySelectorAll('[data-couleur]').forEach(function (b) {
      b.addEventListener('click', function () { f.querySelectorAll('[data-couleur]').forEach(function (x) { x.classList.toggle('actif', x === b); }); });
    });
  }
  function couleurChoisie(f) { var b = f.querySelector('[data-couleur].actif'); return b ? b.getAttribute('data-couleur') : COULEURS[0]; }
  function annulable(msg) {
    var avant = JSON.stringify(D);
    return function () { toast(msg, 'Annuler', function () { D = JSON.parse(avant); sauver(); rendre(); }); };
  }

  /* ─── Paquets perso ─── */
  function creerPaquet(cartes, titreDefaut, ensuite) {
    var c0 = COULEURS[D.perso.length % COULEURS.length];
    fenetre(cartes ? 'Copier ' + pl(cartes.length, 'carte') : 'Nouveau paquet',
      (cartes && D.perso.length ? '<div class="champ"><label for="f-dest">Destination</label><select id="f-dest"><option value="">Un nouveau paquet</option>' +
        D.perso.map(function (q) { return '<option value="' + esc(q.id) + '">' + t(q.titre) + '</option>'; }).join('') + '</select></div>' : '') +
      '<div class="champ" data-nom><label for="f-titre">Nom du paquet</label><input id="f-titre" maxlength="80" value="' + esc(titreDefaut || '') + '" placeholder="Ex. Dates de la guerre froide, verbes irréguliers…"></div>' +
      '<div data-nom>' + choixCouleur(c0) + '</div>',
      [{ libelle: 'Annuler' }, { libelle: cartes ? 'Copier' : 'Créer', classe: 'plein', action: function (f) {
        var dest = f.querySelector('#f-dest'), q;
        if (dest && dest.value) {
          q = perso(dest.value);
        } else {
          var titre = f.querySelector('#f-titre').value.trim();
          if (!titre) { f.querySelector('#f-titre').focus(); return false; }
          q = { id: uid('p-'), titre: titre, couleur: couleurChoisie(f), cree: Date.now(), cartes: [] };
          D.perso.unshift(q); D.mes.unshift(q.id);
        }
        if (cartes) {
          var deja = {};
          q.cartes.forEach(function (c) { deja[norme(c.r) + '|' + norme(c.v)] = 1; });
          cartes.forEach(function (c) { if (!deja[norme(c.r) + '|' + norme(c.v)]) q.cartes.push({ i: uid('c-'), r: c.r, v: c.v, x: c.x || '' }); });
        }
        sauver();
        if (ensuite) ensuite(q); else aller('paquet/' + q.id);
        if (cartes) toast(pl(cartes.length, 'carte') + ' copiée' + (cartes.length > 1 ? 's' : '') + ' dans « ' + q.titre + ' ».');
      } }],
      function (f) {
        brancherCouleurs(f);
        var dest = f.querySelector('#f-dest');
        if (dest) dest.addEventListener('change', function () { f.querySelectorAll('[data-nom]').forEach(function (x) { x.hidden = !!dest.value; }); });
        var champ = f.querySelector('#f-titre');
        champ.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); f.querySelector('.btn.plein').click(); } });
      });
  }
  function lireListe(texte) {
    return texte.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) {
      var m = l.indexOf('\t') !== -1 ? l.split('\t') : l.indexOf(';') !== -1 ? l.split(';') : l.indexOf('|') !== -1 ? l.split('|') : l.split(/ [-=:] /);
      return { r: (m[0] || '').trim(), v: (m[1] || '').trim().replace(/<br\s*\/?>/gi, '\n'), x: m.slice(2).join(' ').trim() };
    }).filter(function (c) { return c.r && c.v; });
  }
  function importer(id) {
    var q = perso(id);
    fenetre('Importer une liste',
      '<p>' + t('Une carte par ligne : le recto, puis le verso, séparés par une tabulation (copier-coller depuis un tableur, Anki ou Quizlet), un point-virgule, une barre | ou un tiret entouré d’espaces. Un troisième champ facultatif sert d’exemple.') + '</p>' +
      '<div class="champ"><textarea id="f-liste" rows="9" placeholder="la frontière ; the border&#10;négocier ; to negotiate ; They negotiated a deal."></textarea></div><p id="f-apercu">0 carte détectée</p>',
      [{ libelle: 'Annuler' }, { libelle: 'Importer', classe: 'plein', action: function (f) {
        var cs = lireListe(f.querySelector('#f-liste').value);
        if (!cs.length) { f.querySelector('#f-liste').focus(); return false; }
        var annul = annulable(pl(cs.length, 'carte') + ' importée' + (cs.length > 1 ? 's' : '') + '.');
        cs.forEach(function (c) { q.cartes.push({ i: uid('c-'), r: c.r, v: c.v, x: c.x }); });
        sauver(); rendre(); annul();
      } }],
      function (f) {
        var zone = f.querySelector('#f-liste'), ap = f.querySelector('#f-apercu');
        zone.addEventListener('input', function () {
          var cs = lireListe(zone.value);
          ap.innerHTML = '<b>' + pl(cs.length, 'carte') + '</b> détectée' + (cs.length > 1 ? 's' : '') + (cs[0] ? typo(' : « ') + esc(cs[0].r) + ' » → « ' + esc(cs[0].v) + typo(' »') : '');
        });
      });
  }
  function exporter(id) {
    var p = paquet(id), cs = cartesDe(id);
    var txt = cs.map(function (c) {
      return [c.r, c.v, c.x || ''].map(function (s) { return String(s).replace(/\t/g, ' ').replace(/\n/g, '<br>'); }).join('\t');
    }).join('\n');
    telecharger((p.titre || 'flashcards').replace(/[^\wÀ-ÿ -]+/g, '').trim().replace(/\s+/g, '-').toLowerCase() + '.txt', txt, 'text/plain');
    toast('Fichier créé : importe-le dans Anki (Fichier › Importer) ou Quizlet.');
  }
  function telecharger(nom, contenu, type) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([contenu], { type: type + ';charset=utf-8' }));
    a.download = nom;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function restaurer() {
    var inp = document.createElement('input');
    inp.type = 'file'; inp.accept = '.json,application/json';
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      if (!f) return;
      var r = new FileReader();
      r.onload = function () {
        var d;
        try { d = JSON.parse(r.result); } catch (e) { d = null; }
        if (!d || d.v !== 1 || !Array.isArray(d.mes) || typeof d.srs !== 'object') { toast('Ce fichier n’est pas une sauvegarde de flashcards.'); return; }
        var annul = annulable('Sauvegarde restaurée et fusionnée.');
        (d.perso || []).forEach(function (q) {
          if (!q || !q.id || !Array.isArray(q.cartes)) return;
          var ici = perso(q.id);
          if (!ici) D.perso.push(q);
          else if (q.cartes.length >= ici.cartes.length) D.perso[D.perso.indexOf(ici)] = q;
        });
        d.mes.forEach(function (id) { if (!estMien(id) && (LIB[id] || perso(id))) D.mes.push(id); });
        Object.keys(d.srs || {}).forEach(function (k) { var a = d.srs[k], b = D.srs[k]; if (a && (!b || (a.n || 0) > (b.n || 0))) D.srs[k] = a; });
        Object.keys(d.ign || {}).forEach(function (k) { D.ign[k] = d.ign[k]; });
        Object.keys(d.hist || {}).forEach(function (k) { D.hist[k] = Math.max(D.hist[k] || 0, d.hist[k] || 0); });
        sauver(); rendre(); annul();
      };
      r.readAsText(f);
    };
    inp.click();
  }

  /* ─── Actions ─── */
  app.addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]');
    if (!b || b.disabled || b.tagName === 'SELECT' || b.tagName === 'INPUT') return;
    var a = b.getAttribute('data-a'), id = b.getAttribute('data-id'), q, annul;
    switch (a) {
      case 'tout': lancer(D.mes.slice(), 'srs'); break;
      case 'reviser': lancer([id], 'srs'); break;
      case 'libre': lancer([id], 'libre'); break;
      case 'creer': creerPaquet(); break;
      case 'ajouter':
        if (!estMien(id)) D.mes.unshift(id);
        sauver(); rendre(); toast('« ' + paquet(id).titre + ' » ajouté à tes paquets.'); break;
      case 'tout-ajouter':
        b.getAttribute('data-ids').split(',').reverse().forEach(function (x) { if (!estMien(x)) D.mes.unshift(x); });
        sauver(); rendre(); toast('Paquets ajoutés à tes révisions.'); break;
      case 'retirer':
        annul = annulable('« ' + paquet(id).titre + ' » retiré de tes paquets (ta progression est gardée).');
        D.mes = D.mes.filter(function (x) { return x !== id; });
        sauver(); rendre(); annul(); break;
      case 'partie':
        var g = b.getAttribute('data-g'), sel = (partiesChoisies(id) || []).slice();
        if (!g) sel = [];
        else if (sel.indexOf(g) !== -1) sel.splice(sel.indexOf(g), 1);
        else sel.push(g);
        if (sel.length) D.prefs.parties[id] = sel; else delete D.prefs.parties[id];
        sauver(); rendre(); break;
      case 'sens': D.prefs.sens[id] = b.getAttribute('data-v'); sauver(); rendre(); break;
      case 'saisie': if (b.getAttribute('data-v') === '1') D.prefs.saisie[id] = 1; else delete D.prefs.saisie[id]; sauver(); rendre(); break;
      case 'importer': importer(id); break;
      case 'exporter': exporter(id); break;
      case 'copier':
        q = selection(id);
        creerPaquet(q.length ? q : cartesDe(id), paquet(id).titre + (partiesChoisies(id) ? ' (sélection)' : ''), function () { rendre(); });
        break;
      case 'renommer':
        q = perso(id);
        fenetre('Renommer le paquet', '<div class="champ"><label for="f-titre">Nom du paquet</label><input id="f-titre" maxlength="80" value="' + esc(q.titre) + '"></div>' + choixCouleur(q.couleur),
          [{ libelle: 'Annuler' }, { libelle: 'Enregistrer', classe: 'plein', action: function (f) {
            var v = f.querySelector('#f-titre').value.trim();
            if (!v) return false;
            q.titre = v; q.couleur = couleurChoisie(f); sauver(); rendre();
          } }], brancherCouleurs);
        break;
      case 'supprimer-paquet':
        q = perso(id);
        confirmer('Supprimer « ' + q.titre + ' » ?', 'Ses ' + pl(q.cartes.length, 'carte') + ' et leur progression seront effacées.', 'Supprimer', function () {
          annul = annulable('Paquet supprimé.');
          D.perso = D.perso.filter(function (x) { return x.id !== id; });
          D.mes = D.mes.filter(function (x) { return x !== id; });
          Object.keys(D.srs).forEach(function (k) { if (k.indexOf(id + '/') === 0) delete D.srs[k]; });
          sauver(); aller(''); annul();
        });
        break;
      case 'zero':
        confirmer('Remettre ce paquet à zéro ?', 'Toutes ses cartes redeviennent nouvelles : leur historique de révision est effacé.', 'Remettre à zéro', function () {
          annul = annulable('Progression du paquet effacée.');
          Object.keys(D.srs).forEach(function (k) { if (k.indexOf(id + '/') === 0) delete D.srs[k]; });
          sauver(); rendre(); annul();
        });
        break;
      case 'modifier':
        var cid = b.getAttribute('data-c'), carte = perso(id).cartes.filter(function (c) { return c.i === cid; })[0];
        if (!carte) break;
        fenetre('Modifier la carte',
          '<div class="champ"><label for="m-r">Recto</label><textarea id="m-r" rows="2">' + esc(carte.r) + '</textarea></div>' +
          '<div class="champ"><label for="m-v">Verso</label><textarea id="m-v" rows="3">' + esc(carte.v) + '</textarea></div>' +
          '<div class="champ"><label for="m-x">Exemple ou remarque</label><input id="m-x" value="' + esc(carte.x || '') + '"></div>',
          [{ libelle: 'Annuler' }, { libelle: 'Enregistrer', classe: 'plein', action: function (f) {
            var r = f.querySelector('#m-r').value.trim(), v = f.querySelector('#m-v').value.trim();
            if (!r || !v) return false;
            carte.r = r; carte.v = v; carte.x = f.querySelector('#m-x').value.trim();
            sauver(); dessinerListe(paquet(id));
          } }]);
        break;
      case 'supprimer-carte':
        q = perso(id);
        annul = annulable('Carte supprimée.');
        q.cartes = q.cartes.filter(function (c) { return c.i !== b.getAttribute('data-c'); });
        delete D.srs[id + '/' + b.getAttribute('data-c')];
        sauver(); rendre(); annul(); break;
      case 'ignorer':
        var k = id + '/' + b.getAttribute('data-c');
        if (D.ign[k]) delete D.ign[k]; else D.ign[k] = 1;
        sauver(); rendre(); break;
      case 'plus': limiteListe = 100000; dessinerListe(paquet(id)); break;
      case 'sauvegarde':
        telecharger('flashcards-ecg-prepa-' + jourCle() + '.json', JSON.stringify(D), 'application/json');
        break;
      case 'restaurer': restaurer(); break;
      case 'retourner': if (!e.target.closest('.saisie')) retourner(); break;
      case 'note': repondre(+b.getAttribute('data-v')); break;
      case 'libre-note': repondreLibre(b.getAttribute('data-v') === '1'); break;
      case 'annuler': annuler(); break;
      case 'quitter': quitter(); break;
      case 'encore': lancer(S.ids, 'srs', 10); break;
      case 'refaire': lancer(S.ids, S.mode); break;
    }
  });
  app.addEventListener('change', function (e) {
    if (e.target.getAttribute('data-a') === 'nouv') { D.prefs.nouv = +e.target.value; sauver(); rendre(); }
  });
  app.addEventListener('input', function (e) {
    if (e.target.getAttribute('data-a') === 'chercher') {
      recherche = e.target.value;
      var h = vueCourante.split('/'), id = h[0] === 'paquet' ? h.slice(1).join('/') : h[0];
      if (paquet(id)) dessinerListe(paquet(id));
    }
  });
  app.addEventListener('submit', function (e) {
    var f = e.target, type = f.getAttribute('data-f');
    if (!type) return;
    e.preventDefault();
    if (type === 'saisie') return retourner();
    if (type === 'ajout') {
      var q = perso(f.getAttribute('data-id'));
      var r = f.r.value.trim(), v = f.v.value.trim();
      if (!r || !v) return;
      q.cartes.push({ i: uid('c-'), r: r, v: v, x: f.x.value.trim() });
      sauver();
      f.reset();
      var p = paquet(q.id);
      var titre = app.querySelector('.fc-liste-tete h2');
      if (titre) titre.textContent = pl(q.cartes.length, 'carte');
      dessinerListe(p);
      f.r.focus();
      toast('Carte ajoutée.');
    }
  });
  app.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.closest('form[data-f="ajout"]')) {
      e.preventDefault();
      e.target.closest('form').requestSubmit ? e.target.closest('form').requestSubmit() : e.target.closest('form').dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!S || document.querySelector('.fenetre-fond') || e.ctrlKey || e.metaKey || e.altKey) return;
    var dansChamp = /INPUT|TEXTAREA|SELECT/.test(e.target.tagName);
    if (e.key === 'Escape') { e.preventDefault(); quitter(); return; }
    if (dansChamp) return;
    if (!S.carte) return;
    if ((e.key === 'z' || e.key === 'Backspace') && S.annuler) { e.preventDefault(); annuler(); return; }
    if (!S.retournee) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); retourner(); }
      return;
    }
    if (S.mode === 'libre') {
      if (e.key === 'ArrowLeft' || e.key === '1') { e.preventDefault(); repondreLibre(false); }
      else if (e.key === 'ArrowRight' || e.key === '2' || e.key === ' ') { e.preventDefault(); repondreLibre(true); }
    } else if (/^[1-4]$/.test(e.key)) { e.preventDefault(); repondre(+e.key); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); repondre(S.verdict === 'presque' ? 2 : S.verdict === 'faux' ? 1 : 3); }
  });

  if (!CATALOGUE.length) console.warn('[flashcards] catalogue introuvable (donnees/catalogue.js)');
  rendre();
})();
