const CACHE_NAME = 'cirulla-v13';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.PNG'
];

// Installazione: scarica e salva i file della nuova versione
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // Attiva subito la nuova versione senza attendere il riavvio
});

// Attivazione: elimina tutte le vecchie cache (es. cirulla-v12, v11...)
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

// Intercettazione richieste
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
