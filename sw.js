/*
  Production-ready service worker for hediynailart
  - Versioned caches: hediynailart-v4 + resource-specific caches
  - Strategies: Cache First (with SWR), Network First for HTML navigation
  - Cache expiration and size limits implemented
  - Push notification skeleton included
*/

const APP_VERSION = 4;
const PREFIX = `hediynailart-v${APP_VERSION}`;
const CACHE_STATIC = `${PREFIX}-static-v1`;
const CACHE_IMAGES = `${PREFIX}-images-v1`;
const CACHE_FONTS = `${PREFIX}-fonts-v1`;
const CACHE_PAGES = `${PREFIX}-pages-v1`;

const MAX_ENTRIES = {
  [CACHE_STATIC]: 200,
  [CACHE_IMAGES]: 200,
  [CACHE_FONTS]: 20,
  [CACHE_PAGES]: 50,
};

const MAX_AGE = {
  static: 30 * 24 * 60 * 60, // 30 days in seconds
  images: 30 * 24 * 60 * 60,
  pages: 7 * 24 * 60 * 60, // 7 days
  fonts: 365 * 24 * 60 * 60, // 1 year
};

// App shell & critical assets to pre-cache
const APP_SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/assets/images/nail-logo.png",
  "/assets/images/favicon-32.png",
  "/assets/images/favicon-192.png",
  "/assets/images/favicon-512.png",
  "/assets/images/apple-touch-icon-180.png",
  "/assets/css/base.css",
  "/assets/css/layout.css",
  "/assets/css/components.css",
  "/assets/css/footer.css",
  "/assets/js/main.js",
  "/assets/js/config.js",
  "/assets/js/dom.js",
  "/assets/js/ui.js",
  "/assets/js/state.js",
  "/assets/js/theme.js",
];

// Helper: open cache and trim entries by count and max age
async function trimCache(cacheName, maxEntries, maxAgeSeconds) {
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    if (requests.length === 0) return;

    // Trim by number of entries
    while (requests.length > maxEntries) {
      await cache.delete(requests.shift());
    }

    if (!maxAgeSeconds) return;

    const now = Date.now();
    for (const request of requests) {
      const resp = await cache.match(request);
      if (!resp) continue;
      const dateHeader =
        resp.headers.get("sw-fetched-on") || resp.headers.get("date");
      if (!dateHeader) continue;
      const fetched = new Date(dateHeader).getTime();
      if ((now - fetched) / 1000 > maxAgeSeconds) {
        await cache.delete(request);
      }
    }
  } catch (err) {
    console.warn("trimCache error", cacheName, err);
  }
}

// Append a header to response indicating fetch time (so we can expire by date)
function addFetchedHeader(response) {
  try {
    const cloned = response.clone();
    const headers = new Headers(cloned.headers);
    headers.set("sw-fetched-on", new Date().toUTCString());
    return cloned.blob().then(
      (bodyBlob) =>
        new Response(bodyBlob, {
          status: cloned.status,
          statusText: cloned.statusText,
          headers,
        }),
    );
  } catch (err) {
    return Promise.resolve(response);
  }
}

// Utility: is same-origin
function isSameOrigin(request) {
  try {
    const url = new URL(request.url);
    return url.origin === self.location.origin;
  } catch (e) {
    return false;
  }
}

// Patterns
const STATIC_REGEX = /\/assets\/(css|js)\//;
const FONT_REGEX = /\/assets\/fonts\/.*\.(?:woff2|woff|ttf)$/i;
const IMAGE_GALLERY_REGEX = /\/assets\/images\/gallery\/.*\.webp$/i;
const IMAGE_BLOG_REGEX =
  /\/assets\/images\/blog\/gallery\/.*\.(?:jpg|jpeg|png)$/i;
const FAVICON_REGEX = /favicon-(?:32|192|512)\.png$/i;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_STATIC);
      try {
        await cache.addAll(
          APP_SHELL.map((p) => new Request(p, { cache: "reload" })),
        );
      } catch (err) {
        console.warn(
          "Some app shell resources failed to cache on install",
          err,
        );
      }
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete old caches that do not match current prefix
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (!key.startsWith(PREFIX)) {
            return caches.delete(key);
          }
          return Promise.resolve(true);
        }),
      );
      await self.clients.claim();
    })(),
  );
});

// Cache First with Stale-While-Revalidate helper
async function cacheFirstSWR(request, cacheName, maxEntries, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const ignoreSearch = { ignoreSearch: true };
  const cached =
    (await cache.match(request)) || (await cache.match(request, ignoreSearch));

  const network = fetch(request)
    .then(async (res) => {
      // only cache successful responses (200) or opaque ones
      if (res && (res.status === 200 || res.type === "opaque")) {
        try {
          const resWithHeader = await addFetchedHeader(res);
          await cache.put(request, resWithHeader.clone());
          trimCache(cacheName, maxEntries, maxAgeSeconds);
        } catch (err) {
          console.warn("Failed to cache network response", err);
        }
      }
      return res;
    })
    .catch((err) => {
      // network failed
      return null;
    });

  // return cached immediately if exists, otherwise await network
  return cached || (await network);
}

// Cache First for fonts (aggressive caching)
async function fontCache(request) {
  const cache = await caches.open(CACHE_FONTS);
  const cached =
    (await cache.match(request)) ||
    (await cache.match(request, { ignoreSearch: true }));
  if (cached) return cached;
  try {
    const res = await fetch(request);
    if (res && (res.status === 200 || res.type === "opaque")) {
      const resWithHeader = await addFetchedHeader(res);
      await cache.put(request, resWithHeader.clone());
      trimCache(CACHE_FONTS, MAX_ENTRIES[CACHE_FONTS], MAX_AGE.fonts);
    }
    return res;
  } catch (err) {
    return null;
  }
}

// Network First for navigation (pages) with fallback to cache then index.html
async function networkFirst(request) {
  const cache = await caches.open(CACHE_PAGES);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const respWithHeader = await addFetchedHeader(response);
      await cache.put(request, respWithHeader.clone());
      trimCache(CACHE_PAGES, MAX_ENTRIES[CACHE_PAGES], MAX_AGE.pages);
    }
    return response;
  } catch (err) {
    const cached =
      (await cache.match(request)) || (await caches.match("/index.html"));
    return (
      cached ||
      new Response(
        "<h1>Offline</h1><p>The app is offline and no cached page is available.</p>",
        { headers: { "Content-Type": "text/html" } },
      )
    );
  }
}

// Stale-While-Revalidate for cross-origin images / external resources
async function staleWhileRevalidateExternal(request) {
  const cache = await caches.open(CACHE_IMAGES);
  const cached =
    (await cache.match(request)) ||
    (await cache.match(request, { ignoreSearch: true }));
  fetch(request)
    .then(async (res) => {
      if (res && (res.status === 200 || res.type === "opaque")) {
        try {
          const resWithHeader = await addFetchedHeader(res);
          await cache.put(request, resWithHeader.clone());
          trimCache(CACHE_IMAGES, MAX_ENTRIES[CACHE_IMAGES], MAX_AGE.images);
        } catch (err) {
          // ignore cache errors
        }
      }
    })
    .catch(() => {
      /* ignore */
    });
  return cached || fetch(request).catch(() => null);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Network only for Google Maps embeds or iframes
  if (url.origin.includes("maps.google") || url.pathname.includes("/maps")) {
    return; // let network handle it
  }

  // Navigation requests (HTML pages)
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // Same-origin static assets: CSS, JS, manifest, icons
  if (
    isSameOrigin(request) &&
    (STATIC_REGEX.test(url.pathname) ||
      FAVICON_REGEX.test(url.pathname) ||
      url.pathname === "/manifest.webmanifest")
  ) {
    event.respondWith(
      cacheFirstSWR(
        request,
        CACHE_STATIC,
        MAX_ENTRIES[CACHE_STATIC],
        MAX_AGE.static,
      ),
    );
    return;
  }

  // Images: gallery and blog images
  if (
    isSameOrigin(request) &&
    (IMAGE_GALLERY_REGEX.test(url.pathname) ||
      IMAGE_BLOG_REGEX.test(url.pathname))
  ) {
    event.respondWith(
      cacheFirstSWR(
        request,
        CACHE_IMAGES,
        MAX_ENTRIES[CACHE_IMAGES],
        MAX_AGE.images,
      ),
    );
    return;
  }

  // Fonts
  if (isSameOrigin(request) && FONT_REGEX.test(url.pathname)) {
    event.respondWith(fontCache(request));
    return;
  }

  // External images (og images, social images) - SWR in images cache
  if (
    !isSameOrigin(request) &&
    (request.destination === "image" ||
      request.url.match(/\.(png|jpg|jpeg|webp)$/i))
  ) {
    event.respondWith(staleWhileRevalidateExternal(request));
    return;
  }

  // Fallback: try network first, then cache
  event.respondWith(
    fetch(request)
      .then((res) => {
        return res;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_STATIC);
        return (
          cache.match(request) ||
          cache.match(request, { ignoreSearch: true }) ||
          Promise.reject("no-match")
        );
      }),
  );
});

// Basic push notification handling skeleton
self.addEventListener("push", (event) => {
  let data = { title: "hediynailart", body: "New message", url: "/" };
  try {
    if (event.data) data = event.data.json();
  } catch (err) {
    data.body = event.data ? event.data.text() : data.body;
  }

  const options = {
    body: data.body,
    icon: "/assets/images/favicon-192.png",
    badge: "/assets/images/favicon-32.png",
    data: { url: data.url },
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    event.notification.data && event.notification.data.url
      ? event.notification.data.url
      : "/";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
      return null;
    }),
  );
});

/*
  Note: Service workers cannot compress responses themselves. Compression should be handled by the server.
  This sw includes cache expiration via headers and trimming to limit growth.
*/
