const CACHE = "llc-shell-v6";
const CORE = ["/demo", "/privacy", "/terms", "/assets/listening-room-720.webp", "/favicon.svg"];
self.addEventListener("install", (event) => event.waitUntil((async () => {
  const cache = await caches.open(CACHE);
  const response = await fetch("/", { cache: "reload" });
  await cache.put("/", response.clone());
  const html = await response.text();
  const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]);
  for (const path of [...CORE, ...builtAssets]) {
    const asset = await fetch(path, { cache: "reload" });
    if (asset.ok) {
      await cache.put(path, asset.clone());
      if (path.endsWith(".css")) {
        const css = await asset.text();
        const fontPaths = [...css.matchAll(/url\(([^)]+\.(?:woff2?|ttf))\)/g)].map((match) => new URL(match[1], new URL(path, self.location.origin)).pathname);
        for (const fontPath of fontPaths) {
          const font = await fetch(fontPath, { cache: "reload" });
          if (font.ok) await cache.put(fontPath, font);
        }
      }
    }
  }
  await self.skipWaiting();
})()));
self.addEventListener("activate", (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((hit) => hit || fetch(event.request).then((response) => {
    if (new URL(event.request.url).origin === location.origin) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match("/", { ignoreVary: true }))));
});
