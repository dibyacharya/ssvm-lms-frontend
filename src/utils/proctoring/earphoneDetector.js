/**
 * Earphone / Headphone Detector
 * Uses navigator.mediaDevices.enumerateDevices() + devicechange event
 * to detect connected audio output devices (Bluetooth, wired headphones).
 */

const HEADPHONE_KEYWORDS = [
  "bluetooth", "airpod", "headphone", "earphone", "headset",
  "wireless", "buds", "beats", "bose", "jabra", "jbl",
  "sony wh", "sony wf", "galaxy buds", "pixel buds",
];

let _callback = null;
let _baselineDevices = [];
let _started = false;

const isHeadphone = (label) => {
  const lower = (label || "").toLowerCase();
  return HEADPHONE_KEYWORDS.some((kw) => lower.includes(kw));
};

const handleDeviceChange = async () => {
  if (!_callback) return;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioOutputs = devices.filter((d) => d.kind === "audiooutput");

    for (const device of audioOutputs) {
      const label = device.label || "";
      if (isHeadphone(label)) {
        const alreadyBaseline = _baselineDevices.some(
          (bd) => bd.deviceId === device.deviceId
        );
        if (!alreadyBaseline) {
          _callback({
            type: "earphone_detected",
            details: `Audio device connected: ${label || "Unknown headphone"}`,
          });
          // Add to baseline so we don't fire again for same device
          _baselineDevices.push(device);
          return;
        }
      }
    }

    // Also detect if new audio output devices appeared (even without keyword match)
    if (audioOutputs.length > _baselineDevices.length + 1) {
      _callback({
        type: "earphone_detected",
        details: "New audio output device connected during exam",
      });
    }
  } catch (err) {
    // Silently ignore — enumerateDevices may fail if permissions revoked
  }
};

/**
 * Check devices before exam start (lobby pre-check).
 * Returns { hasHeadphones, devices[] }
 */
export const checkDevices = async () => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioOutputs = devices.filter((d) => d.kind === "audiooutput");
    const headphones = audioOutputs.filter((d) => isHeadphone(d.label));
    return {
      hasHeadphones: headphones.length > 0,
      devices: headphones.map((d) => d.label || "Unknown"),
    };
  } catch {
    return { hasHeadphones: false, devices: [] };
  }
};

export const start = (callback) => {
  if (_started) return;
  _started = true;
  _callback = callback;

  // Capture baseline devices
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    _baselineDevices = devices.filter((d) => d.kind === "audiooutput");
  }).catch(() => {});

  navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
};

export const stop = () => {
  _started = false;
  _callback = null;
  _baselineDevices = [];
  navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
};

const earphoneDetector = { start, stop, checkDevices };
export default earphoneDetector;
