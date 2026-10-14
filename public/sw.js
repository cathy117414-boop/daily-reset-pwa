const CACHE_NAME = "daily-reset-v6-literary";
const SCOPE_URL = self.registration.scope;
const scoped = (path = "") => new URL(path, SCOPE_URL).toString();
const APP_SHELL = [
  scoped(),
  scoped("manifest.json"),
  scoped("app-icon.svg"),
  scoped("app-icon-192.png"),
  scoped("app-icon-512.png"),
];
const THEME_ASSETS = ["cream-puppy", "pink-kitten", "minimal-rabbit", "bear-bug"].flatMap((theme) =>
  ["cover.webp", "mascot.webp", "completed.webp", "thumbnail.webp"].map((file) =>
    scoped(`themes/${theme}/${file}`),
  ),
);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await cache.addAll(APP_SHELL);
      await Promise.allSettled(THEME_ASSETS.map((asset) => cache.add(asset)));
    }),
  );
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
