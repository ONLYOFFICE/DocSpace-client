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

RUN npm install -g pnpm@10.33.0

WORKDIR /app

RUN pnpm config set store-dir /root/.local/share/pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

COPY common/ ./common/
COPY packages/management/ ./packages/management/
COPY packages/shared/ ./packages/shared/
COPY public/ ./public/
COPY libs/ui-kit/ ./libs/ui-kit/

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @docspace/management run build:translations

WORKDIR /app/packages/management

RUN pnpm --filter @docspace/management run test:build
