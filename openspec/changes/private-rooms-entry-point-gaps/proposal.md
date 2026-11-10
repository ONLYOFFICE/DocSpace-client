# Proposal

## Why

The "Version operations withheld" requirement of `file-operations` is broken
through an entry point that the requirement's only scenario does not name.
The context menu of an encrypted file has no version entries, but a click on
the version badge of a file row or tile still opens the version history
panel, with Open, Restore, Download and Delete. This was seen on the test
portal on 2026-11-10 (DocSpace 4.1.0.12351), as the room owner. The badge
opens the panel whenever the server grants the ReadHistory right, and the
server grants that right to the room owner on an encrypted file of a private
room (design.md, Context). So the right does not show whether the panel is
available.

Two more entry points bypass private-room rules in the same way: the media
viewer (download and rename) and the plugin tabs of the info panel. They
belong to this change but are not planned yet; see Out of scope.

## What Changes

- A click on the version badge of an encrypted file opens nothing, in the
  client and in the SDK, which render the same badge component. The badge
  has no `Common:ShowVersionHistory` tooltip there. It still shows the
  version count.
- Unchanged: the badge of a file that is not encrypted opens the version
  history panel as before, when the server grants ReadHistory, and keeps its
  tooltip.
- The E2E mock of a private room reports the rights of an encrypted file for
  the room owner as the server does (Rename, Lock, CopyLink, ReadHistory and
  EditHistory in an active room; ReadHistory alone in an archived one), and
  takes the file's version count as a seed, so that an E2E case can reach
  the badge.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: "Version operations withheld" gets
  scenarios for the version badge, of an encrypted file and of a file that
  is not encrypted. Its text says that the badge may still show the version
  count but opens nothing and has no version-history tooltip.

## Impact

- Shared: `packages/shared/components/badges/index.tsx` and
  `Badges.test.tsx`.
- Client: no source change. `packages/client/src/HOCs/withBadges.js` passes
  its handler only to that badge. A case in
  `packages/client/__tests__/encrypted-file-ui.spec.ts`.
- SDK: no source change. Its row, table and tile views render the shared
  badge.
- Mocks: `packages/shared/__mocks__/handlers/files/encryptedFiles.ts` (the
  file's `version` and `versionGroup`, and its Rename, Lock, CopyLink,
  ReadHistory and EditHistory rights) and cases in its contract test.
- Server (`../server`): no work needed for this change. The server reports
  these rights on an encrypted file although the client never offers the
  actions; asking it to stop is separate backend work. Until then, and
  after it, the client checks the encrypted flag, not the right.
- Locales: none. The badge only drops an existing string.

## Out of scope

- The media viewer: download of the ciphertext and Rename for an encrypted
  file. It is added to this change with `/opsx:update` before the archive.
- Plugin tabs in the info panel of a private room, of a folder in it and of
  an encrypted file. Added the same way.
- A version history for encrypted files. "Version operations withheld" is a
  deliberate v1 limitation; lifting it needs its own change.
- What the client does with the Rename, Lock and CopyLink rights of an
  encrypted file. The mock now reports them as the server does; the client
  rules that withhold those actions are not changed here.

## Decisions needed

None for the version badge.
