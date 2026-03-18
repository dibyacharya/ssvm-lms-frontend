import React, { useEffect, useState, useRef } from 'react';
import { FaExclamationTriangle, FaTimesCircle, FaBan } from 'react-icons/fa';

const VIOLATION_MESSAGES = {
  tab_switch: 'Tab switch detected! Stay on the exam window.',
  multiple_faces: 'Multiple faces detected! Only you should be visible.',
  no_face: 'No face detected! Make sure your camera can see you.',
  copy_paste: 'Copy/Paste attempted! This action is not allowed.',
  fullscreen_exit: 'Fullscreen exited! Return to fullscreen mode.',
  browser_resize: 'Browser was resized! Keep your browser maximized.',
  gaze_deviation: 'Looking away detected! Keep your eyes on the screen.',
  photo_spoofing: 'No blink detected! A live person must be visible.',
  phone_detected: 'Mobile phone detected! Remove all devices from view.',
  prohibited_object: 'Prohibited object detected near you!',
  earphone_detected: 'Earphone/Headphone detected! Remove all audio devices.',
  devtools_detected: 'Developer tools detected! Close developer tools immediately.',
  person_behind: 'Another person detected! Only you should be visible.',
  new_page_attempt: 'Attempted to open a new page! This is not allowed.',
  vm_detected: 'Virtual machine detected! Use a physical computer.',
};

const ViolationWarning = ({ violation, warningCount, maxWarnings, onDismiss }) => {
  const [countdown, setCountdown] = useState(5);
  const intervalRef = useRef(null);

  useEffect(() => {
    setCountdown(5);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          onDismiss?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [violation, onDismiss]);

  if (!violation) return null;

  const isLastWarning = warningCount >= maxWarnings - 1;
  const isFinal = warningCount >= maxWarnings;
  const effectiveMax = maxWarnings || 3;

  // Final auto-submit screen
  if (isFinal) {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-red-900/95">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
            <FaBan className="text-4xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-red-700 mb-3">
            Exam Auto-Submitted
          </h2>
          <p className="text-gray-600 mb-4">
            Your exam has been automatically submitted due to repeated violations.
          </p>
          <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
            {VIOLATION_MESSAGES[violation.type] || 'A violation was detected.'}
          </div>
          <p className="text-xs text-gray-400 mt-4">
            {effectiveMax} of {effectiveMax} warnings exceeded
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 select-none"
      style={{ pointerEvents: 'all' }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 ${
        isLastWarning ? 'border-red-500 animate-pulse' : 'border-amber-500'
      }`}>
        <div className="flex flex-col items-center text-center">
          {/* Warning Icon */}
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            isLastWarning ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            {isLastWarning ? (
              <FaTimesCircle className="text-4xl text-red-600" />
            ) : (
              <FaExclamationTriangle className="text-4xl text-amber-600" />
            )}
          </div>

          {/* Warning Title */}
          <h2 className={`text-2xl font-bold mb-1 ${
            isLastWarning ? 'text-red-700' : 'text-amber-700'
          }`}>
            Warning {warningCount} of {effectiveMax}
          </h2>

          {/* Violation Message */}
          <p className="text-gray-700 text-base mb-4 font-medium">
            {VIOLATION_MESSAGES[violation.type] || 'A violation was detected.'}
          </p>

          {/* Next violation warning */}
          {isLastWarning && (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-700 font-bold text-sm">
                ⚠ NEXT VIOLATION WILL AUTO-SUBMIT YOUR EXAM!
              </p>
            </div>
          )}

          {/* Warning Progress */}
          <div className="w-full mb-4">
            <div className="flex gap-2 justify-center">
              {Array.from({ length: effectiveMax }, (_, i) => (
                <div
                  key={i}
                  className={`w-10 h-3 rounded-full ${
                    i < warningCount
                      ? isLastWarning ? 'bg-red-500' : 'bg-amber-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Countdown - no dismiss button */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${
            isLastWarning ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
          }`}>
            {countdown}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            This warning will close in {countdown} seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViolationWarning;
