/* ══════════════════════════════════════════════════════════════════
   ECG Prépa — Service worker (mise en cache, mode hors-ligne)

   Ce fichier doit rester à la RACINE du site : un service worker ne
   peut contrôler que les pages situées à son niveau ou en dessous.

   Stratégie, volontairement simple :
     - « Socle » précaché à l'installation : de quoi afficher au moins
       la vitrine, la connexion et une page de secours hors-ligne,
       même à la toute première visite sans réseau ensuite.
     - Pages HTML, scripts, polices du site : « stale-while-revalidate ».
       Si la page est déjà en cache (visitée ou préchargée au survol
       d'un lien), elle s'affiche immédiatement, et une copie fraîche
       est téléchargée en arrière-plan pour la fois suivante. Sinon,
       réseau, puis page « Hors ligne » en dernier recours.
       Conséquence : après une mise à jour du site, un visiteur peut
       voir l'ancienne version d'une page UNE fois. Pour forcer tout
       le monde d'un coup, change VERSION ci-dessous.
     - Images et icônes du site : cache en priorité (elles changent
       rarement), avec une requête réseau en secours.
     - Tout ce qui n'est pas sur ce domaine (Supabase, Google Fonts,
       CDN esm.sh…) n'est jamais mis en cache ici : on laisse le
       navigateur gérer ça normalement, pour ne jamais servir une
       session ou des données périmées.
   ══════════════════════════════════════════════════════════════════ */

/* Change ce numéro à chaque évolution notable du site : ça force le
   renouvellement du cache chez les visiteurs (voir « activate »). */
var VERSION = 'v3';
var CACHE_SOCLE   = 'ecg-prepa-socle-'   + VERSION;
var CACHE_PAGES   = 'ecg-prepa-pages-'   + VERSION;
var CACHE_IMAGES  = 'ecg-prepa-images-'  + VERSION;

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
  return /\.(png|jpe?g|gif|webp|svg|ico)$/i.test(url.pathname);
}

function memeOrigine(url) {
  return url.origin === self.location.origin;
}

/* ─── Interception des requêtes ────────────────────────────────── */

/* Sert la copie en cache tout de suite si elle existe, et la met à
   jour en arrière-plan. Sans copie : réseau, puis secours. */
function staleWhileRevalidate(evenement, nomCache, secours) {
  var requete = evenement.request;
  var cleCache = new Request(requete.url.split('#')[0]);
  return caches.open(nomCache).then(function (cache) {
    return cache.match(cleCache, { ignoreVary: true, ignoreSearch: false }).then(function (enCache) {
      var reseau = fetch(requete).then(function (reponse) {
        if (reponse && reponse.ok && reponse.type === 'basic' && !reponse.redirected) {
          cache.put(cleCache, reponse.clone());
        }
        return reponse;
      });
      if (enCache) {
        evenement.waitUntil(reseau.catch(function () {}));
        return enCache;
      }
      return reseau.catch(function () {
        return caches.match(cleCache, { ignoreVary: true }).then(function (r) {
          return r || (secours ? secours() : Response.error());
        });
      });
    });
  });
}

self.addEventListener('fetch', function (evenement) {
  var requete = evenement.request;

  /* On ne touche qu'aux requêtes GET, sur ce domaine. Tout le reste
     (Supabase, requêtes POST…) part directement au réseau. */
  if (requete.method !== 'GET') return;

  var url = new URL(requete.url);
  if (!memeOrigine(url)) return;

  /* Pages HTML (navigation ou préchargement au survol). */
  var html = requete.mode === 'navigate' ||
    (requete.headers.get('accept') || '').indexOf('text/html') !== -1;
  if (html) {
    evenement.respondWith(staleWhileRevalidate(evenement, CACHE_PAGES, function () {
      return caches.match(PAGE_HORS_LIGNE);
    }));
    return;
  }

  /* Images, icônes et polices : cache d'abord (elles changent
     rarement), réseau en secours. */
  if (estImage(url) || /\.woff2?$/i.test(url.pathname)) {
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
          return new Response('', { status: 504, statusText: 'Hors ligne' });
        });
      })
    );
    return;
  }

  /* Le reste (auth.js, favoris.js, fonts.css, vendor/…) :
     même stratégie que les pages. */
  evenement.respondWith(staleWhileRevalidate(evenement, CACHE_PAGES));
});
