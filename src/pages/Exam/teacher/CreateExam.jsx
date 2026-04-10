import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import { createExam, updateExam, getExamById } from '../../../services/exam.service';
import { getQuestions } from '../../../services/questionBank.service';
import QuestionForm from '../components/QuestionForm';
import toast from 'react-hot-toast';

const STEPS = ['Details', 'Sections', 'Questions', 'Proctoring', 'Review'];

const CreateExam = () => {
  const { courseId, examId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [bankQuestions, setBankQuestions] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    instructions: '',
    examType: 'quiz',
    scheduledStartTime: '',
    scheduledEndTime: '',
    duration: 60,
    allowLateEntry: 0,
    totalPoints: 100,
    questionSelection: 'manual',
    questions: [],
    randomConfig: { totalQuestions: 10, perDifficulty: { easy: 3, medium: 4, hard: 3 } },
    proctoring: {
      enabled: false,
      faceDetection: true,
      multipleFaceDetection: true,
      tabSwitchDetection: true,
      copyPasteDetection: true,
      fullScreenEnforcement: true,
      periodicScreenshots: true,
      screenshotIntervalSeconds: 30,
      maxWarnings: 3,
      autoSubmitOnMaxViolations: true,
      livenessDetection: false,
      gazeTracking: false,
      objectDetection: false,
      earphoneDetection: false,
      devToolsDetection: true,
      vmDetection: false,
      newPagePrevention: true,
    },
    shuffleQuestions: false,
    shuffleOptions: false,
    showResultsToStudent: false,
    examCategory: null,
    maxAttempts: 1,
    // NTA fields
    markingScheme: { correctMarks: 4, incorrectMarks: -1, unansweredMarks: 0 },
    sections: [],
    lockdownMode: false,
    offlineCapable: false,
  });

  useEffect(() => {
    if (examId) loadExam();
    if (courseId) loadBankQuestions();
  }, [examId, courseId]);

  const loadExam = async () => {
    try {
      const data = await getExamById(examId);
      const exam = data.exam;
      setForm({
        ...exam,
        scheduledStartTime: exam.scheduledStartTime?.slice(0, 16) || '',
        scheduledEndTime: exam.scheduledEndTime?.slice(0, 16) || '',
      });
    } catch (err) {
      toast.error('Failed to load exam');
    }
  };

  const loadBankQuestions = async () => {
    try {
      const data = await getQuestions(courseId, { status: 'approved', limit: 200 });
      setBankQuestions(data.questions || []);
    } catch (err) {
      // silent
    }
  };

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateProctoring = (key, value) =>
    setForm((prev) => ({
      ...prev,
      proctoring: { ...prev.proctoring, [key]: value },
    }));

  const addQuestion = (q) => {
    const newQ = { ...q, order: form.questions.length, _id: `temp_${Date.now()}` };
    update('questions', [...form.questions, newQ]);
    setShowQuestionForm(false);
    // Recalculate total points
    const total = [...form.questions, newQ].reduce((sum, qq) => sum + (qq.points || 1), 0);
    update('totalPoints', total);
  };

  const removeQuestion = (idx) => {
    const newQuestions = form.questions.filter((_, i) => i !== idx);
    update('questions', newQuestions);
    const total = newQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
    update('totalPoints', total || 100);
  };

  const addFromBank = (bankQ) => {
    const exists = form.questions.some((q) => q.bankQuestionId === bankQ._id);
    if (exists) {
      toast.error('Question already added');
      return;
    }
    const newQ = {
      ...bankQ,
      bankQuestionId: bankQ._id,
      _id: `bank_${bankQ._id}`,
      order: form.questions.length,
    };
    update('questions', [...form.questions, newQ]);
    const total = [...form.questions, newQ].reduce((sum, q) => sum + (q.points || 1), 0);
    update('totalPoints', total);
  };

  const handleSave = async () => {
    if (!form.title || !form.scheduledStartTime || !form.scheduledEndTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        scheduledStartTime: new Date(form.scheduledStartTime).toISOString(),
        scheduledEndTime: new Date(form.scheduledEndTime).toISOString(),
      };

      if (examId) {
        await updateExam(examId, payload);
        toast.success('Exam updated');
      } else {
        await createExam(courseId, payload);
        toast.success('Exam created');
      }
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return renderDetailsStep();
      case 1:
        return renderSectionsStep();
      case 2:
        return renderQuestionsStep();
      case 3:
        return renderProctoringStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const addSection = () => {
    const nextLabel = String.fromCharCode(65 + form.sections.length); // A, B, C...
    const newSection = {
      sectionId: nextLabel,
      name: `Section ${nextLabel}`,
      subject: '',
      questionType: 'mcq',
      questionCount: 10,
      marksPerQuestion: 4,
      markingScheme: { correctMarks: null, incorrectMarks: null, unansweredMarks: null },
      isCompulsory: true,
      choiceCount: 0,
      order: form.sections.length,
    };
    update('sections', [...form.sections, newSection]);
  };

  const updateSection = (idx, field, value) => {
    const updated = [...form.sections];
    if (field.startsWith('markingScheme.')) {
      const key = field.split('.')[1];
      updated[idx] = { ...updated[idx], markingScheme: { ...updated[idx].markingScheme, [key]: value } };
    } else {
      updated[idx] = { ...updated[idx], [field]: value };
    }
    update('sections', updated);
  };

  const removeSection = (idx) => {
    update('sections', form.sections.filter((_, i) => i !== idx));
  };

  const renderSectionsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-600">NTA-Style Sections</h3>
        <button
          onClick={addSection}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-lg hover:bg-primary-900/50"
        >
          <FaPlus size={10} /> Add Section
        </button>
      </div>

      {/* Exam-wide Marking Scheme */}
      <div className="bg-gray-100 rounded-xl p-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Default Marking Scheme</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] text-gray-500">Correct</label>
            <input
              type="number"
              value={form.markingScheme.correctMarks}
              onChange={(e) => update('markingScheme', { ...form.markingScheme, correctMarks: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 bg-white/70 border border-gray-200 rounded-lg text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Incorrect</label>
            <input
              type="number"
              value={form.markingScheme.incorrectMarks}
              onChange={(e) => update('markingScheme', { ...form.markingScheme, incorrectMarks: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 bg-white/70 border border-gray-200 rounded-lg text-sm text-gray-900"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-500">Unanswered</label>
            <input
              type="number"
              value={form.markingScheme.unansweredMarks}
              onChange={(e) => update('markingScheme', { ...form.markingScheme, unansweredMarks: parseFloat(e.target.value) || 0 })}
              className="w-full px-2 py-1.5 bg-white/70 border border-gray-200 rounded-lg text-sm text-gray-900"
            />
          </div>
        </div>
      </div>

      {/* Lockdown & Offline */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.lockdownMode}
            onChange={(e) => update('lockdownMode', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          Lockdown Mode
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.offlineCapable}
            onChange={(e) => update('offlineCapable', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          Offline Capable
        </label>
      </div>

      {/* Sections List */}
      {form.sections.length === 0 ? (
        <div className="text-center py-8 text-gray-400 text-sm">
          No sections added. Click "Add Section" to create NTA-style exam sections.
          <br />
          <span className="text-xs">Sections are optional. Without sections, the exam uses simple flat question list.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {form.sections.map((sec, idx) => (
            <div key={idx} className="bg-white/70 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-primary-600">
                  Section {sec.sectionId}
                </span>
                <button
                  onClick={() => removeSection(idx)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <FaTrash size={12} />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-gray-500">Section Name</label>
                  <input
                    type="text"
                    value={sec.name}
                    onChange={(e) => updateSection(idx, 'name', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900"
                    placeholder="e.g., Physics Section A"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">Subject</label>
                  <input
                    type="text"
                    value={sec.subject}
                    onChange={(e) => updateSection(idx, 'subject', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900"
                    placeholder="e.g., Physics"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">Question Type</label>
                  <select
                    value={sec.questionType}
                    onChange={(e) => updateSection(idx, 'questionType', e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600"
                  >
                    <option value="mcq">MCQ</option>
                    <option value="numerical">Numerical</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="fill_in_blank">Fill in Blank</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">Question Count</label>
                  <input
                    type="number"
                    value={sec.questionCount}
                    onChange={(e) => updateSection(idx, 'questionCount', parseInt(e.target.value) || 1)}
                    min={1}
                    className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">Marks Per Question</label>
                  <input
                    type="number"
                    value={sec.marksPerQuestion}
                    onChange={(e) => updateSection(idx, 'marksPerQuestion', parseFloat(e.target.value) || 1)}
                    min={0.5}
                    step={0.5}
                    className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500">Choice (0 = all required)</label>
                  <input
                    type="number"
                    value={sec.choiceCount}
                    onChange={(e) => updateSection(idx, 'choiceCount', parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-900"
                  />
                </div>
              </div>
              {/* Per-section marking override */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-400 mb-1">Marking Override (leave empty for exam defaults)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-500">Correct</label>
                    <input
                      type="number"
                      value={sec.markingScheme.correctMarks ?? ''}
                      onChange={(e) => updateSection(idx, 'markingScheme.correctMarks', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-900"
                      placeholder="Default"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Incorrect</label>
                    <input
                      type="number"
                      value={sec.markingScheme.incorrectMarks ?? ''}
                      onChange={(e) => updateSection(idx, 'markingScheme.incorrectMarks', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-900"
                      placeholder="Default"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500">Unanswered</label>
                    <input
                      type="number"
                      value={sec.markingScheme.unansweredMarks ?? ''}
                      onChange={(e) => updateSection(idx, 'markingScheme.unansweredMarks', e.target.value ? parseFloat(e.target.value) : null)}
                      className="w-full px-2 py-1 bg-gray-100 border border-gray-200 rounded-lg text-xs text-gray-900"
                      placeholder="Default"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Exam Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="e.g., Mid Term Examination"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Exam Type *</label>
          <select
            value={form.examType}
            onChange={(e) => update('examType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="quiz">Quiz</option>
            <option value="mid_term">Mid Term</option>
            <option value="end_term">End Term</option>
            <option value="practice">Practice</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Grade Category</label>
          <select
            value={form.examCategory || ''}
            onChange={(e) => update('examCategory', e.target.value || null)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">None (ungraded)</option>
            <option value="midTerm">Mid Term (Assessment Plan)</option>
            <option value="endTerm">End Term (Assessment Plan)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start Time *</label>
          <input
            type="datetime-local"
            value={form.scheduledStartTime}
            onChange={(e) => update('scheduledStartTime', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">End Time *</label>
          <input
            type="datetime-local"
            value={form.scheduledEndTime}
            onChange={(e) => update('scheduledEndTime', e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Duration (minutes) *</label>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => update('duration', Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Late Entry (min)</label>
          <input
            type="number"
            value={form.allowLateEntry}
            onChange={(e) => update('allowLateEntry', Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Total Points</label>
          <input
            type="number"
            value={form.totalPoints}
            onChange={(e) => update('totalPoints', Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Instructions</label>
        <textarea
          value={form.instructions}
          onChange={(e) => update('instructions', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter exam instructions for students..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.shuffleQuestions}
            onChange={(e) => update('shuffleQuestions', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          Shuffle Questions
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.shuffleOptions}
            onChange={(e) => update('shuffleOptions', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          Shuffle Options
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={form.showResultsToStudent}
            onChange={(e) => update('showResultsToStudent', e.target.checked)}
            className="w-4 h-4 text-primary-600 rounded"
          />
          Show Results to Students
        </label>
      </div>
    </div>
  );

  const renderQuestionsStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <select
          value={form.questionSelection}
          onChange={(e) => update('questionSelection', e.target.value)}
          className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="manual">Manual Selection</option>
          <option value="random_from_bank">Random from Question Bank</option>
        </select>
      </div>

      {form.questionSelection === 'manual' ? (
        <>
          {/* Added questions */}
          {form.questions.map((q, i) => (
            <div key={q._id || i} className="bg-gray-100 rounded-xl p-4 flex items-start gap-3">
              <span className="w-7 h-7 bg-primary-900/40 text-primary-600 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 truncate">{q.question}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {q.type} &middot; {q.points} pts &middot; {q.difficulty}
                </p>
              </div>
              <button
                onClick={() => removeQuestion(i)}
                className="p-1.5 text-red-600 hover:text-red-600"
              >
                <FaTrash className="text-xs" />
              </button>
            </div>
          ))}

          {/* Add from bank */}
          {bankQuestions.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Add from Question Bank</h4>
              <div className="max-h-48 overflow-y-auto space-y-1 border border-gray-200 rounded-xl p-2">
                {bankQuestions.map((bq) => (
                  <button
                    key={bq._id}
                    onClick={() => addFromBank(bq)}
                    className="w-full text-left px-3 py-2 hover:bg-primary-900/20 rounded-lg text-xs text-gray-600 flex items-center justify-between"
                  >
                    <span className="truncate flex-1">{bq.question}</span>
                    <span className="flex-shrink-0 text-gray-400 ml-2">{bq.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add new question */}
          {showQuestionForm ? (
            <div className="border border-primary-500/20 rounded-xl p-4">
              <QuestionForm onSave={addQuestion} onCancel={() => setShowQuestionForm(false)} />
            </div>
          ) : (
            <button
              onClick={() => setShowQuestionForm(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-surface-600 rounded-xl text-sm text-gray-500 hover:border-primary-500/40 hover:text-primary-600 w-full justify-center"
            >
              <FaPlus className="text-xs" /> Add New Question
            </button>
          )}

          <p className="text-xs text-gray-400">
            Total: {form.questions.length} questions, {form.questions.reduce((s, q) => s + (q.points || 1), 0)} points
          </p>
        </>
      ) : (
        <div className="space-y-4 bg-gray-100 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            Questions will be randomly selected from the Question Bank ({bankQuestions.length} approved questions available).
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Total Questions</label>
              <input
                type="number"
                value={form.randomConfig.totalQuestions}
                onChange={(e) =>
                  update('randomConfig', { ...form.randomConfig, totalQuestions: Number(e.target.value) })
                }
                min={1}
                className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['easy', 'medium', 'hard'].map((d) => (
              <div key={d}>
                <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{d}</label>
                <input
                  type="number"
                  value={form.randomConfig.perDifficulty?.[d] || 0}
                  onChange={(e) =>
                    update('randomConfig', {
                      ...form.randomConfig,
                      perDifficulty: { ...form.randomConfig.perDifficulty, [d]: Number(e.target.value) },
                    })
                  }
                  min={0}
                  className="w-full px-3 py-2 bg-white/70 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProctoringStep = () => (
    <div className="space-y-4">
      <label className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
        <input
          type="checkbox"
          checked={form.proctoring.enabled}
          onChange={(e) => updateProctoring('enabled', e.target.checked)}
          className="w-5 h-5 text-primary-600 rounded"
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">Enable AI Proctoring</p>
          <p className="text-xs text-gray-500">Uses camera and browser monitoring</p>
        </div>
      </label>

      {form.proctoring.enabled && (
        <div className="space-y-3 pl-4 border-l-2 border-primary-500/30">
          {[
            { key: 'faceDetection', label: 'Face Detection', desc: 'Verify student is present' },
            { key: 'multipleFaceDetection', label: 'Multiple Face Detection', desc: 'Alert if more than one face' },
            { key: 'tabSwitchDetection', label: 'Tab Switch Detection', desc: 'Alert if student switches tabs' },
            { key: 'copyPasteDetection', label: 'Copy/Paste Prevention', desc: 'Block copy, paste, cut' },
            { key: 'fullScreenEnforcement', label: 'Fullscreen Mode', desc: 'Force fullscreen during exam' },
            { key: 'periodicScreenshots', label: 'Periodic Screenshots', desc: 'Capture screenshots automatically' },
            { key: 'livenessDetection', label: 'Liveness Detection', desc: 'Detect photo spoofing via blink tracking' },
            { key: 'gazeTracking', label: 'Gaze Tracking', desc: 'Detect if student looks away from screen' },
            { key: 'objectDetection', label: 'Object Detection', desc: 'Detect phones, books, and prohibited items' },
            { key: 'earphoneDetection', label: 'Earphone Detection', desc: 'Detect headphones and bluetooth devices' },
            { key: 'devToolsDetection', label: 'DevTools Detection', desc: 'Detect browser developer tools' },
            { key: 'vmDetection', label: 'VM Detection', desc: 'Block virtual machine environments' },
            { key: 'newPagePrevention', label: 'New Page Prevention', desc: 'Block opening new tabs/windows' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.proctoring[key]}
                onChange={(e) => updateProctoring(key, e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded"
              />
              <div>
                <p className="text-sm text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </label>
          ))}

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Max Warnings</label>
              <input
                type="number"
                value={form.proctoring.maxWarnings}
                onChange={(e) => updateProctoring('maxWarnings', Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Screenshot Interval (sec)</label>
              <input
                type="number"
                value={form.proctoring.screenshotIntervalSeconds}
                onChange={(e) => updateProctoring('screenshotIntervalSeconds', Number(e.target.value))}
                min={10}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 mt-2">
            <input
              type="checkbox"
              checked={form.proctoring.autoSubmitOnMaxViolations}
              onChange={(e) => updateProctoring('autoSubmitOnMaxViolations', e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded"
            />
            Auto-submit on max violations
          </label>
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="bg-gray-100 rounded-xl p-4 space-y-3">
        <h3 className="font-semibold text-gray-900">Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><span className="text-gray-500">Title:</span> <span className="text-gray-900 font-medium">{form.title || '-'}</span></div>
          <div><span className="text-gray-500">Type:</span> <span className="text-gray-900 font-medium">{form.examType}</span></div>
          <div><span className="text-gray-500">Duration:</span> <span className="text-gray-900 font-medium">{form.duration} min</span></div>
          <div><span className="text-gray-500">Total Points:</span> <span className="text-gray-900 font-medium">{form.totalPoints}</span></div>
          <div><span className="text-gray-500">Questions:</span> <span className="text-gray-900 font-medium">{form.questionSelection === 'manual' ? form.questions.length : form.randomConfig.totalQuestions}</span></div>
          <div><span className="text-gray-500">Proctoring:</span> <span className="text-gray-900 font-medium">{form.proctoring.enabled ? 'Enabled' : 'Disabled'}</span></div>
          <div><span className="text-gray-500">Category:</span> <span className="text-gray-900 font-medium">{form.examCategory || 'None'}</span></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 text-gray-400 hover:text-gray-600">
            <FaArrowLeft />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {examId ? 'Edit Exam' : 'Create Exam'}
          </h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <button
                onClick={() => setStep(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  step === i
                    ? 'bg-primary-600 text-gray-900'
                    : step > i
                    ? 'bg-primary-50 text-primary-600'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s}
              </button>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-gray-100" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200 p-6 shadow-card-sm"
        >
          {renderStep()}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              step === 0 ? 'text-gray-500' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FaArrowLeft className="text-xs" /> Previous
          </button>

          {step === STEPS.length - 1 ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-500 text-gray-900 rounded-xl text-sm font-semibold hover:from-primary-700 hover:to-primary-600 transition-colors"
            >
              <FaSave className="text-xs" />
              {saving ? 'Saving...' : examId ? 'Update Exam' : 'Create Exam'}
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-500 text-gray-900 rounded-xl text-sm font-medium hover:from-primary-700 hover:to-primary-600"
            >
              Next <FaArrowRight className="text-xs" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateExam;
