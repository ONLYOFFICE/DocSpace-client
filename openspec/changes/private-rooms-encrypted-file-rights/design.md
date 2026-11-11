# Design

## Context

See proposal.md for the motivation. No stashed design document covers the
rights of an encrypted file; everything below comes from the code.

Server, read through CodeGraph on 2026-11-11 at `a7d94e4b81`. All of it is
in `products/ASC.Files/Core/Core/Security/FileSecurity.cs` unless another
file is named.

- **Which keys a file carries.** `SetSecurity` (line 1106) asks
  `FilterEntryAsync` once per action of `_securityEntries[FileEntryType.File]`
  (lines 298-327), 27 actions: Read, Comment, FillForms, Review, Edit,
  Delete, CustomFilter, Rename, ReadHistory, Lock, EditHistory, Copy, Move,
  Duplicate, SubmitToFormGallery, Download, Convert, CreateRoomFrom,
  CopyLink, Embed, StartFilling, FillingStatus, ResetFilling, StopFilling,
  OpenForm, Vectorization, AskAi. The mock sends 21 of them.
- **The owner's grant.** In the branch for the Rooms and Private sections
  (`case FolderType.VirtualRooms ... FolderType.PrivateRooms`, line 1781)
  `FilterEntryAsync` returns true at `HasFullAccessAsync` (line 2063) for
  every action not refused above it. `HasFullAccessAsync` (line 3935) is
  true for the creator of the parent room who is neither a guest nor of
  the User type. The administrator shortcut above it is skipped for a
  private room (line 1791).
- **Comment, Review, CustomFilter, EditHistory.** Nothing above line 2063
  refuses them for a file of a private room, so the owner gets true. The
  private-room refusals are Copy, Duplicate, IndexExport, UseChat,
  Vectorization and StartFilling (line 1712) and, for a file, Convert,
  AskAi, Embed, EditAccess and Copy (line 2033).
- **SubmitToFormGallery.** Refused at line 1468 unless the file's category
  is a document, a presentation, a spreadsheet or a PDF form; otherwise it
  reaches the owner's grant. The category of a stored file is its type by
  the extension of its title (`FileDao.SaveFileAsync`,
  `Core/Dao/TeamlabDao/FileDao.cs` line 704, with `File.FilterType`,
  `Core/Entries/File.cs` line 159). An encrypted upload keeps its
  extension, so docx, xlsx and pptx give true. A PDF becomes a PDF form
  when `FileChecker.CheckExtendedPDFstream` (`Utils/FileChecker.cs` line
  57) finds bit 0x02 in the flags byte, offset 6, of a `DSE3` header;
  otherwise its category is plain PDF and the right is false.
- **FillForms.** False for a file that is not a PDF (line 1266); for a PDF,
  false in a room that is not a form-filling room (line 1880). The mock's
  room is a custom room.
- **Filling rights.** StartFilling is refused in a private room (line
  1712); FillingStatus, ResetFilling and StopFilling are false for a file
  that is not a PDF (line 1691) and for a PDF outside a form-filling or
  virtual data room (line 1975).
- **OpenForm.** False for a file that is not a PDF (line 1984); a PDF
  reaches the owner's grant.
- **Archive.** The Archive branch (line 2068) passes only Read, Delete,
  ReadHistory, Copy, Move, Download, ReadLinks and IndexExport, so every
  right this change adds or flips is false in an archived room.

Client, as found:

- The mock (`buildFileDto` in
  `packages/shared/__mocks__/handlers/files/encryptedFiles.ts`) answers
  Comment, Review, CustomFilter and SubmitToFormGallery with false in every
  case and has no StartFilling, FillingStatus, ResetFilling, StopFilling,
  OpenForm or AskAi key.
- The client menu removes the custom-filter, form and version entries of
  an encrypted file by intent, whatever the rights say
  (`getEncryptedFileWithheld` in
  `packages/shared/services/private-room/private-menu-rules.ts`, applied in
  `packages/client/src/store/filesStore/contextOptions.helpers.ts`). The
  SDK offers an encrypted file only the entries of its private whitelist
  (`packages/sdk/src/app/(personal-files)/_constants/private-context-options.ts`),
  which has no custom-filter entry. By reading, neither menu changes with
  the new rights; the E2E run of task 1.2 is the check.
- `CommentEditor.tsx` shows its Edit or Add control when
  `security.EditHistory` is true and no version is being edited. Saving
  calls `fetchFileVersions` and then `updateCommentVersion`. It never looks
  at `encrypted`. It is rendered only by the Details view
  (`Details.utils.tsx`).
- `onDownloadMediaFile` in `packages/client/src/pages/Home/MediaViewer/index.js`
  looks the encrypted file up in the folder list, then in `previewFile`,
  and returns without a word when both miss.

## Goals / Non-Goals

**Goals:**

- The mock's file rights equal what the server computes for the room
  owner, key for key, for the cases the mock serves: active and archived,
  private and ordinary, by file type.
- No path in the client or the SDK lets a right the server grants on an
  encrypted file reach a withheld operation.

**Non-Goals:**

- Modelling rights of other roles, of virtual data rooms or of form-filling
  rooms in the mock.
- A new message or a new locale key.

## Decisions

1. **The form-gallery and open-form rights follow the stored title's
   extension.** The mock already derives `viewAccessibility` from the
   extension of `serverTitle`; the same extension decides the category. A
   PDF is a PDF form when the record's bytes start with `DSE3` and bit 0x02
   of byte 6 is set, the rule the server applies to the stored stream; a
   PDF record without bytes is a plain PDF. Alternative: a seed option
   `isForm`. Rejected: it would let a spec state a category the stored
   bytes contradict.
2. **An ordinary room served by the same mock gets the same owner rights.**
   The owner's grant does not depend on the room being private, so Comment,
   Review and CustomFilter are true there too; only the private-room
   refusals differ, as they do today.
3. **The archived overrides are extended, not rebuilt.** The archived
   branch of the mock already lists what the Archive rules take away; the
   new and flipped keys are added to it as false.
4. **The comment editor is withheld by the file's `encrypted` flag, in the
   editor itself.** The control is hidden when the item is encrypted,
   before the right is looked at, the same shape as the version badge.
   Alternative: clearing `EditHistory` when the file list is built.
   Rejected: other code reads the right for what it is, and a rewritten
   right would hide the server's answer from the contract tests' reader.
   The comment text itself stays visible: it is server metadata the client
   already receives.
5. **The media viewer reports the miss with the existing download error.**
   `Common:EncryptionDownloadFailed` is the message the download path
   already shows when nothing can be saved; the owner prefers one short
   message per group of similar cases. Alternative: fetching the file info
   by id and downloading it. Rejected for this change: it is a new request
   path with its own failure cases, and the proposal only stops the silent
   failure.
6. **A spec that fails on the corrected mock is investigated before it is
   touched.** The failure is checked against the server source, and on the
   stand when it needs a live answer. A defect in this repository is fixed
   in a task of this change; one that needs another repository is marked
   `test.fixme` with a pointer to the task that owns it. The mock is not
   changed back.

## Risks / Trade-offs

- [The mock answers as the owner for every signed-in user it plays] → Out
  of scope, unchanged, and stated in the mock's doc comment; a member's
  rights are a separate piece of work.
- [A granted right may surface an entry in a place nobody listed] → Task
  1.2 runs every spec on the mock, and tasks 2.1 and 2.2 add unit cases
  for the two places found by reading.
- [The comment of an encrypted file can no longer be edited by anyone] →
  Intended: the text would be stored in the clear. A comment set before
  this change stays readable.
- [The server keeps granting rights on content it cannot read] → Recorded
  for the backend in the workflow follow-up of tasks.md.
