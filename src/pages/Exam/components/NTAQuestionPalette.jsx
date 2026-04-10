import React from "react";

/**
 * NTA-style question navigation palette with 5 states:
 * - Green: Answered
 * - Red: Not Answered (visited but no answer)
 * - Purple: Marked for Review (no answer)
 * - Purple+Green stripe: Answered AND Marked for Review
 * - Gray: Not Visited
 */
const NTAQuestionPalette = ({
  questions = [],
  answers = {},
  visitedSet = new Set(),
  currentIndex = 0,
  onNavigate,
  sectionSummary = null,
}) => {
  const getQuestionState = (question, idx) => {
    const qId = question._id;
    const answer = answers[qId];
    const hasAnswer = answer && answer.trim();
    const isVisited = visitedSet.has(qId);
    const isMarkedForReview = question.markedForReview || false;

    if (hasAnswer && isMarkedForReview) return "answered_review";
    if (hasAnswer) return "answered";
    if (isMarkedForReview) return "review";
    if (isVisited) return "not_answered";
    return "not_visited";
  };

  const stateStyles = {
    answered: "bg-emerald-500 text-gray-900",
    not_answered: "bg-red-500 text-gray-900",
    review: "bg-primary-500 text-gray-900",
    answered_review:
      "bg-gradient-to-br from-primary-500 to-emerald-500 text-gray-900",
    not_visited: "bg-surface-600 text-gray-600",
  };

  const stateLabels = {
    answered: "Answered",
    not_answered: "Not Answered",
    review: "Marked for Review",
    answered_review: "Answered & Marked for Review",
    not_visited: "Not Visited",
  };

  // Count states
  const stateCounts = { answered: 0, not_answered: 0, review: 0, answered_review: 0, not_visited: 0 };
  questions.forEach((q, idx) => {
    const state = getQuestionState(q, idx);
    stateCounts[state]++;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2 p-3">
        {questions.map((q, idx) => {
          const state = getQuestionState(q, idx);
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q._id}
              onClick={() => onNavigate(idx)}
              className={`
                w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold
                transition-all duration-150
                ${stateStyles[state]}
                ${isCurrent ? "ring-2 ring-blue-500 ring-offset-2 ring-offset-surface-900 scale-110" : "hover:scale-105"}
              `}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 border-t border-gray-200 space-y-2">
        {Object.entries(stateLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className={`w-5 h-5 rounded ${stateStyles[key]} inline-block`} />
            <span className="text-gray-600">
              {label} ({stateCounts[key]})
            </span>
          </div>
        ))}
      </div>

      {/* Section Summary */}
      {sectionSummary && (
        <div className="mt-3 p-3 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 mb-1">Section Summary</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <span className="text-emerald-600">Answered: {sectionSummary.answered}</span>
            <span className="text-red-600">Not Answered: {sectionSummary.notAnswered}</span>
            <span className="text-primary-600">Review: {sectionSummary.review}</span>
            <span className="text-gray-500">Not Visited: {sectionSummary.notVisited}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NTAQuestionPalette;
