/* ══════════════════════════════════════════════════════════════════
   ECG Prépa — Service worker (mise en cache, mode hors-ligne)

   Ce fichier doit rester à la RACINE du site : un service worker ne
   peut contrôler que les pages situées à son niveau ou en dessous.

   Stratégie, volontairement simple :
     - « Socle » précaché à l'installation : de quoi afficher au moins
       la vitrine, la connexion et une page de secours hors-ligne,
       même à la toute première visite sans réseau ensuite.
     - Pages HTML du site : réseau en priorité (toujours le contenu
       à jour si la connexion est bonne), et on garde une copie dans
       le cache à chaque visite ; si le réseau échoue, on ressert la
       dernière copie connue, puis à défaut la page « Hors ligne ».
       Cela permet de relire une fiche déjà consultée sans réseau
       (dans le métro, par exemple), sans jamais bloquer une mise à
       jour quand la connexion est là.
     - Images et icônes du site : cache en priorité (elles changent
       rarement), avec une requête réseau en secours.
     - Tout ce qui n'est pas sur ce domaine (Supabase, Google Fonts,
       CDN esm.sh…) n'est jamais mis en cache ici : on laisse le
       navigateur gérer ça normalement, pour ne jamais servir une
       session ou des données périmées.
   ══════════════════════════════════════════════════════════════════ */

/* Change ce numéro à chaque évolution notable du site : ça force le
   renouvellement du cache chez les visiteurs (voir « activate »). */
var VERSION = 'v1';
var CACHE_SOCLE   = 'ecg-prepa-socle-'   + VERSION;
var CACHE_PAGES   = 'ecg-prepa-pages-'   + VERSION;
var CACHE_IMAGES  = 'ecg-prepa-images-'  + VERSION;

var PAGE_HORS_LIGNE = 'hors-ligne.html';

/* Ce qui est mis en cache dès l'installation, avant même la première
   visite hors-ligne. Reste volontairement léger. */
var SOCLE = [
  'accueil.html',
  'login.html',
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
  return /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(url.pathname);
}

function memeOrigine(url) {
  return url.origin === self.location.origin;
}

/* ─── Interception des requêtes ────────────────────────────────── */
self.addEventListener('fetch', function (evenement) {
  var requete = evenement.request;

  /* On ne touche qu'aux requêtes GET, sur ce domaine. Tout le reste
     (Supabase, polices Google, CDN esm.sh, requêtes POST…) part
     directement au réseau, sans passer par le cache. */
  if (requete.method !== 'GET') return;

  var url = new URL(requete.url);
  if (!memeOrigine(url)) return;

  /* Pages HTML (navigation dans le site) : réseau d'abord, cache
     en secours, page « Hors ligne » en dernier recours. */
  if (requete.mode === 'navigate' || (requete.headers.get('accept') || '').indexOf('text/html') !== -1) {
    evenement.respondWith(
      fetch(requete).then(function (reponse) {
        var copie = reponse.clone();
        caches.open(CACHE_PAGES).then(function (cache) { cache.put(requete, copie); });
        return reponse;
      }).catch(function () {
        return caches.match(requete).then(function (correspondance) {
          return correspondance || caches.match(PAGE_HORS_LIGNE);
        });
      })
    );
    return;
  }

  /* Images et icônes : cache d'abord (elles changent rarement),
     réseau en secours, et on alimente le cache au passage. */
  if (estImage(url)) {
    evenement.respondWith(
      caches.match(requete).then(function (correspondance) {
        if (correspondance) return correspondance;
        return fetch(requete).then(function (reponse) {
          if (reponse && reponse.ok) {
            var copie = reponse.clone();
            caches.open(CACHE_IMAGES).then(function (cache) { cache.put(requete, copie); });
          }
          return reponse;
        }).catch(function () {
          /* Pas d'image de secours générique : on laisse l'échec
             normal (icône cassée) plutôt que d'inventer un visuel. */
          return new Response('', { status: 504, statusText: 'Hors ligne' });
        });
      })
    );
    return;
  }

  /* Tout le reste sur ce domaine (auth.js, favoris.js…) : réseau
     d'abord, avec le cache en secours si hors ligne. */
  evenement.respondWith(
    fetch(requete).catch(function () {
      return caches.match(requete);
    })
  );
});
