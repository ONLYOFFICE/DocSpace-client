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
