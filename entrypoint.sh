#!/bin/sh

# Fail fast if something is missing
: "${REACT_APP_BACKEND_URL:?Missing BACKEND_URL}"
: "${REACT_APP_AI_QUESTIONS_API_URL:?Missing CHATBOT_URL}"
: "${REACT_APP_CHATBOT_API_URL:?Missing QGEN_URL}"

echo "Injecting runtime config..."

cat <<EOF > /usr/share/nginx/html/config.js
window.RUNTIME_CONFIG = {
  REACT_APP_BACKEND_URL: "${REACT_APP_BACKEND_URL}",
  REACT_APP_AI_QUESTIONS_API_URL: "${REACT_APP_AI_QUESTIONS_API_URL}",
  REACT_APP_CHATBOT_API_URL: "${REACT_APP_CHATBOT_API_URL}"
};
EOF

exec nginx -g "daemon off;"
