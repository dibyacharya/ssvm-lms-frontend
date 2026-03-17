import React, { useRef, useEffect, useState } from 'react';
import { FaVideo, FaVideoSlash } from 'react-icons/fa';

/**
 * ProctoringOverlay — Small camera preview in corner of exam interface.
 * Shows green border when face is detected, red when not.
 *
 * Props:
 *   streamRef - React ref to MediaStream (camera)
 *   faceDetected - boolean (from face detection loop)
 *   violationCount - number
 *   maxWarnings - number
 */
const ProctoringOverlay = ({ streamRef, faceDetected = true, violationCount = 0, maxWarnings = 5 }) => {
  const videoRef = useRef(null);
  const [cameraOk, setCameraOk] = useState(false);

  useEffect(() => {
    if (videoRef.current && streamRef?.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
      setCameraOk(true);
    }
  }, [streamRef?.current]);

  const borderColor = !cameraOk ? 'border-gray-500' :
    faceDetected ? 'border-emerald-500' : 'border-red-500';

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className={`relative rounded-xl overflow-hidden border-2 ${borderColor} shadow-lg bg-black`} style={{ width: 160, height: 120 }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Status indicator */}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
          {cameraOk ? (
            <div className="flex items-center gap-1 bg-black/50 rounded-full px-1.5 py-0.5">
              <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
              <span className="text-[8px] text-white font-medium">
                {faceDetected ? 'OK' : 'No Face'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-black/50 rounded-full px-1.5 py-0.5">
              <FaVideoSlash className="text-[8px] text-red-400" />
              <span className="text-[8px] text-red-400">No Camera</span>
            </div>
          )}
        </div>

        {/* Violation counter */}
        {violationCount > 0 && (
          <div className="absolute bottom-1.5 right-1.5 bg-red-500/90 rounded-full px-1.5 py-0.5">
            <span className="text-[8px] text-white font-bold">{violationCount}/{maxWarnings}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProctoringOverlay;
