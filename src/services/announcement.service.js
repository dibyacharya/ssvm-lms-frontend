import toast from "react-hot-toast";
import api from "./api";

// Get all announcements for a course
export const getAllCourseAnnouncements = async ({ courseID }) => {
  const response = await api.get(
    `/announcement/course/${courseID}/announcements`
  );
  return response.data;
};

// Create a new announcement
export const createAnnouncement = async (courseID, formData) => {
  try {
    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await api.post(
      `/announcement/course/${courseID}/announcement`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

// Delete an announcement by ID
export const deleteAnnouncement = async (courseID, announcementID) => {
  try {
    const response = await api.delete(
      `/announcement/course/${courseID}/announcement/${announcementID}`
    );
    toast.success("Announcement Deleted Successfully!");
    return response.data;
  } catch (error) {
    console.error("Error deleting announcement:", error);
    throw error;
  }
};

// Update an announcement by ID
export const updateAnnouncement = async (
  courseID,
  announcementID,
  formData
) => {
  try {
    // For debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    const response = await api.put(
      `/announcement/course/${courseID}/announcement/${announcementID}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
};
