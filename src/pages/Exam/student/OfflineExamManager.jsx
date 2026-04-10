import React, { useState, useEffect, useCallback } from "react";
import { Wifi, WifiOff, Download, RefreshCw, CheckCircle } from "lucide-react";
import api from "../../../services/api";
import {
  cacheExamForOffline,
  isExamCachedOffline,
  getUnsyncedItems,
  getOfflineAnswers,
  markAsSynced,
  clearOfflineExam,
} from "../../../utils/offlineExamStorage";
import {
  registerExamSW,
  cacheExamInSW,
  requestBackgroundSync,
} from "../../../utils/serviceWorkerRegistration";

/**
 * Manages offline exam capability: download, sync, status indicator.
 */
const OfflineExamManager = ({ examId, offlineCapable = false }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCached, setIsCached] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [unsyncedCount, setUnsyncedCount] = useState(0);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Check cache status on mount
  useEffect(() => {
    if (offlineCapable && examId) {
      isExamCachedOffline(examId).then(setIsCached);
      getUnsyncedItems().then((items) => {
        const examItems = items.filter((i) => i.examId === examId);
        setUnsyncedCount(examItems.length);
      });
    }
  }, [examId, offlineCapable]);

  // Register service worker
  useEffect(() => {
    if (offlineCapable) {
      registerExamSW();
    }
  }, [offlineCapable]);

  // Listen for sync triggers from service worker
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data?.type === "SYNC_ANSWERS") {
        syncAnswers();
      }
    };
    navigator.serviceWorker?.addEventListener("message", handleMessage);
    return () => {
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && unsyncedCount > 0) {
      syncAnswers();
    }
  }, [isOnline, unsyncedCount]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await api.get(`/exams/${examId}/offline-data`);
      const examData = res.data.exam;

      // Store in IndexedDB
      await cacheExamForOffline(examId, examData);

      // Also cache in Service Worker
      await cacheExamInSW(examId, examData);

      setIsCached(true);
    } catch (err) {
      console.error("Failed to download exam for offline:", err);
    } finally {
      setDownloading(false);
    }
  };

  const syncAnswers = useCallback(async () => {
    if (syncing || !isOnline) return;
    setSyncing(true);
    try {
      const items = await getUnsyncedItems();
      const examItems = items.filter((i) => i.examId === examId);

      if (examItems.length === 0) {
        setUnsyncedCount(0);
        return;
      }

      // Group answers for batch sync
      const answers = examItems.map((item) => ({
        questionId: item.questionId,
        answer: item.answer,
        markedForReview: item.markedForReview,
        answeredAt: item.answeredAt,
      }));

      await api.post(`/exams/${examId}/sync-offline`, {
        answers,
        offlineSubmittedAt: new Date().toISOString(),
      });

      // Mark all as synced
      await markAsSynced(examItems.map((i) => i.id));
      setUnsyncedCount(0);
    } catch (err) {
      console.error("Failed to sync offline answers:", err);
    } finally {
      setSyncing(false);
    }
  }, [examId, isOnline, syncing]);

  if (!offlineCapable) return null;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      {/* Online/Offline indicator */}
      <div
        className={`flex items-center gap-1.5 text-xs font-medium ${
          isOnline ? "text-green-600" : "text-red-500"
        }`}
      >
        {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
        {isOnline ? "Online" : "Offline"}
      </div>

      <div className="h-4 w-px bg-gray-300" />

      {/* Download / Cache status */}
      {isCached ? (
        <div className="flex items-center gap-1.5 text-xs text-green-600">
          <CheckCircle size={14} />
          <span>Offline Ready</span>
        </div>
      ) : (
        <button
          onClick={handleDownload}
          disabled={downloading || !isOnline}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors"
        >
          <Download size={14} />
          {downloading ? "Downloading..." : "Download for Offline"}
        </button>
      )}

      {/* Sync status */}
      {unsyncedCount > 0 && (
        <>
          <div className="h-4 w-px bg-gray-300" />
          <button
            onClick={syncAnswers}
            disabled={syncing || !isOnline}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            <RefreshCw size={14} className={syncing ? "animate-spin" : ""} />
            {syncing ? "Syncing..." : `Sync ${unsyncedCount} answers`}
          </button>
        </>
      )}
    </div>
  );
};

export default OfflineExamManager;
