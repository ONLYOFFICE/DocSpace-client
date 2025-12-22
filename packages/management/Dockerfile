FROM node:22-bookworm-slim

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get -y update && apt-get install -yq

RUN npm install -g pnpm@10.26.0

WORKDIR /app

RUN pnpm config set store-dir /root/.local/share/pnpm/store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

COPY common/ ./common/
COPY packages/management/ ./packages/management/
COPY packages/shared/ ./packages/shared/
COPY public/ ./public/

RUN pnpm install --frozen-lockfile

RUN npm uninstall -g playwright playwright-core @playwright/test

RUN cd /app/packages/management && pnpm exec playwright install chromium --with-deps

RUN pnpm run before-build

RUN pnpm --filter @docspace/management run build:translations

WORKDIR /app/packages/management

RUN pnpm --filter @docspace/management run test:build
