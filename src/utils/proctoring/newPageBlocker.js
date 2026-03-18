/**
 * New Page / Tab Blocker
 * Intercepts keyboard shortcuts that open new tabs/windows,
 * overrides window.open, and adds beforeunload warning.
 */

let _callback = null;
let _started = false;
let _originalWindowOpen = null;

const BLOCKED_COMBOS = [
  { ctrl: true, key: "n" },      // Ctrl+N (new window)
  { ctrl: true, key: "t" },      // Ctrl+T (new tab)
  { ctrl: true, key: "w" },      // Ctrl+W (close tab)
  { ctrl: true, shift: true, key: "n" }, // Ctrl+Shift+N (incognito)
  { ctrl: true, shift: true, key: "t" }, // Ctrl+Shift+T (reopen closed tab)
  { ctrl: true, key: "r" },      // Ctrl+R (refresh)
  { meta: true, key: "n" },      // Cmd+N (Mac)
  { meta: true, key: "t" },      // Cmd+T (Mac)
  { meta: true, key: "w" },      // Cmd+W (Mac)
  { meta: true, key: "r" },      // Cmd+R (Mac)
];

const handleKeyDown = (e) => {
  const key = (e.key || "").toLowerCase();
  const ctrl = e.ctrlKey;
  const meta = e.metaKey;
  const shift = e.shiftKey;

  for (const combo of BLOCKED_COMBOS) {
    const ctrlMatch = combo.ctrl ? ctrl : !ctrl;
    const metaMatch = combo.meta ? meta : !meta;
    const shiftMatch = combo.shift ? shift : true; // shift is optional unless specified
    const keyMatch = key === combo.key;

    if (keyMatch && (ctrlMatch || metaMatch) && shiftMatch) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      if (_callback) {
        _callback({
          type: "new_page_attempt",
          details: `Attempted keyboard shortcut: ${ctrl ? "Ctrl+" : ""}${meta ? "Cmd+" : ""}${shift ? "Shift+" : ""}${key.toUpperCase()}`,
        });
      }
      return false;
    }
  }

  // Block F5 (refresh)
  if (key === "f5") {
    e.preventDefault();
    e.stopPropagation();
    if (_callback) {
      _callback({
        type: "new_page_attempt",
        details: "Attempted to refresh page (F5)",
      });
    }
    return false;
  }

  // Block Alt+F4 (close window)
  if (e.altKey && key === "f4") {
    e.preventDefault();
    e.stopPropagation();
    if (_callback) {
      _callback({
        type: "new_page_attempt",
        details: "Attempted to close window (Alt+F4)",
      });
    }
    return false;
  }
};

const handleBeforeUnload = (e) => {
  e.preventDefault();
  e.returnValue = "You have an exam in progress. Leaving will result in a violation.";
  return e.returnValue;
};

export const start = (callback) => {
  if (_started) return;
  _started = true;
  _callback = callback;

  // Capture phase to intercept before browser handles it
  document.addEventListener("keydown", handleKeyDown, true);
  window.addEventListener("beforeunload", handleBeforeUnload);

  // Override window.open
  _originalWindowOpen = window.open;
  window.open = function (...args) {
    if (_callback) {
      _callback({
        type: "new_page_attempt",
        details: "Attempted to open a new window via window.open()",
      });
    }
    return null; // Block the open
  };
};

export const stop = () => {
  _started = false;
  _callback = null;
  document.removeEventListener("keydown", handleKeyDown, true);
  window.removeEventListener("beforeunload", handleBeforeUnload);

  // Restore original window.open
  if (_originalWindowOpen) {
    window.open = _originalWindowOpen;
    _originalWindowOpen = null;
  }
};

const newPageBlocker = { start, stop };
export default newPageBlocker;
