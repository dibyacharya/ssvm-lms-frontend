/**
 * Virtual Machine Detector
 * One-time check at exam lobby/start to detect if running in a VM.
 * Uses WebGL renderer fingerprinting + hardware checks.
 */

const VM_RENDERER_KEYWORDS = [
  "virtualbox", "vmware", "svga", "parallels", "hyper-v",
  "qemu", "xen", "mesa", "llvmpipe", "swiftshader",
  "softpipe", "virgl", "virtio", "bochs", "microsoft basic render",
  "chromium", "google swiftshader",
];

/**
 * Detect if the browser is running in a virtual machine.
 * Returns { isVM: boolean, confidence: number (0-1), details: string[] }
 */
export const detectVM = async () => {
  const details = [];
  let score = 0; // 0 to 100, higher = more likely VM

  // ── Strategy 1: WebGL renderer fingerprinting ──
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = (gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "").toLowerCase();
        const vendor = (gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || "").toLowerCase();

        for (const keyword of VM_RENDERER_KEYWORDS) {
          if (renderer.includes(keyword) || vendor.includes(keyword)) {
            score += 60;
            details.push(`WebGL renderer contains "${keyword}": ${renderer}`);
            break;
          }
        }
      } else {
        // No debug info available — suspicious but not conclusive
        score += 10;
        details.push("WebGL debug renderer info unavailable");
      }
    } else {
      score += 20;
      details.push("WebGL not available");
    }
  } catch (err) {
    details.push("WebGL check failed");
  }

  // ── Strategy 2: Hardware concurrency ──
  try {
    const cores = navigator.hardwareConcurrency;
    if (cores && cores <= 1) {
      score += 25;
      details.push(`Low CPU cores: ${cores} (VMs often have 1-2 cores)`);
    } else if (cores && cores <= 2) {
      score += 10;
      details.push(`Low CPU cores: ${cores}`);
    }
  } catch {
    // Ignore
  }

  // ── Strategy 3: Screen resolution check ──
  try {
    const w = screen.width;
    const h = screen.height;
    // Common VM default resolutions
    const vmResolutions = [
      [800, 600], [1024, 768], [1280, 800],
    ];
    const isVMRes = vmResolutions.some(([vw, vh]) => w === vw && h === vh);
    if (isVMRes && score > 0) {
      score += 10;
      details.push(`Common VM resolution detected: ${w}x${h}`);
    }
  } catch {
    // Ignore
  }

  // ── Strategy 4: Device memory (Chrome only) ──
  try {
    const memory = navigator.deviceMemory;
    if (memory && memory <= 2) {
      score += 10;
      details.push(`Low device memory: ${memory}GB`);
    }
  } catch {
    // Not supported in all browsers
  }

  const confidence = Math.min(score / 100, 1);
  return {
    isVM: confidence >= 0.5,
    confidence,
    details,
  };
};

const vmDetector = { detectVM };
export default vmDetector;
