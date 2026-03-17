import api from "./api";

export const getQuestions = async (courseId, params = {}) => {
  const res = await api.get(`/exam/courses/${courseId}/question-bank`, { params });
  return res.data;
};

export const getQuestionById = async (questionId) => {
  const res = await api.get(`/exam/question-bank/${questionId}`);
  return res.data;
};

export const createQuestion = async (courseId, data) => {
  const res = await api.post(`/exam/courses/${courseId}/question-bank`, data);
  return res.data;
};

export const bulkCreateQuestions = async (courseId, questions) => {
  const res = await api.post(`/exam/courses/${courseId}/question-bank/bulk`, { questions });
  return res.data;
};

export const updateQuestion = async (questionId, data) => {
  const res = await api.put(`/exam/question-bank/${questionId}`, data);
  return res.data;
};

export const deleteQuestion = async (questionId) => {
  const res = await api.delete(`/exam/question-bank/${questionId}`);
  return res.data;
};

export const importFromExcel = async (courseId, file) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post(`/exam/courses/${courseId}/question-bank/import`, formData);
  return res.data;
};

export const generateAIQuestions = async (courseId, data) => {
  const res = await api.post(`/exam/courses/${courseId}/question-bank/generate`, data);
  return res.data;
};

export const approveQuestion = async (questionId, status) => {
  const res = await api.put(`/exam/question-bank/${questionId}/approve`, { status });
  return res.data;
};

export const getQuestionStats = async (courseId) => {
  const res = await api.get(`/exam/courses/${courseId}/question-bank/stats`);
  return res.data;
};
