/**
 * GuitarTune Service Worker
 * Provides offline capability via Cache-First strategy for static assets.
 */

const CACHE_NAME = 'guitartune-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Allowed third-party origins and their expected content types.
// Any response from these origins that doesn't match the expected
// content type is fetched but NOT stored in cache.
const THIRD_PARTY_RULES = [
  {
    origin: 'fonts.googleapis.com',
    allowedTypes: ['text/css'],
  },
  {
    origin: 'fonts.gstatic.com',
    allowedTypes: ['font/woff2', 'font/woff', 'font/ttf', 'application/font-woff2', 'application/octet-stream'],
  },
];

function isSafeToCache(url, contentType) {
  const ct = (contentType || '').toLowerCase();
  for (const rule of THIRD_PARTY_RULES) {
    if (url.origin.includes(rule.origin)) {
      return rule.allowedTypes.some((allowed) => ct.startsWith(allowed));
    }
  }
  return false;
}

// ── Install: pre-cache static assets ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: handle same-origin and allowlisted third-party requests ────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  const isSameOrigin = url.origin === self.location.origin;
  const isAllowedThirdParty = THIRD_PARTY_RULES.some((rule) =>
    url.origin.includes(rule.origin)
  );

  // Silently ignore requests outside our scope
  if (!isSameOrigin && !isAllowedThirdParty) return;

  // ── Third-party fonts: Cache-First with content-type validation ──────────────
  if (isAllowedThirdParty) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (!response.ok) return response;
          const contentType = response.headers.get('content-type');
          // Only store if content-type matches what we expect for this origin
          if (isSafeToCache(url, contentType)) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── Navigation requests: Network-First with offline fallback ─────────────────
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match('/index.html').then((cached) => cached || fetch(request))
        )
    );
    return;
  }

  // ── Static assets: Cache-First ────────────────────────────────────────────────
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image' ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
      )
    );
  }
});
