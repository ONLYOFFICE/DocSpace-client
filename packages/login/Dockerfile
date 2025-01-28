FROM node:22-bookworm-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY package.json .
COPY packages/runtime.json packages/runtime.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/login/package.json packages/login/package.json

# COPY  packages/client/package.json packages/client/package.json

RUN pnpm install
RUN pnpx playwright install chromium --with-deps

COPY packages/shared packages/shared/
COPY packages/login packages/login/
COPY public public

# COPY  packages/client packages/client

WORKDIR /app/packages/login

RUN ls -la

RUN pnpm run test:build
