const CACHE_VERSION = 3;
const STATIC_CACHE = `yabs-static-v${CACHE_VERSION}`;
const PAGES_CACHE = `yabs-pages-v${CACHE_VERSION}`;
const API_CACHE = `yabs-api-v${CACHE_VERSION}`;
const ALL_CACHES = [STATIC_CACHE, PAGES_CACHE, API_CACHE];

const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/dashboard",
  "/services",
  "/consultation",
  "/images/yabs-logo.gif",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const PRECACHE_API_ROUTES = [
  "/api/services",
  "/api/catalog",
];

const STATIC_EXTENSIONS = [
  ".js", ".css", ".woff", ".woff2", ".ttf", ".eot",
  ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".webp",
];

// Install — precache key routes, offline page, and API responses
self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(PRECACHE_URLS);
      }),
      caches.open(API_CACHE).then((cache) => {
        return Promise.all(
          PRECACHE_API_ROUTES.map((url) =>
            fetch(url).then((res) => {
              if (res.ok) cache.put(url, res);
            }).catch(() => {})
          )
        );
      }),
    ]).catch(() => {})
  );
  self.skipWaiting();
});

// Activate — clean up old caches that don't match current version
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith("yabs-") && !ALL_CACHES.includes(name))
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;

  // API calls — network-first, cache in API_CACHE
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(API_CACHE).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({ error: "Offline" }),
              { status: 503, headers: { "Content-Type": "application/json" } }
            );
          });
        })
    );
    return;
  }

  // Static assets — cache-first, store in STATIC_CACHE
  const isStatic = STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext)) ||
    url.pathname.startsWith("/_next/static/");

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, cloned));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML navigation requests — network-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(PAGES_CACHE).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  // All other requests — network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const cloned = response.clone();
          caches.open(PAGES_CACHE).then((cache) => cache.put(request, cloned));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          return caches.match(OFFLINE_URL);
        });
      })
  );
});

// Push notification handler
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "YABS PRO Services", {
      body: data.message || data.body || "You have a new notification",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      tag: data.tag || "yabs-notification",
      data: { url: data.click || data.url || "/" },
    })
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
