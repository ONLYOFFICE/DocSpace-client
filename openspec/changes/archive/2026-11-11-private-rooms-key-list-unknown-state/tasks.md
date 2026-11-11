# Tasks

One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`). The change states nothing about `../server`; nothing there changes. No locale key is added.

## 1. Shared

- [x] 1.1 Shared: add `ensureEncryptionKeys` to `packages/shared/store/UserStore.ts`: the known list at once, otherwise one shared read, resolving to the list or to `null` on failure (design decision 2). Verify: cases "known list", "unknown list read once for concurrent callers", "read fails", "read after a failure starts a new request" in a unit test next to the store; `cd packages/shared && pnpm exec vitest run store`; `pnpm exec tsc` in shared

## 2. Client views

- [x] 2.1 Client: pass `keysLoaded` from `EncryptionProviderWrapper.jsx` and make its `DeviceSetupHintEffect` wait for it (decisions 1 and 6). Verify: cases "Key list not known" and "First private room this session" in a unit test of the wrapper; `cd packages/client && pnpm exec vitest run src/components`
- [x] 2.2 Client: show no no-access lock in `ItemIcon.tsx` and withhold no menu entry in `filesStore/contextOptions.helpers.ts` on account of keys while the list is unknown (decision 3). Verify: case "Key list not known" in the tests of both, the case "User without keys" unchanged; `pnpm exec vitest run src/components src/store/filesStore`

## 3. Client room entry and actions

- [x] 3.1 Client: on entering a private room with an unknown list, read it through `ensureEncryptionKeys` in `filesStore/fetch.helpers.ts`; on failure show Common:EncryptionKeysLoadFailed with the Common:TryAgain link, once per room entry (decision 4). Verify: cases "Key list could not be loaded", "Retry succeeds", "Retry fails" and "Navigate into room" in `packages/client/src/store/filesStore/__tests__`; `pnpm exec vitest run src/store/filesStore`
- [x] 3.2 Client: read an unknown list before refusing in `filesActionsStore/download.helpers.ts` (single file, zip, folder) and `copyMove.helpers.ts` (decision 5). Verify: cases "Read succeeds with a key", "Read fails" and "Read answers with an empty list" for download and for copy; `pnpm exec vitest run src/store/filesActionsStore`
- [x] 3.3 Client: the same for the upload gate of `uploadDataStore` and for file creation in `GlobalEvents/CreateEvent.js`: a failed read marks the upload row failed with Common:EncryptionKeysLoadFailed, without the device-setup hint, and ends the creation with that toast (decision 5). Verify: case "Read fails" for upload and for creation, the case "Uploader without a key" unchanged; `pnpm exec vitest run src/store/uploadDataStore src/components/GlobalEvents`

## 4. E2E

- [x] 4.1 Client: add the cases "Key list could not be loaded" and "Retry succeeds" to `packages/client/__tests__/private-room-access.spec.ts` with a key-list handler that fails until told otherwise. Verify: the spec in Docker `tests-dev`

## 5. Gate

- [x] 5.1 Run the gate: `pnpm exec tsc` in the six packages, the shared, client and sdk unit suites, `npm --prefix ./common/tests run test:lefthook`, and `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`, the main spec included after a trial archive on a scratch copy. Verify: every command green, recorded here with the date
  - 2026-11-11: `pnpm exec tsc` clean in shared, client, sdk, doceditor, login and management. Unit suites: shared 2313, client 2133, sdk 498, all passed. The client count is of the full suite run again after the toast fix: that fix first broke two cases of `FilesActionsStore.encryption.test.ts`, which expected one error toast per failure in the same second, and they were corrected in a commit after the archive. Biome clean on the touched paths. `test:lefthook`: 61 passed, 3 skipped. Docker `tests-dev`: `private-room-access.spec.ts` 20 of 20 with `--repeat-each=4`; the private-room, encrypted-file, key-flow and keys-management specs 155 passed, 6 skipped, and the two wide-screen screenshot cases of `keys-management.spec.ts` failed as before this change (task 4.6 of `private-rooms-beta-release`). `openspec validate --all --strict`: 20 of 20; after a trial archive on a scratch copy, 19 of 19 with the main spec included.

## Workflow follow-up

- Archive after 5.1.
- The editor page keeps its own handling of key errors until card C8.
