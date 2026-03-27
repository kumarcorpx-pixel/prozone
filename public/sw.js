const CACHE_NAME = "yabs-v1";

const PRECACHE_URLS = [
  "/login",
  "/dashboard",
  "/offline",
];

const STATIC_EXTENSIONS = [
  ".js",
  ".css",
  ".woff",
  ".woff2",
  ".ttf",
  ".eot",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".webp",
];

// Install — precache key routes
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).catch(() => {
      // Precaching may fail if pages aren't available yet; continue anyway
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first for API, cache-first for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and other non-http(s) schemes
  if (!url.protocol.startsWith("http")) return;

  // API calls — network-first strategy
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful API responses
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cloned);
            });
          }
          return response;
        })
        .catch(() => {
          // Fall back to cache if network fails
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({ error: "Offline", message: "No network connection" }),
              { status: 503, headers: { "Content-Type": "application/json" } }
            );
          });
        })
    );
    return;
  }

  // Static assets — cache-first strategy
  const isStatic = STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext)) ||
    url.pathname.startsWith("/_next/static/");

  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, cloned);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages — network-first with offline fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, cloned);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Try the offline page as last resort
          return caches.match("/offline").then((offlinePage) => {
            if (offlinePage) return offlinePage;
            return new Response(
              "<!DOCTYPE html><html><head><title>Offline</title></head><body style='font-family:sans-serif;text-align:center;padding:4rem'><h1>You are offline</h1><p>Please check your internet connection and try again.</p></body></html>",
              { headers: { "Content-Type": "text/html" } }
            );
          });
        });
      })
  );
});
