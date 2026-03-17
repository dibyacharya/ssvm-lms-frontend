import React from 'react';

const QuestionRenderer = ({ question, answer, onAnswerChange, index, readOnly = false }) => {
  const renderMCQ = () => (
    <div className="space-y-2">
      {question.options?.map((opt, i) => (
        <label
          key={i}
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
            answer === opt
              ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          } ${readOnly ? 'cursor-default' : ''}`}
        >
          <input
            type="radio"
            name={`q-${question._id}`}
            value={opt}
            checked={answer === opt}
            onChange={() => !readOnly && onAnswerChange(opt)}
            disabled={readOnly}
            className="w-4 h-4 text-indigo-600"
          />
          <span className="text-sm">{opt}</span>
        </label>
      ))}
    </div>
  );

  const renderTrueFalse = () => (
    <div className="flex gap-3">
      {['True', 'False'].map((opt) => (
        <button
          key={opt}
          onClick={() => !readOnly && onAnswerChange(opt)}
          disabled={readOnly}
          className={`flex-1 py-3 px-6 rounded-xl border text-sm font-medium transition-all ${
            answer === opt
              ? opt === 'True'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-red-500 bg-red-50 text-red-700'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );

  const renderShortAnswer = () => (
    <input
      type="text"
      value={answer || ''}
      onChange={(e) => !readOnly && onAnswerChange(e.target.value)}
      disabled={readOnly}
      placeholder="Type your answer..."
      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
  );

  const renderLongAnswer = () => (
    <textarea
      value={answer || ''}
      onChange={(e) => !readOnly && onAnswerChange(e.target.value)}
      disabled={readOnly}
      placeholder="Write your detailed answer..."
      rows={6}
      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-y"
    />
  );

  const renderFillInBlank = () => (
    <input
      type="text"
      value={answer || ''}
      onChange={(e) => !readOnly && onAnswerChange(e.target.value)}
      disabled={readOnly}
      placeholder="Fill in the blank..."
      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
    />
  );

  const typeLabels = {
    mcq: 'Multiple Choice',
    true_false: 'True / False',
    short_answer: 'Short Answer',
    long_answer: 'Long Answer',
    fill_in_blank: 'Fill in the Blank',
  };

  const typeColors = {
    mcq: 'bg-blue-100 text-blue-700',
    true_false: 'bg-purple-100 text-purple-700',
    short_answer: 'bg-amber-100 text-amber-700',
    long_answer: 'bg-emerald-100 text-emerald-700',
    fill_in_blank: 'bg-pink-100 text-pink-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-sm font-bold">
            {index + 1}
          </span>
          <p className="text-gray-900 text-sm leading-relaxed pt-1">{question.question}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeColors[question.type] || 'bg-gray-100 text-gray-600'}`}>
            {typeLabels[question.type] || question.type}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600">
            {question.points} pts
          </span>
        </div>
      </div>

      <div className="mt-4">
        {question.type === 'mcq' && renderMCQ()}
        {question.type === 'true_false' && renderTrueFalse()}
        {question.type === 'short_answer' && renderShortAnswer()}
        {question.type === 'long_answer' && renderLongAnswer()}
        {question.type === 'fill_in_blank' && renderFillInBlank()}
      </div>
    </div>
  );
};

export default QuestionRenderer;
