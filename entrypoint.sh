#!/bin/sh

# ------------------------------
# Fail fast if required env vars are missing
# ------------------------------
: "${REACT_APP_BACKEND_URL:?Missing BACKEND_URL}"
: "${REACT_APP_CHATBOT_API_URL:?Missing CHATBOT_URL}"
: "${REACT_APP_AI_QUESTIONS_API_URL:?Missing QGEN_URL}"

echo "===================================="
echo "Runtime environment variables received:"
echo "REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL"
echo "REACT_APP_CHATBOT_API_URL=$REACT_APP_CHATBOT_API_URL"
echo "REACT_APP_AI_QUESTIONS_API_URL=$REACT_APP_AI_QUESTIONS_API_URL"
echo "===================================="

# ------------------------------
# Write runtime config for React
# ------------------------------
cat <<EOF > /usr/share/nginx/html/config.js
window.RUNTIME_CONFIG = {
  BACKEND_URL: "${REACT_APP_BACKEND_URL}",
  CHATBOT_URL: "${REACT_APP_CHATBOT_API_URL}",
  QGEN_URL: "${REACT_APP_AI_QUESTIONS_API_URL}"
};
EOF

echo "Injected config.js successfully:"
cat /usr/share/nginx/html/config.js
echo "===================================="

# ------------------------------
# Start Nginx
# ------------------------------
exec nginx -g "daemon off;"

