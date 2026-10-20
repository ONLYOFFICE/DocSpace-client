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
- Keep the desktop encryption bridge and point its sharing-keys request at a
  route the server exposes. The bridge hands the user's key pair to the
  desktop application's new crypto engine, whose id
  (`{DC522726-5E0E-43E5-AA02-8EA156BECBC5}`) the desktop developer asked for
  to tell it from the old desktop engine; the route and the key-write
  contract are agreed with the desktop developer (decision 1).
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
  uses editor-provided keys" is renamed "Desktop path uses editor-provided
  keys" and changes so the bridge passes the key pair with its crypto engine
  id and answers the desktop's sharing-keys request through a route the
  server exposes.

## Impact

- `packages/shared/api/files/index.ts` (two functions), `packages/shared/api/privacy/index.ts`
  and `types.ts` (settings read/write), `packages/shared/store/SettingsStore.ts`
  (`getIsEncryptionSupport`), `packages/client/src/Client.jsx` and
  `packages/client/src/store/FilesStore.ts` (legacy encryption-support
  wiring), `packages/doceditor/src/utils/initDesktop.ts`, `packages/shared/utils/desktop.ts`
  and `getEncryptionAccess` in `packages/shared/api/files/index.ts` (desktop
  sharing-keys request), the unit test
  `packages/client/src/store/filesStore/__tests__/FilesStore.remaining.test.ts`.
- No server change; no Document Server dependency. The desktop side (the new
  engine in the desktop application) is owned by the desktop developer.

## Out of scope

- Any change to the routes the server does expose.
- Desktop editor UX beyond the access call.

## Decisions needed

1. The bridge contract with the desktop's new crypto engine (owner: the
   desktop developer, with this change): which route answers `getsharingkeys`
   and in which shape, and whether the engine still writes keys through the
   bridge. An earlier decision of 2026-10-20 to drop the bridge was reverted
   the same day once the new engine id turned out to be the desktop
   developer's request.
