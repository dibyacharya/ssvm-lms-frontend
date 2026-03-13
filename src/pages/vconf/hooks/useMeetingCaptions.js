import { useState, useCallback, useRef, useEffect } from "react";
import { flushVconfCaptions } from "../../../services/vconf.service";

/**
 * Hook for manual caption management.
 * Teacher sends captions via DataChannel, students display them.
 * Captions are batch-saved to backend periodically.
 */
export function useMeetingCaptions(meetingId, sendCommand, isTeacher) {
  const [currentCaption, setCurrentCaption] = useState(null);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const fadeTimerRef = useRef(null);
  const unflushedRef = useRef([]);
  const flushTimerRef = useRef(null);
  const elapsedRef = useRef(0);

  // Caption display settings (from localStorage)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("captionSettings");
      return saved
        ? JSON.parse(saved)
        : { fontSize: 18, color: "#ffffff", bgOpacity: 0.7, position: "bottom" };
    } catch {
      return { fontSize: 18, color: "#ffffff", bgOpacity: 0.7, position: "bottom" };
    }
  });

  // Save settings to localStorage
  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem("captionSettings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Auto-flush captions every 30s (teacher only)
  useEffect(() => {
    if (!isTeacher || !meetingId) return;
    flushTimerRef.current = setInterval(() => {
      flushCaptions();
    }, 30000);
    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, isTeacher]);

  const flushCaptions = useCallback(async () => {
    if (!meetingId || unflushedRef.current.length === 0) return;
    const toFlush = [...unflushedRef.current];
    unflushedRef.current = [];
    try {
      await flushVconfCaptions(meetingId, toFlush);
    } catch (err) {
      unflushedRef.current = [...toFlush, ...unflushedRef.current];
      console.error("[Captions] flush failed:", err);
    }
  }, [meetingId]);

  // Teacher sends a caption
  const sendCaption = useCallback(
    (text, speaker = "Teacher") => {
      if (!text.trim()) return;

      const caption = {
        text: text.trim(),
        speaker,
        timestamp: new Date().toISOString(),
        elapsedSeconds: elapsedRef.current,
      };

      // Queue for API flush
      unflushedRef.current.push(caption);

      // Broadcast via DataChannel
      sendCommand({
        type: "CAPTION_UPDATE",
        text: caption.text,
        speaker: caption.speaker,
        elapsedSeconds: caption.elapsedSeconds,
      });

      // Show locally too
      setCurrentCaption(caption);
      resetFadeTimer();
    },
    [sendCommand]
  );

  const clearCaption = useCallback(() => {
    setCurrentCaption(null);
    sendCommand({ type: "CAPTION_CLEAR" });
  }, [sendCommand]);

  const resetFadeTimer = useCallback(() => {
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      setCurrentCaption(null);
    }, 8000); // Auto-fade after 8 seconds
  }, []);

  // Update elapsed time reference (called from parent with meeting elapsed time)
  const setElapsed = useCallback((seconds) => {
    elapsedRef.current = seconds;
  }, []);

  const handleIncoming = useCallback(
    (data) => {
      if (data.type === "CAPTION_UPDATE") {
        setCurrentCaption({
          text: data.text,
          speaker: data.speaker,
          elapsedSeconds: data.elapsedSeconds,
        });
        resetFadeTimer();
      } else if (data.type === "CAPTION_CLEAR") {
        setCurrentCaption(null);
        if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      }
    },
    [resetFadeTimer]
  );

  return {
    currentCaption,
    captionsEnabled,
    setCaptionsEnabled,
    settings,
    updateSettings,
    sendCaption,
    clearCaption,
    handleIncoming,
    flushCaptions,
    setElapsed,
  };
}

export default useMeetingCaptions;
