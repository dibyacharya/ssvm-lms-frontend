import axios from "axios";

// Use only runtime-injected config (window.RUNTIME_CONFIG) — no env vars
const runtimeConfig = typeof window !== "undefined" ? window.RUNTIME_CONFIG : undefined;

const API_URL = runtimeConfig?.BACKEND_URL ? `${runtimeConfig.BACKEND_URL}/api` : undefined;
const DEBUG_AUTH = runtimeConfig?.DEBUG_AUTH === true || runtimeConfig?.DEBUG_AUTH === "true";

// Log runtime config for visibility
if (typeof window !== "undefined") {
  console.group("🔧 Runtime Config");
  console.log("window.RUNTIME_CONFIG =", runtimeConfig ?? "❌ not present");
  console.log("➡ API_URL =", API_URL);
  console.log("➡ DEBUG_AUTH =", DEBUG_AUTH);
  console.groupEnd();
}

// Fail fast if config is missing
if (!API_URL) {
  throw new Error("❌ API_URL is undefined. Check window.RUNTIME_CONFIG.BACKEND_URL in public/config.js or container entrypoint.");
}


const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (email, password) => {
    try {
      if (DEBUG_AUTH) console.log("[AUTH] Login attempt with email:", email);
      const response = await api.post("/auth/login", { email, password });
      if (DEBUG_AUTH) console.log("[AUTH] Login success:", response.data);
      return response;
    } catch (error) {
      if (DEBUG_AUTH) console.error("[AUTH] Login error:", error.response?.data || error.message);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
