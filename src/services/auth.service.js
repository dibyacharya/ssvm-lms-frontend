import api from "./api";

export const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  const response = await api.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return response.data;
};