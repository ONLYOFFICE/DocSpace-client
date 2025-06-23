FROM node:20-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    fonts-noto-cjk \
    fonts-noto-core \
    fonts-noto-ui-core \
    fonts-noto-color-emoji \
    fonts-noto-mono \
    fonts-noto-extra \
    fonts-roboto \
    fonts-open-sans \
    fonts-liberation \
    fontconfig \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY  .yarn/plugins .yarn/plugins
COPY  .yarn/releases .yarn/releases/
COPY  .yarnrc.yml .
COPY  yarn.lock .

COPY  package.json  .
COPY  packages/sdk/package.json packages/sdk/package.json
COPY  packages/shared/package.json packages/shared/package.json
# remove after clearing packages for shared
COPY  packages/client/package.json packages/client/package.json

RUN yarn install --no-immutable 
RUN npx playwright install chromium --with-deps

COPY  packages/sdk packages/sdk
COPY  packages/shared packages/shared
COPY  public public

# remove after clearing packages for shared
COPY  packages/client packages/client

WORKDIR /app/packages/sdk

RUN yarn test:build

