FROM node:20-alpine as base

RUN corepack enable
RUN corepack prepare yarn@stable --activate

WORKDIR /app

FROM base AS deps

COPY package.json  .
COPY yarn.lock .
COPY .yarn/cache/ .yarn/cache/
COPY ./.yarn/plugins ./.yarn/plugins
COPY ./.yarn/releases ./.yarn/releases/
COPY ./.yarnrc.yml .

COPY packages ./packages
COPY public ./public

RUN yarn install

FROM deps AS runner

WORKDIR /app

COPY --from=deps /app/package.json .
COPY --from=deps /app/.yarn/cache/ .yarn/cache/
COPY --from=deps app/.yarn/plugins/ .yarn/plugins/
COPY --from=deps app/.yarn/releases/ .yarn/releases/
#COPY --from=deps /app/.pnp.cjs ./
COPY --from=deps /app/yarn.lock .

COPY --from=deps /app/packages ./packages
COPY --from=deps /app/public ./public

RUN yarn test:build

CMD ["yarn", "test:e2e"]

