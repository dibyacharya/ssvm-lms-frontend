import axios from "axios";

// Use only runtime config (window.RUNTIME_CONFIG)
const runtimeConfig = typeof window !== 'undefined' ? window.RUNTIME_CONFIG : undefined;
const API_URL = runtimeConfig?.BACKEND_URL || null;
const DEBUG = runtimeConfig?.DEBUG_AUTH === true || runtimeConfig?.DEBUG_AUTH === 'true';

if (typeof window !== 'undefined' && !API_URL) {
  console.error("❌ apiService: API_URL is undefined. Check window.RUNTIME_CONFIG.BACKEND_URL");
}

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
