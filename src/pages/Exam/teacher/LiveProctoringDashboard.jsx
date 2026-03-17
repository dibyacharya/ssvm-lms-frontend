import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft, FaSync, FaExclamationTriangle, FaEye, FaShieldAlt,
  FaUser, FaDesktop, FaWifi, FaClock, FaFlag
} from 'react-icons/fa';
import * as examService from '../../../services/exam.service';
import toast from 'react-hot-toast';

const sessionStatusColors = {
  active: 'bg-emerald-100 text-emerald-700',
  waiting: 'bg-amber-100 text-amber-700',
  paused: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  disconnected: 'bg-red-100 text-red-700',
};

const LiveProctoringDashboard = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const intervalRef = useRef(null);

  const [exam, setExam] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  useEffect(() => {
    loadExam();
    loadDashboard();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [examId]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoRefresh) {
      intervalRef.current = setInterval(loadDashboard, 10000); // every 10s
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoRefresh, examId]);

  const loadExam = async () => {
    try {
      const data = await examService.getExamById(examId);
      setExam(data.exam);
    } catch { /* silent */ }
  };

  const loadDashboard = async () => {
    try {
      const data = await examService.getLiveDashboard(examId);
      setSessions(data.sessions || []);
      setSummary(data.summary || {});
      setLastRefreshed(new Date());
    } catch (err) {
      if (loading) toast.error('Failed to load dashboard');
    } finally { setLoading(false); }
  };

  const getTimeSince = (date) => {
    if (!date) return '—';
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const warningSessions = sessions.filter(s => s.violationCount > 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-white"><FaArrowLeft /></button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <FaDesktop className="text-emerald-400" />
                Live Proctoring — {exam?.title || 'Exam'}
              </h1>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                {lastRefreshed && <span>Last refreshed: {lastRefreshed.toLocaleTimeString()}</span>}
                {autoRefresh && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                autoRefresh ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              <FaSync className={autoRefresh ? 'animate-spin' : ''} />
              Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <button onClick={loadDashboard} className="px-3 py-2 bg-gray-700 rounded-xl text-xs font-semibold text-gray-300 hover:bg-gray-600">
              <FaSync /> Refresh Now
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: sessions.length, icon: FaUser, color: 'text-blue-400' },
            { label: 'Active', value: summary.active || activeSessions.length, icon: FaDesktop, color: 'text-emerald-400' },
            { label: 'Waiting', value: summary.waiting || sessions.filter(s => s.status === 'waiting').length, icon: FaClock, color: 'text-amber-400' },
            { label: 'Disconnected', value: summary.disconnected || sessions.filter(s => s.status === 'disconnected').length, icon: FaWifi, color: 'text-red-400' },
            { label: 'With Violations', value: warningSessions.length, icon: FaExclamationTriangle, color: 'text-orange-400' },
          ].map(s => (
            <div key={s.label} className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <s.icon className={`text-lg ${s.color}`} />
                <span className="text-2xl font-bold">{s.value}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sessions Grid */}
        {sessions.length === 0 ? (
          <div className="text-center py-16 text-gray-500 text-sm">No active sessions</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <AnimatePresence>
              {sessions.map((session, i) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className={`bg-gray-800 rounded-xl border p-4 ${
                    session.violationCount > 3 ? 'border-red-500/50' :
                    session.violationCount > 0 ? 'border-amber-500/30' :
                    session.status === 'disconnected' ? 'border-red-700/30' :
                    'border-gray-700'
                  }`}
                >
                  {/* Student info */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
                        {(session.student?.user?.name || session.student?.name || '?')[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium truncate max-w-[150px]">
                          {session.student?.user?.name || session.student?.name || 'Student'}
                        </p>
                        <p className="text-[10px] text-gray-500">{session.student?.rollNumber || ''}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${sessionStatusColors[session.status] || 'bg-gray-700 text-gray-400'}`}>
                      {session.status}
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-gray-300 font-medium">{session.answeredCount || 0}/{exam?.questions?.length || '?'} answered</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all"
                        style={{ width: `${exam?.questions?.length ? ((session.answeredCount || 0) / exam.questions.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Violations */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <div className="flex items-center gap-1.5">
                      <FaExclamationTriangle className={`text-[10px] ${session.violationCount > 0 ? 'text-orange-400' : 'text-gray-600'}`} />
                      <span className={`text-xs font-medium ${session.violationCount > 3 ? 'text-red-400' : session.violationCount > 0 ? 'text-orange-400' : 'text-gray-500'}`}>
                        {session.violationCount || 0} violations
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-500" title="Last heartbeat">
                        <FaWifi className="inline mr-1" />{getTimeSince(session.lastHeartbeat)}
                      </span>
                      <button
                        onClick={() => navigate(`/teacher/exam/${examId}/proctoring/${session.student?._id || session.student}`)}
                        className="p-1.5 text-gray-500 hover:text-indigo-400"
                        title="View proctoring report"
                      >
                        <FaEye className="text-xs" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveProctoringDashboard;
