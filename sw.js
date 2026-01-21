const CACHE_NAME = 'brian-merab-love-v1';
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'https://files.catbox.moe/08b4pp.jpg',
  'https://files.catbox.moe/7s5hz5.mp3',
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  // You can add more URLs later if you want (css, other images, etc.)
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Skip waiting so the new service worker activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  // Take control of the page immediately
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit — return the cached response
        if (response) {
          return response;
        }

        // Clone the request because it's a stream that can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response again because we need to consume it twice:
            // once to put in cache, once to return to browser
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(() => {
          // Optional: fallback for offline when no cache match
          // You could return a custom offline page here if you want
        });
      })
  );
});
