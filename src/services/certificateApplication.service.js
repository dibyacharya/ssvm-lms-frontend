import api from "./api";

export const getAvailableTypes = async () => {
  const res = await api.get("/certificate-applications/available");
  return res.data;
};

export const applyForCertificate = async (data) => {
  const res = await api.post("/certificate-applications/apply", data);
  return res.data;
};

export const confirmPayment = async (id, data) => {
  const res = await api.put(`/certificate-applications/confirm-payment/${id}`, data);
  return res.data;
};

export const getMyApplications = async () => {
  const res = await api.get("/certificate-applications/my");
  return res.data;
};

export const cancelApplication = async (id) => {
  const res = await api.put(`/certificate-applications/cancel/${id}`);
  return res.data;
};
