import api from "./api";

export const getAllCourses = async () => {
  const response = await api.get("/courses");
  return response.data;
};

export const getAllStudentCourses = async () => {
  const response = await api.get("/courses/student");
  return response.data;
};

export const getCoursesById = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  try {
    const response = await api.put(`/courses/${courseId}`, courseData);
    return response.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
};
