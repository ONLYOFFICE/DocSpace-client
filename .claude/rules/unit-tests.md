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

- **client**: under `packages/client/src/**`, plus `packages/client/config/**`
  for the Vite config plugins (vitest `include` lists exactly those two).
  Convention: `__tests__/` dir next to the code. Anything in
  `packages/client/__tests__/` or `packages/client/tests/` is **Playwright
  E2E** — never put unit tests there.
- **shared**: co-located next to the component
  (`SaveCancelButtons.test.tsx`), a few `__tests__/` dirs.
- **ui-kit** is a third, separate suite living in its own repository, with its own setup and
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
`@onlyoffice/apps-ui-kit/utils/socket` (keep real enums via `importOriginal`, replace
`default` with `{on, off, emit, socketSubscribers: new Set()}`), plus
`@onlyoffice/apps-ui-kit/components/toast` when toasts fire.

`vi.hoisted` bindings must not be exported directly — alias them first.

## Component-test pattern (shared)

Plain RTL: `data-testid` queries, `userEvent` for clicks, local
`renderComponent` helper per file (no repo-wide one). Wrap in
`ThemeProviderComponent` + `Base` theme (from `@onlyoffice/apps-ui-kit`) only when
the component needs theme; heavy child components are stubbed with
`vi.mock` returning a `<div data-testid=… />`. Fixtures live in co-located
`mockData.ts`.

## Dialog and keyboard tests

The key-dialog tests (`packages/shared/dialogs/**/__tests__`, the client's
`keys-management/modals/__tests__`) render the real kit and set the pattern
for testing what a keyboard or screen-reader user meets:

- **Role and accessible name.** Find controls the way assistive technology
  does: `getByRole("dialog", { name: "Common:CreatePassphrase" })`,
  `getByRole("button", { name: "Common:CancelButton" })`,
  `getByLabelText("Common:CurrentPassphrase")` for a field with a visible
  label. `t` echoes the key, so the name is the key. An error is checked on its field:
  `aria-invalid`, and the text its `aria-describedby` ids resolve to.
- **Focus with `userEvent.tab`.** `const user = userEvent.setup()`, then
  `await user.tab()` or `user.tab({ shift: true })` and `toHaveFocus()` after
  each step. On open, assert `toHaveFocus()` on the field or on
  `getByRole("dialog")`. For the focus return, render a trigger button in a
  small host component, open the dialog from it, close it and assert
  `toHaveFocus()` on the trigger.
- **Keys.** Press them with `user.keyboard("{Enter}")`, `"{Escape}"` or
  `"{Shift>}{Enter}{/Shift}"` and assert on the submit spy. A key handler on
  its own takes a fake event: a `preventDefault` spy shows that it took the
  key, `defaultPrevented: true` that it leaves a handled key alone
  (`dialogs/__tests__/key-dialog-keys.test.ts`).
- **Dialog chrome.** The backdrop is `#modal-onMouseDown-close`
  (`fireEvent.mouseDown`); the hidden announcement region is
  `data-testid="key-dialog-announcement"`, read with `waitFor`. Narrow screens
  set `window.innerWidth` and restore it after each test
  (`key-dialogs.a11y.test.tsx`). A dialog with the passphrase strength tooltip
  needs a `ResizeObserver` stub.

jsdom gaps these tests work around:

- A closed `ModalDialog` stays mounted and `aria-hidden`: find a nested dialog
  (the unsaved-changes confirmation) among `screen.queryAllByRole("dialog")`
  by its text, never by `queryByText` alone.
- jsdom ignores `inert`, so a hidden dialog's buttons still take part in
  `user.tab()`: assert that the focus left a dialog, not where it went.
- `userEvent` sends no keys to a disabled element. To show that a handler's own
  guard refuses a key, `fireEvent.keyDown` on the field.
- That an async submit did not start cannot be shown by waiting: spy on its
  first synchronous call instead (a partial mock returning
  `vi.fn(actual.fn)`), so the assertion holds at once.

## Aliases available in test code

client: `SRC_DIR`, `PUBLIC_DIR`, `ASSETS_DIR`, `COMMON_DIR`, `PACKAGE_FILE`,
`@docspace/shared`, `@onlyoffice/apps-ui-kit`. shared: `@docspace/shared`,
`PUBLIC_DIR` only.

## Running

```bash
pnpm test          # shared          pnpm test:client   # client
pnpm test:sdk      # sdk             pnpm test:store    # client src/store only
cd packages/client && pnpm exec vitest run src/store/filesStore   # single path
```

All three suites are part of the blocking lefthook pre-push gate.

Vitest strips types without checking them: run `pnpm exec tsc --noEmit -p
tsconfig.json` in the package before committing a test, or the pre-push
`pnpm run tsc` finds the error later.

## Snapshots

Snapshot files live in `__snapshots__/` next to the spec, and the store
harness mocks `t` as an identity function — so menu snapshots freeze **i18n
keys**, and changing a `t()` key in a menu helper fails `test:client` without
any test file being edited. Which snapshot covers which helper, and how to
update one safely, is in `.claude/rules/source-checks.md`.
