FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Install required dependencies
RUN apt-get -y update && \
    apt-get install -yq 
    
# Install PNPM
RUN npm install -g pnpm@10.20.0

RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-cjk \
    fonts-noto-core \
    fonts-noto-ui-core \
    fonts-noto-color-emoji \
    fonts-noto-mono \
    fonts-noto-extra \
    fonts-roboto \
    fonts-open-sans \
    fonts-liberation \
    fontconfig \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set PNPM store directory
RUN pnpm config set store-dir /root/.local/share/pnpm/store

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# ENV NODE_OPTIONS="--max-old-space-size=8192"

# Copy the source code with correct directory structure
COPY common/tests/package-lock.json ./common/tests/package-lock.json
COPY common/tests/package.json ./common/tests/package.json
COPY packages/client/package.json ./packages/client/package.json
COPY packages/shared/package.json ./packages/shared/package.json

# Install dependencies with recursive installation
RUN pnpm install --frozen-lockfile

# Clear any existing global Playwright installations to avoid conflicts
RUN npm uninstall -g playwright playwright-core @playwright/test

# Install Playwright browsers directly from the project's dependency
RUN cd /app/packages/client && pnpm exec playwright install chromium --with-deps

# Copy the source code with correct directory structure
COPY common/ ./common/
COPY packages/client/ ./packages/client/
COPY packages/shared/ ./packages/shared/
COPY public/ ./public/

# Run before-build script (packages/runtime.json)
RUN pnpm run before-build

# Run build:translations
RUN pnpm --filter @docspace/client run build:translations

WORKDIR /app/packages/client

# Run test:build
RUN pnpm --filter @docspace/client run test:build
