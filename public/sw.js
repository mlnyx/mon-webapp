// 간단 서비스워커 — 앱 셸 캐시(오프라인에서도 껍데기 로드).
// 데이터는 항상 네트워크(Supabase)에서 최신으로. 정적 자산만 캐시.
const CACHE = 'mon-webapp-v1';
const BASE = '/mon-webapp/';

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll([BASE, BASE + 'login/'])));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Supabase 등 API는 캐시하지 않음(항상 최신 데이터)
  if (url.hostname.includes('supabase') || e.request.method !== 'GET') return;
  // 정적 자산: 캐시 우선, 없으면 네트워크 후 캐시
  if (url.pathname.startsWith(BASE)) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) =>
          hit ||
          fetch(e.request)
            .then((res) => {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(e.request, copy));
              return res;
            })
            .catch(() => caches.match(BASE)),
      ),
    );
  }
});
