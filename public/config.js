// Default runtime config for local development.
// In production the container startup script should overwrite this file.
window.RUNTIME_CONFIG = {
  BACKEND_URL: "https://lmsbackend.bluehill-eb07d9c6.centralindia.azurecontainerapps.io/api",
  CHATBOT_URL: "https://ca-dev-chatbot.whitegrass-ce3c3d28.centralindia.azurecontainerapps.io/api/chat",
  QGEN_URL: "https://qgen.bluehill-eb07d9c6.centralindia.azurecontainerapps.io/api/generate-questions",
  DEBUG_AUTH: true
};

// Helpful log so you can verify config is loaded in the browser console
console.info("RUNTIME_CONFIG:", window.RUNTIME_CONFIG);
