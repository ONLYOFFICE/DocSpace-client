# Proposal

## Why

On 2026-11-06 the main private-room specs were checked against the code of
the branch. Several requirements are right, but the code does not do what
they say. The most serious case: with "confirm delete" turned off, four of
the five ways to delete skip the confirmation in a private room, and there a
deletion is permanent. The owner took two decisions the same day for gaps the
specs leave open: the SDK members view hides groups and guests, and a move of
encrypted files out of a private room that starts without the destination
picker shows the same decryption warning as the picker.

## What Changes

- Every way to delete (the Delete key, the menu of a selection, the header
  menu, deleting the folder being viewed) shows the confirmation in a private
  room whatever the "confirm delete" setting is, as the item menu already
  does.
- Ctrl+V into a subfolder of the same private room moves the cut files
  instead of doing nothing. It also shows the refusal toasts of the private
  transfer rules when the destination is a subfolder. Today it returns
  silently, because the server grants no CopyTo right on folders inside a
  private room.
- An auto-lock value read from localStorage that is not one of the presets
  reads as the default (off). Today a large value is clamped to 24 hours
  before the preset check.
- A private room's list sorted by name follows the decrypted names without a
  search query too, not only while searching.
- The "form from a file" hotkey (Alt+Shift+O) is ignored in a private room,
  where the create menu disables that entry. Today it creates an empty
  encrypted PDF, or fails for a user without keys.
- The editor of an encrypted file creates no AI connector and registers no
  editor-tool bridge. Today it creates both and only skips the plugin set-up.
- The SDK link to the client's keys page stops adding the `privateRooms=1`
  parameter, which nothing reads since the browser flag was removed.
- The SDK members view of a private room asks the server for users only and
  leaves guests out (owner decision, 2026-11-06).
- A move of encrypted files out of a private room by drag and drop or by cut
  and paste asks for confirmation with the decryption warning of the picker
  before anything moves (owner decision, 2026-11-06).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`:
  - "Deletion bypasses the recycle bin" names every entry point.
  - "Files leaving a private room are decrypted" warns on drag and drop and
    on paste, not only in the picker.
  - "Create hotkeys respect keys" ignores the form-from-file hotkey in a
    private room.
- `private-rooms/sdk-surface`: "Forgot passphrase and device setup link out to
  the client" drops the opt-in from the link. It also stops saying the SDK
  never offers key generation: the SDK does offer it when creating a private
  room needs a key.

The other fixes bring the code in line with requirements that are already
right: "Clipboard hotkeys follow the private-room transfer rules", "Client-side
search over decrypted names", "Preferences stored in localStorage are
validated on read", "AI editor tools disabled for encrypted files" and
"Members grouped without groups and guests".

## Impact

- Client: the delete paths (`withHotkeys.js`,
  `groupContextOptions.helpers.ts`, `FilesHeaderOptionStore.ts`,
  `contextOptionsStore/actions.helpers.tsx`, `delete.helpers.ts`), the paste
  flow (`HotkeyStore.ts`), the drag and paste transfer
  (`copyMove.helpers.ts`), a new confirmation dialog under
  `components/dialogs`, the client search and sort
  (`filesStore/clientSearch.helpers.ts`) and the create hotkeys
  (`withHotkeys.js`).
- Shared: `services/encryption/auto-lock-preference.ts`. The members mock
  (`__mocks__/handlers/rooms/roomMembers.ts`) learns the users-only filter.
- Doceditor: `hooks/useEditorEvents.ts`.
- SDK: `(private)/_utils/keys-management-link.ts`,
  `(private)/_components/members/PrivateMembersView.tsx` and `.utils.ts`.
- Locales: none. The dialog reuses Common:EncryptedTransferBannerTitle,
  Common:EncryptedTransferBannerDescription, Common:Move and
  Common:CancelButton.
- Server (`../server`): no work needed. The users-only filter
  (`ShareFilterType.User`) already exists.

## Out of scope

- The same delete paths also skip the confirmation for third-party items,
  rooms and permanent deletion from Trash, although the delete dialog says
  those cases always ask. That is not about private rooms. It is noted for
  the owner and left to a separate fix.
- The text drift of the specs, where the code is right and the spec is stale.
  A separate change handles it.
- Paging: the decrypted-name sort orders the items that are loaded. A room
  larger than one page shows each page in order, not the whole room. See
  design.md, Risks.
- The SDK drag-and-drop boundary helper (`checkDragDropBoundaries`). Nothing
  calls it, and the SDK offers no drag between folders.

## Decisions that needed a human

- SDK members: hide groups and guests (owner, 2026-11-06).
- A move out of a private room without the picker: confirm with the
  decryption warning (owner, 2026-11-06).
