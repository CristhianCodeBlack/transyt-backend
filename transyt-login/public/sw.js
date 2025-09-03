const CACHE_NAME = 'transyt-v3-fixed';
const STATIC_CACHE = 'transyt-static-v3';

// Solo cachear recursos estáticos críticos
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// No cachear APIs para evitar datos obsoletos
const NO_CACHE_URLS = [
  '/api/',
  'transyt-backend.onrender.com',
  'localhost:8080',
  '/auth/',
  '/login',
  '/admin',
  '/empleado',
  '/instructor'
];

self.addEventListener('install', (event) => {
  console.log('SW: Installing');
  self.skipWaiting(); // Activar inmediatamente
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Cache opened');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.log('SW: Cache failed', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
    // No cachear APIs ni requests externos - pasar directamente
  if (NO_CACHE_URLS.some(pattern => url.includes(pattern))) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Solo cachear recursos estáticos (JS, CSS, imágenes)
  if (url.includes('.js') || url.includes('.css') || url.includes('.png') || 
      url.includes('.jpg') || url.includes('.svg') || url.includes('.ico')) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((fetchResponse) => {
              if (fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => cache.put(event.request, responseClone))
                  .catch(() => {});
              }
              return fetchResponse;
            })
            .catch(() => caches.match('/'));
        })
    );
  } else {
    // Para todo lo demás (HTML, rutas), usar network-first
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/') || caches.match('/index.html'))
    );
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});