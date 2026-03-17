import api from "./api";

export const getMyResults = async () => {
  const res = await api.get("/results/my");
  return res.data;
};

export const getMyResultDetail = async (id) => {
  const res = await api.get(`/results/my/${id}`);
  return res.data;
};
