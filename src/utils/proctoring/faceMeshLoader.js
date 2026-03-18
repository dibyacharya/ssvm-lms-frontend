/**
 * Shared FaceMesh Model Loader (Singleton)
 * Loads MediaPipe FaceMesh model with 478 landmarks (468 face + 10 iris).
 * Shared between livenessDetector and gazeDetector.
 */

let _model = null;
let _loadingPromise = null;

/**
 * Lazy-load and return the FaceMesh model.
 * Uses @tensorflow-models/face-landmarks-detection with MediaPipe runtime.
 */
export const loadFaceMeshModel = async () => {
  if (_model) return _model;
  if (_loadingPromise) return _loadingPromise;

  _loadingPromise = (async () => {
    try {
      // Ensure TF.js is loaded
      await import("@tensorflow/tfjs");

      const faceLandmarksDetection = await import(
        "@tensorflow-models/face-landmarks-detection"
      );

      _model = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: "tfjs",
          refineLandmarks: true, // Enables iris landmarks (468-477)
          maxFaces: 2,           // Detect up to 2 faces
        }
      );

      return _model;
    } catch (err) {
      console.error("[FaceMeshLoader] Failed to load model:", err);
      _loadingPromise = null;
      throw err;
    }
  })();

  return _loadingPromise;
};

export const isReady = () => !!_model;

export const preload = () => loadFaceMeshModel();

export const dispose = () => {
  if (_model) {
    try {
      _model.dispose?.();
    } catch {
      // Ignore disposal errors
    }
    _model = null;
    _loadingPromise = null;
  }
};

const faceMeshLoader = { loadFaceMeshModel, isReady, preload, dispose };
export default faceMeshLoader;
