// ─── Service Worker — Soirée Jeux ────────────────────────────────
// Stratégie : Cache-first pour les assets, Network-first pour index.html
// Mise à jour automatique : le SW détecte la nouvelle version et recharge

const CACHE_NAME = 'soiree-jeux-v1';
const CACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500&display=swap',
];

// ── Install : mise en cache initiale ──────────────────────────────
self.addEventListener('install', event => {
  // skipWaiting force l'activation immédiate sans attendre que
  // les onglets précédents soient fermés
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CACHE_ASSETS))
  );
});

// ── Activate : nettoyage des anciens caches ───────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => {
      // Prend le contrôle de tous les clients immédiatement
      return self.clients.claim();
    })
  );
});

// ── Fetch : Network-first pour HTML, Cache-first pour le reste ────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Ignorer les requêtes non-GET et cross-origin hors fonts
  if (event.request.method !== 'GET') return;

  // Stratégie Network-first pour index.html (détecte les mises à jour)
  if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first pour tout le reste
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// ── Message : rechargement forcé demandé par le client ───────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
