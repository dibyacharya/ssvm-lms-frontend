import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaClock, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { getMySubmission } from '../../../services/exam.service';

const ExamResult = () => {
  const { examId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(location.state?.submission || null);
  const [loading, setLoading] = useState(!location.state?.submission);

  useEffect(() => {
    if (!submission) {
      loadSubmission();
    }
  }, [examId]);

  const loadSubmission = async () => {
    try {
      const data = await getMySubmission(examId);
      setSubmission(data.submission);
    } catch (err) {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-8 text-center"
      >
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FaCheckCircle className="text-emerald-600 text-3xl" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Submitted!</h1>

        {submission?.message ? (
          <p className="text-gray-500 text-sm mb-6">{submission.message}</p>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-6">
              Your answers have been recorded successfully.
            </p>

            {submission?.totalScore != null && (
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-3xl font-bold text-indigo-600">{submission.totalScore}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {submission.percentage != null && `${submission.percentage}%`}
                  {submission.grade && ` | Grade: ${submission.grade}`}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs mb-6">
              {submission?.objectiveScore != null && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-blue-600 font-semibold">{submission.objectiveScore}</p>
                  <p className="text-blue-500">Objective Score</p>
                </div>
              )}
              {submission?.timeSpentSeconds != null && (
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-purple-600 font-semibold">
                    {Math.round(submission.timeSpentSeconds / 60)} min
                  </p>
                  <p className="text-purple-500">Time Spent</p>
                </div>
              )}
            </div>

            {submission?.autoSubmitted && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700 mb-4 flex items-center gap-2">
                <FaClock /> This exam was auto-submitted
              </div>
            )}
          </>
        )}

        {submission?.status === 'submitted' && (
          <p className="text-xs text-gray-400 mb-4 flex items-center justify-center gap-1">
            <FaClock /> Results pending teacher review
          </p>
        )}

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <FaArrowLeft className="text-xs" /> Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
};

export default ExamResult;
