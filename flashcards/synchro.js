/* Synchronisation de l'espace flashcards entre les appareils d'un élève.

   La progression (objet D de flashcards.js : paquets, cartes perso, dates de retour…) est gardée
   dans le navigateur (localStorage « ecg-flashcards:v1:<e-mail> », lu aussi par auth.js) ET dans
   la table Supabase « flashcards » (une ligne par élève, supabase/flashcards-synchro.sql).

   Fusion clé par clé : l'objet est « aplati » (mes/<paquet>, srs/<carte>, perso/<paquet>…) et chaque
   clé garde l'heure de sa dernière modification (D.tps). À chaque synchronisation, la version la plus
   récente de chaque clé l'emporte, des deux côtés ; une suppression est une modification comme une
   autre. On peut donc réviser hors ligne sur un appareil puis sur un autre : rien ne se perd.
   Les heures sont posées par enregistrer(), qui compare l'objet à son dernier état connu : les pages
   n'ont rien d'autre à faire que d'appeler enregistrer() après chaque changement.

   ECGFlashSync.charger()        → D lu dans le navigateur (null s'il n'y en a pas)
   ECGFlashSync.neuf()           → D vide
   ECGFlashSync.enregistrer(D)   → écrit D dans le navigateur, puis l'envoie (quelques secondes après)
   ECGFlashSync.synchroniser()   → Promise : fusionne navigateur et compte tout de suite
   ECGFlashSync.surChangement(f) → f(D) quand une synchronisation a changé les données locales
   ECGFlashSync.surEtat(f)       → f(etat) : 'non-connecte', 'en-cours', 'ok', 'hors-ligne' */
(function () {
  'use strict';
  if (window.ECGFlashSync) return;

  var TABLE = 'flashcards';
  var DELAI = 3000;          // envoi groupé quelques secondes après la dernière modification

  function utilisateur() {
    try { return (window.ECGAuth && window.ECGAuth.current && window.ECGAuth.current()) || null; } catch (e) { return null; }
  }
  function cle() {
    var u = utilisateur();
    return 'ecg-flashcards:v1' + (u && u.email ? ':' + u.email : '');
  }
  function neuf() {
    return { v: 1, mes: [], perso: [], srs: {}, ign: {}, hist: {}, nouv: {},
             prefs: { nouv: 20, parties: {}, sens: {}, saisie: {} } };
  }
  function objet(x) { return x && typeof x === 'object' && !Array.isArray(x); }

  /* ─── Aplatir / reconstruire ─── */
  function aplatir(D) {
    var o = {};
    if (!objet(D)) return o;
    (Array.isArray(D.mes) ? D.mes : []).forEach(function (id, k) { o['mes/' + id] = k; });
    (Array.isArray(D.perso) ? D.perso : []).forEach(function (p) { if (p && p.id) o['perso/' + p.id] = p; });
    ['srs', 'ign', 'hist'].forEach(function (n) {
      if (objet(D[n])) Object.keys(D[n]).forEach(function (k) { if (D[n][k] != null) o[n + '/' + k] = D[n][k]; });
    });
    if (objet(D.nouv)) Object.keys(D.nouv).forEach(function (j) {
      if (objet(D.nouv[j])) Object.keys(D.nouv[j]).forEach(function (p) { o['nouv/' + j + '/' + p] = D.nouv[j][p]; });
    });
    if (objet(D.prefs)) Object.keys(D.prefs).forEach(function (k) {
      var v = D.prefs[k];
      if (objet(v)) Object.keys(v).forEach(function (s) { o['po/' + k + '/' + s] = v[s]; });
      else if (v != null) o['p/' + k] = v;
    });
    return o;
  }
  function reconstruire(o) {
    var D = neuf(), mes = [];
    D.prefs = { parties: {}, sens: {}, saisie: {} };
    Object.keys(o).forEach(function (k) {
      var i = k.indexOf('/'), type = k.slice(0, i), reste = k.slice(i + 1), v = o[k], j;
      if (type === 'mes') mes.push([v, reste]);
      else if (type === 'perso') D.perso.push(v);
      else if (type === 'srs' || type === 'ign' || type === 'hist') D[type][reste] = v;
      else if (type === 'nouv') { j = reste.indexOf('/'); (D.nouv[reste.slice(0, j)] = D.nouv[reste.slice(0, j)] || {})[reste.slice(j + 1)] = v; }
      else if (type === 'po') { j = reste.indexOf('/'); (D.prefs[reste.slice(0, j)] = D.prefs[reste.slice(0, j)] || {})[reste.slice(j + 1)] = v; }
      else if (type === 'p') D.prefs[reste] = v;
    });
    if (D.prefs.nouv == null) D.prefs.nouv = 20;
    D.mes = mes.sort(function (a, b) { return (a[0] - b[0]) || (a[1] < b[1] ? -1 : 1); }).map(function (x) { return x[1]; });
    D.perso.sort(function (a, b) { return (b.cree || 0) - (a.cree || 0); });
    return D;
  }
  function memes(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

  /* Fusion de deux versions { f: aplati, t: heures } : la plus récente gagne, clé par clé. */
  function fusionner(A, B) {
    var f = {}, t = {}, vues = {};
    [A.f, A.t, B.f, B.t].forEach(function (m) { Object.keys(m).forEach(function (k) { vues[k] = 1; }); });
    Object.keys(vues).forEach(function (k) {
      var ta = A.t[k] || 0, tb = B.t[k] || 0, ina = k in A.f, inb = k in B.f, type = k.slice(0, k.indexOf('/'));
      var tps = Math.max(ta, tb);
      if (tps) t[k] = tps;
      if (type === 'hist' && (ina || inb)) { f[k] = Math.max(+A.f[k] || 0, +B.f[k] || 0); return; }  // compteur de la série
      if (type === 'nouv' && ina && inb) { f[k] = Math.max(+A.f[k] || 0, +B.f[k] || 0); return; }    // nouvelles cartes du jour
      var cote;
      if (ta !== tb) cote = ta > tb ? 'a' : 'b';
      else if (ina && inb) {
        cote = 'a';
        if (type === 'srs') {        // anciennes données sans heure : la carte la plus révisée
          var x = A.f[k] || {}, y = B.f[k] || {};
          if ((y.n || 0) > (x.n || 0) || ((y.n || 0) === (x.n || 0) && (y.d || 0) > (x.d || 0))) cote = 'b';
        }
      } else cote = ina ? 'a' : 'b';
      if (cote === 'a' && ina) f[k] = A.f[k];
      else if (cote === 'b' && inb) f[k] = B.f[k];
    });
    return { f: f, t: t };
  }

  /* ─── Navigateur ─── */
  var ETAT = { cle: null, dernier: {}, t: {} };
  function lireLocal() {
    try { var d = JSON.parse(localStorage.getItem(cle()) || 'null'); return objet(d) ? d : null; } catch (e) { return null; }
  }
  function adopter(D) {        // D devient l'état de référence (rien de neuf à horodater)
    ETAT.cle = cle();
    ETAT.dernier = aplatir(D);
    ETAT.t = D && objet(D.tps) ? Object.assign({}, D.tps) : {};
  }
  function ecrireLocal(D) {
    try { localStorage.setItem(cle(), JSON.stringify(D)); return true; } catch (e) { return false; }
  }
  function charger() {
    var D = lireLocal();
    adopter(D);
    return D;
  }
  function horodater(D) {
    if (ETAT.cle !== cle()) adopter(lireLocal());
    var f = aplatir(D), now = Date.now(), change = false;
    Object.keys(f).forEach(function (k) {
      if (!(k in ETAT.dernier) || !memes(f[k], ETAT.dernier[k])) { ETAT.t[k] = now; change = true; }
    });
    Object.keys(ETAT.dernier).forEach(function (k) { if (!(k in f)) { ETAT.t[k] = now; change = true; } });
    ETAT.dernier = f;
    D.tps = Object.assign({}, ETAT.t);
    return change;
  }
  var minuteur = 0;
  function enregistrer(D) {
    var change = horodater(D);
    var ok = ecrireLocal(D);
    if (change) { clearTimeout(minuteur); minuteur = setTimeout(synchroniser, DELAI); }
    return ok;
  }

  /* ─── Compte (Supabase) ─── */
  var ecouteurs = [], ecouteursEtat = [], etatCourant = 'en-cours';
  function annoncer(e) { etatCourant = e; ecouteursEtat.forEach(function (f) { try { f(e); } catch (x) { /* rien */ } }); }
  function client() {
    if (!window.ECGAuth || !window.ECGAuth.client) return Promise.reject(new Error('auth absente'));
    return window.ECGAuth.client();
  }
  var enCours = null, encore = false;
  function synchroniser() {
    clearTimeout(minuteur);
    if (enCours) { encore = true; return enCours; }
    if (!utilisateur()) { annoncer('non-connecte'); return Promise.resolve(null); }
    annoncer('en-cours');
    var c, uid;
    enCours = client().then(function (cl) {
      c = cl;
      return c.auth.getSession();
    }).then(function (r) {
      var s = r && r.data && r.data.session;
      if (!s || !s.user) throw new Error('non-connecte');
      uid = s.user.id;
      return c.from(TABLE).select('donnees').eq('utilisateur', uid).maybeSingle();
    }).then(function (r) {
      if (r.error) throw r.error;
      var distant = r.data && objet(r.data.donnees) ? r.data.donnees : null;
      var local = lireLocal();
      if (!local && !distant) return null;      // rien nulle part : pas de ligne vide à créer
      if (ETAT.cle !== cle()) adopter(local);
      var A = { f: aplatir(local), t: local && objet(local.tps) ? local.tps : {} };
      var B = { f: aplatir(distant), t: distant && objet(distant.tps) ? distant.tps : {} };
      var M = fusionner(A, B);
      var D = reconstruire(M.f);
      D.tps = M.t;
      var localChange = !local || !memes(M.f, A.f);
      var distantChange = !distant || !memes(M.f, B.f) || !memes(M.t, B.t);
      if (localChange || !memes(M.t, A.t)) {
        if (local) Object.keys(local).forEach(function (k) { if (!(k in D)) D[k] = local[k]; });
        ecrireLocal(D);
        adopter(D);
      }
      if (localChange) ecouteurs.forEach(function (f) { try { f(D); } catch (x) { console.warn('[flashcards]', x); } });
      if (!distantChange) return null;
      var envoi = Object.assign({}, D);
      return c.from(TABLE).upsert({ utilisateur: uid, donnees: envoi, maj: new Date().toISOString() }).then(function (w) {
        if (w.error) throw w.error;
      });
    }).then(function () {
      annoncer('ok');
    }, function (e) {
      annoncer(e && e.message === 'non-connecte' ? 'non-connecte' : 'hors-ligne');
      if (!(e && e.message === 'non-connecte')) console.warn('[flashcards] synchronisation impossible :', e && (e.message || e));
    }).then(function () {
      enCours = null;
      if (encore) { encore = false; return synchroniser(); }
    });
    return enCours;
  }

  /* Retour sur l'onglet : on reprend ce qui a pu être fait sur un autre appareil. Départ : on envoie. */
  var dernierRetour = 0;
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') { if (minuteur) synchroniser(); return; }
    if (Date.now() - dernierRetour > 15000) { dernierRetour = Date.now(); synchroniser(); }
  });
  window.addEventListener('online', function () { synchroniser(); });

  window.ECGFlashSync = {
    cle: cle,
    neuf: neuf,
    charger: charger,
    enregistrer: enregistrer,
    synchroniser: synchroniser,
    adopter: adopter,
    surChangement: function (f) { ecouteurs.push(f); },
    surEtat: function (f) { ecouteursEtat.push(f); f(etatCourant); },
    etat: function () { return etatCourant; },
    _fusionner: fusionner, _aplatir: aplatir, _reconstruire: reconstruire
  };
})();
