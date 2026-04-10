/**
 * Offline Exam Storage using IndexedDB.
 * Stores exam data, answers, and sync queue for offline exam taking.
 */

const DB_NAME = "ExamOfflineDB";
const DB_VERSION = 1;

const STORES = {
  EXAMS: "exams",
  ANSWERS: "answers",
  SYNC_QUEUE: "syncQueue",
  EXAM_STATE: "examState",
};

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORES.EXAMS)) {
        db.createObjectStore(STORES.EXAMS, { keyPath: "examId" });
      }
      if (!db.objectStoreNames.contains(STORES.ANSWERS)) {
        db.createObjectStore(STORES.ANSWERS, { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        db.createObjectStore(STORES.SYNC_QUEUE, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
      if (!db.objectStoreNames.contains(STORES.EXAM_STATE)) {
        db.createObjectStore(STORES.EXAM_STATE, { keyPath: "examId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function txStore(db, storeName, mode = "readonly") {
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

function promisify(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Cache exam data for offline use.
 */
export async function cacheExamForOffline(examId, examData) {
  const db = await openDB();
  const store = txStore(db, STORES.EXAMS, "readwrite");
  await promisify(
    store.put({
      examId,
      data: examData,
      cachedAt: new Date().toISOString(),
    })
  );
  db.close();
}

/**
 * Get cached exam data.
 */
export async function getCachedExam(examId) {
  const db = await openDB();
  const store = txStore(db, STORES.EXAMS);
  const result = await promisify(store.get(examId));
  db.close();
  return result?.data || null;
}

/**
 * Save an answer offline.
 */
export async function saveAnswerOffline(examId, questionId, answer, markedForReview = false) {
  const db = await openDB();
  const key = `${examId}-${questionId}`;

  // Save to answers store
  const ansStore = txStore(db, STORES.ANSWERS, "readwrite");
  await promisify(
    ansStore.put({
      key,
      examId,
      questionId,
      answer,
      markedForReview,
      answeredAt: new Date().toISOString(),
    })
  );

  // Add to sync queue
  const syncStore = txStore(db, STORES.SYNC_QUEUE, "readwrite");
  await promisify(
    syncStore.add({
      type: "answer",
      examId,
      questionId,
      answer,
      markedForReview,
      answeredAt: new Date().toISOString(),
      synced: false,
    })
  );

  db.close();
}

/**
 * Get all offline answers for an exam.
 */
export async function getOfflineAnswers(examId) {
  const db = await openDB();
  const store = txStore(db, STORES.ANSWERS);
  const all = await promisify(store.getAll());
  db.close();
  return all.filter((a) => a.examId === examId);
}

/**
 * Save exam state (currentIndex, currentSection, etc.)
 */
export async function saveExamState(examId, state) {
  const db = await openDB();
  const store = txStore(db, STORES.EXAM_STATE, "readwrite");
  await promisify(
    store.put({
      examId,
      ...state,
      updatedAt: new Date().toISOString(),
    })
  );
  db.close();
}

/**
 * Get exam state.
 */
export async function getExamState(examId) {
  const db = await openDB();
  const store = txStore(db, STORES.EXAM_STATE);
  const result = await promisify(store.get(examId));
  db.close();
  return result || null;
}

/**
 * Get all unsynced items from sync queue.
 */
export async function getUnsyncedItems() {
  const db = await openDB();
  const store = txStore(db, STORES.SYNC_QUEUE);
  const all = await promisify(store.getAll());
  db.close();
  return all.filter((item) => !item.synced);
}

/**
 * Mark sync queue items as synced.
 */
export async function markAsSynced(ids) {
  const db = await openDB();
  const store = txStore(db, STORES.SYNC_QUEUE, "readwrite");
  for (const id of ids) {
    const item = await promisify(store.get(id));
    if (item) {
      item.synced = true;
      await promisify(store.put(item));
    }
  }
  db.close();
}

/**
 * Clear all offline data for an exam.
 */
export async function clearOfflineExam(examId) {
  const db = await openDB();

  // Clear exam cache
  const examStore = txStore(db, STORES.EXAMS, "readwrite");
  await promisify(examStore.delete(examId));

  // Clear answers
  const ansStore = txStore(db, STORES.ANSWERS, "readwrite");
  const allAnswers = await promisify(ansStore.getAll());
  for (const ans of allAnswers) {
    if (ans.examId === examId) {
      await promisify(ansStore.delete(ans.key));
    }
  }

  // Clear exam state
  const stateStore = txStore(db, STORES.EXAM_STATE, "readwrite");
  await promisify(stateStore.delete(examId));

  db.close();
}

/**
 * Check if an exam is cached offline.
 */
export async function isExamCachedOffline(examId) {
  const db = await openDB();
  const store = txStore(db, STORES.EXAMS);
  const result = await promisify(store.get(examId));
  db.close();
  return !!result;
}
