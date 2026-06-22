// ============================================================
// OWED – Service Worker
// Handles: offline caching, push notifications, monthly reminder
// ============================================================

const CACHE_NAME = 'owed-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// ── Install: cache core assets ──────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ──────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: network first, cache fallback ────────────────────
self.addEventListener('fetch', e => {
  // Only cache GET requests to our own origin
  if (e.request.method !== 'GET') return;
  if (!e.request.url.startsWith(self.location.origin)) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Update cache with fresh response
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// ── Push: show notification ─────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  let payload;
  try { payload = e.data.json(); } catch { payload = { title: 'Owed', body: e.data.text() }; }

  e.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: payload.tag || 'owed-notification',
      data: payload.data || {},
      vibrate: [100, 50, 100],
    })
  );
});

// ── Notification click: open app ────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow('/');
    })
  );
});

// ── Periodic sync: monthly reminder on 1st ─────────────────
// Falls back to checking on app open if periodic sync unavailable
self.addEventListener('periodicsync', e => {
  if (e.tag === 'monthly-reminder') {
    e.waitUntil(checkMonthlyReminder());
  }
});

async function checkMonthlyReminder() {
  const now = new Date();
  if (now.getDate() !== 1) return;

  // Check we haven't already sent one today
  const lastSent = await getStore('lastMonthlyReminder');
  const todayStr = now.toISOString().split('T')[0];
  if (lastSent === todayStr) return;

  await self.registration.showNotification('A new month has begun 😉💸', {
    body: 'New payments are expected',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'monthly-reminder',
    vibrate: [100, 50, 100],
  });

  await setStore('lastMonthlyReminder', todayStr);
}

// ── Simple IndexedDB key-value store for SW state ───────────
function getStore(key) {
  return new Promise((resolve) => {
    const req = indexedDB.open('owed-sw', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('kv');
    req.onsuccess = e => {
      const tx = e.target.result.transaction('kv', 'readonly');
      const r = tx.objectStore('kv').get(key);
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => resolve(null);
    };
    req.onerror = () => resolve(null);
  });
}

function setStore(key, value) {
  return new Promise((resolve) => {
    const req = indexedDB.open('owed-sw', 1);
    req.onupgradeneeded = e => e.target.result.createObjectStore('kv');
    req.onsuccess = e => {
      const tx = e.target.result.transaction('kv', 'readwrite');
      tx.objectStore('kv').put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    };
    req.onerror = () => resolve();
  });
}
