FROM mcr.microsoft.com/playwright:v1.58.1-noble

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Playwright image ships with Node 22; upgrade to 24 as required by the project
RUN apt-get update && \
    apt-get install -y curl \
        fonts-noto-cjk \
        fonts-noto-core \
        fonts-noto-ui-core \
        fonts-noto-color-emoji \
        fonts-noto-mono \
        fonts-noto-extra \
        fonts-roboto \
        fonts-open-sans \
        fonts-liberation \
        fontconfig && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install PNPM
RUN npm install -g pnpm@10.33.0

WORKDIR /app

# Set PNPM store directory
RUN pnpm config set store-dir /root/.local/share/pnpm/store

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

ENV NODE_OPTIONS="--max-old-space-size=8192"

# Copy the source code with correct directory structure
COPY common/tests/package-lock.json ./common/tests/package-lock.json
COPY common/tests/package.json ./common/tests/package.json
COPY packages/client/package.json ./packages/client/package.json
COPY packages/client/*.tgz ./packages/client/
COPY packages/shared/package.json ./packages/shared/package.json
COPY libs/ui-kit/package.json ./libs/ui-kit/package.json
COPY libs/ui-kit/*.tgz ./libs/ui-kit/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the source code with correct directory structure
COPY common/ ./common/
COPY packages/client/ ./packages/client/
COPY packages/shared/ ./packages/shared/
COPY libs/ui-kit ./libs/ui-kit
COPY public/ ./public/

# Run build:translations
RUN pnpm --filter @docspace/client run build:translations

WORKDIR /app/packages/client

# Run test:build
RUN NODE_OPTIONS="--max-old-space-size=4096" \
    pnpm --filter @docspace/client run test:build
