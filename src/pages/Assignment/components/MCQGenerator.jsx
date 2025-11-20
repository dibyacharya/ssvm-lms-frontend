import React, { useState } from 'react';
import { Plus, Trash, Sparkles, Save } from 'lucide-react';

const MCQGenerator = ({ 
  onSave, 
  onCancel, 
  courseData, 
  bloomLevels = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'],
  getCourseOutcomes = () => [],
  formatOutcomeForDisplay = (outcome) => String(outcome),
  extractOutcomeCode = (outcome) => String(outcome)
}) => {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      bloomLevel: '',
      courseOutcome: ''
    }
  ]);

  const addQuestion = () => {
    setQuestions([...questions, {
      id: Date.now(),
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      points: 10,
      bloomLevel: '',
      courseOutcome: ''
    }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { ...q, [field]: value };
      }
      return q;
    }));
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSave = () => {
    const formattedQuestions = questions
      .filter(q => q.question.trim() && q.options.some(opt => opt.trim()))
      .map(q => ({
        id: `mcq_${q.id}`,
        question: q.question,
        type: 'objective',
        options: q.options.filter(opt => opt.trim()),
        correctAnswer: q.correctAnswer,
        points: q.points,
        bloomLevel: q.bloomLevel || undefined,
        courseOutcome: extractOutcomeCode(q.courseOutcome) || undefined,
        source: 'generated'
      }));
    
    onSave(formattedQuestions);
  };

  const isValid = questions.some(q => 
    q.question.trim() && 
    q.options.filter(opt => opt.trim()).length >= 2 &&
    q.correctAnswer.trim()
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="text-blue-500" size={24} />
          <h3 className="text-xl font-semibold">MCQ Question Generator</h3>
        </div>
        <button
          onClick={addQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>

      <div className="space-y-6 max-h-[600px] overflow-y-auto">
        {questions.map((q, index) => (
          <div key={q.id} className="border rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">
                Question {index + 1}
              </span>
              {questions.length > 1 && (
                <button
                  onClick={() => removeQuestion(q.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={16} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text
                </label>
                <textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="2"
                  placeholder="Enter your question here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Options
                </label>
                <div className="space-y-2">
                  {q.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center gap-2">
                      <span className="w-6 text-sm font-medium text-gray-600">
                        {String.fromCharCode(65 + optIndex)}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                      />
                      <input
                        type="radio"
                        name={`correct_${q.id}`}
                        checked={q.correctAnswer === option}
                        onChange={() => updateQuestion(q.id, 'correctAnswer', option)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-xs text-gray-500">Correct</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={q.points}
                    onChange={(e) => updateQuestion(q.id, 'points', parseInt(e.target.value) || 10)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bloom Level
                  </label>
                  <select
                    value={q.bloomLevel}
                    onChange={(e) => updateQuestion(q.id, 'bloomLevel', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select level</option>
                    {bloomLevels.map(level => (
                      <option key={level} value={level.toLowerCase()}>{level}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Outcome
                  </label>
                  {getCourseOutcomes().length > 0 ? (
                    <select
                      value={q.courseOutcome}
                      onChange={(e) => updateQuestion(q.id, 'courseOutcome', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select course outcome</option>
                      {getCourseOutcomes().map((outcome, index) => {
                        const displayText = formatOutcomeForDisplay(outcome);
                        const code = extractOutcomeCode(outcome);
                        return (
                          <option key={index} value={code}>
                            {displayText}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <div className="w-full p-2 border border-yellow-300 rounded-lg bg-yellow-50">
                      <p className="text-xs text-yellow-800">
                        No course outcomes found. Please add course outcomes in course settings.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save size={16} />
          Save Questions
        </button>
      </div>
    </div>
  );
};

export default MCQGenerator;


