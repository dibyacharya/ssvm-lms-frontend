import React, { useState, useEffect } from "react";
import { Settings, X, Eye, EyeOff } from "lucide-react";

/**
 * Live settings editor panel for teachers during live class.
 * Allows editing banner text, class/teacher/batch names, and banner mode.
 */
const LiveSettingsEditor = ({
  isOpen,
  onClose,
  liveSettings = {},
  onSave,
  isTeacher = false,
}) => {
  const [settings, setSettings] = useState({
    bannerText: "",
    displayClassName: "",
    displayTeacherName: "",
    displayBatchName: "",
    bannerEnabled: false,
    bannerSpeed: 50,
    bannerMode: "html",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (liveSettings) {
      setSettings({
        bannerText: liveSettings.bannerText || "",
        displayClassName: liveSettings.displayClassName || "",
        displayTeacherName: liveSettings.displayTeacherName || "",
        displayBatchName: liveSettings.displayBatchName || "",
        bannerEnabled: liveSettings.bannerEnabled || false,
        bannerSpeed: liveSettings.bannerSpeed || 50,
        bannerMode: liveSettings.bannerMode || "html",
      });
    }
  }, [liveSettings]);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(settings);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !isTeacher) return null;

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Settings size={18} className="text-gray-600" />
          <h3 className="font-semibold text-sm">Live Settings</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Banner Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Scrolling Banner
          </label>
          <button
            onClick={() => handleChange("bannerEnabled", !settings.bannerEnabled)}
            className={`p-1.5 rounded-lg ${
              settings.bannerEnabled ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
            }`}
          >
            {settings.bannerEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        {/* Banner Text */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Banner Text
          </label>
          <textarea
            value={settings.bannerText}
            onChange={(e) => handleChange("bannerText", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            placeholder="Enter scrolling banner text..."
          />
        </div>

        {/* Banner Speed */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Banner Speed: {settings.bannerSpeed}px/s
          </label>
          <input
            type="range"
            min={10}
            max={200}
            value={settings.bannerSpeed}
            onChange={(e) => handleChange("bannerSpeed", parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* Banner Mode */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Banner Mode
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => handleChange("bannerMode", "html")}
              className={`flex-1 px-3 py-2 text-xs rounded-lg border ${
                settings.bannerMode === "html"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              HTML Overlay
              <span className="block text-[10px] text-gray-400 mt-0.5">
                Viewer only
              </span>
            </button>
            <button
              onClick={() => handleChange("bannerMode", "canvas")}
              className={`flex-1 px-3 py-2 text-xs rounded-lg border ${
                settings.bannerMode === "canvas"
                  ? "bg-blue-50 border-blue-500 text-blue-700"
                  : "border-gray-300 text-gray-600"
              }`}
            >
              Canvas Baked
              <span className="block text-[10px] text-gray-400 mt-0.5">
                In recording
              </span>
            </button>
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Display Names */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Class Name
          </label>
          <input
            type="text"
            value={settings.displayClassName}
            onChange={(e) => handleChange("displayClassName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter class name..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Teacher Name
          </label>
          <input
            type="text"
            value={settings.displayTeacherName}
            onChange={(e) => handleChange("displayTeacherName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter teacher name..."
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">
            Batch Name
          </label>
          <input
            type="text"
            value={settings.displayBatchName}
            onChange={(e) => handleChange("displayBatchName", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter batch name..."
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full px-4 py-2 bg-blue-600 text-gray-900 text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Applying..." : "Apply Settings"}
        </button>
      </div>
    </div>
  );
};

export default LiveSettingsEditor;
