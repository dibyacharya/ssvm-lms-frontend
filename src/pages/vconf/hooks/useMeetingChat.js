import { useState, useCallback, useRef, useEffect } from "react";
import { flushVconfChat, getVconfChat } from "../../../services/vconf.service";

/**
 * Hook for persistent meeting chat.
 * Uses DataChannel for real-time delivery + API for persistence.
 * Auto-flushes unsaved messages to backend every 30 seconds.
 */
export function useMeetingChat(meetingId, sendCommand, userId, userName, userRole) {
  const [messages, setMessages] = useState([]);
  const unflushedRef = useRef([]);
  const flushTimerRef = useRef(null);

  // Load existing messages on mount (late-join recovery)
  useEffect(() => {
    if (!meetingId) return;
    getVconfChat(meetingId)
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});
  }, [meetingId]);

  // Auto-flush every 30 seconds
  useEffect(() => {
    flushTimerRef.current = setInterval(() => {
      flushMessages();
    }, 30000);

    return () => {
      if (flushTimerRef.current) clearInterval(flushTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  const flushMessages = useCallback(async () => {
    if (!meetingId || unflushedRef.current.length === 0) return;
    const toFlush = [...unflushedRef.current];
    unflushedRef.current = [];
    try {
      await flushVconfChat(meetingId, toFlush);
    } catch (err) {
      // Put them back on failure
      unflushedRef.current = [...toFlush, ...unflushedRef.current];
      console.error("[Chat] flush failed:", err);
    }
  }, [meetingId]);

  const sendMessage = useCallback(
    (content) => {
      if (!content.trim()) return;

      const msg = {
        sender: userId,
        senderName: userName,
        senderRole: userRole,
        content: content.trim(),
        sentAt: new Date().toISOString(),
      };

      // Add to local state immediately
      setMessages((prev) => [...prev, msg]);

      // Queue for API flush
      unflushedRef.current.push(msg);

      // Broadcast via DataChannel
      sendCommand({
        type: "CHAT_MSG",
        ...msg,
        senderId: userId,
      });
    },
    [userId, userName, userRole, sendCommand]
  );

  const handleIncoming = useCallback(
    (data) => {
      if (data.type === "CHAT_MSG" && data.senderId !== userId) {
        setMessages((prev) => [
          ...prev,
          {
            sender: data.sender || data.senderId,
            senderName: data.senderName,
            senderRole: data.senderRole,
            content: data.content,
            sentAt: data.sentAt,
          },
        ]);
      }
    },
    [userId]
  );

  return { messages, sendMessage, handleIncoming, flushMessages };
}

export default useMeetingChat;
