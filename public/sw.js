// Service worker do Palito: deixa o catálogo abrir sem internet e acelera os arquivos estáticos.
const VERSION = "v2";
const STATIC = `palito-static-${VERSION}`;
const PAGES = `palito-pages-${VERSION}`;
const PHOTOS = `palito-photos-${VERSION}`;
const OFFLINE_URL = "/offline";
const PRECACHE = [OFFLINE_URL, "/", "/icons/icon-192.png"];

// Só as telas do cliente ficam guardadas; as do vendedor têm dados privados.
const CACHEABLE_PAGES = ["/", "/sacola", "/cardapio"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const keep = [STATIC, PAGES, PHOTOS];
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(key);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Fotos do Cloudinary: mostra a guardada e atualiza por trás.
  if (url.hostname === "res.cloudinary.com") {
    event.respondWith(
      caches.open(PHOTOS).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone()).then(() => trim(PHOTOS, 120));
            return res;
          })
          .catch(() => cached);
        return cached || network;
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Arquivos com hash no nome nunca mudam.
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  // Páginas: tenta a rede; sem internet, usa a última versão guardada.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && CACHEABLE_PAGES.includes(url.pathname)) {
            const copy = res.clone();
            caches.open(PAGES).then((cache) => cache.put(url.pathname, copy));
          }
          return res;
        })
        .catch(async () => {
          const cache = await caches.open(PAGES);
          return (await cache.match(url.pathname)) || (await cache.match(OFFLINE_URL));
        }),
    );
  }
});
