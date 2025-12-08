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

# Copy the source code with correct directory structure
COPY common/ ./common/
COPY packages/sdk/ ./packages/sdk/
COPY packages/shared/ ./packages/shared/
COPY public/ ./public/

# ENV NODE_OPTIONS="--max-old-space-size=8192"

# Install dependencies with recursive installation
RUN pnpm install --frozen-lockfile

# Clear any existing global Playwright installations to avoid conflicts
RUN npm uninstall -g playwright playwright-core @playwright/test

# Install Playwright browsers directly from the project's dependency
RUN cd /app/packages/sdk && pnpm exec playwright install chromium --with-deps

# Run before-build script (packages/runtime.json)
RUN pnpm run before-build

# Run build:translations
RUN pnpm --filter @docspace/sdk run build:translations

WORKDIR /app/packages/sdk

# Run test:build
RUN pnpm --filter @docspace/sdk run test:build
