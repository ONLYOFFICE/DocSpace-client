FROM node:20-bookworm-slim

WORKDIR /app

COPY  .yarn/plugins .yarn/plugins
COPY  .yarn/releases .yarn/releases/
COPY  .yarnrc.yml .
COPY  yarn.lock .

COPY  package.json  .
COPY  packages/sdk/package.json packages/sdk/package.json
COPY  packages/shared/package.json packages/shared/package.json
COPY  packages/client/package.json packages/client/package.json

RUN yarn install --no-immutable 
RUN npx playwright install chromium --with-deps

COPY  packages/shared packages/shared
COPY  public public
COPY  packages/client packages/client
COPY  packages/sdk packages/sdk
COPY  packages/runtime.json packages/runtime.json

WORKDIR /app/packages/sdk

RUN yarn test:build

