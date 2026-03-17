import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowLeft, FaShieldAlt, FaExclamationTriangle, FaCamera, FaDesktop,
  FaEyeSlash, FaCopy, FaUsers, FaExpand, FaUser, FaClock
} from 'react-icons/fa';
import * as examService from '../../../services/exam.service';
import toast from 'react-hot-toast';

const violationIcons = {
  tab_switch: FaDesktop,
  no_face: FaEyeSlash,
  multiple_faces: FaUsers,
  copy_paste: FaCopy,
  fullscreen_exit: FaExpand,
  browser_resize: FaExpand,
};

const violationColors = {
  tab_switch: 'text-amber-500 bg-amber-500/10',
  no_face: 'text-red-500 bg-red-500/10',
  multiple_faces: 'text-red-600 bg-red-600/10',
  copy_paste: 'text-orange-500 bg-orange-500/10',
  fullscreen_exit: 'text-purple-500 bg-purple-500/10',
  browser_resize: 'text-blue-500 bg-blue-500/10',
};

const violationLabels = {
  tab_switch: 'Tab Switch',
  no_face: 'No Face Detected',
  multiple_faces: 'Multiple Faces',
  copy_paste: 'Copy/Paste Attempt',
  fullscreen_exit: 'Fullscreen Exit',
  browser_resize: 'Browser Resize',
};

const ProctoringReport = () => {
  const { examId, studentId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);

  useEffect(() => {
    loadReport();
  }, [examId, studentId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await examService.getProctoringReport(examId, studentId);
      setReport(data);
    } catch { toast.error('Failed to load proctoring report'); }
    finally { setLoading(false); }
  };

  const fmt = (d) => d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }) : '—';
  const fmtTime = (d) => d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">
        Report not found
      </div>
    );
  }

  const { submission, exam } = report;
  const violations = submission?.violations || [];
  const screenshots = submission?.screenshots || [];
  const faceLog = submission?.faceDetectionLog || [];

  // Group violations by type for summary
  const violationCounts = violations.reduce((acc, v) => {
    acc[v.type] = (acc[v.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowLeft /></button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FaShieldAlt className="text-purple-500" /> Proctoring Report
            </h1>
            <p className="text-sm text-gray-500">
              {submission?.student?.user?.name || submission?.student?.name || 'Student'} • {exam?.title || 'Exam'}
            </p>
          </div>
        </div>

        {/* Integrity Score */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${
                (submission?.integrityScore ?? 100) >= 80 ? 'border-emerald-500 text-emerald-600 bg-emerald-50' :
                (submission?.integrityScore ?? 100) >= 50 ? 'border-amber-500 text-amber-600 bg-amber-50' :
                'border-red-500 text-red-600 bg-red-50'
              }`}>
                {submission?.integrityScore ?? 100}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Integrity Score</h2>
                <p className="text-sm text-gray-500">
                  {(submission?.integrityScore ?? 100) >= 80 ? 'Good standing — minimal violations' :
                   (submission?.integrityScore ?? 100) >= 50 ? 'Moderate concern — multiple violations detected' :
                   'Critical — significant integrity issues detected'}
                </p>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-gray-500">Total Violations: <span className="font-bold text-gray-900">{submission?.totalViolations || 0}</span></p>
              <p className="text-gray-500">Warnings Issued: <span className="font-bold text-gray-900">{submission?.warningCount || 0}</span></p>
              <p className="text-gray-500">Status: <span className={`font-bold ${submission?.status === 'flagged' ? 'text-red-600' : 'text-gray-900'}`}>{submission?.status}</span></p>
            </div>
          </div>
        </div>

        {/* Violation Summary by Type */}
        {Object.keys(violationCounts).length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(violationCounts).map(([type, count]) => {
              const Icon = violationIcons[type] || FaExclamationTriangle;
              return (
                <div key={type} className={`rounded-xl p-3 text-center ${violationColors[type] || 'bg-gray-100 text-gray-600'}`}>
                  <Icon className="mx-auto text-lg mb-1" />
                  <p className="text-xl font-bold">{count}</p>
                  <p className="text-[10px] font-medium">{violationLabels[type] || type}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Violation Timeline */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FaExclamationTriangle className="text-amber-500" /> Violation Timeline
          </h3>
          {violations.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No violations recorded</p>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" />

              <div className="space-y-4">
                {violations.map((v, i) => {
                  const Icon = violationIcons[v.type] || FaExclamationTriangle;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="relative pl-12"
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-3 w-5 h-5 rounded-full flex items-center justify-center ${violationColors[v.type] || 'bg-gray-100'}`}>
                        <Icon className="text-[8px]" />
                      </div>

                      <div className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-gray-900">{violationLabels[v.type] || v.type}</span>
                            <span className="text-[10px] text-gray-400">#{i + 1}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <FaClock className="text-[8px]" /> {fmtTime(v.timestamp)}
                          </span>
                        </div>
                        {v.details && <p className="text-xs text-gray-500 mt-1">{v.details}</p>}
                        {v.screenshotUrl && (
                          <button
                            onClick={() => setSelectedScreenshot(v.screenshotUrl)}
                            className="mt-2 text-[10px] text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                          >
                            <FaCamera /> View Screenshot
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Periodic Screenshots */}
        {screenshots.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaCamera className="text-indigo-500" /> Periodic Screenshots ({screenshots.length})
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {screenshots.map((ss, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedScreenshot(ss.url)}
                  className="aspect-video bg-gray-100 rounded-lg overflow-hidden hover:ring-2 hover:ring-indigo-500 transition-all group relative"
                >
                  <img src={ss.url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1.5 py-0.5">
                    <p className="text-[8px] text-white">{fmtTime(ss.capturedAt)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Face Detection Log */}
        {faceLog.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FaUser className="text-emerald-500" /> Face Detection Log ({faceLog.length} entries)
            </h3>
            <div className="max-h-60 overflow-y-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 text-gray-500 font-semibold">Time</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-semibold">Faces</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-semibold">Confidence</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {faceLog.map((entry, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-1.5 px-2 text-gray-600">{fmtTime(entry.timestamp)}</td>
                      <td className="py-1.5 px-2 text-center font-medium">{entry.facesDetected}</td>
                      <td className="py-1.5 px-2 text-center">{entry.confidence ? `${(entry.confidence * 100).toFixed(0)}%` : '—'}</td>
                      <td className="py-1.5 px-2 text-center">
                        {entry.facesDetected === 1 ? (
                          <span className="text-emerald-600">✓ OK</span>
                        ) : entry.facesDetected === 0 ? (
                          <span className="text-red-600">⚠ No face</span>
                        ) : (
                          <span className="text-red-600">⚠ Multiple</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Session Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-gray-500 text-xs">Started</span><p className="font-medium text-gray-900 text-xs">{fmt(submission?.startedAt)}</p></div>
            <div><span className="text-gray-500 text-xs">Submitted</span><p className="font-medium text-gray-900 text-xs">{fmt(submission?.submittedAt)}</p></div>
            <div><span className="text-gray-500 text-xs">Time Spent</span><p className="font-medium text-gray-900 text-xs">{submission?.timeSpentSeconds ? `${Math.round(submission.timeSpentSeconds / 60)} minutes` : '—'}</p></div>
            <div><span className="text-gray-500 text-xs">Auto-Submitted</span><p className="font-medium text-gray-900 text-xs">{submission?.autoSubmitted ? 'Yes' : 'No'}</p></div>
          </div>
        </div>
      </div>

      {/* Screenshot Modal */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setSelectedScreenshot(null)}>
          <div className="max-w-4xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
            <img src={selectedScreenshot} alt="Screenshot" className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" />
            <button
              onClick={() => setSelectedScreenshot(null)}
              className="mt-2 mx-auto block px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProctoringReport;
