# Design

## Context

`getAvailableInfoPanelTabs` (`packages/client/src/helpers/info-panel/tabs.ts`)
builds the info panel tabs of the client for both the header and the body
(`pages/Home/InfoPanel/Header/headerGeneral.tsx`,
`pages/Home/InfoPanel/Body/bodyGeneral.tsx`). It adds Share for a non-room
item that carries `canShare`, unless the item itself is private
(`private` on a room) or encrypted (`encrypted` on a file). A folder inside a
private room has neither flag, so its Share tab follows `canShare` alone.

The function already receives `isPrivacyFolder`
(`TreeFoldersStore.isPrivacyFolder`: the open folder is a private room or has
one on its navigation path) and uses it to withhold plugin tabs
("AI and plugin actions withheld").

What the server reports for such a folder, read in `../server` through
CodeGraph at `4db0ede147`:

- `products/ASC.Files/Core/Core/Security/FileSecurity.cs` (around line 2055):
  for an entry whose room has `SettingsPrivate` and that is not the room
  itself, `EditAccess`, `Copy` and `CopyTo` are refused. `folder` there is
  the entry itself (lines 1247-1249), so the check applies to the folder
  inside the room, not to its parent.
- `products/ASC.Files/Core/Utils/FileSharing.cs` (around line 696,
  `FileSharingHelper.CanSetAccessAsync`): false unless the user can edit
  access to the entry.
- `products/ASC.Files/Core/ApiModels/ResponseDto/FileEntryDto.cs` (around
  line 604): `canSetAccess` comes from `CanSetAccessAsync`, is forced false
  for a private custom room, and is sent as `CanShare`.
- `products/ASC.Files/Core/ApiModels/ResponseDto/FolderDto.cs:596`: only the
  room carries `Private`; a folder inside it has no mark of its room.
- `products/ASC.Files/Core/Utils/FileSharing.cs:107-113`
  (`FileSharing.SetAceObjectAsync`): a link with any access other than none
  is refused for a private room and for an entry located in one
  (`DocSpaceHelper.LocatedInPrivateRoomAsync`); revoking an existing link
  stays possible.

So the server sends `canShare: false` for such a folder today; the client
change keeps the requirement when that input changes.

No stashed design document is behind this decision.

## Goals / Non-Goals

**Goals:**
- Share is never in the tab list while a private room or one of its folders
  is open, whatever `canShare` the selected item carries.

**Non-Goals:**
- Folders of a private room shown outside the room (Favorites, search): the
  DTO gives the client nothing to recognise them by.
- The SDK private info panel, which never offers Share.

## Decisions

1. **Gate on `isPrivacyFolder` next to `isPrivateItem`.** The Share condition
   adds `!isPrivacyFolder`. It reuses the flag the function already takes for
   plugin tabs, so callers do not change. Alternative: a new folder flag from
   the server - rejected, it needs server work for a case the server already
   answers with `canShare: false`.
2. **Everything selected inside a private room loses Share**, not only
   folders. A file there is encrypted and has no Share already; an
   unencrypted file inside a private room is not something the spec allows
   to share either.

## Risks / Trade-offs

- [Selection that is not in the open folder, such as a pinned selection
  after navigating out] -> `isPrivacyFolder` follows the open folder, so a
  private folder kept selected after leaving the room is judged by the
  server's `canShare` alone, which is false (Context above).
- [`private-rooms-external-links` modifies the same requirement] -> by the
  owner's decision of 2026-11-16 it shows Share to the owner and the room
  managers while the portal allows external links of private rooms. By the
  owner's decision of 2026-11-20 this change goes first: once it is
  archived, that change rebases its `room-membership` delta on the
  requirement as this change leaves it (the scenario "Folder inside a
  private room selected" gives way to its scenarios for the members who
  manage links), and its client task lifts the `isPrivacyFolder` condition
  under its own conditions. The note is recorded under its task 3.2.

## Gate runs

None yet.
