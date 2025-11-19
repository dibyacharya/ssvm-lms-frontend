import toast from "react-hot-toast";
import api from "./api";

/**
 * Get all assignments for a course
 * @param {Object} params - { courseID }
 * @returns {Promise} Response with assignments array
 */
export const getAllCourseAssignments = async ({ courseID }) => {
  try {
    const response = await api.get(`/assignment/courses/${courseID}/assignments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
};

/**
 * Get a single assignment by ID
 * @param {Object} params - { assignmentID }
 * @returns {Promise} Response with assignment object
 */
export const getAssignmentById = async ({ assignmentID }) => {
  try {
    const response = await api.get(`/assignment/assignments/${assignmentID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching assignment:", error);
    throw error;
  }
};

/**
 * Create a new assignment
 * @param {string} courseID - Course ID
 * @param {FormData} formData - FormData with assignment details and files
 * @returns {Promise} Response with created assignment
 */
export const createAssignment = async (courseID, formData) => {
  try {
    // Note: Don't set Content-Type header for FormData - browser sets it automatically with boundary
    // Axios automatically handles FormData, but we need to ensure default Content-Type header doesn't interfere
    const config = {
      headers: {
        'Content-Type': undefined, // Remove default Content-Type to let browser set multipart/form-data with boundary
      },
    };
    
    const response = await api.post(
      `/assignment/courses/${courseID}/assignments`,
      formData,
      config
    );

    toast.success("Assignment created successfully!");
    return response.data;
  } catch (error) {
    console.error("Error creating assignment:", error);
    const errorMessage = error.response?.data?.message || "Failed to create assignment";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Update an assignment
 * @param {string} assignmentID - Assignment ID
 * @param {FormData} formData - FormData with updated assignment details
 * @returns {Promise} Response with updated assignment
 */
export const updateAssignment = async (assignmentID, formData) => {
  try {
    // Note: Don't set Content-Type header for FormData - browser sets it automatically with boundary
    const response = await api.put(
      `/assignment/assignments/${assignmentID}`,
      formData
    );

    toast.success("Assignment updated successfully!");
    return response.data;
  } catch (error) {
    console.error("Error updating assignment:", error);
    const errorMessage = error.response?.data?.message || "Failed to update assignment";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Delete an assignment
 * @param {string} assignmentID - Assignment ID
 * @returns {Promise} Response with success message
 */
export const deleteAssignment = async (assignmentID) => {
  try {
    const response = await api.delete(
      `/assignment/assignments/${assignmentID}`
    );
    toast.success("Assignment deleted successfully!");
    return response.data;
  } catch (error) {
    console.error("Error deleting assignment:", error);
    const errorMessage = error.response?.data?.message || "Failed to delete assignment";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Submit an assignment (Student only)
 * @param {string} assignmentID - Assignment ID
 * @param {FormData} formData - FormData with answers and optional submission file
 * @returns {Promise} Response with submission details and auto-calculated objective score
 */
export const submitAssignment = async (assignmentID, formData) => {
  try {
    // Note: Don't set Content-Type header for FormData - browser sets it automatically with boundary
    // Remove default Content-Type to let browser set multipart/form-data with boundary
    const config = {
      headers: {
        'Content-Type': undefined, // Remove default Content-Type to let browser set multipart/form-data with boundary
      },
    };
    
    const response = await api.post(
      `/assignment/assignments/${assignmentID}/submit`,
      formData,
      config
    );

    const data = response.data;
    if (data.objectiveScore !== undefined) {
      toast.success(`Assignment submitted! Objective score: ${data.objectiveScore}`);
    } else {
      toast.success("Assignment submitted successfully!");
    }
    return data;
  } catch (error) {
    console.error("Error submitting assignment:", error);
    const errorMessage = error.response?.data?.message || "Failed to submit assignment";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Get a student's submission for an assignment
 * @param {string} assignmentID - Assignment ID
 * @param {string} studentID - Student ID (optional, defaults to current user)
 * @returns {Promise} Response with submission object or null
 */
export const getStudentSubmission = async (assignmentID, studentID = null) => {
  try {
    // If studentID is not provided, the backend will use the current user's ID
    const endpoint = studentID 
      ? `/assignment/assignments/${assignmentID}/submissions/${studentID}`
      : `/assignment/assignments/${assignmentID}/submissions/me`;
    
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    // If submission doesn't exist, backend might return 404
    if (error.response?.status === 404) {
      return { success: true, submission: null };
    }
    console.error("Error fetching submission:", error);
    throw error;
  }
};

/**
 * Get all submissions for an assignment (Teacher only)
 * @param {string} assignmentID - Assignment ID
 * @param {Object} params - Query parameters { sortBy, search }
 * @returns {Promise} Response with submissions array and stats
 */
export const getAllSubmissions = async (assignmentID, params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/assignment/assignments/${assignmentID}/submissions${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error("Error fetching submissions:", error);
    throw error;
  }
};

/**
 * Grade a submission (Teacher only)
 * @param {string} assignmentID - Assignment ID
 * @param {string} submissionID - Submission ID
 * @param {Object} gradeData - { subjectiveGrade, feedback, grade (optional) }
 * @returns {Promise} Response with updated submission
 */
export const gradeSubmission = async (assignmentID, submissionID, gradeData) => {
  try {
    // Support both POST and PUT methods
    const response = await api.post(
      `/assignment/assignments/${assignmentID}/submissions/${submissionID}/grade`,
      gradeData
    );

    toast.success("Grade saved successfully!");
    return response.data;
  } catch (error) {
    console.error("Error grading submission:", error);
    const errorMessage = error.response?.data?.message || "Failed to save grade";
    toast.error(errorMessage);
    throw error;
  }
};

/**
 * Bulk grade multiple submissions (Teacher only)
 * @param {string} assignmentID - Assignment ID
 * @param {Array} grades - Array of { submissionId, subjectiveGrade, feedback, grade (optional) }
 * @returns {Promise} Response with count of updated submissions
 */
export const bulkGradeSubmissions = async (assignmentID, grades) => {
  try {
    const response = await api.post(
      `/assignment/assignments/${assignmentID}/bulk-grade`,
      { grades }
    );

    toast.success(`${response.data.updated || grades.length} submissions graded successfully!`);
    return response.data;
  } catch (error) {
    console.error("Error bulk grading submissions:", error);
    const errorMessage = error.response?.data?.message || "Failed to grade submissions";
    toast.error(errorMessage);
    throw error;
  }
};

// Legacy function name for backward compatibility
export const updateAssignmentGrade = gradeSubmission;

/**
 * Get student assignment statistics across all enrolled courses
 * @returns {Promise} Response with assignment stats including allAssignments, submitted, pending, and courses with latestAssignment
 */
export const getStudentAssignmentStats = async () => {
  try {
    const response = await api.get(`/assignment/student/stats`);
    return response.data;
  } catch (error) {
    console.error("Error fetching student assignment stats:", error);
    throw error;
  }
};
