import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaFileUpload, FaRobot, FaTrash, FaEdit, FaCheck, FaTimes, FaArrowLeft, FaSearch } from 'react-icons/fa';
import * as qbService from '../../../services/questionBank.service';
import QuestionForm from '../components/QuestionForm';
import toast from 'react-hot-toast';

const QuestionBankManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiForm, setAiForm] = useState({ topic: '', count: 5, difficulty: 'medium', type: 'mcq' });
  const [generating, setGenerating] = useState(false);
  const [filters, setFilters] = useState({ type: '', difficulty: '', status: '', search: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadQuestions();
    loadStats();
  }, [courseId, page, filters]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 20 };
      if (filters.type) params.type = filters.type;
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const data = await qbService.getQuestions(courseId, params);
      setQuestions(data.questions || []);
      setPagination(data.pagination || {});
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await qbService.getQuestionStats(courseId);
      setStats(data.stats);
    } catch (err) { /* silent */ }
  };

  const handleCreate = async (formData) => {
    try {
      await qbService.createQuestion(courseId, formData);
      toast.success('Question added');
      setShowForm(false);
      loadQuestions();
      loadStats();
    } catch (err) {
      toast.error('Failed to add question');
    }
  };

  const handleUpdate = async (formData) => {
    try {
      await qbService.updateQuestion(editingQuestion._id, formData);
      toast.success('Question updated');
      setEditingQuestion(null);
      loadQuestions();
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await qbService.deleteQuestion(id);
      toast.success('Deleted');
      loadQuestions();
      loadStats();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleApprove = async (id, status) => {
    try {
      await qbService.approveQuestion(id, status);
      toast.success(status === 'approved' ? 'Approved' : 'Rejected');
      loadQuestions();
      loadStats();
    } catch (err) {
      toast.error('Failed');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await qbService.importFromExcel(courseId, file);
      toast.success(`Imported ${data.imported} questions`);
      if (data.errors?.length > 0) {
        toast(`${data.errors.length} row errors`, { icon: '⚠️' });
      }
      loadQuestions();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Import failed');
    }
    e.target.value = '';
  };

  const handleAIGenerate = async () => {
    if (!aiForm.topic) return toast.error('Topic is required');
    setGenerating(true);
    try {
      const data = await qbService.generateAIQuestions(courseId, aiForm);
      toast.success(`Generated ${data.generated} questions`);
      setShowAIDialog(false);
      loadQuestions();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const difficultyColors = { easy: 'text-primary-600 bg-primary-50', medium: 'text-amber-600 bg-amber-50', hard: 'text-red-600 bg-red-50' };
  const statusColors = { approved: 'text-emerald-600 bg-emerald-900/30', pending: 'text-amber-600 bg-amber-50', rejected: 'text-red-600 bg-red-50' };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowLeft /></button>
            <h1 className="text-xl font-bold text-gray-900">Question Bank</h1>
            {stats && <span className="text-sm text-gray-400">{stats.total} questions</span>}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAIDialog(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-gray-900 rounded-xl text-xs font-semibold hover:from-primary-700 hover:to-primary-600"
            >
              <FaRobot /> AI Generate
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-gray-900 rounded-xl text-xs font-semibold hover:from-primary-700 hover:to-primary-600"
            >
              <FaFileUpload /> Import
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.csv" onChange={handleImport} className="hidden" />
            <button
              onClick={() => { setEditingQuestion(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-gray-900 rounded-xl text-xs font-semibold hover:from-primary-700 hover:to-primary-600"
            >
              <FaPlus /> Add Question
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(stats.byDifficulty || {}).map(([key, val]) => (
              <div key={key} className="bg-white/70 backdrop-blur-xl rounded-xl border border-gray-200 p-3 text-center">
                <p className="text-lg font-bold text-gray-900">{val}</p>
                <p className="text-xs text-gray-500 capitalize">{key}</p>
              </div>
            ))}
            <div className="bg-white/70 backdrop-blur-xl rounded-xl border border-gray-200 p-3 text-center">
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Total</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              className="w-full pl-8 pr-3 py-2 bg-white/70 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          {[
            { key: 'type', options: ['mcq', 'true_false', 'short_answer', 'long_answer', 'fill_in_blank'], label: 'Type' },
            { key: 'difficulty', options: ['easy', 'medium', 'hard'], label: 'Difficulty' },
            { key: 'status', options: ['approved', 'pending', 'rejected'], label: 'Status' },
          ].map(({ key, options, label }) => (
            <select
              key={key}
              value={filters[key]}
              onChange={(e) => { setFilters(f => ({ ...f, [key]: e.target.value })); setPage(1); }}
              className="px-3 py-2 bg-white/70 border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{label}: All</option>
              {options.map(o => <option key={o} value={o}>{o.replace('_', ' ')}</option>)}
            </select>
          ))}
        </div>

        {/* Add/Edit form */}
        <AnimatePresence>
          {(showForm || editingQuestion) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200 p-6 shadow-card-sm"
            >
              <h3 className="font-semibold text-gray-900 mb-4">
                {editingQuestion ? 'Edit Question' : 'New Question'}
              </h3>
              <QuestionForm
                initial={editingQuestion || {}}
                onSave={editingQuestion ? handleUpdate : handleCreate}
                onCancel={() => { setShowForm(false); setEditingQuestion(null); }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-primary-400/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No questions found</div>
        ) : (
          <div className="space-y-2">
            {questions.map((q, i) => (
              <motion.div
                key={q._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="bg-white/70 backdrop-blur-xl rounded-xl border border-gray-200 p-4 hover:shadow-card-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{q.question}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-50 text-primary-600">
                        {q.type?.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${difficultyColors[q.difficulty] || ''}`}>
                        {q.difficulty}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusColors[q.status] || ''}`}>
                        {q.status}
                      </span>
                      {q.topic && <span className="text-[10px] text-gray-400">{q.topic}</span>}
                      <span className="text-[10px] text-gray-400">{q.points} pts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {q.status === 'pending' && (
                      <>
                        <button onClick={() => handleApprove(q._id, 'approved')} className="p-1.5 text-primary-600 hover:text-primary-600"><FaCheck className="text-xs" /></button>
                        <button onClick={() => handleApprove(q._id, 'rejected')} className="p-1.5 text-red-600 hover:text-red-600"><FaTimes className="text-xs" /></button>
                      </>
                    )}
                    <button onClick={() => setEditingQuestion(q)} className="p-1.5 text-gray-400 hover:text-primary-600"><FaEdit className="text-xs" /></button>
                    <button onClick={() => handleDelete(q._id)} className="p-1.5 text-gray-400 hover:text-red-600"><FaTrash className="text-xs" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: pagination.pages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-xs font-medium ${
                  page === i + 1 ? 'bg-primary-600 text-gray-900' : 'bg-white/70 border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* AI Generate Dialog */}
        {showAIDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50/20">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-card border border-gray-200 p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">AI Question Generator</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Topic *</label>
                  <input
                    type="text"
                    value={aiForm.topic}
                    onChange={(e) => setAiForm(f => ({ ...f, topic: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g., Data Structures - Binary Trees"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Count</label>
                    <input type="number" value={aiForm.count} onChange={(e) => setAiForm(f => ({ ...f, count: Number(e.target.value) }))} min={1} max={20} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Difficulty</label>
                    <select value={aiForm.difficulty} onChange={(e) => setAiForm(f => ({ ...f, difficulty: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600">
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                    <select value={aiForm.type} onChange={(e) => setAiForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600">
                      <option value="mcq">MCQ</option>
                      <option value="true_false">True/False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-5">
                <button onClick={() => setShowAIDialog(false)} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAIGenerate} disabled={generating} className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-gray-900 rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600">
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionBankManager;
