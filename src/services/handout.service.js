import api from "./api";

export const getHandouts = async (courseId) => {
  const response = await api.get(`/handouts/course/${courseId}`);
  return response.data;
};

export const createHandout = async (courseId, data) => {
  const response = await api.post(`/handouts/course/${courseId}`, data);
  return response.data;
};

export const updateHandout = async (handoutId, data) => {
  const response = await api.put(`/handouts/${handoutId}`, data);
  return response.data;
};

export const deleteHandout = async (handoutId) => {
  const response = await api.delete(`/handouts/${handoutId}`);
  return response.data;
};
