/**
 * Service Worker registration for offline exam capability.
 */

export async function registerExamSW() {
  if (!("serviceWorker" in navigator)) {
    console.warn("Service Workers not supported in this browser");
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("/exam-sw.js", {
      scope: "/",
    });
    console.log("Exam Service Worker registered:", registration.scope);
    return registration;
  } catch (error) {
    console.error("Exam Service Worker registration failed:", error);
    return null;
  }
}

/**
 * Send message to service worker to cache exam data.
 */
export async function cacheExamInSW(examId, examData) {
  if (!navigator.serviceWorker.controller) return;

  navigator.serviceWorker.controller.postMessage({
    type: "CACHE_EXAM",
    examId,
    examData,
  });
}

/**
 * Clear cached exam data from service worker.
 */
export async function clearExamCacheInSW(examId) {
  if (!navigator.serviceWorker.controller) return;

  navigator.serviceWorker.controller.postMessage({
    type: "CLEAR_EXAM_CACHE",
    examId,
  });
}

/**
 * Request background sync for offline answers.
 */
export async function requestBackgroundSync() {
  if (!("serviceWorker" in navigator) || !("SyncManager" in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register("sync-exam-answers");
    return true;
  } catch (error) {
    console.warn("Background sync not available:", error);
    return false;
  }
}
