const CACHE_NAME = "daily-reset-v2";
const SCOPE_URL = self.registration.scope;
const scoped = (path = "") => new URL(path, SCOPE_URL).toString();
const APP_SHELL = [
  scoped(),
  scoped("manifest.json"),
  scoped("app-icon.svg"),
  scoped("app-icon-192.png"),
  scoped("app-icon-512.png"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request)
          .then((response) => {
            if (response.ok && new URL(event.request.url).origin === self.location.origin) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
            }
            return response;
          })
          .catch(() => caches.match(scoped())),
    ),
  );
});
