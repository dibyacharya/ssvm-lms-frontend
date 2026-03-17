import React, { useState } from 'react';
import { FaPlus, FaTrash } from 'react-icons/fa';

const TYPES = [
  { value: 'mcq', label: 'Multiple Choice' },
  { value: 'true_false', label: 'True / False' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'long_answer', label: 'Long Answer' },
  { value: 'fill_in_blank', label: 'Fill in the Blank' },
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const BLOOM_LEVELS = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'];

const QuestionForm = ({ initial = {}, onSave, onCancel }) => {
  const [form, setForm] = useState({
    question: initial.question || '',
    type: initial.type || 'mcq',
    options: initial.options || ['', '', '', ''],
    correctAnswer: initial.correctAnswer || '',
    modelAnswer: initial.modelAnswer || '',
    points: initial.points || 1,
    difficulty: initial.difficulty || 'medium',
    bloomLevel: initial.bloomLevel || '',
    topic: initial.topic || '',
    explanation: initial.explanation || '',
    courseOutcome: initial.courseOutcome || '',
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addOption = () => {
    if (form.options.length >= 6) return;
    update('options', [...form.options, '']);
  };

  const removeOption = (idx) => {
    const newOpts = form.options.filter((_, i) => i !== idx);
    update('options', newOpts);
    if (form.correctAnswer === form.options[idx]) update('correctAnswer', '');
  };

  const updateOption = (idx, value) => {
    const newOpts = [...form.options];
    if (form.correctAnswer === newOpts[idx]) update('correctAnswer', value);
    newOpts[idx] = value;
    update('options', newOpts);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.question.trim()) return;
    onSave(form);
  };

  const needsOptions = form.type === 'mcq';
  const needsCorrectAnswer = ['mcq', 'true_false', 'fill_in_blank'].includes(form.type);
  const needsModelAnswer = ['short_answer', 'long_answer'].includes(form.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Question text */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Question *</label>
        <textarea
          value={form.question}
          onChange={(e) => update('question', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Type + Points + Difficulty row */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Type *</label>
          <select
            value={form.type}
            onChange={(e) => {
              update('type', e.target.value);
              if (e.target.value === 'true_false') {
                update('options', ['True', 'False']);
              }
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Points</label>
          <input
            type="number"
            value={form.points}
            onChange={(e) => update('points', Number(e.target.value))}
            min={0.5}
            step={0.5}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Difficulty</label>
          <select
            value={form.difficulty}
            onChange={(e) => update('difficulty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Options for MCQ */}
      {needsOptions && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Options *</label>
          <div className="space-y-2">
            {form.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={form.correctAnswer === opt && opt !== ''}
                  onChange={() => update('correctAnswer', opt)}
                  className="w-4 h-4 text-indigo-600"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(i, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {form.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <FaTrash className="text-xs" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {form.options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <FaPlus className="text-[10px]" /> Add Option
            </button>
          )}
          <p className="text-[10px] text-gray-400 mt-1">Select the radio button next to the correct answer</p>
        </div>
      )}

      {/* Correct answer for true_false, fill_in_blank */}
      {needsCorrectAnswer && form.type !== 'mcq' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Correct Answer *</label>
          {form.type === 'true_false' ? (
            <select
              value={form.correctAnswer}
              onChange={(e) => update('correctAnswer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select...</option>
              <option value="True">True</option>
              <option value="False">False</option>
            </select>
          ) : (
            <input
              type="text"
              value={form.correctAnswer}
              onChange={(e) => update('correctAnswer', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>
      )}

      {/* Model answer for subjective */}
      {needsModelAnswer && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Model Answer (Reference)</label>
          <textarea
            value={form.modelAnswer}
            onChange={(e) => update('modelAnswer', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Topic + Bloom Level */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Topic</label>
          <input
            type="text"
            value={form.topic}
            onChange={(e) => update('topic', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Bloom's Level</label>
          <select
            value={form.bloomLevel}
            onChange={(e) => update('bloomLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">None</option>
            {BLOOM_LEVELS.map((b) => (
              <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Explanation (shown after exam)</label>
        <textarea
          value={form.explanation}
          onChange={(e) => update('explanation', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          {initial._id ? 'Update Question' : 'Add Question'}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
