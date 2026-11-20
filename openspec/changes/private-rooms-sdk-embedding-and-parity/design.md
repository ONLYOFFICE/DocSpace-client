# Design

## Context

See proposal.md for the motivation. Read on 2026-11-19 on `release/v4.1.0`
(`54bed4b404d`), in `docspace-sdk-js` (read only, every branch), in
`../buildtools` and, through CodeGraph, in `../server`. Read again on
2026-11-20 (`a26a2ae6aa5`), after `private-rooms-withheld-actions-gaps` and
`private-rooms-invite-and-upload-robustness` were archived; the facts below
are as of that reading.

### Embedding today

- **The host library.** `docspace-sdk-js` is at 2.2.0 on `develop`,
  `master`, `release/v4.0.0` and `docs` (2.3.0 on
  `feature/media-viewer-mode`); no branch has `privateRooms`. `TFrameConfig`
  (`src/types/index.ts`) does not declare it, `getFramePath`
  (`src/utils/index.ts`) has no case that builds `/sdk/private`, and
  `navigateSection` (`src/instance/index.ts`) rejects every mode but Forms
  and Personal, so the SDK's handler for the `rooms` and `archive` sections
  (`(private)/_hooks/usePrivateFrameBridge.ts`) has no caller in the
  library. The library sends the whole configuration object to the frame
  as JSON (`setConfig`, `#sendMessage`), so a property it does not declare
  still reaches the frame; the client reads `privateRooms` from it
  (`AppsStore.framePrivateRoomsOptIn`). The iframe is created with
  `allow="storage-access *"` and no other permission.
- **The SDK's own headers.** `packages/sdk/src/proxy.ts` sets, for
  `/private*` only: `frame-ancestors 'self'`, `connect-src 'self' https:`
  in production (`'self' ws: wss: http: https:` in development),
  `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'` (plus
  `'unsafe-eval'` in development), `Cross-Origin-Opener-Policy` and
  `Cross-Origin-Resource-Policy: same-origin`, HSTS in production,
  `nosniff`, a referrer and a permissions policy. No other SDK route sets a
  policy of its own. `proxy.test.ts` covers the matcher, `/chat`,
  `/ai-arbiter` and `/ai-agents`, not `/private`.
- **The portal's policy.** The nginx configuration of `../buildtools`
  (`config/nginx/onlyoffice.conf`, block `BEGIN_CSP_LUA`) adds a
  `Content-Security-Policy` to every HTML GET outside `/api/`, `ds-vpath`
  and `/static/html-frame/`, `/sdk` included. It reads the header from
  Redis key `csp:<host>` or from `GET api/2.0/security/csp`. On the server,
  `SecurityController.GetCspSettings` (`web/ASC.Web.Api/Api/SecurityController.cs`,
  anonymous) returns the stored `domains` and the `header`, built by
  `CspSettingsHelper.CreateHeaderAsync`
  (`products/ASC.Files/Core/Helpers/CspSettingsHelper.cs`): every trusted
  domain becomes a frame source and a framing source (`AllowFraming`, i.e.
  `frame-ancestors`), and the storage's internal URL and CDN domain become
  connection sources when the store is S3. `SecurityController.ConfigureCsp`
  (`POST api/2.0/security/csp`) stores the list. So a private page reaches
  the browser with two policies, the portal's and the SDK's, and the
  browser applies both: a frame needs both to allow it, and `'self'` in
  the SDK's decides.
- **Design history.** The stashed design documents (stash "docs" of
  `feature/e2e-rooms`: `docs/encryption/SDK_PRIVATE_PLAN.md` §1.1 and
  `packages/shared/services/encryption/SECURITY.md` §10) scope the private
  route group to the portal's own pages: no third-party embedding,
  `frame-ancestors 'self'` as a deliberate limit, `connect-src 'self'`
  without a wildcard. §10 accepts `'unsafe-inline'` for scripts on that
  ground and lists nonces or worker isolation as the precondition of any
  third-party embedding. The code still matches the framing limit. It no
  longer matches `connect-src`: `7ed38a24255` (2026-06-11) added `https:`
  so that encrypted files can be fetched from S3 or CloudFront, relying on
  the portal's policy to narrow it. The fixme E2E
  `packages/sdk/__tests__/e2e/private/private-security.spec.ts`
  ("csp-headers") was written from the plan and still expects
  `connect-src 'self'`.
- **Since then** the client lists private rooms in its own Private section
  (`private-rooms/sidebar-section`), so no portal page frames
  `/sdk/private` any more.

### Parity findings, confirmed in the code

- **Owner change.** `(private)/_hooks/usePrivateOwnerChangeFlow.ts` calls
  `api.files.setFileOwner` directly. The client
  (`packages/client/src/store/filesActionsStore/rooms.helpers.ts`,
  `changeRoomOwnerImpl`) unlocks, calls `prepareNewOwner`
  (`packages/shared/services/private-room/room-member-flows.ts`), and on a
  409 reads the missing keys and counts them. Server:
  `SecurityController.ChangeFileOwner`
  (`products/ASC.Files/Server/Api/SecurityController.cs`, `POST
  api/2.0/files/owner`) calls `FileStorageService.ChangeOwnerAsync` with
  `demandFileKeys: true`; for a private room whose creator is not the
  candidate it throws `CustomHttpException(HttpStatusCode.Conflict, ...)`
  when `DocSpaceHelper.GetEncryptedFilesWithoutKeyAsync` finds files
  without the candidate's key (`products/ASC.Files/Core/Core/FileStorageService.cs`).
  `PrivacyRoomController.GetRoomMissingFileKeys` (`GET
  api/2.0/privacyroom/{roomId}/access/missing`) lists them. The 409 comes
  only for a private room, with `demandFileKeys`, a candidate who is not the
  room's creator and at least one encrypted file of the room's tree without
  the candidate's key; a candidate with no key at all gets 403 before that
  (`ThrowIfKeysAreNotSetAsync`). The missing-keys route takes repeated
  `userIds`, answers only to those who may change the room's access (owner,
  managers; 403 otherwise, archived rooms included), 400 for a room that is
  not private and 404 for an unknown one; the E2E mock answers it the same
  way. Since `private-rooms-invite-and-upload-robustness`,
  `PrivateChangeOwnerDialog` refuses a candidate who is not a member or
  holds no verified key through the shared `getNewOwnerKeyRefusal` before it
  calls the hook, and `usePrivateRoomOwnerExclusions` fails closed
  (`excludeFailed`): the hook lacks only the unlock, the wrap and the 409
  path. The client's 409 count is private to `rooms.helpers.ts` (`statusOf`
  and the count after it).
- **Info panel menu of an open room.** `(private)/private/[roomId]/page.client.tsx`
  provides `RoomActionsOverrideContext` but no `RoomActionsContext`.
  `RoomActionsMenu` (`(rooms)/_components/room-actions-menu`) passes the
  callbacks of `RoomActionsContext` to `useRoomContextMenuModel`, whose
  edit, invite and change-owner entries call those callbacks and nothing
  else; only leave consults the override. On the private list page
  `RoomsLayout` provides the context, so the list works. In the open room
  archive, delete and info are just as empty, and `isArchive` is not
  passed. `useRoomActions` (`(rooms)/_hooks/useRoomActions.ts`) already
  sends edit, invite and change owner to the override, and the generic info
  panel (`(docspace)/_components/info-panel/Body.tsx`) builds a fallback
  `RoomActionsContext` from it when none sits above.
- **Quota warning.** `(rooms)/_components/quota-warning-dialog` asks
  `useTranslation(["Payments", "Common"])` and renders nine keys of the
  client's `Payments` namespace and `MainBar:ContactToUpgradeTariff`
  (all in `packages/client/public/locales/<lng>/`). The SDK registers only
  the root `public/locales/<lng>/Common.json`
  (`packages/sdk/src/utils/translationLoaders.ts`). The private list opens
  this dialog through `RoomsLayout.createCustomRoom`. A scan of
  `(private)`, `(rooms)`, `(docspace)` and `(personal-files)` finds no other
  key outside Common (806 keys, 43 of them unprefixed); the dialog's
  `ns="Payments"` is the only namespace attribute other than Common.
  `(private)/translations.test.ts` scans `(private)` only and does not read
  `ns`. The client renders the same ten keys in `InviteQuotaWarningDialog`
  (`index.js`, `sub-components/RoomsContent.tsx`, `UsersContent.tsx`) and
  `ContactToUpgradeTariff` in `MainBar/QuotasBar.js`; ui-kit and no test
  name them. All ten are translated in all 31 languages. `FullEnDublicatesTest`
  (`common/tests/test/locales.test.js`) fails when two English namespaces
  hold the same key with the same value, so a copy under the same name
  cannot stand next to the original.
- **Create during the key-list load.** `EncryptionIdentityStore.loadKeys`
  returns at once while a load runs (`if (this.isLoading) return;`);
  `resolveEncryptionKeys` of `PrivateCreateRoomDialog` then sees no list
  (`keys === null`, "unknown", which the dialog turns into
  Common:EncryptionKeysLoadFailed) or decides on the list known before the
  load. Its other callers are `EncryptionShell`, `usePrivateRoomsPageInit`
  and the dialog's `refreshKeysFromServer`, which runs after a key was
  generated.
- **Upload panel.** On a cancelled name-clash dialog the orchestrator
  returns every file as aborted, and so it does when the identity is locked
  during the batch (`AbortOnLockEffect` calls
  `abortAllCryptoOperations("lock")`, which aborts the hook's signal); the
  hook marks them `cancelled` (`useEncryptedUpload`), as it does after
  "Cancel all". A lock before the batch is the gate's refusal
  (`refused: "locked"`), which already fails the rows with
  Common:EncryptionLockedUpload. `file-row.tsx` knows only
  uploaded, error and the rest, so a cancelled row shows its percentage and
  a cancel button. `UploadStore.uploaded` is true once nothing is
  uploading, so the upload button reports "completed". `startBatch`
  replaces `batchAbortController`, so `cancelBatch` aborts only the newest
  batch, and `dropPending` then removes the rows of the older one while its
  files keep uploading; `resetItemForRetry` links a retried row to the
  newest batch's controller. The store is provided by the private,
  personal-files, rooms and AI agents layouts.
- **Leave after an owner change.** `PrivateChangeOwnerDialog` awaits
  `leaveRoom` in the same `try` as the transfer; a 403 falls into the
  `catch`, which toasts `error.message` and leaves the dialog open, after
  the transfer took place. The client (`rooms.helpers.ts`, case "Leave
  after an owner change refused") shows the refusal alone and stays on the
  room.
- **Members search.** `PrivateMembersView` renders the raw page of members
  while a search text is set and the sections of `classifyMembers`
  otherwise; only the sections drop guests and disabled members who are not
  the owner. The request already asks for users only, so groups are not in
  either list. While searching, `members.length === 0` decides the empty
  state and `members.length < total` the Show more button.
- **Not confirmed**, left out: the e-mail branch of the invite panel (every
  user the server returns has an avatar address, `EmployeeDtoHelper.InitAsync`,
  and the private invite panel refuses a typed address) and a guest creating
  a private room (the SDK offers creation to administrators and room
  administrators only; the client closes silently too).

### Other changes

No requirement this delta adds or modifies is touched by another active
change (`private-rooms-server-hardening` and `private-rooms-external-links`
change other `sdk-surface` requirements), and the MODIFIED blocks copy the
main text as of 2026-11-20, so the archive order is free; re-diff them if
either of those archives first. `private-rooms-test-coverage-gaps` leaves
the fixme cases "change-owner" and "csp-headers" and the members view
render cases to tasks 2.1, 1.1 and 7.1 here; whichever lands second re-reads
those files. `private-rooms-beta-release` owns the release notes task 1.2
edits.

## Goals / Non-Goals

**Goals:**

- Specs, release notes and hand-over say the same thing about who can embed
  the private pages.
- Each parity fix reuses the client's shared flow where one exists, so the
  two cannot drift again.

**Non-Goals:**

- Changing the framing or the connections of the private pages (decisions 1
  and 2 keep them).
- The quota warning's design or wording: the keys are copied as they are.

## Decisions

### 1. The private pages stay framed by the portal's own origin (proposal decision 1, option A)

The SDK sends `frame-ancestors 'self'` as now, and the spec states it as a
limitation of this version. The release notes stop telling hosts to set
`privateRooms` for the SDK private pages; they name the embedded client
frame (the library's Manager mode) as the way to private rooms in a frame,
which the client gates by the same property.

Why not option B now: the plan accepted its script policy for a same-origin
consumer only (Context, "Design history"), and B also needs the library
release, a stand check of partitioned storage (the device unlock, the trust
list of member keys and the cross-tab lock live in the frame origin's
storage, which the browser keys by the top-level site in a third-party
frame) and the `publickey-credentials-get` permission on the iframe for
passkey unlock.

Option B, for a later change: the proxy builds `frame-ancestors 'self'`
plus the `domains` of `GET api/2.0/security/csp`, cached briefly, and keeps
`'self'` alone when the call fails; dropping the SDK's directive and leaving
framing to the portal's policy was rejected because a page served without
that policy could then be framed by anyone. The library gains a private
mode or a path for `/sdk/private`, `privateRooms` in its configuration and
`navigateSection` for the `rooms` and `archive` sections; the script policy
moves to nonces or the crypto to a worker first.

### 2. Connections stay as they are and the spec says so (proposal decision 2)

Production keeps `connect-src 'self' https:`. The storage address of an S3
store is known to the server, not to the SDK proxy; where the portal's
policy is served it narrows connections to the storage it names. Building
the list from `GET api/2.0/security/csp` was the alternative; it adds a
server call to every private page for no gain while the portal's policy is
present. The fixme "csp-headers" case of `private-security.spec.ts` is
replaced by unit cases in `proxy.test.ts`, as its own comment suggests.

### 3. The SDK owner change runs the client's preparation (proposal decision 5)

The SDK flow unlocks through `requireIdentity` of the encryption context,
calls `prepareNewOwner` and asks for the transfer only when no file stays
missing. The count after a 409 moves into shared, next to
`prepareNewOwner` in `room-member-flows.ts`, as one function that the
client's `changeRoomOwnerImpl` and the SDK hook both call: it reads
`getRoomMissingFileKeys` for the candidate and counts the files with
Common:EncryptedReencryptPartialFailure, falling back to the mapped error
when the server lists none. The unlock stays per app (`requireUnlock` in
the client, `requireIdentity` in the SDK), and the same unlock covers the
re-wrap; nothing new is asked of the server. The dialog keeps its
`getNewOwnerKeyRefusal` check at selection, so the hook adds no membership
or key check of its own. Copying the client's 409 handling into the SDK was
the alternative; two copies drift.

### 4. The private info panel provides the room actions (proposal decision 4)

The private info panel wraps its `RoomHeader` in a `RoomActionsContext`
built from `useRoomActions()`, the fallback the generic info panel
(`Body.tsx`) builds when no context sits above; the fallback moves into one
hook both panels call, with the archive state of the open room.
`useRoomActions` already sends edit, invite and change owner to
`RoomActionsOverrideContext`, which both private pages provide, so the open
room starts the private flows, and archive, delete and info reach the menu
as from the list. `useRoomContextMenuModel` is unchanged. Sending edit,
invite and change owner of the menu model to the override was the
alternative; it would leave archive, delete, info and the archive state
empty in the open room.

### 5. The quota warning keys move to Common (proposal decision 3)

The ten keys move from the client's `Payments` (nine) and `MainBar`
(`ContactToUpgradeTariff`) namespaces into the root `Common.json` of every
language, with their translations as they are, and leave the client
namespaces. A script that dry-runs first moves them and checks
placeholders, tags and that each key occurs exactly once
(`.claude/rules/bulk-locale-edits.md`). Their `.meta` files move to
`public/locales/.meta/Common/`, and `generate-metadata` rebuilds their
usage. Every caller then names `Common:`: the SDK dialog, which asks for
Common only, also for `GracePeriodActive` (read with `ns="Payments"`
today), and in the client `InviteQuotaWarningDialog` and `QuotasBar`.
Alternatives: copies in Common under new names, two texts to keep in step
(the same names fail `FullEnDublicatesTest`); bundling the client's
namespaces in the SDK, hundreds of unrelated keys for one dialog.

`translations.test.ts` scans `(private)`, `(rooms)`, `(docspace)` and
`(personal-files)`: a key with a namespace other than Common fails, an
unprefixed key fails unless Common holds it, and an `ns` attribute other
than Common fails.

### 6. Create waits for the load in flight

`loadKeys` keeps the promise of the load in flight and returns it to a
second caller, so `resolveEncryptionKeys` decides on the result of that load.
A caller that needs data newer than a running load (the dialog's refresh
after a key was generated) waits for it and loads once more. The identity
store's failure rule (a failed load is not an empty list) is unchanged.

### 7. Upload rows: cancelled leaves, locked fails, Cancel all stops every batch

- A file the user cancels in the name-clash dialog is taken out of the panel
  and the totals with `cancelItem`, as a row cancelled with its cross, so the
  button reflects only what is left and disappears when nothing is; the hook
  knows the dialog was cancelled from its own `onNameClash` answer. A cancelled state with a label of its own was the
  alternative; it needs a new key and a rule for a button whose every row is
  cancelled, and the client too takes a cancelled file out of the history
  its upload panel lists (`cancelCurrentUploadImpl`,
  `packages/client/src/store/uploadDataStore/start.helpers.ts`).
- A file stopped by a lock during the batch (the hook's signal aborted with
  the reason `lock`) fails with Common:EncryptionLockedUpload, the message
  the gate's refusal already gives a lock before the batch. "Cancel all" and
  a row's cross stay as they are.
- `UploadStore` keeps the controllers of every running batch; `cancelBatch`
  aborts them all, `resetItemForRetry` links a retried row to a live one,
  and the set is emptied with the rows it served (`reset`, `dropPending`,
  `clearFinished`). `dropPending` itself is unchanged.

The store is shared with the personal-files, rooms and AI agents pages,
which gain the same "Cancel all".

### 8. A refused leave after an owner change closes the dialog

The leave step gets its own handling after a successful transfer. A 403,
read with `isAccessChangeRefused` (the check the SDK's leave dialog already
uses), shows Common:EncryptedAccessChangeRefused alone, with no success
toast; the dialog calls `onChanged` and closes, and the page stays on the
room, since the user is still a member, as in the client. Any other leave
failure shows the mapped error, and the dialog also calls `onChanged` and
closes, since the transfer is done and submitting again would transfer
nothing.

### 9. The members search applies the same exclusions

The rule `classifyMembers` applies to each member moves into one predicate
used by the sections and by the search results. In the view the predicate
filters what is rendered and decides the empty state; the next page's
`startIndex` and Show more keep counting the raw page and `total`.

## Hand-over to the host library

For `docspace-sdk-js`, under decision 1: declare `privateRooms?: boolean`
in `TFrameConfig`, documented for Manager mode as the host's opt-in to the
private rooms beta, which the client reads already. Nothing for
`/sdk/private`. Task 1.3 records when it was handed over.

## Stand checks

2026-11-20, task 1.2, on a local stand (`release/v4.1.0` at `d40ff7e85b6`,
the client and the SDK from their dev servers behind the stand's nginx):

- Read: `docspace-sdk-js` origin/develop `135d0cc` (2.2.0) answers the
  frame's `setConfig` request by sending its whole configuration,
  `privateRooms` included, although `TFrameConfig` does not declare it; the
  client reads it from `settingsStore.frameConfig.privateRooms`
  (`AppsStore.settleFrameOptIn`). The portal serves the same library at
  `/static/scripts/sdk/2.2.0/api.js`.
- Run: a host page at `http://localhost:5555`, added to the portal's trusted
  domains, loaded that library and called `initManager` with
  `showMenu: true`. With `privateRooms: true` the frame reported ready and
  its sidebar listed Private rooms with the Beta badge; without the property
  the item was absent.
- Before the frame loads, the library asks the portal for
  `GET api/2.0/security/csp` and refuses a host outside its trusted domains.
  The client pages carry `X-Frame-Options: SAMEORIGIN`, which the
  `frame-ancestors` of the portal policy overrides. The local stand needed
  two settings for the run, undone afterwards: its nginx configuration was
  adjusted to the local container network, and the dev server's origin was
  trusted too.
- Headers (task 8.1): `GET /sdk/private` through nginx carried both
  policies, the portal's (`frame-ancestors` with the trusted domains and
  `'self'`) and the SDK's (`frame-ancestors 'self'`, same-origin opener and
  resource policies; the dev build adds `'unsafe-eval'` and `ws:`), so the
  private pages stay framed by the portal's own origin.
- Not covered: the host and the portal were the same site (`localhost`),
  so what a frame of another site changes (partitioned storage, third-party
  cookies) was not seen.

## Risks / Trade-offs

- [The SDK private surface has no embedding consumer in 4.1.0] → It stays
  reachable from the portal's own pages and its tests keep it working; the
  release notes no longer promise it to hosts.
- [The portal's policy may be missing on a deployment without the nginx
  block] → Production then allows connections to any https origin; framing
  stays limited by the SDK's own directive.
- [The quota keys leave the client's Payments and MainBar] → Every caller is
  repointed in the same task; ui-kit and no test name them (checked
  2026-11-20).
- [The Cancel all fix reaches the personal-files, rooms and AI agents pages]
  → Covered by the same `UploadStore` unit cases.

## Open Questions

None. The owner took proposal decisions 1 and 2 on 2026-11-19 and 3 to 5 on
2026-11-20, as the tasks are written.
