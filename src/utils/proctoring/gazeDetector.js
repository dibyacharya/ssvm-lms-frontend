/**
 * Gaze Detector
 * Uses FaceMesh iris landmarks to compute gaze direction.
 * If student looks away continuously for 5+ seconds → gaze_deviation violation.
 * Anti-false-positive: requires 4/5 consecutive bad checks.
 */

import { registerConsumer, unregisterConsumer } from "./faceMeshDetectionLoop";

const CONSUMER_NAME = "gaze";
const GAZE_AWAY_THRESHOLD_LOW = 0.28;  // Looking too far left
const GAZE_AWAY_THRESHOLD_HIGH = 0.72; // Looking too far right
const HEAD_YAW_THRESHOLD = 0.15;       // Normalized yaw threshold
const CONSECUTIVE_BAD_REQUIRED = 8;    // 8 checks at 500ms = 4 seconds
const LOOK_AWAY_DURATION_MS = 5000;

// FaceMesh iris landmark indices (refineLandmarks: true required)
// Left iris center: 468, Right iris center: 473
// Left eye corners: 33 (outer), 133 (inner)
// Right eye corners: 362 (outer), 263 (inner)
// Nose tip: 1, Left eye outer: 33, Right eye outer: 263

let _callback = null;
let _consecutiveBad = 0;
let _lookAwayStartTime = null;
let _firedForCurrentSession = false;

const computeGazeRatio = (keypoints) => {
  try {
    // Left eye gaze
    const leftIris = keypoints[468];
    const leftOuter = keypoints[33];
    const leftInner = keypoints[133];

    // Right eye gaze
    const rightIris = keypoints[473];
    const rightOuter = keypoints[362];
    const rightInner = keypoints[263];

    if (!leftIris || !leftOuter || !leftInner || !rightIris || !rightOuter || !rightInner) {
      return null;
    }

    // Left eye: ratio = (iris.x - inner.x) / (outer.x - inner.x)
    const leftWidth = Math.abs(leftOuter.x - leftInner.x);
    const leftRatio = leftWidth > 0 ? (leftIris.x - leftInner.x) / leftWidth : 0.5;

    // Right eye: similar calculation
    const rightWidth = Math.abs(rightOuter.x - rightInner.x);
    const rightRatio = rightWidth > 0 ? (rightIris.x - rightInner.x) / rightWidth : 0.5;

    return (leftRatio + rightRatio) / 2;
  } catch {
    return null;
  }
};

const computeHeadYaw = (keypoints) => {
  try {
    const noseTip = keypoints[1];
    const leftEyeOuter = keypoints[33];
    const rightEyeOuter = keypoints[263];

    if (!noseTip || !leftEyeOuter || !rightEyeOuter) return 0;

    // Eye center
    const eyeCenterX = (leftEyeOuter.x + rightEyeOuter.x) / 2;
    const eyeWidth = Math.abs(rightEyeOuter.x - leftEyeOuter.x);

    if (eyeWidth === 0) return 0;

    // Normalized yaw: how far nose is from eye center relative to eye width
    return (noseTip.x - eyeCenterX) / eyeWidth;
  } catch {
    return 0;
  }
};

const handleFaces = (faces) => {
  if (!_callback) return;

  // No face → handled by existing no_face detector
  if (!faces || faces.length === 0) return;

  const face = faces[0];
  const keypoints = face.keypoints;
  if (!keypoints || keypoints.length < 478) return; // Need iris landmarks

  const gazeRatio = computeGazeRatio(keypoints);
  const headYaw = computeHeadYaw(keypoints);

  let isLookingAway = false;

  // Check gaze ratio
  if (gazeRatio !== null) {
    if (gazeRatio < GAZE_AWAY_THRESHOLD_LOW || gazeRatio > GAZE_AWAY_THRESHOLD_HIGH) {
      isLookingAway = true;
    }
  }

  // Check head yaw
  if (Math.abs(headYaw) > HEAD_YAW_THRESHOLD) {
    isLookingAway = true;
  }

  if (isLookingAway) {
    _consecutiveBad++;

    if (_consecutiveBad >= CONSECUTIVE_BAD_REQUIRED) {
      if (!_lookAwayStartTime) {
        _lookAwayStartTime = Date.now();
      }

      const duration = Date.now() - _lookAwayStartTime;
      if (duration >= LOOK_AWAY_DURATION_MS && !_firedForCurrentSession) {
        _callback({
          type: "gaze_deviation",
          details: `Student looking away from screen for ${Math.round(duration / 1000)}+ seconds`,
        });
        _firedForCurrentSession = true;
        // Reset after firing so it can detect again after student looks back
        setTimeout(() => {
          _firedForCurrentSession = false;
        }, 10000); // 10 second cooldown
      }
    }
  } else {
    // Student looking at screen — reset counters
    _consecutiveBad = Math.max(0, _consecutiveBad - 2); // Gradual recovery
    if (_consecutiveBad === 0) {
      _lookAwayStartTime = null;
      _firedForCurrentSession = false;
    }
  }
};

export const start = (callback) => {
  _callback = callback;
  _consecutiveBad = 0;
  _lookAwayStartTime = null;
  _firedForCurrentSession = false;

  registerConsumer(CONSUMER_NAME, handleFaces);
};

export const stop = () => {
  _callback = null;
  _consecutiveBad = 0;
  _lookAwayStartTime = null;
  _firedForCurrentSession = false;
  unregisterConsumer(CONSUMER_NAME);
};

const gazeDetector = { start, stop };
export default gazeDetector;
