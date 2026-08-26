const CACHE = 'adaptivelab-v2';
const SHELL = ['/', '/logo.svg', '/docs/hero.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL))); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== CACHE).map((x) => caches.delete(x))))); });
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => {
    const clone = resp.clone();
    caches.open(CACHE).then((c) => c.put(e.request, clone));
    return resp;
  })));
});
