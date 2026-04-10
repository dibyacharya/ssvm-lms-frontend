/**
 * Proctoring Engine — Main Orchestrator
 * Initializes and manages all proctoring detectors and reporters.
 *
 * Detectors:
 *   Core: faceDetection, tabSwitch, copyPaste, fullscreen, screenshots
 *   Advanced: liveness (blink/EAR), gaze tracking, object detection (COCO-SSD),
 *             earphone detection, devTools detection, newPage blocker, VM detection
 *
 * Usage:
 *   import ProctoringEngine from './ProctoringEngine';
 *   const engine = new ProctoringEngine({ config, videoRef, examId, onViolation, onWarning, onAutoSubmit });
 *   await engine.start();
 *   // ... exam in progress ...
 *   engine.stop();
 */

import { detectFaces, preloadModel } from './faceDetector';
import tabSwitchDetector from './tabSwitchDetector';
import copyPasteDetector from './copyPasteDetector';
import fullScreenManager from './fullScreenManager';
import { captureFrame } from './screenshotCapture';
import violationManager from './violationManager';
import lockdownManager from './lockdownManager';
import * as examService from '../../services/exam.service';

class ProctoringEngine {
  constructor({
    config = {},       // exam.proctoring object
    videoRef = null,   // React ref to <video> element
    examId = '',
    onViolation = null,  // (violation) => void — for UI feedback
    onWarning = null,    // (violation, count, max) => void — for showing warning modal
    onAutoSubmit = null, // () => void — called when max violations reached
  }) {
    this.config = config;
    this.videoRef = videoRef;
    this.examId = examId;
    this.onViolation = onViolation;
    this.onWarning = onWarning;
    this.onAutoSubmit = onAutoSubmit;

    this.faceDetectionInterval = null;
    this.screenshotInterval = null;
    this.running = false;

    // Lockdown cleanup reference
    this._lockdownCleanup = null;

    // Advanced detector references
    this._livenessDetector = null;
    this._gazeDetector = null;
    this._objectDetector = null;
    this._earphoneDetector = null;
    this._devToolsDetector = null;
    this._newPageBlocker = null;
    this._faceMeshLoop = null;
  }

  /**
   * Start all enabled proctoring features.
   */
  async start() {
    if (this.running) return;
    this.running = true;

    console.log('[ProctoringEngine] Starting with config:', this.config);

    // Initialize violation manager
    violationManager.init({
      maxWarnings: this.config.maxWarnings || 3,
      onWarning: this.onWarning,
      onAutoSubmit: this.config.autoSubmitOnMaxViolations ? this.onAutoSubmit : null,
    });

    // Combined violation handler
    const handleViolation = async (violation) => {
      violationManager.addViolation(violation);

      // Notify UI
      if (this.onViolation) this.onViolation(violation);

      // Send to backend (fire-and-forget)
      try {
        await examService.logViolation(this.examId, {
          type: violation.type,
          details: violation.details,
        });
      } catch { /* silent — don't disrupt exam */ }
    };

    // ═══════════════════════════════════════════
    // CORE DETECTORS (existing)
    // ═══════════════════════════════════════════

    // 1. Tab switch detection
    if (this.config.tabSwitchDetection) {
      tabSwitchDetector.start(handleViolation);
    }

    // 2. Copy/paste detection
    if (this.config.copyPasteDetection) {
      copyPasteDetector.start(handleViolation);
    }

    // 3. Fullscreen enforcement
    if (this.config.fullScreenEnforcement) {
      fullScreenManager.start(handleViolation);
    }

    // 4. Face detection (periodic via BlazeFace)
    // Skip BlazeFace if liveness/gaze is enabled (FaceMesh handles face counting)
    const useFaceMesh = this.config.livenessDetection || this.config.gazeTracking;
    if (this.config.faceDetection && this.videoRef?.current && !useFaceMesh) {
      await preloadModel();
      this.faceDetectionInterval = setInterval(async () => {
        if (!this.running || !this.videoRef?.current) return;

        const result = await detectFaces(this.videoRef.current);

        if (result.faces === 0) {
          handleViolation({
            type: 'no_face',
            details: 'No face detected in camera feed',
            timestamp: new Date().toISOString(),
          });
        } else if (this.config.multipleFaceDetection && result.faces > 1) {
          handleViolation({
            type: 'multiple_faces',
            details: `${result.faces} faces detected in camera feed`,
            timestamp: new Date().toISOString(),
          });
        }
      }, 3000);
    }

    // 5. Periodic screenshots
    if (this.config.periodicScreenshots && this.videoRef?.current) {
      const intervalSec = this.config.screenshotIntervalSeconds || 30;
      this.screenshotInterval = setInterval(async () => {
        if (!this.running || !this.videoRef?.current) return;

        const blob = await captureFrame(this.videoRef.current);
        if (blob) {
          try {
            await examService.uploadProctoringScreenshot(this.examId, blob);
          } catch { /* silent */ }
        }
      }, intervalSec * 1000);
    }

    // ═══════════════════════════════════════════
    // ADVANCED DETECTORS (new)
    // ═══════════════════════════════════════════

    // 6. New page prevention
    if (this.config.newPagePrevention) {
      try {
        const newPageBlocker = await import('./newPageBlocker');
        newPageBlocker.start(handleViolation);
        this._newPageBlocker = newPageBlocker;
      } catch (err) {
        console.warn('[ProctoringEngine] newPageBlocker load failed:', err);
      }
    }

    // 7. Earphone detection
    if (this.config.earphoneDetection) {
      try {
        const earphoneDetector = await import('./earphoneDetector');
        earphoneDetector.start(handleViolation);
        this._earphoneDetector = earphoneDetector;
      } catch (err) {
        console.warn('[ProctoringEngine] earphoneDetector load failed:', err);
      }
    }

    // 8. DevTools detection
    if (this.config.devToolsDetection) {
      try {
        const devToolsDetector = await import('./devToolsDetector');
        devToolsDetector.start(handleViolation);
        this._devToolsDetector = devToolsDetector;
      } catch (err) {
        console.warn('[ProctoringEngine] devToolsDetector load failed:', err);
      }
    }

    // 9. VM detection (one-time check)
    if (this.config.vmDetection) {
      try {
        const vmDetector = await import('./vmDetector');
        const vmResult = await vmDetector.detectVM();
        if (vmResult.isVM) {
          handleViolation({
            type: 'vm_detected',
            details: `Virtual machine detected (confidence: ${Math.round(vmResult.confidence * 100)}%). ${vmResult.details.join('; ')}`,
          });
        }
      } catch (err) {
        console.warn('[ProctoringEngine] vmDetector check failed:', err);
      }
    }

    // 10. Shared FaceMesh detection loop (for liveness + gaze)
    if (useFaceMesh && this.videoRef?.current) {
      try {
        const faceMeshLoader = await import('./faceMeshLoader');
        await faceMeshLoader.preload();

        const faceMeshLoop = await import('./faceMeshDetectionLoop');
        faceMeshLoop.start(this.videoRef.current);
        this._faceMeshLoop = faceMeshLoop;

        // Register face counting consumer (replaces BlazeFace when FaceMesh is active)
        if (this.config.faceDetection) {
          faceMeshLoop.registerConsumer('faceCount', (faces) => {
            if (!this.running) return;
            if (!faces || faces.length === 0) {
              handleViolation({
                type: 'no_face',
                details: 'No face detected in camera feed',
                timestamp: new Date().toISOString(),
              });
            } else if (this.config.multipleFaceDetection && faces.length > 1) {
              handleViolation({
                type: 'multiple_faces',
                details: `${faces.length} faces detected in camera feed`,
                timestamp: new Date().toISOString(),
              });
            }
          });
        }

        // 11. Liveness detection (blink/EAR)
        if (this.config.livenessDetection) {
          const livenessDetector = await import('./livenessDetector');
          livenessDetector.start(handleViolation);
          this._livenessDetector = livenessDetector;
        }

        // 12. Gaze tracking
        if (this.config.gazeTracking) {
          const gazeDetector = await import('./gazeDetector');
          gazeDetector.start(handleViolation);
          this._gazeDetector = gazeDetector;
        }
      } catch (err) {
        console.warn('[ProctoringEngine] FaceMesh detectors failed:', err);
      }
    }

    // 13. Object detection (COCO-SSD)
    if (this.config.objectDetection && this.videoRef?.current) {
      try {
        const objectDetector = await import('./objectDetector');
        await objectDetector.preloadModel();
        objectDetector.start(this.videoRef.current, handleViolation);
        this._objectDetector = objectDetector;
      } catch (err) {
        console.warn('[ProctoringEngine] objectDetector load failed:', err);
      }
    }

    // ═══════════════════════════════════════════
    // LOCKDOWN MODE
    // ═══════════════════════════════════════════

    // 14. Full exam lockdown (right-click, shortcuts, text selection, etc.)
    if (this.config.lockdownMode) {
      this._lockdownCleanup = lockdownManager.activate(handleViolation);
    }

    console.log('[ProctoringEngine] All detectors started');
  }

  /**
   * Stop all proctoring features.
   */
  stop() {
    this.running = false;

    // Core detectors
    tabSwitchDetector.stop();
    copyPasteDetector.stop();
    fullScreenManager.stop();

    if (this.faceDetectionInterval) {
      clearInterval(this.faceDetectionInterval);
      this.faceDetectionInterval = null;
    }
    if (this.screenshotInterval) {
      clearInterval(this.screenshotInterval);
      this.screenshotInterval = null;
    }

    // Lockdown mode
    if (this._lockdownCleanup) {
      this._lockdownCleanup();
      this._lockdownCleanup = null;
    }

    // Advanced detectors
    this._newPageBlocker?.stop?.();
    this._earphoneDetector?.stop?.();
    this._devToolsDetector?.stop?.();
    this._livenessDetector?.stop?.();
    this._gazeDetector?.stop?.();
    this._objectDetector?.stop?.();
    this._faceMeshLoop?.stop?.();

    this._newPageBlocker = null;
    this._earphoneDetector = null;
    this._devToolsDetector = null;
    this._livenessDetector = null;
    this._gazeDetector = null;
    this._objectDetector = null;
    this._faceMeshLoop = null;

    violationManager.reset();
    console.log('[ProctoringEngine] All detectors stopped');
  }

  /**
   * Get current violation count.
   */
  getViolationCount() {
    return violationManager.getViolationCount();
  }
}

export default ProctoringEngine;
