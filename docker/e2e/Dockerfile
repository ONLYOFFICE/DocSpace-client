FROM mcr.microsoft.com/playwright:v1.58.1-noble

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
ENV CI=true
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Playwright image ships with Node 22; upgrade to 24 as required by the project.
# Fonts are installed in the same layer to minimize image layers.
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        curl \
        fonts-noto-core \
        fonts-noto-cjk-extra \
        fonts-roboto \
        fonts-liberation \
        fontconfig && \
    fc-cache -f && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/*

# Install PNPM
RUN npm install -g pnpm@10.33.0 && npm cache clean --force

WORKDIR /app

# Set PNPM store directory
RUN pnpm config set store-dir /root/.local/share/pnpm/store

# Copy package files first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# Copy all package.json files for dependency installation
COPY common/tests/package-lock.json ./common/tests/package-lock.json
COPY common/tests/package.json ./common/tests/package.json
COPY packages/client/package.json ./packages/client/package.json
COPY packages/client/*.tgz ./packages/client/
COPY packages/login/package.json ./packages/login/package.json
COPY packages/doceditor/package.json ./packages/doceditor/package.json
COPY packages/sdk/package.json ./packages/sdk/package.json
COPY packages/management/package.json ./packages/management/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY libs/ui-kit/package.json ./libs/ui-kit/package.json
COPY libs/ui-kit/*.tgz ./libs/ui-kit/

# Install dependencies and clean cache in same layer
RUN pnpm install --frozen-lockfile && \
    pnpm store prune && \
    rm -rf /root/.local/share/pnpm/store/v3/tmp/*

# Copy the source code with correct directory structure
COPY common/ ./common/
COPY packages/client/ ./packages/client/
COPY packages/login/ ./packages/login/
COPY packages/doceditor/ ./packages/doceditor/
COPY packages/sdk/ ./packages/sdk/
COPY packages/management/ ./packages/management/
COPY packages/shared/ ./packages/shared/
COPY public/ ./public/
COPY libs/ui-kit/ ./libs/ui-kit/

# Build translations for all packages in single layer
RUN pnpm --filter @docspace/client run build:translations && \
    pnpm --filter @docspace/login run build:translations && \
    pnpm --filter @docspace/doceditor run build:translations && \
    pnpm --filter @docspace/sdk run build:translations && \
    pnpm --filter @docspace/management run build:translations

# Build test bundles for all packages and clean up in single layer
RUN NODE_OPTIONS="--max-old-space-size=4096" \
    pnpm --filter @docspace/client run test:build && \
    pnpm --filter @docspace/login run test:build && \
    pnpm --filter @docspace/doceditor run test:build && \
    pnpm --filter @docspace/sdk run test:build && \
    pnpm --filter @docspace/management run test:build && \
    rm -rf /app/packages/*/.next/cache \
           /app/packages/*/node_modules/.cache \
           /root/.npm \
           /tmp/*

WORKDIR /app

COPY docker/e2e/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
