const CACHE_NAME = "seccion-pwa-static-v3";
const DYNAMIC_CACHE = "seccion-pwa-dynamic-v3";

const STATIC_ASSETS = [
  "/",
  "/offline.html",
  "/manifest.webmanifest",
  "/images/seccion-logo-icon.png",
  "/images/s-logo-clean.png",
];

// Service Worker Installation
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("PWA SW: Soft fail pre-caching static assets", err);
      });
    })
  );
  self.skipWaiting();
});

// Service Worker Activation & Cache Cleanup
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch Interceptor Strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Bypass non-GET requests or browser extension requests
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // API Requests: Network First
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: "Offline mode. Network unavailable." }),
          { headers: { "Content-Type": "application/json" }, status: 503 }
        );
      })
    );
    return;
  }

  // Image & Static Assets: Stale-While-Revalidate / Cache-First
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    url.pathname.startsWith("/images/")
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // HTML Page Navigation: Stale-While-Revalidate with Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;
          return caches.match("/offline.html");
        })
    );
    return;
  }
});

// Web Push Notification Handler (Android & iOS Web Push)
self.addEventListener("push", (event) => {
  let payload = {
    title: "SECCION Notification",
    body: "You have a new activity update on SECCION.",
    icon: "/images/seccion-logo-icon.png",
    badge: "/images/seccion-logo-icon.png",
    url: "/feed",
  };

  if (event.data) {
    try {
      payload = { ...payload, ...event.data.json() };
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || "/images/seccion-logo-icon.png",
    badge: payload.badge || "/images/seccion-logo-icon.png",
    data: { url: payload.url || "/feed" },
    vibrate: [100, 50, 100],
    actions: [
      { action: "open", title: "View" },
      { action: "close", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/feed";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
