# Design

## Context

See proposal.md for the motivation. No stashed design document covers these
decisions: they come from the release-readiness review of 2026-11-19 and from
reading `release/v4.1.0` on the same day. Line numbers below are those of
that reading. The review of the plan on 2026-11-20 re-read the code and
`../server` (44d88bc606, through CodeGraph); what it found is in "Found by
the review of the plan" below, and the decisions are revised to match.

What the code does today:

- `InvitePanel/index.js` picks the room from the open list, else reads it
  with `getFolderInfo`, in a `Promise.all` with the link read, and keeps no
  load state of that read (`selectRoom`, `onClickSend`).
- `verifyInvitees` (`room-member-flows.ts`) passes every invitee id to
  `getRoomCandidateKeys` at once; `useMissingKeyMarks.ts` batches the same
  route by `CANDIDATE_KEYS_BATCH_SIZE = 40`.
- `onClickSend` keeps invitations without an `id` (e-mail) and drops those
  whose `id` is not verified (groups, which `getMembersToRewrap` leaves out);
  with no user among them it neither unlocks nor shows a result and toasts
  Common:UsersInvited.
- `fetchFilesImpl` (`filesStore/fetch.helpers.ts`) calls
  `maybeBackfillEncryptedRoom` only when `data.current.private`, which the
  server sets from the folder's own `SettingsPrivate` (`FolderDto.cs`,
  `result.Private = folder.SettingsPrivate`), so not for a subfolder. The
  room itself is read a few lines later for the navigation path.
- `usePrivateRoomOwnerExclusions.ts` reads `getRoomMembers(count: 100)` and
  one page of 100 administrators; on failure it excludes only the current
  user. The backstop `getNewOwnerKeyRefusal` checks the candidate against the
  room's member keys, so a non-member is reported as "no-key".
- `checkSectionAddress` reads `isPrivateRoomsSectionAvailable`, which is
  false in a frame until `settleFrameOptIn` ran; `fetchRoomsImpl` waits for
  `waitForFrameOptIn`, `fetchFilesImpl` does not.
- `getRoomsRequestScope` (`shared/utils/rooms.tsx`) returns no scope for a
  Rooms category whose `searchArea` is not Active, Archive or PrivateRooms.
- `socket.helpers.ts` raises `selectedFolderStore.foldersCount` before it
  reads the new room and skips it by its privacy scope.
- `AppsStore.handleAppEnabledChange` updates the apps list; only the open
  Rooms list reacts (`refetchRoomsListOnSectionChangeImpl`), not the tree.
- `uploadEncryptedItem` (`chunkUpload.helpers.ts`) keeps the `indexOfFile`
  it was called with across `requireUnlock` and `uploadEncryptedFile`, and
  hands it to `checkChunkUpload` and `failUploadItem`; the plain path's
  finalize looks the row up by its file. `cancelCurrentUploadImpl`
  decrements `currentUploadNumber`, `cancelUploadImpl` resets it to 0, and
  `failUploadItem` decrements it again for the same row when the unlock
  prompt is dismissed after the cancel.
- `willEncryptItemImpl` passes `item.encrypted` as `alreadyEncrypted`; the
  gate in `startSessionFunc` passes `file.encrypted`. `uploadEncryptedItem`
  sets `item.encrypted = true` after the unlock and clears it only on a
  prepare failure. `resolveUploadGate` takes `alreadyEncrypted` among its
  inputs.
- `findPrivateNameClashes` (`start.helpers.ts`) and the auto-lock suspension
  take only the files `willEncryptItem` accepts, which is none while the key
  list is unknown; a failed listing propagates to `handleUploadConflictsImpl`,
  which toasts the raw error and starts nothing.
  `checkUploadNameClashes` (`encrypted-upload-orchestrator.ts`) logs and goes
  on. Both compare `file.name`, the opaque name for a container;
  `prepareReimport` stores the container's bytes under the recovered name
  and DEK.

Found by the review of the plan (2026-11-20):

- The invite panel's loader (`invitePanelIsLoding`, switched off in the
  `finally` of the room and link reads) would cover a failed state, and a
  room already in hand is set by an effect after the first render, so that
  render has no room. A group item names itself in `groupName`, not
  `displayName`, so the refused-invitee mapping
  (`item.displayName || item.email`) yields nothing for it. `showsResult`
  needs an unlocked identity and at least one invited member; without it the
  panel closes, so a list of refused non-users alone never shows its
  reasons.
- After "cancel all", `cancelUploadImpl` replaces each row with a copy, so
  the `item` an encrypted upload holds is detached: its later writes
  (`encrypted`, `skippedMembers`) reach no row. `checkChunkUploadImpl` reads
  `self.files[indexOfFile].uniqueId` unguarded and throws on a gone row.
  `startSessionFuncImpl` (after `isKeyListUnreadable`) and the plain path
  (after `startUploadSession`) hold the same index across an await, and
  `failUploadSession` releases a slot as well. A new drop filters gone rows
  out, so a row can be gone, not only cancelled.
- The retry path (`retryUploadFilesImpl`) never runs the name comparison or
  the auto-lock suspension; `unlockRetriedFiles` filters through
  `willEncryptItem` and so skips the unlock while the key list is unknown.
  `startUploadSession` still receives `file.encrypted`, which nothing outside
  tests sets.
- `EncryptedUploadRefusal` of the orchestrator holds only "no-key" and
  "locked" and stops the whole batch; a per-folder failure does not fit it.
  The client's listing error is thrown inside the `try` of
  `findPrivateNameClashes`, before the rows are in `self.files`.
- "Keep both" renames the `File` itself (`new File([file], renamed)` in the
  SDK, `keepBothPrivateNamesImpl` in the client), while
  `recoverDekForReimport` finds the source file by the UUID in `file.name`.
  A renamed re-import therefore cannot be recovered. The clash dialogs show
  `file.name`, the opaque name of a container.
- `syncEncryptedRoomImpl`, run after an unlock, takes the room id from the
  navigation path but passes `selectedFolderStore.security`, the open
  folder's rights; navigation path entries carry no rights. The `room`
  variable of the navigation build in `fetchFilesImpl` is written by every
  map callback and depends on their order.
- `usePrivateRoomOwnerExclusions` and `getNewOwnerKeyRefusal` are used by
  the SDK's `PrivateChangeOwnerDialog` as well. The edit dialog reuses
  `ChangeRoomOwnerPanel` for the choice and applies the owner later, on save
  (`CreateEditRoomStore`).
- The Templates submenu of Rooms is a Shared-category address with
  `searchArea=Templates` (Forms and AI agents alike); `getRoomsRequestScope`
  leaves those unscoped on purpose, and `rooms.privacyScope.test.ts` asserts
  it. No product link produces `searchArea=Any`. The SDK calls the same
  function.
- `wsModifyFolderCreateImpl` raises the count before three early returns,
  one of which, the user's own new room, never reaches the scope check and
  must still count. `refetchRoomsListOnSectionChangeImpl` returns early
  unless Rooms or the archive is open.
- `private-rooms-release-gate` task 5.2 redefines
  `AppsStore.isPrivateRoomsSectionAvailable`, which decisions 6 and 9 rely
  on.

Server facts, read through CodeGraph in `../server`:

- `GET privacyroom/{roomId}/access/candidates` takes the users as a repeated
  query parameter `userIds` (`GetRoomCandidateKeysRequestDto`, `[FromQuery]`
  `List<Guid> UserIds`; `PrivacyRoomController.GetRoomCandidateKeys`). The
  portal's nginx sets `large_client_header_buffers 4 8k`
  (`../buildtools/config/nginx/onlyoffice.conf`, line 193), so a request
  line of more than about 180 GUIDs (45 characters each) is refused before
  it reaches the server.
- `FileSharing.SetAceObjectAsync` (`products/ASC.Files/Core/Utils/
  FileSharing.cs`) refuses a link with access on a private room, calls
  `EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync` for each non-link
  subject of a private room, and saves each subject with
  `fileSecurity.ShareAsync` inside the loop, so the subjects before the first
  refused one stay saved.
- `PrivacyRoomController.GetUserKeysForRoom` returns keys of members only and
  skips members without a public key, so it cannot tell a non-member from a
  member without a key: `EncryptionKeyPairHelper.GetKeyPairForRoomAsync`
  takes the room's shares without groups (`GetSharedInfoAsync`) and drops
  each one whose `GetKeysAsync` is empty.
- `FileSecurity` (`products/ASC.Files/Core/Core/Security/FileSecurity.cs`)
  maps `SearchArea.Active` to `RoomPrivacyFilter.NotPrivate` and
  `SearchArea.PrivateRooms` to `Private`, and passes the requested privacy
  filter through for every other area, `Any` included.
- `FoldersController.GetRootFoldersIdsAsync` yields the Private root only
  while `IsPrivateRoomsAppEnabledAsync` (the app setting of the tenant) is
  true; `GET files/@private` answers not found while it is off.
- For finding 6 (Share tab of a folder in a private room, out of scope):
  `FileSecurity` refuses `EditAccess` for a folder that is not a room inside
  a private room, before the full-access check, so
  `FileSharingHelper.CanSetAccessAsync` is false and `FileEntryDto.CanShare`
  is false; the client's `canShare` condition in
  `helpers/info-panel/tabs.ts` already hides the tab.

## Goals / Non-Goals

**Goals:**

- Each fix lands where the behaviour is owned, so the SDK takes the shared
  ones (key check, upload gate, name comparison, re-import) without a copy.
- No new request to the server beyond reading lists the client already reads.

**Non-Goals:**

- A client rule for the Share tab of a subfolder (proposal, Out of scope).
- Any change to what the server checks.

## Decisions

### 1. The invite panel has an explicit "room unknown" state

The panel keeps a load state of the room: loading, loaded, failed. Until it
is loaded the body shows the loader; on failure it shows
Common:InviteRoomLoadFailed and the close action only; the panel's existing
loader does not cover the failed state. `onClickSend` returns without a
request while the room is not loaded. The link read is started only after
the room is known and only for a room that is not private. The panel opened
for an AI project or from the list, where the room is already in hand, takes
it as the initial value of the state, so not even its first render is
without a room.

### 2. One batch size for the candidate keys route

`CANDIDATE_KEYS_BATCH_SIZE` moves next to `getRoomCandidateKeys` in
`packages/shared/api/privacy` and both callers use it. `verifyInvitees` asks
in sequence, merges the answers, and lets the first failure propagate, so the
panel's existing error path (no invitation sent) is kept.

### 3. Non-user items are refused on the client, before the unlock

Before the unlock, `onClickSend` splits the list of a private invitation into
users and the rest. The rest is never sent and joins the refused invitees of
the result as `{ noKey: false }`, named by `displayName`, `groupName` or
`email`, which `notInvitedReasons` and `InviteResult` already render with
Common:EncryptedInviteFailed. Whether the result is shown no longer depends
on an unlock: a private invitation with refused items shows them, so when no
user is left, the form stays with the reasons, as "An invitation that
invited nobody keeps the invite form" describes, and nothing is unlocked.
The guard does not rely on the server's refusal of a group.

### 4. The backfill is decided after the navigation path

The call moves after the navigation path is built, where the room of
`pathParts[1]` has been read (or is `data.current` at the room root). The
gate becomes "the room is private", and the rights passed are the room's
`security`, not the subfolder's. The room is taken from the read made for
`pathParts[1]` (or `data.current` at the root), not from the shared `room`
variable of the map callbacks. `syncEncryptedRoomImpl`, after an unlock,
passes the room's rights as well: the open folder's when it is the room,
otherwise those of a read of the room. `_backfilledEncryptedRooms` keeps it
to one sweep per room and page session.

### 5. Owner candidates are read page by page and fail closed

The hook pages `getRoomMembers` and the administrators list until each
`total` is reached, and on any failure sets an error state instead of
ready. The client panel and the SDK's `PrivateChangeOwnerDialog` render
Common:OwnerCandidatesLoadFailed for that state. The shared
`getNewOwnerKeyRefusal`, which the client panel (also inside the edit
dialog) and the SDK dialog call when a candidate is chosen, reads the
room's members (paged) before the key check and answers "not-member", shown
as Common:EncryptedChangeOwnerNotMember; the key refusal keeps its own texts
for members. The edit dialog applies the owner later, on save; the check at
the choice is kept as the only one (owner, 2026-11-20).

### 6. Frame addresses wait for the opt-in

`checkSectionAddress` awaits `appsStore.waitForFrameOptIn` before it builds
its decision, as `fetchRoomsImpl` does; outside a frame it resolves at once.
The superseded-load check after the wait stays as it is.

### 7. An unknown search area of a Rooms address is non-private

`getRoomsRequestScope` returns the non-private filter for a Rooms category
whose search area is `Any` or a value the client does not know, instead of
no scope (owner, 2026-11-20). Templates, Forms, AI agents and the AI hub
keep no scope, as their existing test asserts. Active keeps no filter,
since the server maps it to non-private itself.

### 8. Counts follow insertion

`socket.helpers.ts` raises `foldersCount` for a room only when the room is
not dropped by the privacy scope: the user's own new room, which returns
before the scope check, still counts, and so do other folders. The
existing re-read of the counts after the events settle stays.

### 9. The tree is read again on an app switch

`FilesStore` already reacts to `isPrivateRoomsSectionAvailable` for the
Rooms list; the same reaction calls `treeFoldersStore.fetchTreeFolders()`
before `refetchRoomsListOnSectionChangeImpl`, whose early return would
otherwise skip it outside Rooms. Outside a frame the section follows the
app, so this covers the switch. The reaction also fires once at start-up,
when the apps list loads, which costs one extra tree read.

### 10. Upload results find their row by id

`uploadEncryptedItem`, `startSessionFuncImpl` and the plain path keep the
row's `uniqueId` and look the row up by it after every await
(`self.files.findIndex(f => f.uniqueId === uniqueId)`); every write goes to
the row found, never to the item held from before the await. A row that is
gone or cancelled takes no result: the lookup comes before
`checkChunkUpload`, and `failUploadItem` and `failUploadSession` take the
`uniqueId`, neither release a slot nor start the next file for such a row,
because the cancel already released it.

### 11. The upload gate decides from the content

`alreadyEncrypted` is dropped from `UploadGateParams`: for a private target
with a key the gate answers `encrypt`, and the encrypt path sniffs the
container and re-imports it (`prepareReimport`), which parses the header and
recovers the key or fails with Common:EncryptionReimportFailed. With one
input set, `willEncryptItemImpl` and the gate cannot disagree; `item.encrypted`
stays a display flag of the row. The `isEncrypted` the plain path reads from
`file.encrypted` for `startUploadSession` goes too, since nothing sets it.

### 12. The name comparison runs on a known key list

`findPrivateNameClashes` reads the key list again through
`isKeyListUnreadable` when it is unknown, before it filters the files; on a
failed read the private files fail with Common:EncryptionKeysLoadFailed as
the gate would fail them. The read caches the list, and the later filters
see it because `handleUploadConflicts` runs before `startUploadFiles`; the
auto-lock suspension needs no read of its own. `unlockRetriedFiles` reads an
unknown list again the same way. A failed listing fails the files of that
folder with Common:EncryptedNameCheckFailed: in the client,
`findPrivateNameClashes` catches per folder and returns those files, whose
rows get the error while the other files (the plain ones included) go on;
in the SDK, `checkUploadNameClashes` marks them with a typed per-file error
(owner, 2026-11-20), which `getEncryptedUploadErrorMessage` maps and the
upload loop skips, instead of `continue`. The batch refusal ("no-key",
"locked") stays as it is.

### 13. A container is compared and stored under its original name

For an item whose content is a container, the comparison takes the name
recovered by `recoverDekForReimport` (the DEK is wiped right after); an item
whose name cannot be recovered fails with Common:EncryptionReimportFailed
there, and the clash dialogs of the client and the SDK show the recovered
name. "Keep both" no longer renames the `File` of a container, whose name
carries the UUID the recovery needs: the chosen name travels beside the
file and replaces the recovered name after the recovery (owner,
2026-11-20). With
decision 1 of the proposal (owner, 2026-11-19), the re-import decrypts the
container with the recovered key, streaming through the chunk
authentication, and hands the clear bytes and the recovered (or suffixed)
name to `prepareEncryptedUpload`, so it gets a new DEK, nonce and opaque
name and is written in the current container version; the recovered DEK is
wiped on every exit. `prepareEncryptedUpload` sniffs the clear bytes for a
PDF form as for any upload. "Keep both" then applies to a re-import like to
any file.

Alternatives considered for 13:

- Keep the container's bytes and state the exception in encryption-core. A
  suffixed name would need a new header; for a version-2 container that is
  possible (the name is encrypted under a random IV), but it breaks once
  `private-rooms-dse3-header-authentication` binds the header into the
  chunks. A clash could then only be cancelled.
- Compare under the opaque name, as today. Rejected: the comparison never
  finds the clash it exists for.

## Risks / Trade-offs

- The batched key check of a very large invitation takes several requests.
  → Sequential batches of 40, the same size the marks already send per page.
- Paging all administrators on a large portal takes several requests when
  the owner panel opens. → Pages of 100; the panel shows its loader until
  done, as it does today for the one page.
- Re-encrypting a re-import costs one decryption and one encryption in
  memory. → The main spec already buffers whole files in memory ("Whole files
  are buffered in memory").
- Two recoveries per container (comparison, then upload), each searching
  the room and unwrapping a candidate. → A re-import is a rare, manual
  action; the second recovery could reuse the first later if it matters.
- A frame that never receives its configuration waits for it. → `AppsStore`
  settles the opt-in as false after `FRAME_CONFIG_TIMEOUT`, so the wait
  ends and the address is decided as for a frame without the opt-in.

## Gate runs

2026-11-20, task 10.2, on `release/v4.1.0` at 8fbd8449351:

- Client E2E under Docker (`tests-dev`, image rebuilt after the ui-kit
  update db506ac7587): `private-room-*.spec.ts`,
  `private-rooms-app-off.spec.ts` and `private-rooms-section.spec.ts`,
  172 passed.
- SDK private E2E (`__tests__/e2e/private`) on a fresh `pnpm run
  test:build`: 47 passed, 11 skipped. The build exits 1 on the Next.js
  vulnerability check after all pages are generated, the known state
  recorded for the previous change.
- Pre-push gate: `npm --prefix ./common/tests run test:lefthook` exit 0;
  `nx run-many -t tsc lint test` over the six packages exit 0 (21 tasks).
- `npx -y @fission-ai/openspec@1.17.0 validate --all --strict`: 25 of 25.

2026-11-20, after the review fixes (380cd4a5281, 3155e0db4a8), at
3155e0db4a8: the same runs again. Client E2E under Docker: 172 passed.
SDK private E2E on a fresh build: 47 passed, 11 skipped. The lefthook
checks and `nx run-many -t tsc lint test` over the six packages exit 0;
`openspec validate --all --strict`: 25 of 25.
