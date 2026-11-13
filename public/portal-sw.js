// Service worker del portal (solo /portal). Guarda la app para que abra rápido
// y muestra una página amable si no hay internet. Nunca guarda datos de la API.
const VERSION = 'portal-v1';
const OFFLINE = '/portal-sin-internet.html';

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll([OFFLINE, '/portal-manifest.webmanifest', '/icon-192.png'])));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('portal-') && k !== VERSION).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  // Pantallas del portal: siempre la versión más nueva; si no hay internet, la página amable.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await caches.match(OFFLINE)) ?? Response.error()));
    return;
  }
  // Archivos con hash (/assets/*): se guardan la primera vez para abrir más rápido.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ??
          fetch(request).then((res) => {
            if (res.ok) caches.open(VERSION).then((c) => c.put(request, res.clone()));
            return res;
          }),
      ),
    );
  }
});
