// Service Worker for Scripture Bible Reader PWA
// Provides offline support with a cache-first strategy for static assets
// and network-first for Bible data (to allow updates when online)

const CACHE_VERSION = 'v2';
const STATIC_CACHE = `scripture-static-${CACHE_VERSION}`;
const BIBLE_CACHE = `scripture-bibles-${CACHE_VERSION}`;

// Static assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/icon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/manifest.json'
];

// Bible files - cached on-demand when user accesses them
const BIBLE_FILES = [
  '/bibles/kjv.json',
  '/bibles/asv.json',
  '/bibles/web.json',
  '/bibles/bg.json',
  '/bibles/ubg.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name.startsWith('scripture-') &&
                     name !== STATIC_CACHE &&
                     name !== BIBLE_CACHE;
            })
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache with appropriate strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip external requests (analytics, fonts, etc.)
  if (url.origin !== location.origin) {
    return;
  }

  // Bible data files - cache-first with network fallback
  if (BIBLE_FILES.some(file => url.pathname === file)) {
    event.respondWith(
      caches.open(BIBLE_CACHE)
        .then((cache) => {
          return cache.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('[SW] Serving Bible from cache:', url.pathname);
                return cachedResponse;
              }

              console.log('[SW] Fetching Bible from network:', url.pathname);
              return fetch(event.request)
                .then((networkResponse) => {
                  // Cache the Bible file for offline use
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                });
            });
        })
    );
    return;
  }

  // Static assets and app shell - cache-first
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful responses for static assets
            if (networkResponse.ok &&
                (url.pathname.endsWith('.js') ||
                 url.pathname.endsWith('.css') ||
                 url.pathname.endsWith('.png') ||
                 url.pathname.endsWith('.svg') ||
                 url.pathname.endsWith('.woff2'))) {
              const responseClone = networkResponse.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Handle messages from the app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Pre-cache specific Bible versions on demand
  if (event.data && event.data.type === 'CACHE_BIBLE') {
    const bibleUrl = event.data.url;
    caches.open(BIBLE_CACHE)
      .then((cache) => {
        fetch(bibleUrl)
          .then((response) => {
            if (response.ok) {
              cache.put(bibleUrl, response);
              console.log('[SW] Pre-cached Bible:', bibleUrl);
            }
          });
      });
  }
});
