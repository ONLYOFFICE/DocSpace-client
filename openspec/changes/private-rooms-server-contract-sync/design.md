# Design

## Context

See proposal.md, Why. Server read on 2026-11-10: `../server` at `a7d94e4b81`
(`release/v4.1.0`), through CodeGraph (`codegraph query`, `node`, `explore`)
and then the source by line range.

- File update. `FileStorageService.UpdateFileStreamAsync`
  (`products/ASC.Files/Core/Core/FileStorageService.cs:2271`) saves through
  `EntryManager.SaveEditingAsync` (`products/ASC.Files/Core/Utils/EntryManager.cs:1501`),
  which throws `SecurityException` when the flag is missing and the file is
  encrypted or lies in a private room (`:1541-1545`). The write path behind it
  refuses a plain file in a private room as well
  (`FileDao.DemandEncryptedInPrivateRoomAsync`,
  `products/ASC.Files/Core/Core/Dao/TeamlabDao/FileDao.cs:486-492`, called from
  `SaveFileAsync` and `ReplaceFileVersionAsync`).
- Room creation. `FileStorageService.CreateRoomAsync` (`:666-700`) answers
  400 (`ArgumentException`) for an AI hub room type with the private flag;
  `CreateThirdPartyRoomAsync` (`:732-739`) answers 400 for the private flag;
  `DemandPrivateRoomCanBeCreatedAsync` (`:722-730`) runs
  `EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync`
  (`common/ASC.FederatedLogin/LoginProviders/EncryptionLoginProvider.cs:97-104`),
  which treats a missing record and an empty set alike and throws
  `InvalidOperationException`, mapped to 403 by `ResponseWrapper`
  (`common/ASC.Api.Core/Middleware/ResponseWrapper.cs:86-88`). No check of the
  public or form-filling room type exists.
- Copy and move. `FileMoveCopyOperationsManager.Publish`
  (`products/ASC.Files/Core/Services/WCFService/FileOperations/FileOperationsManager.cs:517-568`)
  runs `CopyPermissionsCheck.RunPermissionCheckAsync` before it queues the
  operation; that ends in `PermissionCheckStarter.CheckCopyDataAsync` with
  `check: true` (`CopyPermissionsCheck.cs:112-135`), so a failed private-room
  rule (`CompliesPrivateRoomRulesAsync`, `:818-839`) throws
  `SecurityException` with the move-file or move-folder message
  (`:484-490`, `:666-672`). `ResponseWrapper` answers every `SecurityException`
  with 403 and the message "Access denied" (`:71-76`), so the specific texts
  never reach a client.
- Key history. `HistoryService.TrackedActions`
  (`products/ASC.Files/Core/Core/History/HistoryService.cs:46-121`) includes
  `FileKeysSet`.
- Archived private room. `FileStorageService.SetEncryptionInfoAsync`
  (`:5454-5478`) demands `CanCreateAsync` on the parent room and throws
  `SecurityException` without it; the Archive branch of
  `FileSecurity.FilterEntryAsync` (`products/ASC.Files/Core/Core/Security/FileSecurity.cs:2068-2083`)
  admits no Create action.
- App gate. `FoldersController.IsPrivateRoomsAppEnabledAsync`
  (`products/ASC.Files/Server/Api/FoldersController.cs:1162-1167`, app id
  `e2e-rooms`, `:874`) has two callers: `GetPrivateRoomsFolder` (`:1144-1160`,
  404 while off) and `GetRootFoldersIdsAsync` (`:1169-1213`, leaves the
  Private root out). The privacy filter of the rooms list
  (`FileSecurity.cs:2981-2993`), the key routes
  (`EncryptionKeyPairDtoHelper.DemandKeyOwnerAsync`, `EncryptionKeyPairDto.cs:118-128`)
  and room creation above read no app setting.

No stashed design document covers these server rules.

## Goals / Non-Goals

**Goals:**
- Every `server-contract` requirement this change touches states what the
  server source does at `a7d94e4b81`.

**Non-Goals:**
- The private section requirements, owned by `private-rooms-server-section`.
- Mocks, client types and contract tests: a later update of this change.

## Decisions

1. **Write today's server, not the planned one.** "Private room creation
   requires keys" leaves out the public and form-filling refusal, which the
   server does not have; `private-rooms-server-hardening` keeps that scenario
   in its delta until its backend task lands.
2. **Name the refusal by status and message as a client sees it.** The copy
   scenarios say 403 "Access denied", since the server-side texts are
   replaced by `ResponseWrapper`.
3. **Rename the recovery requirement.** The key history part of its name is no
   longer true, so it becomes "No recovery or offboarding endpoints".
   `private-rooms-server-hardening` removes it under its old name, so its
   REMOVED header follows the rename.
4. **Keep the hardening blocks consistent.** Its MODIFIED blocks for creation
   and copy would put the old texts back when it archives, so they take the
   same wording, with its extra creation scenario kept.

## Risks / Trade-offs

- [The 500-character limit] → The creation requirement loses the AI agent
  clause from its statement; the "AI agent created as private" scenario keeps
  it.
- [`private-rooms-server-section` archives with stale text] → Its server
  requirements were not re-read here; its own tasks do that.
