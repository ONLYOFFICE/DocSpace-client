# Tasks

## 1. privacyroom handlers

- [x] 1.1 Rewrite the key handlers in `packages/shared/__mocks__/handlers/privacyroom/` to the server contract (create 201 / duplicate 409 / blank 400; replace unknown 404; delete 204 no body / unknown 404; list without `response` when no key; `cryptoEngineId` on stored keys) and fix the header comment (actions `CreateKeyPairAsync`, `ReplaceKeyPairAsync`; test file name); verify by updating `handlers/privacyroom/__tests__/contract.test.ts` (the "no-op" cases become 409/404) and running `cd packages/shared && pnpm exec vitest run __mocks__/handlers/privacyroom`.
- [x] 1.2 Rewrite `privacyroom/{roomId}/access`: 404 unknown room, 400 non-private room, 403 caller without a key, private half only on the caller's entries, entries without a public key dropped; verify with new contract-test cases for each branch.

## 2. Encrypted-files handlers

- [x] 2.1 `files/{id}/access` read: caller's `fileKeys` only, with `tenantId` and `createOn`; 403 for a missing file; verify by fixing `files/__tests__/encrypted-files-contract.test.ts` (two-entry and 404 expectations).
- [x] 2.2 `files/{id}/access` write: bare array only, replace listed users only, no `response`, 403 for a missing file; drop the `{ keys }` envelope case from the contract test; verify with a case that an unlisted user's entry survives.
- [x] 2.3 `files/file/{id}/publickeys`: 415 outside a private room, sanitised foreign entries; verify with contract-test cases.
- [x] 2.4 Upload sessions: session create returns `ChunkedUploadSessionDto` (`path` as folder ids, `location`, no `bytes_uploaded`); numbered chunk upload returns the session DTO and never builds the file; sequential chunk and finalize return `UploadSessionResponseDto` with 201 on completion; verify with contract tests for each route.
- [x] 2.5 Entry DTOs in `encryptedFiles.ts` and `privateRoomList.ts`: section `rootFolderId`, room `parentId` = section id, `parentRoomType` 19, `encrypted` omitted when false, file `security.Copy` false, subfolders `private: false`, remove fields the server lacks; fix the listing and folder-info doc comments (`GetFolderByFolderId`, `GetFolderInfo`); verify with a contract test on one listed file and the room DTO.
- [x] 2.6 `fileops/delete`: no `files`/`folders` for a delete, add `status`; verify with the existing delete contract test.
- [x] 2.7 Listing `pathParts` in `encryptedFiles.ts` and `privateRoomList.ts`: the breadcrumb chain from the Rooms section down to the listed folder, each part `{ id, title, roomType, folderType }` with `roomType` omitted where `DocSpaceHelper.MapToRoomType` gives none (`FileStorageService.GetFolderItemsAsync`); verify with contract-test cases for the room listing.

## 3. E2E and client fallout

- [ ] 3.1 Run the private-room E2E specs in Docker (`docker-compose run --rm -T -e WORKERS=2 tests-dev pnpm exec playwright test __tests__/private-room-*.spec.ts __tests__/keys-management*.spec.ts __tests__/encrypted-file-ui.spec.ts`), triage every failure as "spec asserted invented behaviour" (fix the spec) or "client bug the mock hid" (record a task here with the failing spec as evidence).
- [ ] 3.2 Fix or split out the client bugs found in 3.1 (see Decisions needed in proposal.md); verify with the same E2E run green.

## 4. Integration check

- [ ] 4.1 Run `pnpm test` (shared, includes the contract tests), `pnpm run test:client`, `pnpm run tsc`, `pnpm run lint`; verify all green.
- [ ] 4.2 `npx -y @fission-ai/openspec@latest validate private-rooms-mock-fidelity --strict` passes.

## Workflow follow-up

- Unblocks task 5.4 of `private-rooms-upload-fail-closed`.
