const CACHE_NAME = 'cirulla-v14';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.PNG',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest'
];

// Installazione: scarica e salva i file della nuova versione
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => {
            console.log('Impossibile mettere in cache:', url, err);
          })
        )
      );
    })
  );
  self.skipWaiting(); // Attiva subito la nuova versione senza attendere il riavvio
});

// Attivazione: elimina tutte le vecchie cache (es. cirulla-v13, v12...)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Cancellazione vecchia cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Prende il controllo immediato della pagina
});

// Intercettazione richieste: cache-first, con fallback alla rete
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          // Aggiorna la cache in background con le nuove risorse scaricate
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
          return networkResponse;
        }).catch(() => cachedResponse)
      );
    })
  );
});
