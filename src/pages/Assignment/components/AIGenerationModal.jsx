import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

const AIGenerationModal = ({ 
  isOpen, 
  onClose, 
  onGenerate, 
  courseData, 
  bloomLevels, 
  getCourseOutcomes, 
  formatOutcomeForDisplay, 
  extractOutcomeCode,
  generating,
  aiError
}) => {
  const [numQuestions, setNumQuestions] = useState(5);
  const [selectedBloomLevel, setSelectedBloomLevel] = useState('');
  const [selectedCourseOutcome, setSelectedCourseOutcome] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (!selectedCourseOutcome || !selectedBloomLevel) {
      alert('Please select a course outcome and Bloom\'s taxonomy level.');
      return;
    }
    onGenerate({
      numQuestions,
      selectedBloomLevel,
      selectedCourseOutcome,
      additionalContext
    });
  };

  const handleCancel = () => {
    setNumQuestions(5);
    setSelectedBloomLevel('');
    setSelectedCourseOutcome('');
    setAdditionalContext('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Sparkles className="text-blue-500" size={24} />
            <h2 className="text-2xl font-bold">Generate Questions with AI</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Number of Questions</label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  min="1"
                  max="20"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bloom Taxonomy Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBloomLevel}
                  onChange={(e) => setSelectedBloomLevel(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select level</option>
                  {bloomLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course Outcome <span className="text-red-500">*</span>
              </label>
              {getCourseOutcomes().length > 0 ? (
                <select
                  value={selectedCourseOutcome}
                  onChange={(e) => setSelectedCourseOutcome(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Additional Context (Optional)</label>
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="3"
                placeholder="Provide any additional context..."
              />
            </div>

            {aiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{aiError}</p>
              </div>
            )}
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
            onClick={handleGenerate}
            disabled={generating || !numQuestions || !selectedCourseOutcome || !selectedBloomLevel}
            className="px-4 py-2 bg-blue-600 text-gray-900 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {generating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Questions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIGenerationModal;



