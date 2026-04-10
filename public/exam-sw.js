/**
 * Service Worker for offline exam capability.
 * Caches exam data and serves from cache when network is unavailable.
 */

const CACHE_NAME = "exam-data-v1";

// Install event
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Message handler for caching/clearing exam data
self.addEventListener("message", (event) => {
  const { type, examId, examData } = event.data;

  if (type === "CACHE_EXAM") {
    caches.open(CACHE_NAME).then((cache) => {
      const response = new Response(JSON.stringify(examData), {
        headers: { "Content-Type": "application/json" },
      });
      cache.put(`/api/exam/exams/${examId}/offline-data`, response);
    });
  }

  if (type === "CLEAR_EXAM_CACHE") {
    caches.open(CACHE_NAME).then((cache) => {
      cache.delete(`/api/exam/exams/${examId}/offline-data`);
    });
  }
});

// Fetch handler - network first, cache fallback for exam endpoints
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only intercept exam API requests
  if (!url.pathname.includes("/api/exam/exams/")) return;

  // For exam take and offline-data endpoints, use network-first strategy
  if (
    url.pathname.includes("/take") ||
    url.pathname.includes("/offline-data")
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone and cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return new Response(
              JSON.stringify({ error: "Offline - no cached data available" }),
              {
                status: 503,
                headers: { "Content-Type": "application/json" },
              }
            );
          });
        })
    );
  }
});

// Background sync for offline answers
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-exam-answers") {
    event.waitUntil(syncOfflineAnswers());
  }
});

async function syncOfflineAnswers() {
  // This is handled by the frontend OfflineExamManager component
  // The service worker just triggers the sync event
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: "SYNC_ANSWERS" });
  });
}
