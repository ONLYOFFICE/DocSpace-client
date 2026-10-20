# Proposal

## Why

The client API modules still carry three private-room requests the server
never implemented: the privacy availability probe (`GET files/@privacy/available`,
reached through the settings store), the per-file privacy access request used
by the legacy desktop path (`GET privacyroom/access/{fileId}`), and the privacy
settings read/write (`GET/PUT privacyroom`). Two have no caller; the desktop
one fails with 404 whenever the editor runs inside the desktop application
with encryption keys. Dead requests mislead the next developer and the MSW
contract tests cannot mirror routes that do not exist.

## What Changes

- Remove the privacy availability request and the settings-store action that
  wraps it, together with the legacy `isEncryptionSupport` plumbing in the
  client shell that only this request fed.
- Remove the privacy settings read and write requests and their types.
- Decide the fate of the legacy desktop encryption path: keep the desktop
  bridge and point its file-access call at a route that exists, either the
  per-file `files/file/{fileId}/publickeys` (the server-side successor of the
  removed per-file call, which locates the room itself) or the room route
  `privacyroom/{roomId}/access`, or drop the bridge entirely. The specs below
  assume the bridge is kept and leave the route open.
- Delete the matching MSW handlers and contract-test entries, if any, and
  update the server-contract spec so it no longer lists routes the client
  does not call.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/server-contract`: the requirement "Client calls without a
  server route" is removed and replaced by a requirement that the client API
  surface matches the server routes.
- `private-rooms/editor-integration`: the requirement "Legacy desktop path
  uses editor-provided keys" changes so the desktop bridge resolves file keys
  through a route the server exposes instead of the removed
  `privacyroom/access/{fileId}`.

## Impact

- `packages/shared/api/files/index.ts` (two functions), `packages/shared/api/privacy/index.ts`
  and `types.ts` (settings read/write), `packages/shared/store/SettingsStore.ts`
  (`getIsEncryptionSupport`), `packages/client/src/Client.jsx` and
  `packages/client/src/store/FilesStore.ts` (legacy encryption-support
  wiring), `packages/doceditor/src/utils/initDesktop.ts` and
  `packages/shared/utils/desktop.ts` (desktop access call), the unit test
  `packages/client/src/store/filesStore/__tests__/FilesStore.remaining.test.ts`.
- No server change; no Document Server dependency.

## Out of scope

- Any change to the routes the server does expose.
- Desktop editor UX beyond the access call.

## Decisions needed

1. Keep or drop the legacy desktop encryption bridge, and if kept, which
   route it uses (open). The earlier recommendation (room route resolved from
   the file's parent chain) assumed no per-file route existed; the server has
   `GET files/file/{fileId}/publickeys`, which needs no room lookup. The two
   routes differ: the per-file one lists the users who hold the file and
   tolerates a caller without keys, the room one lists room members and
   refuses such a caller. If the desktop bridge is dropped instead, the
   editor-integration delta becomes a REMOVED requirement.
