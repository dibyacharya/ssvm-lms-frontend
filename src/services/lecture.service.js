import api from "./api";

export const getAllLectures = async (courseId) => {
  const response = await api.get(`/lectures/${courseId}/lectures`);
  return response.data;
};

export const updateLecture = async (courseId, lectureId, lectureData, onProgress) => {
  try {
    const response = await api.put(
      `/lectures/${courseId}/lectures/${lectureId}`,
      lectureData,
      {
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        timeout: 600000, // 10 minutes for large video uploads on Azure
        onUploadProgress: onProgress
          ? (e) => onProgress(Math.round((e.loaded * 100) / (e.total || e.loaded)))
          : undefined,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating lecture:", error);
    throw error;
  }
};

export const deleteLecture = async (courseId, lectureId) => {
  try {
    const response = await api.delete(`/lectures/${courseId}/lectures/${lectureId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting lecture:", error);
    throw error;
  }
};

export const getAllStudentLectures = async (courseId) => {
  const response = await api.get(`/lectures/${courseId}/lectures`);
  return response.data;
};
