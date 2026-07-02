/*
  Production-ready Service Worker for hediynailart (هنر ناخن هدیه)
  - کش کردن ALL فایل‌های پروژه (CSS, JS, Images, Fonts, HTML)
  - Versioned caches با استراتژی‌های مختلف
  - پشتیبانی کامل از آفلاین
*/

const APP_VERSION = 5;
const PREFIX = `hediynailart-v${APP_VERSION}`;
const CACHE_STATIC = `${PREFIX}-static-v1`;
const CACHE_IMAGES = `${PREFIX}-images-v1`;
const CACHE_FONTS = `${PREFIX}-fonts-v1`;
const CACHE_PAGES = `${PREFIX}-pages-v1`;
const CACHE_WEBDATA = `${PREFIX}-webdata-v1`;

const MAX_ENTRIES = {
  [CACHE_STATIC]: 300,
  [CACHE_IMAGES]: 500,
  [CACHE_FONTS]: 50,
  [CACHE_PAGES]: 100,
  [CACHE_WEBDATA]: 200,
};

const MAX_AGE = {
  static: 30 * 24 * 60 * 60, // 30 days
  images: 30 * 24 * 60 * 60, // 30 days
  pages: 7 * 24 * 60 * 60, // 7 days
  fonts: 365 * 24 * 60 * 60, // 1 year
  webdata: 30 * 24 * 60 * 60, // 30 days
};

// ============================================================
// ALL FILES TO CACHE - Complete list based on tree structure
// ============================================================

const APP_SHELL = [
  // ===== ROOT =====
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/sw.js",
  "/robots.txt",
  "/sitemap.xml",

  // ===== ENGLISH ROOT =====
  "/en/",
  "/en/index.html",
  "/en/manifest.webmanifest",

  // ===== BLOG PAGES (Persian) =====
  "/blog/",
  "/blog/index.html",
  "/blog/rahnamaie-kamel-kaasht-e-nakhan/",
  "/blog/rahnamaie-kamel-kaasht-e-nakhan/index.html",
  "/blog/tafavat-gelish-va-kaasht-e-nakhan/",
  "/blog/tafavat-gelish-va-kaasht-e-nakhan/index.html",
  "/blog/moraghebat-haye-baad-az-kaasht-e-nakhan/",
  "/blog/moraghebat-haye-baad-az-kaasht-e-nakhan/index.html",
  "/blog/tarandehaye-jadid-tarahi-nakhan-2026/",
  "/blog/tarandehaye-jadid-tarahi-nakhan-2026/index.html",

  // ===== BLOG PAGES (English) =====
  "/en/blog/",
  "/en/blog/index.html",
  "/en/blog/complete-guide-to-nail-extension/",
  "/en/blog/complete-guide-to-nail-extension/index.html",
  "/en/blog/difference-between-gelish-and-nail-extension/",
  "/en/blog/difference-between-gelish-and-nail-extension/index.html",
  "/en/blog/post-nail-extension-care/",
  "/en/blog/post-nail-extension-care/index.html",
  "/en/blog/new-nail-design-trends-2026/",
  "/en/blog/new-nail-design-trends-2026/index.html",

  // ===== CSS FILES =====
  "/assets/css/base.css",
  "/assets/css/layout.css",
  "/assets/css/components.css",
  "/assets/css/footer.css",
  "/assets/css/blog.css",
  "/assets/css/post.css",
  "/assets/css/fontawesome/all.min.css",

  // ===== FONTAWESOME WEBFONTS =====
  "/assets/css/webfonts/fa-brands-400.woff2",
  "/assets/css/webfonts/fa-regular-400.woff2",
  "/assets/css/webfonts/fa-solid-900.woff2",
  "/assets/css/webfonts/fa-v4compatibility.woff2",

  // ===== VAZIR FONTS (Persian) =====
  "/assets/fonts/vazir/Vazirmatn-font-face.css",
  "/assets/fonts/vazir/Vazirmatn-Regular.woff2",
  "/assets/fonts/vazir/Vazirmatn-Bold.woff2",
  "/assets/fonts/vazir/Vazirmatn-Medium.woff2",
  "/assets/fonts/vazir/Vazirmatn-Light.woff2",
  "/assets/fonts/vazir/Vazirmatn-SemiBold.woff2",
  "/assets/fonts/vazir/Vazirmatn-ExtraBold.woff2",
  "/assets/fonts/vazir/Vazirmatn-Black.woff2",
  "/assets/fonts/vazir/Vazirmatn-Thin.woff2",
  "/assets/fonts/vazir/Vazirmatn-ExtraLight.woff2",

  // ===== INTER FONTS (English) =====
  "/assets/fonts/inter/index.css",
  "/assets/fonts/inter/files/inter-latin-400-normal.woff2",
  "/assets/fonts/inter/files/inter-latin-ext-400-normal.woff2",
  "/assets/fonts/inter/files/inter-cyrillic-400-normal.woff2",
  "/assets/fonts/inter/files/inter-cyrillic-ext-400-normal.woff2",
  "/assets/fonts/inter/files/inter-greek-400-normal.woff2",
  "/assets/fonts/inter/files/inter-greek-ext-400-normal.woff2",
  "/assets/fonts/inter/files/inter-vietnamese-400-normal.woff2",

  // ===== JAVASCRIPT FILES =====
  "/assets/js/main.js",
  "/assets/js/config.js",
  "/assets/js/dom.js",
  "/assets/js/state.js",
  "/assets/js/ui.js",
  "/assets/js/theme.js",
  "/assets/js/pwa.js",
  "/assets/js/date-utils.js",
  "/assets/js/gallery.js",
  "/assets/js/booking.js",
  "/assets/js/blog.js",
  "/assets/js/post.js",

  // ===== IMAGES - Root Icons =====
  "/assets/images/nail-logo.png",
  "/assets/images/favicon-32.png",
  "/assets/images/favicon-192.png",
  "/assets/images/favicon-512.png",
  "/assets/images/apple-touch-icon-180.png",
  "/assets/images/og-image-fa.jpg",
  "/assets/images/og-image-en.jpg",

  // ===== IMAGES - Blog Icons =====
  "/assets/images/blog/blog-nail-logo.png",
  "/assets/images/blog/favicon-32.png",
  "/assets/images/blog/favicon-192.png",
  "/assets/images/blog/favicon-512.png",
  "/assets/images/blog/apple-touch-icon-180.png",
  "/assets/images/blog/blog-og-image-fa.jpg",
  "/assets/images/blog/blog-og-image-en.jpg",
];

// ============================================================
// GALLERY IMAGES (All 16 nail images)
// ============================================================

const GALLERY_IMAGES = Array.from(
  { length: 16 },
  (_, i) => `/assets/images/gallery/nail-${i + 1}.webp`,
);

// ============================================================
// BLOG GALLERY IMAGES (All 8 blog post images)
// ============================================================

const BLOG_IMAGES = [
  "/assets/images/blog/gallery/complete-guide-to-nail-extension.jpg",
  "/assets/images/blog/gallery/difference-between-gelish-and-nail-extension.jpg",
  "/assets/images/blog/gallery/moraghebat-haye-baad-az-kaasht-e-nakhan.jpg",
  "/assets/images/blog/gallery/new-nail-design-trends-2026.jpg",
  "/assets/images/blog/gallery/post-nail-extension-care.jpg",
  "/assets/images/blog/gallery/rahnamaie-kamel-kaasht-e-nakhan.jpg",
  "/assets/images/blog/gallery/tafavat-gelish-va-kaasht-e-nakhan.jpg",
  "/assets/images/blog/gallery/tarandehaye-jadid-tarahi-nakhan-2026.jpg",
];

// ============================================================
// ALL IMAGES combined
// ============================================================

const ALL_IMAGES = [...GALLERY_IMAGES, ...BLOG_IMAGES];

// ============================================================
// Helper Functions
// ============================================================

async function trimCache(cacheName, maxEntries, maxAgeSeconds) {
  try {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();
    if (requests.length === 0) return;

    while (requests.length > maxEntries) {
      await cache.delete(requests.shift());
    }

    if (!maxAgeSeconds) return;

    const now = Date.now();
    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;

      const dateHeader =
        response.headers.get("sw-fetched-on") || response.headers.get("date");
      if (!dateHeader) continue;

      const fetched = new Date(dateHeader).getTime();
      if ((now - fetched) / 1000 > maxAgeSeconds) {
        await cache.delete(request);
      }
    }
  } catch {
    // Silently fail
  }
}

function addFetchedHeader(response) {
  try {
    const cloned = response.clone();
    const headers = new Headers(cloned.headers);
    headers.set("sw-fetched-on", new Date().toUTCString());

    return cloned.blob().then(
      (body) =>
        new Response(body, {
          status: cloned.status,
          statusText: cloned.statusText,
          headers: headers,
        }),
    );
  } catch {
    return Promise.resolve(response);
  }
}

function isSameOrigin(request) {
  try {
    const url = new URL(request.url);
    return url.origin === self.location.origin;
  } catch {
    return false;
  }
}

// ============================================================
// URL Patterns
// ============================================================

const STATIC_REGEX = /\/assets\/(css|js)\//;
const FONT_REGEX = /\/assets\/fonts\/.*\.(?:woff2|woff|ttf)$/i;
const FONTAWESOME_REGEX = /\/assets\/css\/webfonts\/.*\.(?:woff2|ttf)$/i;
const IMAGE_REGEX = /\/assets\/images\/.*\.(?:webp|jpg|jpeg|png)$/i;
const GALLERY_REGEX = /\/assets\/images\/gallery\/.*\.webp$/i;
const BLOG_IMAGE_REGEX = /\/assets\/images\/blog\/.*\.(?:jpg|jpeg|png)$/i;
const HTML_REGEX = /\.html$/i;

// ============================================================
// Install Event - Cache EVERYTHING
// ============================================================

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    (async () => {
      // Cache all static assets (HTML, CSS, JS, fonts, icons)
      const staticCache = await caches.open(CACHE_STATIC);
      try {
        await staticCache.addAll(
          APP_SHELL.map((url) => new Request(url, { cache: "reload" })),
        );
      } catch (err) {
        console.warn("Some static assets failed to cache:", err);
      }

      // Cache ALL images
      const imageCache = await caches.open(CACHE_IMAGES);
      try {
        await imageCache.addAll(
          ALL_IMAGES.map((url) => new Request(url, { cache: "reload" })),
        );
      } catch (err) {
        console.warn("Some images failed to cache:", err);
      }

      // Cache fonts
      const fontCache = await caches.open(CACHE_FONTS);
      try {
        // Fonts are already in APP_SHELL, but we'll cache any additional ones
        const fontRequests = APP_SHELL.filter(
          (url) => url.match(/\.(woff2|woff|ttf)$/i) || url.includes("/fonts/"),
        );
        await fontCache.addAll(
          fontRequests.map((url) => new Request(url, { cache: "reload" })),
        );
      } catch (err) {
        console.warn("Some fonts failed to cache:", err);
      }
    })(),
  );
});

// ============================================================
// Activate Event
// ============================================================

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Delete old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (!key.startsWith(PREFIX)) {
            return caches.delete(key);
          }
          return Promise.resolve();
        }),
      );

      await self.clients.claim();
    })(),
  );
});

// ============================================================
// Cache First with Stale-While-Revalidate
// ============================================================

async function cacheFirstSWR(request, cacheName, maxEntries, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cached =
    (await cache.match(request)) ||
    (await cache.match(request, { ignoreSearch: true }));

  const networkPromise = fetch(request)
    .then(async (response) => {
      if (response && (response.status === 200 || response.type === "opaque")) {
        try {
          const withHeader = await addFetchedHeader(response);
          await cache.put(request, withHeader.clone());
          trimCache(cacheName, maxEntries, maxAgeSeconds);
        } catch {
          // Ignore
        }
      }
      return response;
    })
    .catch(() => null);

  return cached || (await networkPromise);
}

// ============================================================
// Network First for HTML pages
// ============================================================

async function networkFirst(request) {
  const cache = await caches.open(CACHE_PAGES);

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const withHeader = await addFetchedHeader(response);
      await cache.put(request, withHeader.clone());
      trimCache(CACHE_PAGES, MAX_ENTRIES[CACHE_PAGES], MAX_AGE.pages);
    }
    return response;
  } catch {
    const cached =
      (await cache.match(request)) ||
      (await cache.match(request, { ignoreSearch: true })) ||
      (await caches.match("/index.html"));

    return (
      cached ||
      new Response(
        "<!DOCTYPE html><html><head><title>آفلاین</title></head><body><h1>🔴 آفلاین</h1><p>لطفاً اتصال اینترنت خود را بررسی کنید.</p></body></html>",
        { headers: { "Content-Type": "text/html" } },
      )
    );
  }
}

// ============================================================
// Stale-While-Revalidate for external resources
// ============================================================

async function staleWhileRevalidateExternal(request) {
  const cache = await caches.open(CACHE_IMAGES);
  const cached =
    (await cache.match(request)) ||
    (await cache.match(request, { ignoreSearch: true }));

  fetch(request)
    .then(async (response) => {
      if (response && (response.status === 200 || response.type === "opaque")) {
        try {
          const withHeader = await addFetchedHeader(response);
          await cache.put(request, withHeader.clone());
          trimCache(CACHE_IMAGES, MAX_ENTRIES[CACHE_IMAGES], MAX_AGE.images);
        } catch {
          // Ignore
        }
      }
    })
    .catch(() => {
      // Ignore
    });

  return cached || fetch(request).catch(() => null);
}

// ============================================================
// Fetch Event
// ============================================================

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // ===== NETWORK ONLY =====
  if (
    url.origin.includes("maps.google") ||
    url.origin.includes("google.com/maps") ||
    url.pathname.includes("/maps")
  ) {
    return;
  }

  // ===== NAVIGATION (HTML pages) =====
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // ===== STATIC ASSETS (CSS, JS, manifest, robots, sitemap) =====
  if (
    isSameOrigin(request) &&
    (STATIC_REGEX.test(url.pathname) ||
      url.pathname === "/manifest.webmanifest" ||
      url.pathname === "/robots.txt" ||
      url.pathname === "/sitemap.xml" ||
      url.pathname === "/sw.js")
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

  // ===== ALL IMAGES (gallery, blog, icons, og) =====
  if (isSameOrigin(request) && IMAGE_REGEX.test(url.pathname)) {
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

  // ===== FONTS (Vazir + Inter + FontAwesome) =====
  if (
    isSameOrigin(request) &&
    (FONT_REGEX.test(url.pathname) || FONTAWESOME_REGEX.test(url.pathname))
  ) {
    event.respondWith(
      cacheFirstSWR(
        request,
        CACHE_FONTS,
        MAX_ENTRIES[CACHE_FONTS],
        MAX_AGE.fonts,
      ),
    );
    return;
  }

  // ===== EXTERNAL IMAGES =====
  if (
    !isSameOrigin(request) &&
    (request.destination === "image" ||
      request.url.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i))
  ) {
    event.respondWith(staleWhileRevalidateExternal(request));
    return;
  }

  // ===== FALLBACK =====
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(async () => {
        const cache = await caches.open(CACHE_STATIC);
        return (
          (await cache.match(request)) ||
          (await cache.match(request, { ignoreSearch: true })) ||
          new Response("Resource not found", { status: 404 })
        );
      }),
  );
});

// ============================================================
// Push Notifications
// ============================================================

self.addEventListener("push", (event) => {
  let data = {
    title: "هنر ناخن هدیه",
    body: "پیام جدید",
    url: "/",
    icon: "/assets/images/favicon-192.png",
  };

  try {
    if (event.data) {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    }
  } catch {
    data.body = event.data ? event.data.text() : data.body;
  }

  const options = {
    body: data.body,
    icon: data.icon || "/assets/images/favicon-192.png",
    badge: "/assets/images/favicon-32.png",
    data: { url: data.url || "/" },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
        return null;
      }),
  );
});

// ============================================================
// Message Handling
// ============================================================

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
