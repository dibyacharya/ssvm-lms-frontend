import React, { useState, useRef } from "react";
import { Send, X, Subtitles, ChevronDown, ChevronUp } from "lucide-react";

const SPEAKER_OPTIONS = ["Teacher", "Guest", "Moderator"];

const CaptionInput = ({ sendCaption, clearCaption }) => {
  const [text, setText] = useState("");
  const [speaker, setSpeaker] = useState("Teacher");
  const [visible, setVisible] = useState(true);
  const inputRef = useRef(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendCaption(trimmed, speaker);
    setText("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="w-full">
      {/* Toggle button */}
      <div className="flex justify-center">
        <button
          onClick={() => setVisible((v) => !v)}
          className="flex items-center gap-1 px-3 py-0.5 text-xs text-slate-400 hover:text-white bg-slate-800/90 rounded-t-md border border-b-0 border-slate-700 transition-colors"
          title={visible ? "Hide captions bar" : "Show captions bar"}
        >
          <Subtitles size={12} />
          Captions
          {visible ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
        </button>
      </div>

      {/* Input bar */}
      {visible && (
        <div className="w-full bg-slate-800/90 backdrop-blur border-t border-slate-700 py-2 px-4 flex items-center gap-3">
          {/* CC badge */}
          <span className="flex-shrink-0 px-2 py-0.5 text-xs font-bold text-white bg-blue-500 rounded-full select-none">
            CC
          </span>

          {/* Speaker dropdown */}
          <select
            value={speaker}
            onChange={(e) => setSpeaker(e.target.value)}
            className="flex-shrink-0 bg-slate-700 text-white text-sm rounded px-2 py-1.5 outline-none border border-slate-600 focus:border-blue-500 cursor-pointer"
          >
            {SPEAKER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type caption..."
            className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-lg px-3 py-2 text-sm outline-none border border-slate-600 focus:border-blue-500"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="flex-shrink-0 flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded px-3 py-2 transition-colors"
          >
            <Send size={14} />
            Send
          </button>

          {/* Clear button */}
          <button
            onClick={clearCaption}
            className="flex-shrink-0 p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors"
            title="Clear captions"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default CaptionInput;
