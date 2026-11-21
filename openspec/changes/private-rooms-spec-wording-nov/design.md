# Design

## Context

Read on 2026-11-19 at `54bed4b404d` on `release/v4.1.0`. No stashed design
document is involved. `openspec list` and the folders under
`openspec/changes/` were checked the same day: no open change modifies
"Section addresses", "Private section in an embedded frame" or "Private
room is a flagged Custom room". `private-rooms-invite-and-upload-robustness`
modifies the neighbouring "Section addresses are decided before the folder
is shown" and "Live updates respect the split", not these.

What the code does:

- Frame scope: `getRoomsRequestScope` in `packages/shared/utils/rooms.tsx`
  answers the Private list and a private room with the `PrivateRooms`
  search area and no privacy filter; only the Private archive sends
  `privacyFilter=Private`. The unit block "Frame opened in the Private
  section" of `packages/client/src/helpers/__tests__/privateRoomsSectionNavigation.test.ts`
  asserts that scope for the address the SDK manager builds from the root
  path `/private/`.
- Create request: `onCreateRoom` of
  `packages/client/src/store/CreateEditRoomStore.ts` sends
  `private: isPrivateRoom`, a boolean that is false for every type but the
  private one; `withoutSettingsRefusedForAiRooms` does not remove it.
- Address without `?folder=`: `useFiles` in
  `packages/client/src/pages/Home/Hooks/useFiles.ts` sends a room address
  that has no `folder` in its query down the rooms-list branch; with no
  filter in the address it calls `fetchDefaultRooms`, which navigates to
  `getCategoryUrl(categoryType)` without a folder id, and
  `getCategoryUrl` (`packages/client/src/helpers/utils.js`) returns
  `/private/${folderId}/filter` for a private room, so the address becomes
  `/private/undefined/filter`. The route `private/:room/filter`
  (`packages/client/src/routes/client.js`) gives the id as the `room`
  parameter. `getCategoryUrl` does the same for `CategoryType.SharedRoom`.

Read again on 2026-11-21 at `03b13b211c9`; the facts above hold. Also
found then:

- `getCategoryUrl` gives `/forms/${folderId}/filter` for
  `CategoryType.Form`, and a Forms room address without `folder` takes the
  same rooms-list branch, so it becomes `/forms/undefined/filter`.
- The route `private/:room` (no `/filter`) is read as a private room by
  `getCategoryType` (`packages/shared/utils/common.tsx`) and takes the same
  branch; so do `rooms/shared/:room` and `forms/:room`.
- An AI room address without `folder` (`/ai-rooms/{id}/filter`) is not a
  rooms-list category: it takes the files branch, whose
  `FilesFilter.getFilter` falls back to the default folder `@my`. An
  archived Rooms room address (`/rooms/archived/{id}/filter`) is read as the
  Archive list by `getCategoryType`. Both are other defects on other paths
  and stay out of this change.
- `private-rooms-sdk-embedding-and-parity` was archived on 2026-11-20 and
  the main sdk-surface spec no longer carries the sentence about the client
  flag. `private-rooms-editor-contract` and
  `private-rooms-remove-dead-api-calls` are still open. No open change
  modifies the three requirements of this change;
  `private-rooms-beta-release` modifies other requirements of
  sidebar-section.

## Server behaviour

- The create request: `CreateRoomRequestDto.Private`
  (`products/ASC.Files/Server/ApiModels/RequestDto/CreateRoomRequestDto.cs`)
  is a `bool`, false when absent, passed by
  `VirtualRoomsController` to `FileStorageService.CreateRoomAsync`
  (`products/ASC.Files/Core/Core/FileStorageService.cs`), which refuses
  `privacy` true for the AI room types and creates the folder with the
  value otherwise. Sending false and leaving the flag out are the same to
  the server; the spec now says what the client sends.
- The address the server builds for a private room: `PathProvider.GetFolderUrl`
  (`products/ASC.Files/Core/Helpers/PathProvider.cs`) always adds
  `?folder={id}`, so the bare address comes from a typed or edited link,
  not from the server.

## Not changed

- sdk-surface, "SDK private surface honours the opt-in": it ended with "The
  opt-in SHALL be removed together with the client flag at release", while
  feature-gating has no client flag and `PrivateLayout`
  (`packages/sdk/src/app/(private)/layout.tsx`) keeps requiring the host
  opt-in. `private-rooms-sdk-embedding-and-parity` modified this
  requirement without the sentence and was archived on 2026-11-20, so no
  delta here.
- `packages/doceditor/src/utils/actions.ts` points at "Saved encrypted file
  reopens without replaying its changes" and
  `packages/doceditor/src/components/Editor.tsx` at "Editor fails closed
  without the crypto library". Both requirements are in the delta of the
  open change `private-rooms-editor-contract`
  (`specs/private-rooms/editor-integration/spec.md`); the pointers resolve
  once it is archived. No edit here.
- "Legacy desktop path uses editor-provided keys": its scenario says the
  access call is sent at init, while `initDesktop`
  (`packages/doceditor/src/utils/initDesktop.ts`) sends it only when the
  desktop engine asks for sharing keys. The open change
  `private-rooms-remove-dead-api-calls` modifies this requirement (renamed
  "Desktop path uses editor-provided keys", answered when the desktop asks
  for the sharing keys), so its wording is that change's.

## Decisions

1. **The bare room address takes its id from the path.** When a private
   room address has no `folder` in its query, the list load replaces the
   address with `/private/{room}/filter?folder={room}` built from the route
   parameter and the default files filter, the same form the server links
   to, instead of falling back to the rooms list. An address that carries
   other list parameters but no `folder` is not touched. The address without
   `/filter` (`/private/{room}`) takes the same branch and is replaced the
   same way.
2. **Rooms and Forms get the same fix.** The same code path serves
   `/rooms/shared/{id}/filter` and `/forms/{id}/filter`, so task 2.1 fixes
   all three addresses (owner: Rooms on 2026-11-19, Forms on 2026-11-21).
   Neither is a private-rooms capability: the delta specs describe the
   private address only.
3. **"Other room type" gets the test it names.** No test asserts the flag
   of a non-private creation; task 1.1 adds the case, so the scenario has a
   test of its name.
4. **AI and archived room addresses stay out.** They fail on other paths
   (see Context) and need fixes of their own; this change does not touch
   them.

## Gate runs

Recorded by task 3.1.
