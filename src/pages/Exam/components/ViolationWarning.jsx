import React, { useEffect, useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const VIOLATION_MESSAGES = {
  tab_switch: 'Tab switch detected! Stay on the exam window.',
  multiple_faces: 'Multiple faces detected! Only you should be visible.',
  no_face: 'No face detected! Make sure your camera can see you.',
  copy_paste: 'Copy/Paste attempted! This action is not allowed.',
  fullscreen_exit: 'Fullscreen exited! Return to fullscreen mode.',
  browser_resize: 'Browser was resized! Keep your browser maximized.',
};

const ViolationWarning = ({ violation, warningCount, maxWarnings, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!visible || !violation) return null;

  const isNearMax = warningCount >= maxWarnings - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border-2 ${
        isNearMax ? 'border-red-500' : 'border-amber-500'
      }`}>
        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
            isNearMax ? 'bg-red-100' : 'bg-amber-100'
          }`}>
            <FaExclamationTriangle className={`text-2xl ${
              isNearMax ? 'text-red-600' : 'text-amber-600'
            }`} />
          </div>

          <h3 className={`text-lg font-bold mb-2 ${
            isNearMax ? 'text-red-700' : 'text-amber-700'
          }`}>
            Warning #{warningCount}
          </h3>

          <p className="text-gray-600 text-sm mb-3">
            {VIOLATION_MESSAGES[violation.type] || 'A violation was detected.'}
          </p>

          <div className={`w-full rounded-lg p-3 text-xs font-medium ${
            isNearMax ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
          }`}>
            {warningCount} of {maxWarnings} warnings used
            {isNearMax && (
              <p className="mt-1 font-bold">
                Next violation will auto-submit your exam!
              </p>
            )}
          </div>

          <button
            onClick={() => {
              setVisible(false);
              onDismiss?.();
            }}
            className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViolationWarning;
