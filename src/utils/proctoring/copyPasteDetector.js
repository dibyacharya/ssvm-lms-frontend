/**
 * Copy/Paste Detector
 * Intercepts keyboard shortcuts (Ctrl+C/V/X) and context menu events.
 */

let onViolation = null;
let isActive = false;

const handleKeyDown = (e) => {
  if (!onViolation) return;
  const key = e.key?.toLowerCase();
  if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(key)) {
    e.preventDefault();
    const action = key === 'c' ? 'copy' : key === 'v' ? 'paste' : 'cut';
    onViolation({
      type: 'copy_paste',
      details: `${action} attempt blocked (Ctrl/Cmd+${key.toUpperCase()})`,
      timestamp: new Date().toISOString(),
    });
  }
};

const handleContextMenu = (e) => {
  e.preventDefault();
  if (onViolation) {
    onViolation({
      type: 'copy_paste',
      details: 'Right-click context menu blocked',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Start monitoring copy/paste actions.
 * @param {Function} callback - Called with violation object
 */
export const start = (callback) => {
  if (isActive) return;
  onViolation = callback;
  isActive = true;
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('contextmenu', handleContextMenu, true);
  console.log('[Proctoring] Copy/paste detection started');
};

/**
 * Stop monitoring.
 */
export const stop = () => {
  isActive = false;
  onViolation = null;
  document.removeEventListener('keydown', handleKeyDown, true);
  document.removeEventListener('contextmenu', handleContextMenu, true);
  console.log('[Proctoring] Copy/paste detection stopped');
};

export default { start, stop };
