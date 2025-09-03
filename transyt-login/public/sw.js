// TRANSYT Service Worker - Optimizado para conductores
const VERSION = 'v4.0.0';
const STATIC_CACHE = `transyt-static-${VERSION}`;
const RUNTIME_CACHE = `transyt-runtime-${VERSION}`;
const OFFLINE_CACHE = `transyt-offline-${VERSION}`;

// Recursos críticos para funcionamiento offline
const CRITICAL_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// APIs que NUNCA deben cachearse
const API_PATTERNS = [
  '/api/',
  'transyt-backend.onrender.com/api',
  '/auth/',
  '/login'
];

// Recursos que se pueden cachear para offline
const CACHEABLE_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.svg', '.ico', '.woff2'];

// === INSTALACIÓN ===
self.addEventListener('install', (event) => {
  console.log(`🔧 TRANSYT SW ${VERSION} installing...`);
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(CRITICAL_ASSETS))
      .then(() => console.log('✅ Critical assets cached'))
      .catch(err => console.log('❌ Cache failed:', err))
  );
});

// === ACTIVACIÓN ===
self.addEventListener('activate', (event) => {
  console.log(`🚀 TRANSYT SW ${VERSION} activating...`);
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguos
      caches.keys().then(cacheNames => 
        Promise.all(
          cacheNames
            .filter(name => name.startsWith('transyt-') && !name.includes(VERSION))
            .map(name => caches.delete(name))
        )
      ),
      // Tomar control inmediatamente
      self.clients.claim()
    ]).then(() => console.log('✅ SW activated and controlling'))
  );
});

// === INTERCEPTOR DE REQUESTS ===
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 🚫 NUNCA cachear APIs - pasar directo al servidor
  if (API_PATTERNS.some(pattern => request.url.includes(pattern))) {
    return; // Dejar que pase normalmente
  }
  
  // 📱 Recursos estáticos - Cache First (para offline)
  if (CACHEABLE_EXTENSIONS.some(ext => url.pathname.endsWith(ext))) {
    event.respondWith(cacheFirst(request));
    return;
  }
  
  // 🌐 Navegación (HTML) - Network First con fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }
});

// === ESTRATEGIAS DE CACHE ===

// Cache First - Para recursos estáticos
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    if (cached) return cached;
    
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('Cache first failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First - Para navegación
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    // Fallback para SPA routing
    const cached = await caches.match('/') || await caches.match('/index.html');
    return cached || new Response('App offline', { 
      status: 503,
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// === NOTIFICACIONES PUSH (para conductores) ===
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body || 'Nueva notificación de TRANSYT',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'transyt-notification',
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'Abrir App' },
      { action: 'dismiss', title: 'Cerrar' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'TRANSYT', options)
  );
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log(`🚛 TRANSYT Service Worker ${VERSION} loaded successfully!`);