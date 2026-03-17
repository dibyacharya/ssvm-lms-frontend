import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPlus, FaFileAlt } from 'react-icons/fa';
import { getCourseExams, deleteExam, publishExam, cancelExam } from '../../../services/exam.service';
import ExamCard from '../components/ExamCard';
import toast from 'react-hot-toast';

const TeacherExamList = ({ courseId }) => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (courseId) loadExams();
  }, [courseId]);

  const loadExams = async () => {
    try {
      setLoading(true);
      const data = await getCourseExams(courseId);
      setExams(data.exams || []);
    } catch (err) {
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await deleteExam(examId);
      toast.success('Exam deleted');
      loadExams();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handlePublish = async (examId) => {
    try {
      await publishExam(examId);
      toast.success('Exam published');
      loadExams();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to publish');
    }
  };

  const handleCancel = async (examId) => {
    if (!window.confirm('Cancel this exam? In-progress submissions will be auto-submitted.')) return;
    try {
      await cancelExam(examId);
      toast.success('Exam cancelled');
      loadExams();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel');
    }
  };

  const handleExamClick = (exam) => {
    navigate(`/teacher/exam/${exam._id}`);
  };

  const filtered = exams.filter((e) => {
    if (filter === 'all') return true;
    return e.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Examinations</h2>
        <button
          onClick={() => navigate(`/teacher/exam/create/${courseId}`)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
        >
          <FaPlus className="text-xs" /> Create Exam
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'draft', 'scheduled', 'live', 'completed', 'cancelled'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FaFileAlt className="mx-auto text-4xl mb-3 opacity-30" />
          <p className="text-sm">No exams found</p>
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
              <ExamCard exam={exam} onClick={handleExamClick} role="teacher" />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherExamList;
