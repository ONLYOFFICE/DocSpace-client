# Design

## Context

See proposal.md for the motivation. No stashed design document covers these
decisions: they come from the release-readiness review of 2026-11-19 and
from reading `release/v4.1.0` and `../server` (HEAD 5636dd4a79, 2026-11-18)
on the same day.

What the code does today:

- The shared badges render the convert badge on `viewAccessibility.MustConvert`
  and `security.Convert`, with no look at `encrypted`
  (`packages/shared/components/badges/index.tsx`); the client's badge HOC
  opens the conversion dialog from it (`packages/client/src/HOCs/withBadges.js`).
- The PDF menu of the media viewer (`getPDFContextModel` in
  `MediaViewer.helpers.tsx`) gates download-as on the Download right alone and
  never disables the room-member link entry. The client puts a PDF into the
  viewer's playlist only when `pdfViewer` is on in the client configuration
  (`MediaViewerDataStore.ts`; `public/scripts/config.json` ships it off).
- The SDK's open handler (`(personal-files)/_components/docs-layout/index.tsx`)
  calls `requestConvert` for any file with `MustConvert` once the encrypted
  editor check has passed; the client refuses an encrypted one first
  (`filesActionsStore/navigation.helpers.ts`).
- The SDK selection menu (`(docspace)/_hooks/useContextMenuModel.ts`,
  `getGroupCopyItem`) offers copy when every item has the Copy right or is an
  encrypted file.
- The drop handler of the file list (`pages/Home/Section/Body/index.js`)
  looks the target folder up in `selectedFolderStore.folders`, which holds
  the first page only: `fetchMoreFiles` (`filesStore/fetch.helpers.ts`)
  appends later pages to `filesStore.folders`. `moveDragItemsImpl`
  (`copyMove.helpers.ts`) counts the destination as part of the open room
  only by its id, its parent from that folder info, or the navigation path.
  Without the info a folder row of a later page is taken for a folder outside
  private rooms, the plan is `decrypt-out` with its confirmation, and
  `copyEncryptedFilesToFolderImpl` then resolves the real destination from its path, finds the
  same room and stores encrypted copies with suffixed names, deleting no
  source.
- A declined unlock in `copyEncryptedFilesToFolderImpl` and in the SDK's
  `useEncryptedCopyMove.ts` (copy and duplicate) shows
  Common:EncryptionLockedAddMembers.
- `downloadEncryptedFileImpl` (`download.helpers.ts`) checks the user's own
  access entry before the unlock and shows Common:EncryptionDownloadFailed
  without one. `decryptEncryptedItemToFile` (`services/private-room/encrypted-copy.ts`)
  throws a plain `Error` without one, so the copy reports
  Common:EncryptedCopyFailed (or Common:EncryptedMovePartialFailure).
- The media viewer (`MediaViewer.tsx`, `fetchAndDecryptFile`) reads the access
  answer, throws a plain `Error` only when `fileKeys` is missing, then asks
  for the passphrase, fetches the file and unwraps; the unwrap raises
  `NoAccessError` for an empty list, which the shared mapping turns into
  Common:EncryptedFileNoAccessYet. After decryption it hands the blob to the
  viewer with an `image/tiff` or `image/heic` type; the TIFF and HEIC decoders
  run only on the unencrypted branch.

## Server facts

Found with CodeGraph in `../server` and read in the source:

- Convert right in a private room: `FileSecurity.FilterEntryAsync`
  (`products/ASC.Files/Core/Core/Security/FileSecurity.cs`, the
  `FolderType.VirtualRooms` case) returns false for `FilesSecurityActions.Convert`,
  `AskAi`, `Embed`, `EditAccess` and `Copy` of a file whose room has
  `SettingsPrivate`, and for `Convert`, `AskAi`, `Embed` of a private room
  itself; the `FolderType.Archive` case allows no Convert at all. The file
  DTO's `security` map is built from the list `_securityEntries` in the same
  file, which includes `Convert`.
- Copy of a folder in a private room: in the same method, `inPrivateRoom`
  makes `Copy`, `Duplicate`, `IndexExport`, `UseChat`, `Vectorization` and
  `StartFilling` false for every entry of a private room before the section
  switch, and the `VirtualRooms` case also refuses `EditAccess`, `Copy` and
  `CopyTo` for a folder below the room.
- Starting a conversion: `FileStorageService.CheckConversionAsync`
  (`products/ASC.Files/Core/Core/FileStorageService.cs`) requires
  `fileSecurity.CanConvertAsync(file)` when `StartConvert` is set and throws
  `InvalidOperationException(ErrorMessage_SecurityException_ReadFile)`
  otherwise. `FileConverter.EnableConvertAsync`
  (`products/ASC.Files/Core/Utils/FileConverter.cs`) returns false for a file
  with `Encrypted`.
- The access answer: `FilesController.GetEncryptionInfoAsync`
  (`products/ASC.Files/Server/Api/FilesController.cs`, `GET files/{fileId}/access`)
  returns `FileKeys = fileKeys?.Select(r => r.Map()).ToList()` from
  `FileDao.GetFileKeys` (`products/ASC.Files/Core/Core/Dao/TeamlabDao/FileDao.cs`),
  a `ToListAsync` over the caller's own rows. A caller without an entry gets
  an empty list, never a missing one; the DTO
  (`products/ASC.Files/Core/ApiModels/ResponseDto/FileEncryptionInfoDto.cs`)
  documents an empty list as "not shared with this account".

So the convert badge and the SDK selection copy of a private folder are not
offered with the rights the server reports today, and a conversion started
for an encrypted file is refused by the server. The client checks of task
group 5 and the SDK refusal of task 1.1 are a second line, not the only one.

## Goals / Non-Goals

**Goals:**

- Each fix lands where the behaviour is owned: the shared badges, the shared
  media viewer and the shared copy service serve the client and the SDK.
- No change to what is generated, sealed, stored or sent, except that a drag
  inside a room sends a move instead of an upload.

**Non-Goals:**

- The SDK's download of a file without a wrap and SDK drag and drop
  (proposal.md, Out of scope).
- Any server change.

## Decisions

### 1. The SDK refuses conversion before the conversion dialog

`openFileHandler` checks `file.encrypted && file.viewAccessibility?.MustConvert`
right after the encrypted-editor check and shows
Common:PrivateRoomConvertNotSupported, the text the client shows. The check
sits in a pure helper next to `refusesEncryptedOpen` (`open-encrypted.ts`), so
it is tested without the layout. The convert badge of the SDK rows goes
through the shared badges and is covered by decision 6.

### 2. The drop target comes from the shown list

The drop handler looks the target up in `filesStore.folders`, the list that
is rendered with every loaded page and every socket update, instead of
`selectedFolderStore.folders`. As a second line, `moveDragItemsImpl` counts a
destination as part of the open room when it is one of the folders of the
open folder's list, whether or not the caller passed folder info. The
alternative, filling `selectedFolderStore.folders` on every page, was
rejected: it is the snapshot of the folder taken on navigation, and other
readers expect it.

### 3. One new text for a declined unlock on a copy

`Common:EncryptionLockedCopy`: "Nothing was copied or moved because your
encryption key is locked. Unlock it and try again." It follows
Common:EncryptionLockedUpload in form. It replaces
Common:EncryptionLockedAddMembers in the client's copy path and in the SDK's
copy and duplicate; the invite panel keeps the old key, whose text is about
new members.

### 4. A missing wrap is a typed error everywhere

`decryptEncryptedItemToFile` throws `NoAccessError` when the user has no
entry, as `unwrapDekForCurrentUser` already does, so the shared mapping
(`getSpecificEncryptionErrorMessage`) returns Common:EncryptedFileNoAccessYet.
The client's copy shows that text when the failing file is the only one, and
keeps Common:EncryptedCopyFailed or Common:EncryptedMovePartialFailure naming
the files otherwise. The download shows it instead of
Common:EncryptionDownloadFailed; the scenario "Download from the media
viewer of a file that cannot be found" keeps Common:EncryptionDownloadFailed,
which is a different case.

### 5. The media viewer checks the entry before the passphrase

`fetchAndDecryptFile` looks for the user's own entry in `fileKeys` right
after the access read and raises `NoAccessError` when there is none, whether
the list is empty or missing, before `requireUnlock` and the fetch. The
server never sends a missing list (Server facts), so the old branch that
mapped it to Common:EncryptionDecryptPartialFailed goes.

### 6. TIFF and HEIC are decoded after decryption

After decryption, a name ending in a TIFF or HEIC extension sends the
decrypted blob through the same decoders the unencrypted branch uses
(`decodeTiff`, `heic2any`), taking the bytes directly instead of fetching a
URL, under the encrypted branch's abort signal. The decoders run in the
browser, so the decrypted bytes stay there.

### 7. Withheld entries do not rely on the server's rights

The convert badge is not rendered for `item.encrypted`, and the HOC's
handler returns early for one, so neither the badge nor a stale handler opens
the dialog. The media viewer's PDF menu disables download-as and the
room-member link for `item.encrypted`, the way it already withholds rename.
The SDK selection menu's copy is disabled when the selection holds a folder
and the open folder is inside a private room.

## Dropped findings

- Finding 8 as stated (an access answer without `fileKeys` is reported with
  the general decryption failure): the server always sends a list (Server
  facts), and an empty one already ends in Common:EncryptedFileNoAccessYet
  through the unwrap. What remains is the order of the check, decision 5.
- Finding 10 (privacy decided from the open folder): no listing was found
  that shows an encrypted file while a folder outside private rooms is open.
  Recent never lists one ("Feeds show resolved names", scenario "Recent after
  opening an encrypted file"; the server answers 400 to Recent with the
  section's area), Favorites and Trash never hold one ("No Recent, Favorites,
  Templates or Trash under the section"), and the rooms search lists rooms,
  not their files. Without such a listing the change has no scenario to test
  it by, so it is left out.

## Risks / Trade-offs

- The drop lookup reads a larger list. → It is the list already rendered; a
  `find` by id over it costs nothing next to a drag.
- `private-rooms-download-entry-names` modifies the same download
  requirement. → The change archived second merges the other's text first
  (proposal.md, Dependencies).
- Changing the copy's thrown error type may change the text of a test that
  asserted the old message. → Task 3.1 runs the shared copy tests and the
  client and SDK copy suites.
