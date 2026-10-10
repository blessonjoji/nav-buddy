/* Offline cache: app shell + content. Bump VERSION when content is rebuilt. */
const VERSION = "smb-d51a817af8";
const FILES = ["./", "index.html", "styles.css", "notesfmt.js", "app.js", "ror.js", "morse.js", "navcalc.js", "symbols.js", "features.js", "features2.js", "features3.js", "features4.js", "data/checklist.js", "colreg.js", "data/papers.js", "data/content.js", "manifest.webmanifest", "icon.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("index.html"))));
});
