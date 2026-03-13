import api from "./api";

export const getAllCourses = async () => {
  const response = await api.get("/courses");
  return response.data;
};

export const getAllStudentCourses = async () => {
  const response = await api.get("/courses/student");
  return response.data;
};

export const getCourseDescription = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/description`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course description:", error);
    throw error;
  }
};

export const getCoursesById = async (id, params = {}) => {
  const queryParams = {};
  ["assignmentId", "batchId", "semesterId"].forEach((key) => {
    if (params[key]) {
      queryParams[key] = params[key];
    }
  });
  const response = await api.get(`/courses/${id}`, {
    params: queryParams,
  });
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

// CA Configuration API — returns category types, calculation methods, and category config from backend
export const getCAConfig = async () => {
  try {
    const response = await api.get("/ca-config");
    return response.data;
  } catch (error) {
    console.error("Error fetching CA config:", error);
    throw error;
  }
};

// Assessment Plan APIs
export const getAssessmentPlan = async (courseID) => {
  try {
    const response = await api.get(`/courses/${courseID}/assessment-plan`);
    return response.data;
  } catch (error) {
    // Return null if 404 (not created yet)
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching assessment plan:", error);
    throw error;
  }
};

export const saveAssessmentPlan = async (courseID, planData) => {
  try {
    const response = await api.put(`/courses/${courseID}/assessment-plan`, {
      endTermExam: planData.endTermExam,
      midTermExam: planData.midTermExam,
      continuousAssessment: planData.continuousAssessment
    });
    return response.data;
  } catch (error) {
    console.error("Error saving assessment plan:", error);
    throw error;
  }
};

// Continuous Assessment Plan APIs
export const getContinuousAssessmentPlan = async (courseID) => {
  try {
    const response = await api.get(`/courses/${courseID}/continuous-assessment-plan`);
    // Backend returns { categories: [...] }
    return response.data.categories || [];
  } catch (error) {
    console.error("Error fetching continuous assessment plan:", error);
    throw error;
  }
};

export const createContinuousAssessmentCategory = async (courseID, categoryData) => {
  try {
    const response = await api.post(`/courses/${courseID}/continuous-assessment-plan`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error creating continuous assessment category:", error);
    throw error;
  }
};

export const updateContinuousAssessmentCategory = async (courseID, categoryID, categoryData) => {
  try {
    const response = await api.put(`/courses/${courseID}/continuous-assessment-plan/${categoryID}`, categoryData);
    return response.data;
  } catch (error) {
    console.error("Error updating continuous assessment category:", error);
    throw error;
  }
};

export const deleteContinuousAssessmentCategory = async (courseID, categoryID) => {
  try {
    const response = await api.delete(`/courses/${courseID}/continuous-assessment-plan/${categoryID}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting continuous assessment category:", error);
    throw error;
  }
};

export const getCategoryScaledMarks = async (courseID, categoryID) => {
  try {
    const response = await api.get(`/courses/${courseID}/continuous-assessment-plan/${categoryID}/scaled-marks`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category scaled marks:", error);
    throw error;
  }
};

export const bulkUpdateContinuousAssessmentPlan = async (courseID, categories) => {
  try {
    const response = await api.put(`/courses/${courseID}/continuous-assessment-plan/bulk`, { categories });
    return response.data;
  } catch (error) {
    console.error("Error bulk updating continuous assessment plan:", error);
    throw error;
  }
};

// Course Grading APIs
export const getCourseGrading = async (courseID) => {
  try {
    const response = await api.get(`/courses/${courseID}/grading`);
    // Backend returns { gradings: [...] } for teacher view
    if (response.data.gradings) {
      return response.data.gradings;
    }
    // Handle 404 case - return empty array
    return [];
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    console.error("Error fetching course grading:", error);
    throw error;
  }
};

export const getStudentGrading = async (courseID, studentID) => {
  try {
    const response = await api.get(`/courses/${courseID}/grading/${studentID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student grading:", error);
    throw error;
  }
};

export const updateStudentGrading = async (courseID, studentID, gradingData) => {
  try {
    const response = await api.put(`/courses/${courseID}/grading/${studentID}`, gradingData);
    return response.data;
  } catch (error) {
    console.error("Error updating student grading:", error);
    throw error;
  }
};

export const bulkUpdateStudentGrading = async (courseID, studentsData) => {
  try {
    const response = await api.put(`/courses/${courseID}/grading/bulk`, { 
      gradings: studentsData 
    });
    return response.data;
  } catch (error) {
    console.error("Error bulk updating student grading:", error);
    throw error;
  }
};

// Publish/Unpublish Grades APIs
export const publishGrades = async (courseID) => {
  try {
    const response = await api.post(`/courses/${courseID}/grading/publish`);
    return response.data;
  } catch (error) {
    console.error("Error publishing grades:", error);
    throw error;
  }
};

export const unpublishGrades = async (courseID) => {
  try {
    const response = await api.post(`/courses/${courseID}/grading/unpublish`);
    return response.data;
  } catch (error) {
    console.error("Error unpublishing grades:", error);
    throw error;
  }
};

// Student Grading APIs (following API documentation)
export const getStudentAssessmentPlan = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/assessment-plan`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching assessment plan:", error);
    throw error;
  }
};

export const getStudentContinuousAssessmentPlan = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/continuous-assessment-plan`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error("Error fetching continuous assessment plan:", error);
    throw error;
  }
};

export const getCourseMaterials = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/materials`);
    return response.data;
  } catch (error) {
    console.error("Error fetching course materials:", error);
    throw error;
  }
};

export const getStudentOwnGrades = async (courseId) => {
  try {
    const response = await api.get(`/courses/${courseId}/grading`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // Grades not published yet
    }
    console.error("Error fetching student grades:", error);
    throw error;
  }
};
