import React, { useState, useMemo } from 'react';
import { ThumbsUp, Star, X, Check, HelpCircle, Send, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatusBadge({ status }) {
  if (status === 'answered') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-400">
        <Check className="w-3 h-3" />
        Answered
      </span>
    );
  }
  if (status === 'dismissed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
        <X className="w-3 h-3" />
        Dismissed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-green-400">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      Open
    </span>
  );
}

function QuestionCard({
  question,
  isHighlighted,
  isTeacher,
  userId,
  upvote,
  answer,
  dismiss,
  highlight,
}) {
  const [answering, setAnswering] = useState(false);
  const [answerText, setAnswerText] = useState('');

  const hasUpvoted = question.upvotedBy?.includes(userId);

  const handleSubmitAnswer = () => {
    if (!answerText.trim()) return;
    answer(question._id, answerText.trim());
    setAnswerText('');
    setAnswering(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-lg p-3 transition-colors ${
        isHighlighted
          ? 'border border-indigo-500 bg-slate-800/80 animate-pulse'
          : 'border border-slate-700 bg-slate-800/50'
      }`}
    >
      {/* Question text */}
      <p className="text-sm text-slate-100 leading-relaxed">{question.text}</p>

      {/* Meta row */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            {question.anonymous ? 'Anonymous' : question.askerName}
          </span>
          <span className="text-xs text-slate-500">{timeAgo(question.createdAt)}</span>
        </div>
        <StatusBadge status={question.status} />
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 mt-2">
        {/* Upvote */}
        <button
          onClick={() => upvote(question._id)}
          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
            hasUpvoted
              ? 'bg-indigo-600/30 text-indigo-300'
              : 'bg-slate-700/60 text-slate-400 hover:text-indigo-300 hover:bg-slate-700'
          }`}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasUpvoted ? 'fill-indigo-400' : ''}`} />
          {question.upvoteCount ?? 0}
        </button>

        {/* Teacher actions */}
        {isTeacher && question.status === 'open' && (
          <>
            <button
              onClick={() => setAnswering((prev) => !prev)}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-700/60 text-slate-400 hover:text-green-300 hover:bg-slate-700 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Answer
            </button>
            <button
              onClick={() => highlight(question._id)}
              className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                isHighlighted
                  ? 'bg-yellow-600/30 text-yellow-300'
                  : 'bg-slate-700/60 text-slate-400 hover:text-yellow-300 hover:bg-slate-700'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${isHighlighted ? 'fill-yellow-400' : ''}`} />
              Highlight
            </button>
            <button
              onClick={() => dismiss(question._id)}
              className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-700/60 text-slate-400 hover:text-red-300 hover:bg-slate-700 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Dismiss
            </button>
          </>
        )}
      </div>

      {/* Inline answer form */}
      {answering && (
        <div className="mt-3 space-y-2">
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your answer..."
            rows={3}
            className="w-full rounded-md bg-slate-900 border border-slate-600 text-sm text-slate-100 placeholder-slate-500 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmitAnswer}
              disabled={!answerText.trim()}
              className="text-xs px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Submit
            </button>
            <button
              onClick={() => {
                setAnswering(false);
                setAnswerText('');
              }}
              className="text-xs px-3 py-1.5 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Displayed answer */}
      {question.status === 'answered' && question.answerText && (
        <div className="mt-3 rounded-md bg-slate-900/60 border border-slate-700 p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-xs font-semibold text-indigo-400">A:</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/30 text-indigo-300 font-medium">
              Teacher
            </span>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{question.answerText}</p>
        </div>
      )}
    </motion.div>
  );
}

export default function QnAPanel({
  questions = [],
  highlightedIdx,
  askQuestion,
  upvote,
  answer,
  dismiss,
  highlight,
  isTeacher,
  userId,
}) {
  const [text, setText] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const sortedQuestions = useMemo(() => {
    return [...questions].sort((a, b) => {
      const aHighlighted = questions.indexOf(a) === highlightedIdx ? 1 : 0;
      const bHighlighted = questions.indexOf(b) === highlightedIdx ? 1 : 0;
      if (bHighlighted !== aHighlighted) return bHighlighted - aHighlighted;
      return (b.upvoteCount ?? 0) - (a.upvoteCount ?? 0);
    });
  }, [questions, highlightedIdx]);

  const handleAsk = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    askQuestion(text.trim(), anonymous);
    setText('');
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900">
      {/* Sub-header */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-700">
        <Eye className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-xs text-slate-400">{questions.length} question{questions.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Ask form */}
      <form onSubmit={handleAsk} className="px-3 py-3 border-b border-slate-700 space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1 rounded-md bg-slate-800 border border-slate-600 text-sm text-slate-100 placeholder-slate-500 px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={(e) => setAnonymous(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
          />
          <span className="text-xs text-slate-400">Ask anonymously</span>
        </label>
      </form>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 scrollbar-thin scrollbar-thumb-slate-700">
        {sortedQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-12">
            <HelpCircle className="w-10 h-10 text-slate-600" />
            <p className="text-sm text-slate-500">No questions yet. Ask something!</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {sortedQuestions.map((q) => {
              const originalIdx = questions.indexOf(q);
              return (
                <QuestionCard
                  key={q._id}
                  question={q}
                  isHighlighted={originalIdx === highlightedIdx}
                  isTeacher={isTeacher}
                  userId={userId}
                  upvote={upvote}
                  answer={answer}
                  dismiss={dismiss}
                  highlight={highlight}
                />
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
