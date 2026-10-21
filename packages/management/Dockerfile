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

RUN npm install -g pnpm@12.4.1

WORKDIR /app

RUN pnpm config set store-dir /root/.local/share/pnpm/store

# `*.tgz` is optional: ui-kit and ai-chat come from npm, but a locally packed
# tarball at the repo root can be referenced as `file:../../<name>.tgz` for
# local development. A glob matching nothing is fine next to real sources.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc *.tgz ./

COPY common/ ./common/
COPY packages/management/ ./packages/management/
COPY packages/shared/ ./packages/shared/
# next.config.js requires scripts/ui-kit-dev.cjs at load time.
COPY scripts/ ./scripts/
COPY public/ ./public/

# CI=true is scoped to this one command on purpose. It skips the
# `lefthook install` in the workspace prepare scripts, which cannot work
# because the image has no .git. A persistent `ENV CI=true` would also
# change Playwright's runtime defaults (retries, workers, forbidOnly).
RUN CI=true pnpm install --frozen-lockfile

RUN pnpm --filter @docspace/management run build:translations

WORKDIR /app/packages/management

RUN pnpm --filter @docspace/management run test:build
