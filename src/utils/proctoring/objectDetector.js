/**
 * Object Detector (Phone, Book, Person-Behind)
 * Uses COCO-SSD (MobileNetV2) to detect prohibited objects
 * and additional persons in the webcam feed.
 * Runs every 5 seconds.
 */

let _model = null;
let _loadingPromise = null;
let _callback = null;
let _intervalId = null;
let _videoEl = null;
let _running = false;

const DETECTION_INTERVAL_MS = 5000; // Every 5 seconds
const OBJECT_CONFIDENCE = 0.6;
const PERSON_CONFIDENCE = 0.5;

// COCO-SSD classes to watch for
const PROHIBITED_OBJECTS = {
  "cell phone": { type: "phone_detected", label: "Mobile phone" },
  "book": { type: "prohibited_object", label: "Book" },
  "laptop": { type: "prohibited_object", label: "Laptop/second screen" },
  "remote": { type: "prohibited_object", label: "Remote control" },
  "mouse": null,     // Ignore — student needs a mouse
  "keyboard": null,  // Ignore — student needs a keyboard
};

const loadModel = async () => {
  if (_model) return _model;
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = (async () => {
    try {
      await import("@tensorflow/tfjs");
      const cocoSsd = await import("@tensorflow-models/coco-ssd");
      _model = await cocoSsd.load({
        base: "mobilenet_v2",
      });
      return _model;
    } catch (err) {
      console.error("[ObjectDetector] Failed to load COCO-SSD:", err);
      _loadingPromise = null;
      throw err;
    }
  })();

  return _loadingPromise;
};

const runDetection = async () => {
  if (!_running || !_videoEl || !_callback) return;
  if (_videoEl.readyState < 2 || _videoEl.videoWidth === 0) return;

  try {
    const model = await loadModel();
    const predictions = await model.detect(_videoEl);

    let personCount = 0;

    for (const pred of predictions) {
      const className = pred.class;
      const score = pred.score;

      // Count persons
      if (className === "person") {
        if (score >= PERSON_CONFIDENCE) {
          personCount++;
        }
        continue;
      }

      // Check prohibited objects
      const config = PROHIBITED_OBJECTS[className];
      if (config && score >= OBJECT_CONFIDENCE) {
        _callback({
          type: config.type,
          details: `${config.label} detected near student (confidence: ${Math.round(score * 100)}%)`,
        });
      }
    }

    // Multiple persons detected (student + someone behind/beside)
    if (personCount > 1) {
      _callback({
        type: "person_behind",
        details: `${personCount} people detected — only the student should be visible`,
      });
    }
  } catch (err) {
    console.warn("[ObjectDetector] Detection error:", err);
  }
};

export const preloadModel = () => loadModel();

export const start = (videoEl, callback) => {
  if (_running) return;
  _running = true;
  _videoEl = videoEl;
  _callback = callback;

  _intervalId = setInterval(runDetection, DETECTION_INTERVAL_MS);
};

export const stop = () => {
  _running = false;
  _videoEl = null;
  _callback = null;
  if (_intervalId) {
    clearInterval(_intervalId);
    _intervalId = null;
  }
};

const objectDetector = { start, stop, preloadModel };
export default objectDetector;
