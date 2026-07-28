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

# Copy the source code with correct directory structure
COPY common/ ./common/
COPY packages/doceditor/ ./packages/doceditor/
COPY packages/shared/ ./packages/shared/
COPY public/ ./public/
COPY libs/ui-kit/ ./libs/ui-kit/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Run build:translations
RUN pnpm --filter @docspace/doceditor run build:translations

WORKDIR /app/packages/doceditor

# Run test:build
RUN pnpm --filter @docspace/doceditor run test:build
