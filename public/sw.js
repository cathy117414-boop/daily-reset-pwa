// Build tooling replaces both tokens in the deployed copy.
const BUILD_ID = "__LUMINA_BUILD_ID__";
const BUILD_ASSETS = /* LUMINA_PRECACHE */ [];
const SCOPE_URL = self.registration.scope;
const scoped = (path = "") => new URL(path, SCOPE_URL).toString();
const CACHE_PREFIX = `lumina-${encodeURIComponent(new URL(SCOPE_URL).pathname)}-`;
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_ID}`;
const HTML_URL = scoped();
const CORE_ASSETS = [...new Set(["", "manifest.json", "app-icon.svg", "app-icon-192.png", "app-icon-512.png", ...BUILD_ASSETS])];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      await cache.addAll(CORE_ASSETS.map(path => new Request(scoped(path), { cache: "reload" })));
      // Switch only when the complete new offline shell has been downloaded.
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(CACHE_NAME);
      throw error;
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE_NAME && (
      key.startsWith(CACHE_PREFIX) || /^daily-reset-v\d/.test(key)
    )).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
  if (event.data?.type === "GET_VERSION") event.ports[0]?.postMessage({ buildId: BUILD_ID });
});

async function fetchFresh(request) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(request, { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`Network response ${response.status}`);
    return response;
  } finally { clearTimeout(timer); }
}

async function networkFirst(request, cacheKey, isDocument = false) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetchFresh(request);
    if (!isDocument || response.headers.get("content-type")?.includes("text/html")) {
      await cache.put(cacheKey, response.clone());
    }
    return response;
  } catch {
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
    // Never return HTML as a script, stylesheet, manifest, or image.
    return new Response(isDocument ? "Lumina 暂时离线，请联网后重试。" : "Offline", {
      status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  const scope = new URL(SCOPE_URL);
  if (request.method !== "GET" || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (url.pathname === new URL(scoped("sw.js")).pathname) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }
  if (request.mode === "navigate") {
    if (url.pathname === scope.pathname || url.pathname === `${scope.pathname}index.html`) {
      event.respondWith(networkFirst(request, HTML_URL, true));
    }
    return;
  }
  const relativePath = url.pathname.slice(scope.pathname.length);
  const immutable = BUILD_ASSETS.includes(relativePath) && /^assets\/.+[-.][\w-]{8,}\.(?:js|css)$/.test(relativePath);
  if (immutable) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })());
  } else if (BUILD_ASSETS.includes(relativePath) || /\.(?:webp|png|svg|ico|json)$/.test(relativePath)) {
    event.respondWith(networkFirst(request, request));
  }
});
