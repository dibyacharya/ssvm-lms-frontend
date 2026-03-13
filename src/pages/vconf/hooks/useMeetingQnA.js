import { useState, useCallback, useEffect } from "react";
import {
  submitVconfQuestion,
  getVconfQuestions,
  toggleVconfUpvote,
  answerVconfQuestion,
  dismissVconfQuestion,
  highlightVconfQuestion,
} from "../../../services/vconf.service";

/**
 * Hook for Q&A panel during a meeting.
 * Uses API for persistence + DataChannel for real-time updates.
 */
export function useMeetingQnA(meetingId, sendCommand, userId) {
  const [questions, setQuestions] = useState([]);
  const [highlightedIdx, setHighlightedIdx] = useState(null);

  // Load existing questions on mount (late-join recovery)
  useEffect(() => {
    if (!meetingId) return;
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  const loadQuestions = useCallback(async () => {
    try {
      const data = await getVconfQuestions(meetingId);
      setQuestions(data.questions || []);
      const hl = (data.questions || []).findIndex((q) => q.isHighlighted);
      setHighlightedIdx(hl >= 0 ? hl : null);
    } catch (err) {
      console.error("[Q&A] loadQuestions error:", err);
    }
  }, [meetingId]);

  const askQuestion = useCallback(
    async (text, isAnonymous = false) => {
      try {
        const res = await submitVconfQuestion(meetingId, text, isAnonymous);
        // Add to local state
        setQuestions((prev) => [...prev, res.question]);

        // Broadcast via DataChannel
        sendCommand({
          type: "QNA_NEW",
          questionIdx: res.questionIdx,
          text: res.question.text,
          askedByName: res.question.askedByName,
          askedAt: res.question.askedAt,
          isAnonymous: res.question.isAnonymous,
        });
        return res;
      } catch (err) {
        console.error("[Q&A] askQuestion error:", err);
        throw err;
      }
    },
    [meetingId, sendCommand]
  );

  const upvote = useCallback(
    async (questionIdx) => {
      try {
        const res = await toggleVconfUpvote(meetingId, questionIdx);
        // Update local state
        setQuestions((prev) =>
          prev.map((q, i) =>
            i === questionIdx
              ? { ...q, upvoteCount: res.upvoteCount }
              : q
          )
        );
        sendCommand({
          type: "QNA_UPVOTE",
          questionIdx,
          upvoteCount: res.upvoteCount,
          userId,
        });
      } catch (err) {
        console.error("[Q&A] upvote error:", err);
      }
    },
    [meetingId, sendCommand, userId]
  );

  const answer = useCallback(
    async (questionIdx, answerText) => {
      try {
        const res = await answerVconfQuestion(meetingId, questionIdx, answerText);
        setQuestions((prev) =>
          prev.map((q, i) =>
            i === questionIdx
              ? { ...q, answer: res.question.answer, status: "answered", isHighlighted: false }
              : q
          )
        );
        if (highlightedIdx === questionIdx) setHighlightedIdx(null);

        sendCommand({
          type: "QNA_ANSWER",
          questionIdx,
          answer: answerText,
          status: "answered",
        });
      } catch (err) {
        console.error("[Q&A] answer error:", err);
        throw err;
      }
    },
    [meetingId, sendCommand, highlightedIdx]
  );

  const dismiss = useCallback(
    async (questionIdx) => {
      try {
        await dismissVconfQuestion(meetingId, questionIdx);
        setQuestions((prev) =>
          prev.map((q, i) =>
            i === questionIdx ? { ...q, status: "dismissed", isHighlighted: false } : q
          )
        );
        if (highlightedIdx === questionIdx) setHighlightedIdx(null);

        sendCommand({ type: "QNA_DISMISS", questionIdx });
      } catch (err) {
        console.error("[Q&A] dismiss error:", err);
      }
    },
    [meetingId, sendCommand, highlightedIdx]
  );

  const highlight = useCallback(
    async (questionIdx) => {
      try {
        const res = await highlightVconfQuestion(meetingId, questionIdx);
        setHighlightedIdx(res.isHighlighted ? questionIdx : null);
        setQuestions((prev) =>
          prev.map((q, i) => ({
            ...q,
            isHighlighted: i === questionIdx ? res.isHighlighted : false,
          }))
        );
        sendCommand({
          type: "QNA_HIGHLIGHT",
          questionIdx,
          isHighlighted: res.isHighlighted,
        });
      } catch (err) {
        console.error("[Q&A] highlight error:", err);
      }
    },
    [meetingId, sendCommand]
  );

  const handleIncoming = useCallback((data) => {
    if (data.type === "QNA_NEW") {
      setQuestions((prev) => [
        ...prev,
        {
          text: data.text,
          askedByName: data.askedByName,
          askedAt: data.askedAt,
          isAnonymous: data.isAnonymous,
          upvoteCount: 0,
          upvotes: [],
          status: "open",
          answer: "",
          isHighlighted: false,
        },
      ]);
    } else if (data.type === "QNA_UPVOTE") {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === data.questionIdx
            ? { ...q, upvoteCount: data.upvoteCount }
            : q
        )
      );
    } else if (data.type === "QNA_ANSWER") {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === data.questionIdx
            ? { ...q, answer: data.answer, status: "answered", isHighlighted: false }
            : q
        )
      );
    } else if (data.type === "QNA_DISMISS") {
      setQuestions((prev) =>
        prev.map((q, i) =>
          i === data.questionIdx
            ? { ...q, status: "dismissed", isHighlighted: false }
            : q
        )
      );
    } else if (data.type === "QNA_HIGHLIGHT") {
      setHighlightedIdx(data.isHighlighted ? data.questionIdx : null);
      setQuestions((prev) =>
        prev.map((q, i) => ({
          ...q,
          isHighlighted: i === data.questionIdx ? data.isHighlighted : false,
        }))
      );
    }
  }, []);

  return {
    questions,
    highlightedIdx,
    askQuestion,
    upvote,
    answer,
    dismiss,
    highlight,
    handleIncoming,
    loadQuestions,
  };
}

export default useMeetingQnA;
