# Design

## Context

See proposal.md, Why.

Version badge. The shared badge component
(`packages/shared/components/badges/index.tsx`) draws the version badge of a
file with more than one version (`versionGroup > 1`). It attaches the click
handler it receives only when the item's `security.ReadHistory` is true, and
it always sets the `Common:ShowVersionHistory` title. It never reads
`item.encrypted`, which its item type already declares. The client passes
`onShowVersionHistory` from `withBadges.js`. That handler checks only the
Trash, then calls `fetchFileVersions` and opens the version history panel.
It is passed to nothing but this badge. The SDK passes its own handler
(`versionHistoryHandler`) from its row, table and tile views, which opens
its `versionHistoryStore`. Both apps already withhold the version entries of
the context menu through the shared intent table (`private-menu-rules.ts`,
intent `versions`). The badge does not go through that table.

Server read: `../server` at `b4cd1db402` (`release/v4.1.0`, 2026-11-10),
through CodeGraph (`FileSecurity`, `FilterEntryAsync`, `SetSecurity`,
`HasFullAccessAsync`, `FileDtoHelper`). Source:
`products/ASC.Files/Core/Core/Security/FileSecurity.cs`, method
`FilterEntryAsync`, which `SetSecurity` calls for every action of the file
list (`_securityEntries`, which includes Rename, ReadHistory, Lock,
EditHistory and CopyLink). Rechecked after a pull to `a7d94e4b81`
(2026-11-10): the commits since `b4cd1db402` touch only `ASC.AI` (document
agent settings and skills), so the reads below stand.

- `:1708-1721`: the refusal for every entry of a private room covers Copy,
  Duplicate, IndexExport, UseChat, Vectorization and StartFilling. Rename,
  Lock, CopyLink, ReadHistory and EditHistory are not in it.
- `:1988-2018`, in the VirtualRooms branch (which also handles
  `FolderType.PrivateRooms`, `:1785`): Rename, Lock and EditHistory are
  refused only in the form-filling folders, and CopyLink only in the
  form-filling system folders. Neither applies to a private room.
- `:2033-2061`: the private-room refusals for a file cover Convert, AskAi,
  Embed, EditAccess and Copy. The five rights above are not in them.
- `:2063`: `HasFullAccessAsync` (`:3935`) grants the room owner (a user who
  is neither a guest nor of the User type and who created the room) every
  action that was not refused before. So the owner gets Rename, Lock,
  CopyLink, ReadHistory and EditHistory on an encrypted file of an active
  private room.
- `:2068-2083`, the Archive branch, admits Read, Delete, ReadHistory, Copy,
  Move, Download, ReadLinks and IndexExport, so of the five only ReadHistory
  remains.
- `FileDtoHelper` (`products/ASC.Files/Core/ApiModels/ResponseDto/FileDto.cs`)
  overrides these rights only in Recent and Favorites (`:378-406`) and in a
  form-filling room (`:567-585`), neither of which applies here.

The file history endpoint behind `fetchFileVersions` is not read here. The
client never calls it for an encrypted file after this change.

Mock. `encryptedFilesHandlers` reports `version` and `versionGroup` 1 for
every file. On a file of an active private room it reports Lock, CopyLink,
ReadHistory and EditHistory false, which differs from the server for the
room owner, the only viewpoint the mock serves. With either value, no E2E
case can reach the badge.

Media viewer. The shared viewer
(`packages/shared/components/media-viewer/MediaViewer.tsx`) calls the id-based
`onDownload` from its toolbar download button and from Ctrl+S
(`onDownloadMedia`), and the item-based `onClickDownload` from the Download
entry of its menu. The two apps fill these differently:

- Client (`packages/client/src/pages/Home/MediaViewer/index.js`):
  `onDownloadMediaFile`, passed as `onDownload`, opens the playlist item's
  `src` with `openUrl(..., UrlActionType.Download)`. `MediaViewerDataStore`
  builds every playlist item with `src: file.viewUrl`, so the browser saves
  the ciphertext container (seen on the test portal: a DSE3 file). The menu
  entry instead goes through `ContextOptionsStore.onClickDownload`, which
  sends an encrypted file to `filesActionsStore.downloadAction`, the
  decrypting download, and shows a localized toast on failure.
- SDK (`packages/sdk/src/app/(docspace)/_components/FilesMediaViewer/hooks/useMediaViewer.ts`):
  both `onDownload` and `onClickDownload` call `downloadAction`
  (`useDownloadActions.ts`), which sends an encrypted file through its
  `encryptedActions`. The SDK download is already correct.

Rename comes from the menu models in `MediaViewer.helpers.tsx`, shared by
both apps. `getMobileMediaContextModel` and `getPDFContextModel` show it
unless `security.Rename` is false; the server reports Rename true to the
room owner (above). `getDesktopMediaContextModel` hides it only in an
archived room or for a public file and does not read the right at all. None
of the three reads `encrypted`. On the test portal the rename dialog opened
from the viewer showed the file's opaque name. `getPDFContextModel` is used
when the viewer opens a PDF, which the client playlist admits only while
`ClientConfig.pdfViewer` is set.

Info panel. `getAvailableInfoPanelTabs`
(`packages/client/src/helpers/info-panel/tabs.ts`) builds the tab list for
the client's info panel; its only callers are `InfoPanel/Body/bodyGeneral.tsx`
and `InfoPanel/Header/headerGeneral.tsx`, which get `isTrash` and
`isRecentFolder` from `treeFoldersStore` through their `index.tsx`
wrappers. It already computes `isPrivateItem` (the item's `private` or
`encrypted` flag), but uses it only to leave out the Share tab. The tabs of
enabled plugins are added afterwards, filtered by the plugin's own
`itemSecurity`, item ids, file types and room types, never by privacy.

A folder inside a private room carries no flag of its own. Through
CodeGraph: `FolderDtoHelper.GetFolderWrapperAsync`
(`products/ASC.Files/Core/ApiModels/ResponseDto/FolderDto.cs:595`) sets
`Private` from `folder.SettingsPrivate`, and the folder queries
(`products/ASC.Files/Core/Core/EF/Queries/FolderQueries.cs:429-431, 464`)
load the room settings by the folder's own id, so a subfolder has none and
reports `private: false`. Its `rootFolderType` is that of any room. The
client's context menu therefore withholds plugin entries from folders by
`treeFoldersStore.isPrivacyFolder || item.private`
(`filesStore/contextOptions.helpers.ts`); `isPrivacyFolder` is true when the
open folder or one on its navigation path is private.

No stashed design document covers the version badge, the media viewer or
the info panel.

## Goals / Non-Goals

**Goals:**
- The version badge of an encrypted file opens nothing and has no
  version-history tooltip, in both apps, with one check.
- The badge of any other file behaves as before.
- The mock reports the rights of an encrypted file as the server does for
  the room owner.
- Every download from the media viewer of an encrypted file saves the
  decrypted file under its original name.
- No media viewer menu offers Rename for an encrypted file, in either app.
- The info panel shows no plugin tab for a private room, a folder inside
  one or an encrypted file, as the context menu already withholds plugin
  entries.

**Non-Goals:**
- Hiding the badge or changing its label.
- Modelling room roles in the mock. It keeps serving the room owner.
- Changing how the client treats the Lock and CopyLink rights of an
  encrypted file, or its Rename right outside the media viewer.
- Decrypting a PDF in the media viewer. Only its menu changes here.

## Decisions

1. **Check `item.encrypted` in the shared badge, not the server right.** The
   badge attaches its click handler only when the item is not encrypted and
   has ReadHistory, and sets its `Common:ShowVersionHistory` title only when
   the item is not encrypted. One check in the shared component covers the
   client and the SDK. The badge keeps its label, so the version count still
   shows. The check carries the one-line pointer
   `Spec: private-rooms/file-operations, "Version operations withheld"`.
   Alternatives:
   - (a) Trust `security.ReadHistory`. Rejected: the server grants it on an
     encrypted file (Context). Asking the server to refuse it is separate
     backend work, and the client must not depend on it.
   - (b) Guard the handlers (`withBadges.onShowVersionHistory` and the SDK's
     `versionHistoryHandler`) instead. Rejected: that needs two guards for
     one rule, and the badge would still promise the history in its tooltip.
   - (c) Route the badge through the intent table (`versions`). Rejected for
     now: the table maps intents to menu keys, and the badge has no key. One
     flag check is simpler.
2. **The tooltip goes with the click.** A badge that opens nothing must not
   say "Show version history". This adds no new string. The hover style is
   left alone (see Risks).
3. **The mock mirrors the owner's rights and takes a `versionGroup` seed.**
   In an active private room Rename, Lock, CopyLink, ReadHistory and
   EditHistory are true, as `FilterEntryAsync` answers them for the owner;
   in the archived variant only ReadHistory is. A seed may set
   `versionGroup` (default 1), which the file reports as both `version` and
   `versionGroup`, so a spec can show a file with several versions. The
   contract test checks both. An E2E case can then fail without the fix.
4. **The client's viewer download of an encrypted file takes the menu's
   path.** When the playlist item is marked `encrypted`,
   `onDownloadMediaFile` looks the file up in the files of the folder, or
   takes `previewFile` when the viewer was opened from a preview link, and
   calls `onClickDownload(file, t)`, the handler the viewer's Download entry
   already uses, which owns the decryption and the error toast. If no file is
   found it downloads nothing rather than the ciphertext. Any other item
   keeps `openUrl` on the playlist `src`. Alternatives:
   - (a) Check `encrypted` in the shared viewer and call `onClickDownload`
     from there. Rejected: the shared viewer does not own the download, the
     apps do, and the SDK is already correct.
   - (b) Give the playlist item another `src`. Rejected: the viewer's
     decrypting preview reads that `src`.
5. **Rename is withheld by `item.encrypted` in all three menu models.**
   `getDesktopMediaContextModel`, `getMobileMediaContextModel` and
   `getPDFContextModel` hide the Rename entry for an encrypted file, with the
   one-line pointer
   `Spec: private-rooms/file-operations, "Rename withheld for encrypted files"`.
   The right is not trusted, for the reason in decision 1 (a). The PDF model
   is included although the client reaches it only with `pdfViewer` set:
   the requirement makes no exception for an entry point, and the check sits
   in the same file.
6. **The tabs helper takes `isPrivacyFolder` and skips plugin tabs for a
   private item.** `getAvailableInfoPanelTabs` gets a new
   `isPrivacyFolder` parameter, passed by both callers from
   `treeFoldersStore`, and adds no plugin tab when `isPrivateItem` or
   `isPrivacyFolder` is true, with the one-line pointer
   `Spec: private-rooms/room-membership, "AI and plugin actions withheld"`.
   This is the same test the context menu uses. Alternatives:
   - (a) Decide from the item alone. Rejected: a subfolder of a private room
     has no flag (Context).
   - (b) Filter the plugin tabs in each caller. Rejected: two copies of one
     rule, and the helper is where the tabs are chosen and tested.

## Risks / Trade-offs

- [Every E2E spec that uses `encryptedFilesHandlers` now sees Lock,
  CopyLink and the history rights on its files, so a client rule that
  relied on those rights being false would show up as a failing spec.] →
  The client E2E specs that use the mock are run in the E2E task. The SDK
  and doceditor specs that use it assert none of these rights. The run
  found two info-panel cases in `private-rooms-section.spec.ts` that open
  Info on a file that is not encrypted: with ReadHistory the client puts
  Info under More options next to the version history, as it does on the
  server's data, so those cases now open that submenu first.
- [The ui-kit `Badge` shows a pointer cursor on hover whether or not it has
  a click handler, unless it gets `noHover`. So the version badge of an
  encrypted file still looks clickable on hover, as it does today for a
  user without ReadHistory.] → Accepted for this change; passing `noHover`
  would also change the badge for that user, which is not a private-room
  rule.
- [The mobile and PDF viewer menus still gate Move, Copy and Duplicate by
  the server rights alone.] → Copy and Duplicate are refused by the server
  in a private room (Context), and a move out of the room is covered by
  "Files leaving a private room are decrypted". Not changed here.
- [`isPrivacyFolder` describes the open folder, not the item the info
  panel shows.] → The info panel shows either the open folder or an item
  listed in it, so inside a private room both are private. A private room
  in a rooms list and an encrypted file in Recent or Favorites carry their
  own `private` or `encrypted` flag.
- [An encrypted playlist item whose file the client cannot find downloads
  nothing and shows nothing (decision 4).] → Accepted: the viewer only
  lists files of the open folder or the previewed file, so this is not
  expected to happen, and a silent no-op is safer than the ciphertext.
