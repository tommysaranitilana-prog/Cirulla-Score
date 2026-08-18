const CACHE_NAME = 'cirulla-v4';

const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.PNG'
];

const EXTERNAL_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;800&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        LOCAL_ASSETS.map((asset) =>
          fetch(asset, { cache: 'reload' })
            .then((response) => cache.put(asset, response))
            .catch((err) => console.warn('Impossibile salvare la risorsa locale:', asset, err))
        )
      );
      for (const asset of EXTERNAL_ASSETS) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn('Impossibile salvare la risorsa esterna:', asset);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

function isLocalAsset(request) {
  const url = new URL(request.url);
  return url.origin === self.location.origin;
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Local assets: Network First
  if (isLocalAsset(event.request)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && (response.status === 200 || response.type === 'opaque')) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // External CDN assets: Cache First
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // Accetta sia status 200 che status 0 (opaque da CDN esterne)
        if (response && (response.status === 200 || response.type === 'opaque')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
