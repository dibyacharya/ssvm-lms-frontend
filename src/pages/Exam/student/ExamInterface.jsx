import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaFlag, FaPaperPlane, FaShieldAlt } from 'react-icons/fa';
import {
  getExamForStudent,
  startExam,
  saveAnswer as saveAnswerAPI,
  submitExam as submitExamAPI,
  sendHeartbeat,
} from '../../../services/exam.service';
import QuestionRenderer from '../components/QuestionRenderer';
import QuestionNavigation from '../components/QuestionNavigation';
import ExamTimer from '../components/ExamTimer';
import ViolationWarning from '../components/ViolationWarning';
import ProctoringOverlay from '../components/ProctoringOverlay';
import toast from 'react-hot-toast';

const ExamInterface = () => {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [endsAt, setEndsAt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [violation, setViolation] = useState(null);
  const [warningCount, setWarningCount] = useState(0);
  const [maxWarnings, setMaxWarnings] = useState(5);

  // AI Proctoring state
  const [faceDetected, setFaceDetected] = useState(true);
  const [proctoringReady, setProctoringReady] = useState(false);

  const saveTimeoutRef = useRef(null);
  const heartbeatRef = useRef(null);
  const engineRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Load exam
  useEffect(() => {
    const init = async () => {
      try {
        if (location.state?.submission && location.state?.endsAt) {
          const data = await getExamForStudent(examId);
          setExam(data.exam);
          setEndsAt(location.state.endsAt);
          setSubmission(location.state.submission);

          const initialAnswers = data.exam.questions.map((q) => {
            const existing = location.state.submission.answers?.find(
              (a) => a.questionId === q._id
            );
            return {
              questionId: q._id,
              answer: existing?.answer || '',
              markedForReview: existing?.markedForReview || false,
            };
          });
          setAnswers(initialAnswers);
        } else {
          const data = await getExamForStudent(examId);
          setExam(data.exam);

          if (!data.canStart) {
            navigate(`/exam/${examId}/lobby`, { replace: true });
            return;
          }

          const startData = await startExam(examId);
          setSubmission(startData.submission);
          setEndsAt(startData.endsAt);

          const initialAnswers = data.exam.questions.map((q) => {
            const existing = startData.submission.answers?.find(
              (a) => a.questionId === q._id
            );
            return {
              questionId: q._id,
              answer: existing?.answer || '',
              markedForReview: existing?.markedForReview || false,
            };
          });
          setAnswers(initialAnswers);
        }
      } catch (err) {
        toast.error(err.response?.data?.error || 'Failed to load exam');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [examId]);

  // ─── AI Proctoring Engine ───
  useEffect(() => {
    if (!exam?.proctoring?.enabled) return;

    let cancelled = false;

    const startProctoring = async () => {
      // 1. Request camera access if face detection or screenshots are enabled
      if (exam.proctoring.faceDetection || exam.proctoring.periodicScreenshots) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240, facingMode: 'user' },
            audio: false,
          });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          streamRef.current = stream;
          // Let video element use it via ProctoringOverlay
        } catch (err) {
          console.warn('[Proctoring] Camera access denied:', err.message);
          toast.error('Camera access is required for proctored exams');
        }
      }

      // 2. Dynamically import ProctoringEngine (keeps TF.js lazy)
      try {
        const { default: ProctoringEngine } = await import(
          '../../../utils/proctoring/ProctoringEngine'
        );
        if (cancelled) return;

        // Create a video element ref for face detection
        // ProctoringEngine expects videoRef.current to be a <video> DOM node
        // We'll create a hidden video for the engine's face detection
        const hiddenVideo = document.createElement('video');
        hiddenVideo.autoplay = true;
        hiddenVideo.muted = true;
        hiddenVideo.playsInline = true;
        hiddenVideo.style.display = 'none';
        if (streamRef.current) {
          hiddenVideo.srcObject = streamRef.current;
          await hiddenVideo.play().catch(() => {});
        }
        document.body.appendChild(hiddenVideo);
        videoRef.current = hiddenVideo;

        const engine = new ProctoringEngine({
          config: exam.proctoring,
          videoRef: videoRef,
          examId,
          onViolation: (v) => {
            setViolation({ type: v.type, details: v.details });

            // Update face detection UI state
            if (v.type === 'no_face') {
              setFaceDetected(false);
            } else if (v.type === 'multiple_faces') {
              setFaceDetected(false);
            }
          },
          onWarning: (v, count, max) => {
            setWarningCount(count);
            setMaxWarnings(max);
          },
          onAutoSubmit: () => {
            toast.error('Maximum violations reached. Auto-submitting exam.');
            handleSubmit(true);
          },
        });

        await engine.start();
        engineRef.current = engine;
        setProctoringReady(true);

        // Periodically reset faceDetected to true (if engine keeps running without violations)
        const faceResetInterval = setInterval(() => {
          setFaceDetected(true);
        }, 5000);

        // Store for cleanup
        engineRef.current._faceResetInterval = faceResetInterval;
        engineRef.current._hiddenVideo = hiddenVideo;
      } catch (err) {
        console.error('[Proctoring] Engine start failed:', err);
      }
    };

    startProctoring();

    return () => {
      cancelled = true;
      // Stop engine
      if (engineRef.current) {
        if (engineRef.current._faceResetInterval) {
          clearInterval(engineRef.current._faceResetInterval);
        }
        if (engineRef.current._hiddenVideo) {
          engineRef.current._hiddenVideo.remove();
        }
        engineRef.current.stop();
        engineRef.current = null;
      }
      // Stop camera
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      // Exit fullscreen
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
      setProctoringReady(false);
    };
  }, [exam]);

  // Heartbeat every 30 seconds
  useEffect(() => {
    if (!exam) return;

    heartbeatRef.current = setInterval(() => {
      sendHeartbeat(examId, {
        currentQuestionIndex: currentIndex,
        answeredCount: answers.filter((a) => a.answer).length,
        violationCount: engineRef.current?.getViolationCount?.() || warningCount,
      }).catch(() => {});
    }, 30000);

    return () => clearInterval(heartbeatRef.current);
  }, [exam, currentIndex, answers, warningCount]);

  // Auto-save debounced
  const debouncedSave = useCallback(
    (qId, answer, markedForReview) => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        saveAnswerAPI(examId, { questionId: qId, answer, markedForReview }).catch(() => {});
      }, 2000);
    },
    [examId]
  );

  const handleAnswerChange = (answer) => {
    const q = exam.questions[currentIndex];
    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      ...newAnswers[currentIndex],
      answer,
    };
    setAnswers(newAnswers);
    debouncedSave(q._id, answer, newAnswers[currentIndex].markedForReview);
  };

  const toggleReview = () => {
    const q = exam.questions[currentIndex];
    const newAnswers = [...answers];
    newAnswers[currentIndex] = {
      ...newAnswers[currentIndex],
      markedForReview: !newAnswers[currentIndex].markedForReview,
    };
    setAnswers(newAnswers);
    debouncedSave(q._id, newAnswers[currentIndex].answer, newAnswers[currentIndex].markedForReview);
  };

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);

    try {
      // Save current answer first
      const currentAnswer = answers[currentIndex];
      if (currentAnswer?.answer) {
        await saveAnswerAPI(examId, {
          questionId: exam.questions[currentIndex]._id,
          answer: currentAnswer.answer,
          markedForReview: currentAnswer.markedForReview,
        }).catch(() => {});
      }

      // Stop proctoring before submit
      if (engineRef.current) {
        engineRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const result = await submitExamAPI(examId);
      toast.success(auto ? 'Exam auto-submitted' : 'Exam submitted successfully');

      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }

      navigate(`/exam/${examId}/result`, {
        state: { submission: result.submission },
        replace: true,
      });
    } catch (err) {
      toast.error('Failed to submit exam');
      setSubmitting(false);
    }
  };

  const handleTimeUp = () => {
    toast.error('Time is up! Auto-submitting...');
    handleSubmit(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary-400/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam) return null;

  const currentQuestion = exam.questions[currentIndex];
  const proctoringEnabled = exam.proctoring?.enabled;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col select-none">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
            {exam.title}
          </h1>
          {proctoringEnabled && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-red-900/40 text-red-600 rounded-full text-[10px] font-medium">
              <FaShieldAlt className="text-[8px]" /> AI Proctored
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {endsAt && <ExamTimer endsAt={endsAt} onTimeUp={handleTimeUp} />}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-gray-900 rounded-xl text-xs font-semibold hover:from-primary-700 hover:to-primary-600 transition-colors"
          >
            <FaPaperPlane className="text-[10px]" />
            Submit
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Question area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <QuestionRenderer
              question={currentQuestion}
              answer={answers[currentIndex]?.answer || ''}
              onAnswerChange={handleAnswerChange}
              index={currentIndex}
            />
          </motion.div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentIndex === 0
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FaArrowLeft className="text-xs" /> Previous
            </button>

            <button
              onClick={toggleReview}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors ${
                answers[currentIndex]?.markedForReview
                  ? 'bg-amber-900/40 text-amber-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <FaFlag className="text-[10px]" />
              {answers[currentIndex]?.markedForReview ? 'Unmark Review' : 'Mark for Review'}
            </button>

            <button
              onClick={() =>
                setCurrentIndex((i) => Math.min(exam.questions.length - 1, i + 1))
              }
              disabled={currentIndex === exam.questions.length - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                currentIndex === exam.questions.length - 1
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-primary-600 hover:bg-primary-50'
              }`}
            >
              Next <FaArrowRight className="text-xs" />
            </button>
          </div>
        </div>

        {/* Sidebar - Question navigation */}
        <div className="w-64 border-l border-gray-200 p-4 hidden lg:block overflow-y-auto">
          <QuestionNavigation
            questions={exam.questions}
            answers={answers}
            currentIndex={currentIndex}
            onNavigate={setCurrentIndex}
          />

          {/* Proctoring status in sidebar */}
          {proctoringEnabled && (
            <div className="mt-4 p-3 bg-gray-100 rounded-xl border border-gray-200">
              <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Proctoring Status
              </h4>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Face Detection</span>
                  <span className={`font-medium ${faceDetected ? 'text-primary-600' : 'text-red-600'}`}>
                    {faceDetected ? 'OK' : 'No Face'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Violations</span>
                  <span className={`font-medium ${warningCount > 0 ? 'text-red-600' : 'text-primary-600'}`}>
                    {warningCount} / {maxWarnings}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Engine</span>
                  <span className={`font-medium ${proctoringReady ? 'text-primary-600' : 'text-amber-600'}`}>
                    {proctoringReady ? 'Active' : 'Loading...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Proctoring Camera Overlay */}
      {proctoringEnabled && (exam.proctoring.faceDetection || exam.proctoring.periodicScreenshots) && (
        <ProctoringOverlay
          streamRef={streamRef}
          faceDetected={faceDetected}
          violationCount={warningCount}
          maxWarnings={maxWarnings}
        />
      )}

      {/* Submit confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-gray-50/20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-card border border-gray-200 p-6 max-w-sm w-full mx-4"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-2">Submit Exam?</h3>
            <div className="text-sm text-gray-600 mb-4 space-y-1">
              <p>Answered: {answers.filter((a) => a.answer).length} / {exam.questions.length}</p>
              <p>Marked for review: {answers.filter((a) => a.markedForReview).length}</p>
              <p>Not answered: {answers.filter((a) => !a.answer).length}</p>
            </div>
            <p className="text-xs text-red-600 mb-4">
              Once submitted, you cannot change your answers.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleSubmit();
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-gray-900 rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600"
              >
                {submitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Violation warning */}
      {violation && (
        <ViolationWarning
          violation={violation}
          warningCount={warningCount}
          maxWarnings={maxWarnings}
          onDismiss={() => setViolation(null)}
        />
      )}
    </div>
  );
};

export default ExamInterface;
