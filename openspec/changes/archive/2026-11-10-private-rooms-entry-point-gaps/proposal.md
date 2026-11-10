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

The media viewer breaks two more requirements of `file-operations`. Its
download button and Ctrl+S save the file the server stores, so the user gets
the ciphertext container instead of the file ("Download decrypts on the
client"); its menu offers Rename for an encrypted file, and the rename
dialog shows the opaque server name ("Rename withheld for encrypted
files"). Both were seen on the test portal on 2026-11-10. Neither
requirement names the media viewer, so neither has a scenario for it.

The info panel breaks "AI and plugin actions withheld" of
`room-membership`: it adds the tabs of enabled plugins for a private room,
a folder inside one and an encrypted file, while the context menu withholds
plugin entries for all three. Plugins receive an item id and fetch the
content themselves. This was found in the code, not on the test portal. The
requirement's only scenario names the context menu.

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
- The download button and Ctrl+S of the client's media viewer save an
  encrypted file through the decrypting download, as its Download menu entry
  already does. The SDK viewer already does this.
- No media viewer menu offers Rename for an encrypted file, in the client
  and in the SDK, which build their menus from the same helpers: the
  desktop menu, the mobile menu and the menu of a PDF.
- Unchanged: download and Rename in the media viewer for a file that is not
  encrypted.
- The client's info panel shows no plugin tabs for a private room, a folder
  inside one or an encrypted file. Other items keep the tabs their plugins
  ask for.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: "Version operations withheld" gets
  scenarios for the version badge, of an encrypted file and of a file that
  is not encrypted. Its text says that the badge may still show the version
  count but opens nothing and has no version-history tooltip.
- `private-rooms/file-operations`: "Rename withheld for encrypted files"
  names the media viewer menu and gets scenarios for it; "Download decrypts
  on the client" gets a scenario for the media viewer's download button
  and Ctrl+S.
- `private-rooms/room-membership`: "AI and plugin actions withheld" names
  the plugin tabs of the info panel and gets scenarios for them.

## Impact

- Shared: `packages/shared/components/badges/index.tsx` and
  `Badges.test.tsx`.
- Shared: `packages/shared/components/media-viewer/MediaViewer.helpers.tsx`
  and `MediaViewer.test.tsx`.
- Client: `packages/client/src/pages/Home/MediaViewer/index.js`
  (`onDownloadMediaFile`); `packages/client/src/helpers/info-panel/tabs.ts`
  and its callers `InfoPanel/Body/bodyGeneral.tsx` and
  `InfoPanel/Header/headerGeneral.tsx` with their `index.tsx` wrappers, and
  `helpers/info-panel/__tests__/tabs.test.ts`. For the badge, no source change:
  `packages/client/src/HOCs/withBadges.js` passes its handler only to that
  badge. Cases in `packages/client/__tests__/encrypted-file-ui.spec.ts`.
- SDK: no source change. Its row, table and tile views render the shared
  badge, its viewer menus come from the shared helpers, and its viewer
  download already decrypts.
- Mocks: `packages/shared/__mocks__/handlers/files/encryptedFiles.ts` (the
  file's `version` and `versionGroup`, and its Rename, Lock, CopyLink,
  ReadHistory and EditHistory rights) and cases in its contract test.
- Server (`../server`): no work needed for this change. The server reports
  these rights on an encrypted file although the client never offers the
  actions; asking it to stop is separate backend work. Until then, and
  after it, the client checks the encrypted flag, not the right.
- Locales: none. The badge only drops an existing string.

## Out of scope

- Decrypting a PDF in the media viewer. Only the Rename entry of its menu
  changes here.
- A version history for encrypted files. "Version operations withheld" is a
  deliberate v1 limitation; lifting it needs its own change.
- What the client does with the Lock and CopyLink rights of an encrypted
  file, and with its Rename right outside the media viewer. The mock now
  reports them as the server does; the client rules that withhold those
  actions are not changed here.

## Decisions needed

None open. The Rename check also covers the media viewer's PDF menu,
which the client reaches only while `pdfViewer` is set in the client
config; the owner confirmed this on 2026-11-10.
