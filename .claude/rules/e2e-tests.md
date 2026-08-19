---
paths:
  - "packages/client/__tests__/**"
  - "packages/shared/__mocks__/**"
  - "packages/*/playwright.config.ts"
  - "packages/client/compose.yaml"
  - "docker/e2e/**"
---

# E2E tests (Playwright)

## Architecture — no real backend

E2E tests run against a fully mocked backend:

- Specs live in `packages/client/__tests__/*.spec.ts` (plugin specs under
  `__tests__/plugins/`).
- `__tests__/fixtures/base.ts` extends the Playwright `test` with `mockRequest`
  (MSW request interception) and `wsMock` (WebSocket mock). Import `test` from
  there, never from `@playwright/test` directly.
- API handlers are grouped by domain in `packages/shared/__mocks__/handlers/`
  (`files`, `rooms`, `people`, `settings`, `ai`, …). Add or override handlers
  there when a spec needs new API behavior.
- The client is served on `PORT=5110` during tests (`TEST_PORT` in base.ts).

## Screenshots — Docker only

Visual comparisons are only valid inside the Docker image (fonts differ on
macOS, so `toHaveScreenshot` **always fails locally — this is expected, not a
regression**). On a local run trust only the functional assertions.

- Use the `expectScreenshot` helper from `@docspace/shared/__mocks__/e2e`
  (adds a font-rendering delay), not bare `expect(page).toHaveScreenshot`.
- Update snapshots only via `pnpm test:e2e:docker:update-screenshots`
  (or `...:dev:update-screenshots`), never from a local run.

## Which Docker service to run — tests-local vs tests-dev

The `test:e2e:docker:*` scripts run `tests-local`, which serves the `dist`
**baked into the `client-tests` image** and mounts only `__tests__/`,
`playwright.config.ts` and the report directory (`compose.yaml`). Everything
else — `packages/shared/__mocks__`, the repo `public/` (fonts, images), `src` —
is whatever the image was built with, so branch changes to a mock handler or an
asset stay invisible until you rebuild with `pnpm test:e2e:docker:build`.

The tell-tale of a stale image is a mass of `X is not a function` errors from
mock handlers that plainly exist in the source tree, cascading into timeouts.
Do not debug the mock — rebuild.

`pnpm test:e2e:docker:dev` runs `tests-dev`, which mounts client/shared/ui-kit
sources, `__mocks__` and `public/`, and rebuilds `dist` inside the container on
each run. Slower per run, no image rebuild — use it while iterating on a branch.

## Workers — cap them locally

`playwright.config.ts` resolves workers to `Number(process.env.WORKERS) ||
(CI ? 1 : undefined)`, so a local Docker run falls back to Playwright's default
of 50% of the host cores (12 on a 24-core box). With a full DocSpace stack
already running, Docker does not have the memory for that and the container dies
with `error waiting for container: unexpected EOF` — that is an OOM, not a test
failure:

```bash
docker-compose run --rm -e WORKERS=3 tests-local pnpm exec playwright test
```

Background or non-interactive runs must also pass `-T`. Without it the run
aborts with the same `unexpected EOF` and leaves orphaned containers holding
port 5110 (`docker ps` → `docker rm -f`).

The JSON reporter output at `playwright-report/client/test-results.json` is not
reliably overwritten on a Windows bind mount — trust the `--reporter=line`
stdout summary for pass/fail counts.

## Commands

```bash
cd packages/client
pnpm test:e2e:docker:build              # first time only
pnpm test:e2e:docker:start              # all client E2E tests
pnpm test:e2e:docker:start __tests__/favorites.spec.ts   # single spec
pnpm test:e2e:docker:plugins            # plugins subset
pnpm test:e2e:ui                        # local headed UI mode (functional only)
```

`login`, `doceditor`, `sdk` and `management` have their own
`test:e2e:docker:*` scripts; the unified multi-package image lives in
`docker/e2e/compose.yaml` (see README → “E2E Testing with Playwright”).
