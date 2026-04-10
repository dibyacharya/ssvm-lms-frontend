import React, { useState, useEffect, useRef, useCallback } from "react";
import { Settings } from "lucide-react";

const COLOR_OPTIONS = [
  { hex: "#ffffff", label: "White" },
  { hex: "#facc15", label: "Yellow" },
  { hex: "#22d3ee", label: "Cyan" },
  { hex: "#4ade80", label: "Green" },
  { hex: "#e879f9", label: "Magenta" },
  { hex: "#fb923c", label: "Orange" },
];

const FONT_SIZES = [
  { label: "S", value: 14 },
  { label: "M", value: 18 },
  { label: "L", value: 24 },
];

const BG_OPACITIES = [
  { label: "Light", value: 0.5 },
  { label: "Medium", value: 0.7 },
  { label: "Dark", value: 0.9 },
];

const POSITIONS = [
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
];

export default function CaptionOverlay({
  currentCaption,
  captionsEnabled,
  settings,
  updateSettings,
}) {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const popoverRef = useRef(null);
  const gearRef = useRef(null);

  // Fade in when caption changes
  useEffect(() => {
    if (currentCaption) {
      setVisible(false);
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setVisible(false);
  }, [currentCaption?.text, currentCaption?.speaker]);

  // Close popover on outside click
  const handleClickOutside = useCallback((e) => {
    if (
      popoverRef.current &&
      !popoverRef.current.contains(e.target) &&
      gearRef.current &&
      !gearRef.current.contains(e.target)
    ) {
      setShowSettings(false);
    }
  }, []);

  useEffect(() => {
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showSettings, handleClickOutside]);

  if (!captionsEnabled || !currentCaption) {
    return null;
  }

  const positionClasses =
    settings.position === "top" ? "top-4" : "bottom-20";

  return (
    <div
      className={`absolute left-0 right-0 z-20 flex flex-col items-center pointer-events-none ${positionClasses}`}
    >
      {/* Caption bar */}
      <div
        className="max-w-[80%] rounded-xl px-5 py-3 text-center transition-opacity duration-300 ease-in-out pointer-events-auto"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${settings.bgOpacity})`,
          opacity: visible ? 1 : 0,
        }}
      >
        {currentCaption.speaker && (
          <p className="text-xs text-gray-400 mb-1 font-medium">
            {currentCaption.speaker}
          </p>
        )}
        <p
          className="leading-relaxed font-medium"
          style={{
            fontSize: `${settings.fontSize}px`,
            color: settings.color,
          }}
        >
          {currentCaption.text}
        </p>
      </div>

      {/* Settings gear button */}
      <div className="absolute right-4 bottom-0 pointer-events-auto">
        <button
          ref={gearRef}
          onClick={() => setShowSettings((prev) => !prev)}
          className="p-1.5 rounded-full bg-gray-50/20 hover:bg-black/70 text-gray-900/70 hover:text-gray-900 transition-colors"
          title="Caption settings"
        >
          <Settings size={16} />
        </button>

        {/* Settings popover */}
        {showSettings && (
          <div
            ref={popoverRef}
            className="absolute right-0 bottom-full mb-2 w-56 rounded-xl bg-gray-50 border border-gray-200 shadow-xl p-4 space-y-4 text-sm"
          >
            {/* Font Size */}
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                Font Size
              </p>
              <div className="flex gap-2">
                {FONT_SIZES.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => updateSettings({ fontSize: value })}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                      settings.fontSize === value
                        ? "bg-blue-600 text-gray-900"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                Color
              </p>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map(({ hex, label }) => (
                  <button
                    key={hex}
                    onClick={() => updateSettings({ color: hex })}
                    title={label}
                    className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                      settings.color === hex
                        ? "border-white scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            </div>

            {/* Background */}
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                Background
              </p>
              <div className="flex gap-2">
                {BG_OPACITIES.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => updateSettings({ bgOpacity: value })}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                      settings.bgOpacity === value
                        ? "bg-blue-600 text-gray-900"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Position */}
            <div>
              <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">
                Position
              </p>
              <div className="flex gap-2">
                {POSITIONS.map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => updateSettings({ position: value })}
                    className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                      settings.position === value
                        ? "bg-blue-600 text-gray-900"
                        : "bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
