import api from "./api";

// Get all e-content items for a course
export const getAllEContent = async (courseId) => {
  try {
    const response = await api.get(`/econtent/course/${courseId}/econtent`);
    return response.data;
  } catch (error) {
    console.error("Error fetching e-content:", error);
    throw error;
  }
};

export const createEContent = async (courseId, econtentData) => {
  try {
    const response = await api.post(
      `/econtent/course/${courseId}/econtent`,
      econtentData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error creating e-content:", error);
    throw error;
  }
};

export const updateEContent = async (courseId, econtentId, econtentData) => {
  try {
    const response = await api.put(
      `/econtent/course/${courseId}/econtent/module/${econtentId}`,
      econtentData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating e-content:", error);
    throw error;
  }
};

// Delete an e-content item
export const deleteEContent = async (courseId, econtentId) => {
  try {
    const response = await api.delete(
      `/econtent/course/${courseId}/econtent/module/${econtentId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting e-content:", error);
    throw error;
  }
};
