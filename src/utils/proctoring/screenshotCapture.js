/**
 * Screenshot Capture
 * Captures frame from video element and converts to blob.
 */

/**
 * Capture a frame from a video element as a JPEG blob.
 * @param {HTMLVideoElement} videoEl - Camera feed video element
 * @param {number} quality - JPEG quality 0-1 (default: 0.6)
 * @returns {Promise<Blob|null>}
 */
export const captureFrame = async (videoEl, quality = 0.6) => {
  if (!videoEl || videoEl.readyState < 2) return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth || 320;
    canvas.height = videoEl.videoHeight || 240;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        quality
      );
    });
  } catch (err) {
    console.warn('[Proctoring] Screenshot capture failed:', err.message);
    return null;
  }
};

export default { captureFrame };
