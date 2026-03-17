/**
 * Proctoring Engine — Main Orchestrator
 * Initializes and manages all proctoring detectors and reporters.
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
      maxWarnings: this.config.maxWarnings || 5,
      onWarning: this.onWarning,
      onAutoSubmit: this.config.autoSubmitOnMaxViolations ? this.onAutoSubmit : null,
    });

    // Combined violation handler
    const handleViolation = async (violation) => {
      const result = violationManager.addViolation(violation);

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

    // 4. Face detection (periodic)
    if (this.config.faceDetection && this.videoRef?.current) {
      await preloadModel();
      this.faceDetectionInterval = setInterval(async () => {
        if (!this.running || !this.videoRef?.current) return;

        const result = await detectFaces(this.videoRef.current);

        // Log face detection (fire-and-forget for face log)
        // Only report violations
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
      }, 3000); // Every 3 seconds
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

    console.log('[ProctoringEngine] All detectors started');
  }

  /**
   * Stop all proctoring features.
   */
  stop() {
    this.running = false;

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
