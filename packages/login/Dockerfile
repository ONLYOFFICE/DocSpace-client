FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install required dependencies
RUN apt-get -y update && \
    apt-get install -yq
    
# Install PNPM
RUN npm install -g pnpm@10.3.0

WORKDIR /app

# Set PNPM store directory
RUN pnpm config set store-dir /root/.local/share/pnpm/store

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy the source code with correct directory structure
COPY common/ ./common/
COPY packages/login/ ./packages/login/
COPY packages/shared/ ./packages/shared/
COPY public/ ./public/

# ENV NODE_OPTIONS="--max-old-space-size=8192"

# Install dependencies with recursive installation
RUN pnpm install --frozen-lockfile

RUN npx playwright install chromium --with-deps

# Run before-build script (packages/runtime.json)
RUN pnpm run before-build

# Run build:translations
RUN pnpm --filter @docspace/login run build:translations

WORKDIR /app/packages/login

# Run test:build
RUN TS_ERRORS_IGNORE=true pnpm --filter @docspace/login run test:build
