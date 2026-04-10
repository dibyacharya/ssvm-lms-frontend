import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaCheck, FaSave, FaChevronLeft, FaChevronRight, FaFlag, FaShieldAlt } from 'react-icons/fa';
import * as examService from '../../../services/exam.service';
import toast from 'react-hot-toast';

const typeLabel = (t) => t?.replace('_', ' ') || '';

const ExamGrading = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState({}); // { answerId: { pointsAwarded, feedback } }

  useEffect(() => {
    loadData();
  }, [examId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examRes, subRes] = await Promise.all([
        examService.getExamById(examId),
        examService.getAllSubmissions(examId),
      ]);
      setExam(examRes.exam);
      setSubmissions(subRes.submissions || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const currentSub = submissions[selectedIdx];

  // Identify subjective questions (short_answer, long_answer)
  const subjectiveAnswers = currentSub?.answers?.filter(a =>
    ['short_answer', 'long_answer'].includes(a.questionType)
  ) || [];

  // Find original question data
  const findQuestion = (questionId) =>
    exam?.questions?.find(q => (q._id || q.bankQuestionId) === questionId);

  const handleGradeChange = (answerId, field, value) => {
    setGrades(prev => ({
      ...prev,
      [answerId]: { ...prev[answerId], [field]: value },
    }));
  };

  const handleSaveGrades = async () => {
    if (!currentSub) return;
    setSaving(true);
    try {
      // Save each graded answer
      const gradesToSave = Object.entries(grades).map(([answerId, g]) => ({
        answerId,
        pointsAwarded: Number(g.pointsAwarded) || 0,
        feedback: g.feedback || '',
      }));

      if (gradesToSave.length === 0) {
        toast.error('No grades to save');
        setSaving(false);
        return;
      }

      await examService.gradeSubmission(examId, currentSub._id, {
        grades: gradesToSave,
        feedback: '',
      });
      toast.success('Grades saved');
      setGrades({});
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleFlag = async () => {
    if (!currentSub) return;
    const reason = window.prompt('Reason for flagging this submission:');
    if (!reason) return;
    try {
      await examService.flagSubmission(examId, currentSub._id, reason);
      toast.success('Submission flagged');
      loadData();
    } catch { toast.error('Flag failed'); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600"><FaArrowLeft /></button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Grade: {exam?.title}</h1>
              <p className="text-sm text-gray-500">{submissions.length} submissions</p>
            </div>
          </div>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No submissions to grade</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Student List (sidebar) */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-500">Students</p>
                </div>
                <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                  {submissions.map((sub, i) => (
                    <button
                      key={sub._id}
                      onClick={() => { setSelectedIdx(i); setGrades({}); }}
                      className={`w-full text-left px-3 py-2.5 border-b border-gray-50 transition-colors ${
                        i === selectedIdx ? 'bg-blue-50 border-l-2 border-l-blue-600' : 'hover:bg-gray-50'
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {sub.student?.user?.name || sub.student?.name || `Student ${i + 1}`}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          sub.status === 'graded' ? 'bg-blue-100 text-blue-700' :
                          sub.status === 'submitted' ? 'bg-amber-100 text-amber-700' :
                          sub.status === 'flagged' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {sub.status}
                        </span>
                        {sub.totalScore != null && (
                          <span className="text-[10px] text-gray-400">
                            {sub.totalScore}/{exam?.totalPoints}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Grading Panel */}
            <div className="lg:col-span-9 space-y-4">
              {currentSub && (
                <>
                  {/* Student info bar */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">
                          {currentSub.student?.user?.name || currentSub.student?.name || 'Student'}
                        </p>
                        <p className="text-xs text-gray-400">{currentSub.student?.rollNumber || ''}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-200" />
                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-gray-500">Objective: </span>
                          <span className="font-bold text-gray-900">{currentSub.objectiveScore ?? 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Subjective: </span>
                          <span className="font-bold text-gray-900">{currentSub.subjectiveScore ?? 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Total: </span>
                          <span className="font-bold text-blue-600">{currentSub.totalScore ?? 0}/{exam?.totalPoints}</span>
                        </div>
                        {currentSub.integrityScore != null && (
                          <div className="flex items-center gap-1">
                            <FaShieldAlt className={`text-[10px] ${currentSub.integrityScore >= 80 ? 'text-blue-500' : currentSub.integrityScore >= 50 ? 'text-amber-500' : 'text-red-500'}`} />
                            <span className="text-gray-500">Integrity: </span>
                            <span className="font-bold">{currentSub.integrityScore}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={handleFlag} className="p-2 text-gray-400 hover:text-red-600" title="Flag submission">
                        <FaFlag />
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => { setSelectedIdx(Math.max(0, selectedIdx - 1)); setGrades({}); }}
                          disabled={selectedIdx === 0}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <FaChevronLeft />
                        </button>
                        <span className="text-xs text-gray-400">{selectedIdx + 1}/{submissions.length}</span>
                        <button
                          onClick={() => { setSelectedIdx(Math.min(submissions.length - 1, selectedIdx + 1)); setGrades({}); }}
                          disabled={selectedIdx === submissions.length - 1}
                          className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <FaChevronRight />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* All answers */}
                  <div className="space-y-3">
                    {currentSub.answers?.map((ans, i) => {
                      const q = findQuestion(ans.questionId);
                      const isSubjective = ['short_answer', 'long_answer'].includes(ans.questionType);
                      const gradeVal = grades[ans._id] || {};

                      return (
                        <motion.div
                          key={ans._id || i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.02 }}
                          className="bg-white rounded-2xl border border-gray-200 p-5"
                        >
                          {/* Question */}
                          <div className="flex items-start gap-3 mb-3">
                            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{q?.question || `Question ${i + 1}`}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-medium">{typeLabel(ans.questionType)}</span>
                                <span className="text-[10px] text-gray-400">{q?.points || 1} pts</span>
                              </div>
                            </div>
                          </div>

                          {/* Student's Answer */}
                          <div className="ml-10 space-y-2">
                            <div>
                              <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Student's Answer</p>
                              <div className={`p-3 rounded-xl text-sm ${
                                !isSubjective && ans.isCorrect ? 'bg-blue-50 text-blue-800' :
                                !isSubjective && ans.isCorrect === false ? 'bg-red-50 text-red-800' :
                                'bg-gray-50 text-gray-800'
                              }`}>
                                {ans.answer || <span className="text-gray-400 italic">Not answered</span>}
                              </div>
                            </div>

                            {/* Correct Answer (for objective) */}
                            {!isSubjective && q?.correctAnswer && (
                              <div>
                                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Correct Answer</p>
                                <p className="text-sm text-blue-700 bg-blue-50 p-2 rounded-lg">{q.correctAnswer}</p>
                              </div>
                            )}

                            {/* Model Answer (for subjective) */}
                            {isSubjective && q?.modelAnswer && (
                              <div>
                                <p className="text-[10px] font-semibold text-gray-500 uppercase mb-1">Model Answer</p>
                                <p className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg whitespace-pre-wrap">{q.modelAnswer}</p>
                              </div>
                            )}

                            {/* Grading inputs for subjective */}
                            {isSubjective && (
                              <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                                <div className="w-24">
                                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Points</label>
                                  <input
                                    type="number"
                                    min={0}
                                    max={q?.points || 10}
                                    value={gradeVal.pointsAwarded ?? ans.pointsAwarded ?? ''}
                                    onChange={(e) => handleGradeChange(ans._id, 'pointsAwarded', e.target.value)}
                                    className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder={`/${q?.points || 1}`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <label className="text-[10px] font-semibold text-gray-500 uppercase">Feedback</label>
                                  <input
                                    type="text"
                                    value={gradeVal.feedback ?? ans.feedback ?? ''}
                                    onChange={(e) => handleGradeChange(ans._id, 'feedback', e.target.value)}
                                    className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Optional feedback..."
                                  />
                                </div>
                              </div>
                            )}

                            {/* Already graded indicator */}
                            {!isSubjective && (
                              <div className="flex items-center gap-1.5 text-xs">
                                {ans.isCorrect ? (
                                  <><FaCheck className="text-blue-500" /><span className="text-blue-600 font-medium">{ans.pointsAwarded} pts awarded</span></>
                                ) : ans.isCorrect === false ? (
                                  <><span className="text-red-500 font-medium">0 pts — Incorrect</span></>
                                ) : null}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Save button */}
                  {subjectiveAnswers.length > 0 && (
                    <div className="sticky bottom-4">
                      <button
                        onClick={handleSaveGrades}
                        disabled={saving || Object.keys(grades).length === 0}
                        className="w-full py-3 bg-blue-600 text-gray-900 rounded-2xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                      >
                        <FaSave /> {saving ? 'Saving...' : 'Save Grades'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamGrading;
