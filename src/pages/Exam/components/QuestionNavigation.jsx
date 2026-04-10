import React from 'react';

const QuestionNavigation = ({ questions, answers, currentIndex, onNavigate }) => {
  const getStatus = (index) => {
    const answer = answers[index];
    if (answer?.markedForReview) return 'review';
    if (answer?.answer) return 'answered';
    return 'unanswered';
  };

  const statusStyles = {
    answered: 'bg-blue-500 text-gray-900 border-blue-500',
    unanswered: 'bg-white text-gray-500 border-gray-200 hover:border-gray-300',
    review: 'bg-amber-500 text-gray-900 border-amber-500',
  };

  const answeredCount = answers.filter((a) => a?.answer).length;
  const reviewCount = answers.filter((a) => a?.markedForReview).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Questions</h3>

      <div className="grid grid-cols-5 gap-1.5 mb-4">
        {questions.map((_, i) => {
          const status = getStatus(i);
          return (
            <button
              key={i}
              onClick={() => onNavigate(i)}
              className={`w-full aspect-square rounded-lg border text-xs font-semibold flex items-center justify-center transition-all ${
                i === currentIndex
                  ? 'ring-2 ring-blue-500 ring-offset-1'
                  : ''
              } ${statusStyles[status]}`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="space-y-1.5 text-[11px]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-gray-600">Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-gray-600">Marked for Review ({reviewCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded border border-gray-200 bg-white" />
          <span className="text-gray-600">
            Not Answered ({questions.length - answeredCount})
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigation;
