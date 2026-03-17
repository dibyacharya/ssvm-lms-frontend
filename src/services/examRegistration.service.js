import api from "./api";

// ── Student: Registration ──

export const getOpenRegistrationPeriods = async () => {
  const res = await api.get("/exam-registration/periods/open");
  return res.data;
};

export const registerForExam = async (data) => {
  const res = await api.post("/exam-registration/register", data);
  return res.data;
};

export const getMyRegistrations = async () => {
  const res = await api.get("/exam-registration/my");
  return res.data;
};

export const getMyAdmitCard = async (registrationId) => {
  const res = await api.get(`/exam-registration/admit-card/${registrationId}`);
  return res.data;
};

export const withdrawRegistration = async (registrationId) => {
  const res = await api.post(`/exam-registration/withdraw/${registrationId}`);
  return res.data;
};
