FROM node:22-alpine

# Install necessary build dependencies
RUN apk add --no-cache python3 make g++ sqlite sqlite-dev

# Install global test dependencies
RUN npm install -g jest cross-env

# Set up working directory
WORKDIR /app/common/translation-app/backend

# Create db directory
# RUN mkdir -p ./db

# Expose the application port
EXPOSE 3001

# Start script that installs dependencies if needed and starts the server
CMD ["/bin/sh", "-c", "if [ ! -d 'node_modules' ]; then npm install; fi && node src/index.js"]
