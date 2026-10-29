/**
 * PrivacyGuard UX - Service Worker (Offline Support & Asset Caching)
 * Designed for GitHub Pages single-page deployment
 */

const CACHE_NAME = 'privacyguard-ux-v2.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './favicon.svg',
  './favicon.ico',
  './manifest.json',
  './css/styles.css',
  './js/app.js',
  './js/data/hci-ethics-data.js',
  './js/modules/dark-pattern-sim.js',
  './js/modules/privacy-calc.js',
  './js/modules/ai-consent-matrix.js',
  './js/modules/examiner-modal.js',
  './js/modules/audio-feedback.js',
  './js/modules/voice-system.js',
  './js/modules/accessibility-manager.js',
  './js/modules/privacy-inspector-drawer.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('[Service Worker] Non-fatal asset pre-cache notice:', err);
      });
    }).then(() => self.skipWaiting())
  );
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin or GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, then fetch fresh in background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {/* Offline */});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        return networkResponse;
      }).catch(() => {
        // Fallback to index if navigating
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
