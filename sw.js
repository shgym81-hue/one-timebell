"use strict";

// 원타임벨 캐시 갱신용 서비스워커 - 2026-09-02 Korean voices only
const CACHE_NAME = "one-timebell-20260902-korean-voices-v3";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  // HTML/페이지 이동은 항상 네트워크를 먼저 확인해서 업데이트가 즉시 보이게 합니다.
  if (request.mode === "navigate" || request.destination === "document") {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request, { cache: "no-store" });
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, fresh.clone());
        return fresh;
      } catch (_) {
        return (await caches.match(request)) || (await caches.match("./index.html"));
      }
    })());
    return;
  }

  // MP3 등 정적 파일도 새 파일을 우선 확인하고, 오프라인일 때만 캐시를 사용합니다.
  event.respondWith((async () => {
    try {
      const fresh = await fetch(request, { cache: "no-store" });
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, fresh.clone());
      return fresh;
    } catch (_) {
      return caches.match(request);
    }
  })());
});
