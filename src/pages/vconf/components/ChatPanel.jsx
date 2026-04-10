import React, { useState, useRef, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";

/**
 * Persistent chat panel for the LiveKit video conferencing room.
 * Renders inside a w-80 (320px) right-side panel in MeetingRoom.
 *
 * Props come from the useMeetingChat hook:
 *   messages    – array of { senderName, senderRole, content, sentAt }
 *   sendMessage – fn(content: string)
 *   userName    – current user's display name
 *   userRole    – "Teacher" | "Student"
 */
export default function ChatPanel({ messages, sendMessage, userName, userRole }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    sendMessage(trimmed);
    setInput("");
    // Reset textarea height after send
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const handleTextareaInput = (e) => {
    setInput(e.target.value);
    // Auto-resize textarea up to a max
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 80) + "px";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 bg-white/70">
        <MessageCircle className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-semibold text-gray-600">Chat</span>
        <span className="ml-auto text-xs text-gray-400">
          {messages.length} message{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <MessageCircle className="w-10 h-10 text-gray-400" />
            <p className="text-sm text-center leading-relaxed">
              No messages yet.
              <br />
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwn = msg.senderName === userName;
            return (
              <div key={idx} className="group">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span
                    className={`text-xs font-bold truncate max-w-[120px] ${
                      isOwn ? "text-primary-600" : "text-gray-600"
                    }`}
                  >
                    {isOwn ? "You" : msg.senderName}
                  </span>

                  {/* Role badge */}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium leading-none ${
                      msg.senderRole === "Teacher"
                        ? "bg-primary-600/30 text-primary-600"
                        : "bg-surface-600/40 text-gray-400"
                    }`}
                  >
                    {msg.senderRole}
                  </span>

                  <span className="ml-auto text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatTime(msg.sentAt)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 break-words whitespace-pre-wrap leading-relaxed">
                  {msg.content}
                </p>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white/70 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-lg bg-gray-100 text-sm text-gray-900 placeholder-surface-500 px-3 py-2 outline-none focus:ring-1 focus:ring-primary-500 border border-gray-100 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:bg-gray-100 disabled:text-gray-400 text-gray-900 transition-colors shrink-0"
            title="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
