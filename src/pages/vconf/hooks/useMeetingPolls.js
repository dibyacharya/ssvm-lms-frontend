import { useState, useCallback, useEffect } from "react";
import {
  createVconfPoll,
  getVconfPolls,
  launchVconfPoll,
  closeVconfPoll,
  respondToVconfPoll,
  getVconfPollResults,
} from "../../../services/vconf.service";

/**
 * Hook for live polls/quizzes during a meeting.
 * Uses API for CRUD + DataChannel for real-time broadcast.
 */
export function useMeetingPolls(meetingId, sendCommand, userId) {
  const [polls, setPolls] = useState([]);
  const [activePoll, setActivePoll] = useState(null);
  const [pollResults, setPollResults] = useState({});
  const [votedPolls, setVotedPolls] = useState(new Set());

  // Load existing polls on mount (late-join recovery)
  useEffect(() => {
    if (!meetingId) return;
    loadPolls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  const loadPolls = useCallback(async () => {
    try {
      const data = await getVconfPolls(meetingId);
      setPolls(data);
      const active = data.find((p) => p.status === "active");
      if (active) {
        setActivePoll(active);
        // Check if we already voted
        const alreadyVoted = active.responses?.some(
          (r) => r.user === userId || r.user?._id === userId
        );
        if (alreadyVoted) {
          setVotedPolls((prev) => new Set(prev).add(active._id));
        }
      }
    } catch (err) {
      console.error("[Polls] loadPolls error:", err);
    }
  }, [meetingId, userId]);

  const createPoll = useCallback(
    async (question, options, pollType = "single") => {
      try {
        const poll = await createVconfPoll(meetingId, {
          question,
          pollType,
          options: options.map((text) => ({ text, isCorrect: false })),
        });
        setPolls((prev) => [...prev, poll]);
        return poll;
      } catch (err) {
        console.error("[Polls] create error:", err);
        throw err;
      }
    },
    [meetingId]
  );

  const launchPoll = useCallback(
    async (pollId) => {
      try {
        const poll = await launchVconfPoll(meetingId, pollId);
        setPolls((prev) => prev.map((p) => (p._id === pollId ? poll : p)));
        setActivePoll(poll);

        // Broadcast to all participants via DataChannel
        sendCommand({
          type: "POLL_LAUNCH",
          pollId: poll._id,
          question: poll.question,
          options: poll.options.map((o) => ({ text: o.text })),
          pollType: poll.pollType,
        });
        return poll;
      } catch (err) {
        console.error("[Polls] launch error:", err);
        throw err;
      }
    },
    [meetingId, sendCommand]
  );

  const closePoll = useCallback(
    async (pollId) => {
      try {
        const poll = await closeVconfPoll(meetingId, pollId);
        setPolls((prev) => prev.map((p) => (p._id === pollId ? poll : p)));
        setActivePoll(null);

        // Get final results and broadcast
        const results = await getVconfPollResults(meetingId, pollId);
        setPollResults((prev) => ({ ...prev, [pollId]: results }));
        sendCommand({ type: "POLL_CLOSE", pollId, results });
        return poll;
      } catch (err) {
        console.error("[Polls] close error:", err);
        throw err;
      }
    },
    [meetingId, sendCommand]
  );

  const vote = useCallback(
    async (pollId, selectedOptions) => {
      try {
        await respondToVconfPoll(meetingId, pollId, selectedOptions);
        setVotedPolls((prev) => new Set(prev).add(pollId));

        // Broadcast vote via DataChannel (teacher aggregates)
        sendCommand({
          type: "POLL_RESPONSE",
          pollId,
          selectedOptions,
          userId,
        });
      } catch (err) {
        console.error("[Polls] vote error:", err);
        throw err;
      }
    },
    [meetingId, userId, sendCommand]
  );

  const fetchResults = useCallback(
    async (pollId) => {
      try {
        const results = await getVconfPollResults(meetingId, pollId);
        setPollResults((prev) => ({ ...prev, [pollId]: results }));
        return results;
      } catch (err) {
        console.error("[Polls] fetchResults error:", err);
      }
    },
    [meetingId]
  );

  const broadcastResults = useCallback(
    async (pollId) => {
      const results = await fetchResults(pollId);
      if (results) {
        sendCommand({ type: "POLL_RESULTS", pollId, ...results });
      }
    },
    [fetchResults, sendCommand]
  );

  const handleIncoming = useCallback(
    (data) => {
      if (data.type === "POLL_LAUNCH") {
        setActivePoll({
          _id: data.pollId,
          question: data.question,
          options: data.options,
          pollType: data.pollType,
          status: "active",
        });
      } else if (data.type === "POLL_CLOSE") {
        setActivePoll(null);
        if (data.results) {
          setPollResults((prev) => ({ ...prev, [data.pollId]: data.results }));
        }
      } else if (data.type === "POLL_RESULTS") {
        const { pollId, ...rest } = data;
        setPollResults((prev) => ({ ...prev, [pollId]: rest }));
      } else if (data.type === "POLL_RESPONSE") {
        // Teacher receives individual vote — can trigger result refresh
      }
    },
    []
  );

  return {
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
    handleIncoming,
    loadPolls,
  };
}

export default useMeetingPolls;
