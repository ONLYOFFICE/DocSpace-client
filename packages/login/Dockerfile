FROM mcr.microsoft.com/playwright:v1.58.1-noble

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1

# Playwright image ships with Node 22; upgrade to 24 as required by the project
RUN apt-get update && \
    apt-get install -y curl && \
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

COPY common/tests/package-lock.json ./common/tests/package-lock.json
COPY common/tests/package.json ./common/tests/package.json
COPY packages/login/package.json ./packages/login/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY libs/ui-kit/package.json ./libs/ui-kit/package.json
COPY libs/ui-kit/onlyoffice-docspace-api-sdk-*.tgz ./libs/ui-kit/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the source code
COPY common/ ./common/
COPY packages/login/ ./packages/login/
COPY packages/shared/ ./packages/shared/
COPY public/ ./public/
COPY libs/ui-kit/ ./libs/ui-kit/

# Run build:translations
RUN pnpm --filter @docspace/login run build:translations

WORKDIR /app/packages/login

# Run test:build
RUN pnpm --filter @docspace/login run test:build
