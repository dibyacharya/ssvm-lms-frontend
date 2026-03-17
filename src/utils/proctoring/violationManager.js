/**
 * Violation Manager
 * Tracks violation counts, handles warnings, and triggers auto-submit.
 */

let violations = [];
let warningCount = 0;
let maxWarnings = 5;
let onWarning = null;
let onAutoSubmit = null;

// Debounce: ignore same violation type within 5 seconds
let lastViolation = { type: '', time: 0 };
const DEBOUNCE_MS = 5000;

/**
 * Initialize the violation manager.
 * @param {Object} config
 * @param {number} config.maxWarnings - Max warnings before auto-submit
 * @param {Function} config.onWarning - Called with (violation, warningCount, maxWarnings)
 * @param {Function} config.onAutoSubmit - Called when max violations reached
 */
export const init = (config) => {
  violations = [];
  warningCount = 0;
  maxWarnings = config.maxWarnings || 5;
  onWarning = config.onWarning || null;
  onAutoSubmit = config.onAutoSubmit || null;
};

/**
 * Record a violation.
 * @param {Object} violation - { type, details, timestamp }
 * @returns {{ shouldAutoSubmit: boolean, warningCount: number }}
 */
export const addViolation = (violation) => {
  const now = Date.now();

  // Debounce: skip if same type within threshold
  if (violation.type === lastViolation.type && (now - lastViolation.time) < DEBOUNCE_MS) {
    return { shouldAutoSubmit: false, warningCount };
  }
  lastViolation = { type: violation.type, time: now };

  violations.push(violation);
  warningCount++;

  const shouldAutoSubmit = warningCount >= maxWarnings;

  // Notify
  if (onWarning) {
    onWarning(violation, warningCount, maxWarnings);
  }

  if (shouldAutoSubmit && onAutoSubmit) {
    onAutoSubmit();
  }

  return { shouldAutoSubmit, warningCount };
};

/**
 * Get current violation count.
 */
export const getViolationCount = () => warningCount;

/**
 * Get all recorded violations.
 */
export const getViolations = () => [...violations];

/**
 * Reset the manager.
 */
export const reset = () => {
  violations = [];
  warningCount = 0;
  lastViolation = { type: '', time: 0 };
  onWarning = null;
  onAutoSubmit = null;
};

export default { init, addViolation, getViolationCount, getViolations, reset };
