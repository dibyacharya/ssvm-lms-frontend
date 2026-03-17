import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaFileAlt, FaClipboardList, FaChevronRight } from 'react-icons/fa';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const ExamDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await api.get('/courses/teacher/my-courses');
      setCourses(res.data.courses || res.data || []);
    } catch {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <FaFileAlt className="text-indigo-500 text-xl" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Examinations</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Select a course to manage exams and question banks.</p>

      {courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No courses assigned</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {courses.map((course, i) => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{course.title || course.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{course.courseCode || ''}</p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={() => navigate(`/teacher/exams/${course._id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                >
                  <FaFileAlt className="text-[10px]" /> Exams <FaChevronRight className="text-[8px]" />
                </button>
                <button
                  onClick={() => navigate(`/teacher/question-bank/${course._id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-700 dark:text-gray-200 rounded-lg text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-500"
                >
                  <FaClipboardList className="text-[10px]" /> Question Bank
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExamDashboard;
