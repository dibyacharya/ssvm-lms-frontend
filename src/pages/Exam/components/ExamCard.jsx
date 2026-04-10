import React from 'react';
import { FaClock, FaCheckCircle, FaExclamationTriangle, FaPlay, FaBan } from 'react-icons/fa';

const STATUS_CONFIG = {
  draft: { label: 'Draft', icon: FaClock, color: 'bg-gray-100 text-gray-500', dot: 'bg-surface-500' },
  scheduled: { label: 'Scheduled', icon: FaClock, color: 'bg-primary-50 text-primary-600', dot: 'bg-primary-500' },
  live: { label: 'Live Now', icon: FaPlay, color: 'bg-primary-50 text-primary-600', dot: 'bg-primary-500 animate-pulse' },
  completed: { label: 'Completed', icon: FaCheckCircle, color: 'bg-emerald-900/30 text-emerald-600', dot: 'bg-emerald-500' },
  cancelled: { label: 'Cancelled', icon: FaBan, color: 'bg-red-50 text-red-600', dot: 'bg-red-500' },
};

const TYPE_LABELS = {
  mid_term: 'Mid Term',
  end_term: 'End Term',
  quiz: 'Quiz',
  practice: 'Practice',
  re_exam: 'Re-Exam',
};

const ExamCard = ({ exam, onClick, role = 'student' }) => {
  const config = STATUS_CONFIG[exam.status] || STATUS_CONFIG.draft;
  const StatusIcon = config.icon;

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : '-';

  const isLive = exam.status === 'live';

  return (
    <div
      onClick={() => onClick?.(exam)}
      className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200 p-5 shadow-card-sm hover:shadow-card transition-all cursor-pointer ${
        isLive ? 'ring-2 ring-primary-500/30' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-semibold text-base truncate">{exam.title}</h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {TYPE_LABELS[exam.examType] || exam.examType} &middot; {exam.duration} min
          </p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${config.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
          {config.label}
        </span>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <span className="text-gray-400">Start</span>
          <p className="text-gray-600 font-medium">{formatDate(exam.scheduledStartTime)}</p>
        </div>
        <div>
          <span className="text-gray-400">End</span>
          <p className="text-gray-600 font-medium">{formatDate(exam.scheduledEndTime)}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <span>{exam.questionCount || exam.questions?.length || 0} Questions</span>
          <span>{exam.totalPoints} Points</span>
        </div>
        {exam.proctoring?.enabled && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-600 border border-red-500/20">
            Proctored
          </span>
        )}
      </div>

      {/* Submission stats for teacher */}
      {role === 'teacher' && exam.submissionStats && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
          {exam.submissionStats.submitted}/{exam.submissionStats.total} submitted
        </div>
      )}
    </div>
  );
};

export default ExamCard;
