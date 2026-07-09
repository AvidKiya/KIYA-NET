const CACHE_NAME = "kiya-net-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/offline",
  "/login",
  "/services",
  "/order",
  "/wallet",
  "/profile",
  "/about",
  "/contact",
];

const API_CACHE_NAME = "kiya-net-api-v1";
const API_CACHE_MAX_AGE = 60 * 60 * 1000; // 1 hour

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME && key !== API_CACHE_NAME) {
              return caches.delete(key);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension
  if (request.method !== "GET" || url.protocol === "chrome-extension:") {
    return;
  }

  // API requests: stale-while-revalidate with time limit
  if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/auth")) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          const date = cached.headers.get("sw-cached-at");
          if (date && Date.now() - Number(date) < API_CACHE_MAX_AGE) {
            return cached;
          }
        }
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cloned = response.clone();
            const headers = new Headers(cloned.headers);
            headers.set("sw-cached-at", String(Date.now()));
            const modified = new Response(cloned.body, { status: cloned.status, statusText: cloned.statusText, headers });
            cache.put(request, modified);
          }
          return response;
        } catch (err) {
          return cached || new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "Content-Type": "application/json" } });
        }
      })
    );
    return;
  }

  // Static assets: cache-first, fallback to offline page
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (response.ok && response.type === "basic") {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          if (request.destination === "document") {
            return caches.match("/offline");
          }
          return new Response("", { status: 204 });
        });
    })
  );
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "کیا نت", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: data.url || "/",
      dir: "rtl",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow(event.notification.data || "/"));
});
