import toast from "react-hot-toast";
import api from "./api";

export const getAllCourseActivities = async ({ courseID }) => {
  const response = await api.get(`/activity/courses/${courseID}/activities`);
  return response.data;
};

export const createActivity = async (courseID, formData) => {
  try {
    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    // Make sure API is imported
    const response = await api.post(
      `/activity/courses/${courseID}/activities`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating activity:", error);
    throw error;
  }
};

// Delete an activity by ID
export const deleteActivity = async (activityID) => {
  try {
    const response = await api.delete(`activity/activities/${activityID}`);
    toast.success("Activity Deleted Successfully!");
    return response.data;
  } catch (error) {
    console.error("Error deleting activity:", error);
    throw error;
  }
};

// Update an activity by ID
export const updateActivity = async (activityID, formData) => {
  try {
    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await api.put(
      `activity/activities/${activityID}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating activity:", error);
    throw error;
  }
};

export const getActivityById = async ({ activityID }) => {
  const response = await api.get(`activity/activities/${activityID}`);
  return response.data;
};

export const updateActivityGrade = async (
  activityId,
  submissionId,
  gradeData
) => {
  try {
    const response = await api.post(
      `activity/activities/${activityId}/submissions/${submissionId}/grade`,
      gradeData
    );

    return response.data;
  } catch (error) {
    console.error("Error updating grade:", error);
    throw error;
  }
};

export const submitActivity = async (activityID, formData) => {
  try {
    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await api.post(
      `activity/activities/${activityID}/submit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error submitting activity:", error);
    throw error;
  }
};
