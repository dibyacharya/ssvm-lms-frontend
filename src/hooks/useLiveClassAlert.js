import { useState, useEffect, useCallback, useRef } from "react";
import { getMyTimetable } from "../services/timetable.service";

/**
 * Hook that polls for upcoming classes and returns a "live class alert"
 * when any class is starting within `thresholdMinutes` (default: 5).
 *
 * Returns:
 *  - alertClass: the soonest class object starting within threshold (or null)
 *  - minutesLeft: minutes remaining until the class starts
 *  - isLive: true if the class has already started (currently live)
 *  - joinUrl: the vconf room URL for the class
 */
const POLL_INTERVAL = 30_000; // 30 seconds

export default function useLiveClassAlert(thresholdMinutes = 5) {
  const [alertClass, setAlertClass] = useState(null);
  const [minutesLeft, setMinutesLeft] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const entriesRef = useRef([]);

  // Fetch timetable entries for today
  const fetchEntries = useCallback(async () => {
    try {
      const today = new Date();
      const from = new Date(today);
      from.setHours(0, 0, 0, 0);
      const to = new Date(today);
      to.setHours(23, 59, 59, 999);

      const data = await getMyTimetable(from.toISOString(), to.toISOString());
      entriesRef.current = data?.entries || [];
    } catch {
      // silently fail — don't block UI
    }
  }, []);

  // Check entries and determine if any class is within threshold
  const checkAlerts = useCallback(() => {
    const now = new Date();
    let bestCandidate = null;
    let bestDiff = Infinity;
    let candidateLive = false;

    for (const entry of entriesRef.current) {
      const start = new Date(entry.instanceStart || entry.start);
      const end = entry.instanceEnd || entry.end ? new Date(entry.instanceEnd || entry.end) : null;
      const diffMs = start - now;
      const diffMin = diffMs / 60_000;

      // Class is currently live
      if (diffMs <= 0 && end && now < end) {
        if (Math.abs(diffMs) < Math.abs(bestDiff) || !candidateLive) {
          bestCandidate = entry;
          bestDiff = diffMin;
          candidateLive = true;
        }
        continue;
      }

      // Class starts within threshold (and hasn't ended)
      if (diffMin > 0 && diffMin <= thresholdMinutes) {
        if (!candidateLive && diffMin < bestDiff) {
          bestCandidate = entry;
          bestDiff = diffMin;
          candidateLive = false;
        }
      }
    }

    if (bestCandidate) {
      setAlertClass(bestCandidate);
      setMinutesLeft(candidateLive ? 0 : Math.ceil(bestDiff));
      setIsLive(candidateLive);
    } else {
      setAlertClass(null);
      setMinutesLeft(null);
      setIsLive(false);
    }
  }, [thresholdMinutes]);

  // Initial fetch + periodic poll
  useEffect(() => {
    fetchEntries();
    const fetchTimer = setInterval(fetchEntries, POLL_INTERVAL * 4); // Fetch API every 2 min
    return () => clearInterval(fetchTimer);
  }, [fetchEntries]);

  // Fast local check every 10s (no API call)
  useEffect(() => {
    checkAlerts(); // immediate
    const checkTimer = setInterval(checkAlerts, 10_000);
    return () => clearInterval(checkTimer);
  }, [checkAlerts]);

  // Also re-check whenever entries change
  useEffect(() => {
    checkAlerts();
  }, [entriesRef.current.length, checkAlerts]);

  const joinUrl = alertClass
    ? `/vconf/meeting/${alertClass.vconfRoomId || alertClass.meetingId || alertClass._id}`
    : null;

  return { alertClass, minutesLeft, isLive, joinUrl };
}
