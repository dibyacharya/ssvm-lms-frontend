// Default runtime config for local development.
// In production the container startup script should overwrite this file.
window.RUNTIME_CONFIG = {
  BACKEND_URL: "http://localhost:8080/api",
  CHATBOT_URL: "http://localhost:8080/api/chat",
  QGEN_URL: "http://localhost:8080/api/generate-questions",
  DEBUG_AUTH: true
};

// Helpful log so you can verify config is loaded in the browser console
console.info("RUNTIME_CONFIG:", window.RUNTIME_CONFIG);
