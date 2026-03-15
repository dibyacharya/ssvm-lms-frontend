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
    // When sending FormData, delete Content-Type so Axios auto-sets it
    // with the correct multipart/form-data boundary string
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
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
      // Skip redirect when the caller explicitly opts out (e.g. AuthContext
      // profile refresh on page load — it handles 401 gracefully on its own)
      if (error.config?._skipAuthRedirect) {
        return Promise.reject(error);
      }

      const requestUrl = String(error.config?.url || "");
      const isAuthRequest = /\/auth\/(login|register)\b/.test(requestUrl);
      const isOnLoginPage =
        typeof window !== "undefined" && window.location.pathname === "/login";

      if (!isAuthRequest && !isOnLoginPage) {
        // Save the current path so Login can redirect back after re-auth
        const currentPath = window.location.pathname + window.location.search;
        if (currentPath && currentPath !== "/" && currentPath !== "/login") {
          localStorage.setItem("redirectAfterLogin", currentPath);
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  login: async (identifier, password) => {
    try {
      if (DEBUG_AUTH) console.log("[AUTH] Login attempt with identifier:", identifier);
      const response = await api.post("/auth/lms/login", {
        identifier,
        password,
      });
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

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response;
    } catch (error) {
      throw error;
    }
  },

  resetPassword: async ({ email, otp, newPassword }) => {
    try {
      const response = await api.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
