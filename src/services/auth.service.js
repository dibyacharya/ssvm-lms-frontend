import api from "./api";

export const login = async (credentials) => {
  const identifier =
    credentials?.identifier || credentials?.userId || credentials?.email || "";
  const password = credentials?.password || "";
  const response = await api.post("/auth/lms/login", { identifier, password });
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

export const forgotPassword = async ({ email }) => {
  const response = await api.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async ({ email, otp, newPassword }) => {
  const response = await api.post("/auth/reset-password", {
    email,
    otp,
    newPassword,
  });
  return response.data;
};
