# Tasks

## 1. Contract mirrors (client first)

- [ ] 1.1 Extend the MSW handlers in `packages/shared/__mocks__/handlers/files/encryptedFiles.ts` and `handlers/privacyroom/index.ts` with: owner-change missing-entries response, private-rooms-unavailable 403, metadata-guard validation errors, encrypted title validation, upload-session abort, access history, recovery enrol/retrieve, offboarding; verify with the contract tests in `packages/shared/__mocks__/handlers/*/__tests__` extended for each route

## 2. Owner change

- [ ] 2.1 Backend: in `FileStorageService.ChangeOwnerAsync` (`../server/products/ASC.Files/Core/Core/FileStorageService.cs`) return the encrypted files lacking an entry for the new owner and refuse the change until none remain; verify with a server unit test
- [ ] 2.2 Client: in `packages/client/src/components/panels/ChangeRoomOwnerPanel` read the missing-files response, run the backfill from `packages/shared/services/private-room/room-encryption.ts` for the candidate, retry, and show the unreadable files on failure; verify with a client unit test and `packages/client/__tests__/private-room-members.spec.ts`

## 3. Availability rule and metadata guards

- [ ] 3.1 Backend: add the private-room availability rule (default allow) and the distinct 403 error code in room creation; refuse watermark, indexing and lifetime on private rooms in `CreateRoomAsync` / `UpdateRoomAsync`; verify with server unit tests
- [ ] 3.2 Client: map the error code to a new Common key in `packages/client/src/store/CreateEditRoomStore.ts` and hide the watermark/indexing/lifetime controls for private rooms in `CreateEditRoomDialog`; add the key with `translate-comments` and `translate-locales`; verify with a client unit test and `cd common/tests && npx vitest run test/locales.test.js`

## 4. Titles and e-mails

- [ ] 4.1 Backend: validate encrypted upload titles against the opaque form in the upload session (`UploadController.cs` / `FileUploader.cs`); verify with a server unit test
- [ ] 4.2 Backend: drop the plaintext room title from private-room invitation and notification e-mails (both call sites in `FileSharing.cs`: the new-address invite at lines 429-431 and the existing-user notice at line 443, plus the notify service templates); verify with a server unit test on the notification arguments
- [ ] 4.3 Client: assert the title sent for encrypted uploads already matches the opaque form in `packages/shared/services/private-room/__tests__/encrypted-upload.test.ts` (no behaviour change expected)

## 5. Multi-device file keys (BL-8)

Withdrawn: the client operates with one key per user (`private-rooms-single-key`), so the (file, user) file-key stays.

## 6. Audit and history

- [ ] 6.0 Decide the revocation primitive (proposal decision 4, design Open Questions): server-side removal of a user's access entries when they leave a private room or are deprovisioned, or a route for room managers to remove named users' entries; no removal operation exists today. Verified by the decision recorded in design.md and a backend task for the chosen operation added to this section
- [ ] 6.1 Backend: write audit events for `SetEncryptionInfoAsync` (`DocumentsActionMapper.cs`, `FileStorageService.cs`) and expose the per-file access history route; the revocation audit event is BLOCKED on 6.0 and is added to the operation it decides; verify with server unit tests
- [ ] 6.2 Client: add the access-history request to `packages/shared/api/privacy` with its MSW handler and contract test; verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers/privacyroom`

## 7. Upload abort

- [ ] 7.1 Client: call the session abort route from the encrypted upload cancel path in `packages/client/src/store/uploadDataStore` and the shared orchestrator; verify with `packages/client/src/store/uploadDataStore/__tests__/UploadDataStore.encryption.test.ts`

## 8. Recovery and offboarding (B2B launch)

- [ ] 8.1 Backend: recovery-administrator enrolment and retrieval routes with audit, and the deprovisioning hook that blocks owner deprovisioning; the part of the hook that revokes entries is BLOCKED on 6.0 (no removal operation exists today); verify with server unit tests
- [ ] 8.2 Client: enrolment step in `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management` (opt-in by policy) and a recovery action for administrators, with locale keys translated; verify with hook unit tests next to the existing flows and `packages/client/__tests__/keys-management.spec.ts`

## 9. Archived private rooms and room events

- [ ] 9.1 Backend: in the Archive branch of `FileSecurity.FilterEntryAsync` (`../server/products/ASC.Files/Core/Core/Security/FileSecurity.cs`) apply the private-room copy denial for files and subfolders and skip the administrator bypass inside private rooms, as the VirtualRooms branch does (design decision 7); verify with server unit tests on an archived private room: the owner and members get no Copy, an administrator who is not a member gets no right on its entries and cannot delete or move the room, an administrator who is a member keeps the rights of their share
- [ ] 9.2 Backend: trace a batch copy of a subfolder out of an archived private room (`CopyPermissionsCheck.cs:467` reads the folder's own private setting; the Archive branch grants Copy on subfolders) and record in design.md whether the folder or its encrypted files can land outside the room; if they can, add a requirement and a backend task to this section. Verified by the result recorded in design.md
- [ ] 9.3 Backend: leave administrators who are not members out of the socket recipients of a private room in `SocketManager.WhoCanRead` (`../server/products/ASC.Files/Core/Utils/SocketManager.cs`) (design decision 8); verify with a server unit test
- [ ] 9.4 Client: once 9.1 has merged, set Copy to false for the files and folders of the `archived` variant of `encryptedFilesHandlers` (`packages/shared/__mocks__/handlers/files/encryptedFiles.ts`) and update the contract case "File in an archived private room" in `encrypted-files-contract.test.ts`; client behaviour does not change, because Ctrl+C is already withheld and copy-out already decrypts; verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files` and `cd packages/client && pnpm test:e2e:docker:dev __tests__/private-room-archived.spec.ts`
- [ ] 9.5 Backend: accept files of archived private rooms in `EncryptionKeyPairDtoHelper.GetKeyPairAsync(fileId)` (`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs:212`), as `GetKeyPairForRoomAsync` does (`:260`), design decision 9; verify with a server unit test that the public keys of a file in an archived private room are returned and a file outside private rooms still gets 415
- [ ] 9.6 Client: until 9.5 merges, let the archived variant of `encryptedFilesHandlers` answer 415 on `files/file/{fileId}/publickeys`, as the server does today, and add the contract case "File in an archived private room answers 415 today"; then flip it back with 9.5. Verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files` and the archived private-room E2E spec in Docker (copies out of the archive still decrypt through the room roster)

## 10. Integration

- [ ] 10.1 Run the client E2E private-room suite against the updated mocks and the pre-push gate; verify with `pnpm test:e2e:docker:start` and `openspec validate --all --strict`

## Workflow follow-up

- Archive only after every backend task has merged on `../server`; until then the delta describes the agreed contract, not the branch.
