#!/bin/sh

# Substitute environment variables in JavaScript files
envsubst '${CCTV_ADMIN_PASSWORD} ${CCTV_VIEWER_PASSWORD} ${CCTV_MANAGER_PASSWORD} ${CCTV_GUEST_PASSWORD}' < /usr/share/nginx/html/auth.js.template > /usr/share/nginx/html/auth.js

# Start nginx
exec "$@"
