FROM node:22-alpine

# Set up working directory
WORKDIR /app/common/translation-app/frontend

# Create necessary directories
RUN mkdir -p public .next

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Expose the application port
EXPOSE 3000

# Start script that installs dependencies, creates tsconfig paths, builds and starts the application
CMD ["/bin/sh", "-c", "if [ ! -d 'node_modules' ]; then npm install; fi && echo 'Making sure jsconfig.json exists for path aliases' && if [ ! -f 'jsconfig.json' ]; then echo '{\"compilerOptions\":{\"baseUrl\":\".\",\"paths\":{\"@/*\":[\"*\"]}}}' > jsconfig.json; fi && if [ ! -f 'tsconfig.json' ]; then echo '{\"compilerOptions\":{\"baseUrl\":\".\",\"paths\":{\"@/*\":[\"*\"]}}}' > tsconfig.json; fi && npm run build && npx next start -H 0.0.0.0"]
