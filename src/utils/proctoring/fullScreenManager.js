/**
 * Full Screen Manager
 * Enters fullscreen and detects exit attempts.
 */

let onViolation = null;
let isActive = false;

const handleFullscreenChange = () => {
  if (!isActive || !onViolation) return;
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    onViolation({
      type: 'fullscreen_exit',
      details: 'Student exited fullscreen mode',
      timestamp: new Date().toISOString(),
    });
    // Try to re-enter fullscreen
    requestFullscreen();
  }
};

/**
 * Request fullscreen on document element.
 */
export const requestFullscreen = async () => {
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      await el.msRequestFullscreen();
    }
    return true;
  } catch (err) {
    console.warn('[Proctoring] Fullscreen request failed:', err.message);
    return false;
  }
};

/**
 * Exit fullscreen.
 */
export const exitFullscreen = async () => {
  try {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    }
  } catch { /* ignore */ }
};

/**
 * Check if currently in fullscreen.
 */
export const isFullscreen = () => !!(document.fullscreenElement || document.webkitFullscreenElement);

/**
 * Start monitoring fullscreen exits.
 * @param {Function} callback - Called with violation object
 */
export const start = (callback) => {
  if (isActive) return;
  onViolation = callback;
  isActive = true;
  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  requestFullscreen();
  console.log('[Proctoring] Fullscreen enforcement started');
};

/**
 * Stop monitoring and exit fullscreen.
 */
export const stop = () => {
  isActive = false;
  onViolation = null;
  document.removeEventListener('fullscreenchange', handleFullscreenChange);
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
  exitFullscreen();
  console.log('[Proctoring] Fullscreen enforcement stopped');
};

export default { start, stop, requestFullscreen, exitFullscreen, isFullscreen };
