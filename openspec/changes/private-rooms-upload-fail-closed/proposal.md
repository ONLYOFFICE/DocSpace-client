# Proposal

## Why

Four client paths let data leave or enter a private room in a form the room's encryption contract does not cover: an upload by a user without a usable key is sent as plaintext, a dropped folder tree bypasses the folder-upload block, clipboard hotkeys run the generic server-side transfer with none of the private-room guards, and "Move" out of a private room leaves the source in place. The first three are security defects (plaintext or ciphertext lands where it must not); the fourth silently misreports what the user did. None of this is documented as a decision in the recovered design documents, so it must be fixed before the `privateRooms` flag can be removed.

## What Changes

- An upload into a private room MUST fail closed when the current user has no usable encryption key: the item is marked as failed with a localized reason and no bytes are sent. The shared gate helper that today returns "do not encrypt" for a key-less user returns "refuse" instead, and the upload-gate test that asserts the plaintext fallback is inverted.
- Folder trees dropped onto a private room are refused the same way the "Upload folder" button and Shift+U are, with a localized explanation.
- Ctrl+C / Ctrl+X / Ctrl+V between folders route through the same private-room transfer rules as drag-and-drop and the copy/move dialog: transfer into a private room is refused, folders cannot leave, files leaving are decrypted on the client, same-room copies get a suffix.
- "Move" out of a private room deletes the source after every decrypted copy succeeded; a partial failure leaves the failed sources in place and reports them.
- **BREAKING** for users relying on the current behaviour: a key-less member can no longer add files to a private room at all.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/file-operations`: "Uploads into a private room are encrypted on the client" (key-less upload is refused), "Folder upload disabled in private rooms" (dropped folder trees refused), "Files leaving a private room are decrypted" (move deletes the source on success), "Clipboard hotkeys use the generic transfer path" (rewritten and renamed to "Clipboard hotkeys follow the private-room transfer rules").

## Impact

- Client stores: upload chunk pipeline and upload-start selectors (`packages/client/src/store/uploadDataStore/*`), hotkey clipboard actions (`packages/client/src/store/HotkeyStore.ts`), copy/move helpers (`packages/client/src/store/filesActionsStore/copyMove.helpers.ts`), the folder-tree drop handler on the Home page, the destination picker (`packages/client/src/components/FilesSelector`).
- Shared: the upload encryption gate helper and its tests under `packages/shared/services/private-room`.
- Locale: new `Common` keys (upload refused without key, upload refused when locked, folder drop refused, move partially failed), translated to all 31 languages in the same change.
- Tests: unit tests for the gate, the hotkey paste path and the move-out path; E2E in `packages/client/__tests__/private-room-access.spec.ts` for the refused upload.
- Server: no change. The server does not reject plaintext uploads into private rooms today (see `private-rooms/server-contract`); a server-side guard is tracked in `private-rooms-server-hardening`.

## Out of scope

- The SDK surface: `packages/sdk` already resolves destinations fail-closed and deletes the source on move; parity items live in `private-rooms-sdk-gating-and-parity`.
- A decrypted folder download or folder transfer out of a private room (stays withheld).
- Server-side rejection of unencrypted uploads into private rooms (backend work).

## Decisions needed

- Whether "Move" out of a private room deletes the source (recommended, see design.md) or is withheld so only "Copy" remains. The artifacts assume delete-on-success.
