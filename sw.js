const CACHE_NAME = "hediynailart-cache-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/css/style.css",
  "./assets/js/script.js",
  "./assets/images/favicon-32.png",
  "./assets/images/favicon-192.png",
  "./assets/images/favicon-512.png",
  "./assets/images/apple-touch-icon-180.png",
  "./assets/images/nail-logo.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function shouldCacheRequest(request) {
  return ["style", "script", "image", "font", "manifest"].includes(
    request.destination,
  );
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached =
    (await cache.match(request)) ||
    (await cache.match(request, { ignoreSearch: true }));

  const networkFetch = fetch(request)
    .then((response) => {
      if (response && (response.ok || response.type === "opaque")) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || (await networkFetch) || Response.error();
}

async function networkFirstPage(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (
      (await cache.match(request)) ||
      (await cache.match("./index.html")) ||
      Response.error()
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
    return;
  }

  if (url.origin !== self.location.origin) {
    if (request.destination === "image" || request.destination === "font") {
      event.respondWith(staleWhileRevalidate(request));
    }
    return;
  }

  if (shouldCacheRequest(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cache = await caches.open(CACHE_NAME);
      return cache.match(request) || cache.match(request, { ignoreSearch: true });
    }),
  );
});
