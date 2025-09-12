import api from "./api";

export const getAllLectures = async (courseId) => {
  const response = await api.get(`/lectures/${courseId}/lectures`);
  return response.data;
};

export const updateLecture = async (courseId, lectureId, lectureData) => {
  try {
    const response = await api.put(
      `/lectures/${courseId}/lectures/${lectureId}`,
      lectureData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          timeout: 300000,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating lecture:", error);
    throw error;
  }
};

export const getAllStudentLectures = async (courseId) => {
  const response = await api.get(`/lectures/student/${courseId}/lectures`);
  return response.data;
};
