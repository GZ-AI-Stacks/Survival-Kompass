/* GZ Survival Kompass — Service Worker
   Zuverlaessiger Offline-Cache (eigene Datei = voller Scope im App-Ordner).
   Strategie: network-first mit Cache-Fallback; App-Shell wird beim Install vorgecacht. */

var CACHE = 'gz-survival-kompass-demo-v1';
var SHELL = ['./', './index.html'];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL).catch(function () { /* einzelne Fehler ignorieren */ });
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (ks) {
      return Promise.all(ks.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (resp) {
      try {
        var cl = resp.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, cl); });
      } catch (x) {}
      return resp;
    }).catch(function () {
      return caches.match(e.request).then(function (m) {
        return m || caches.match('./index.html');
      });
    })
  );
});
