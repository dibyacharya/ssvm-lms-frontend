/**
 * Face Detector — TensorFlow.js BlazeFace
 * Lazy-loads model on first use. Detects faces in camera video feed.
 */

let blazeface = null;
let model = null;
let loadingPromise = null;

const loadModel = async () => {
  if (model) return model;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    // Dynamic imports — only loaded when proctoring is enabled
    const tf = await import('@tensorflow/tfjs');
    blazeface = await import('@tensorflow-models/blazeface');

    // Prefer WebGL for GPU acceleration, fall back to CPU
    await tf.ready();
    console.log('[Proctoring] TF.js backend:', tf.getBackend());

    model = await blazeface.load();
    console.log('[Proctoring] BlazeFace model loaded');
    return model;
  })();

  return loadingPromise;
};

/**
 * Detect faces from a video element.
 * @param {HTMLVideoElement} videoEl - Camera feed video element
 * @returns {Promise<{ faces: number, confidence: number, predictions: Array }>}
 */
export const detectFaces = async (videoEl) => {
  if (!videoEl || videoEl.readyState < 2) {
    return { faces: 0, confidence: 0, predictions: [] };
  }

  try {
    const m = await loadModel();
    const predictions = await m.estimateFaces(videoEl, false /* returnTensors */);

    const faces = predictions.length;
    const confidence = faces > 0
      ? predictions.reduce((sum, p) => sum + (p.probability?.[0] || p.probability || 0), 0) / faces
      : 0;

    return { faces, confidence, predictions };
  } catch (err) {
    console.warn('[Proctoring] Face detection error:', err.message);
    return { faces: 0, confidence: 0, predictions: [] };
  }
};

/**
 * Check if model is loaded and ready
 */
export const isModelReady = () => !!model;

/**
 * Preload the model (call during lobby/setup)
 */
export const preloadModel = async () => {
  try {
    await loadModel();
    return true;
  } catch (err) {
    console.error('[Proctoring] Failed to preload BlazeFace:', err);
    return false;
  }
};

export default { detectFaces, isModelReady, preloadModel };
