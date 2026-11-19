# Proposal

## Why

The release-readiness review of 2026-11-19 (code reading and a local stand
with Document Server 10.0.3.58) found entry points that offer an action the
main specs withhold for encrypted files, actions whose outcome differs from
what the specs promise, and two requirements of `file-operations` that
contradict each other. None of them exposes content: the server refuses a
conversion of a file in a private room, and every path keeps the content
encrypted inside the room. They are wrong entry points and wrong messages,
and this change makes the client and the SDK match the specs.

What the review saw:

- The SDK opens the conversion dialog for an encrypted file whose format must
  be converted, on a double click or Enter, while the client refuses that
  with Common:PrivateRoomConvertNotSupported. The server then answers the
  conversion request with a security error.
- A move by drag and drop onto a folder of the same private room turns into
  an encrypted copy, preceded by a confirmation that says the files will be
  saved decrypted, when the folder's row came from a page loaded by
  scrolling. The drop looks the target up in the first page only, so the
  target looks like a folder outside the room.
- A declined unlock at the start of an encrypted copy, move or duplicate
  shows Common:EncryptionLockedAddMembers, a text about new members of a
  room, in the client and in the SDK.
- "Download decrypts on the client" asks for Common:EncryptionDownloadFailed
  when the user has no access entry for the file, while "A file without a
  wrap for the user is reported as no access" asks for
  Common:EncryptedFileNoAccessYet for the same download, and for copies. The
  code follows the first for downloads and shows Common:EncryptedCopyFailed
  for copies.
- The media viewer asks for the passphrase and fetches the whole file before
  it reports a file that is not shared with the user yet; the downloads check
  the access entry first.
- An encrypted TIFF or HEIC image does not render in the media viewer: the
  browser decoding that unencrypted files of those formats get is skipped
  after decryption.
- The PDF menu of the media viewer offers download-as and the room-member
  link for an encrypted PDF. It is reachable only where the deployment turns
  the PDF viewer on (`pdfViewer` in `public/scripts/config.json`, off by
  default).
- The convert badge of a list row and the copy entry of the SDK selection
  menu have no check of their own for an encrypted file or a folder of a
  private room; they rely on the rights the server reports, which withhold
  both today (design.md, "Server facts").

## What Changes

- The SDK refuses to open an encrypted file that must be converted with
  Common:PrivateRoomConvertNotSupported and never opens the conversion
  dialog for it.
- A drop onto any folder row of the open folder of a private room, loaded by
  scrolling or not, is a server move inside the room.
- A declined unlock on an encrypted copy, move or duplicate shows a new text,
  Common:EncryptionLockedCopy, in the client and in the SDK.
- A file the user holds no wrap for is reported with
  Common:EncryptedFileNoAccessYet when it is the only file of a download,
  copy, move or open, and is named in the batch report when it is one of
  several. "Download decrypts on the client" is modified to match.
- The media viewer reports a file that is not shared yet before it asks for
  the passphrase or fetches the file.
- The media viewer decodes an encrypted TIFF or HEIC image in the browser
  after decryption.
- The media viewer menu of an encrypted file has no download-as and no
  room-member link entry.
- The convert badge is not shown for an encrypted file, and the SDK
  selection menu offers no copy for a selection holding a folder of a
  private room, whatever rights the server reports.

Out of scope:

- The SDK's single-file download of a file without a wrap. It shows
  Common:EncryptionDownloadFailed or the mapped encryption error today, and
  the SDK spec does not name a text for that case; a follow-up can align it.
- Drag and drop in the SDK. It was not part of the review finding.
- Deciding privacy from the item instead of the open folder in the
  destination picker, the drag planner, the delete confirmation and the
  name recovery. The review asked for it only if a listing shows an
  encrypted file while a folder outside private rooms is open; none was
  found (design.md, "Dropped findings").
- A server-side change of any kind.

Dependencies:

- No work on `../server` or the Document Server. Every server fact this
  change relies on is cited from the source in design.md.
- `private-rooms-download-entry-names` modifies "Download decrypts on the
  client" as well, for the saved names. Whichever change is archived second
  carries the other's text into its MODIFIED block before it is archived:
  that change keeps the scenario "No own access entry" at
  Common:EncryptionDownloadFailed, which this change replaces.

## Decisions

Taken by the owner on 2026-11-19:

1. One text per situation for a file without a wrap (finding 6):
   Common:EncryptedFileNoAccessYet when the file is the only one of a
   download, copy, move or open; the batch report (Common:EncryptedCopyFailed,
   Common:EncryptedMovePartialFailure, Common:EncryptedDownloadPartial) names
   it when it is one of several. "Download decrypts on the client" loses:
   Common:EncryptionDownloadFailed says only that something failed, while the
   no-access text tells the user why and matches what the media viewer and
   the editor page already show for the same file. A batch keeps its report
   because one toast per file would bury the result.
2. Encrypted TIFF and HEIC images are supported in the media viewer rather
   than withheld (finding 9). The decoders the viewer uses for unencrypted
   files run in the browser on the bytes they are given, so the decrypted
   bytes never leave it; withholding the preview would need a new text and
   leave a supported image type unviewable.
3. The convert badge guard and the SDK selection-menu copy guard (task group
   5) are hardening: the server withholds both rights today. They follow the
   rule the version badge already has ("whatever history rights the server
   reports"). The owner keeps the group.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: three requirements added (the media
  viewer menu of an encrypted file, a drag move inside a private room, a
  declined unlock on a copy or move), five modified ("Favorites, conversion
  and download-as withheld", "Download decrypts on the client", "A file
  without a wrap for the user is reported as no access", "Media preview
  decrypts on the client", "The media viewer reports a file that is not
  shared yet as no access").
- `private-rooms/sdk-surface`: two requirements added (no conversion of an
  encrypted file, a declined unlock on a copy or move), one modified ("Menu
  entries withheld for encrypted items").

## Impact

- `packages/shared/components/badges`: the convert badge.
- `packages/shared/components/media-viewer`: the PDF menu, the order of the
  access check, the TIFF and HEIC decoding after decryption.
- `packages/shared/services/private-room/encrypted-copy.ts`: a missing wrap
  raises the typed no-access error, so the shared error mapping names it.
- `packages/client/src/pages/Home/Section/Body/index.js` and
  `packages/client/src/store/filesActionsStore/copyMove.helpers.ts`: the drop
  target and the locked text; `download.helpers.ts`: the no-access text.
- `packages/sdk/src/app/(personal-files)/_components/docs-layout`, the SDK
  selection menu and `(private)/_hooks/useEncryptedCopyMove.ts`.
- `public/locales`: one new Common key in every language.
