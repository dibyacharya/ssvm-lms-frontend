import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCamera, FaShieldAlt, FaClock, FaPlay, FaExclamationTriangle } from 'react-icons/fa';
import { getExamForStudent, startExam } from '../../../services/exam.service';
import toast from 'react-hot-toast';

const ExamLobby = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [starting, setStarting] = useState(false);
  const [canStart, setCanStart] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadExam();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [examId]);

  const loadExam = async () => {
    try {
      const data = await getExamForStudent(examId);
      setExam(data.exam);
      setCanStart(data.canStart);

      if (data.existingSubmission?.status === 'in_progress') {
        // Resume
        navigate(`/exam/${examId}/take`, { replace: true });
        return;
      }

      // Setup camera if proctoring enabled
      if (data.exam?.proctoring?.enabled) {
        await setupCamera();
      } else {
        setCameraReady(true);
      }
    } catch (err) {
      toast.error('Failed to load exam');
    } finally {
      setLoading(false);
    }
  };

  const setupCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
    } catch (err) {
      setCameraError('Camera access denied. Please allow camera to take proctored exams.');
    }
  };

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);

    try {
      const data = await startExam(examId);
      // Navigate to exam interface with endsAt
      navigate(`/exam/${examId}/take`, {
        state: { endsAt: data.endsAt, submission: data.submission },
        replace: true,
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start exam');
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Exam not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-2xl w-full overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 p-6 text-white">
          <h1 className="text-xl font-bold">{exam.title}</h1>
          <p className="text-indigo-200 text-sm mt-1">
            {exam.examType?.replace('_', ' ').toUpperCase()} &middot; {exam.duration} minutes
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          {exam.instructions && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">Instructions</h3>
              <p className="text-xs text-amber-700 whitespace-pre-wrap">{exam.instructions}</p>
            </div>
          )}

          {/* Exam details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                <FaClock /> Duration
              </div>
              <p className="text-gray-900 font-semibold">{exam.duration} minutes</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-600 text-xs mb-1">
                <FaShieldAlt /> Questions
              </div>
              <p className="text-gray-900 font-semibold">
                {exam.questions?.length || exam.randomConfig?.totalQuestions || 0} questions
              </p>
            </div>
          </div>

          {/* Proctoring camera check */}
          {exam.proctoring?.enabled && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <FaCamera /> Camera Check
              </h3>

              {cameraError ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                  <FaExclamationTriangle className="text-red-500 text-2xl mx-auto mb-2" />
                  <p className="text-red-700 text-sm">{cameraError}</p>
                  <button
                    onClick={setupCamera}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="relative bg-black rounded-xl overflow-hidden" style={{ maxHeight: 200 }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  {cameraReady && (
                    <div className="absolute top-2 right-2 px-2 py-1 bg-emerald-500 text-white rounded-full text-[10px] font-medium">
                      Camera Ready
                    </div>
                  )}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                <p className="font-semibold mb-1">Proctoring Rules:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {exam.proctoring.faceDetection && <li>Keep your face visible at all times</li>}
                  {exam.proctoring.tabSwitchDetection && <li>Do not switch tabs or windows</li>}
                  {exam.proctoring.copyPasteDetection && <li>Copy/paste is disabled</li>}
                  {exam.proctoring.fullScreenEnforcement && <li>Exam runs in fullscreen mode</li>}
                  <li>Max {exam.proctoring.maxWarnings} warnings before auto-submit</li>
                </ul>
              </div>
            </div>
          )}

          {/* Start button */}
          <div className="flex items-center justify-center pt-4">
            {canStart ? (
              <button
                onClick={handleStart}
                disabled={starting || (exam.proctoring?.enabled && !cameraReady)}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold transition-all ${
                  starting || (exam.proctoring?.enabled && !cameraReady)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25'
                }`}
              >
                {starting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <FaPlay /> Start Exam
                  </>
                )}
              </button>
            ) : (
              <div className="text-center text-gray-500 text-sm">
                <FaClock className="mx-auto text-2xl mb-2 text-gray-300" />
                <p>Exam is not available yet</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExamLobby;
