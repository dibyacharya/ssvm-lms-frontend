import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

const AIApprovalModal = ({ isOpen, onClose, questions, onApprove, onReject }) => {
  const [selectedQuestions, setSelectedQuestions] = useState(new Set());

  if (!isOpen) return null;

  const toggleQuestion = (questionId) => {
    const newSelected = new Set(selectedQuestions);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedQuestions(newSelected);
  };

  const handleApprove = () => {
    const approved = questions.filter(q => selectedQuestions.has(q.id));
    onApprove(approved);
    setSelectedQuestions(new Set());
    onClose();
  };

  const handleReject = () => {
    const rejected = questions.filter(q => selectedQuestions.has(q.id));
    onReject(rejected);
    setSelectedQuestions(new Set());
    onClose();
  };

  const approveAll = () => {
    const allIds = new Set(questions.map(q => q.id));
    setSelectedQuestions(allIds);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Sparkles className="text-blue-500" size={24} />
            <h2 className="text-2xl font-bold">Review AI Generated Questions</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {questions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No AI generated questions to review
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">
                  {selectedQuestions.size} of {questions.length} selected
                </span>
                <button
                  onClick={approveAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
              </div>
              <div className="space-y-4">
                {questions.map((q) => (
                  <div
                    key={q.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedQuestions.has(q.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => toggleQuestion(q.id)}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(q.id)}
                        onChange={() => toggleQuestion(q.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Sparkles size={10} />
                            AI Generated
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            q.type === 'objective' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {q.type === 'objective' ? 'MCQ' : 'Subjective'}
                          </span>
                          {q.bloomLevel && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {q.bloomLevel}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-900 mb-2">{q.question}</p>
                        {q.type === 'objective' && q.options && (
                          <div className="space-y-1 mt-2">
                            {q.options.map((option, idx) => (
                              <div
                                key={idx}
                                className={`text-sm p-2 rounded ${
                                  q.correctAnswer === option
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-gray-50 text-gray-700'
                                }`}
                              >
                                <span className="font-medium mr-2">
                                  {String.fromCharCode(65 + idx)}.
                                </span>
                                {option}
                                {q.correctAnswer === option && (
                                  <CheckCircle2 className="inline ml-2" size={14} />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={selectedQuestions.size === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <XCircle size={16} />
            Reject Selected
          </button>
          <button
            onClick={handleApprove}
            disabled={selectedQuestions.size === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CheckCircle2 size={16} />
            Approve Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIApprovalModal;


