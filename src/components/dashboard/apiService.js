import axios from "axios";

const API_URL = "http://localhost:3000"; // Your backend API URL

// API Call to login via Google OAuth
export const loginWithGoogle = async () => {
  try {
    window.location.href = `${API_URL}/login`;
  } catch (error) {
    console.error("Error logging in with Google:", error);
  }
};

// API Call to create a Google Meet
export const createMeeting = async (meetingDetails) => {
  try {
    const response = await axios.post(
      `${API_URL}/create-meeting`,
      meetingDetails
    );
    return response.data.meetingLink;
  } catch (error) {
    throw new Error("Failed to create meeting");
  }
};
