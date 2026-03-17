import api from "./api";

export const getMyCertificates = async () => {
  const res = await api.get("/certificates/my");
  return res.data;
};

export const getMyCertificateDetail = async (id) => {
  const res = await api.get(`/certificates/my/${id}`);
  return res.data;
};
