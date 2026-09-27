/* ══════════════════════════════════════════════════════════════════
   ECG Prépa — Service worker (mise en cache, mode hors-ligne)

   Ce fichier doit rester à la RACINE du site : un service worker ne
   peut contrôler que les pages situées à son niveau ou en dessous.

   Stratégie : « le réseau d'abord ».
     - Toutes les ressources du site (pages, scripts, styles, images,
       polices) sont demandées au réseau à chaque visite, pour que
       chacun voie TOUJOURS la dernière version publiée, sans avoir à
       forcer le rafraîchissement (Ctrl+Maj+R). Grâce aux en-têtes du
       fichier _headers, le navigateur ne retélécharge un fichier que
       s'il a changé : c'est donc rapide.
     - Chaque réponse est recopiée dans le cache, qui ne sert plus
       qu'en secours : hors connexion, on affiche la dernière copie
       connue, et à défaut la page « Hors ligne ».
     - Exception : une page préchargée au survol d'un lien (voir
       auth.js) il y a moins de PRECHARGE_MS est servie directement
       depuis le cache au clic. Elle vient d'être téléchargée, elle
       est donc à jour, et l'affichage reste instantané.
     - « Socle » précaché à l'installation : de quoi afficher au moins
       la vitrine, la connexion et la page de secours hors-ligne.
     - Tout ce qui n'est pas sur ce domaine (Supabase, Google Fonts,
       CDN esm.sh…) n'est jamais mis en cache ici.
   ══════════════════════════════════════════════════════════════════ */

/* Changer ce numéro vide les caches chez tous les visiteurs (voir
   « activate »). Avec la stratégie « réseau d'abord », ce n'est plus
   nécessaire pour publier une mise à jour du contenu. */
var VERSION = 'v9';
var CACHE_SOCLE   = 'ecg-prepa-socle-'   + VERSION;
var CACHE_PAGES   = 'ecg-prepa-pages-'   + VERSION;
var CACHE_IMAGES  = 'ecg-prepa-images-'  + VERSION;

/* Durée pendant laquelle une page préchargée au survol est jugée
   assez fraîche pour être servie directement au clic. */
var PRECHARGE_MS = 60 * 1000;
var precharges = {};

var PAGE_HORS_LIGNE = 'hors-ligne.html';

/* Ce qui est mis en cache dès l'installation, avant même la première
   visite hors-ligne. Reste volontairement léger. */
var SOCLE = [
  'accueil.html',
  'login.html',
  'auth.js',
  'vendor/supabase.js',
  'fonts/fonts.css',
  PAGE_HORS_LIGNE,
  'site.webmanifest',
  'favicon.svg',
  'favicon.ico',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png'
];

/* ─── Installation : on précharge le socle ────────────────────── */
self.addEventListener('install', function (evenement) {
  evenement.waitUntil(
    caches.open(CACHE_SOCLE).then(function (cache) {
      return cache.addAll(SOCLE);
    }).then(function () {
      /* Passe en contrôle dès l'installation suivante, sans attendre
         la fermeture de tous les onglets ouverts. */
      return self.skipWaiting();
    })
  );
});

/* ─── Activation : ménage des anciens caches ──────────────────── */
self.addEventListener('activate', function (evenement) {
  var caches_valides = [CACHE_SOCLE, CACHE_PAGES, CACHE_IMAGES];
  evenement.waitUntil(
    caches.keys().then(function (noms) {
      return Promise.all(
        noms.filter(function (n) { return caches_valides.indexOf(n) === -1; })
            .map(function (n) { return caches.delete(n); })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

/* ─── Utilitaires ──────────────────────────────────────────────── */
function estImage(url) {
  return /\.(png|jpe?g|gif|webp|svg|ico|woff2?)$/i.test(url.pathname);
}

function memeOrigine(url) {
  return url.origin === self.location.origin;
}

function cleDe(requete) {
  return new Request(requete.url.split('#')[0]);
}

/* Télécharge la ressource et en range une copie dans le cache. */
function telechargerEtRanger(requete, nomCache) {
  return fetch(requete).then(function (reponse) {
    if (reponse && reponse.ok && reponse.type === 'basic' && !reponse.redirected) {
      var copie = reponse.clone();
      caches.open(nomCache).then(function (cache) { cache.put(cleDe(requete), copie); });
    }
    return reponse;
  });
}

/* Réseau d'abord ; en cas d'échec (hors connexion), dernière copie
   connue, puis la page de secours s'il y en a une. */
function reseauDabord(requete, nomCache, secours) {
  return telechargerEtRanger(requete, nomCache).catch(function () {
    return caches.match(cleDe(requete), { ignoreVary: true }).then(function (r) {
      return r || (secours ? secours() : Response.error());
    });
  });
}

/* ─── Interception des requêtes ────────────────────────────────── */
self.addEventListener('fetch', function (evenement) {
  var requete = evenement.request;

  /* On ne touche qu'aux requêtes GET, sur ce domaine. Tout le reste
     (Supabase, requêtes POST…) part directement au réseau. */
  if (requete.method !== 'GET') return;

  var url = new URL(requete.url);
  if (!memeOrigine(url)) return;

  var cle = requete.url.split('#')[0];

  /* Pages HTML. */
  var navigation = requete.mode === 'navigate';
  var html = navigation || (requete.headers.get('accept') || '').indexOf('text/html') !== -1;
  if (html) {
    var secoursHtml = function () { return caches.match(PAGE_HORS_LIGNE); };

    /* Préchargement au survol : on télécharge et on note l'heure. */
    if (!navigation) {
      evenement.respondWith(telechargerEtRanger(requete, CACHE_PAGES).then(function (reponse) {
        if (reponse && reponse.ok) precharges[cle] = Date.now();
        return reponse;
      }));
      return;
    }

    /* Clic sur une page tout juste préchargée : affichage immédiat. */
    var t = precharges[cle];
    if (t && Date.now() - t < PRECHARGE_MS) {
      delete precharges[cle];
      evenement.respondWith(caches.match(cleDe(requete), { ignoreVary: true }).then(function (r) {
        return r || reseauDabord(requete, CACHE_PAGES, secoursHtml);
      }));
      return;
    }

    evenement.respondWith(reseauDabord(requete, CACHE_PAGES, secoursHtml));
    return;
  }

  /* Images, icônes et polices. */
  if (estImage(url)) {
    evenement.respondWith(reseauDabord(requete, CACHE_IMAGES));
    return;
  }

  /* Le reste (auth.js, favoris.js, fonts.css, vendor/…). */
  evenement.respondWith(reseauDabord(requete, CACHE_PAGES));
});
