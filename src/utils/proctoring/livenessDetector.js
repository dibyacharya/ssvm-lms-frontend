/**
 * Liveness Detector (Anti-Photo Spoofing)
 * Uses FaceMesh eye landmarks to compute Eye Aspect Ratio (EAR).
 * If no blink detected for 30+ seconds → fires photo_spoofing violation.
 *
 * EAR = (||p2-p6|| + ||p3-p5||) / (2 * ||p1-p4||)
 * Blink threshold: EAR < 0.25
 */

import { registerConsumer, unregisterConsumer } from "./faceMeshDetectionLoop";

const CONSUMER_NAME = "liveness";
const BLINK_THRESHOLD = 0.25;
const NO_BLINK_TIMEOUT_MS = 30000; // 30 seconds
const MIN_FRAMES_FOR_BLINK = 2;    // Must be below threshold for 2 cycles

// FaceMesh landmark indices for eyes
// Right eye: 33(outer), 160(upper1), 158(upper2), 133(inner), 153(lower2), 144(lower1)
const RIGHT_EYE = [33, 160, 158, 133, 153, 144];
// Left eye: 263(outer), 387(upper1), 385(upper2), 362(inner), 380(lower2), 373(lower1)
const LEFT_EYE = [263, 387, 385, 362, 380, 373];

let _callback = null;
let _lastBlinkTime = Date.now();
let _lowEarFrames = 0;
let _checkInterval = null;

const distance = (p1, p2) => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const computeEAR = (keypoints, indices) => {
  try {
    const p1 = keypoints[indices[0]]; // outer corner
    const p2 = keypoints[indices[1]]; // upper 1
    const p3 = keypoints[indices[2]]; // upper 2
    const p4 = keypoints[indices[3]]; // inner corner
    const p5 = keypoints[indices[4]]; // lower 2
    const p6 = keypoints[indices[5]]; // lower 1

    if (!p1 || !p2 || !p3 || !p4 || !p5 || !p6) return null;

    const vertical1 = distance(p2, p6);
    const vertical2 = distance(p3, p5);
    const horizontal = distance(p1, p4);

    if (horizontal === 0) return null;
    return (vertical1 + vertical2) / (2 * horizontal);
  } catch {
    return null;
  }
};

const handleFaces = (faces) => {
  if (!_callback || !faces || faces.length === 0) return;

  const face = faces[0];
  const keypoints = face.keypoints;
  if (!keypoints || keypoints.length < 400) return;

  const rightEAR = computeEAR(keypoints, RIGHT_EYE);
  const leftEAR = computeEAR(keypoints, LEFT_EYE);

  if (rightEAR === null || leftEAR === null) return;

  const avgEAR = (rightEAR + leftEAR) / 2;

  if (avgEAR < BLINK_THRESHOLD) {
    _lowEarFrames++;
    if (_lowEarFrames >= MIN_FRAMES_FOR_BLINK) {
      // Blink detected!
      _lastBlinkTime = Date.now();
      _lowEarFrames = 0;
    }
  } else {
    _lowEarFrames = 0;
  }
};

const checkNoBlinkTimeout = () => {
  if (!_callback) return;
  const elapsed = Date.now() - _lastBlinkTime;
  if (elapsed > NO_BLINK_TIMEOUT_MS) {
    _callback({
      type: "photo_spoofing",
      details: `No blink detected for ${Math.round(elapsed / 1000)}s — possible photo or video`,
    });
    // Reset timer to avoid continuous firing
    _lastBlinkTime = Date.now();
  }
};

export const start = (callback) => {
  _callback = callback;
  _lastBlinkTime = Date.now();
  _lowEarFrames = 0;

  // Register as FaceMesh consumer
  registerConsumer(CONSUMER_NAME, handleFaces);

  // Periodic check for no-blink timeout
  _checkInterval = setInterval(checkNoBlinkTimeout, 5000);
};

export const stop = () => {
  _callback = null;
  unregisterConsumer(CONSUMER_NAME);
  if (_checkInterval) {
    clearInterval(_checkInterval);
    _checkInterval = null;
  }
};

const livenessDetector = { start, stop };
export default livenessDetector;
