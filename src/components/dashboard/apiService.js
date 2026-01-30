import axios from "axios";

// API URL - Use runtime config with fallback
const API_URL =
  (typeof window !== 'undefined' && window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.BACKEND_URL)
    ? window.RUNTIME_CONFIG.BACKEND_URL
    : "http://localhost:3000";

const DEBUG = (typeof window !== 'undefined' && window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.DEBUG_AUTH) || false;

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
