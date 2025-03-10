FROM node:20-bookworm-slim

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

# remove after replace local package with npm package
COPY  packages/client/onlyoffice-docspace-sdk-js-2.0.0.tgz packages/client/onlyoffice-docspace-sdk-js-2.0.0.tgz

RUN yarn install --no-immutable 
RUN npx playwright install chromium --with-deps

COPY  packages/shared packages/shared
COPY  public public
# remove after clearing packages for shared
COPY  packages/client packages/client
COPY  packages/sdk packages/sdk
COPY  packages/runtime.json packages/runtime.json

WORKDIR /app/packages/sdk

RUN yarn test:build

