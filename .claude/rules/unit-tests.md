---
paths:
  - "packages/client/src/**/*.test.*"
  - "packages/client/src/**/__tests__/**"
  - "packages/shared/**/*.test.*"
  - "packages/shared/**/__tests__/**"
  - "packages/*/vitest.config.ts"
  - "packages/*/vitest/**"
---

# Unit tests (Vitest)

## Where tests live — and where they must not

- **client**: only under `packages/client/src/**` (vitest `include` is limited
  to `src/`). Convention: `__tests__/` dir next to the code. Anything in
  `packages/client/__tests__/` or `packages/client/tests/` is **Playwright
  E2E** — never put unit tests there.
- **shared**: co-located next to the component
  (`SaveCancelButtons.test.tsx`), a few `__tests__/` dirs.
- **ui-kit** (`libs/ui-kit`) is a third, separate suite with its own setup and
  mocks; shared's setup does not apply there, and its `include` is an explicit
  directory list — a test outside those dirs silently does not run.
- Naming: `<Subject>.test.ts` (stores/utils) / `.test.tsx` (JSX). Big subjects
  split by concern: `FilesStore.selection.test.ts`.
- New test files need the AGPL license header like any source file.

## Always-on mocks (via config aliases + setup — no vi.mock needed)

- `react-i18next` — `t` echoes the key: **assert on keys, not translated
  text**. (`window.i18n.t` however resolves real `en/Common.json` values.)
- `react-svg`, `*.svg?url` → stubs; `hex-rgb` → white; `config.json` →
  `packages/shared/__mocks__/configMock.js`.
- `localStorage`/`sessionStorage`/`Storage` are replaced with in-memory
  classes (that's why `vi.spyOn(Storage.prototype, …)` works).
- jest-dom matchers are global; `clearMocks: true` in both packages — module-
  scope `vi.fn()` implementations are cleared between tests.
- `console.error` containing `[ENCRYPTION]` **fails the test**; opt out with
  the global `allowConsoleError(/pattern/)`.
- `__mocks__/handlers/**` + `__mocks__/e2e/**` are MSW for Playwright only;
  unit tests mock API modules with `vi.mock` instead.

## Store-test pattern (client)

`vi.mock` calls go before imports (hoisted); partial mocks use the
`importOriginal` shorthand `io`:

```ts
vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  finalizeVersion: vi.fn(async () => [{ id: 1 }]),
}));
```

Stores are instantiated directly with cast fakes — no mobx helpers:

```ts
const store = new SelectedFolderStore({} as unknown as SettingsStore);
```

For big stores use the existing harnesses instead of hand-rolling:
- `src/store/filesStore/__tests__/testHarness.ts` → `createTestFilesStore(overrides?)`
- `src/store/filesActionsStore/__tests__/testHarness.ts` → `createTestFilesActionsStore`
- `src/store/uploadDataStore/__tests__/testHarness.ts`
- `src/store/__tests__/sharedFakes.ts` → `fakeSettingsStore`, `fakeUserStore`, …

If a store test blows up at **import time**, the cause is transitive legacy
imports (`src/i18n`, socket): mock `SRC_DIR/i18n`, and
`@docspace/ui-kit/utils/socket` (keep real enums via `importOriginal`, replace
`default` with `{on, off, emit, socketSubscribers: new Set()}`), plus
`@docspace/ui-kit/components/toast` when toasts fire.

`vi.hoisted` bindings must not be exported directly — alias them first.

## Component-test pattern (shared)

Plain RTL: `data-testid` queries, `userEvent` for clicks, local
`renderComponent` helper per file (no repo-wide one). Wrap in
`ThemeProviderComponent` + `Base` theme (from `@docspace/ui-kit`) only when
the component needs theme; heavy child components are stubbed with
`vi.mock` returning a `<div data-testid=… />`. Fixtures live in co-located
`mockData.ts`.

## Aliases available in test code

client: `SRC_DIR`, `PUBLIC_DIR`, `ASSETS_DIR`, `COMMON_DIR`, `PACKAGE_FILE`,
`@docspace/shared`, `@docspace/ui-kit`. shared: `@docspace/shared`,
`PUBLIC_DIR` only.

## Running

```bash
pnpm test          # shared          pnpm test:client   # client
pnpm test:store    # client src/store only
cd packages/client && pnpm exec vitest run src/store/filesStore   # single path
```

Both suites are part of the blocking lefthook pre-push gate.

## Snapshots

Snapshot files live in `__snapshots__/` next to the spec, and the store
harness mocks `t` as an identity function — so menu snapshots freeze **i18n
keys**, and changing a `t()` key in a menu helper fails `test:client` without
any test file being edited. Which snapshot covers which helper, and how to
update one safely, is in `.claude/rules/source-checks.md`.
