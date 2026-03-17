import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft, FaEdit, FaTrash, FaPlay, FaBan, FaFileExport, FaChartBar,
  FaUsers, FaEye, FaCheck, FaTimes, FaFlag, FaClock, FaShieldAlt, FaDownload,
  FaClipboardList, FaGraduationCap, FaDesktop
} from 'react-icons/fa';
import * as examService from '../../../services/exam.service';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'overview', label: 'Overview', icon: FaClipboardList },
  { id: 'questions', label: 'Questions', icon: FaClipboardList },
  { id: 'submissions', label: 'Submissions', icon: FaUsers },
  { id: 'analytics', label: 'Analytics', icon: FaChartBar },
];

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  scheduled: 'bg-blue-100 text-blue-700',
  live: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-red-100 text-red-700',
};

const difficultyColors = { easy: 'text-emerald-600 bg-emerald-50', medium: 'text-amber-600 bg-amber-50', hard: 'text-red-600 bg-red-50' };
const submissionStatusColors = {
  in_progress: 'bg-blue-100 text-blue-700',
  submitted: 'bg-amber-100 text-amber-700',
  graded: 'bg-emerald-100 text-emerald-700',
  flagged: 'bg-red-100 text-red-700',
  invalidated: 'bg-gray-100 text-gray-700',
};

const ExamDetail = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [finalizing, setFinalizing] = useState(false);

  useEffect(() => { loadExam(); }, [examId]);
  useEffect(() => {
    if (activeTab === 'submissions') loadSubmissions();
    if (activeTab === 'analytics') loadAnalytics();
  }, [activeTab, examId]);

  const loadExam = async () => {
    try {
      setLoading(true);
      const data = await examService.getExamById(examId);
      setExam(data.exam);
    } catch { toast.error('Failed to load exam'); }
    finally { setLoading(false); }
  };

  const loadSubmissions = async () => {
    try {
      const data = await examService.getAllSubmissions(examId);
      setSubmissions(data.submissions || []);
    } catch { toast.error('Failed to load submissions'); }
  };

  const loadAnalytics = async () => {
    try {
      const data = await examService.getExamAnalytics(examId);
      setAnalytics(data);
    } catch { toast.error('Failed to load analytics'); }
  };

  const handlePublish = async () => {
    try {
      await examService.publishExam(examId);
      toast.success('Exam published');
      loadExam();
    } catch (err) { toast.error(err.response?.data?.error || 'Publish failed'); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this exam? In-progress submissions will be auto-submitted.')) return;
    try {
      await examService.cancelExam(examId);
      toast.success('Exam cancelled');
      loadExam();
    } catch { toast.error('Cancel failed'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Permanently delete this exam?')) return;
    try {
      await examService.deleteExam(examId);
      toast.success('Deleted');
      navigate(-1);
    } catch { toast.error('Delete failed'); }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await examService.exportResults(examId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exam?.title || 'exam'}-results.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Exported');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  const handleFinalize = async () => {
    if (!window.confirm('Finalize grades and push to gradebook? This cannot be undone.')) return;
    setFinalizing(true);
    try {
      const data = await examService.finalizeGrades(examId);
      toast.success(`Grades pushed for ${data.updated || 0} students`);
    } catch (err) { toast.error(err.response?.data?.error || 'Finalize failed'); }
    finally { setFinalizing(false); }
  };

  const handleFlag = async (subId) => {
    const reason = window.prompt('Reason for flagging:');
    if (!reason) return;
    try {
      await examService.flagSubmission(examId, subId, reason);
      toast.success('Submission flagged');
      loadSubmissions();
    } catch { toast.error('Flag failed'); }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Exam not found
      </div>
    );
  }

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600 mt-1"><FaArrowLeft /></button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusColors[exam.status]}`}>
                  {exam.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {exam.examType?.replace('_', ' ')} • {exam.duration} min • {exam.questions?.length || 0} questions • {exam.totalPoints} pts
              </p>
              {exam.description && <p className="text-xs text-gray-400 mt-1 max-w-xl">{exam.description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {exam.status === 'live' && (
              <button
                onClick={() => navigate(`/teacher/exam/${examId}/live`)}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
              >
                <FaDesktop /> Live Dashboard
              </button>
            )}
            {['completed', 'live'].includes(exam.status) && (
              <button
                onClick={() => navigate(`/teacher/exam/${examId}/grade`)}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
              >
                <FaGraduationCap /> Grade
              </button>
            )}
            {exam.status === 'draft' && (
              <>
                <button onClick={handlePublish} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700">
                  <FaPlay /> Publish
                </button>
                <button onClick={() => navigate(`/teacher/exam/create/${exam.course}?edit=${examId}`)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  <FaEdit /> Edit
                </button>
                <button onClick={handleDelete} className="p-2 text-gray-400 hover:text-red-600"><FaTrash /></button>
              </>
            )}
            {['scheduled', 'live'].includes(exam.status) && (
              <button onClick={handleCancel} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-100">
                <FaBan /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <t.icon className="text-[10px]" /> {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Schedule Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaClock className="text-indigo-500" /> Schedule</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Start</span><span className="text-gray-900 font-medium">{fmt(exam.scheduledStartTime)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">End</span><span className="text-gray-900 font-medium">{fmt(exam.scheduledEndTime)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Duration</span><span className="text-gray-900 font-medium">{exam.duration} minutes</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Late Entry</span><span className="text-gray-900 font-medium">{exam.allowLateEntry || 0} min</span></div>
                    {exam.examCategory && (
                      <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="text-gray-900 font-medium capitalize">{exam.examCategory}</span></div>
                    )}
                  </div>
                </div>

                {/* Settings Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaClipboardList className="text-indigo-500" /> Settings</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-500">Question Selection</span><span className="text-gray-900 font-medium capitalize">{exam.questionSelection?.replace('_', ' ')}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Shuffle Questions</span><span className={exam.shuffleQuestions ? 'text-emerald-600' : 'text-gray-400'}>{exam.shuffleQuestions ? 'Yes' : 'No'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Shuffle Options</span><span className={exam.shuffleOptions ? 'text-emerald-600' : 'text-gray-400'}>{exam.shuffleOptions ? 'Yes' : 'No'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Show Results</span><span className={exam.showResultsToStudent ? 'text-emerald-600' : 'text-gray-400'}>{exam.showResultsToStudent ? 'Yes' : 'No'}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Max Attempts</span><span className="text-gray-900 font-medium">{exam.maxAttempts}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Passing Score</span><span className="text-gray-900 font-medium">{exam.passingScore || 0}%</span></div>
                  </div>
                </div>

                {/* Proctoring Card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-5 md:col-span-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaShieldAlt className="text-purple-500" /> Proctoring</h3>
                  {exam.proctoring?.enabled ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Face Detection', val: exam.proctoring.faceDetection },
                        { label: 'Multi-Face', val: exam.proctoring.multipleFaceDetection },
                        { label: 'Tab Switch', val: exam.proctoring.tabSwitchDetection },
                        { label: 'Copy/Paste', val: exam.proctoring.copyPasteDetection },
                        { label: 'Fullscreen', val: exam.proctoring.fullScreenEnforcement },
                        { label: 'Screenshots', val: exam.proctoring.periodicScreenshots },
                      ].map(item => (
                        <div key={item.label} className="flex items-center gap-2 text-xs">
                          {item.val ? <FaCheck className="text-emerald-500" /> : <FaTimes className="text-gray-300" />}
                          <span className={item.val ? 'text-gray-900' : 'text-gray-400'}>{item.label}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Max Warnings:</span>
                        <span className="font-medium text-gray-900">{exam.proctoring.maxWarnings}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Screenshot Every:</span>
                        <span className="font-medium text-gray-900">{exam.proctoring.screenshotIntervalSeconds}s</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Proctoring disabled</p>
                  )}
                </div>

                {/* Instructions */}
                {exam.instructions && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-5 md:col-span-2">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Instructions</h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{exam.instructions}</p>
                  </div>
                )}
              </div>
            )}

            {/* Questions Tab */}
            {activeTab === 'questions' && (
              <div className="space-y-2">
                {exam.questions?.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">
                    {exam.questionSelection === 'random_from_bank'
                      ? 'Questions will be randomly selected from the question bank when students start the exam.'
                      : 'No questions added yet.'}
                  </div>
                ) : (
                  exam.questions?.map((q, i) => (
                    <div key={q._id || i} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{q.question}</p>
                          {q.type === 'mcq' && q.options?.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {q.options.map((opt, j) => (
                                <div key={j} className={`text-xs px-2 py-1 rounded ${opt === q.correctAnswer ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-500'}`}>
                                  {String.fromCharCode(65 + j)}. {opt} {opt === q.correctAnswer && '✓'}
                                </div>
                              ))}
                            </div>
                          )}
                          {q.type === 'true_false' && (
                            <p className="text-xs mt-1 text-emerald-600 font-medium">Answer: {q.correctAnswer}</p>
                          )}
                          {q.type === 'fill_in_blank' && q.correctAnswer && (
                            <p className="text-xs mt-1 text-emerald-600 font-medium">Answer: {q.correctAnswer}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600">{q.type?.replace('_', ' ')}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${difficultyColors[q.difficulty] || ''}`}>{q.difficulty}</span>
                            <span className="text-[10px] text-gray-400">{q.points} pts</span>
                            {q.bloomLevel && <span className="text-[10px] text-gray-400 capitalize">{q.bloomLevel}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {exam.questionSelection === 'random_from_bank' && exam.randomConfig && (
                  <div className="bg-indigo-50 rounded-xl border border-indigo-100 p-4">
                    <h4 className="text-sm font-semibold text-indigo-900 mb-2">Random Selection Config</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-indigo-500">Total:</span> <span className="font-medium text-indigo-900">{exam.randomConfig.totalQuestions}</span></div>
                      {Object.entries(exam.randomConfig.perDifficulty || {}).map(([k, v]) => (
                        <div key={k}><span className="text-indigo-500 capitalize">{k}:</span> <span className="font-medium text-indigo-900">{v}</span></div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submissions Tab */}
            {activeTab === 'submissions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{submissions.length} submissions</p>
                  <div className="flex items-center gap-2">
                    {exam.status === 'completed' && (
                      <>
                        <button
                          onClick={handleExport}
                          disabled={exporting}
                          className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          <FaDownload /> {exporting ? 'Exporting...' : 'Export XLSX'}
                        </button>
                        <button
                          onClick={handleFinalize}
                          disabled={finalizing}
                          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                        >
                          <FaGraduationCap /> {finalizing ? 'Finalizing...' : 'Finalize Grades'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {submissions.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-sm">No submissions yet</div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                          <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Student</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Score</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Integrity</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Violations</th>
                          <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500">Time</th>
                          <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissions.map(sub => (
                          <tr key={sub._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-900 text-xs">{sub.student?.user?.name || sub.student?.name || 'Student'}</p>
                              <p className="text-[10px] text-gray-400">{sub.student?.rollNumber || sub.student?.user?.email || ''}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${submissionStatusColors[sub.status] || ''}`}>
                                {sub.status?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {sub.status === 'in_progress' ? (
                                <span className="text-xs text-gray-400">—</span>
                              ) : (
                                <div>
                                  <span className="font-bold text-gray-900 text-xs">{sub.totalScore ?? '—'}</span>
                                  <span className="text-[10px] text-gray-400">/{exam.totalPoints}</span>
                                  {sub.percentage != null && <p className="text-[10px] text-gray-400">{sub.percentage.toFixed(1)}%</p>}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-bold ${
                                (sub.integrityScore ?? 100) >= 80 ? 'text-emerald-600' :
                                (sub.integrityScore ?? 100) >= 50 ? 'text-amber-600' : 'text-red-600'
                              }`}>
                                {sub.integrityScore ?? 100}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className={`text-xs font-medium ${sub.totalViolations > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                                {sub.totalViolations || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-xs text-gray-500">
                              {sub.timeSpentSeconds ? `${Math.round(sub.timeSpentSeconds / 60)}m` : '—'}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {exam.proctoring?.enabled && (
                                  <button
                                    onClick={() => navigate(`/teacher/exam/${examId}/proctoring/${sub.student?._id || sub.student}`)}
                                    className="p-1.5 text-gray-400 hover:text-purple-600"
                                    title="Proctoring Report"
                                  >
                                    <FaShieldAlt className="text-xs" />
                                  </button>
                                )}
                                {sub.status !== 'flagged' && sub.status !== 'invalidated' && (
                                  <button onClick={() => handleFlag(sub._id)} className="p-1.5 text-gray-400 hover:text-red-600" title="Flag">
                                    <FaFlag className="text-xs" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                {!analytics ? (
                  <div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                  </div>
                ) : (
                  <>
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {[
                        { label: 'Submissions', value: analytics.totalSubmissions || 0 },
                        { label: 'Graded', value: analytics.gradedCount || 0 },
                        { label: 'Avg Score', value: `${(analytics.averageScore || 0).toFixed(1)}%` },
                        { label: 'Highest', value: `${analytics.highestScore || 0}%` },
                        { label: 'Lowest', value: `${analytics.lowestScore || 0}%` },
                      ].map(s => (
                        <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
                          <p className="text-lg font-bold text-gray-900">{s.value}</p>
                          <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Grade Distribution */}
                    {analytics.gradeDistribution && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Grade Distribution</h3>
                        <div className="flex items-end gap-2 h-40">
                          {Object.entries(analytics.gradeDistribution).map(([grade, count]) => {
                            const max = Math.max(...Object.values(analytics.gradeDistribution), 1);
                            const height = (count / max) * 100;
                            return (
                              <div key={grade} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-[10px] font-medium text-gray-700">{count}</span>
                                <div
                                  className="w-full bg-indigo-500 rounded-t-lg transition-all"
                                  style={{ height: `${Math.max(height, 4)}%` }}
                                />
                                <span className="text-[10px] font-semibold text-gray-500">{grade}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Per-Question Stats */}
                    {analytics.questionStats?.length > 0 && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Question Analysis</h3>
                        <div className="space-y-2">
                          {analytics.questionStats.map((qs, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                              <span className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-900 truncate">{qs.question}</p>
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <div className="text-center">
                                  <p className={`font-bold ${qs.difficultyIndex >= 0.7 ? 'text-emerald-600' : qs.difficultyIndex >= 0.4 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {(qs.difficultyIndex * 100).toFixed(0)}%
                                  </p>
                                  <p className="text-[10px] text-gray-400">Correct</p>
                                </div>
                                <div className="text-center">
                                  <p className={`font-bold ${qs.discriminationIndex >= 0.3 ? 'text-emerald-600' : qs.discriminationIndex >= 0.1 ? 'text-amber-600' : 'text-red-600'}`}>
                                    {qs.discriminationIndex?.toFixed(2) || '—'}
                                  </p>
                                  <p className="text-[10px] text-gray-400">Disc. Index</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Proctoring Summary */}
                    {analytics.proctoringSummary && (
                      <div className="bg-white rounded-2xl border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><FaShieldAlt className="text-purple-500" /> Proctoring Summary</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {Object.entries(analytics.proctoringSummary).map(([key, val]) => (
                            <div key={key} className="text-center">
                              <p className="text-lg font-bold text-gray-900">{val}</p>
                              <p className="text-[10px] text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ExamDetail;
