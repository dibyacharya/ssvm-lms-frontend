/**
 * Shared FaceMesh Detection Loop
 * Runs FaceMesh inference once per cycle and dispatches landmarks
 * to registered consumers (liveness + gaze detectors).
 * Avoids running the model twice.
 */

import { loadFaceMeshModel } from "./faceMeshLoader";

let _consumers = new Map();
let _intervalId = null;
let _running = false;
let _videoEl = null;

const DETECTION_INTERVAL_MS = 500; // 2 FPS — enough for blink + gaze

const runDetection = async () => {
  if (!_running || !_videoEl || _consumers.size === 0) return;

  // Skip if video not ready
  if (_videoEl.readyState < 2 || _videoEl.videoWidth === 0) return;

  try {
    const model = await loadFaceMeshModel();
    const faces = await model.estimateFaces(_videoEl, {
      flipHorizontal: false,
    });

    // Dispatch to all registered consumers
    for (const [, callback] of _consumers) {
      try {
        callback(faces);
      } catch (err) {
        console.warn("[FaceMeshLoop] Consumer error:", err);
      }
    }
  } catch (err) {
    // Model inference failed — skip this cycle
    console.warn("[FaceMeshLoop] Detection error:", err);
  }
};

/**
 * Start the shared detection loop.
 * @param {HTMLVideoElement} videoEl - The video element showing webcam feed
 */
export const start = (videoEl) => {
  if (_running) return;
  _running = true;
  _videoEl = videoEl;

  _intervalId = setInterval(runDetection, DETECTION_INTERVAL_MS);
};

export const stop = () => {
  _running = false;
  _videoEl = null;
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
  _consumers.clear();
};

/**
 * Register a consumer that receives FaceMesh landmarks on each detection cycle.
 * @param {string} name - Unique consumer name (e.g., "liveness", "gaze")
 * @param {Function} callback - Receives array of face objects with keypoints
 */
export const registerConsumer = (name, callback) => {
  _consumers.set(name, callback);
};

export const unregisterConsumer = (name) => {
  _consumers.delete(name);
};

const faceMeshDetectionLoop = {
  start, stop, registerConsumer, unregisterConsumer,
};
export default faceMeshDetectionLoop;
