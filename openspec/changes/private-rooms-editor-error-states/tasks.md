# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The change states nothing about `../server`; nothing there changes. The English texts are those the owner approves with the proposal.

## 1. Doceditor

- [x] 1.1 Doceditor: keep a failed read of the user's key list apart from an empty list in `packages/doceditor/src/components/EncryptionProviderWrapper.tsx`, and expose "the read failed" and "read again" next to `keysReady` (design decision 3). Verify: cases "Envelopes loaded on start", "Envelopes could not be loaded" and "read again succeeds" in a unit test of the wrapper; `cd packages/doceditor && pnpm exec vitest run src/components`
- [x] 1.2 Doceditor: split the hook's error into `unlock-cancelled`, `no-access`, `no-key`, `load-failed` and `error`, and return `retry` (decisions 1, 2, 3 and 6). Verify: cases "User cancels unlock", "Unlock requested again", "Caller has no entry", "Access entries could not be fetched", "Envelopes could not be loaded", "User without a key", "Retry after a failed request" and "Key flow error" in `packages/doceditor/src/hooks/__tests__/useFileEncryptionKeys.test.tsx`; `pnpm exec vitest run src/hooks`
- [x] 1.3 Doceditor: show each status with its message and button in `packages/doceditor/src/components/Editor.tsx`, with the English keys `EncryptedFileUnlockToOpen` and `EncryptedFileNoAccessYet` in `public/locales/en/Common.json` (decisions 4 and 5). Verify: cases "Unlock dismissed", "No access entry", "No key", "Request failed", "Key flow error" and "Keys loading" in `packages/doceditor/src/components/__tests__/Editor.test.tsx`; `pnpm test:doceditor`; `pnpm exec tsc` in doceditor

## 2. Locales

- [x] 2.1 Common: add the `.meta` and translator comments of the two keys (`translate-comments`) and translate them into the 31 other languages (`translate-locales`). Verify: `cd common/tests && npx vitest run test/locales.test.js` shows no failure beyond the four foreign keys; `npm --prefix ./common/tests run test:lefthook`; foreign `.meta` files restored

## 3. Gate

- [ ] 3.1 Run the gate, every command on its own with its exit code read: `pnpm exec tsc` in the six packages, the shared, client, sdk and doceditor unit suites, `npm --prefix ./common/tests run test:lefthook`, `locales.test.js`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`, the main spec included after a trial archive on a scratch copy. Verify: every command green, recorded here with the date

## Workflow follow-up

- Archive after 3.1.
- The doceditor E2E image is not built here; the page is covered by unit tests only, and that is recorded in 3.1.
- The translations are not reviewed by native speakers.
