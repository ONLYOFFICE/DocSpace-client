# Design

## Context

See proposal.md, Why. Each fix below was found by reading the code against
the main specs on 2026-11-06. The server facts come from `../server` at
`db5f85f317`, read through CodeGraph.

- Delete. `deleteItemActionImpl` (`packages/client/src/store/filesActionsStore/delete.helpers.ts:506`)
  shows the dialog when `confirmDelete || treeFoldersStore.isPrivacyFolder`
  (or third-party, or a room). Four other paths test `confirmDelete` alone and
  call `deleteAction` directly:
  - the Delete key (`HOCs/withHotkeys.js:462`)
  - the menu of a selection (`contextOptionsStore/groupContextOptions.helpers.ts:355`)
  - the header menu (`FilesHeaderOptionStore.ts:215`)
  - the menu of the folder being viewed (`contextOptionsStore/actions.helpers.tsx:506`)

  The dialog itself already counts a private room among the cases that always
  ask: `DeleteDialog/index.js:95`, `canSkipConfirmation`.
- Paste. `HotkeyStore.moveFilesFromClipboard` (`HotkeyStore.ts:866`) returns
  when the open folder lacks CopyTo or MoveTo, before
  `planPrivateTransfer` runs. The server refuses EditAccess, Copy and CopyTo
  on every folder inside a private room that is not the room itself
  (`products/ASC.Files/Core/Core/Security/FileSecurity.cs:2055-2058`, VirtualRooms
  branch). MoveTo is untouched, so a cut and paste into a subfolder of the same
  room never reaches the server move it is entitled to. Ctrl+C puts nothing
  from a private room on the clipboard, so a paste whose source is a private
  room is always a move.
- Auto-lock. `getAutoLockTimeoutSeconds`
  (`packages/shared/services/encryption/auto-lock-preference.ts:94-100`)
  returns `MAX_AUTO_LOCK_SECONDS` (86400) for any stored value above it,
  before the preset check. The presets are 0, 300, 900, 1800 and 3600, so a
  value of 999999 reads as 24 hours.
- Sort. `applyClientSearchImpl` (`packages/client/src/store/filesStore/clientSearch.helpers.ts:183-213`)
  re-sorts by the resolved titles only after a query has filtered the list.
  Without a query it returns the items in the server's order, and the server
  sorted them by their opaque stored titles.
- Form from a file. The Alt+Shift+O hotkey (`withHotkeys.js:408-420`) opens
  the file picker in any folder that is not a form room. The create menu
  disables that entry in a private room
  (`contextOptionsStore/folderModel.helpers.ts:283-289`, `disabled: isPrivacyFolder`).
  The private branch of `CreateEvent.js:181-200` ignores the template and
  creates an empty encrypted PDF.
- AI. On document ready, `useEditorEvents.ts:288-289` creates the editor's
  connector for every signed-in user who is not a guest. Line 320 skips only
  the plugin set-up for an encrypted file. The `callEditorTool` message
  bridge and the `editorDocumentReady` signal (`:470-530`) are registered all
  the same, and the bridge answers every call with an error. Nothing in this
  repository listens for `editorDocumentReady`.
- SDK link. `getKeysManagementUrl`
  (`packages/sdk/src/app/(private)/_utils/keys-management-link.ts:48`) sets
  `privateRooms=1`. The only reader of that name is the SDK's own frame
  opt-in (`packages/shared/utils/privateRooms.ts`). The client page opens in
  a new tab, outside any frame, and gates on the section's availability.
- SDK members. `PrivateMembersView.tsx:105` asks
  `GET files/rooms/{id}/share` with `filterType: 0`. On the server that is
  `ShareFilterType.UserOrGroup`
  (`products/ASC.Files/Core/Core/Security/SubjectType.cs:43`).
  `ShareFilterType.User` is 16 (`:59`). `SecurityDao.GetPureSharesQuery`
  maps it to `SubjectType.User` records only
  (`products/ASC.Files/Core/Core/Dao/TeamlabDao/SecurityDao.cs:1161`), and
  `FileSharing.GetPureSharesAsync` accepts it (`products/ASC.Files/Core/Utils/FileSharing.cs:777-809`).
  Guests are users, so the filter keeps them, and `classifyMembers`
  (`PrivateMembersView.utils.ts:54`) files them under users.
- Move out without the picker. Drag and drop
  (`copyMove.helpers.ts`, `moveDragItemsImpl`) and paste both call
  `runPrivateTransferPlan`. For a `decrypt-out` plan it starts
  `copyEncryptedFilesToFolder` at once. Only the picker shows the warning
  (`FilesSelector/index.tsx:312`, `getShowEncryptedTransferBanner`). The
  client already confirms a move into a public room the same way, with
  `components/dialogs/MoveToPublicRoom` and a `dialogsStore` flag.

No stashed design document covers these points.

## Goals / Non-Goals

**Goals:**
- Each code path does what its requirement says, with a unit test or an E2E
  case named after the scenario.

**Non-Goals:**
- Changing the delete paths for third-party items, rooms or Trash.
- Server work or mock shapes beyond the users-only filter.
- New locale keys.

## Decisions

1. **One predicate for the delete confirmation.** A `FilesActionStore`
   getter, `isDeleteConfirmationForced`, returns
   `filesSettingsStore.confirmDelete || treeFoldersStore.isPrivacyFolder`.
   The four paths and `deleteItemActionImpl` all test it, which keeps the
   third-party and room terms local to that one path. Alternative: open the
   dialog whenever `deleteAction` is called in a private room. Rejected,
   because `deleteAction` also runs from the dialog's own confirm button.
2. **Paste: refusals first, then the right the plan needs.** The paste
   computes the private plan before the rights guard, so a refusal toast
   shows in a subfolder too. A `same-room` plan, always a move, needs MoveTo
   only. Every other plan keeps today's guard (CopyTo and MoveTo).
   Alternative: test CopyTo for a copy and MoveTo for a move everywhere.
   Rejected, because it would change pasting in ordinary rooms, which this
   change does not touch.
3. **Auto-lock: the preset check decides.** The clamp to 24 hours goes, and a
   stored value outside the presets reads as the default. The setter keeps
   clamping what the UI hands it.
4. **Sort without a query.** `applyClientSearchImpl` re-sorts by the resolved
   titles, folders first, whenever the list is sorted by name in a private
   room (`treeFoldersStore.isPrivacyFolder`). With a query it does the same
   after filtering, as today. Outside private rooms nothing changes.
5. **Form from a file is ignored in a private room.** The hotkey returns in a
   private room before opening the picker, matching the disabled menu entry.
   `CreateEvent.js` is not changed: its private branch never receives a
   template once the hotkey is gone.
6. **No AI connector for an encrypted file.** `aiAllowed` also requires the
   file not to be encrypted, so neither the connector nor the bridge nor the
   ready signal exists for it. The `!isEncrypted` test inside the branch goes
   too.
7. **SDK link without the parameter.** `getKeysManagementUrl` builds the bare
   profile address. Its doc comment no longer promises a hidden page.
8. **SDK members: users only, guests dropped.** The request asks for
   `filterType: 16` (`ShareFilterType.User`), and `classifyMembers` skips a
   member whose `sharedTo.isVisitor` is set. The members mock
   (`roomMembersHandlers`) answers `filterType=16` with user records only and
   gets a contract case, "Users only", whose doc comment names
   `SecurityDao.GetPureSharesQuery`. Alternative: drop groups on the client
   too and keep `filterType: 0`. Rejected: the server can filter, and the
   paging count then matches the rows.
9. **A confirmation dialog for a move out without the picker.** This follows
   the `MoveToPublicRoom` pattern:
   - `runPrivateTransferPlan` takes an option, `confirmDecryption`, which
     drag and drop and paste pass and the picker does not.
   - With it, a `decrypt-out` plan stores itself in a `dialogsStore` field
     (`encryptedTransferConfirm`) instead of starting.
   - A new `EncryptedTransferConfirmDialog` under
     `packages/client/src/components/dialogs`, rendered by `DialogsWrapper`,
     shows the title Common:EncryptedTransferBannerTitle, the text
     Common:EncryptedTransferBannerDescription, and the buttons Common:Move
     and Common:CancelButton.
   - Move runs the stored plan, and Cancel clears it.

   The paste clears the clipboard only once the user confirms, so a declined
   paste can be repeated. Alternative: show a toast and move anyway.
   Rejected, because the spec asks for consent before anything is decrypted.

## Risks / Trade-offs

- [The name sort orders only the loaded items] → A private room longer than
  one page (the list pages by the server's order) is ordered within what is
  loaded. Search has the same limit today. If it matters for large rooms, a
  later change can load every page of a private room before sorting.
- [A host may wait for `editorDocumentReady` on an encrypted file] → Nothing
  in this repository listens for it, and the AI tools cannot run on an
  encrypted file anyway.
