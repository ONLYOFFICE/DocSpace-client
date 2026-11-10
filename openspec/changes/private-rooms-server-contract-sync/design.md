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

Client side, read the same day:

- Serialization. `ConfigureJsonOptions`
  (`common/ASC.Api.Core/Core/DynamicIgnoreResolver.cs:264-276`) sets
  `DefaultIgnoreCondition = WhenWritingNull`, so a null property is absent
  from the JSON.
- Keys of another member. `EncryptionKeyDto.PrivateKeyEnc`
  (`products/ASC.Files/Core/ApiModels/ResponseDto/EncryptionKeyDto.cs:75-80`)
  is filled only for the caller; `SanitizeAccessKeys`
  (`EncryptionKeyPairDto.cs:401-415`) and the candidates route (`:328`) set
  it to null, so it is absent.
- File access info. `FilesController.GetEncryptionInfoAsync`
  (`products/ASC.Files/Server/Api/FilesController.cs:1244-1272`) returns
  `UserKeys` from `GetKeyPairAsync()` (`EncryptionKeyPairDto.cs:153-161`),
  null for a user without keys, so absent; `FileKeys` comes from
  `FileDao.GetFileKeys` (`FileDao.cs:2537-2549`), always a list.
- Key deletion. `PrivacyRoomController.DeleteKeys`
  (`products/ASC.Files/Server/Api/PrivacyRoomController.cs:254-268`) returns
  `NoContent()`.
- Guests and size. `DemandKeyOwnerAsync` (`EncryptionKeyPairDto.cs:118-128`)
  throws `SecurityException` for a guest on create, replace and delete;
  `EncryptionLoginProvider.SetKeysAsync` (`EncryptionLoginProvider.cs:50-71`)
  throws `ArgumentException` (400) before it touches the stored profile when
  the encrypted profile exceeds `MaxProfileLength` = 65535 (`:43-48`).
- File public keys. `EncryptionKeyPairDtoHelper.GetKeyPairAsync(fileId)`
  (`EncryptionKeyPairDto.cs:194-243`) takes `FileSharing.GetSharedInfoAsync`
  (`FileSharing.cs:853-964`, through the batch overload `:966`): the share
  records of the file and of every folder above it, the room included, through
  the folder tree (`SecurityDao.GetSharesAsync`, `SecurityDao.cs:1185-1255`),
  grouped by subject; then an owner entry for `entry.CreateBy`, the file's
  creator, when no record is marked owner (`FileSharing.cs:904-918`); groups
  and links are dropped (`EncryptionKeyPairDto.cs:222`), users without keys
  skipped (`:226-230`). The room owner holds no share record of their own, so
  they appear only as the file's creator. The main spec's "plus the owner",
  written in the earlier sync, was a misreading of that owner entry.
- 403 texts. The mock refusals that say "You don't have enough permission ..."
  stand for `SecurityException`s (`CopyPermissionsCheck` above;
  `DemandRoomAccessManagerAsync`, `EncryptionKeyPairDto.cs:370-394`), which
  every client receives as "Access denied". The mock's other 403 texts ("file
  ... not found", "The user does not have an encryption key") stand for
  `InvalidOperationException`s, whose message the server keeps.

No stashed design document covers these server rules.

## Goals / Non-Goals

**Goals:**
- Every `server-contract` requirement this change touches states what the
  server source does at `a7d94e4b81`.

**Non-Goals:**
- The private section requirements, owned by `private-rooms-server-section`.

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

5. **A separate type for another member's key.** The own key set always
   carries the private half and the keys-management code reads it as a
   string, so `TEncryptionKeyPair` stays as it is; the room and file key
   routes return a member key type whose private half is optional. Making the
   field optional on the shared type would push a check into every own-key
   reader for a case that cannot happen there.
6. **The mock approximates the size boundary.** The server measures the
   encrypted profile, which the mock cannot reproduce; the mock refuses a key
   set whose JSON exceeds 65,535 bytes, which the real server refuses too (the
   encrypted profile is longer). Its comment says so.
7. **The publickeys mock follows the server's set.** It returns the members
   with keys other than the room owner, plus the file's creator, which a file
   seed may name (`createdBy`, the owner when left out).

## Risks / Trade-offs

- [The 500-character limit] → The creation requirement loses the AI agent
  clause from its statement; the "AI agent created as private" scenario keeps
  it.
- [`private-rooms-server-section` archives with stale text] → Its server
  requirements were not re-read here; its own tasks do that.
