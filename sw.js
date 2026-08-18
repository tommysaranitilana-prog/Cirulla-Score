const CACHE_NAME = 'cirulla-v9'; // Aggiornato per forzare l'aggiornamento dell'HTML

// File locali fondamentali
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.PNG'
];

// Librerie esterne
const EXTERNAL_ASSETS = [
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest',
  'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;600;700;800&display=swap'
];

// Installazione e salvataggio file in memoria
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(LOCAL_ASSETS);
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

// Attivazione e cancellazione vecchie cache (v3, v2, ecc.)
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

// Strategia di caricamento Offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        if (response.status === 200) {
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
