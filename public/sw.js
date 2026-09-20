const CACHE = "word-invaders-v4";
const CORE = ["/manifest.webmanifest", "/icon.png", "/images/nebula.jpg"];

async function purgeOldCaches() {
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(CORE)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Purge every previous cache (v1 served stale pages & stylesheets).
      await purgeOldCaches();
      await self.clients.claim();
      // Force open tabs onto the fresh build immediately.
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) client.navigate(client.url).catch(() => undefined);
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "purge") event.waitUntil(purgeOldCaches());
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  const isBuildAsset = url.pathname.startsWith("/_next/");
  const isDocument = req.mode === "navigate";

  // Every navigation also sweeps leftover caches from older versions.
  if (isDocument) event.waitUntil(purgeOldCaches());

  // Pages and build output: network first, never stale.
  if (isBuildAsset || isDocument) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
          }
          return res;
        })
        .catch(async () => (await caches.match(req)) ?? (await caches.match("/")) ?? Response.error()),
    );
    return;
  }

  // Static media: cache first for offline play.
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ??
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy)).catch(() => undefined);
          }
          return res;
        }),
    ),
  );
});
