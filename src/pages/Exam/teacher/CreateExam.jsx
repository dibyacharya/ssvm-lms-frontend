import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaArrowRight, FaPlus, FaTrash, FaSave } from 'react-icons/fa';
import { createExam, updateExam, getExamById } from '../../../services/exam.service';
import { getQuestions } from '../../../services/questionBank.service';
import QuestionForm from '../components/QuestionForm';
import toast from 'react-hot-toast';

const STEPS = ['Details', 'Questions', 'Proctoring', 'Review'];

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
      maxWarnings: 5,
      autoSubmitOnMaxViolations: true,
    },
    shuffleQuestions: false,
    shuffleOptions: false,
    showResultsToStudent: false,
    examCategory: null,
    maxAttempts: 1,
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
        return renderQuestionsStep();
      case 2:
        return renderProctoringStep();
      case 3:
        return renderReviewStep();
      default:
        return null;
    }
  };

  const renderDetailsStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Exam Title *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="e.g., Mid Term Examination"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Exam Type *</label>
          <select
            value={form.examType}
            onChange={(e) => update('examType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="quiz">Quiz</option>
            <option value="mid_term">Mid Term</option>
            <option value="end_term">End Term</option>
            <option value="practice">Practice</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Grade Category</label>
          <select
            value={form.examCategory || ''}
            onChange={(e) => update('examCategory', e.target.value || null)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">None (ungraded)</option>
            <option value="midTerm">Mid Term (Assessment Plan)</option>
            <option value="endTerm">End Term (Assessment Plan)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Start Time *</label>
          <input
            type="datetime-local"
            value={form.scheduledStartTime}
            onChange={(e) => update('scheduledStartTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">End Time *</label>
          <input
            type="datetime-local"
            value={form.scheduledEndTime}
            onChange={(e) => update('scheduledEndTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Duration (minutes) *</label>
          <input
            type="number"
            value={form.duration}
            onChange={(e) => update('duration', Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Late Entry (min)</label>
          <input
            type="number"
            value={form.allowLateEntry}
            onChange={(e) => update('allowLateEntry', Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Total Points</label>
          <input
            type="number"
            value={form.totalPoints}
            onChange={(e) => update('totalPoints', Number(e.target.value))}
            min={1}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Instructions</label>
        <textarea
          value={form.instructions}
          onChange={(e) => update('instructions', e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Enter exam instructions for students..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.shuffleQuestions}
            onChange={(e) => update('shuffleQuestions', e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          Shuffle Questions
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.shuffleOptions}
            onChange={(e) => update('shuffleOptions', e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          Shuffle Options
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.showResultsToStudent}
            onChange={(e) => update('showResultsToStudent', e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded"
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
          className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="manual">Manual Selection</option>
          <option value="random_from_bank">Random from Question Bank</option>
        </select>
      </div>

      {form.questionSelection === 'manual' ? (
        <>
          {/* Added questions */}
          {form.questions.map((q, i) => (
            <div key={q._id || i} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
              <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">
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
                className="p-1.5 text-red-400 hover:text-red-600"
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
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 rounded-lg text-xs text-gray-700 flex items-center justify-between"
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
            <div className="border border-indigo-200 rounded-xl p-4">
              <QuestionForm onSave={addQuestion} onCancel={() => setShowQuestionForm(false)} />
            </div>
          ) : (
            <button
              onClick={() => setShowQuestionForm(true)}
              className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600 w-full justify-center"
            >
              <FaPlus className="text-xs" /> Add New Question
            </button>
          )}

          <p className="text-xs text-gray-400">
            Total: {form.questions.length} questions, {form.questions.reduce((s, q) => s + (q.points || 1), 0)} points
          </p>
        </>
      ) : (
        <div className="space-y-4 bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">
            Questions will be randomly selected from the Question Bank ({bankQuestions.length} approved questions available).
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Total Questions</label>
              <input
                type="number"
                value={form.randomConfig.totalQuestions}
                onChange={(e) =>
                  update('randomConfig', { ...form.randomConfig, totalQuestions: Number(e.target.value) })
                }
                min={1}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {['easy', 'medium', 'hard'].map((d) => (
              <div key={d}>
                <label className="block text-xs font-medium text-gray-700 mb-1 capitalize">{d}</label>
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
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
      <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <input
          type="checkbox"
          checked={form.proctoring.enabled}
          onChange={(e) => updateProctoring('enabled', e.target.checked)}
          className="w-5 h-5 text-indigo-600 rounded"
        />
        <div>
          <p className="text-sm font-semibold text-gray-900">Enable AI Proctoring</p>
          <p className="text-xs text-gray-500">Uses camera and browser monitoring</p>
        </div>
      </label>

      {form.proctoring.enabled && (
        <div className="space-y-3 pl-4 border-l-2 border-indigo-200">
          {[
            { key: 'faceDetection', label: 'Face Detection', desc: 'Verify student is present' },
            { key: 'multipleFaceDetection', label: 'Multiple Face Detection', desc: 'Alert if more than one face' },
            { key: 'tabSwitchDetection', label: 'Tab Switch Detection', desc: 'Alert if student switches tabs' },
            { key: 'copyPasteDetection', label: 'Copy/Paste Prevention', desc: 'Block copy, paste, cut' },
            { key: 'fullScreenEnforcement', label: 'Fullscreen Mode', desc: 'Force fullscreen during exam' },
            { key: 'periodicScreenshots', label: 'Periodic Screenshots', desc: 'Capture screenshots automatically' },
          ].map(({ key, label, desc }) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={form.proctoring[key]}
                onChange={(e) => updateProctoring(key, e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <div>
                <p className="text-sm text-gray-700">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
            </label>
          ))}

          <div className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Max Warnings</label>
              <input
                type="number"
                value={form.proctoring.maxWarnings}
                onChange={(e) => updateProctoring('maxWarnings', Number(e.target.value))}
                min={1}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Screenshot Interval (sec)</label>
              <input
                type="number"
                value={form.proctoring.screenshotIntervalSeconds}
                onChange={(e) => updateProctoring('screenshotIntervalSeconds', Number(e.target.value))}
                min={10}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <input
              type="checkbox"
              checked={form.proctoring.autoSubmitOnMaxViolations}
              onChange={(e) => updateProctoring('autoSubmitOnMaxViolations', e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            Auto-submit on max violations
          </label>
        </div>
      )}
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
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
                    ? 'bg-indigo-600 text-white'
                    : step > i
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {s}
              </button>
              {i < STEPS.length - 1 && <div className="flex-1 h-0.5 bg-gray-200" />}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          {renderStep()}
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${
              step === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FaArrowLeft className="text-xs" /> Previous
          </button>

          {step === STEPS.length - 1 ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <FaSave className="text-xs" />
              {saving ? 'Saving...' : examId ? 'Update Exam' : 'Create Exam'}
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
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
