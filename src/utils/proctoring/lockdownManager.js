/**
 * Lockdown Manager — Exam Lockdown Mode
 * Prevents copy/paste, right-click, keyboard shortcuts, screen capture,
 * text selection, and detects window resize during exams.
 *
 * Usage:
 *   import lockdownManager from './lockdownManager';
 *   const cleanup = lockdownManager.activate(onViolation);
 *   // ... exam in progress ...
 *   cleanup();
 */

const BLOCKED_SHORTCUTS = [
  { key: 'c', ctrl: true, label: 'Copy (Ctrl+C)' },
  { key: 'v', ctrl: true, label: 'Paste (Ctrl+V)' },
  { key: 'a', ctrl: true, label: 'Select All (Ctrl+A)' },
  { key: 'p', ctrl: true, label: 'Print (Ctrl+P)' },
  { key: 's', ctrl: true, label: 'Save (Ctrl+S)' },
  { key: 'i', ctrl: true, shift: true, label: 'DevTools (Ctrl+Shift+I)' },
  { key: 'j', ctrl: true, shift: true, label: 'DevTools Console (Ctrl+Shift+J)' },
  { key: 'u', ctrl: true, label: 'View Source (Ctrl+U)' },
];

/**
 * Activate full exam lockdown.
 * @param {(violation: { type: string, details: string }) => void} onViolation
 * @returns {() => void} cleanup function that removes all listeners and restores CSS
 */
function activate(onViolation) {
  const report = (type, details) => {
    if (onViolation) {
      onViolation({
        type,
        details,
        timestamp: new Date().toISOString(),
      });
    }
  };

  // Track all listeners for cleanup
  const listeners = [];

  const addListener = (target, event, handler, options) => {
    target.addEventListener(event, handler, options);
    listeners.push({ target, event, handler, options });
  };

  // ─── 1. Disable right-click ───────────────────────────────
  const onContextMenu = (e) => {
    e.preventDefault();
    report('right_click_attempt', 'Right-click context menu was blocked');
  };
  addListener(document, 'contextmenu', onContextMenu, true);

  // ─── 2. Disable keyboard shortcuts ────────────────────────
  const onKeyDown = (e) => {
    const key = e.key.toLowerCase();
    const ctrl = e.ctrlKey || e.metaKey;
    const shift = e.shiftKey;

    // F12 — DevTools
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      report('keyboard_shortcut_blocked', 'F12 (DevTools) was blocked');
      return;
    }

    // PrintScreen
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      e.stopPropagation();
      report('print_screen_attempt', 'PrintScreen key was blocked');
      return;
    }

    // Check against blocked shortcut combos
    if (ctrl) {
      for (const shortcut of BLOCKED_SHORTCUTS) {
        const ctrlMatch = shortcut.ctrl && ctrl;
        const shiftMatch = shortcut.shift ? shift : !shift;
        const keyMatch = key === shortcut.key;

        if (ctrlMatch && shiftMatch && keyMatch) {
          e.preventDefault();
          e.stopPropagation();
          report('keyboard_shortcut_blocked', `${shortcut.label} was blocked`);
          return;
        }
      }
    }
  };
  addListener(document, 'keydown', onKeyDown, true);

  // ─── 3. Disable text selection via CSS ────────────────────
  const previousUserSelect = document.body.style.userSelect;
  const previousWebkitUserSelect = document.body.style.webkitUserSelect;
  document.body.style.userSelect = 'none';
  document.body.style.webkitUserSelect = 'none';

  // Also catch selectstart as a fallback
  const onSelectStart = (e) => {
    e.preventDefault();
    report('text_selection_attempt', 'Text selection was blocked');
  };
  addListener(document, 'selectstart', onSelectStart, true);

  // ─── 4. Disable PrintScreen (clipboard clear on keyup) ───
  const onKeyUp = (e) => {
    if (e.key === 'PrintScreen') {
      report('print_screen_attempt', 'PrintScreen capture was intercepted');

      // Attempt to clear clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText('').catch(() => {
          // Silent — clipboard API may be restricted
        });
      }
    }
  };
  addListener(document, 'keyup', onKeyUp, true);

  // ─── 5. Alt+Tab detection (window blur) ───────────────────
  const onWindowBlur = () => {
    report('keyboard_shortcut_blocked', 'Window lost focus (possible Alt+Tab or tab switch)');
  };
  addListener(window, 'blur', onWindowBlur);

  // ─── 6. Detect unexpected window resize ───────────────────
  let lastWidth = window.innerWidth;
  let lastHeight = window.innerHeight;

  const onResize = () => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    if (newWidth !== lastWidth || newHeight !== lastHeight) {
      report('window_resize', `Window resized from ${lastWidth}x${lastHeight} to ${newWidth}x${newHeight}`);
      lastWidth = newWidth;
      lastHeight = newHeight;
    }
  };
  addListener(window, 'resize', onResize);

  // ─── Cleanup function ─────────────────────────────────────
  const cleanup = () => {
    // Remove all event listeners
    for (const { target, event, handler, options } of listeners) {
      target.removeEventListener(event, handler, options);
    }
    listeners.length = 0;

    // Restore CSS
    document.body.style.userSelect = previousUserSelect || '';
    document.body.style.webkitUserSelect = previousWebkitUserSelect || '';

    console.log('[LockdownManager] Lockdown deactivated, all listeners removed');
  };

  console.log('[LockdownManager] Lockdown activated');
  return cleanup;
}

const lockdownManager = { activate };
export default lockdownManager;
