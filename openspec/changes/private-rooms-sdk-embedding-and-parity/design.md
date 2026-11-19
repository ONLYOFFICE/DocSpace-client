# Design

## Context

See proposal.md for the motivation. Read on 2026-11-19 on `release/v4.1.0`
(`54bed4b404d`), in `docspace-sdk-js` (read only, every branch), in
`../buildtools` and, through CodeGraph, in `../server`.

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
  api/2.0/privacyroom/{roomId}/access/missing`) lists them.
- **Info panel menu of an open room.** `(private)/private/[roomId]/page.client.tsx`
  provides `RoomActionsOverrideContext` but no `RoomActionsContext`.
  `RoomActionsMenu` (`(rooms)/_components/room-actions-menu`) passes the
  callbacks of `RoomActionsContext` to `useRoomContextMenuModel`, whose
  edit, invite and change-owner entries call those callbacks and nothing
  else; only leave consults the override. On the private list page
  `RoomsLayout` provides the context, so the list works.
- **Quota warning.** `(rooms)/_components/quota-warning-dialog` asks
  `useTranslation(["Payments", "Common"])` and renders nine keys of the
  client's `Payments` namespace and `MainBar:ContactToUpgradeTariff`
  (all in `packages/client/public/locales/<lng>/`). The SDK registers only
  the root `public/locales/<lng>/Common.json`
  (`packages/sdk/src/utils/translationLoaders.ts`). The private list opens
  this dialog through `RoomsLayout.createCustomRoom`. A scan of
  `(private)`, `(rooms)`, `(docspace)` and `(personal-files)` finds no other
  key outside Common; `(private)/translations.test.ts` scans `(private)`
  only.
- **Create during the key-list load.** `EncryptionIdentityStore.loadKeys`
  returns at once while a load runs; `resolveEncryptionKeys` of
  `PrivateCreateRoomDialog` then sees `keys === null` and answers "unknown",
  which the dialog turns into Common:EncryptionKeysLoadFailed.
- **Upload panel.** On a cancelled name-clash dialog the orchestrator
  returns every file as aborted, and so it does for a lock; the hook marks
  them `cancelled` (`useEncryptedUpload`). `file-row.tsx` knows only
  uploaded, error and the rest, so a cancelled row shows its percentage and
  a cancel button. `UploadStore.uploaded` is true once nothing is
  uploading, so the upload button reports "completed". `startBatch`
  replaces `batchAbortController`, so `cancelBatch` aborts only the newest
  batch, and `dropPending` then removes the rows of the older one while its
  files keep uploading.
- **Leave after an owner change.** `PrivateChangeOwnerDialog` awaits
  `leaveRoom` in the same `try` as the transfer; a 403 falls into the
  `catch`, which toasts `error.message` and leaves the dialog open, after
  the transfer took place.
- **Members search.** `PrivateMembersView` renders the raw page of members
  while a search text is set and the sections of `classifyMembers`
  otherwise; only the sections drop guests and disabled members who are not
  the owner. The request already asks for users only, so groups are not in
  either list.
- **Not confirmed**, left out: the e-mail branch of the invite panel (every
  user the server returns has an avatar address, `EmployeeDtoHelper.InitAsync`,
  and the private invite panel refuses a typed address) and a guest creating
  a private room (the SDK offers creation to administrators and room
  administrators only; the client closes silently too).

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

### 3. The SDK owner change runs the client's preparation

The SDK flow unlocks through `requireIdentity` of the encryption context,
calls `prepareNewOwner` and asks for the transfer only when no file stays
missing. On a 409 it reads `getRoomMissingFileKeys` for the candidate and
counts the files with Common:EncryptedReencryptPartialFailure, falling back
to the mapped error when the server lists none. The same unlock covers the
re-wrap; nothing new is asked of the server.

### 4. The room menu model uses the private override for edit, invite and change owner

`useRoomContextMenuModel` already sends leave to `RoomActionsOverrideContext`
when it is present. Edit, invite and change owner do the same. Both private
pages provide the override with the same private actions, so the list keeps
its behaviour and the open room gains it; generic pages provide no
override. Wrapping `RoomHeader` in a `RoomActionsContext` built from the
override was the alternative; it duplicates the bridge `RoomsLayout` keeps
and would still leave the model dependent on which context sits above it.

### 5. The quota warning takes its keys from Common

The ten keys are copied into the root `Common.json` of every language with
their existing translations and `.meta` comments, under the same names
(none exists in Common), by a script that dry-runs first and checks
placeholders and tags (`.claude/rules/bulk-locale-edits.md`). The dialog
then asks for Common only, also for `GracePeriodActive`, which it reads
with `ns="Payments"` today. The client keeps its own namespaces untouched.
Bundling the client's Payments and MainBar namespaces in the SDK was the
alternative; it ships hundreds of unrelated keys for one dialog.

`translations.test.ts` scans `(private)`, `(rooms)`, `(docspace)` and
`(personal-files)`: a key with a namespace other than Common fails, and an
unprefixed key fails unless Common holds it.

### 6. Create waits for the load in flight

`loadKeys` keeps the promise of the load in flight and returns it to a
second caller, so `resolveEncryptionKeys` decides on the result of that load.
The identity store's failure rule (a failed load is not an empty list) is
unchanged.

### 7. Upload rows: cancelled leaves, locked fails, Cancel all stops every batch

- A file the user cancels in the name-clash dialog is taken out of the panel
  and the totals the way `cancelItem` takes out a row cancelled with its
  cross, so the button reflects only what is left and disappears when
  nothing is. A cancelled state with a label of its own was the
  alternative; it needs a new key and a rule for a button whose every row is
  cancelled, and the client too takes a cancelled file out of the history
  its upload panel lists (`cancelCurrentUploadImpl`,
  `packages/client/src/store/uploadDataStore/start.helpers.ts`).
- A file stopped by a lock fails with Common:EncryptionLockedUpload, the
  message the SDK already uses when the uploader declines to unlock. The
  hook tells the two apart by whether the name-clash dialog was cancelled.
- `UploadStore` keeps one abort controller per batch; `cancelBatch` aborts
  them all and `dropPending` removes only rows whose upload has stopped.

The store is shared with the generic personal-files pages, which gain the
same "Cancel all".

### 8. A refused leave after an owner change closes the dialog

The leave step gets its own handling after a successful transfer: a 403 in
a private room shows Common:EncryptedAccessChangeRefused (the check the
SDK's leave dialog already uses), then the dialog reports the change and
closes as after a successful hand-over; any other leave failure is shown
with the mapped error and the dialog also closes, since the transfer is
done and submitting again would transfer nothing.

### 9. The members search applies the same exclusions

The rule `classifyMembers` applies to each member moves into one predicate
used by the sections and by the search results.

## Hand-over to the host library

For `docspace-sdk-js`, under decision 1: declare `privateRooms?: boolean`
in `TFrameConfig`, documented for Manager mode as the host's opt-in to the
private rooms beta, which the client reads already. Nothing for
`/sdk/private`. Task 1.3 records when it was handed over.

## Risks / Trade-offs

- [The SDK private surface has no embedding consumer in 4.1.0] → It stays
  reachable from the portal's own pages and its tests keep it working; the
  release notes no longer promise it to hosts.
- [The portal's policy may be missing on a deployment without the nginx
  block] → Production then allows connections to any https origin; framing
  stays limited by the SDK's own directive.
- [Copied keys can drift from the client's Payments texts] → They are copied
  once; `translate-stale` reports a reworded English value later.
- [The Cancel all fix reaches the generic personal-files pages] → Covered by
  the same `UploadStore` unit cases.

## Open Questions

None. The owner took both proposal decisions on 2026-11-19 as the tasks are
written.
