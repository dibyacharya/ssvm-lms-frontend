import api from "./api";

/**
 * Video Conferencing Service — Full API
 *
 * All calls route through LMS backend proxy at /vconf/*
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
    { headers: { "Content-Type": "application/octet-stream" } }
  );
  return res.data;
};

export const deleteVconfRecording = async (meetingId) => {
  const res = await api.delete(`/vconf/meetings/${meetingId}/recording`);
  return res.data;
};

export const getVconfRecordingStream = (meetingId) => {
  // Returns URL for <video src="..."> — stream is piped by backend
  const baseURL = api.defaults.baseURL || "";
  return `${baseURL}/vconf/meetings/${meetingId}/recording/stream`;
};

// ─── AI / Transcript / MOM ───

export const getVconfTranscript = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/transcript`);
  return res.data;
};

export const insertVconfTranscript = async (meetingId, data) => {
  const res = await api.post(`/vconf/meetings/${meetingId}/transcript`, data);
  return res.data;
};

export const getVconfSummary = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/summary`);
  return res.data;
};

export const getVconfMom = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/mom`);
  return res.data;
};

export const getVconfTopics = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/topics`);
  return res.data;
};

export const getVconfLiveAI = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/live-ai`);
  return res.data;
};

// ─── Analytics ───

export const getVconfAttendance = async (meetingId) => {
  const res = await api.get(`/vconf/meetings/${meetingId}/attendance`);
  return res.data;
};

export const getVconfDashboard = async () => {
  const res = await api.get("/vconf/dashboard");
  return res.data;
};

export const getVconfTeacherContribution = async (teacherId) => {
  const res = await api.get(`/vconf/teachers/${teacherId}/contribution`);
  return res.data;
};

// ─── Room-level (existing, kept for backward compat) ───

export const getVconfRecording = async (roomId) => {
  const res = await api.get(`/vconf/recording/${roomId}`);
  return res.data;
};

export const getVconfRoomStatus = async (roomId) => {
  const res = await api.get(`/vconf/status/${roomId}`);
  return res.data;
};
