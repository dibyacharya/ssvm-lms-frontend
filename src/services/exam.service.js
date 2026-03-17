import api from "./api";

// ── Teacher: Exam CRUD ──

export const createExam = async (courseId, data) => {
  const res = await api.post(`/exam/courses/${courseId}/exams`, data);
  return res.data;
};

export const getCourseExams = async (courseId, params = {}) => {
  const res = await api.get(`/exam/courses/${courseId}/exams`, { params });
  return res.data;
};

export const getStudentAllExams = async () => {
  const res = await api.get("/exam/student/my-exams");
  return res.data;
};

export const getExamById = async (examId) => {
  const res = await api.get(`/exam/exams/${examId}`);
  return res.data;
};

export const updateExam = async (examId, data) => {
  const res = await api.put(`/exam/exams/${examId}`, data);
  return res.data;
};

export const deleteExam = async (examId) => {
  const res = await api.delete(`/exam/exams/${examId}`);
  return res.data;
};

export const publishExam = async (examId) => {
  const res = await api.post(`/exam/exams/${examId}/publish`);
  return res.data;
};

export const cancelExam = async (examId) => {
  const res = await api.post(`/exam/exams/${examId}/cancel`);
  return res.data;
};

// ── Student: Exam Taking ──

export const getExamForStudent = async (examId) => {
  const res = await api.get(`/exam/exams/${examId}/take`);
  return res.data;
};

export const startExam = async (examId) => {
  const res = await api.post(`/exam/exams/${examId}/start`);
  return res.data;
};

export const saveAnswer = async (examId, data) => {
  const res = await api.put(`/exam/exams/${examId}/answer`, data);
  return res.data;
};

export const submitExam = async (examId) => {
  const res = await api.post(`/exam/exams/${examId}/submit`);
  return res.data;
};

export const getMySubmission = async (examId) => {
  const res = await api.get(`/exam/exams/${examId}/my-submission`);
  return res.data;
};

// ── Student: Proctoring ──

export const sendHeartbeat = async (examId, data = {}) => {
  const res = await api.post(`/exam/exams/${examId}/heartbeat`, data);
  return res.data;
};

export const logViolation = async (examId, data) => {
  const res = await api.post(`/exam/exams/${examId}/violation`, data);
  return res.data;
};

export const uploadProctoringScreenshot = async (examId, blob) => {
  const formData = new FormData();
  formData.append("screenshot", blob, "screenshot.jpg");
  const res = await api.post(
    `/exam/exams/${examId}/proctoring-screenshot`,
    formData
  );
  return res.data;
};

// ── Teacher: Grading ──

export const getAllSubmissions = async (examId) => {
  const res = await api.get(`/exam/exams/${examId}/submissions`);
  return res.data;
};

export const gradeSubmission = async (examId, submissionId, data) => {
  const res = await api.put(
    `/exam/exams/${examId}/submissions/${submissionId}/grade`,
    data
  );
  return res.data;
};

export const bulkGradeExam = async (examId, grades) => {
  const res = await api.put(`/exam/exams/${examId}/bulk-grade`, { grades });
  return res.data;
};

export const finalizeGrades = async (examId) => {
  const res = await api.post(`/exam/exams/${examId}/finalize-grades`);
  return res.data;
};

export const flagSubmission = async (examId, submissionId, reason) => {
  const res = await api.post(
    `/exam/exams/${examId}/submissions/${submissionId}/flag`,
    { reason }
  );
  return res.data;
};

export const scheduleReExam = async (examId, data) => {
  const res = await api.post(`/exam/exams/${examId}/re-exam`, data);
  return res.data;
};

// ── Teacher: Analytics ──

export const getExamAnalytics = async (examId) => {
  const res = await api.get(`/exam/exams/${examId}/analytics`);
  return res.data;
};

export const exportResults = async (examId) => {
  const res = await api.get(`/exam/exams/${examId}/export`, {
    responseType: "blob",
  });
  return res.data;
};

// ── Teacher: Live Dashboard ──

export const getLiveDashboard = async (examId) => {
  const res = await api.get(`/exam/exams/${examId}/live-dashboard`);
  return res.data;
};

export const getProctoringReport = async (examId, studentId) => {
  const res = await api.get(
    `/exam/exams/${examId}/proctoring-report/${studentId}`
  );
  return res.data;
};
