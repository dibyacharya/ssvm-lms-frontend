/**
 * DevTools Detector
 * Uses multiple strategies to detect if browser DevTools are open:
 * 1. Window size differential (docked DevTools changes inner/outer dimensions)
 * 2. Console timing via getter trap
 * 3. Debugger performance timing
 */

let _callback = null;
let _started = false;
let _sizeInterval = null;
let _consoleInterval = null;
let _lastFiredAt = 0;
const DEBOUNCE_MS = 10000; // Don't fire more than once per 10 seconds

const fireViolation = (details) => {
  if (!_callback) return;
  const now = Date.now();
  if (now - _lastFiredAt < DEBOUNCE_MS) return;
  _lastFiredAt = now;
  _callback({ type: "devtools_detected", details });
};

/* ── Strategy 1: Window size differential ── */
const checkWindowSize = () => {
  const widthDiff = window.outerWidth - window.innerWidth;
  const heightDiff = window.outerHeight - window.innerHeight;

  // Docked DevTools typically adds 200+ pixels
  if (widthDiff > 200 || heightDiff > 200) {
    fireViolation("Developer tools detected (window size anomaly)");
  }
};

/* ── Strategy 2: Console getter trap ── */
const checkConsole = () => {
  const element = new Image();
  let detected = false;

  Object.defineProperty(element, "id", {
    get: function () {
      detected = true;
      return "";
    },
  });

  // When DevTools console is open and inspecting, the getter fires
  console.debug(element);

  if (detected) {
    fireViolation("Developer tools detected (console inspection)");
  }
};

/* ── Strategy 3: Debugger timing ── */
const checkDebuggerTiming = () => {
  const start = performance.now();
  // eslint-disable-next-line no-debugger
  debugger;
  const elapsed = performance.now() - start;

  // If DevTools is open with "Pause on debugger" enabled, this will take significant time
  // Normal execution: < 1ms. With DevTools paused: >> 100ms
  if (elapsed > 100) {
    fireViolation("Developer tools detected (debugger pause)");
  }
};

export const start = (callback) => {
  if (_started) return;
  _started = true;
  _callback = callback;
  _lastFiredAt = 0;

  // Strategy 1: Check window size every 3 seconds
  _sizeInterval = setInterval(checkWindowSize, 3000);

  // Strategy 2: Console getter check every 5 seconds
  _consoleInterval = setInterval(checkConsole, 5000);

  // Strategy 3: Debugger timing is too disruptive for continuous use
  // Only run it once at start as a one-time check
  try {
    checkDebuggerTiming();
  } catch {
    // Ignore errors from debugger statement
  }
};

export const stop = () => {
  _started = false;
  _callback = null;
  if (_sizeInterval) clearInterval(_sizeInterval);
  if (_consoleInterval) clearInterval(_consoleInterval);
  _sizeInterval = null;
  _consoleInterval = null;
};

const devToolsDetector = { start, stop };
export default devToolsDetector;
