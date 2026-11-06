# Proposal

## Why

The Duplicate entry has gone from the menu of an encrypted file in both the
client and the SDK, so the "Copy within the same private room" requirement no
longer holds through that entry. Since `bd89a24dcd` (2026-11-04) the server
answers `security.Duplicate` false for every entry of a private room,
because its own duplicate operation would store a copy without the file's
wrapped keys. Both apps gate the entry on that flag, although they never
call the server operation for an encrypted file: they decrypt, re-encrypt and
upload the copy themselves. The SDK private E2E cases "Same-room copy" and
"Copy of a name that already has a copy" have failed since the mocks took
the flag over (`private-rooms-server-hardening` 12.4a). The client E2E does
not reach the entry, so it stayed green.

`private-rooms-server-hardening` decision 12 asked the server to refuse the
duplicate of a private room as a whole. The server extended the refusal to
the room's entries, and that change recorded the extension
without checking it against this requirement.

## What Changes

- The client and the SDK offer Duplicate for an encrypted file of an active
  private room whenever the server grants the Move right on it, whatever the
  server answers for Duplicate. Move is granted to the same room roles that
  Duplicate was before the refusal (room owner, room manager, content creator
  on their own file) and is withheld in the archive, as Duplicate is.
- Unchanged: Duplicate stays withheld for folders inside a private room and
  for the private room itself (`PRIVATE_FOLDER_WITHHELD`,
  `PRIVATE_ROOM_WITHHELD`). The copy itself still goes through the
  client-side duplicate (`duplicateEncryptedFileImpl` in the client and the
  SDK's duplicate flow), never through the server operation.
- The SDK private E2E cases "Same-room copy" and "Copy of a name that
  already has a copy" pass again. A client E2E case covers the entry.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: a new requirement "Duplicate of an
  encrypted file follows the move right" says when Duplicate is offered for
  an encrypted file: on the Move right, not the Duplicate right the server
  withholds. Its scenarios cover the entry offered, withheld without the
  Move right, and withheld in an archived room. "Copy within the same
  private room" is unchanged.

## Impact

- Client: `packages/client/src/store/filesStore/contextOptions.helpers.ts`
  (the `duplicate` removal for files) and its unit tests
  (`FilesStore.contextOptions.branches.test.ts` and its snapshot, if the
  model changes there); a client E2E case in the private-room specs.
- SDK: `packages/sdk/src/app/(docspace)/_hooks/useItemContextMenu.ts` and
  `useItemContextMenu.test.tsx`; `__tests__/e2e/private/private-rooms.spec.ts`
  must turn green without edits.
- Mocks: none. `encryptedFilesHandlers` already mirrors the server
  (Duplicate false, Move true in a private room).
- Server (`../server`): no work needed. The client reads two rights the
  server already answers (`FileSecurity.FilterEntryAsync`).

## Out of scope

- Server-side duplicate of an encrypted file. It stays refused.
- Duplicate of folders inside a private room and of the private room itself.
- Menus other than the item context menu (the header menu of a selection,
  the media viewer). They keep their current gating, and a later change can
  align them if they turn out to withhold the entry too.

## Decisions needed

1. Whether the Move right is an acceptable stand-in, or the backend team
   should instead answer Duplicate on encrypted files by role again and
   refuse only its own duplicate operation for them. The stand-in needs no
   server change, and design.md compares it with the server read. Until this
   is decided, the change goes ahead with the stand-in.
