const CACHE = 'trip-wizard-v2';
const ASSETS = [
  '/trip-wizard/',
  '/trip-wizard/index.html',
  '/trip-wizard/manifest.json',
  '/trip-wizard/icon-192.svg',
  '/trip-wizard/icon-512.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.anthropic.com') ||
      e.request.url.includes('open-meteo.com') ||
      e.request.url.includes('fonts.googleapis.com')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
