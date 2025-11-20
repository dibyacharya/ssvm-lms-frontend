import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';

const AddQuestionModal = ({ isOpen, onClose, onSave, courseData, bloomLevels, getCourseOutcomes, formatOutcomeForDisplay, extractOutcomeCode, totalPoints = 100, isUngraded = false, currentTotalPoints = 0 }) => {
  const [question, setQuestion] = useState('');
  const [points, setPoints] = useState(10);
  const [bloomLevel, setBloomLevel] = useState('');
  const [courseOutcome, setCourseOutcome] = useState('');

  // Set points to 0 when assignment is ungraded, or reset to default when modal opens for graded assignment
  useEffect(() => {
    if (isUngraded) {
      setPoints(0);
    } else if (isOpen && !isUngraded && points === 0) {
      // Reset to default when opening modal for graded assignment
      setPoints(10);
    }
  }, [isUngraded, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    // For ungraded assignments, always use 0 points
    const questionPoints = isUngraded ? 0 : (points || 10);
    
    // Only validate if assignment is not ungraded
    if (!isUngraded && totalPoints > 0) {
      const newTotal = currentTotalPoints + questionPoints;
      
      if (newTotal > totalPoints) {
        const remaining = totalPoints - currentTotalPoints;
        if (remaining <= 0) {
          alert(`Cannot add question. Total points already reached (${currentTotalPoints}/${totalPoints}). Please adjust question points or total assignment points.`);
          return;
        }
        const confirm = window.confirm(
          `Warning: Adding this question will exceed the total points (${newTotal} > ${totalPoints}).\n\n` +
          `Current total: ${currentTotalPoints} points\n` +
          `This question: ${questionPoints} points\n` +
          `Remaining points available: ${remaining} points\n\n` +
          `Would you like to proceed anyway?`
        );
        if (!confirm) {
          return;
        }
      }
    }

    const newQuestion = {
      id: `manual_${Date.now()}`,
      question: question.trim(),
      type: 'subjective',
      points: questionPoints,
      score: questionPoints, // Add score field for per-question scoring
      bloomLevel: bloomLevel || undefined,
      courseOutcome: extractOutcomeCode(courseOutcome) || undefined,
      source: 'manual',
      status: 'approved'
    };

    onSave(newQuestion);
    
    // Reset form
    setQuestion('');
    setPoints(isUngraded ? 0 : 10);
    setBloomLevel('');
    setCourseOutcome('');
    onClose();
  };

  const handleCancel = () => {
    setQuestion('');
    setPoints(isUngraded ? 0 : 10);
    setBloomLevel('');
    setCourseOutcome('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Plus className="text-green-500" size={24} />
            <h2 className="text-2xl font-bold">Add Question</h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Text <span className="text-red-500">*</span>
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows="6"
                placeholder="Enter your question here..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isUngraded ? 'text-gray-400' : 'text-gray-700'}`}>
                  Points
                  {isUngraded && (
                    <span className="text-xs text-gray-400 ml-2">
                      (Ungraded - disabled)
                    </span>
                  )}
                  {!isUngraded && totalPoints > 0 && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Remaining: {totalPoints - currentTotalPoints} pts)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={points}
                  onChange={(e) => {
                    if (!isUngraded) {
                      setPoints(Number(e.target.value));
                    }
                  }}
                  min="0"
                  max={!isUngraded && totalPoints > 0 ? totalPoints - currentTotalPoints : undefined}
                  disabled={isUngraded}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    isUngraded 
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'border-gray-300'
                  }`}
                />
                {isUngraded ? (
                  <p className="text-xs text-gray-400 mt-1 italic">
                    This assignment is ungraded - points are set to 0
                  </p>
                ) : totalPoints > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Total: {currentTotalPoints} / {totalPoints} points
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bloom Level</label>
                <select
                  value={bloomLevel}
                  onChange={(e) => setBloomLevel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select level</option>
                  {bloomLevels.map(level => (
                    <option key={level} value={level.toLowerCase()}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Outcome</label>
                {getCourseOutcomes().length > 0 ? (
                  <select
                    value={courseOutcome}
                    onChange={(e) => setCourseOutcome(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                  <div className="w-full p-3 border border-yellow-300 rounded-lg bg-yellow-50">
                    <p className="text-sm text-yellow-800">
                      No course outcomes found. Please add course outcomes in course settings.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Save size={16} />
            Add Question
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddQuestionModal;

