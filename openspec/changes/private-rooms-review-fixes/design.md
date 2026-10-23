# Design

## Context

Findings of the 2026-10-23 review of the four changes archived on 2026-10-22, each confirmed in the code (see proposal.md for why they matter):

- `getPickedRoomId` (`packages/client/src/components/FilesSelector/utils.ts:201`) returns the id of the first breadcrumb with `isRoom`. ui-kit's `useFilesHelper` (`@onlyoffice/apps-ui-kit`, `dist/esm/selectors/Files/hooks/useFilesHelper/index.js:183-188`) sets `isRoom` on the crumb whose id is the rooms folder, or on the first crumb when the next one has a room type, that is on the section root; the loop that would flag the room crumb is commented out (`:192-194`). Every crumb carries its own `roomType` (`:188`), so the room crumb is the one with `roomType !== undefined`. For a move, `pinnedRootId` splices the root crumb away and the `?? privateRoomId` fallback yields `same-room`, so moves are unaffected.
- `fetchFiles` (`packages/client/src/store/filesStore/fetch.helpers.ts:287`) returns on `isSuperseded` without setting `isAddressCorrected`; the `.finally` at `:790` therefore runs `setIsLoadedFetchFiles(true)`, clears both section-loading flags and may call `setHighlightFile`. The `axios.isCancel` branch (`:736`) rethrows into the same `finally`.
- `useSectionDrop` (`packages/client/src/pages/Home/Hooks/useSectionDrop.ts:85`) reads `canUpload` in `onDrop`. The value is computed in `pages/Home/index.js:403-410` from the contacts and profile pages and the open folder's `Create` right, so it describes the folder open after the directory read, while the target comes from the snapshot taken in `onDropCapture`.
- `copyEncryptedFilesToFolderImpl` (`packages/client/src/store/filesActionsStore/copyMove.helpers.ts:393`) names a same-room copy `addCopySuffix(name)`, always "(1)". The upload's clash check (`uploadDataStore/start.helpers.ts:347`, `resolveNameClashes` in `packages/shared/services/private-room/encrypted-name-clash.ts`) then finds "(1)" taken when such a file exists and offers "(1) (1)". The same function (`:365-369`) forces `RoomsType.CustomRoom` on every private target, so the refusal of another room type in `resolveUploadGate` (`encrypted-upload.ts`) never runs for a copy.
- `navigation.helpers.ts:239-241` and `:632-633` read `item.private === true` on a list item. List items carry `private` since `fa735fb16cd` (`private-rooms-list-item-privacy` 1.1); `FilesActionsStore.open.test.ts` has no case built from a list item.
- `ClientArticleSidebar.test.tsx` "Frame showing the menu" passes `isFrame` and `frameConfig.showMenu`, which `ClientArticleSidebar/index.tsx` never reads. The frame decision is `Client.jsx:183`: the article renders when `!isFrame || showMenu`, with `isFrame` a getter of `SettingsStore` over `frameConfig` (`packages/shared/store/SettingsStore.ts:1716`) and `showMenu` from `frameConfig.showMenu` (`Client.jsx:256`). No E2E spec drives frame mode.
- `listDecryptedFileNames` (`encrypted-name-clash.ts:76-83`) hands every encrypted file to `recoverEncryptedFilenames`, which loads the room member keys before it skips cached ids, so a folder whose names are all cached still costs one member-keys request per upload.
- Comments that restate requirements: `FilesSelector/index.tsx:334-335`, `copyMove.helpers.ts:250` and `:686`, `fetch.helpers.ts:970-971`. The pointer at `start.helpers.ts:236` reads `Spec: encryption-core, ...` while every other pointer uses the `private-rooms/<capability>` form.

No stashed design document covers these points. No server fact beyond those cited in the archived designs is relied on; the only server statement touched, "Move into another private room", keeps the citation of `CopyPermissionsCheck.CompliesPrivateRoomRulesAsync` (`products/ASC.Files/Core/Services/WCFService/FileOperations/CopyPermissionsCheck.cs:816-838`) made in the cross-room-copy design and read again in the source on 2026-10-23.

## Corrections to archived designs

Archived change folders are not edited; what the branch does is recorded here.

- `private-rooms-cross-room-copy` D1 says the Copy dialog supplies "the room crumb of the picker's breadcrumbs (isRoom)". ui-kit flags the section root, not the room (Context). After this change the crumb is picked by its room type (D1 below).
- `private-rooms-upload-hardening` D4 says case (b) of `resolveDropTarget` applies "only when `row.parentId` equals the snapshot's folder". The code (`uploadDataStore/target.helpers.ts:136-141`, commit `d459bbc2422`) also trusts the snapshot for rows outside the Rooms and Archive sections, where no private room can be involved and the early snapshot already fixes the folder; AI-agent knowledge folders are such rows. That exception stands and is now written down.
- `private-rooms-sidebar-section` task 8.2 and D5 place the loaded-folder check in `isPrivateRoomsSection` (`pages/Home/index.js`); the code put it in `getQuickActionsSection` (`helpers/quickActions.ts`) and left the flag route-only. The outcome is the same, since the flag has no other consumer; the placement stands.
- `private-rooms-sidebar-section` scenario "Row link of the Rooms list" says the address becomes `/private/{roomId}/filter`; `getPrivateAddressOfRoomsAddress` (`helpers/privateRoomsSection.ts:84`) keeps the query, and the E2E asserts `/private/{roomId}/filter?folder={roomId}`. The delta aligns the scenario (D7).

## Goals / Non-Goals

**Goals:**
- Every plan, test and design statement about the reviewed changes describes what the branch does.
- The small behaviours found (loading state, drop right, copy suffix, copy gate) fail closed or follow the neighbouring rules.

**Non-Goals:**
- New mock handlers or contract tests for transfers the client never requests.
- Changing the picker's root entries (ui-kit) or the section's address forms.

## Decisions

**D1. Pick the room crumb by room type.** `getPickedRoomId` returns the id of the first crumb with `roomType !== undefined`. Alternative: ask ui-kit to flag the room crumb with `isRoom`. Rejected: a ui-kit release for a one-line consumer fix, and the picker itself reads `isRoom` on the root. The unit test builds crumbs as ui-kit does: `isRoom` on the root, `roomType` on the room, neither on folders. The E2E copies into a subfolder of the second private room, whose MSW handler gains a folder and a path through it.

**D2. A superseded load stays out of the loading state.** `fetchFiles` sets a flag with the role of `isAddressCorrected` on the `isSuperseded` return, and on the `isCancel` branch when a newer fetch owns the controller (`controller !== self.filesController`); `finally` returns on it. An abort without a successor keeps ending the loading. Alternative: let only the newer fetch's `finally` clear the flags, which it does already; the defect is the stale fetch's extra write, so the stale fetch is the one to silence.

**D3. The drop right is captured with the target.** `useSectionDrop` reads `canUpload` in `onDropCapture` into the same snapshot as the target, and `onDrop` uses the snapshot's value. Alternative: derive the right from the snapshot target's folder with a security lookup. Rejected: the page already computes the right for the open folder at that moment; capturing it is one field.

**D4. The same-room copy takes the first free suffix.** `copyEncryptedFilesToFolderImpl` lists the destination's decrypted names once (`listDecryptedFileNames`, as the upload clash check does) and names each same-room copy through `resolveNameClashes`, so "(2)" follows "(1)" and the later clash check finds nothing to ask. Alternative: exempt copy-tagged items from the clash check. Rejected: the check is what guarantees the name is free. Cost: the clash check lists the destination again; after D8 that second listing is served from the filename cache the first one filled.

**D5. The copy passes the destination's room type through.** `destContext.roomType` is the type the path lookup returned, with no default for a private target; `resolveUploadGate` then refuses a non-custom type with `Common:EncryptionPrepareFailed`, as for an upload. Alternative: keep forcing `CustomRoom`. Rejected: it normalises an inconsistent path DTO instead of refusing it, against upload-hardening D5.

**D6. Tests sit where the scenario lives.**
- "Destination member without a key": in the upload store tests, a copy-tagged file for a room whose roster has a member without stored keys yields one encrypted session, wraps for the members with keys only, and the skipped-member report of an upload.
- "Room clicked in the section" from a list item: in `FilesActionsStore.open.test.ts`, with the room built by `buildFilesListItems` through `src/store/filesStore/__tests__/listItem.fixture.ts`. A hand-built room with `private: true` passes on the old code; the fixture is what makes the case catch a regression of the item shape.
- "Frame showing the menu": a component test of `Client.jsx` with `isFrame` and `frameConfig.showMenu` true renders the article, and with `showMenu` false does not; the sidebar case drops the frame props and takes a name that says what it asserts.

**D7. The row-link scenario follows the code.** The corrected address keeps the `folder` query. Alternative: strip `folder` when the path already carries the id. Rejected for now: cosmetic, and every other corrected list link keeps its query ("Archived room link").

**D8. The clash check skips cached names.** `listDecryptedFileNames` passes only the files without a cached name to `recoverEncryptedFilenames`, so a folder whose names are all cached costs no member-keys request. No behaviour change.

**D9. Comments.** The four restating comments become one-line `Spec:` pointers; the pointer in `start.helpers.ts` takes the `private-rooms/encryption-core` form.

## Risks / Trade-offs

- [Returning from `finally` on a cancelled fetch could leave the loading stuck] → limited to a cancel whose controller has been replaced by a newer fetch; a unit case for a cancel without a successor asserts the loading still ends.
- [Picking the room crumb by room type depends on ui-kit putting `roomType` on crumbs] → it does today (`useFilesHelper:188`); the unit test fixes that shape and the E2E subfolder case fails if ui-kit changes it.
- [Two listings per same-room copy] → the second reads the cache the first filled; no extra member-keys request after D8.

## Migration Plan

Client-only, behind the `privateRooms` flag. Rollback is a revert.
