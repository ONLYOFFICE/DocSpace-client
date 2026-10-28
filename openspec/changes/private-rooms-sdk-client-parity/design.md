# Design

## Context

See proposal.md for the motivation. The parity audit of 2026-10-26 compared the client's `private-rooms/file-operations` and `private-rooms/room-membership` requirements with the SDK, one requirement at a time. The facts below shape the approach.

**Two implementations of most rules.** The SDK private pages (`packages/sdk/src/app/(private)/**`) render generic SDK views with private props. Shared code already used by both apps:
- `decryptEncryptedItemToFile`
- `downloadAndDecryptFile`
- `createEncryptedFile`
- `MediaViewer`
- `selectMemberKeys`
- `verifyMemberKeys`
- the room membership services in `packages/shared/services/private-room/room-encryption.ts`

Everything else the SDK either copied or never had. Pure client-only rules that the SDK needs:
- `resolveFolderTarget`, `resolveDropTarget` and `isDropRefused` in `packages/client/src/store/uploadDataStore/target.helpers.ts`
- `planPrivateTransfer` and the same-room copy naming in `filesActionsStore/copyMove.helpers.ts`
- the picker rules in `components/FilesSelector/utils.ts`
- the create rules in `helpers/encryptedFileCreation.ts`
- leave-time revocation in `filesActionsStore/rooms.helpers.ts`
- the invite result toasts in `components/panels/InvitePanel`
- the owner-candidate filter in `ChangeRoomOwnerPanel`

Shared helpers the SDK does not call yet:
- `resolveUploadGate`
- `sniffDse3Upload` and `recoverDekForReimport`
- `listDecryptedFileNames` and `resolveNameClashes`
- `getRoomsRequestScope`
- `useResolvedFileTitle`
- `getEncryptedOperationErrorMessage`

**Two encrypted upload paths.** The SDK uploads through the shared `encrypted-upload-orchestrator.ts`. The client's `uploadDataStore` does not call it. The client encrypts through the shared `prepareEncryptedUpload`, but keeps its own copy of the self-then-room wrap fan-out and the skipped-member report (`uploadDataStore/encryption.helpers.ts`). It also keeps its own gate, locked-batch, quota-stop, retry and re-import handling (`chunkUpload.helpers.ts`, `start.helpers.ts`).

**Server facts the plan relies on** (read through CodeGraph):
- A folder's `private` field is its own setting: `FolderDtoHelper` sets `result.Private = folder.SettingsPrivate` (`../server/products/ASC.Files/Core/ApiModels/ResponseDto/FolderDto.cs:595`). Only a room carries the setting, so a folder inside a private room reads false.
- `FoldersController.GetFolderPath` (`HttpGet "folder/{folderId}/path"`, `../server/products/ASC.Files/Server/Api/FoldersController.cs:547-552`) answers the chain of folders from the section root, the room among them.
- The copy/move operation decides the private-room rule from the parent folders of the source and of the destination. It allows only a move within one private room (`CompliesPrivateRoomRulesAsync`, `../server/products/ASC.Files/Core/Services/WCFService/FileOperations/CopyPermissionsCheck.cs:823-845`, called for folders at line 479 and for files at line 661).
- Upload sessions are not checked for privacy: `FileUploader.InitiateUploadAsync` stores the session with whatever encrypted flag it is given, with no private-room check (`../server/products/ASC.Files/Core/Utils/FileUploader.cs:258-299`). A plaintext upload into a private room is therefore accepted.
- The rooms list takes a privacy filter: `VirtualRoomsController` passes `inDto.PrivacyFilter` (`../server/products/ASC.Files/Server/Api/VirtualRoomsController.cs:1370`; enum `RoomPrivacyFilter`, `../server/products/ASC.Files/Core/Core/RoomPrivacyFilter.cs:39`).
- The server withholds Copy from files inside an active private room (`../server/products/ASC.Files/Core/Core/Security/FileSecurity.cs:1894-1903`).
- The empty-file handler serves the default template `new` plus the internal extension of the requested title (`FileHandlerService.EmptyFile`, `../server/products/ASC.Files/Core/HttpHandlers/FileHandler.ashx.cs:759-829`). PDF maps to `.pdf` (`FileUtility.cs:116-121`), and `common/resources/DocStore/new/<culture>/new.pdf` exists, so a PDF template is served.

**Plan audit of 2026-10-27.** A second pass checked the open tasks against the SDK and client code and the server (read through CodeGraph):
- History "Open location" in the SDK puts the decrypted name of an encrypted file into the folder filter's `search`, which reaches the address, the folder request and the host bridge. The client leaves `search` empty for an encrypted file.
- An archived private room has no encrypted upload override, so the SDK upload hotkey takes the plaintext path. The conflict check `POST files/{folderId}/upload/check` receives the file titles and only then refuses a folder without the Create right (`UploadController.CheckUploadAsync`, `../server/products/ASC.Files/Server/Api/UploadController.cs:421-445`); an upload session is refused the same way (`FileUploader.GetFolderIdAsync`, `../server/products/ASC.Files/Core/Utils/FileUploader.cs:163`). No content is stored, but the names leave the browser.
- In an archived room the server allows only Read, Delete, ReadHistory, Copy, Move, Download, ReadLinks and IndexExport (`FileSecurity.cs:1929-1947`, under `../server/products/ASC.Files/Core/Core/Security/`). Its private-room withholding of Copy, CopyTo and EditAccess sits in the VirtualRooms branch only (`FileSecurity.cs:1894-1922`), so an archived private room reports Copy for its encrypted files.
- EditRoom and EditAccess are both granted by the RoomManager share (`FileSecurity.cs:2274-2287`, `2447-2461`), and an invite checks `CanEditAccessAsync` (`../server/products/ASC.Files/Core/Utils/FileSharing.cs:647`). Offering invite on EditRoom follows the client and changes nothing visible today.
- Finalizing an upload session emits a socket "create" (`UploadController.cs:357`). The SDK's encrypted path adds no row itself, so without a socket event the list stays stale; the client inserts the row from the upload result.
- `EntryManager.MarkAsRecent` returns early for an encrypted file (`../server/products/ASC.Files/Core/Utils/EntryManager.cs:2117-2122`), so encrypted files never appear in recent files.
- `GET files/{fileId}/access` returns only the caller's own entries (`FilesController.GetEncryptionInfoAsync`, `../server/products/ASC.Files/Server/Api/FilesController.cs:1229-1251`), and `FileDao.SetFileKey` replaces only the users it is given (`../server/products/ASC.Files/Core/Core/Dao/TeamlabDao/FileDao.cs:2400-2432`). The leave-time revocation therefore deletes nothing, as the main spec `private-rooms/room-membership` already records.

**Stashed documents.** No stashed design document covers this. The SDK plan in the author's stash predates the parity work; where it disagrees with the code, the code wins.

## Goals / Non-Goals

**Goals:**
- One implementation per rule, in `packages/shared`, called by both apps; no SDK copy of a client rule survives the change.
- No path in the SDK sends plaintext into a private room or runs a non-private flow on one.
- The client's behaviour stays as its specs describe it while its code moves.

**Non-Goals:**
- Changing the client's behaviour. Where the audit found the client spec and the client code disagreeing (room Download), this change follows the code and leaves the decision to the client's owners.
- Porting the client's queue, conversion, retry UI or panels wholesale. Only the encrypted rules move.
- The editor, key generation in the SDK, sdk-js.

## Decisions

**D1. Move client rules into `packages/shared`, then delete the SDK copies.**
- Each pure client helper the SDK needs moves to `packages/shared/services/private-room/` (or `packages/shared/hooks/` for hooks), in a commit that only moves it.
- The client imports it from the new place. Its unit tests move with it or keep importing through the client module.
- The SDK then switches to the shared helper and deletes its own copy in a separate task.
- Where the two apps use different menu keys (`copy-to` in the client, `copy` in the SDK), the shared piece is a predicate on the item ("is this action withheld for this item"), and each app maps it to its own keys.
- Alternative: re-implement the rules in the SDK against the client's specs. Rejected: that is how the copies drifted.

**D2. Private rooms only through `/private`.**
- The generic SDK room lists (`(rooms)/_components/rooms-list`) build their request through the shared `withRoomsRequestScope`/`getRoomsRequestScope`, with the private section counted as available. Rooms and Rooms → Archive therefore send `privacyFilter=NotPrivate`.
- The generic room pages (`(rooms)/rooms/[roomId]`, `(rooms)/rooms/archive/[roomId]`) resolve the room on the server before rendering. When it is private, they redirect to `/sdk/private/{roomId}`, carrying the `privateRooms` opt-in if the request has it, and the private layout then renders or shows the not-available view.
- The filter is applied even when the host has not passed the opt-in, because the SDK has no other private flows to run a private room through. This is recorded in proposal.md for review.
- Alternative: make the generic pages private-aware. Rejected by the user on 2026-10-26: every generic flow would need the private branch, and a missed one leaks plaintext.

**D3. Destination resolved from the folder path.**
- The SDK's `resolveEncryptedCopyDest` decides from `current.private`. It is replaced by the shared `resolveFolderTarget` (moved from the client), which reads `getFolderPath` and takes the room entry, the way the server's own `CompliesPrivateRoomRulesAsync` does.
- `useFileOperations.confirmOperation` uses the same target for the same-room check. That check was added by `private-rooms-sdk-gating-and-parity` 4.2 and D10 and is wrong today for any folder inside a room.
- The resolution happens before the unlock prompt.
- An unresolved destination copies nothing and reports `Common:EncryptedCopyFailed`, as in the client.
- The MODIFIED "Copy and move destination resolved fail-closed" replaces the text `private-rooms-sdk-gating-and-parity` gives it, so its scenario "Copy into another private room" is dropped: "Copy into a folder of another private room" covers it, since a room root is the room entry of its own path. The E2E case "Copy into another private room" in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts` stays, as the room-root variant of the same rule. The scenario "Move into another private room" moves to the ADDED "Moves stay inside the private room".

**D4. Transfers follow the client's plan.**
- `confirmOperation` asks the shared `planPrivateTransfer` what to do and follows it:
  - same room: server move;
  - refuse into, refuse a move into another private room, refuse folders out;
  - re-encrypt into another private room;
  - decrypt out.
- The Move dialog gets the client's pinned root (the open room), so a move cannot leave the room; this removes the SDK's move-out and cross-room move branches from `useEncryptedCopyMove.ts`.
- The copy dialog takes the client's private branch of `getIsDisabled` (no destination without the Create right) and the client's banner rule (copy only).
- Copy-out decrypts through the shared `decryptEncryptedItemToFile` and hands the plaintext files to the SDK's standard upload (`useDocsActions` default path with its conflict check). The SDK's private `uploadPlaintextFile` is removed.
- A same-room copy or duplicate names the copy through the shared `encrypted-name-clash` helpers and the moved same-room naming.

**D5. One encrypted upload pipeline (user decision 2026-10-26).**
- The shared orchestrator becomes the single implementation of an encrypted upload:
  - per file: prepare, encrypted session, chunks, self-then-room wrap and skipped-member report;
  - per batch: the upload gate (`resolveUploadGate`: no key, locked, room type), failing the items with the client's keys; quota stop; retry against the fixed target; re-import through `sniffDse3Upload`/`recoverDekForReimport`; the name-clash check.
- It exposes a per-file entry point next to the batch one.
- The client's `uploadDataStore` keeps its queue, which also serves plaintext uploads, conversion and ordinary rooms. It hands each encrypted item to the shared per-file entry point and applies the shared batch rules. Its copies in `encryption.helpers.ts` and the encrypted parts of `chunkUpload.helpers.ts` are deleted.
- The SDK's `useEncryptedUpload` uses the same entry points with the SDK `UploadStore`. Its item ids are passed into the orchestrator, so progress, the encrypting label, cancellation and retry find their panel rows.
- Order: the orchestrator gains the rules (with shared unit tests), the SDK switches, then the client switches with its existing upload tests and the `private-room-upload-target.spec.ts` and `encrypted-file-ui.spec.ts` E2E specs as the guard.
- Alternative: replace the client's queue with the orchestrator's batch loop. Rejected: the queue serves far more than encrypted uploads.

**D6. One private-aware create action.**
- In a private room every SDK create entry calls one action, built on the shared create rules (moved from `packages/client/src/helpers/encryptedFileCreation.ts`: allowed extensions, unique default title) and the shared `createEncryptedFile`. The entries are:
  - the "+ New" menu, the empty view, the quick actions,
  - the Shift+D/S/P/O hotkeys,
  - the mobile main button.
- docx, xlsx, pptx and pdf are created encrypted. Any other request is refused with `Common:PrivateRoomCreateNotSupported`, and without keys the entries are hidden.
- The mobile "New PDF form" shows `Common:MobileEditPdfNotAvailableInfo`, as in the client.
- The editor's create route is never reached from a private room.
- The PDF form entry replaces the exclusion recorded in `private-rooms-sdk-gating-and-parity` D3.
- The empty-template mock serves `new.pdf` with the PDF signature (server facts above).
- An upload or create entry, hotkeys included, starts only when the open folder grants Create. An archived private room offers neither, so no plaintext path and no file name request is reachable there (audit of 2026-10-27).

**D7. Shared menu predicates.**
- What the client withholds for an encrypted file, a folder inside a private room, and a private room becomes shared predicates. The client's `contextOptions.helpers.ts` and the SDK's item, header, selection and room menus all call them, and the SDK's private whitelists in `private-context-options.ts` are derived from them.
- The client's menu snapshots (see `.claude/rules/source-checks.md`) must stay unchanged; that is the check that the move did not change the client.
- The SDK adds download-encrypted to the header menu and withholds integrator custom actions for encrypted items, as the client withholds plugins.
- The predicates apply per item, so an encrypted file that opens only after a conversion loses open and preview, as in the client.
- The room menu nests download, duplicate and embedding in "More options", so the withheld keys are removed recursively. Doubled, leading and trailing separators and an empty submenu are dropped. The selection menu of private rooms withholds download as well.

**D8. Downloads and errors.**
- The SDK refuses a download of any folder inside a private room, from every menu and from any selection holding one (download-as included), before any request.
- It never offers the room download of a private room (the decrypted folder download is not part of the light client). The client still offers it; this is a deliberate light-client divergence, see proposal.md.
- Download without decryption of a folder stays a server archive of the ciphertext files, as in the client (`private-rooms/file-operations`, "Download without decryption"). User decision 2026-10-27.
- No encrypted path shows a raw error text. Specific keys stay (`Common:EncryptedCopyFailed`, `Common:EncryptionDownloadFailed`); an error without one goes through the shared `getEncryptedOperationErrorMessage`.

**D9. Membership from every entry point.**
- The private pages stop mounting the generic room dialogs. The header ⋮ actions of an open private room open the private dialogs through `PrivateDialogsStore`: invite with re-wrap, owner change with key checks, edit with the private badge, leave.
- Leave-time revocation, the invite result reporting, the owner-candidate filter, the group expansion and the create-room gate move to `packages/shared` from the client.
- The removal guard uses the client's counter from `packages/shared/utils/uploadErrors.ts` and the client's toast.
- The invite panel closes after the room security update and reports the re-wrap progress afterwards, as the client does today. The progress lives outside the panel, which unmounts on close. User decision 2026-10-27: `private-rooms-invite-atomic-rewrap` later changes the shared invite orchestration and the panel once, for both apps, and takes the SDK into its scope.
- The entry points routed to the private dialogs are the header ⋮ of an open private room, the info panel ⋮ of an open private room (no room actions reach it today) and edit and leave in the private rooms list. `PrivateDialogsStore` gains a leave entry. This routing lands last, after the private flows it opens are complete.
- The units moved to shared are: the leave-time revocation, the invite re-wrap with its result reporting, the owner-candidate filter, the new owner's key validation, the revocation of removed members with the group expansion, and the create-room gate (secure-context check, key re-fetch, key-generation gate). Known client quirks move unchanged: the 100-member page of the owner-candidate filter, its fail-open on error.
- The leave-time revocation is ported as the main spec describes it, although the server keeps the entries (Context). User decision 2026-10-27. Leaving matches the client otherwise: the leave option of an owner change is checked by default, and the result toast and the return to the private rooms list are the client's.

**D10. Names and archive.**
- The SDK name recovery reacts to the files-list store (an observer on its items) through the shared `useEncryptedFilenameRecovery`, which skips cached and already attempted files, so socket, paging and navigation updates are covered without a room-keys request per change.
- The SDK's reduced `useDecryptedFilename` is replaced by the shared `useResolvedFileTitle` in rows, tiles and table; the info panel history recovers the names of its entries, related entries included, as the client does.
- The pickers get the client's `usePickerFileTitles`, moved to shared.
- Recent files are left out: the server never marks an encrypted file as recent (Context).
- A file stored by an encrypted upload, duplicate or copy is added to the open folder's list from the orchestrator's result (the stored file and its path), as the client does, without waiting for a socket event.
- Whether an open folder is private, and whether it is archived, comes from its path through the shared target (D3), not from the route. A room without the private setting opened at a private address goes to its generic room page.
- The archive keeps the active-room predicates (D7), filtered by the rights the server sends for an archived room. Copy of an encrypted file is offered whatever copy right the server reports, as in an active room; `private-rooms-server-hardening` 9.1 turns that right off in the archive as well. The header and info panel room menus get the archive state.
- The private info panel renders the generic info panel header, whose tabs include Share for a file, while its body offers only History and Details (found while implementing 1.7). The header takes the private tabs, as the client's "Share tab hidden for private items" (`private-rooms/room-membership`) requires.

**D11. Light-client limits.**
- In a private room the SDK filter bar hides search, and the private room server page and the sign-in return address ignore a `search` parameter. The folder list drops `search` from its own requests on private pages.
- The ui-kit Filter cannot hide its search field today, and the desktop main button is drawn inside it. User decision 2026-10-27: `docspace-ui-kit-react` gains a Filter prop that hides the search field and keeps the main button; until that release the apps take it through `pnpm run update-ui-kit`.
- Opening the location of an encrypted file opens its folder without a search, so its name never reaches the server, the address or the host.
- The SDK gets no clipboard hotkeys.
- These are SHALL NOT requirements in the sdk-surface delta, so a later change has to lift them explicitly.

**D12. Security fixes first.** D3, D2 and D6 close the three plaintext leaks and come before the refactors. The audit of 2026-10-27 added two name leaks (History "Open location", uploads in an archived private room); they come next, before the remaining refactors. Each lands with an SDK E2E case in `packages/sdk/__tests__/e2e/private/private-rooms.spec.ts` showing that no plaintext reaches the server.

**D13. Name clash prompt.** The orchestrator's name-clash check runs only when its caller passes an answer. The SDK passes one through the shared conflict-resolve dialog without the overwrite option: keep both uploads with the first free copy suffix, and skip or cancel sends nothing. Without it, a second file with the same decrypted name is stored silently.

## Risks / Trade-offs

- [Moving client code changes client behaviour unnoticed] → Moves are mechanical and land without logic edits. The client's unit tests, menu snapshots and `private-room-*.spec.ts` E2E specs run on every move task.
- [The upload pipeline switch breaks the client's upload] → The orchestrator gains the rules first, with shared unit tests. The SDK switches before the client, and the client switch is one task guarded by its upload unit tests and two E2E specs.
- [Overlap with `private-rooms-sdk-gating-and-parity`, which modifies the same sdk-surface requirements and whose 4.2 and D10 code D3 rewrites] → Archive that change first; the MODIFIED requirements here build on its delta.
- [Overlap with `private-rooms-invite-atomic-rewrap`] → This change only moves today's invite orchestration to shared and fixes the SDK's order of operations; the pending-access work stays in that change.
- [Leaving private rooms out of generic lists without the opt-in hides them from hosts that relied on seeing them] → Recorded as a review decision in proposal.md; the not-available view names the opt-in.
- [SDK E2E builds take minutes] → Run E2E per task group in a long-lived container (build once, run many), as done for `private-rooms-sdk-gating-and-parity` 6.1.
- [Hiding search depends on a ui-kit change in another repository] → The server-side and request-side parts of the search limit do not depend on it; the hidden field lands through a local ui-kit pack and switches to the published version once released.
- [The client code moved in the membership task has few tests] → Characterization tests for the owner-candidate filter, the key re-fetch and the cancel close of the create dialog are added before the move.
- [Server: an uninvited DocSpace administrator keeps Read, Copy and Download on an archived private room, because the administrator bypass of the archive branch (`FileSecurity.cs:1949-1983`) lacks the private-room exclusion of the rooms branch (`FileSecurity.cs:1643-1653`)] → Out of scope here; already covered by `private-rooms-server-hardening` (requirement "Administrator bypass excludes archived private rooms", task 9.1).

## Migration Plan

No data migration. Each task is one commit and can be reverted on its own. The plaintext fixes (D12) are independent of the refactors and can ship first.
