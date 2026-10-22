# Proposal

## Why

A check on a local portal on 2026-10-22 showed the Members tab of a private room offering "Shared links" and "Create new link", but only when the room is selected in a list (Private or Rooms). Inside the room the controls are gone. The rooms in a list are built by `buildFilesListItems` (`packages/client/src/store/filesStore/filesList.helpers.ts`), which since the refactor `567ae3492de` (2026-07-08) renames the server's `private` to `isPrivateRoom` and drops `private` from the item.

Every consumer that reads `private` from a room selected in a list therefore treats a private room as an ordinary one:
- the Members tab shows the public-link controls;
- **removing a member** from that tab skips the active-upload guard, the encrypted-room confirmation and the revocation run (`Members/sub-components/User.tsx`);
- the details view (`InfoPanel/Body/views/Details`) and the room title (`ItemTitle/RoomsItemTitle.tsx`) colour the room badge as for an ordinary room.

Two other readers are not affected. The info panel tabs (`helpers/info-panel/tabs.ts`) read `private` only on the Share branch, which no room reaches: a room gets the Members tab instead. The invite panel takes the room from `filesStore.folders` or `getFolderInfo`, both of which hold the server room DTO with `private`; only the selection holds list items. The invite seen on the portal took the private path, which also ends with the "Users invited" toast once the file keys are wrapped.

## What Changes

- Rooms built for a list keep the server's `private` flag next to `isPrivateRoom`, so a room selected in a list carries the same privacy as the room opened.
- The Members tab and member removal are covered by tests that start from a list item, not from a room loaded with `getFolderInfo`. The info panel tabs and the invite panel, which were not affected, get cases for a room selected in a list as well, so those scenarios stay covered.
- Nothing else changes: the rules of private rooms stay as specified; they now also hold for a room selected in a list.

Out of scope: the members and invite behaviour of private rooms itself (`private-rooms-invite-atomic-rewrap`), and the server. No decision needs a human.

Server dependency: none.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/room-membership`: scenarios for a room selected in a list are added to "No public sharing for private rooms", "Removed member loses file access entries", "Member removal confirmation for encrypted rooms", "Share tab hidden for private items" and "Invite requires an unlocked identity".

## Impact

- Client: `packages/client/src/store/filesStore/filesList.helpers.ts`; the consumers are fixed by the flag, not edited one by one.
- Tests: unit tests for the list item, the Members tab, the member removal, the info panel tabs and the invite panel's send handler; an E2E case in `private-rooms-section.spec.ts` that selects a private room in the Private list.
- No server, SDK, locale or doceditor change.
