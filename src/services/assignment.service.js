import toast from "react-hot-toast";
import api from "./api";

export const getAllCourseAssignments = async ({ courseID }) => {
  const response = await api.get(`/assignment/courses/${courseID}/assignments`);
  return response.data;
};

export const createAssignment = async (courseID, formData) => {
  try {
    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Make sure API is imported
    const response = await api.post(
      `/assignment/courses/${courseID}/assignments`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating assignment:", error);
    throw error;
  }
};

// Delete an assignment by ID
export const deleteAssignment = async (assignmentID) => {
  try {
    const response = await api.delete(
      `/assignment/assignments/${assignmentID}`
    );
    toast.success("Assignmnet Deleted Successfully !");
    return response.data;
  } catch (error) {
    console.error("Error deleting assignment:", error);
    throw error;
  }
};

// Update an assignment by ID
export const updateAssignment = async (assignmentID, formData) => {
  try {
    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await api.put(
      `/assignment/assignments/${assignmentID}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating assignment:", error);
    throw error;
  }
};

export const getAssignmentById = async ({ assignmentID }) => {
  const response = await api.get(`assignment/assignments/${assignmentID}`);
  return response.data;
};

export const updateAssignmentGrade = async (
  assignmentId,
  submissionId,
  gradeData
) => {
  try {
    const response = await api.post(
      `/assignment/assignments/${assignmentId}/submissions/${submissionId}/grade`,
      gradeData
    );

    return response.data;
  } catch (error) {
    console.error("Error updating grade:", error);
    throw error;
  }
};
export const submitAssignment = async (assignmentID, formData) => {
  try {
    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await api.post(
      `/assignment/assignments/${assignmentID}/submit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error submitting assignment:", error);
    throw error;
  }
};
