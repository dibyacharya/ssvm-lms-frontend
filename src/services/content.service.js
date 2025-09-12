import toast from "react-hot-toast";
import api from "./api";

// Get syllabus for a course
export const getCourseSyllabus = async ({ courseID }) => {
  const response = await api.get(`/syllabus/course/${courseID}/syllabus`);
  return response.data;
};

// Get specific module by ID
export const getModuleById = async (courseID, moduleID) => {
  try {
    const response = await api.get(
      `/syllabus/course/${courseID}/syllabus/module/${moduleID}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching module:", error);
    throw error;
  }
};

// Update a module (basic info)
export const updateModule = async (courseID, moduleID, moduleData) => {
  try {
    const response = await api.put(
      `/syllabus/course/${courseID}/syllabus/module/${moduleID}`,
      moduleData
    );
    toast.success("Module updated successfully!");
    return response.data;
  } catch (error) {
    console.error("Error updating module:", error);
    throw error;
  }
};

// Add content to module
export const addModuleContent = async (courseID, moduleID, formData) => {
  try {
    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await api.post(
      `/syllabus/course/${courseID}/syllabus/module/${moduleID}/content`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success("Content added to module successfully!");
    return response.data;
  } catch (error) {
    console.error("Error adding module content:", error);
    throw error;
  }
};

// Update content item
export const updateContentItem = async (
  courseID,
  moduleID,
  contentID,
  formData
) => {
  try {
    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await api.put(
      `/syllabus/course/${courseID}/syllabus/module/${moduleID}/content/${contentID}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success("Content updated successfully!");
    return response.data;
  } catch (error) {
    console.error("Error updating content item:", error);
    throw error;
  }
};

// Delete content item
export const deleteContentItem = async (courseID, moduleID, contentID) => {
  try {
    const response = await api.delete(
      `/syllabus/course/${courseID}/syllabus/module/${moduleID}/content/${contentID}`
    );
    toast.success("Content deleted successfully!");
    return response.data;
  } catch (error) {
    console.error("Error deleting content item:", error);
    throw error;
  }
};
