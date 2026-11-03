# Tasks

Every task first adds a test named after its scenario and shows that it fails on the current code, then fixes the code. One task is one commit with its tick (the "Commits" paragraph of `openspec/config.yaml`).

## 1. Key list not loaded is not "no key" (review H2)

- [x] 1.1 Client create flow (`packages/client/src/components/dialogs/CreateEditRoomDialog/CreateRoomDialog.js:186` and `:203`):
  - treat `encryptionKeys === null` as unknown;
  - before any key offer, await `refreshKeysFromServer`, and offer generation only when it returned an empty list;
  - otherwise toast Common:EncryptionKeysLoadFailed and close a Private or template start;
  - make `refreshKeysFromServer` report failure instead of swallowing it.

  Add `EncryptionKeysLoadFailed` to `public/locales/en/Common.json` in the same commit, then run `/translate-comments` and `/translate-locales`. Verify:
  - cases "Key list could not be loaded" and "User accepts key generation" (with a list that loads empty) in `CreateRoomDialog.privateRoom.test.tsx`;
  - `cd packages/client && pnpm exec vitest run src/components/dialogs/CreateEditRoomDialog`;
  - `cd common/tests && npx vitest run test/locales.test.js`.
- [x] 1.2 Shared key gate (`packages/shared/hooks/usePrivateRoomKeyGate.ts`): take and pass `hasExistingKeys` to `useGenerateKeyFlow`, so that a gate whose caller knows of a key never starts generation. Verify: a case "Key already exists" in a new `packages/shared/hooks/usePrivateRoomKeyGate.test.tsx` (co-located, as the other hook tests of that folder), with `cd packages/shared && pnpm exec vitest run hooks`.
- [x] 1.3 Keys page (`keys-management/KeysManagement.tsx:101` and `useProfileBody.tsx` `getEncryptionKeysData`):
  - while the list is `null` after a failed load, show Common:EncryptionKeysLoadFailed with a Common:TryAgain button that reloads the list;
  - offer neither Generate nor Import.

  Verify: cases "Key list could not be loaded" and "Key list not known" in `keys-management/__tests__/KeysManagement.test.tsx`.
- [x] 1.4 SDK key store (`packages/sdk/src/app/(private)/_store/EncryptionIdentityStore.tsx`):
  - on a load error, keep the previous `keys` and set only `loadError`;
  - in `_store/EncryptionShell.tsx`, report `keysLoaded` only after a successful load.

  Verify:
  - case "Key list failed to load" (no key-generation prompt, the identity not locked) in a new `_store/EncryptionIdentityStore.test.tsx` (co-located, as the other store tests there) and in `_components/create-room/PrivateCreateRoomDialog.test.tsx`;
  - `cd packages/sdk && pnpm exec vitest run "src/app/(private)"`.

## 2. The SDK private pages keep the host opt-in (review H3)

- [x] 2.1 Provide a `PrivateRoomsOptInContext` from the `(private)` layout (`packages/sdk/src/app/(private)/layout.tsx`, which renders only with the opt-in). Make `_hooks/usePrivateRoute.ts` and `_hooks/usePrivateFrameBridge.ts` build their paths from it instead of `useSearchParams()` (design decision 8). Verify: case "Room opened after sorting" for `usePrivateRoute` and for the frame bridge's `navigateSection` in a new `_hooks/usePrivateRoute.test.tsx` (co-located), both with an address that has lost `privateRooms`.
- [x] 2.2 Add an SDK helper that appends the current address parameters `RoomsFilter` does not own (as `getOtherSearchParams` does for files), and use it in `(rooms)/_components/rooms-filter/useRoomsFilter.tsx:120`, `rooms-list/index.tsx:860` and `empty-view/index.tsx:116`. Verify:
  - case "Frame reloaded after a filter change" in a unit test of the helper and in `empty-view/index.test.tsx`, asserting that the pushed address keeps `privateRooms=true`;
  - generic room lists without the parameter are unchanged.
- [x] 2.3 SDK E2E: in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts`, sort the private list, open a room and assert that its content renders. Verify with `cd packages/sdk && pnpm exec playwright test __tests__/e2e/private`. Done 2026-11-03 after `pnpm run test:build`: 34 passed, 15 skipped, the new case included.

## 3. Cancelling an encrypted upload (review M1 and M2)

- [x] 3.1 Orchestrator (`packages/shared/services/private-room/encrypted-upload-orchestrator.ts`, design decisions 2 and 3):
  - pass the signal only to session start and chunk sending;
  - in the sequential path, skip the signal check once the last chunk request has been sent;
  - run `finalizeUploadSession` and the wrap stage without the signal;
  - return `aborted` when the signal is aborted, whatever error class the transport raised.

  Verify, in `services/private-room/__tests__/encrypted-upload-orchestrator.test.ts`:
  - "Cancelled while chunks are sent", sequential and parallel, with a `CanceledError` from the parallel chunk request: `aborted`, session aborted, no `failedAt`;
  - "Cancelled after the file is stored": the self-wrap and fan-out written, `ok: true`.
- [x] 3.2 Orchestrator fan-out after a late cancel: a failed members' write still marks the read members pending and reports `shareFailed`. Verify:
  - cases "Sharing fails after a late cancel" and "Stored file never left without its entries" in the same test file;
  - `cd packages/shared && pnpm exec vitest run services/private-room`.

  Done 2026-11-03: the behaviour comes with 3.1, which takes the signal out of the wrap stage; both cases fail on the orchestrator before 3.1.
- [x] 3.3 Client store (`packages/client/src/store/uploadDataStore/chunkUpload.helpers.ts:829` and `:875`, design decision 4):
  - the cancel watcher reacts to the row's `cancel` mark only;
  - a successful result for a row cancelled late is shown as uploaded, with its cancel mark cleared, and returns to the history without the queue bookkeeping of `checkChunkUpload`, which the cancel already did and which fails on the dropped history entry;
  - an `aborted` result leaves the row cancelled with no error text.

  Verify:
  - cases "Cancelled while chunks are sent" and "Cancelled after the file is stored" in `uploadDataStore/__tests__/UploadDataStore.encryption.test.ts`;
  - a case asserting that a later batch which starts nothing does not abort a running encrypted upload;
  - `cd packages/client && pnpm exec vitest run src/store/uploadDataStore`.
- [x] 3.4 SDK upload store (`packages/sdk/src/app/(private)/_store/PrivateEncryptedUploadStore.tsx` and `_hooks/useEncryptedUpload.ts`): a row cancelled late whose result is `ok` is shown as uploaded, and an `aborted` one as cancelled. Verify: cases "Cancelled after the file is stored" and "Cancelled while chunks are sent" in `_hooks/useEncryptedUpload.test.tsx`.

## 4. Key-change dialog (review M4 and M5)

- [x] 4.1 `packages/shared/context/encryption/EncryptionContext.tsx` (design decision 5):
  - render the dialog with `key={`${userId}:${newKey}`}`;
  - let `settleKeyChange` take the request it answers and shift the queue only when that request is still at its head.

  Verify:
  - cases "Next request after an answer" (a second click on the same button does not answer the next request) and "Queued key-change dialog opened" (the new dialog has the focus, with its own fingerprints) in `context/encryption/__tests__/EncryptionContext.test.tsx`;
  - `cd packages/shared && pnpm exec vitest run context/encryption`.
- [x] 4.2 Name lookup without the forbidden handler (design decision 6):
  - give `getUserById` (`packages/shared/api/people/index.ts:377`) an optional `skipForbidden` passed to `request`;
  - use it for the key-change dialog's lookup.

  Verify:
  - case "Peer name not readable" in `EncryptionContext.test.tsx`: the lookup is sent with `skipForbidden`, and a rejected lookup names the peer by id;
  - a case in a new `packages/shared/api/people/getUserById.test.ts` (co-located, as the other API tests) that the option reaches `request`.

## 5. Cancelling key generation closes a private-room creation (review M6)

- [x] 5.1 Shared flow and gate (design decision 7):
  - add `onCancel` to `useGenerateKeyFlow` (`packages/shared/dialogs/key-generation/useGenerateKeyFlow.tsx:193` and `:203`), called on a user cancel of the passphrase and recovery-phrase dialogs;
  - forward it from `usePrivateRoomKeyGate` as `onKeyGenerationCancelled`.

  Verify:
  - a case "User cancels inside key generation" in `dialogs/key-generation/__tests__/useGenerateKeyFlow.test.tsx`, for both dialogs;
  - a case in `hooks/usePrivateRoomKeyGate.test.tsx`.
- [x] 5.2 Close the creation on that callback when it started on the Private type or from a template:
  - in the client `CreateRoomDialog.js`;
  - in the SDK `(private)/_components/create-room/PrivateCreateRoomDialog.tsx`.

  Verify: case "User cancels inside key generation" in the new `CreateRoomDialog.keyGenerationCancel.test.tsx` and `PrivateCreateRoomDialog.keyGenerationCancel.test.tsx`, which run the real `useGenerateKeyFlow` (the existing dialog tests mock it), each failing on the dialog before this task.

## 6. Integration

- [x] 6.1 Run the pre-push gate (`pnpm run tsc`, `pnpm run lint`, `npm --prefix ./common/tests run test:lefthook`, `pnpm run test`, `pnpm run test:client`, `pnpm run test:sdk`, `pnpm run test:doceditor`) and `npx -y @fission-ai/openspec@latest validate --all --strict`; verify all green. Done 2026-11-03: tsc, lint and common/tests green; shared 2074, client 1864, sdk 466 and doceditor 27 unit tests passed; OpenSpec 18 of 18 valid.
- [ ] 6.2 Run the client private-room and keys E2E specs (`cd packages/client && pnpm test:e2e:docker:dev __tests__/private-room*.spec.ts __tests__/keys-management*.spec.ts __tests__/key-flow-edge-cases.spec.ts`) and the SDK private E2E folder; verify green, and record the run in this file.

## Workflow follow-up

- Archive with `/opsx:archive private-rooms-pre-pr-review-fixes` before opening the PR.
- The remaining review findings (H1, H4, M3, M7 to M12, zip entry names, lows) go into a separate change before the beta.
