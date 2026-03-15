import api from "./api";

export const getMyProfile = async ({ skipAuthRedirect = false } = {}) => {
  const response = await api.get("/me/profile", {
    _skipAuthRedirect: skipAuthRedirect,
  });
  return response.data;
};

export const updateMyProfile = async (payload) => {
  const response = await api.put("/me/profile", payload);
  return response.data;
};

export const getMyProgress = async () => {
  const response = await api.get("/me/progress");
  return response.data;
};

export const uploadMyProfilePhoto = async (file, updateReason = "") => {
  const formData = new FormData();
  formData.append("photo", file);
  if (updateReason) {
    formData.append("updateReason", updateReason);
  }
  const response = await api.post("/me/profile/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteMyProfilePhoto = async (updateReason = "") => {
  const response = await api.delete("/me/profile/photo", {
    data: updateReason ? { updateReason } : undefined,
  });
  return response.data;
};

const profileService = {
  getMyProfile,
  updateMyProfile,
  getMyProgress,
  uploadMyProfilePhoto,
  deleteMyProfilePhoto,
};

export default profileService;
