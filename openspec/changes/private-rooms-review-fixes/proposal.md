# Proposal

## Why

The review of the four changes archived on 2026-10-22 (`private-rooms-cross-room-copy`, `private-rooms-list-item-privacy`, `private-rooms-upload-hardening` and group 8 of `private-rooms-sidebar-section`), made on 2026-10-23, found no blocker: every requirement of their deltas is enforced by the code on the branch. It did find places where the code, its tests and the archived designs do not say the same thing, and a few small behaviours worth fixing while the changes are fresh:

- **Copy dialog destination room.** The room of the picked folder is taken from the breadcrumb flagged as a room, but ui-kit flags the section root (Rooms, Archive) that way, never the room. In a real Copy dialog the destination room id is the section id, so every picker copy plans as a copy into another room, a same-room copy included. The result stays right, because the copy resolves the room again from the destination's path before decrypting anything. But the plan is wrong, the unit test named "Subfolder of another private room" builds crumbs ui-kit never produces, and no E2E picks a subfolder as destination.
- **Superseded folder load.** A load that finds itself superseded commits no folder state, but its final step still marks loading as finished and may set the highlighted file while the newer load is in flight.
- **Section drop.** The target of a drop on the section is fixed at the native drop event, but whether the open folder takes uploads at all is read after the browser has read the dropped directories, from whatever folder is open by then.
- **Same-room copy suffix.** A same-room copy always takes "(1)"; when "(1)" already exists the clash check asks and offers "(1) (1)" instead of "(2)".
- **Fail-closed gate bypassed by the copy.** The re-encrypting copy forces the custom room type on its upload target, so the gate that refuses a private target of another room type can never fire for a copy.
- **Tests owed by the specs.** "Destination member without a key" has no test carrying its name; the row click of a private room in a list reads a field that list items gained only with `private-rooms-list-item-privacy` and has no test from a list item; "Frame showing the menu" is tested with props the sidebar never reads.
- **Records.** Two archived designs describe code that differs from the branch (cross-room-copy D1 on the picker crumbs, upload-hardening D4 on the row-drop snapshot), one scenario names an address form the code does not produce, four comments restate requirements, and the clash check loads member keys even when every name is cached.

## What Changes

- The Copy dialog takes the destination room from the breadcrumb that carries a room type, so a same-room copy plans as one; the unit test uses the crumbs ui-kit builds, and the E2E suite copies into a subfolder of another private room.
- A superseded folder load leaves the loading state and the highlighted file to the newer load.
- A drop on the section keeps, together with its target, whether that folder takes uploads.
- A same-room copy takes the first copy suffix that no file of the destination carries, with no clash prompt.
- The re-encrypting copy passes the destination's room type through, so a private destination of another room type is refused as an upload with such a target is.
- The missing named tests are added, the frame-menu scenario is tested where the frame decision is made, the comments that restate requirements become `Spec:` pointers, and the clash check skips the member-keys request when every name is cached.
- The scenario "Row link of the Rooms list" names the address form the code produces, `/private/{roomId}/filter?folder={roomId}`.
- design.md records what the archived designs got wrong and what the branch does.

Out of scope:
- a contract test for the server-contract scenario "Move into another private room": the client sends no request for such a move, so no mock path would exercise it; the scenario rests on the source reading recorded in the cross-room-copy design (`CopyPermissionsCheck.CompliesPrivateRoomRulesAsync`);
- stripping the redundant `folder` query from a corrected Rooms row link (design D7);
- the other open changes; the task order of `private-rooms-ux-gaps` is fixed in its own planning commit.

Decisions that need a human: none. The alternatives considered are recorded in design.md.

Server dependency: none. No server fact beyond those already cited in the archived designs is relied on.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`:
  - "Upload target is fixed when the user starts the upload" also fixes whether the folder takes uploads, with the scenario "Folder without the upload right opened during the directory read";
  - "Copy within the same private room" takes the first free suffix, with the scenario "Copy of a name that already has a copy";
  - "Queued private uploads are sent only as ciphertext" gains the scenario "Copy into a private room with another room type".
- `private-rooms/sidebar-section`:
  - "Section addresses are decided before the folder is shown" gains the scenario "Superseded load";
  - "Private rooms open inside the section": the scenario "Row link of the Rooms list" names the address with its query.

## Impact

- Client: `packages/client/src/components/FilesSelector/utils.ts`, `packages/client/src/store/filesActionsStore/copyMove.helpers.ts`, `packages/client/src/pages/Home/Hooks/useSectionDrop.ts`, `packages/client/src/store/filesStore/fetch.helpers.ts`; comments in `FilesSelector/index.tsx`, `copyMove.helpers.ts`, `fetch.helpers.ts` and `uploadDataStore/start.helpers.ts`.
- Shared: `packages/shared/services/private-room/encrypted-name-clash.ts`.
- Tests: unit tests next to each touched module, a component test of the frame decision in `Client.jsx`, `packages/client/__tests__/private-room-cross-room-copy.spec.ts`; the MSW second private room (`packages/shared/__mocks__/handlers/files/privateRoomList.ts`, `encryptedFiles.ts`) gains a subfolder with its path.
- No locale, server, SDK or doceditor change.
