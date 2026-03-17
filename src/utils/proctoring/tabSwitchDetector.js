/**
 * Tab Switch Detector
 * Listens for visibilitychange and blur events to detect tab/window switching.
 */

let onViolation = null;
let isActive = false;

const handleVisibilityChange = () => {
  if (document.hidden && onViolation) {
    onViolation({
      type: 'tab_switch',
      details: 'Tab switched or minimized (visibility hidden)',
      timestamp: new Date().toISOString(),
    });
  }
};

const handleBlur = () => {
  if (onViolation) {
    onViolation({
      type: 'tab_switch',
      details: 'Window lost focus',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Start monitoring tab switches.
 * @param {Function} callback - Called with violation object on each tab switch
 */
export const start = (callback) => {
  if (isActive) return;
  onViolation = callback;
  isActive = true;
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleBlur);
  console.log('[Proctoring] Tab switch detection started');
};

/**
 * Stop monitoring.
 */
export const stop = () => {
  isActive = false;
  onViolation = null;
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  window.removeEventListener('blur', handleBlur);
  console.log('[Proctoring] Tab switch detection stopped');
};

export default { start, stop };
