FROM debian:bookworm-slim as base
RUN apt update && apt install -y git

ARG BRANCH_NAME='develop'
RUN git clone --depth=1 -b $BRANCH_NAME https://github.com/ONLYOFFICE/DocSpace-client.git /app

FROM node:20-bookworm-slim

WORKDIR /app

COPY --from=base /app/.yarn/plugins .yarn/plugins
COPY --from=base /app/.yarn/releases .yarn/releases/
COPY --from=base /app/.yarnrc.yml .
COPY --from=base /app/yarn.lock .

COPY --from=base /app/package.json  .
COPY --from=base /app/packages/login/package.json packages/login/package.json
COPY --from=base /app/packages/shared/package.json packages/shared/package.json
COPY --from=base /app/packages/client/package.json packages/client/package.json

RUN yarn install
RUN npx playwright install chromium --with-deps

COPY --from=base /app/packages/shared packages/shared
COPY --from=base /app/public public
COPY --from=base /app/packages/client packages/client
COPY --from=base /app/packages/login packages/login

WORKDIR /app/packages/login

RUN yarn test:build

CMD ["yarn", "test:e2e"]

