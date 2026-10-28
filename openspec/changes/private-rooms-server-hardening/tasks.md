# Tasks

## 1. Contract mirrors

No mock runs ahead of the server (main spec `private-rooms/server-contract`, "E2E mocks mirror the server contract"): each client task below adds the MSW handler and contract test of its route once the server task it names has merged, read in `../server` through CodeGraph. The upload-session abort route exists today and is mirrored by 7.1.

## 2. Owner change

- [ ] 2.1 Backend: in `FileStorageService.ChangeOwnerAsync` (`../server/products/ASC.Files/Core/Core/FileStorageService.cs`) return the encrypted files lacking an entry for the new owner and refuse the change until none remain; verify with a server unit test
- [ ] 2.2 Client: once 2.1 has merged, mirror the owner-change response in the MSW handlers with a contract test; in `packages/client/src/components/panels/ChangeRoomOwnerPanel` read the missing-files response, run the backfill from `packages/shared/services/private-room/room-encryption.ts` for the candidate, retry, and show the unreadable files on failure; verify with a client unit test and `packages/client/__tests__/private-room-members.spec.ts`

## 3. Availability rule and metadata guards

- [ ] 3.1 Backend: add the private-room availability rule (default allow) and the distinct 403 error code in room creation; refuse watermark, indexing and lifetime on private rooms in `CreateRoomAsync` / `UpdateRoomAsync`; verify with server unit tests
- [ ] 3.2 Client: once 3.1 has merged, mirror the private-rooms-unavailable 403 and the metadata-guard validation errors in the room creation and update MSW handlers with contract tests, and map the error code to a new Common key in `packages/client/src/store/CreateEditRoomStore.ts`; add the key with `translate-comments` and `translate-locales`; verify with a client unit test, `cd packages/shared && pnpm exec vitest run __mocks__/handlers` and `cd common/tests && npx vitest run test/locales.test.js`. The watermark, indexing and lifetime controls need no change: `SetRoomParams` renders them for the VirtualDataRoom type only (`isVDRRoom`), and a private room is created and edited as a Custom room

## 4. Titles and e-mails

- [ ] 4.1 Backend: validate encrypted upload titles in the upload session (`UploadController.cs` / `FileUploader.cs`) against the opaque form, a lowercase UUID optionally followed by a dot and a lowercase alphanumeric extension (design decision 14); verify with server unit tests for a plaintext title, a UUID with an extension and a bare UUID
- [ ] 4.2 Backend: drop the plaintext room title from private-room invitation and notification e-mails (both call sites in `FileSharing.cs`: the new-address invite at lines 429-431 and the existing-user notice at line 443; the resend in `FileStorageService.ResendEmailInvitationsAsync` at lines 5504 and 5539; the room notices of `NotifyClient.cs`, such as `SendRoomRemovedAsync` at line 352; and the notify templates, of which `pattern_saas_room_invite_existing_user` prints the title); verify with a server unit test on the notification arguments
- [x] 4.3 Client: assert the title sent for encrypted uploads already matches the opaque form of the requirement "Encrypted file titles are validated", with and without an extension, in `packages/shared/services/private-room/__tests__/encrypted-upload.test.ts` (no behaviour change expected)
- [ ] 4.4 Client: once 4.1 has merged, mirror the title check in the upload session handler of `encryptedFilesHandlers` with a contract case; verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files`

## 5. Multi-device file keys (BL-8)

Withdrawn: the client operates with one key per user (`private-rooms-single-key`), so the (file, user) file-key stays.

## 6. Audit and history

- [ ] 6.0 Decide the revocation primitive (proposal decision 4, design Open Questions): server-side removal of a user's access entries when they leave a private room or are deprovisioned, or a route for room managers to remove named users' entries; no removal operation exists today. Verified by the decision recorded in design.md and a backend task for the chosen operation added to this section
- [ ] 6.1 Backend: write audit events for `SetEncryptionInfoAsync` (`DocumentsActionMapper.cs`, `FileStorageService.cs`) and expose the per-file access history route; the revocation audit event is BLOCKED on 6.0 and is added to the operation it decides; verify with server unit tests
- [ ] 6.2 Client: once 6.1 has merged, add the access-history request to `packages/shared/api/privacy` with its MSW handler and contract test; verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers/privacyroom`

## 7. Upload abort

- [ ] 7.1 Client: mirror the abort route as the server implements it today (`UploadController.AbortUploadSession`, HttpDelete "{folderId}/session/{sessionId}": 200 without a `response`, 403 for a session another account opened, 404 for one that is unknown, finalised, aborted or expired, the folder segment unmatched until 7.2) in `encryptedFilesHandlers` with contract cases, add the request to `packages/shared/api/files`, and call it when an encrypted upload is cancelled after its session opened, in the shared orchestrator (`packages/shared/services/private-room/encrypted-upload-orchestrator.ts`) that the client upload store and the SDK both run; verify with `encrypted-upload-orchestrator.test.ts`, `packages/client/src/store/uploadDataStore/__tests__/UploadDataStore.encryption.test.ts` and `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files`
- [ ] 7.2 Backend: match the folder segment of `DELETE {folderId}/session/{sessionId}` against the session and correct the route's documentation remark, which still says the account is not checked (`UploadController.cs:152-161`); verify with a server unit test that an abort through another folder id is refused

## 8. Recovery and offboarding (B2B launch)

- [ ] 8.1 Backend: recovery-administrator enrolment and retrieval routes with audit, and the deprovisioning hook that blocks owner deprovisioning; the part of the hook that revokes entries is BLOCKED on 6.0 (no removal operation exists today); verify with server unit tests
- [ ] 8.2 Client: once 8.1 has merged, add the enrolment, recovery and offboarding requests with their MSW handlers and contract tests, an enrolment step in `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management` (opt-in by policy) and a recovery action for administrators, with locale keys translated; verify with hook unit tests next to the existing flows and `packages/client/__tests__/keys-management.spec.ts`

## 9. Archived private rooms and room events

- [ ] 9.1 Backend: in the Archive branch of `FileSecurity.FilterEntryAsync` (`../server/products/ASC.Files/Core/Core/Security/FileSecurity.cs`) apply the private-room copy denial for files and subfolders and skip the administrator bypass inside private rooms, as the VirtualRooms branch does (design decision 7); verify with server unit tests on an archived private room: the owner and members get no Copy, an administrator who is not a member gets no right on its entries and cannot delete or move the room, an administrator who is a member keeps the rights of their share, and a batch copy of a subfolder out of the archived room is refused
- [x] 9.2 Backend: trace a batch copy of a subfolder out of an archived private room (`CopyPermissionsCheck.cs:479` reads the folder's own private setting; the Archive branch grants Copy on subfolders) and record in design.md whether the folder or its encrypted files can land outside the room; if they can, add a requirement and a backend task to this section. Verified by the result recorded in design.md
- [ ] 9.3 Backend: leave administrators who are not members out of the socket recipients of a private room in `SocketManager.WhoCanRead` (`../server/products/ASC.Files/Core/Utils/SocketManager.cs`) (design decision 8); verify with a server unit test
- [ ] 9.4 Client: once 9.1 has merged, set Copy to false for the files and folders of the `archived` variant of `encryptedFilesHandlers` (`packages/shared/__mocks__/handlers/files/encryptedFiles.ts`) and update the contract case "File in an archived private room" in `encrypted-files-contract.test.ts`; client behaviour does not change, because Ctrl+C is already withheld and copy-out already decrypts; verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files` and `cd packages/client && pnpm test:e2e:docker:dev __tests__/private-room-archived.spec.ts`
- [ ] 9.5 Backend: accept files of archived private rooms in `EncryptionKeyPairDtoHelper.GetKeyPairAsync(fileId)` (`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs:212`), as `GetKeyPairForRoomAsync` does (`:260`), design decision 9; verify with a server unit test that the public keys of a file in an archived private room are returned and a file outside private rooms still gets 415
- [x] 9.6 Client: until 9.5 merges, let the archived variant of `encryptedFilesHandlers` answer 415 on `files/file/{fileId}/publickeys`, as the server does today, and add the contract case "File in an archived private room answers 415 today"; then flip it back with 9.5. Verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers/files` and the archived private-room E2E spec in Docker (copies out of the archive still decrypt through the room roster)

## 10. Integration

- [ ] 10.1 Run the client E2E private-room suite against the updated mocks and the pre-push gate; verify with `pnpm test:e2e:docker:start` and `openspec validate --all --strict`

## 11. Invitee keys

- [ ] 11.1 Backend: add the invitee keys route to `PrivacyRoomController` (`products/ASC.Files/Server/Api/PrivacyRoomController.cs`) with a helper next to `GetKeyPairForRoomAsync` (`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs`), as design decision 10 describes: callers admitted by `FileSharingHelper.CanSetAccessAsync` on the room, keys read with `encryptionLoginProvider.GetKeysAsync(userId)`, entries without `privateKeyEnc`, users without keys absent, 404 for an unknown room, 400 for a room that is not private, 403 otherwise; verify with server unit tests that a non-member with keys is returned without `privateKeyEnc`, a user without keys is absent and a caller who may not change the room's access gets 403
- [ ] 11.2 Client: once 11.1 has merged, add the request to `packages/shared/api/privacy` and an MSW handler in `packages/shared/__mocks__/handlers/privacyroom` mirroring the merged route, with its contract test; verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers/privacyroom`. `private-rooms-invite-atomic-rewrap` 2.1 uses it to verify invitees before the room security update

## 12. Re-check findings (2026-10-28)

- [ ] 12.1 Backend: in `EncryptionLoginProvider.SetKeysAsync` (`common/ASC.FederatedLogin/LoginProviders/EncryptionLoginProvider.cs:69`) remove only the encryption link, `RemoveProviderAsync(userId, ProviderConstants.Encryption)` (design decision 11); verify with a server unit test that a user with a Google link keeps it after saving keys and holds one encryption record
- [ ] 12.2 Backend: refuse external and invitation links on a private room in the link routes (`VirtualRoomsController.cs:854`, `FileStorageService.cs:4715-4747, 6351-6420`), and add Duplicate, CreateRoomFrom and IndexExport to the room-level private denials in `FileSecurity.FilterEntryAsync` (`FileSecurity.cs:1906-1913`) (design decision 12); verify with server unit tests that each request on a private room is refused and an ordinary room is unaffected
- [ ] 12.3 Backend: make `ThrowIfKeysAreNotSetAsync` (`EncryptionLoginProvider.cs:97-103`) treat an empty key set as no keys, accept the private flag with the Custom room type only in room creation (`FileStorageService.cs:1164-1167`), and pass the private flag on in `CreateThirdPartyRoomAsync` (`:766`) (design decision 13, unless proposal decision 6 refuses third-party private rooms); verify with server unit tests for an empty key set, another room type and a third-party room without keys
- [ ] 12.4 Client: once 12.2 and 12.3 have merged, mirror the refusals in the MSW handlers for room links and room creation, with contract tests; verify with `cd packages/shared && pnpm exec vitest run __mocks__/handlers`
- [ ] 12.5 Decide the member-removal race (proposal decision 7, design Open Questions) and add the backend task for the chosen option to this section; verified by the decision recorded in design.md

## Workflow follow-up

- Archive only after every backend task has merged on `../server`; until then the delta describes the agreed contract, not the branch.
