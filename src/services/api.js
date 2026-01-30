import axios from "axios";

// Prefer runtime-injected config (window.RUNTIME_CONFIG) for containerized deployments.
// Fallback to env var or localhost for local dev.
// const API_URL =
//   (typeof window !== "undefined" && window.RUNTIME_CONFIG && window.RUNTIME_CONFIG.BACKEND_URL) ||
//   process.env.REACT_APP_BACKEND_URL;

// const DEBUG_AUTH =
//   (typeof window !== "undefined" && window.RUNTIME_CONFIG && (window.RUNTIME_CONFIG.DEBUG_AUTH === true || window.RUNTIME_CONFIG.DEBUG_AUTH === "true")) ||
//   process.env.REACT_APP_DEBUG_AUTH === "true" ||
//   false;

// // Log runtime config and resolved API URL so you can verify in the browser console
// try {
//   if (typeof window !== "undefined" && window.RUNTIME_CONFIG) {
//     console.info("[RUNTIME_CONFIG]", window.RUNTIME_CONFIG);
//   }
//   console.info("[API] Using API_URL:", API_URL, "DEBUG_AUTH:", DEBUG_AUTH);
// } catch (e) {
//   // noop in non-browser environments
// }

const isBrowser = typeof window !== "undefined";

const runtimeConfig = isBrowser ? window.RUNTIME_CONFIG : undefined;

const API_URL =
  runtimeConfig?.BACKEND_URL ??
  process.env.REACT_APP_BACKEND_URL ??
  null;

const DEBUG_AUTH =
  runtimeConfig?.DEBUG_AUTH === true ||
  runtimeConfig?.DEBUG_AUTH === "true" ||
  process.env.REACT_APP_DEBUG_AUTH === "true";

// ---- DEBUG / VISIBILITY ----
if (isBrowser) {
  console.group("🔧 Frontend Config Wiring");

  console.log("window.RUNTIME_CONFIG =", runtimeConfig ?? "❌ not present");
  console.log("process.env.REACT_APP_BACKEND_URL =", process.env.REACT_APP_BACKEND_URL ?? "❌ not set");
  console.log("process.env.REACT_APP_DEBUG_AUTH =", process.env.REACT_APP_DEBUG_AUTH ?? "❌ not set");

  console.log("➡ Resolved API_URL =", API_URL);
  console.log("➡ Resolved DEBUG_AUTH =", DEBUG_AUTH);

  console.log(
    "API_URL source =",
    runtimeConfig?.BACKEND_URL
      ? "window.RUNTIME_CONFIG.BACKEND_URL"
      : process.env.REACT_APP_BACKEND_URL
      ? "process.env.REACT_APP_BACKEND_URL"
      : "❌ NONE"
  );

  console.groupEnd();
}

// ---- FAIL FAST ----
if (!API_URL) {
  throw new Error(
    "❌ API_URL is undefined. Check container env vars or runtime config injection."
  );
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
