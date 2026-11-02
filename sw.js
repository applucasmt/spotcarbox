const CACHE_NAME = 'carbox-music-v7';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(c => Promise.all(FILES.map(f => c.add(f).catch(() => null)))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ns => Promise.all(ns.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE_NAME).then(async c => {
    const hit = await c.match(r, { ignoreSearch: true });
    const net = fetch(r).then(res => { if (res && res.ok && res.type === 'basic') c.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    return (await net) || (r.mode === 'navigate' ? await c.match('./index.html') : null) || Response.error();
  }));
});
