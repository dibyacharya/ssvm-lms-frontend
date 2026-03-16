import api from "./api";

/**
 * Video Conferencing Service — Full API
 *
 * All calls route through LMS backend at /vconf/*
 * Auth is handled by the axios interceptor (JWT token auto-attached).
 */

// ─── Meeting CRUD ───

export const getVconfMeetings = async () => {
  const res = await api.get("/vconf/meetings");
  return res.data;
};

export const getVconfMeeting = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}`);
  return res.data;
};

export const scheduleVconfMeeting = async (data) => {
  const res = await api.post("/vconf/meetings/schedule", data);
  return res.data;
};

export const getVconfTimetable = async (batchId) => {
  const params = batchId ? { batch_id: batchId } : {};
  const res = await api.get("/vconf/meetings/timetable", { params });
  return res.data;
};

// ─── Meeting Actions ───

export const joinVconfMeeting = async (meetingId) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/join`);
  return res.data;
};

export const startVconfMeeting = async (meetingId) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/start`);
  return res.data;
};

export const endVconfMeeting = async (meetingId) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/end`);
  return res.data;
};

// ─── Recording ───

export const startVconfRecording = async (meetingId) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/recording/start`);
  return res.data;
};

export const stopVconfRecording = async (meetingId) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/recording/stop`);
  return res.data;
};

export const uploadVconfRecording = async (meetingId, blob) => {
  const res = await api.post(
    `/vconf/meetings/${meetingId}/recording/upload`,
    blob,
    {
      headers: { "Content-Type": "application/octet-stream" },
      timeout: 300000, // 5 min — recordings can be large on Azure
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    }
  );
  return res.data;
};

export const deleteVconfRecording = async (meetingId) => {
  const res = await api.delete(`/vconf/meetings/${meetingId}/recording`);
  return res.data;
};

export const getVconfRecordingStream = (meetingId) => {
  // Returns URL for <video src="..."> — stream is piped by backend
  // Append token as query param since <video> elements cannot send Authorization headers
  const baseURL = api.defaults.baseURL || "";
  const token = localStorage.getItem("token") || "";
  return `${baseURL}/vconf/meetings/${meetingId}/recording/stream?token=${encodeURIComponent(token)}`;
};

// ─── Transcript (stub — AI features removed) ───

export const getVconfTranscript = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/transcript`);
  return res.data;
};

// ─── Attendance ───

export const getVconfAttendance = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/attendance`);
  return res.data;
};

export const getStudentTimeAttendance = async (courseId) => {
  const res = await api.get(`/vconf/courses/${courseId}/student-attendance`);
  return res.data;
};

export const deleteAttendanceSession = async (courseId, sessionKey) => {
  const res = await api.delete(`/vconf/courses/${courseId}/attendance/${encodeURIComponent(sessionKey)}`);
  return res.data;
};

// ─── Persistent Chat ───

export const flushVconfChat = async (meetingId, messages) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/chat/flush`, { messages });
  return res.data;
};

export const getVconfChat = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/chat`);
  return res.data;
};

// ─── Polls / Quizzes ───

export const createVconfPoll = async (meetingId, data) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/polls`, data);
  return res.data;
};

export const getVconfPolls = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/polls`);
  return res.data;
};

export const launchVconfPoll = async (meetingId, pollId) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/polls/${pollId}/launch`);
  return res.data;
};

export const closeVconfPoll = async (meetingId, pollId) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/polls/${pollId}/close`);
  return res.data;
};

export const respondToVconfPoll = async (meetingId, pollId, selectedOptions) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/polls/${pollId}/respond`, { selectedOptions });
  return res.data;
};

export const getVconfPollResults = async (meetingId, pollId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/polls/${pollId}/results`);
  return res.data;
};

// ─── Q&A ───

export const submitVconfQuestion = async (meetingId, text, isAnonymous = false) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/qna`, { text, isAnonymous });
  return res.data;
};

export const getVconfQuestions = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/qna`);
  return res.data;
};

export const toggleVconfUpvote = async (meetingId, questionIdx) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/qna/${questionIdx}/upvote`);
  return res.data;
};

export const answerVconfQuestion = async (meetingId, questionIdx, answer) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/qna/${questionIdx}/answer`, { answer });
  return res.data;
};

export const dismissVconfQuestion = async (meetingId, questionIdx) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/qna/${questionIdx}/dismiss`);
  return res.data;
};

export const highlightVconfQuestion = async (meetingId, questionIdx) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/qna/${questionIdx}/highlight`);
  return res.data;
};

// ─── Captions (Manual) ───

export const flushVconfCaptions = async (meetingId, captions) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/captions/flush`, { captions });
  return res.data;
};

export const getVconfCaptions = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/captions`);
  return res.data;
};

// ─── Post-Meeting Report ───

export const getVconfMeetingReport = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/report`);
  return res.data;
};
