import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFileAlt, FaClock, FaCheckCircle, FaPlay } from 'react-icons/fa';
import { getCourseExams, getStudentAllExams } from '../../../services/exam.service';
import ExamCard from '../components/ExamCard';
import toast from 'react-hot-toast';

const ExamList = ({ courseId }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadExams();
  }, [courseId]);

  const loadExams = async () => {
    try {
      setLoading(true);
      let data;
      if (courseId) {
        // Course-specific exams
        data = await getCourseExams(courseId);
        setExams(data.exams || []);
      } else {
        // Dashboard: all enrolled course exams
        data = await getStudentAllExams();
        setExams(data.exams || []);
      }
    } catch (err) {
      console.error('Failed to load exams:', err);
      toast.error('Failed to load exams');
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = exams.filter((e) => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return ['scheduled', 'live'].includes(e.status);
    if (filter === 'completed') return e.status === 'completed';
    return true;
  });

  const handleExamClick = (exam) => {
    if (exam.status === 'live') {
      navigate(`/exam/${exam._id}/lobby`);
    } else if (exam.status === 'completed') {
      navigate(`/exam/${exam._id}/result`);
    }
  };

  const stats = {
    total: exams.length,
    upcoming: exams.filter((e) => ['scheduled', 'live'].includes(e.status)).length,
    live: exams.filter((e) => e.status === 'live').length,
    completed: exams.filter((e) => e.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary-400/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {courseId ? 'Course Exams' : 'My Examinations'}
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Exams', value: stats.total, icon: FaFileAlt, color: 'indigo' },
          { label: 'Upcoming', value: stats.upcoming, icon: FaClock, color: 'blue' },
          { label: 'Live Now', value: stats.live, icon: FaPlay, color: 'emerald' },
          { label: 'Completed', value: stats.completed, icon: FaCheckCircle, color: 'primary' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/70 backdrop-blur-xl rounded-xl border border-gray-200 p-4 shadow-card-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg bg-${stat.color}-900/30 flex items-center justify-center`}>
                <stat.icon className={`text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {['all', 'upcoming', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-gray-900'
                : 'bg-white/70 backdrop-blur-xl text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Exam cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FaFileAlt className="mx-auto text-4xl mb-3 opacity-30" />
          <p className="text-sm">
            {filter === 'all' ? 'No exams available yet' : `No ${filter} exams`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((exam, i) => (
            <motion.div
              key={exam._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ExamCard exam={exam} onClick={handleExamClick} role="student" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamList;
