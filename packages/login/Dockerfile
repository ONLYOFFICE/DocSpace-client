FROM node:20-bookworm-slim

WORKDIR /app

COPY  .yarn/plugins .yarn/plugins
COPY  .yarn/releases .yarn/releases/
COPY  .yarnrc.yml .
COPY  yarn.lock .

COPY  package.json  .
COPY  packages/login/package.json packages/login/package.json
COPY  packages/shared/package.json packages/shared/package.json
COPY  packages/client/package.json packages/client/package.json

RUN yarn install --no-immutable 
RUN npx playwright install chromium --with-deps

COPY  packages/shared packages/shared
COPY  public public
COPY  packages/client packages/client
COPY  packages/login packages/login

WORKDIR /app/packages/login

RUN yarn test:build

