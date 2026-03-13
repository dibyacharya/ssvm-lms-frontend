import React, { useState } from "react";
import { BarChart3, Plus, X, Check, Vote } from "lucide-react";

// ---------------------------------------------------------------------------
// Result bar chart shared by both teacher and student views
// ---------------------------------------------------------------------------
const ResultsBarChart = ({ results }) => {
  if (!results || !results.options) return null;
  const totalVotes = results.options.reduce((sum, o) => sum + (o.count || 0), 0);

  return (
    <div className="space-y-2 mt-2">
      {results.options.map((opt, idx) => {
        const pct = totalVotes > 0 ? Math.round((opt.count / totalVotes) * 100) : 0;
        return (
          <div key={idx}>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-0.5">
              <span className="truncate mr-2">{opt.text}</span>
              <span className="shrink-0">
                {opt.count || 0} vote{opt.count !== 1 ? "s" : ""} ({pct}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-[11px] text-slate-500 text-right">
        {totalVotes} total response{totalVotes !== 1 ? "s" : ""}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Status badge
// ---------------------------------------------------------------------------
const StatusBadge = ({ status }) => {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide";
  if (status === "active")
    return (
      <span className={`${base} bg-green-900/50 text-green-400`}>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1" />
        Active
      </span>
    );
  if (status === "closed")
    return <span className={`${base} bg-red-900/40 text-red-400`}>Closed</span>;
  return <span className={`${base} bg-slate-700 text-slate-400`}>Draft</span>;
};

// ---------------------------------------------------------------------------
// Create Poll form (teacher only)
// ---------------------------------------------------------------------------
const CreatePollForm = ({ createPoll }) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [pollType, setPollType] = useState("single");
  const [loading, setLoading] = useState(false);

  const addOption = () => setOptions((prev) => [...prev, ""]);
  const removeOption = (idx) => setOptions((prev) => prev.filter((_, i) => i !== idx));
  const updateOption = (idx, val) =>
    setOptions((prev) => prev.map((o, i) => (i === idx ? val : o)));

  const handleCreate = async () => {
    const trimmedQ = question.trim();
    const trimmedOpts = options.map((o) => o.trim()).filter(Boolean);
    if (!trimmedQ || trimmedOpts.length < 2) return;
    setLoading(true);
    try {
      await createPoll(trimmedQ, trimmedOpts, pollType);
      setQuestion("");
      setOptions(["", ""]);
      setPollType("single");
    } catch {
      // error handled upstream
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700 space-y-3">
      <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
        <Plus size={14} /> Create Poll
      </h3>

      {/* Question */}
      <input
        type="text"
        placeholder="Enter your question..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />

      {/* Options */}
      <div className="space-y-1.5">
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 w-4 text-right shrink-0">
              {String.fromCharCode(65 + idx)}.
            </span>
            <input
              type="text"
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => updateOption(idx, e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {options.length > 2 && (
              <button
                onClick={() => removeOption(idx)}
                className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                title="Remove option"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        {options.length < 6 && (
          <button
            onClick={addOption}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors mt-1"
          >
            <Plus size={12} /> Add option
          </button>
        )}
      </div>

      {/* Type selector */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
          <input
            type="radio"
            name="pollType"
            value="single"
            checked={pollType === "single"}
            onChange={() => setPollType("single")}
            className="accent-blue-500"
          />
          Single choice
        </label>
        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
          <input
            type="radio"
            name="pollType"
            value="multiple"
            checked={pollType === "multiple"}
            onChange={() => setPollType("multiple")}
            className="accent-blue-500"
          />
          Multiple choice
        </label>
      </div>

      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={loading || !question.trim() || options.filter((o) => o.trim()).length < 2}
        className="w-full py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Creating..." : "Create Poll"}
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Teacher poll list item
// ---------------------------------------------------------------------------
const TeacherPollCard = ({ poll, pollResults, launchPoll, closePoll, fetchResults, broadcastResults }) => {
  const results = pollResults[poll._id];

  return (
    <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/60 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-slate-200 font-medium leading-snug flex-1">{poll.question}</p>
        <StatusBadge status={poll.status} />
      </div>

      {/* Options preview */}
      <div className="space-y-0.5">
        {poll.options?.map((opt, idx) => (
          <p key={idx} className="text-xs text-slate-400">
            {String.fromCharCode(65 + idx)}. {opt.text}
          </p>
        ))}
      </div>

      {/* Draft actions */}
      {poll.status === "draft" && (
        <button
          onClick={() => launchPoll(poll._id)}
          className="w-full py-1.5 rounded-md text-xs font-medium bg-green-600 hover:bg-green-500 text-white transition-colors"
        >
          Launch Poll
        </button>
      )}

      {/* Active actions */}
      {poll.status === "active" && (
        <div className="space-y-1.5">
          {poll.responseCount != null && (
            <p className="text-[11px] text-slate-400">
              {poll.responseCount} response{poll.responseCount !== 1 ? "s" : ""} so far
            </p>
          )}
          <div className="flex gap-1.5">
            <button
              onClick={() => broadcastResults(poll._id)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
            >
              <BarChart3 size={12} /> Show Results
            </button>
            <button
              onClick={() => closePoll(poll._id)}
              className="flex-1 py-1.5 rounded-md text-xs font-medium bg-red-600/80 hover:bg-red-500 text-white transition-colors"
            >
              Close Poll
            </button>
          </div>
        </div>
      )}

      {/* Closed — show results */}
      {poll.status === "closed" && (
        <>
          {results ? (
            <ResultsBarChart results={results} />
          ) : (
            <button
              onClick={() => fetchResults(poll._id)}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Load results
            </button>
          )}
        </>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Student voting card
// ---------------------------------------------------------------------------
const StudentVoteCard = ({ activePoll, votedPolls, vote, pollResults }) => {
  const [selected, setSelected] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const hasVoted = votedPolls.has(activePoll._id);
  const results = pollResults[activePoll._id];
  const isSingle = activePoll.pollType !== "multiple";

  const toggleOption = (idx) => {
    if (hasVoted) return;
    if (isSingle) {
      setSelected([idx]);
    } else {
      setSelected((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0 || hasVoted) return;
    setSubmitting(true);
    try {
      await vote(activePoll._id, selected);
    } catch {
      // handled upstream
    } finally {
      setSubmitting(false);
    }
  };

  // Show results if voted or poll closed or results broadcast
  if ((hasVoted || activePoll.status === "closed") && results) {
    return (
      <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/60 space-y-2">
        <p className="text-sm text-slate-200 font-medium">{activePoll.question}</p>
        {hasVoted && (
          <span className="inline-flex items-center gap-1 text-[11px] text-green-400 font-semibold">
            <Check size={12} /> Voted
          </span>
        )}
        <ResultsBarChart results={results} />
      </div>
    );
  }

  return (
    <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/60 space-y-3">
      <p className="text-sm text-slate-200 font-medium">{activePoll.question}</p>
      <p className="text-[11px] text-slate-500">
        {isSingle ? "Select one option" : "Select all that apply"}
      </p>

      <div className="space-y-1.5">
        {activePoll.options?.map((opt, idx) => {
          const isSelected = selected.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => toggleOption(idx)}
              disabled={hasVoted}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-left transition-colors border ${
                isSelected
                  ? "border-blue-500 bg-blue-600/20 text-blue-300"
                  : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
              } ${hasVoted ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {/* Radio / Checkbox indicator */}
              <span
                className={`shrink-0 flex items-center justify-center w-4 h-4 rounded-${isSingle ? "full" : "sm"} border ${
                  isSelected ? "border-blue-500 bg-blue-500" : "border-slate-600"
                }`}
              >
                {isSelected && <Check size={10} className="text-white" />}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {!hasVoted && (
        <button
          onClick={handleSubmit}
          disabled={submitting || selected.length === 0}
          className="w-full py-2 rounded-md text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Submitting..." : "Submit Vote"}
        </button>
      )}

      {hasVoted && (
        <span className="inline-flex items-center gap-1 text-xs text-green-400 font-semibold">
          <Check size={14} /> Voted
        </span>
      )}
    </div>
  );
};

// ===========================================================================
// PollPanel — main export
// ===========================================================================
const PollPanel = ({
  polls,
  activePoll,
  pollResults,
  votedPolls,
  createPoll,
  launchPoll,
  closePoll,
  vote,
  fetchResults,
  broadcastResults,
  isTeacher,
}) => {
  return (
    <div className="w-full h-full bg-slate-900 flex flex-col">
      {/* Sub-header */}
      <div className="px-4 py-2 border-b border-slate-700 flex items-center gap-2">
        <Vote size={14} className="text-blue-400" />
        <span className="text-xs text-slate-400">{polls.length} poll{polls.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {/* ---- TEACHER VIEW ---- */}
        {isTeacher && (
          <>
            <CreatePollForm createPoll={createPoll} />

            {polls.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold px-0.5">
                  All Polls
                </h4>
                {[...polls].reverse().map((poll) => (
                  <TeacherPollCard
                    key={poll._id}
                    poll={poll}
                    pollResults={pollResults}
                    launchPoll={launchPoll}
                    closePoll={closePoll}
                    fetchResults={fetchResults}
                    broadcastResults={broadcastResults}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ---- STUDENT VIEW ---- */}
        {!isTeacher && (
          <>
            {activePoll ? (
              <StudentVoteCard
                activePoll={activePoll}
                votedPolls={votedPolls}
                vote={vote}
                pollResults={pollResults}
              />
            ) : (
              /* Check if there are closed polls with results to show */
              polls.some((p) => p.status === "closed" && pollResults[p._id]) ? (
                <div className="space-y-3">
                  {polls
                    .filter((p) => p.status === "closed" && pollResults[p._id])
                    .reverse()
                    .map((poll) => (
                      <div
                        key={poll._id}
                        className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/60 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-slate-200 font-medium flex-1">
                            {poll.question}
                          </p>
                          <StatusBadge status="closed" />
                        </div>
                        {votedPolls.has(poll._id) && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-green-400 font-semibold">
                            <Check size={12} /> Voted
                          </span>
                        )}
                        <ResultsBarChart results={pollResults[poll._id]} />
                      </div>
                    ))}
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center h-full text-center py-16 px-4">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
                    <BarChart3 size={20} className="text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">No active poll right now</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Polls will appear here when your instructor launches one.
                  </p>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PollPanel;
