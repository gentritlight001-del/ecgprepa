/* ══════════════════════════════════════════════════════════════════
   ECG Prépa — Système de comptes (v3, base de données Supabase)
   Inclus dans TOUTES les pages du site (dans <head>).

   - Authentification réelle : les comptes vivent dans une base
     partagée, pas dans le navigateur.
   - Protège les pages, gère l'inscription, la connexion, la
     déconnexion, et le badge utilisateur.
   - Un administrateur voit tous les comptes, toutes les sessions
     ouvertes, et peut bloquer / déconnecter / supprimer à distance.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════
     ★ À CONFIGURER — Supabase → Project Settings → API ★
     ══════════════════════════════════════════════════════════════ */
  var SUPABASE_URL = 'https://oeityryyejvrawjqiesm.supabase.co';
  var SUPABASE_ANON_KEY = 'sb_publishable_WMbiOSphqsGlOaAaGvmpfQ_hbOzAD_z';
  /* La clé « publishable » (sb_publishable_…) est publique par nature :
     ce sont les règles RLS de supabase-schema.sql qui protègent les données.
     ⚠ Ne mets JAMAIS ici une clé « sb_secret_… » ou « service_role ». */

  /* Client Supabase servi depuis le site lui-même (vendor/supabase.js,
     version 2.116.0 figée) : plus d'aller-retour vers un CDN externe à
     chaque page. Pour mettre à jour : remplacer ce fichier par
     node_modules/@supabase/supabase-js/dist/umd/supabase.js. */
  var SUPABASE_LIB = 'vendor/supabase.js';

  /* ─── Chemin de base du site (déduit de l'URL de ce script) ─── */
  var BASE = '';
  try {
    var me = document.currentScript && document.currentScript.src;
    if (me) BASE = new URL('.', me).href;
  } catch (e) { BASE = ''; }

  var LOGIN_URL = BASE + 'login.html';
  var HOME_URL  = BASE + 'index.html';
  var ADMIN_URL = BASE + 'admin.html';

  /* ─── Service worker : mise en cache, mode hors-ligne ──────────
     Enregistré une seule fois, depuis ce script commun à toutes les
     pages. Sans effet si le navigateur ne le supporte pas, si le
     site tourne en http:// non sécurisé, ou en ouvrant un fichier
     en local (file://) : aucun de ces cas ne casse quoi que ce soit,
     le site fonctionne alors simplement sans mise en cache. */
  try {
    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register(BASE + 'sw.js').catch(function () {
          /* Échec silencieux : pas de mode hors-ligne, mais le site
             continue de fonctionner normalement en ligne. */
        });
      });
    }
  } catch (e) {}

  /* ─── Navigation rapide entre les pages ──────────────────────
     1. Transition en fondu entre deux pages (Chrome, Edge, Safari
        récents ; ignoré ailleurs, sans rien casser).
     2. Préchargement : dès que la souris survole un lien (ou qu'un
        doigt le touche), la page visée est téléchargée en avance et
        rangée par le service worker. Au clic, elle s'affiche
        instantanément. Marche aussi pour les cartes cliquables en
        onclick="location.href='…'". */
  (function navRapide() {
    try {
      var st = document.createElement('style');
      st.textContent =
        '@view-transition{navigation:auto}' +
        '::view-transition-old(root),::view-transition-new(root){animation-duration:.16s}' +
        '@media (prefers-reduced-motion:reduce){@view-transition{navigation:none}}';
      (document.head || document.documentElement).appendChild(st);
    } catch (e) {}

    var eco = navigator.connection && (navigator.connection.saveData ||
      /2g/.test(navigator.connection.effectiveType || ''));
    if (eco || !window.fetch || location.protocol.indexOf('http') !== 0) return;

    var deja = {}, n = 0, MAX = 40, minuteur = null;
    var RE_ONCLICK = /location\.href\s*=\s*['"]([^'"]+)['"]/;

    function cible(el) {
      if (!el || !el.closest) return null;
      var lien = el.closest('a[href],[onclick]');
      if (!lien) return null;
      if (lien.tagName === 'A') {
        if (lien.target === '_blank' || lien.hasAttribute('download')) return null;
        return lien.getAttribute('href');
      }
      var m = RE_ONCLICK.exec(lien.getAttribute('onclick') || '');
      return m ? m[1] : null;
    }

    function precharger(href) {
      if (!href || n >= MAX) return;
      var u;
      try { u = new URL(href, location.href); } catch (e) { return; }
      if (u.origin !== location.origin) return;
      u.hash = '';
      if (u.href === location.href.split('#')[0]) return;
      if (!/(\.html?|\/)$/i.test(u.pathname)) return;
      if (deja[u.href]) return;
      deja[u.href] = 1; n++;
      fetch(u.href, { credentials: 'same-origin', headers: { 'Accept': 'text/html' } })
        .catch(function () { delete deja[u.href]; });
    }

    document.addEventListener('mouseover', function (e) {
      var href = cible(e.target);
      clearTimeout(minuteur);
      if (href) minuteur = setTimeout(function () { precharger(href); }, 65);
    }, { passive: true });
    document.addEventListener('mouseout', function () { clearTimeout(minuteur); }, { passive: true });
    document.addEventListener('touchstart', function (e) { precharger(cible(e.target)); }, { passive: true });
    document.addEventListener('focusin', function (e) { precharger(cible(e.target)); });
  })();

  var K_PROFIL = 'ecg_profil';   // miroir local, pour un accès synchrone
  var K_NL_ATTENTE = 'ecg_newsletter_attente'; // choix fait à l'inscription
  var K_SID    = 'ecg_sid';      // identifiant de la session ouverte
  var K_VERIF  = 'ecg_verif_t';  // date de la dernière vérification réussie
  /* Si la session a été vérifiée il y a moins de VERIF_OK_MS, la page
     s'affiche tout de suite ; la vérification continue en arrière-plan
     et renvoie vers la connexion si elle échoue. */
  var VERIF_OK_MS = 10 * 60 * 1000;
  var EN_LIGNE_MS = 5 * 60 * 1000;

  /* ─── Les six rubriques de la lettre d'information ───────────
     L'identifiant (id) est ce qui est stocké en base : ne le change
     pas une fois le site en ligne, sinon les abonnements existants
     ne correspondront plus. Le libellé, lui, est libre. */
  var RUBRIQUES = [
    { id: 'monde',      titre: 'Actualité mondiale',    detail: 'Toutes les deux semaines.' },
    { id: 'en',         titre: 'Actualité anglophone',  detail: 'Toutes les deux semaines.' },
    { id: 'es',         titre: 'Actualité hispanophone', detail: 'Toutes les deux semaines.' },
    { id: 'de',         titre: 'Actualité germanophone', detail: 'Toutes les deux semaines.' },
    { id: 'culture',    titre: 'Culture générale',      detail: 'Rester au courant des nouvelles fiches.' },
    { id: 'nouveautes', titre: 'Nouveautés du site',    detail: 'Être au courant des nouveautés du site.' }
  ];

  /* ─── Toutes les rubriques verrouillables du site ──────────────
     Trois niveaux, imbriqués : verrouiller une grande section (ex.
     Culture Générale) verrouille tout ce qu'elle contient ; une
     matière peut aussi être verrouillée seule, sans toucher au
     reste de son année.
       niveau 1 → les 4 sections de la page d'accueil
       niveau 2 → les 2 années, à l'intérieur de Cours ECG
       niveau 3 → les 5 matières de chaque année
     « motifs » repère automatiquement toute page qui vit sous l'un
     de ces chemins, pour bloquer l'accès direct (pas seulement
     griser la carte). « retour » est la page proposée quand un
     membre est arrêté. Ne pas changer les id une fois en ligne : ce
     sont eux qui sont stockés dans la table « rubriques_verrouillage »
     côté Supabase. */
  var RUBRIQUES_SITE = [
    /* Niveau 1 — page d'accueil */
    { id: 'cours-ecg',        niveau: 1, nom: 'Cours ECG',         groupe: 'Page d\u2019accueil', motifs: ['cours-ecg.html', 'premiere_annee/', 'deuxieme_annee/'], retour: 'index.html' },
    { id: 'culture-generale', niveau: 1, nom: 'Culture Générale',  groupe: 'Page d\u2019accueil', motifs: ['culture-generale.html', 'culture-generale/'], retour: 'index.html' },
    { id: 'humanite',         niveau: 1, nom: 'Humanité',          groupe: 'Page d\u2019accueil', motifs: ['humanite.html', 'humanite/'], retour: 'index.html' },
    { id: 'actualites',       niveau: 1, nom: 'Actualités',        groupe: 'Page d\u2019accueil', motifs: ['actualites/'], retour: 'index.html' },

    /* Niveau 2 — les deux années, dans Cours ECG */
    { id: 'premiere-annee',   niveau: 2, nom: 'Première année',    groupe: 'Cours ECG', motifs: ['premiere_annee/'], retour: 'cours-ecg.html' },
    { id: 'deuxieme-annee',   niveau: 2, nom: 'Deuxième année',    groupe: 'Cours ECG', motifs: ['deuxieme_annee/'], retour: 'cours-ecg.html' },

    /* Niveau 3 — les matières, dans chaque année */
    { id: 'p1-mathematiques', niveau: 3, nom: 'Mathématiques', groupe: '1ère année', motifs: ['premiere_annee/mathematiques/'], retour: 'premiere_annee/index.html' },
    { id: 'p1-esh',           niveau: 3, nom: 'ESH',            groupe: '1ère année', motifs: ['premiere_annee/esh/'], retour: 'premiere_annee/index.html' },
    { id: 'p1-hgg',           niveau: 3, nom: 'HGG',            groupe: '1ère année', motifs: ['premiere_annee/hgg/'], retour: 'premiere_annee/index.html' },
    { id: 'p1-philosophie',   niveau: 3, nom: 'Philosophie',    groupe: '1ère année', motifs: ['premiere_annee/philosophie/'], retour: 'premiere_annee/index.html' },
    { id: 'p1-langues',       niveau: 3, nom: 'Langues',        groupe: '1ère année', motifs: ['premiere_annee/langues/'], retour: 'premiere_annee/index.html' },
    { id: 'p2-mathematiques', niveau: 3, nom: 'Mathématiques', groupe: '2ème année', motifs: ['deuxieme_annee/maths/'], retour: 'deuxieme_annee/index.html' },
    { id: 'p2-esh',           niveau: 3, nom: 'ESH',            groupe: '2ème année', motifs: ['deuxieme_annee/esh/'], retour: 'deuxieme_annee/index.html' },
    { id: 'p2-hgg',           niveau: 3, nom: 'HGG',            groupe: '2ème année', motifs: ['deuxieme_annee/hgg/'], retour: 'deuxieme_annee/index.html' },
    { id: 'p2-philosophie',   niveau: 3, nom: 'Philosophie',    groupe: '2ème année', motifs: ['deuxieme_annee/philosophie/'], retour: 'deuxieme_annee/index.html' },
    { id: 'p2-langues',       niveau: 3, nom: 'Langues',        groupe: '2ème année', motifs: ['deuxieme_annee/langues/'], retour: 'deuxieme_annee/index.html' }
  ];

  /* Repère TOUTES les rubriques (le cas échéant, plusieurs niveaux
     à la fois) sous lesquelles vit la page actuelle, à partir de son
     chemin dans l'URL. Une page de chapitre de maths 1ère année
     répond par ex. à la fois à « p1-mathematiques », « premiere-annee »
     et « cours-ecg » : verrouiller n'importe lequel des trois suffit
     à la bloquer. Fonctionne quelle que soit la profondeur de la
     page et quel que soit le sous-dossier d'hébergement du site. */
  function detecterRubriques() {
    var chemin = '';
    try { chemin = decodeURIComponent(location.pathname).toLowerCase(); } catch (e) { chemin = location.pathname.toLowerCase(); }
    var trouve = [];
    RUBRIQUES_SITE.forEach(function (r) {
      for (var i = 0; i < r.motifs.length; i++) {
        if (chemin.indexOf('/' + r.motifs[i].toLowerCase()) !== -1) { trouve.push(r); return; }
      }
    });
    return trouve;
  }
  var rubriquesActuelles = detecterRubriques();

  /* Résout n'importe quelle URL (absolue ou relative à la page en
     cours) en un chemin relatif à la racine du site — utilisé pour
     reconnaître automatiquement, à partir de son lien, N'IMPORTE
     QUELLE carte cliquable du site (chapitre, leçon, fiche…), sans
     avoir à poser data-rubrique à la main sur chacune. */
  function cheminRelatifAuSite(urlAbsolue) {
    try {
      var basePath = decodeURIComponent(new URL(BASE).pathname).toLowerCase();
      var p = decodeURIComponent(urlAbsolue.pathname).toLowerCase();
      if (p.indexOf(basePath) === 0) return p.slice(basePath.length);
      return p.replace(/^\//, '');
    } catch (e) { return null; }
  }
  /* Le chemin de la page actuelle elle-même (pas celui d'un lien) :
     permet de verrouiller une page précise (un chapitre, une leçon…)
     individuellement, sans qu'elle corresponde à aucun motif de
     RUBRIQUES_SITE ci-dessus. */
  var cheminActuel = (function () { try { return cheminRelatifAuSite(new URL(location.href)); } catch (e) { return null; } })();


  /* Pages consultables sans compte (vitrine publique, référencement).
     Toutes les autres pages exigent une session valide. */
  var PAGES_PUBLIQUES = ['login.html', 'accueil.html', 'contact.html', 'mentions-legales.html', 'cgu.html', 'confidentialite.html', '404.html', 'desinscription.html', 'hors-ligne.html'];

  /* Pages réservées aux administrateurs : un membre connecté qui
     connaît l'adresse est arrêté et renvoyé vers l'accueil. */
  var PAGES_ADMIN = ['admin.html', 'idees-articles.html'];

  var file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (file.indexOf('.') === -1) file = file + '.html';
  var pageLogin = file === 'login.html';
  var pagePublique = PAGES_PUBLIQUES.indexOf(file) !== -1;
  var pageAdmin = file === 'admin.html';
  var pageReserveeAdmin = PAGES_ADMIN.indexOf(file) !== -1;

  /* ─── Petit stockage local (miroir seulement) ─── */
  function lire(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function ecrire(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function effacer(k) { try { localStorage.removeItem(k); } catch (e) {} }

  function profilLocal() {
    try { return JSON.parse(lire(K_PROFIL) || 'null'); } catch (e) { return null; }
  }
  function memoriser(p) {
    if (p) { ecrire(K_PROFIL, JSON.stringify(p)); ecrire(K_VERIF, String(Date.now())); }
    else { effacer(K_PROFIL); effacer(K_VERIF); }
  }

  /* ─── Voile anti-clignotement sur les pages protégées ─── */
  var voile = null;
  function poserVoile() {
    if (pagePublique || voile) return;
    voile = document.createElement('style');
    voile.textContent =
      'html{visibility:hidden!important}' +
      'html::after{content:"";visibility:visible;position:fixed;inset:0;background:#0d0d0f;z-index:2147483647}';
    (document.head || document.documentElement).appendChild(voile);
    setTimeout(leverVoile, 8000); /* filet de sécurité : jamais de page blanche définitive */
  }
  function leverVoile() {
    if (voile && voile.parentNode) voile.parentNode.removeChild(voile);
    voile = null;
  }
  /* Affichage immédiat si le compte a été vérifié récemment.
     Les pages réservées à l'admin gardent toujours le voile. */
  var verifRecente = (function () {
    if (pagePublique || pageReserveeAdmin) return false;
    var p = profilLocal();
    var t = +lire(K_VERIF) || 0;
    return !!(p && p.email && Date.now() - t < VERIF_OK_MS);
  })();
  if (!verifRecente) poserVoile();

  function alerteReseau(texte) {
    leverVoile();
    if (document.getElementById('ecg-alerte')) return;
    var poser = function () {
      var d = document.createElement('div');
      d.id = 'ecg-alerte';
      d.textContent = texte;
      d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483646;background:#3a2626;' +
        'color:#e8b0b0;font:400 .82rem/1.5 "DM Sans",system-ui,sans-serif;padding:11px 18px;text-align:center';
      document.body.appendChild(d);
    };
    if (document.body) poser();
    else document.addEventListener('DOMContentLoaded', poser);
  }

  /* ─── Chargement du client Supabase (une seule fois) ─── */
  var _sb = null;
  function chargerLib() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
    return new Promise(function (ok, ko) {
      var s = document.createElement('script');
      s.src = BASE + SUPABASE_LIB;
      s.async = true;
      s.onload = function () {
        if (window.supabase && window.supabase.createClient) ok(window.supabase);
        else ko(new Error('supabase.js chargé mais inutilisable'));
      };
      s.onerror = function () { ko(new Error('supabase.js introuvable')); };
      (document.head || document.documentElement).appendChild(s);
    });
  }

  function sb() {
    if (_sb) return _sb;
    _sb = chargerLib().then(function (m) {
      return m.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storageKey: 'ecg_auth'
        }
      });
    });
    return _sb;
  }

  /* ─── Verrouillage universel de TOUTES les cartes cliquables ────
     Repère automatiquement, sur n'importe quelle page, chaque carte
     qui mène quelque part : celles marquées data-rubrique="…" (les
     16 grandes rubriques), et TOUTES les autres (.chapter-item,
     .choice-card, .home-card) — chapitres, leçons de langue,
     sous-choix — en déduisant leur identifiant depuis leur propre
     lien. Aucune modification de page n'est donc nécessaire pour
     qu'un nouveau chapitre ajouté plus tard soit lui aussi
     verrouillable : ça marche tout seul.
     Pour un membre : carte grisée, cadenas, clic neutralisé.
     Pour un administrateur : pas de grisage (il garde l'accès), mais
     un petit bouton apparaît directement sur la carte pour
     verrouiller/déverrouiller en un clic, sans passer par l'admin. */
  function resoudreDestination(el) {
    var href = (el.tagName === 'A') ? el.getAttribute('href') : null;
    if (!href) {
      var m = /location\.href\s*=\s*['"]([^'"]+)['"]/.exec(el.getAttribute('onclick') || '');
      if (m) href = m[1];
    }
    if (!href) return null;
    try { return cheminRelatifAuSite(new URL(href, location.href)); } catch (e) { return null; }
  }

  function collecterNoeudsVerrouillables() {
    var noeuds = [];
    document.querySelectorAll('[data-rubrique], .chapter-item, .choice-card, .home-card').forEach(function (el) {
      var id = el.getAttribute('data-rubrique') || resoudreDestination(el);
      if (!id) return; /* carte décorative ou déjà figée « à venir » : on n'y touche pas */
      noeuds.push({ el: el, id: id });
    });
    return noeuds;
  }

  function ajouterCadenas(el) {
    if (el.querySelector('.ecg-cadenas')) return;
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    var b = document.createElement('span');
    b.className = 'ecg-cadenas';
    b.textContent = '🔒';
    b.style.cssText = 'position:absolute;top:10px;right:12px;font-size:.95rem;line-height:1;z-index:3;pointer-events:none';
    el.appendChild(b);
  }

  function griserPourMembre(el) {
    el.style.opacity = '0.45';
    el.style.pointerEvents = 'none';
    el.style.cursor = 'default';
    ajouterCadenas(el);
  }

  /* Bouton discret, toujours présent sur une carte reconnue, pour
     qu'un administrateur bascule son état sans quitter la page. */
  function ajouterBoutonAdmin(el, id, verrouille) {
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    if (verrouille) ajouterCadenas(el);
    var ancien = el.querySelector('.ecg-bouton-verrou');
    if (ancien) ancien.parentNode.removeChild(ancien);
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ecg-bouton-verrou';
    btn.textContent = verrouille ? '🔓 Déverrouiller' : '🔒 Verrouiller';
    btn.style.cssText = 'position:absolute;bottom:10px;right:10px;z-index:5;border:0;border-radius:20px;' +
      'padding:4px 10px;font:600 .62rem "DM Mono",monospace;letter-spacing:.03em;cursor:pointer;pointer-events:auto;' +
      'opacity:.94;color:#12120f;background:' + (verrouille ? '#9ecba0' : '#e08a8a');
    btn.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      btn.disabled = true; btn.textContent = '…';
      Auth.admin.verrouillerRubrique(id, !verrouille)
        .then(function () { location.reload(); })
        .catch(function () { btn.disabled = false; btn.textContent = verrouille ? '🔓 Déverrouiller' : '🔒 Verrouiller'; });
    });
    el.appendChild(btn);
  }

  function afficherDebugTemp(texte) {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;bottom:10px;left:10px;right:10px;z-index:99999;background:#000;color:#0f0;font:11px monospace;padding:12px;border-radius:8px;white-space:pre-wrap;max-height:40vh;overflow:auto;border:2px solid #0f0';
    d.textContent = texte;
    document.body.appendChild(d);
  }

  function appliquerVerrouillageCartes() {
    var noeuds = collecterNoeudsVerrouillables();
    var dbg = 'DEBUG VERROUS\nnoeuds trouvés: ' + noeuds.length + '\n' + noeuds.map(function(n){ return '- ' + n.id; }).join('\n');
    if (!noeuds.length) { afficherDebugTemp(dbg + '\n=> ARRET: aucun noeud détecté'); return; }
    var admin = (function () { var p = profilLocal(); return !!p && p.role === 'admin'; })();
    dbg += '\nprofilLocal: ' + JSON.stringify(profilLocal());
    dbg += '\nadmin détecté: ' + admin;
    sb().then(function (c) {
      return c.from('rubriques_verrouillage').select('id,verrouille');
    }).then(function (r) {
      dbg += '\nrequête rubriques_verrouillage: ' + JSON.stringify(r && r.error ? {error: r.error} : {data: r && r.data});
      afficherDebugTemp(dbg);
      if (!r || r.error) return;
      var etat = {};
      (r.data || []).forEach(function (x) { etat[x.id] = !!x.verrouille; });
      noeuds.forEach(function (n) {
        var v = !!etat[n.id];
        if (admin) ajouterBoutonAdmin(n.el, n.id, v);
        else if (v) griserPourMembre(n.el);
      });
    }).catch(function (e) { afficherDebugTemp(dbg + '\nERREUR CATCH: ' + (e && e.message || e)); });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', appliquerVerrouillageCartes);
  } else {
    appliquerVerrouillageCartes();
  }

  function agent() { return (navigator.userAgent || '').slice(0, 400); }
  function plateforme() { return (navigator.platform || '').slice(0, 80); }

  function noter(type, email, detail) {
    return sb().then(function (c) {
      return c.rpc('noter', {
        p_type: type, p_email: email || '', p_detail: detail || '', p_agent: agent()
      });
    }).catch(function () {});
  }

  var MOTIFS = {
    bloque: 'Ton compte a été désactivé par l\'administrateur.',
    attente: 'Ton compte attend la validation de l\'administrateur.',
    supprime: 'Ton compte a été supprimé.',
    session_fermee: 'Ta session a été fermée par l\'administrateur.',
    anonyme: 'Ta session a expiré.'
  };

  function versLogin(raison) {
    memoriser(null); effacer(K_SID);
    var url = LOGIN_URL + (raison ? '?raison=' + encodeURIComponent(raison) : '');
    location.replace(url);
  }

  /* ══════════════════════════════════════════════════════════════
     API publique — mêmes noms qu'avant, pour ne rien casser
     ══════════════════════════════════════════════════════════════ */
  var Auth = {
    /* Donne accès au client Supabase déjà authentifié.
       Utilisé par mails.js pour appeler la fonction d'envoi. */
    client: function () { return sb(); },

    isValidEmail: function (email) {
      return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(email || '').trim());
    },

    passwordScore: function (pw) {
      pw = pw || '';
      var s = 0;
      if (pw.length >= 8) s++;
      if (pw.length >= 12) s++;
      if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
      if (/\d/.test(pw)) s++;
      if (/[^\w\s]/.test(pw)) s++;
      return Math.min(s, 4);
    },

    /* Profil du visiteur connecté — lecture synchrone du miroir local.
       Champs : id, email, prenom, nom, role, statut. */
    current: function () { return profilLocal(); },

    estAdmin: function () {
      var p = profilLocal();
      return !!p && p.role === 'admin';
    },

    loginUrl: LOGIN_URL,
    homeUrl: HOME_URL,
    adminUrl: ADMIN_URL,
    enLigneMs: EN_LIGNE_MS,

    /* ─── Inscription ─── */
    signup: function (prenom, nom, email, password) {
      email = String(email || '').trim().toLowerCase();
      prenom = String(prenom || '').trim();
      nom = String(nom || '').trim();

      if (!prenom) return Promise.reject('Indique ton prénom.');
      if (!Auth.isValidEmail(email)) return Promise.reject('Cette adresse e-mail n\'est pas valide.');
      if (password.length < 8) return Promise.reject('Le mot de passe doit faire au moins 8 caractères.');

      return sb().then(function (c) {
        return c.auth.signUp({
          email: email,
          password: password,
          options: { data: { prenom: prenom, nom: nom } }
        });
      }).then(function (r) {
        if (r.error) {
          var m = String(r.error.message || '');
          if (/inscriptions_fermees/.test(m)) throw 'Les inscriptions sont fermées pour le moment.';
          if (/already registered|already been registered|User already/i.test(m)) throw 'Un compte existe déjà avec cette adresse.';
          if (/Password should be/i.test(m)) throw 'Le mot de passe doit faire au moins 8 caractères.';
          if (/rate limit|too many/i.test(m)) throw 'Trop de tentatives. Réessaie dans quelques minutes.';
          throw 'Inscription impossible : ' + m;
        }
        return { email: email, prenom: prenom, nom: nom };
      }, function (e) { throw typeof e === 'string' ? e : 'Connexion au serveur impossible.'; });
    },

    /* ─── Connexion ─── */
    login: function (email, password) {
      email = String(email || '').trim().toLowerCase();
      var client;
      return sb().then(function (c) {
        client = c;
        return c.auth.signInWithPassword({ email: email, password: password });
      }).then(function (r) {
        if (r.error) {
          var m = String(r.error.message || '');
          if (/Invalid login credentials/i.test(m)) {
            noter('refus', email, 'identifiants incorrects');
            throw 'Adresse e-mail ou mot de passe incorrect.';
          }
          if (/Email not confirmed/i.test(m)) throw 'Confirme d\'abord ton adresse e-mail (vérifie tes courriels).';
          if (/rate limit|too many/i.test(m)) throw 'Trop de tentatives. Réessaie dans quelques minutes.';
          throw m;
        }
        return client.rpc('demarrer_session', { p_agent: agent(), p_plateforme: plateforme() });
      }).then(function (r) {
        var d = r && r.data;
        if (!d || !d.ok) {
          var raison = (d && d.statut) || 'anonyme';
          return client.auth.signOut().then(function () {
            throw MOTIFS[raison] || 'Connexion refusée.';
          });
        }
        memoriser(d.profil);
        ecrire(K_SID, d.session);
        return d.profil;
      });
    },

    /* ─── Déconnexion ─── */
    logout: function () {
      var sid = lire(K_SID);
      return sb().then(function (c) {
        return c.rpc('terminer_session', { p_session: sid }).catch(function () {})
          .then(function () { return c.auth.signOut(); });
      }).catch(function () {}).then(function () {
        memoriser(null); effacer(K_SID);
        location.href = LOGIN_URL;
      });
    },

    /* ─── Suppression de son propre compte ─── */
    deleteAccount: function () {
      return sb().then(function (c) {
        /* Un compte ne peut pas se supprimer lui-même côté client sans clé
           secrète : on le désactive, l'administrateur finalise ensuite. */
        return c.from('profils').update({ statut: 'bloque' }).eq('id', (profilLocal() || {}).id);
      }).then(function () { return Auth.logout(); });
    },

    /* ─── Lettre d'information : les choix du membre ───────────
       Six rubriques indépendantes ; on peut n'en cocher aucune. */
    newsletter: {

      /* La liste des rubriques proposées (copie, non modifiable). */
      rubriques: function () {
        return RUBRIQUES.map(function (r) {
          return { id: r.id, titre: r.titre, detail: r.detail };
        });
      },

      /* Les rubriques auxquelles le membre connecté est abonné.
         Renvoie un tableau d'identifiants : ['monde','culture'] */
      mes: function () {
        var moi = profilLocal();
        if (!moi || !moi.id) return Promise.resolve([]);
        return sb().then(function (c) {
          return c.from('newsletter_abonnements')
                  .select('rubrique')
                  .eq('utilisateur', moi.id);
        }).then(function (r) {
          if (r.error) throw new Error(r.error.message);
          return (r.data || []).map(function (x) { return x.rubrique; });
        });
      },

      /* Enregistre la sélection complète : ce qui n'est pas dans
         la liste est désabonné, ce qui est nouveau est ajouté. */
      definir: function (liste) {
        var moi = profilLocal();
        if (!moi || !moi.id) return Promise.reject('Connecte-toi pour choisir tes rubriques.');

        var connues = RUBRIQUES.map(function (r) { return r.id; });
        var voulues = [].concat(liste || []).filter(function (x) {
          return connues.indexOf(x) !== -1;
        });

        var client;
        return sb().then(function (c) {
          client = c;
          return c.from('newsletter_abonnements').select('rubrique').eq('utilisateur', moi.id);
        }).then(function (r) {
          if (r.error) throw new Error(r.error.message);
          var actuelles = (r.data || []).map(function (x) { return x.rubrique; });

          var aRetirer = actuelles.filter(function (x) { return voulues.indexOf(x) === -1; });
          var aAjouter = voulues.filter(function (x) { return actuelles.indexOf(x) === -1; });

          var travaux = [];
          if (aRetirer.length) {
            travaux.push(client.from('newsletter_abonnements')
              .delete().eq('utilisateur', moi.id).in('rubrique', aRetirer));
          }
          if (aAjouter.length) {
            travaux.push(client.from('newsletter_abonnements').insert(
              aAjouter.map(function (x) { return { utilisateur: moi.id, rubrique: x }; })
            ));
          }
          return Promise.all(travaux);
        }).then(function (res) {
          (res || []).forEach(function (r) {
            if (r && r.error) throw new Error(r.error.message);
          });
          return voulues;
        });
      },

      /* Mémorise un choix fait avant d'avoir une session ouverte
         (case cochée sur le formulaire d'inscription). Il sera
         appliqué tout seul à la première connexion réussie. */
      differer: function (liste) {
        try { ecrire(K_NL_ATTENTE, JSON.stringify(liste || [])); } catch (e) {}
      }
    },

    /* Permet aux autres scripts d'attendre que la base soit prête */
    pret: function () { return sb(); },
    client: sb
  };

  window.ECGAuth = Auth;

  /* ══════════════════════════════════════════════════════════════
     API d'administration — utilisée par admin.html
     Tout est en plus verrouillé côté base par les règles RLS :
     un membre qui appellerait ces méthodes n'obtiendrait rien.
     ══════════════════════════════════════════════════════════════ */
  function T(promesse) {
    return promesse.then(function (r) {
      if (r && r.error) throw new Error(traduire(r.error.message));
      return r ? r.data : null;
    });
  }
  function traduire(m) {
    m = String(m || '');
    if (/dernier_admin/.test(m)) return 'Impossible : il doit rester au moins un administrateur.';
    if (/non_autorise/.test(m))  return 'Action réservée aux administrateurs.';
    if (/soi_meme/.test(m))      return 'Tu ne peux pas supprimer ton propre compte ici.';
    if (/introuvable/.test(m))   return 'Compte introuvable.';
    if (/row-level security|violates/.test(m)) return 'Action refusée par la base de données.';
    return m;
  }

  Auth.admin = {
    enLigneMs: EN_LIGNE_MS,

    utilisateurs: function () {
      return sb().then(function (c) {
        return T(c.from('profils').select('*').order('cree_le', { ascending: false }));
      });
    },

    sessions: function () {
      return sb().then(function (c) {
        return T(c.from('sessions').select('*').order('vu', { ascending: false }));
      });
    },

    journal: function (limite) {
      return sb().then(function (c) {
        return T(c.from('journal').select('*').order('t', { ascending: false }).limit(limite || 300));
      });
    },

    config: function () {
      return sb().then(function (c) {
        return T(c.from('reglages').select('*').eq('id', 1).single());
      });
    },

    definirConfig: function (patch) {
      return sb().then(function (c) {
        return T(c.from('reglages').update(patch).eq('id', 1))
          .then(function () { return noter('reglage', (profilLocal() || {}).email, JSON.stringify(patch)); });
      });
    },

    /* statut : 'actif' | 'attente' | 'bloque' */
    definirStatut: function (id, statut, email) {
      return sb().then(function (c) {
        return T(c.from('profils').update({ statut: statut }).eq('id', id)).then(function () {
          if (statut !== 'actif') return T(c.from('sessions').delete().eq('utilisateur', id));
        }).then(function () {
          return noter(statut === 'bloque' ? 'blocage' : 'validation', email,
                       'par ' + (profilLocal() || {}).email);
        });
      });
    },

    /* ─── Verrouillage des rubriques (site entier) ──────────────
       Métadonnées fixes (nom, niveau, groupe d'affichage) : ne
       viennent pas de la base, juste de la liste ci-dessus. */
    listeRubriques: function () {
      return RUBRIQUES_SITE.map(function (r) {
        return { id: r.id, nom: r.nom, niveau: r.niveau, groupe: r.groupe };
      });
    },

    /* État réel (verrouillé ou non) stocké dans Supabase. Renvoie
       toujours un tableau, y compris avant que la table existe :
       une erreur ici ne doit jamais casser tout le tableau de bord. */
    rubriques: function () {
      return sb().then(function (c) {
        return c.from('rubriques_verrouillage').select('*');
      }).then(function (r) {
        return (r && !r.error && r.data) ? r.data : [];
      }).catch(function () { return []; });
    },

    verrouillerRubrique: function (id, verrouille) {
      return sb().then(function (c) {
        return T(c.from('rubriques_verrouillage')
          .upsert({ id: id, verrouille: !!verrouille, maj_le: new Date().toISOString() }))
          .then(function () {
            var meta = RUBRIQUES_SITE.filter(function (r) { return r.id === id; })[0];
            var libelle = meta ? meta.nom + (meta.niveau === 3 ? ' (' + meta.groupe + ')' : '') : id;
            return noter('reglage', (profilLocal() || {}).email, libelle + (verrouille ? ' verrouillée' : ' déverrouillée'));
          });
      });
    },

    definirRole: function (id, role, email) {
      return sb().then(function (c) {
        return T(c.from('profils').update({ role: role }).eq('id', id))
          .then(function () { return noter('role', email, 'devient ' + role); });
      });
    },

    supprimer: function (id) {
      return sb().then(function (c) {
        return T(c.rpc('supprimer_utilisateur', { p_id: id }));
      });
    },

    /* Ferme une session : l'appareil concerné est renvoyé vers la
       page de connexion en moins d'une minute. */
    revoquerSession: function (sid, email) {
      return sb().then(function (c) {
        return T(c.from('sessions').delete().eq('id', sid))
          .then(function () { return noter('revocation', email, 'session fermée par un administrateur'); });
      });
    },

    deconnecterUtilisateur: function (id, email) {
      return sb().then(function (c) {
        return T(c.from('sessions').delete().eq('utilisateur', id).select('id'))
          .then(function (lignes) {
            noter('revocation', email, 'toutes les sessions fermées');
            return (lignes || []).length;
          });
      });
    },

    /* Envoie à l'utilisateur un courriel de réinitialisation.
       (Changer directement le mot de passe d'autrui exigerait la clé
        secrète, qui n'a pas sa place dans une page web.) */
    envoyerReinitialisation: function (email) {
      return sb().then(function (c) {
        return T(c.auth.resetPasswordForEmail(email, { redirectTo: LOGIN_URL }))
          .then(function () { return noter('mot-de-passe', email, 'lien de réinitialisation envoyé'); });
      });
    },

    definirNote: function (id, note) {
      return sb().then(function (c) {
        return T(c.from('profils').update({ note: String(note || '') }).eq('id', id));
      });
    },

    viderJournal: function () {
      return sb().then(function (c) {
        return T(c.from('journal').delete().gt('id', 0));
      });
    },

    /* ─── Courriels ─────────────────────────────────────────────
       Les modèles vivent dans la table « modeles_mail ».
       L'envoi passe par la fonction Edge « envoyer-mail », qui
       seule détient la clé du service d'expédition. */

    modelesMail: function () {
      return sb().then(function (c) {
        return T(c.from('modeles_mail').select('*').order('ordre', { ascending: true }));
      });
    },

    enregistrerModele: function (modele) {
      return sb().then(function (c) {
        return T(c.from('modeles_mail').upsert({
          id: modele.id,
          titre: modele.titre,
          objet: modele.objet,
          corps: modele.corps,
          ordre: modele.ordre || 100,
          maj_le: new Date().toISOString()
        }).select());
      });
    },

    supprimerModele: function (id) {
      return sb().then(function (c) {
        return T(c.from('modeles_mail').delete().eq('id', id));
      });
    },

    /* destinataires : [{ email, prenom, nom, id }]
       Renvoie { envoyes: n, echecs: [{ email, erreur }] } */
    envoyerMail: function (destinataires, objet, corps, modele) {
      return sb().then(function (c) {
        return c.functions.invoke('envoyer-mail', {
          body: {
            destinataires: destinataires,
            objet: objet,
            corps: corps,
            modele: modele || 'libre'
          }
        });
      }).then(function (r) {
        if (r.error) {
          var m = String(r.error.message || r.error);
          if (/Failed to send|not found|404|Failed to fetch/i.test(m)) {
            throw new Error('fonction_absente');
          }
          throw new Error(traduire(m));
        }
        if (r.data && r.data.erreur) throw new Error(r.data.erreur);
        return r.data;
      });
    },

    /* ─── Lettre d'information ──────────────────────────────────
       Le PDF est déposé dans le bucket « newsletters », puis la
       fonction Edge « envoyer-newsletter » se charge du reste :
       elle retrouve elle-même les adresses côté serveur. */

    rubriquesNewsletter: function () { return Auth.newsletter.rubriques(); },

    /* Combien d'abonnés actifs par rubrique : { monde: 12, en: 4, … } */
    effectifsNewsletter: function () {
      return sb().then(function (c) {
        return c.rpc('newsletter_effectifs');
      }).then(function (r) {
        if (r.error) throw new Error(traduire(r.error.message));
        var out = {};
        RUBRIQUES.forEach(function (x) { out[x.id] = 0; });
        (r.data || []).forEach(function (l) { out[l.rubrique] = l.abonnes; });
        return out;
      });
    },

    /* Les destinataires réels d'un envoi (comptes actifs seulement). */
    destinatairesNewsletter: function (rubriques) {
      return sb().then(function (c) {
        return c.rpc('newsletter_destinataires', { p_rubriques: [].concat(rubriques || []) });
      }).then(function (r) {
        if (r.error) throw new Error(traduire(r.error.message));
        return r.data || [];
      });
    },

    /* Dépose le PDF et renvoie { chemin, lien, taille }.
       Le lien signé reste valable un an. */
    /* Dépose un ou plusieurs PDF et renvoie un tableau
       [{ chemin, lien, taille, nom }, …], dans l'ordre de dépôt.
       Les liens signés restent valables un an. */
    televerserNewsletter: function (fichiers) {
      var liste = [].concat(fichiers || []).filter(Boolean);
      if (!liste.length) return Promise.reject(new Error('Aucun fichier choisi.'));

      var intrus = liste.filter(function (f) {
        return !/pdf$/i.test(f.name) && f.type !== 'application/pdf';
      });
      if (intrus.length) {
        return Promise.reject(new Error('Seuls des PDF sont acceptés (« ' + intrus[0].name + ' » n\'en est pas un).'));
      }

      var d = new Date();
      var horodatage = d.toISOString().slice(0, 10) + '-' +
                       String(d.getHours()).padStart(2, '0') +
                       String(d.getMinutes()).padStart(2, '0');

      /* Le numéro d'ordre évite que deux fichiers portant le même
         nom, déposés dans la même minute, s'écrasent l'un l'autre. */
      function cheminDe(fichier, rang) {
        var propre = String(fichier.name).toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9.-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        return d.getFullYear() + '/' + horodatage + '-' + (rang + 1) + '-' + propre;
      }

      var client;
      return sb().then(function (c) {
        client = c;

        /* Un dépôt à la fois : plus lent qu'en parallèle, mais on
           sait exactement quel fichier a posé problème. */
        return liste.reduce(function (chaine, fichier, rang) {
          return chaine.then(function (acquis) {
            var chemin = cheminDe(fichier, rang);
            return client.storage.from('newsletters').upload(chemin, fichier, {
              contentType: 'application/pdf',
              upsert: false
            }).then(function (r) {
              if (r.error) {
                var m = String(r.error.message || '');
                if (/Bucket not found/i.test(m)) throw new Error('Le dossier « newsletters » n\'existe pas encore : lance supabase-newsletter.sql.');
                if (/row-level security|not authorized/i.test(m)) throw new Error('Dépôt refusé : vérifie les règles du bucket « newsletters ».');
                throw new Error('« ' + fichier.name + ' » : ' + m);
              }
              return client.storage.from('newsletters').createSignedUrl(chemin, 60 * 60 * 24 * 365);
            }).then(function (r) {
              if (r.error) throw new Error(r.error.message);
              acquis.push({
                chemin: chemin,
                lien: r.data.signedUrl,
                taille: fichier.size,
                nom: fichier.name
              });
              return acquis;
            });
          });
        }, Promise.resolve([]));
      });
    },

    /* Redonne un lien de téléchargement pour une lettre déjà envoyée. */
    lienNewsletter: function (chemin, jours) {
      return sb().then(function (c) {
        return c.storage.from('newsletters')
                .createSignedUrl(chemin, 60 * 60 * 24 * (jours || 365));
      }).then(function (r) {
        if (r.error) throw new Error(r.error.message);
        return r.data.signedUrl;
      });
    },

    /* L'envoi lui-même.
       envoi = { rubriques, objet, corps, titre, chemin, lien, nomFichier, joindre }
       Renvoie { destinataires, envoyes, echecs: [{ email, erreur }] } */
    envoyerNewsletter: function (envoi) {
      return sb().then(function (c) {
        return c.functions.invoke('envoyer-newsletter', { body: envoi });
      }).then(function (r) {
        if (r.error) {
          var m = String(r.error.message || r.error);
          if (/Failed to send|not found|404|Failed to fetch/i.test(m)) {
            throw new Error('fonction_absente');
          }
          throw new Error(traduire(m));
        }
        if (r.data && r.data.erreur) throw new Error(r.data.erreur);
        return r.data;
      });
    },

    historiqueNewsletters: function (limite) {
      return sb().then(function (c) {
        return T(c.from('newsletters_envoyees').select('*')
                  .order('t', { ascending: false }).limit(limite || 60));
      });
    },

    historiqueMails: function (limite) {
      return sb().then(function (c) {
        return T(c.from('mails_envoyes').select('*').order('t', { ascending: false }).limit(limite || 200));
      });
    },

    exporter: function () {
      return Promise.all([Auth.admin.utilisateurs(), Auth.admin.sessions(), Auth.admin.journal(1000), Auth.admin.config()])
        .then(function (r) {
          return JSON.stringify({
            exporte: new Date().toISOString(),
            utilisateurs: r[0], sessions: r[1], journal: r[2], reglages: r[3]
          }, null, 2);
        });
    }
  };

  /* ══════════════════════════════════════════════════════════════
     Réinitialisation du mot de passe (retour depuis le courriel)
     ══════════════════════════════════════════════════════════════ */
  function estRetourRecuperation() {
    return /type=recovery/.test(location.hash) || /type=recovery/.test(location.search);
  }

  function formulaireNouveauMotDePasse() {
    leverVoile();
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:rgba(13,13,15,.96);' +
      'display:flex;align-items:center;justify-content:center;padding:24px;' +
      'font-family:"DM Sans",system-ui,sans-serif;color:#e8e6e0';
    d.innerHTML =
      '<div style="max-width:380px;width:100%;background:#16161a;border:1px solid #2a2a35;border-radius:16px;padding:32px">' +
      '<h2 style="font-family:\'Playfair Display\',serif;font-size:1.6rem;margin:0 0 8px">Nouveau mot de passe</h2>' +
      '<p style="color:#8a8880;font-size:.84rem;margin:0 0 20px">Choisis un mot de passe d\'au moins 8 caractères.</p>' +
      '<input type="password" id="ecg-np" placeholder="Nouveau mot de passe" ' +
      'style="width:100%;background:#1e1e24;border:1px solid #2a2a35;border-radius:9px;color:#e8e6e0;' +
      'font:400 .9rem/1 inherit;padding:12px 14px;outline:none;margin-bottom:12px">' +
      '<div id="ecg-nm" style="color:#e08a8a;font-size:.8rem;min-height:20px;margin-bottom:8px"></div>' +
      '<button id="ecg-nb" style="width:100%;background:#c8a96e;border:0;border-radius:9px;color:#12120f;' +
      'font:500 .88rem inherit;padding:12px;cursor:pointer">Enregistrer</button></div>';
    document.body.appendChild(d);

    var champ = d.querySelector('#ecg-np'), msg = d.querySelector('#ecg-nm'), btn = d.querySelector('#ecg-nb');
    champ.focus();
    btn.addEventListener('click', function () {
      if (champ.value.length < 8) { msg.textContent = '8 caractères minimum.'; return; }
      btn.disabled = true; btn.textContent = 'Enregistrement…';
      sb().then(function (c) { return c.auth.updateUser({ password: champ.value }); })
        .then(function (r) {
          if (r.error) throw r.error;
          msg.style.color = '#9ecba0';
          msg.textContent = 'Mot de passe mis à jour. Reconnecte-toi.';
          return sb().then(function (c) { return c.auth.signOut(); });
        })
        .then(function () { setTimeout(function () { location.href = LOGIN_URL; }, 1400); })
        .catch(function (e) {
          msg.textContent = String(e.message || e);
          btn.disabled = false; btn.textContent = 'Enregistrer';
        });
    });
    champ.addEventListener('keydown', function (e) { if (e.key === 'Enter') btn.click(); });
  }

  /* ══════════════════════════════════════════════════════════════
     Page de connexion
     ══════════════════════════════════════════════════════════════ */
  if (pageLogin) {
    var afficherRaison = function () {
      var raison = new URLSearchParams(location.search).get('raison');
      if (!raison) return;
      var el = document.getElementById('msg');
      if (el) { el.textContent = raison; el.className = 'msg show err'; }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', afficherRaison);
    else afficherRaison();

    /* Nettoie une éventuelle session résiduelle et gère le retour
       depuis un courriel de réinitialisation. */
    sb().then(function (c) {
      if (estRetourRecuperation()) {
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', formulaireNouveauMotDePasse);
        } else formulaireNouveauMotDePasse();
        return;
      }
      memoriser(null);
    }).catch(function () {
      alerteReseau('Impossible de joindre le serveur de comptes. Vérifie ta connexion.');
    });
    return;
  }

  /* ══════════════════════════════════════════════════════════════
     Autres pages publiques (vitrine) : aucune vérification, aucun
     appel réseau. window.ECGAuth reste disponible pour lire le
     profil éventuellement mis en cache (bouton « continuer »).
     ══════════════════════════════════════════════════════════════ */
  if (pagePublique) return;

  /* ══════════════════════════════════════════════════════════════
     Pages protégées : vérification, puis badge utilisateur
     ══════════════════════════════════════════════════════════════ */
  var client = null;

  /* Mode rapide : on monte tout de suite le badge avec le profil en
     cache ; la vérification ci-dessous tourne en arrière-plan. */
  if (verifRecente) demarrerBadge(profilLocal());

  sb()
    .then(function (c) { client = c; return c.auth.getSession(); })
    .then(function (r) {
      if (!r.data || !r.data.session) {
        versLogin();
        return Promise.reject('redirige');
      }
      return client.rpc('battement', { p_session: lire(K_SID) || null });
    })
    .then(function (r) {
      var d = r && r.data;

      /* Session valide côté base mais aucun identifiant local
         (nouvel onglet, session restaurée) : on en ouvre une. */
      if (d && !d.ok && d.raison === 'session_fermee' && !lire(K_SID)) {
        return client.rpc('demarrer_session', { p_agent: agent(), p_plateforme: plateforme() })
          .then(function (r2) {
            var d2 = r2 && r2.data;
            if (!d2 || !d2.ok) { versLogin(MOTIFS[(d2 && d2.statut) || 'anonyme']); return Promise.reject('redirige'); }
            ecrire(K_SID, d2.session);
            return d2.profil;
          });
      }

      if (!d || !d.ok) {
        var raison = (d && d.raison) || 'anonyme';
        return client.auth.signOut().catch(function () {}).then(function () {
          versLogin(MOTIFS[raison] || 'Accès refusé.');
          return Promise.reject('redirige');
        });
      }
      return d.profil;
    })
    .then(function (profil) {
      memoriser(profil);
      appliquerNewsletterEnAttente();
      if (pageReserveeAdmin && profil.role !== 'admin') { refuserAcces(profil); return; }

      function terminer() {
        leverVoile();
        demarrerBadge(profil);
        battreRegulierement();
        document.dispatchEvent(new CustomEvent('ecg:pret', { detail: profil }));
      }

      /* Cette page peut être concernée à trois niveaux à la fois :
         une ou plusieurs grandes rubriques imbriquées (motifs de
         RUBRIQUES_SITE, ex. une matière ET son année ET sa section),
         et/ou son propre chemin verrouillé individuellement (un
         chapitre ou une leçon précise, verrouillée depuis sa carte).
         Un administrateur passe toujours, mais voit un bandeau de
         rappel si l'une d'elles est fermée. */
      if (rubriquesActuelles.length || cheminActuel) {
        return client.from('rubriques_verrouillage').select('id,verrouille')
          .then(function (r) {
            var etat = {};
            (r && r.data || []).forEach(function (x) { etat[x.id] = !!x.verrouille; });

            /* Le chemin exact de la page est le cas le plus précis
               possible : une leçon verrouillée individuellement ne
               correspond à aucun motif de RUBRIQUES_SITE. */
            if (cheminActuel && etat[cheminActuel]) {
              var fin = { id: cheminActuel, niveau: 4, nom: null, groupe: null,
                          retour: cheminActuel.replace(/[^/]*$/, 'index.html') };
              if (profil.role !== 'admin') { refuserRubrique(fin); return; }
              terminer();
              bandeauRubriqueAdmin(fin);
              return;
            }

            var verrouillees = rubriquesActuelles.filter(function (rb) { return !!etat[rb.id]; });
            if (!verrouillees.length) { terminer(); return; }
            /* La plus précise d'abord (matière > année > section),
               pour un message le plus utile possible. */
            verrouillees.sort(function (a, b) { return b.niveau - a.niveau; });
            var laPlusPrecise = verrouillees[0];
            if (profil.role !== 'admin') { refuserRubrique(laPlusPrecise); return; }
            terminer();
            bandeauRubriqueAdmin(laPlusPrecise);
          })
          .catch(function () { terminer(); /* table absente ou réseau capricieux : on n'empêche pas l'accès */ });
      }

      terminer();
    })
    .catch(function (e) {
      if (e === 'redirige') return;
      /* Panne réseau ou CDN injoignable : on affiche quand même la
         page, avec un avertissement, plutôt qu'un écran noir figé.
         Une page réservée aux administrateurs reste fermée. */
      var p = profilLocal();
      if (pageReserveeAdmin && (!p || p.role !== 'admin')) { refuserAcces(p); return; }
      leverVoile();
      alerteReseau('Serveur de comptes injoignable — affichage hors ligne, certaines fonctions sont indisponibles.');
      if (p) demarrerBadge(p);
    });

  /* ══════════════════════════════════════════════════════════════
     Refus d'accès à une page réservée
     Le contenu reste masqué : on remplace l'affichage par un écran
     d'explication, sans jamais lever le voile.
     ══════════════════════════════════════════════════════════════ */
  /* Écran plein cadre générique : accès admin refusé, ou rubrique
     verrouillée, partagent la même présentation. */
  function ecranRefus(titre, texte, sousTexte, urlRetour, libelleBouton) {
    var css = document.createElement('style');
    css.textContent =
      'html{visibility:hidden!important}' +
      '#ecg-refus,#ecg-refus *{visibility:visible!important}' +
      '#ecg-refus{position:fixed;inset:0;z-index:2147483647;background:#0d0d0f;display:flex;' +
      'align-items:center;justify-content:center;padding:24px;text-align:center;' +
      'font-family:"DM Sans",system-ui,sans-serif;color:#e8e6e0}' +
      '#ecg-refus .boite{max-width:400px}' +
      '#ecg-refus .cle{font-size:2rem;margin-bottom:18px;opacity:.75}' +
      '#ecg-refus h1{font-family:"Playfair Display",Georgia,serif;font-size:1.7rem;font-weight:700;margin:0 0 12px}' +
      '#ecg-refus p{color:#8a8880;font-size:.88rem;line-height:1.6;margin:0 0 8px}' +
      '#ecg-refus .qui{font-family:"DM Mono",monospace;font-size:.72rem;color:#4a4845;margin:14px 0 24px;word-break:break-all}' +
      '#ecg-refus button{background:#c8a96e;border:0;border-radius:9px;color:#12120f;' +
      'font:500 .88rem "DM Sans",system-ui,sans-serif;padding:11px 22px;cursor:pointer}';
    (document.head || document.documentElement).appendChild(css);

    var poser = function () {
      if (document.getElementById('ecg-refus')) return;
      var d = document.createElement('div');
      d.id = 'ecg-refus';
      d.innerHTML =
        '<div class="boite">' +
        '<div class="cle">&#128274;</div>' +
        '<h1>' + titre + '</h1>' +
        '<p>' + texte + '</p>' +
        (sousTexte ? '<div class="qui">' + sousTexte + '</div>' : '') +
        '<button type="button">' + libelleBouton + '</button></div>';
      d.querySelector('button').addEventListener('click', function () { location.replace(urlRetour); });
      document.body.appendChild(d);
    };
    if (document.body) poser();
    else document.addEventListener('DOMContentLoaded', poser);
  }

  function refuserAcces(profil) {
    ecranRefus('Accès réservé', 'Cette page est réservée aux administrateurs du site.',
      (profil && profil.email) || 'session non identifiée', HOME_URL, 'Retour à l\'accueil');
  }

  /* Rubrique verrouillée par un administrateur : le membre est
     arrêté ici, sans jamais voir le contenu. « rub.nom » est absent
     quand c'est une page précise (chapitre, leçon…) qui a été
     verrouillée individuellement depuis sa carte, plutôt qu'une des
     16 grandes rubriques : le message reste alors générique. */
  function refuserRubrique(rub) {
    var urlRetour = BASE + rub.retour;
    if (!rub.nom) {
      ecranRefus('Contenu verrouillé', 'Ce contenu n\'est pas encore disponible.',
        'Un administrateur peut le déverrouiller depuis cette carte.', urlRetour, 'Retour');
      return;
    }
    var suffixe = rub.niveau === 3 ? ' (' + rub.groupe + ')' : '';
    ecranRefus('Rubrique verrouillée',
      'La rubrique « ' + rub.nom + suffixe + ' » n\'est pas encore disponible.',
      'Un administrateur peut la déverrouiller depuis l\'espace admin.', urlRetour, 'Retour');
  }

  /* Bandeau discret pour un administrateur qui consulte une
     rubrique verrouillée : lui seul continue d'y avoir accès, mais
     autant qu'il n'oublie pas qu'elle est fermée aux membres. */
  function bandeauRubriqueAdmin(rub) {
    if (document.getElementById('ecg-verrou-admin')) return;
    var quoi = rub.nom ? ('« ' + rub.nom + (rub.niveau === 3 ? ' (' + rub.groupe + ')' : '') + ' »') : 'Cette page';
    var poser = function () {
      var d = document.createElement('div');
      d.id = 'ecg-verrou-admin';
      d.textContent = '🔒 ' + quoi + ' est verrouillée pour les membres — visible uniquement parce que tu es administrateur.';
      d.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483646;background:#2a2416;color:#c8a96e;' +
        'font:500 .8rem/1.5 "DM Sans",system-ui,sans-serif;padding:10px 18px;text-align:center';
      document.body.appendChild(d);
    };
    if (document.body) poser();
    else document.addEventListener('DOMContentLoaded', poser);
  }

  function battreRegulierement() {
    setInterval(function () {
      if (document.hidden) return;
      client.rpc('battement', { p_session: lire(K_SID) || null }).then(function (r) {
        var d = r && r.data;
        if (!d) return;
        if (!d.ok) {
          var raison = d.raison || 'anonyme';
          client.auth.signOut().catch(function () {}).then(function () {
            versLogin(MOTIFS[raison] || 'Ton accès a été retiré.');
          });
        } else {
          memoriser(d.profil);
        }
      }).catch(function () {});
    }, 45000);
  }

  /* ══════════════════════════════════════════════════════════════
     Badge utilisateur
     ══════════════════════════════════════════════════════════════ */
  function initiales(p) {
    return ((p.prenom || p.email || '?').charAt(0) + (p.nom || '').charAt(0)).toUpperCase();
  }

  /* Le membre a coché des rubriques au moment de s'inscrire : on les
     enregistre dès qu'une session est réellement ouverte. */
  function appliquerNewsletterEnAttente() {
    var brut = lire(K_NL_ATTENTE);
    if (!brut) return;
    var liste;
    try { liste = JSON.parse(brut); } catch (e) { effacer(K_NL_ATTENTE); return; }
    effacer(K_NL_ATTENTE);
    if (!liste || !liste.length) return;
    Auth.newsletter.definir(liste).catch(function () {
      /* Table absente ou réseau capricieux : sans importance,
         le membre pourra choisir depuis « Ma newsletter ». */
    });
  }

  function demarrerBadge(profil) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { monterBadge(profil); });
    } else monterBadge(profil);
  }

  function monterBadge(s) {
    if (!s || document.getElementById('ecg-account-badge')) return;
    var admin = s.role === 'admin';

    var css = document.createElement('style');
    css.textContent =
      '#ecg-account-badge{position:fixed;top:14px;right:18px;z-index:99999;font-family:"DM Sans",system-ui,sans-serif}' +
      '#ecg-account-badge.in-nav{position:relative;top:auto;right:auto;margin-left:18px;flex:0 0 auto}' +
      '#ecg-account-badge *{box-sizing:border-box}' +
      '#ecg-avatar{width:38px;height:38px;border-radius:50%;border:1px solid rgba(200,169,110,.45);' +
      'background:rgba(22,22,26,.92);backdrop-filter:blur(10px);color:#c8a96e;font-size:.78rem;font-weight:600;' +
      'letter-spacing:.04em;display:flex;align-items:center;justify-content:center;cursor:pointer;' +
      'transition:transform .2s,border-color .2s,box-shadow .2s;padding:0;position:relative}' +
      '#ecg-avatar:hover{transform:scale(1.06);border-color:#c8a96e;box-shadow:0 6px 22px rgba(0,0,0,.45)}' +
      '#ecg-avatar:focus-visible{outline:2px solid #c8a96e;outline-offset:3px}' +
      '#ecg-avatar.admin::after{content:"";position:absolute;top:-1px;right:-1px;width:9px;height:9px;' +
      'border-radius:50%;background:#9ecba0;border:2px solid #16161a}' +
      '#ecg-menu{position:absolute;top:48px;right:0;min-width:224px;background:#16161a;' +
      'border:1px solid #2a2a35;border-radius:12px;padding:8px;box-shadow:0 18px 50px rgba(0,0,0,.55);' +
      'opacity:0;visibility:hidden;transform:translateY(-6px);transition:opacity .18s,transform .18s,visibility .18s}' +
      '#ecg-menu.open{opacity:1;visibility:visible;transform:translateY(0)}' +
      '#ecg-menu .who{padding:10px 12px 12px;border-bottom:1px solid #2a2a35;margin-bottom:6px}' +
      '#ecg-menu .who b{display:block;color:#e8e6e0;font-size:.88rem;font-weight:500}' +
      '#ecg-menu .who span{display:block;color:#8a8880;font-size:.72rem;margin-top:3px;word-break:break-all}' +
      '#ecg-menu .who i{display:inline-block;font-style:normal;margin-top:7px;font-family:"DM Mono",monospace;' +
      'font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:#9ecba0;' +
      'background:rgba(158,203,160,.12);padding:2px 8px;border-radius:20px}' +
      '#ecg-menu button{display:block;width:100%;text-align:left;background:none;border:0;color:#e8e6e0;' +
      'font-family:inherit;font-size:.83rem;padding:9px 12px;border-radius:8px;cursor:pointer;transition:background .15s,color .15s}' +
      '#ecg-menu button:hover{background:#1e1e24;color:#c8a96e}' +
      '#ecg-menu button.danger:hover{color:#e08a8a}' +
      '#ecg-menu button.admin{color:#9ecba0}' +
      '#ecg-fav-count{display:none;margin-left:8px;background:rgba(200,169,110,.16);color:#c8a96e;' +
      'font-family:"DM Mono",monospace;font-size:.66rem;padding:2px 7px;border-radius:20px;vertical-align:1px}' +
      '@media (max-width:640px){#ecg-account-badge{top:10px;right:10px}#ecg-avatar{width:34px;height:34px;font-size:.72rem}}' +
      '@media (prefers-reduced-motion:reduce){#ecg-avatar,#ecg-menu{transition:none}}';
    document.head.appendChild(css);

    var wrap = document.createElement('div');
    wrap.id = 'ecg-account-badge';
    wrap.innerHTML =
      '<button id="ecg-avatar" class="' + (admin ? 'admin' : '') + '" aria-haspopup="true" aria-expanded="false" title="Mon compte">' + initiales(s) + '</button>' +
      '<div id="ecg-menu" role="menu">' +
      '<div class="who"><b></b><span></span>' + (admin ? '<i>Administrateur</i>' : '') + '</div>' +
      '<button type="button" id="ecg-favoris" role="menuitem">Mes favoris<span id="ecg-fav-count"></span></button>' +
      '<button type="button" id="ecg-agenda" role="menuitem">Mon agenda</button>' +
      '<button type="button" id="ecg-newsletter" role="menuitem">Ma newsletter</button>' +
      '<button type="button" id="ecg-contact" role="menuitem">Contact</button>' +
      (admin ? '<button type="button" id="ecg-admin" class="admin" role="menuitem">Espace administrateur</button>' : '') +
      (admin ? '<button type="button" id="ecg-idees" class="admin" role="menuitem">Idées d\'articles</button>' : '') +
      '<button type="button" id="ecg-home" role="menuitem">Retour à l\'accueil</button>' +
      '<button type="button" id="ecg-logout" role="menuitem">Se déconnecter</button>' +
      '</div>';

    var navRight = document.querySelector('nav .nav-right');
    var nav = document.querySelector('nav');
    if (navRight) {
      wrap.classList.add('in-nav');
      navRight.appendChild(wrap);
    } else if (nav && getComputedStyle(nav).display.indexOf('flex') === 0) {
      wrap.classList.add('in-nav');
      nav.appendChild(wrap);
    } else {
      document.body.appendChild(wrap);
    }

    wrap.querySelector('.who b').textContent = ((s.prenom || '') + ' ' + (s.nom || '')).trim();
    wrap.querySelector('.who span').textContent = s.email;

    var btn = wrap.querySelector('#ecg-avatar');
    var menu = wrap.querySelector('#ecg-menu');
    function basculer(ouvert) {
      menu.classList.toggle('open', ouvert);
      btn.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    }
    btn.addEventListener('click', function (e) { e.stopPropagation(); basculer(!menu.classList.contains('open')); });
    document.addEventListener('click', function () { basculer(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') basculer(false); });
    menu.addEventListener('click', function (e) { e.stopPropagation(); });

    wrap.querySelector('#ecg-home').addEventListener('click', function () { location.href = HOME_URL; });
    wrap.querySelector('#ecg-favoris').addEventListener('click', function () { location.href = BASE + 'favoris.html'; });
    wrap.querySelector('#ecg-agenda').addEventListener('click', function () { location.href = BASE + 'agenda.html'; });
    wrap.querySelector('#ecg-newsletter').addEventListener('click', function () { location.href = BASE + 'newsletter.html'; });
    wrap.querySelector('#ecg-contact').addEventListener('click', function () { location.href = BASE + 'contact.html'; });
    if (admin) wrap.querySelector('#ecg-admin').addEventListener('click', function () { location.href = ADMIN_URL; });
    if (admin) wrap.querySelector('#ecg-idees').addEventListener('click', function () { location.href = BASE + 'idees-articles.html'; });
    wrap.querySelector('#ecg-logout').addEventListener('click', function () { Auth.logout(); });

    var compteur = wrap.querySelector('#ecg-fav-count');
    function rafraichir() {
      var n = 0;
      try { n = JSON.parse(localStorage.getItem('ecg_favoris:' + s.email) || '[]').length; } catch (e) {}
      compteur.textContent = n ? String(n) : '';
      compteur.style.display = n ? 'inline-block' : 'none';
    }
    rafraichir();
    document.addEventListener('ecg:favoris', rafraichir);
  }
})();
