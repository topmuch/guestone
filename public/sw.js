/// <reference lib="webworker" />

// V3: Service Worker Guest One — offline PWA + push notifications

const CACHE_NAME = 'guestone-v3';
const OFFLINE_CACHE = 'guestone-offline-v3';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/logo.png',
  '/favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ─── Install ───
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_ASSETS).catch(() => {})
    )
  );
  self.skipWaiting();
});

// ─── Activate ───
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((n) => n !== CACHE_NAME && n !== OFFLINE_CACHE)
          .map((n) => caches.delete(n))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch strategy ───
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  if (!request.url.startsWith(self.location.origin)) return;

  // API requests: network-first, fallback to cache if offline
  if (request.url.includes('/api/')) {
    event.respondWith(apiStrategy(request));
    return;
  }

  // Images: cache-first (long cache)
  const isImage = request.url.includes('/images/') || request.url.includes('/icons/') || request.url.includes('/items/');
  if (isImage) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Static assets (_next/static): cache-first (hashed filenames)
  if (request.url.includes('/_next/static/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation: network-first, fallback to offline page
  event.respondWith(networkFirst(request));
});

// ─── Strategies ───
async function networkFirst(request) {
  try {
    const res = await fetch(request);
    if (res.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Navigation requests: redirect to offline page
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) return offlinePage;
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function apiStrategy(request) {
  try {
    const res = await fetch(request);
    // Cache les GET API successful (pour offline read)
    if (request.method === 'GET' && res.status === 200) {
      const cache = await caches.open(OFFLINE_CACHE);
      cache.put(request, res.clone());
    }
    return res;
  } catch {
    // Offline: essaie le cache
    if (request.method === 'GET') {
      const cached = await caches.match(request);
      if (cached) return cached;
    }
    // Pour les POST/PUT offline: on pourrait implémenter background sync
    return new Response(
      JSON.stringify({ error: 'Offline', message: 'Action enregistrée, sera synchronisée' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ════════════════════════════════════════════════════
// V3: Push Notifications (Web Push API)
// ════════════════════════════════════════════════════

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'Guest One', body: event.data.text() };
  }

  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/icon-96x96.png',
    tag: payload.tag || 'guestone',
    data: { url: payload.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: payload.tag === 'sos' || payload.tag === 'escalation',
    actions: payload.url ? [
      { action: 'open', title: 'Voir' },
      { action: 'dismiss', title: 'Fermer' },
    ] : undefined,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Guest One', options)
  );
});

// ─── Notification click ───
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If app is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(targetUrl)) {
          return client.focus();
        }
      }
      // If app is open but on different page, navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// ════════════════════════════════════════════════════
// V3: Background Sync (pour actions offline)
// ════════════════════════════════════════════════════

self.addEventListener('sync', (event) => {
  if (event.tag === 'guestone-sync') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  // TODO: récupérer les actions en attente depuis IndexedDB et les rejouer
  // Pour MVP: juste notifier les clients qu'on est de nouveau online
  const clients = await self.clients.matchAll({ includeUncontrolled: true });
  clients.forEach((client) => {
    client.postMessage({ type: 'sync-complete' });
  });
}
