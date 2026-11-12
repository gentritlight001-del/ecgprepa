/* Espace flashcards d'ECG Prépa (flashcards/index.html).

   - Accueil : les cartes à revoir aujourd'hui (tous paquets confondus) et « Mes paquets ».
   - Ajouter un paquet : paquets prêts à l'emploi lus dans donnees/catalogue.js (généré par
     outils/flashcards.py) ; les cartes d'un paquet (donnees/<id>.js) sont chargées à la demande.
     On peut aussi créer un paquet perso (cartes écrites une à une ou liste collée).
   - Révision : trois réponses. « Je ne savais pas » : la carte revient dans la même séance,
     quelques cartes plus loin. « J'ai hésité » : elle revient demain. « Je savais » : son délai
     s'allonge (1, 3, 7, 16, 37 jours…). Une carte est « acquise » à partir de 7 jours de délai.
     Les nouvelles cartes arrivent selon le rythme choisi (10, 20 ou 40 par jour, tous paquets
     confondus). « Tout parcourir » feuillette un paquet sans rien noter.
   - Tout est gardé dans le navigateur (localStorage « ecg-flashcards:v1:<e-mail> », lu aussi par
     auth.js pour la pastille du menu) et synchronisé avec le compte de l'élève (synchro.js, table
     Supabase « flashcards ») : mêmes paquets et même progression sur tous ses appareils. Sauvegarde
     et restauration en fichier en plus. Le paquet
     « À revoir » des pages du jour de langues (ecg-<langue>-quotidien-a-revoir) reste synchronisé.
   - Les cartes perso créées dans un chapitre (« + Ma carte ») rejoignent le paquet du chapitre. */
(function () {
  'use strict';

  var CATALOGUE = window.ECG_FC_CATALOGUE || [];
  var LIB = {};
  CATALOGUE.forEach(function (p) { LIB[p.id] = p; });

  var MATIERES = [
    { id: 'hgg', nom: 'HGG' },
    { id: 'langues', nom: 'Langues' },
    { id: 'humanite', nom: 'Humanité' },
    { id: 'philo', nom: 'Philosophie' },
    { id: 'esh', nom: 'ESH' },
    { id: 'maths', nom: 'Maths' }
  ];
  var MAT = {};
  MATIERES.forEach(function (m) { MAT[m.id] = m; });
  var ANNEE = { 0: '', 1: '1re année', 2: '2e année' };
  var RYTHMES = [[10, 'Tranquille'], [20, 'Normal'], [40, 'Intensif']];

  var JOUR = 86400000;
  var ACQUISE = 7;          // délai (jours) à partir duquel une carte est « acquise »
  var RETOUR = 4;           // une carte ratée revient après ce nombre de cartes

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
    crayon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    poubelle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/></svg>',
    fermer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    jouer: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5Z"/></svg>',
    loupe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
  };

  /* ─── Données de l'élève ─── */
  var SYNC = window.ECGFlashSync;      // synchro.js : navigateur + compte
  var CLE = SYNC.cle();
  function neuf() { return SYNC.neuf(); }
  function lireDonnees() {
    var d = SYNC.charger(), n = neuf(), k;
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
    if (!SYNC.enregistrer(D)) toast('Le navigateur n’a pas pu enregistrer ta progression (stockage plein ou bloqué).');
  }
  /* Une synchronisation a apporté ce qui a été fait sur un autre appareil */
  SYNC.surChangement(function () {
    D = lireDonnees();
    if (!S) rendre();
  });
  SYNC.surEtat(function (e) {
    var el = document.getElementById('fc-synchro');
    if (el) el.textContent = typo(texteSynchro(e));
  });
  function texteSynchro(e) {
    if (e === 'hors-ligne') return 'Hors ligne : ta progression est gardée sur cet appareil et rejoindra ton compte au retour du réseau.';
    if (e === 'non-connecte') return 'Ta progression est gardée dans ce navigateur.';
    return 'Ta progression est enregistrée dans ton compte : tu la retrouves sur tous tes appareils.';
  }
  window.addEventListener('storage', function (e) {
    if (e.key === CLE) { D = lireDonnees(); if (!S) rendre(); }
  });

  function perso(id) { for (var i = 0; i < D.perso.length; i++) if (D.perso[i].id === id) return D.perso[i]; return null; }
  function estMien(id) { return D.mes.indexOf(id) !== -1; }
  function paquet(id) {
    var l = LIB[id];
    if (l) {
      var p = Object.assign({ perso: false }, l);
      var mes = cartesDuChapitre(id);
      if (mes.length) p.parties = l.parties.concat([{ id: 'mes', nom: 'Mes cartes du chapitre', n: mes.length }]);
      return p;
    }
    var q = perso(id);
    if (!q) return null;
    return { id: q.id, perso: true, titre: q.titre, court: '', matiere: 'perso', type: 'perso', annee: 0, parties: [], n: q.cartes.length };
  }
  function etiquette(p) {
    if (p.perso) return 'Mes cartes';
    var m = MAT[p.matiere] ? MAT[p.matiere].nom : p.matiere;
    return m + (ANNEE[p.annee] ? ' · ' + ANNEE[p.annee] : '') + (p.type === 'cours' && p.court ? ' · ' + p.court : '');
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
  /* Cartes perso créées dans les chapitres (pages de cours) */
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
  /* Toutes les cartes d'un paquet, sans celles que l'élève avait écartées */
  function cartesDe(id) {
    var q = perso(id), cs;
    if (q) cs = q.cartes.map(function (c) { return { i: c.i, r: c.r, v: c.v, x: c.x || '', g: '', s: '' }; });
    else cs = ((window.ECG_FC_CARTES || {})[id] || []).concat(cartesDuChapitre(id));
    return cs.filter(function (c) { return !D.ign[id + '/' + c.i]; });
  }
  function partiesChoisies(id) {
    var sel = D.prefs.parties[id];
    return Array.isArray(sel) && sel.length ? sel : null;
  }
  /* Cartes retenues pour réviser : limitées aux parties cochées */
  function selection(id) {
    var sel = partiesChoisies(id);
    var cs = cartesDe(id);
    if (!sel) return cs;
    var dans = cs.filter(function (c) { return sel.indexOf(c.g) !== -1; });
    return dans.length ? dans : cs;
  }

  /* ─── Les cartes qui reviennent ─── */
  function etat(id, c) { return D.srs[id + '/' + c.i]; }
  function vue(st) { return !!(st && st.s); }
  function acquise(st) { return vue(st) && st.s === 2 && st.i >= ACQUISE; }
  function rythme() {
    var n = D.prefs.nouv || 20, mieux = RYTHMES[0][0];
    RYTHMES.forEach(function (r) { if (Math.abs(r[0] - n) < Math.abs(mieux - n)) mieux = r[0]; });
    return mieux;
  }
  function nouvReste() {
    var j = D.nouv[jourCle()] || {}, faites = 0;
    Object.keys(j).forEach(function (k) { faites += j[k] || 0; });
    return Math.max(0, rythme() - faites);
  }
  function stats(id, cartes) {
    var fin = finJour(Date.now());
    var o = { total: 0, nouv: 0, due: 0, a: 0, e: 0 };
    (cartes || selection(id)).forEach(function (c) {
      o.total++;
      var st = etat(id, c);
      if (!vue(st)) { o.nouv++; return; }
      if (st.d <= fin) o.due++;
      if (acquise(st)) o.a++; else o.e++;
    });
    return o;
  }
  /* Nouvelles cartes du jour réparties entre les paquets, une à une */
  function quota(ids, plus) {
    var reste = plus || nouvReste(), dispo = {}, q = {}, encore = true;
    ids.forEach(function (id) { dispo[id] = stats(id).nouv; q[id] = 0; });
    while (reste > 0 && encore) {
      encore = false;
      ids.forEach(function (id) { if (reste > 0 && q[id] < dispo[id]) { q[id]++; reste--; encore = true; } });
    }
    return q;
  }
  /* Nouvel état d'une carte après une réponse : 1 je ne savais pas, 2 j'ai hésité, 3 je savais */
  function noter(avant, note, now) {
    var st = vue(avant) ? Object.assign({}, avant) : { s: 0, p: 0, i: 0, e: 230, n: 0, l: 0, d: 0 };
    var revision = st.s === 2, oubliee = st.s === 3, nouvelle = st.s === 0;
    st.n = (st.n || 0) + 1; st.p = 0;
    if (note === 1) {
      if (revision) { st.l = (st.l || 0) + 1; st.e = Math.max(130, st.e - 20); st.i = Math.max(1, Math.round(st.i * 0.3)); st.s = 3; }
      else if (nouvelle) st.s = 1;
      st.d = now;
      return st;
    }
    var i;
    if (note === 2) {
      if (revision) { st.e = Math.max(130, st.e - 15); i = 1; st.i = Math.max(1, Math.round(st.i * 0.6)); }
      else { i = 1; st.i = oubliee ? Math.max(1, st.i) : 1; }
      st.s = 2; st.d = plusJours(now, i);
      return st;
    }
    if (!revision) i = oubliee ? Math.max(1, st.i) : nouvelle ? 3 : 1;
    else i = st.i <= 1 ? 3 : Math.max(st.i + 1, Math.round(st.i * Math.min(st.e || 230, 280) / 100));
    st.s = 2; st.i = Math.min(365, i); st.d = plusJours(now, st.i);
    return st;
  }
  function dansJours(n) {
    if (n <= 0) return 'aujourd’hui';
    if (n === 1) return 'demain';
    if (n < 31) return 'dans ' + n + ' jours';
    if (n < 365) return 'dans ' + Math.round(n / 30) + ' mois';
    return 'dans 1 an';
  }
  function retourDe(st) {
    if (!vue(st)) return 'Pas encore vue';
    return 'Revient ' + dansJours(Math.round((debutJour(st.d) - debutJour(Date.now())) / JOUR));
  }
  function serie() {
    var n = 0, d = Date.now();
    if (!D.hist[jourCle(d)]) d = plusJours(d, -1);
    while (D.hist[jourCle(d)]) { n++; d = plusJours(d, -1); }
    return n;
  }
  /* Cartes déjà vues qui reviendront demain et après-demain */
  function prevision(ids) {
    var now = Date.now(), f0 = finJour(now), f1 = finJour(plusJours(now, 1)), f2 = finJour(plusJours(now, 2)), out = [0, 0];
    ids.forEach(function (id) {
      selection(id).forEach(function (c) {
        var st = etat(id, c);
        if (!vue(st) || st.d <= f0) return;
        if (st.d <= f1) out[0]++; else if (st.d <= f2) out[1]++;
      });
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
  var recherche = '', limiteListe = 12, partiesOuvertes = false;

  function rendre() {
    var h = location.hash.replace(/^#/, '');
    try { h = decodeURIComponent(h); } catch (e) { /* tel quel */ }
    var morceaux = h.split('/'), v = morceaux[0], arg = morceaux.slice(1).join('/');
    document.body.classList.toggle('etude', v === 'seance' && !!S);
    if (v !== 'seance') S = null;
    if (h !== vueCourante) { recherche = ''; limiteListe = 12; partiesOuvertes = false; }
    vueCourante = h;
    if (LIB[v] || perso(v)) return pagePaquet(v);              // ancien lien : flashcards/#anglais
    if (v === 'paquet') return pagePaquet(arg);
    if (v === 'ajouter' || v === 'bibliotheque') return pageAjouter(arg);
    if (v === 'seance' && S) return rendreSeance();
    if (v === 'seance') { location.replace('#'); return; }
    return pageAccueil();
  }
  window.addEventListener('hashchange', function () { rendre(); window.scrollTo(0, 0); });
  function aller(h) { if (location.hash.replace(/^#/, '') === h) rendre(); else location.hash = h; }
  function fil(nom) {
    var c = document.querySelector('.breadcrumb');
    if (!c) return;
    c.innerHTML = '<a href="../index.html">Accueil</a><span class="sep">/</span>' +
      (nom ? '<a href="#">Flashcards</a><span class="sep">/</span><span class="current">' + t(nom) + '</span>' : '<span class="current">Flashcards</span>');
  }
  function jauge(s) {
    var tt = s.total || 1;
    return '<span class="jauge"><i class="a" style="width:' + (100 * s.a / tt) + '%"></i><i class="e" style="width:' + (100 * s.e / tt) + '%"></i></span>';
  }

  /* ─── Accueil ─── */
  function pageAccueil() {
    avecCartes(D.mes, function () {
      fil('');
      var Q = quota(D.mes), due = 0, nouv = 0, actifs = 0, lignes = '';
      D.mes.forEach(function (id) {
        var p = paquet(id), s = stats(id), n = s.due + Q[id];
        due += s.due; nouv += Q[id];
        if (n) actifs++;
        lignes += '<div class="ligne"><a class="ligne-nom" href="#paquet/' + esc(id) + '"><small>' + t(etiquette(p)) + '</small><b>' + t(p.titre) + '</b></a>' +
          '<div class="ligne-prog">' + jauge(s) + '<span>' + t(s.total ? pl(s.a, 'acquise') + ' · ' + s.e + ' en cours · ' + (s.nouv ? pl(s.nouv, 'pas encore vue', 'pas encore vues') : 'tout a été vu') : 'Aucune carte pour l’instant') + '</span></div>' +
          (n ? '<button type="button" class="btn plein" data-a="reviser" data-id="' + esc(id) + '" data-n="' + Q[id] + '">Réviser · ' + n + '</button>'
             : '<a class="btn" href="#paquet/' + esc(id) + '">' + (s.total ? 'À jour' : 'Ouvrir') + '</a>') + '</div>';
      });
      var total = due + nouv, prev = prevision(D.mes), ser = serie();
      var date = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
      var hero;
      if (!D.mes.length) {
        hero = '<h1>Tes flashcards</h1><p class="hero-txt">' + t('Choisis les chapitres que tu veux apprendre. Chaque jour, le site te montre les cartes à revoir : celles que tu sais reviennent de plus en plus rarement, celles que tu oublies reviennent vite.') + '</p>' +
          '<div><a class="btn plein gros" href="#ajouter">' + ICO.plus + 'Choisir mes premiers paquets</a></div>';
      } else if (total) {
        hero = '<h1 class="compte"><b>' + total + '</b> ' + (total > 1 ? 'cartes à revoir' : 'carte à revoir') + '</h1>' +
          '<p class="hero-txt">' + t('Environ ' + pl(Math.max(1, Math.round(total / 5)), 'minute') + '. ' +
            (due && nouv ? pl(due, 'carte') + ' qui ' + (due > 1 ? 'reviennent' : 'revient') + ' et ' + pl(nouv, 'nouvelle') : due ? pl(due, 'carte') + ' qui ' + (due > 1 ? 'reviennent' : 'revient') : pl(nouv, 'nouvelle carte', 'nouvelles cartes')) +
            (actifs > 1 ? ', dans ' + actifs + ' paquets.' : '.')) + '</p>' +
          '<div><button type="button" class="btn plein gros" data-a="tout">' + ICO.jouer + 'Commencer la révision</button></div>';
      } else {
        hero = '<h1>' + t('Tout est à jour') + '</h1><p class="hero-txt">' + t(prev[0] ? 'Rien d’autre à revoir aujourd’hui. Demain : ' + pl(prev[0], 'carte prévue', 'cartes prévues') + '.' : 'Rien à revoir aujourd’hui. Les cartes reviendront d’elles-mêmes au bon moment.') + '</p>' +
          '<div><a class="btn gros" href="#ajouter">' + ICO.plus + 'Ajouter un paquet</a></div>';
      }
      var jours = '';
      for (var k = 6; k >= 0; k--) {
        var ms = plusJours(Date.now(), -k), fait = !!D.hist[jourCle(ms)];
        jours += '<div class="jour' + (fait ? ' fait' : '') + (k === 0 ? ' auj' : '') + '"><b>' + new Date(ms).getDate() + '</b><span>' + (k === 0 ? 'auj.' : new Date(ms).toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', '')) + '</span></div>';
      }
      var r = rythme();
      app.innerHTML =
        '<section class="accueil-haut"><div class="hero"><div class="sur">' + t('Aujourd’hui · ' + date) + '</div>' + hero + '</div>' +
        '<aside class="semaine"><div class="serie"><b>' + ser + '</b><span>' + (ser > 1 ? 'jours de suite' : 'jour de suite') + '</span></div><div class="jours">' + jours + '</div>' +
        '<p>' + t(prev[0] || prev[1] ? 'Demain : ' + pl(prev[0], 'carte prévue', 'cartes prévues') + '. Après-demain : ' + prev[1] + '.' : 'Quelques minutes par jour suffisent.') + '</p></aside></section>' +
        '<section class="bloc"><div class="bloc-tete"><h2>Mes paquets</h2>' + (D.mes.length ? '<div class="legende"><span class="a">Acquises</span><span class="e">En cours</span><span>Pas encore vues</span></div>' : '') + '</div>' +
        lignes + '<a class="ajout" href="#ajouter">' + ICO.plus + 'Ajouter un paquet</a></section>' +
        '<section class="pied-accueil"><div><b>Mon rythme</b><span>' + t('Le nombre de nouvelles cartes par jour, tous paquets confondus.') + '</span></div>' +
        '<div class="choix" role="group" aria-label="Mon rythme">' + RYTHMES.map(function (x) {
          return '<button type="button" data-a="rythme" data-v="' + x[0] + '" class="' + (x[0] === r ? 'actif' : '') + '" aria-pressed="' + (x[0] === r) + '">' + x[1] + ' · ' + x[0] + '</button>';
        }).join('') + '</div></section>' +
        '<p class="sauvegarde"><span id="fc-synchro">' + t(texteSynchro(SYNC.etat())) + '</span> <button type="button" class="lien" data-a="sauvegarde">Télécharger une sauvegarde</button> · <button type="button" class="lien" data-a="restaurer">Restaurer</button></p>';
    });
  }

  /* ─── Ajouter un paquet ─── */
  function pageAjouter(matiere) {
    fil('Ajouter un paquet');
    var parMat = {};
    CATALOGUE.forEach(function (p) { (parMat[p.matiere] = parMat[p.matiere] || []).push(p); });
    if (!parMat[matiere]) matiere = (MATIERES.filter(function (m) { return parMat[m.id]; })[0] || {}).id;
    var groupes = {}, html = '';
    (parMat[matiere] || []).forEach(function (p) { (groupes[p.annee] = groupes[p.annee] || []).push(p); });
    Object.keys(groupes).sort(function (a, b) { return (+a || 9) - (+b || 9); }).forEach(function (a) {
      var ps = groupes[a], manque = ps.filter(function (p) { return !estMien(p.id); });
      var nom = matiere === 'langues' ? 'Le vocabulaire des textes du jour' : (ANNEE[a] || MAT[matiere].nom) + ' · ' + pl(ps.length, ps[0].court.indexOf('Cours') === 0 ? 'cours' : 'chapitre', ps[0].court.indexOf('Cours') === 0 ? 'cours' : 'chapitres');
      html += '<div class="groupe"><div class="groupe-tete"><h3>' + t(nom) + '</h3>' +
        (ps.length > 1 && manque.length ? '<button type="button" class="lien" data-a="tout-ajouter" data-ids="' + esc(manque.map(function (p) { return p.id; }).join(',')) + '">Tout ajouter</button>' : '') + '</div>' +
        ps.map(function (p) {
          var mien = estMien(p.id);
          return '<div class="ligne"><span class="num">' + esc(p.num || p.court.slice(0, 2).toUpperCase()) + '</span>' +
            '<a class="ligne-nom" href="#paquet/' + esc(p.id) + '"><b>' + t(p.titre) + '</b><small>' + pl(p.n, 'carte') + '</small></a>' +
            '<button type="button" class="btn ' + (mien ? 'ok' : 'plein') + '" data-a="' + (mien ? 'retirer' : 'ajouter') + '" data-id="' + esc(p.id) + '" aria-pressed="' + mien + '">' + (mien ? 'Ajouté ✓' : 'Ajouter') + '</button></div>';
        }).join('') + '</div>';
    });
    app.innerHTML = '<a class="retour" href="#">← Mes paquets</a><h1>Ajouter un paquet</h1>' +
      '<p class="hero-txt">' + t('Choisis les chapitres que tu veux apprendre. Leurs cartes entrent dans ta révision du jour.') + '</p>' +
      '<nav class="matieres" aria-label="Matières">' + MATIERES.map(function (m) {
        return parMat[m.id] ? '<a href="#ajouter/' + m.id + '" class="' + (m.id === matiere ? 'actif' : '') + '">' + m.nom + '</a>' : '<span>' + m.nom + ' · bientôt</span>';
      }).join('') + '</nav>' + html +
      '<div class="perso-bloc"><div><h3>Mes propres cartes</h3><p>' + t('Crée un paquet à toi : écris tes cartes une à une, ou colle une liste (une ligne par carte, la question puis la réponse).') + '</p></div>' +
      '<button type="button" class="btn clair" data-a="creer">Créer un paquet</button></div>';
  }

  /* ─── Page d'un paquet ─── */
  function pagePaquet(id) {
    var p = paquet(id);
    if (!p) { aller(''); return; }
    avecCartes([id], function () { dessinerPaquet(paquet(id)); });
  }
  function dessinerPaquet(p) {
    var id = p.id, s = stats(id), toutes = cartesDe(id), q = quota([id])[id], n = s.due + q;
    fil(p.titre);
    var actions = '';
    if (s.total) {
      actions = (n ? '<button type="button" class="btn plein gros" data-a="reviser" data-id="' + esc(id) + '">Réviser · ' + pl(n, 'carte') + '</button>'
        : s.nouv ? '<button type="button" class="btn plein gros" data-a="avance" data-id="' + esc(id) + '">Voir 10 nouvelles cartes</button>'
        : '<span class="btn gros inerte">À jour : rien à revoir aujourd’hui</span>') +
        '<button type="button" class="btn" data-a="libre" data-id="' + esc(id) + '">Tout parcourir, sans noter</button>';
    }
    var parties = '';
    if (p.parties.length > 1) {
      var sel = partiesChoisies(id), limite = partiesOuvertes ? 1000 : 6;
      parties = '<section class="bloc"><div class="bloc-tete"><h2>Ce que je révise</h2><p>' + t('Décoche une partie pas encore vue en classe.') + '</p></div>' +
        p.parties.slice(0, limite).map(function (g) {
          var sg = stats(id, toutes.filter(function (c) { return c.g === g.id; }));
          return '<label class="partie"><input type="checkbox" data-a="partie" data-id="' + esc(id) + '" data-g="' + esc(g.id) + '"' + (!sel || sel.indexOf(g.id) !== -1 ? ' checked' : '') + '>' +
            '<span class="partie-nom">' + t(g.nom) + '</span>' + jauge(sg) + '<span class="partie-n">' + pl(sg.total, 'carte') + '</span></label>';
        }).join('') +
        (p.parties.length > limite ? '<button type="button" class="voir-plus" data-a="parties-plus">Voir les ' + (p.parties.length - limite) + ' autres parties</button>' : '') + '</section>';
    }
    var ajout = !p.perso ? '' :
      '<section class="bloc"><div class="bloc-tete"><h2>Ajouter une carte</h2><button type="button" class="lien" data-a="importer" data-id="' + esc(id) + '">Coller une liste</button></div>' +
      '<form class="ajout-carte" data-f="ajout" data-id="' + esc(id) + '"><div class="champ"><label for="a-r">Question</label><textarea id="a-r" name="r" rows="2" required></textarea></div>' +
      '<div class="champ"><label for="a-v">Réponse</label><textarea id="a-v" name="v" rows="2" required></textarea></div><button type="submit" class="btn plein">Ajouter</button></form></section>';
    var bas = (p.lien ? '<a class="btn" href="../' + esc(p.lien) + '">' + (p.type === 'cours' ? 'Ouvrir le cours' : 'Ouvrir les textes du jour') + '</a>' : '') +
      (p.perso ? '<button type="button" class="btn" data-a="renommer" data-id="' + esc(id) + '">Renommer</button>' : '') +
      (s.total - s.nouv ? '<button type="button" class="btn" data-a="zero" data-id="' + esc(id) + '">Recommencer à zéro</button>' : '') +
      (p.perso ? '<button type="button" class="btn danger" data-a="supprimer-paquet" data-id="' + esc(id) + '">Supprimer ce paquet</button>'
        : estMien(id) ? '<button type="button" class="btn danger" data-a="retirer" data-id="' + esc(id) + '">Retirer de mes paquets</button>'
        : '<button type="button" class="btn" data-a="ajouter" data-id="' + esc(id) + '">Ajouter à mes paquets</button>');
    app.innerHTML =
      '<section class="paquet-haut"><div><a class="retour" href="#">← Mes paquets</a><div class="sur">' + t(etiquette(p)) + '</div><h1>' + t(p.titre) + '</h1></div>' +
      '<div class="paquet-actions">' + actions + '</div></section>' +
      (s.total ? '<section class="trois"><div class="a"><b>' + s.a + '</b><strong>' + (s.a > 1 ? 'Acquises' : 'Acquise') + '</strong><span>' + t('Tu les sais. Elles reviennent de loin en loin.') + '</span></div>' +
        '<div class="e"><b>' + s.e + '</b><strong>En cours</strong><span>' + t('Déjà vues, pas encore solides. Elles reviennent souvent.') + '</span></div>' +
        '<div><b>' + s.nouv + '</b><strong>' + (s.nouv > 1 ? 'Pas encore vues' : 'Pas encore vue') + '</strong><span>' + t('Elles arrivent petit à petit, selon ton rythme.') + '</span></div></section>' : '') +
      parties + ajout +
      '<section class="bloc"><div class="bloc-tete"><h2 id="titre-liste">' + (toutes.length ? 'Les ' + pl(toutes.length, 'carte') : 'Aucune carte pour l’instant') + '</h2>' +
      (toutes.length > 8 ? '<label class="chercher">' + ICO.loupe + '<input type="search" data-a="chercher" placeholder="Chercher une carte" aria-label="Chercher une carte" value="' + esc(recherche) + '"></label>' : '') + '</div>' +
      '<div class="cartes" id="liste"></div></section>' +
      '<section class="bas">' + bas + '</section>';
    dessinerListe(p);
  }
  function dessinerListe(p) {
    var box = document.getElementById('liste');
    if (!box) return;
    var id = p.id, toutes = cartesDe(id), q = norme(recherche);
    var cs = q ? toutes.filter(function (c) { return norme(c.r + ' ' + c.v + ' ' + (c.x || '')).indexOf(q) !== -1; }) : toutes;
    box.hidden = !toutes.length;
    box.innerHTML = cs.slice(0, limiteListe).map(function (c) {
      var st = etat(id, c);
      return '<div class="carte-ligne"><div class="q">' + t(c.r) + '</div><div class="r">' + t(c.v.replace(/\n/g, ' · ')) + '</div>' +
        '<div class="etat ' + (acquise(st) ? 'a' : vue(st) ? 'e' : '') + '">' + t(retourDe(st)) + '</div>' +
        (p.perso ? '<div class="outils"><button type="button" class="ico" data-a="modifier" data-id="' + esc(id) + '" data-c="' + esc(c.i) + '" aria-label="Modifier la carte">' + ICO.crayon + '</button>' +
          '<button type="button" class="ico" data-a="supprimer-carte" data-id="' + esc(id) + '" data-c="' + esc(c.i) + '" aria-label="Supprimer la carte">' + ICO.poubelle + '</button></div>' : '') + '</div>';
    }).join('') +
      (cs.length > limiteListe ? '<button type="button" class="voir-plus" data-a="plus" data-id="' + esc(id) + '">Voir les ' + pl(cs.length - limiteListe, 'autre carte', 'autres cartes') + '</button>' : '') +
      (!cs.length && q ? '<p class="fc-vide">Aucune carte ne correspond.</p>' : '');
  }

  /* ─── Séance ─── */
  function lancer(ids, mode, plus, parts) {
    ids = ids.filter(function (id) { return paquet(id); });
    if (mode === 'srs') ids.forEach(function (id) { if (!estMien(id)) { D.mes.unshift(id); sauver(); } });
    return chargerCartes(ids).then(function () {
      var fin = finJour(Date.now()), file = [];
      if (mode === 'libre') {
        ids.forEach(function (id) { selection(id).forEach(function (c) { file.push({ p: id, c: c }); }); });
      } else {
        var rev = [], nouv = [], Q = parts || quota(ids, plus);
        ids.forEach(function (id) {
          var reste = Q[id] || 0;
          selection(id).forEach(function (c) {
            var st = etat(id, c);
            if (!vue(st)) { if (reste > 0) { nouv.push({ p: id, c: c }); reste--; } }
            else if (st.d <= fin) rev.push({ p: id, c: c, d: debutJour(st.d) });
          });
        });
        melanger(rev);
        rev.sort(function (a, b) { return a.d - b.d; });        // les plus en retard d'abord
        if (ids.length > 1) melanger(nouv);
        var ratio = nouv.length ? rev.length / nouv.length : 0, r = 0;
        nouv.forEach(function (x, k) { var cible = Math.floor((k + 1) * ratio); while (r < cible && r < rev.length) file.push(rev[r++]); file.push(x); });
        while (r < rev.length) file.push(rev[r++]);
      }
      if (!file.length) { toast(mode === 'libre' ? 'Aucune carte dans ce paquet.' : 'Rien à revoir pour l’instant.'); return; }
      S = { ids: ids, mode: mode, file: file, pos: 0, total: file.length, fait: 0, vues: 0, premier: 0, rates: {}, debut: Date.now(),
            carte: null, retournee: false, annuler: null, titre: ids.length === 1 ? paquet(ids[0]).titre : 'Tous mes paquets',
            retour: (S && S.retour) || location.hash || '#' };
      suivante(true);
      if (location.hash !== '#seance') location.hash = 'seance'; else rendre();
    });
  }
  function suivante(silence) {
    S.carte = S.mode === 'libre' ? (S.file[S.pos] || null) : (S.file.shift() || null);
    S.retournee = false;
    if (!silence) rendreSeance();
  }
  function taille(s) { var n = s.length; return n < 50 ? 'xl' : n < 110 ? 'l' : n < 220 ? 'm' : 's'; }
  function rendreSeance() {
    document.body.classList.add('etude');
    if (!S.carte) return finSeance();
    var it = S.carte, p = paquet(it.p), c = it.c, now = Date.now(), libre = S.mode === 'libre';
    var k = it.p + '/' + c.i, st = D.srs[k];
    var num = libre ? S.pos + 1 : Math.min(S.total, S.fait + 1);
    var badge = libre ? '' : S.rates[k] ? '<span class="badge r">On la retente</span>' : !vue(st) ? '<span class="badge n">Nouvelle carte</span>'
      : '<span class="badge">' + t('Revient pour la ' + st.n + (st.n === 1 ? 're' : 'e') + ' fois') + '</span>';
    var lignes = c.v.split('\n').filter(Boolean);
    var html = '<div class="seance">' +
      '<div class="seance-haut"><button type="button" class="ico rond" data-a="quitter" title="Quitter (Échap)" aria-label="Quitter la révision">' + ICO.fermer + '</button>' +
      '<div class="seance-prog"><div><span>' + t(S.titre) + '</span><span><b>Carte ' + num + '</b> sur ' + S.total + '</span></div>' +
      '<div class="seance-jauge"><i style="width:' + Math.round(100 * (libre ? S.pos : S.fait) / S.total) + '%"></i></div></div></div>' +
      '<div class="carte' + (S.retournee ? ' retournee' : '') + '" tabindex="0" data-a="retourner" role="button" aria-label="' + (S.retournee ? 'Carte retournée' : 'Retourner la carte') + '">' +
      '<div class="carte-haut"><span>' + t(S.ids.length > 1 ? p.titre : (c.s || p.court || '')) + '</span>' + badge + '</div>' +
      '<div class="carte-corps"><div class="recto ' + taille(c.r) + '">' + t(c.r) + '</div>' +
      (S.retournee ? '<div class="verso ' + (lignes.length > 1 || c.v.length > 90 ? 'long' : 'court') + (c.v.length > 420 ? ' tres' : '') + '">' + lignes.map(function (l) { return '<p>' + t(l) + '</p>'; }).join('') +
        (c.x ? '<p class="ex">' + t(c.x) + '</p>' : '') + '</div>'
        : '<div class="invite">' + t('Réponds dans ta tête, puis clique sur la carte ou appuie sur Espace') + '</div>') +
      '</div></div>';
    if (libre) {
      html += '<div class="reponses deux"><button type="button" class="rep" data-a="precedente"' + (S.pos ? '' : ' disabled') + '><b>← Précédente</b></button>' +
        '<button type="button" class="rep plein" data-a="' + (S.retournee ? 'passer' : 'retourner') + '"><b>' + (S.retournee ? 'Suivante →' : 'Voir la réponse') + '</b></button></div>';
    } else if (!S.retournee) {
      html += '<div class="reponses une"><button type="button" class="rep plein" data-a="retourner"><b>Voir la réponse</b></button></div>';
    } else {
      var apres = noter(st, 3, now);
      html += '<div class="reponses"><button type="button" class="rep n1" data-a="note" data-v="1"><b>Je ne savais pas</b><small>Elle revient dans cette séance</small></button>' +
        '<button type="button" class="rep n2" data-a="note" data-v="2"><b>J’ai hésité</b><small>Elle revient demain</small></button>' +
        '<button type="button" class="rep n3" data-a="note" data-v="3"><b>Je savais</b><small>' + t('Elle revient ' + dansJours(apres.i)) + '</small></button></div>';
    }
    html += '<div class="seance-aide"><span>' + (libre ? 'Clavier : Espace, ← et →' : S.retournee ? 'Clavier : 1, 2 ou 3' : 'Clavier : Espace') + '</span>' +
      (S.annuler ? '<button type="button" class="lien" data-a="annuler">Annuler ma dernière réponse</button>' : '') + '</div></div>';
    app.innerHTML = html;
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    window.scrollTo(0, 0);
  }
  function retourner() {
    if (!S || !S.carte) return;
    if (S.retournee && S.mode !== 'libre') return;
    S.retournee = !S.retournee;
    rendreSeance();
  }
  function instantane() {
    var it = S.carte, k = it.p + '/' + it.c.i, auj = jourCle(), l = LIB[it.p];
    return { it: it, k: k, srs: D.srs[k] ? Object.assign({}, D.srs[k]) : null, file: S.file.slice(), rates: Object.assign({}, S.rates),
             fait: S.fait, vues: S.vues, premier: S.premier, hist: D.hist[auj] || 0,
             nouv: (D.nouv[auj] || {})[it.p] || 0, revoir: l && l.revoir ? localStorage.getItem(l.revoir) : null };
  }
  function repondre(note) {
    if (!S || !S.carte || !S.retournee || S.mode === 'libre') return;
    var it = S.carte, k = it.p + '/' + it.c.i, now = Date.now(), auj = jourCle();
    S.annuler = instantane();
    var avant = D.srs[k];
    D.srs[k] = noter(avant, note, now);
    if (!vue(avant)) { D.nouv[auj] = D.nouv[auj] || {}; D.nouv[auj][it.p] = (D.nouv[auj][it.p] || 0) + 1; }
    D.hist[auj] = (D.hist[auj] || 0) + 1;
    S.vues++;
    if (note === 1) { S.rates[k] = 1; S.file.splice(Math.min(RETOUR, S.file.length), 0, it); }
    else { S.fait++; if (note === 3 && !S.rates[k]) S.premier++; }
    synchroRevoir(it, note);
    sauver(); suivante();
  }
  function annuler() {
    if (!S || !S.annuler) return;
    var a = S.annuler, auj = jourCle(), l = LIB[a.it.p];
    if (a.srs) D.srs[a.k] = a.srs; else delete D.srs[a.k];
    D.hist[auj] = a.hist;
    if (D.nouv[auj]) D.nouv[auj][a.it.p] = a.nouv;
    if (l && l.revoir) { try { if (a.revoir == null) localStorage.removeItem(l.revoir); else localStorage.setItem(l.revoir, a.revoir); } catch (e) { /* rien */ } }
    S.file = a.file; S.rates = a.rates; S.fait = a.fait; S.vues = a.vues; S.premier = a.premier;
    S.carte = a.it; S.retournee = true; S.annuler = null;
    sauver(); rendreSeance();
  }
  function finSeance() {
    var libre = S.mode === 'libre';
    var duree = Math.max(1, Math.round((Date.now() - S.debut) / 60000));
    var prev = prevision(D.mes);
    var encore = !libre && S.ids.some(function (id) { return stats(id).nouv > 0; });
    app.innerHTML = '<div class="seance"><div class="fin"><h1>' + (libre ? 'Tu as tout parcouru' : 'Révision terminée') + '</h1>' +
      (libre ? '<p>' + t(pl(S.total, 'carte') + ' feuilletée' + (S.total > 1 ? 's' : '') + '. Rien n’a été noté : ta révision du jour ne change pas.') + '</p>'
        : '<div class="fin-chiffres"><div><b>' + S.total + '</b><span>' + (S.total > 1 ? 'cartes revues' : 'carte revue') + '</span></div><div><b>' + S.premier + '</b><span>' + (S.premier > 1 ? 'sues' : 'sue') + ' du premier coup</span></div><div><b>' + duree + ' min</b><span>de travail</span></div></div>' +
          '<p>' + t(prev[0] ? 'Demain : ' + pl(prev[0], 'carte prévue', 'cartes prévues') + '. Reviens chaque jour, quelques minutes suffisent.' : 'Les cartes reviendront d’elles-mêmes au bon moment.') + '</p>') +
      '<div class="fin-actions"><button type="button" class="btn plein gros" data-a="quitter">Terminer</button>' +
      (encore ? '<button type="button" class="btn gros" data-a="encore">10 nouvelles cartes de plus</button>' : '') +
      (libre ? '<button type="button" class="btn gros" data-a="refaire">Recommencer</button>' : '') + '</div></div></div>';
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
  function annulable(msg) {
    var avant = JSON.stringify(D);
    return function () { toast(msg, 'Annuler', function () { D = JSON.parse(avant); sauver(); rendre(); }); };
  }

  /* ─── Paquets perso ─── */
  function nommer(q) {
    fenetre(q ? 'Renommer le paquet' : 'Créer un paquet',
      '<div class="champ"><label for="f-titre">Nom du paquet</label><input id="f-titre" maxlength="80" value="' + esc(q ? q.titre : '') + '" placeholder="Ex. Dates de la guerre froide, verbes irréguliers…"></div>',
      [{ libelle: 'Annuler' }, { libelle: q ? 'Enregistrer' : 'Créer', classe: 'plein', action: function (f) {
        var titre = f.querySelector('#f-titre').value.trim();
        if (!titre) { f.querySelector('#f-titre').focus(); return false; }
        if (q) { q.titre = titre; sauver(); rendre(); return; }
        q = { id: uid('p-'), titre: titre, cree: Date.now(), cartes: [] };
        D.perso.unshift(q); D.mes.unshift(q.id);
        sauver(); aller('paquet/' + q.id);
      } }],
      function (f) {
        f.querySelector('#f-titre').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); f.querySelector('.btn.plein').click(); } });
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
    fenetre('Coller une liste',
      '<p>' + t('Une carte par ligne : la question, puis la réponse, séparées par un point-virgule, une tabulation (copier-coller depuis un tableur) ou une barre |.') + '</p>' +
      '<div class="champ"><textarea id="f-liste" rows="9" placeholder="la frontière ; the border&#10;négocier ; to negotiate"></textarea></div><p id="f-apercu">0 carte détectée</p>',
      [{ libelle: 'Annuler' }, { libelle: 'Ajouter ces cartes', classe: 'plein', action: function (f) {
        var cs = lireListe(f.querySelector('#f-liste').value);
        if (!cs.length) { f.querySelector('#f-liste').focus(); return false; }
        var annul = annulable(pl(cs.length, 'carte') + ' ajoutée' + (cs.length > 1 ? 's' : '') + '.');
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
    if (!b || b.disabled || b.tagName === 'INPUT') return;
    var a = b.getAttribute('data-a'), id = b.getAttribute('data-id'), q, annul;
    switch (a) {
      case 'tout': lancer(D.mes.slice(), 'srs'); break;
      case 'reviser':
        q = null;
        if (b.hasAttribute('data-n')) { q = {}; q[id] = +b.getAttribute('data-n'); }
        lancer([id], 'srs', 0, q); break;
      case 'avance': lancer([id], 'srs', 10); break;
      case 'libre': lancer([id], 'libre'); break;
      case 'creer': nommer(null); break;
      case 'renommer': nommer(perso(id)); break;
      case 'rythme': D.prefs.nouv = +b.getAttribute('data-v'); sauver(); rendre(); break;
      case 'ajouter':
        if (!estMien(id)) D.mes.push(id);
        sauver(); rendre(); toast('« ' + paquet(id).titre + ' » ajouté à tes paquets.'); break;
      case 'tout-ajouter':
        b.getAttribute('data-ids').split(',').forEach(function (x) { if (LIB[x] && !estMien(x)) D.mes.push(x); });
        sauver(); rendre(); toast('Paquets ajoutés à ta révision.'); break;
      case 'retirer':
        annul = annulable('« ' + paquet(id).titre + ' » retiré de tes paquets (ta progression est gardée).');
        D.mes = D.mes.filter(function (x) { return x !== id; });
        sauver(); rendre(); annul(); break;
      case 'importer': importer(id); break;
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
        confirmer('Recommencer ce paquet à zéro ?', 'Toutes ses cartes redeviennent « pas encore vues ».', 'Recommencer à zéro', function () {
          annul = annulable('Progression du paquet effacée.');
          Object.keys(D.srs).forEach(function (k) { if (k.indexOf(id + '/') === 0) delete D.srs[k]; });
          sauver(); rendre(); annul();
        });
        break;
      case 'modifier':
        var cid = b.getAttribute('data-c'), carte = perso(id).cartes.filter(function (c) { return c.i === cid; })[0];
        if (!carte) break;
        fenetre('Modifier la carte',
          '<div class="champ"><label for="m-r">Question</label><textarea id="m-r" rows="2">' + esc(carte.r) + '</textarea></div>' +
          '<div class="champ"><label for="m-v">Réponse</label><textarea id="m-v" rows="3">' + esc(carte.v) + '</textarea></div>',
          [{ libelle: 'Annuler' }, { libelle: 'Enregistrer', classe: 'plein', action: function (f) {
            var r = f.querySelector('#m-r').value.trim(), v = f.querySelector('#m-v').value.trim();
            if (!r || !v) return false;
            carte.r = r; carte.v = v;
            sauver(); dessinerListe(paquet(id));
          } }]);
        break;
      case 'supprimer-carte':
        q = perso(id);
        annul = annulable('Carte supprimée.');
        q.cartes = q.cartes.filter(function (c) { return c.i !== b.getAttribute('data-c'); });
        delete D.srs[id + '/' + b.getAttribute('data-c')];
        sauver(); rendre(); annul(); break;
      case 'plus': limiteListe = 100000; dessinerListe(paquet(id)); break;
      case 'parties-plus': partiesOuvertes = true; rendre(); break;
      case 'sauvegarde':
        telecharger('flashcards-ecg-prepa-' + jourCle() + '.json', JSON.stringify(D), 'application/json');
        break;
      case 'restaurer': restaurer(); break;
      case 'retourner': retourner(); break;
      case 'note': repondre(+b.getAttribute('data-v')); break;
      case 'passer': S.pos++; suivante(); break;
      case 'precedente': if (S.pos) { S.pos--; suivante(); } break;
      case 'annuler': annuler(); break;
      case 'quitter': quitter(); break;
      case 'encore': lancer(S.ids, 'srs', 10); break;
      case 'refaire': lancer(S.ids, S.mode); break;
    }
  });
  app.addEventListener('change', function (e) {
    var b = e.target;
    if (b.getAttribute('data-a') !== 'partie') return;
    var id = b.getAttribute('data-id'), p = paquet(id);
    var sel = partiesChoisies(id) || p.parties.map(function (g) { return g.id; });
    var g = b.getAttribute('data-g');
    sel = sel.filter(function (x) { return x !== g; });
    if (b.checked) sel.push(g);
    if (!sel.length) { b.checked = true; toast('Garde au moins une partie.'); return; }
    if (sel.length >= p.parties.length) delete D.prefs.parties[id]; else D.prefs.parties[id] = sel;
    sauver(); rendre();
  });
  app.addEventListener('input', function (e) {
    if (e.target.getAttribute('data-a') === 'chercher') {
      recherche = e.target.value;
      var h = vueCourante.split('/'), id = h[0] === 'paquet' ? h.slice(1).join('/') : h[0];
      if (paquet(id)) dessinerListe(paquet(id));
    }
  });
  app.addEventListener('submit', function (e) {
    var f = e.target;
    if (f.getAttribute('data-f') !== 'ajout') return;
    e.preventDefault();
    var q = perso(f.getAttribute('data-id'));
    var r = f.r.value.trim(), v = f.v.value.trim();
    if (!r || !v) return;
    q.cartes.push({ i: uid('c-'), r: r, v: v, x: '' });
    sauver(); rendre();
    var champ = document.getElementById('a-r');
    if (champ) champ.focus();
    toast('Carte ajoutée.');
  });
  app.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && e.target.closest('form[data-f="ajout"]')) {
      e.preventDefault();
      var f = e.target.closest('form');
      if (f.requestSubmit) f.requestSubmit(); else f.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!S || document.querySelector('.fenetre-fond') || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { e.preventDefault(); quitter(); return; }
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || !S.carte) return;
    if (S.mode === 'libre') {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); retourner(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); S.pos++; suivante(); }
      else if (e.key === 'ArrowLeft' && S.pos) { e.preventDefault(); S.pos--; suivante(); }
      return;
    }
    if ((e.key === 'z' || e.key === 'Backspace') && S.annuler) { e.preventDefault(); annuler(); return; }
    if (!S.retournee) {
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); retourner(); }
      return;
    }
    if (/^[1-3]$/.test(e.key)) { e.preventDefault(); repondre(+e.key); }
  });

  if (!CATALOGUE.length) console.warn('[flashcards] catalogue introuvable (donnees/catalogue.js)');
  rendre();
  SYNC.synchroniser();
})();
