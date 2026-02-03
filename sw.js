const CACHE_NAME = 'dsce-clubs-v2';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './events.html',
  './past-events.html',
  './club.html',
  './faq.html',
  './registration.html',
  './my-hub.html',
  './clubs.json',
  './style.css',
  './app.js',
  './scroll.js',
  './darkmode.js',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/brightness.svg',
  './assets/moon.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Network First strategy for HTML pages (navigation requests)
  if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Optional: Cache the latest version of the page
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );
  } else {
    // Cache First strategy for other assets
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
