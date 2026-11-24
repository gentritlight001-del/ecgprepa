/* Espace « Mes thèmes d'anglais » (flashcards/themes.html) : le thème du jour, la progression, les fautes les plus
   fréquentes et l'historique de tous les thèmes (maquette validée par le propriétaire, novembre 2026).
   Lit themes/liste.js (ECG_THEMES) et les résultats de l'élève (D.prefs.themes, synchro.js). Les fautes sont
   recalculées en chargeant le fichier de chaque thème corrigé (themes/<langue>/<date>.js) avec le même moteur
   que la page du thème (theme-correcteur.js) : rien d'autre à enregistrer. */
(function () {
  'use strict';
  var C = window.ECGThemeCorrecteur, SYNC = window.ECGFlashSync, LISTE = window.ECG_THEMES || {};
  var app = document.getElementById('app');
  var LANGUE = 'anglais', LECONS = '../premiere_annee/langues/anglais/';
  var TYPES = { grammaire: 'Les fautes de grammaire', 'faux-sens': 'Les faux-sens et faux amis', contresens: 'Les contresens',
    gallicisme: 'Les gallicismes (calques du français)', barbarisme: 'Les barbarismes (mots qui n’existent pas)', oubli: 'Les oublis' };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function typo(s) { return String(s == null ? '' : s).replace(/'/g, '’').replace(/ ([:;!?»%])/g, ' $1').replace(/« /g, '« '); }
  function t(s) { return typo(esc(s)); }
  function note(x) { return String(Math.round(x * 100) / 100).replace('.', ','); }
  function pl(n, un, plusieurs) { return n + ' ' + (n > 1 ? (plusieurs || un + 's') : un); }
  function jour(d, court) {
    var x = new Date(d + 'T12:00:00');
    var s = x.toLocaleDateString('fr-FR', court ? { day: 'numeric', month: 'short' } : { weekday: 'long', day: 'numeric', month: 'long' });
    return court ? s : s.replace(/^./, function (c) { return c.toUpperCase(); });
  }
  function aujourdhui() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  function donnees() {
    var d = (SYNC && SYNC.charger()) || (SYNC ? SYNC.neuf() : {});
    d.prefs = d.prefs || {}; d.prefs.themes = d.prefs.themes || {}; d.srs = d.srs || {};
    return d;
  }
  function resultat(D, date) { var R = D.prefs.themes[LANGUE + '/' + date]; return R && Array.isArray(R.r) ? R : null; }
  function couleur(n) { return n >= 14 ? 'vert' : n >= 10 ? 'or' : 'rouge'; }

  var CHARGES = {};
  function charger(date) {
    var cle = LANGUE + '/' + date;
    if (window.ECG_THEMES_DONNEES && window.ECG_THEMES_DONNEES[cle]) return Promise.resolve(window.ECG_THEMES_DONNEES[cle]);
    if (!CHARGES[cle]) CHARGES[cle] = new Promise(function (ok) {
      var s = document.createElement('script');
      s.src = 'themes/' + LANGUE + '/' + date + '.js?v=' + Math.floor(Date.now() / 60000);
      s.onload = function () { ok((window.ECG_THEMES_DONNEES || {})[cle] || null); };
      s.onerror = function () { ok(null); };
      document.head.appendChild(s);
    });
    return CHARGES[cle];
  }

  /* Fautes de tous les thèmes corrigés, regroupées par leçon (ou, sans leçon, par type) */
  function fautes(D, liste) {
    var faits = liste.filter(function (x) { return resultat(D, x.date); });
    return Promise.all(faits.map(function (x) { return charger(x.date); })).then(function (Ts) {
      var groupes = {};
      Ts.forEach(function (T, k) {
        if (!T) return;
        var R = resultat(D, faits[k].date);
        T.phrases.forEach(function (p, i) {
          var r = C.corrigerPhrase(p, R.r[i] || '');
          r.morceaux.forEach(function (m) {
            m.fautes.forEach(function (f) {
              var cle = f.lecon ? 'l' + f.lecon.n + '#' + (f.lecon.ancre || '') : 't' + f.type;
              var g = groupes[cle] = groupes[cle] || { n: 0, f: f, titre: f.lecon ? f.lecon.titre : (TYPES[f.type] || f.type), lecon: f.lecon || null, vus: {} };
              g.n++;
              if (!g.vus[f.faux]) { g.vus[f.faux] = 1; if (!g.ex) g.ex = f; }
            });
          });
        });
      });
      return Object.keys(groupes).map(function (k) { return groupes[k]; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 3);
    });
  }

  function rendre() {
    var D = donnees(), liste = (LISTE[LANGUE] || []).filter(function (x) { return x.date <= aujourdhui(); });
    if (!liste.length) { app.innerHTML = '<p class="fc-vide">' + t('Pas encore de thème : le premier arrive bientôt.') + '</p>'; return; }
    var dernier = liste[0], Rj = resultat(D, dernier.date);
    var connus = (dernier.cartes || []).filter(function (id) { var st = D.srs[LANGUE + '/' + id]; return st && st.s; }).length;
    var nouveaux = (dernier.aides || 0) + (dernier.cartes || []).length - connus;
    var faits = liste.filter(function (x) { return resultat(D, x.date); });
    var notes = faits.map(function (x) { return resultat(D, x.date).n || 0; });
    var moyenne = notes.length ? notes.reduce(function (a, b) { return a + b; }, 0) / notes.length : 0;

    var html = '<header class="th-tete"><div class="sur">' + t('Anglais · Un thème par jour') + '</div><h1>' + t('Mes thèmes d\'anglais') + '</h1>' +
      '<p class="hero-txt">' + t('Chaque jour, un texte de presse à traduire, écrit avec les mots de tes flashcards. Corrigé et noté sur 20 : tu retrouves ici tous tes thèmes et tes notes.') + '</p></header>';

    /* Le thème du jour */
    html += '<section class="th-carte" aria-label="Le thème du jour"><div class="th-carte-txt"><div class="sur">' +
      t((dernier.date === aujourdhui() ? 'Aujourd\'hui · ' : 'Dernier thème · ') + jour(dernier.date)) + '</div>' +
      '<h2>' + t(dernier.titre) + '</h2><p>' + t((function () { var k = Math.max(1, Math.min(dernier.phrases || 5, +(D.prefs || {}).themeNb || dernier.phrases || 5)); return pl(k, 'phrase') + ' à traduire · environ ' + (3 * k) + ' min · tu choisis entre 1 et ' + (dernier.phrases || 5); })()) + '</p></div>' +
      '<div class="th-carte-act"><a class="btn" href="theme.html#' + LANGUE + '/' + esc(dernier.date) + '">' + (Rj ? 'Voir la correction' : 'Faire le thème') + '</a>' +
      (Rj ? '<span>' + t('Ta note : ' + note(Rj.n || 0) + ' / 20') + '</span>' : '') + '</div></section>';

    /* Ta progression */
    var serie = liste.slice(0, 12).reverse();
    /* Toujours 12 places : avec peu de thèmes, les barres restent étroites, à droite (le plus récent) */
    var barres = serie.map(function (x, k) {
      var R = resultat(D, x.date), lab = jour(x.date, true), place = k === 0 ? ';grid-column-start:' + (13 - serie.length) : '';
      if (!R) return '<div class="ts-b vide" style="' + place.slice(1) + '" title="' + t(lab + ' : pas fait') + '"></div>';
      var n = R.n || 0, h = Math.max(4, Math.round(n / 20 * 100));
      return '<div class="ts-b' + (x.date === faits[0].date ? ' der' : '') + '" style="height:' + h + '%' + place + '" title="' + t(lab + ' : ' + note(n) + ' / 20') + '"><span>' + note(n) + '</span></div>';
    }).join('');
    var evolution = '';
    if (notes.length >= 6) {
      var rec = notes.slice(0, 3).reduce(function (a, b) { return a + b; }, 0) / 3, anc = notes.slice(3, 6).reduce(function (a, b) { return a + b; }, 0) / 3, d = Math.round((rec - anc) * 2) / 2;
      if (d) evolution = '<div class="ts-evo ' + (d > 0 ? 'vert' : 'rouge') + '">' + t((d > 0 ? '+' : '') + note(d) + ' point' + (Math.abs(d) > 1 ? 's' : '') + ' sur tes 3 derniers thèmes') + '</div>';
    }
    html += '<section class="ts-prog" aria-label="Ta progression"><div class="ts-chiffres"><h2>Ta progression</h2>' +
      (notes.length ? '<div class="ts-moy"><b>' + note(Math.round(moyenne * 10) / 10) + '</b><span>' + t('/ 20 de moyenne') + '</span></div>' +
        '<div class="ts-faits">' + t(pl(faits.length, 'thème fait', 'thèmes faits') + ' sur ' + liste.length) + '</div>' + evolution
        : '<p class="ts-rien">' + t('Fais ton premier thème : ta note et ta progression s\'afficheront ici.') + '</p>') + '</div>' +
      (notes.length ? '<figure class="ts-graph" role="img" aria-label="' + t('Notes des ' + serie.length + ' derniers thèmes, du plus ancien au plus récent') + '">' +
        '<figcaption>Tes notes, du plus ancien au plus récent</figcaption><div class="ts-barres" style="--n:' + serie.length + '">' + barres + '</div>' +
        '<div class="ts-axe"><span>' + t(jour(serie[0].date, true)) + '</span><span>' + t('Pointillés : thème pas fait') + '</span><span>' + t(jour(serie[serie.length - 1].date, true)) + '</span></div></figure>' : '') +
      '</section>';

    /* Ce que tu rates le plus (rempli ensuite) */
    if (notes.length) html += '<section class="ts-rates" id="ts-rates" aria-label="Ce que tu rates le plus"><h2>' + t('Ce que tu rates le plus') + '</h2>' +
      '<p class="ts-sous">' + t('Tes fautes les plus fréquentes sur tous tes thèmes, avec la leçon à revoir.') + '</p><div class="ts-cartes"><p class="fc-vide">Calcul…</p></div></section>';

    /* Tous les thèmes */
    html += '<section class="ts-tous" aria-label="Tous les thèmes"><h2>' + t('Tous les thèmes') + '</h2><ul>' + liste.map(function (x, k) {
      var R = resultat(D, x.date);
      var etat = R ? '<span class="ts-note ' + couleur(R.n || 0) + '">' + note(R.n || 0) + ' / 20</span>'
        : k === 0 ? '<span class="ts-etat afaire">À faire</span>' : '<span class="ts-etat">Pas fait</span>';
      return '<li><a href="theme.html#' + LANGUE + '/' + esc(x.date) + '"><span class="ts-date">' + t(jour(x.date)) + '</span><b>' + t(x.titre) + '</b>' + etat + '</a></li>';
    }).join('') + '</ul><p class="ts-note-bas">' + t('Un thème pas fait reste ouvert : tu peux le faire quand tu veux. Un thème corrigé rouvre ta correction.') + '</p></section>';
    app.innerHTML = html;

    if (notes.length) fautes(D, liste).then(function (gs) {
      var box = document.querySelector('#ts-rates .ts-cartes');
      if (!box) return;
      if (!gs.length) { document.getElementById('ts-rates').querySelector('.ts-sous').textContent = typo('Aucune faute prévue dans tes thèmes corrigés : continue comme ça.'); box.innerHTML = ''; return; }
      box.innerHTML = gs.map(function (g) {
        var lien = g.lecon ? LECONS + 'lecon' + g.lecon.n + '.html' + (g.lecon.ancre ? '#' + g.lecon.ancre : '') : 'index.html#paquet/theme-' + LANGUE;
        return '<a class="ts-carte" href="' + esc(lien) + '"><span class="ts-n">' + pl(g.n, 'faute') + '</span><b>' + t(g.titre) + '</b>' +
          '<span class="ts-ex">' + t('« ' + g.ex.faux + ' » au lieu de « ' + g.ex.juste + ' ».') + '</span>' +
          '<span class="ts-lien">' + t(g.lecon ? 'Leçon ' + g.lecon.n + ' →' : 'Revoir mes cartes de thèmes →') + '</span></a>';
      }).join('');
    });
  }

  if (SYNC) SYNC.surChangement(rendre);
  rendre();
  if (SYNC && SYNC.synchroniser) SYNC.synchroniser();
})();
