# file-operations Specification

## Purpose

Defines how the web client creates, uploads, moves, copies, duplicates, restores, deletes and downloads files and
folders, how it settles a name clash, how long-running operations are shown, and the smaller file actions: rename,
lock, versions and marking as read.

Server counterpart: `../server/openspec/specs/file-operations` (what each operation accepts, its limits and results).
Operations called: `createFolder`, `createFile`, `renameFolder`, `updateFile`, `checkUpload`,
`createUploadSessionInFolder`, `uploadAsyncSession`, `finalizeSession`, `checkMoveOrCopyBatchItems`,
`moveBatchItems`, `copyBatchItems`, `duplicateBatchItems`, `deleteBatchItems`, `deleteFile`, `deleteFolder`,
`emptyTrash`, `getTrashFolder`, `bulkDownload`, `getOperationStatuses`, `terminateTasks`, `startFileConversion`,
`lockFile`, `getFileVersionInfo`, `changeVersionHistory`, `updateFileComment`, `restoreFileVersion`,
`deleteFileVersions`, `markAsRead`.

Out of scope: which actions an entry's menu offers to which user (`room-role-permissions`, `user-type-permissions`);
the list, selection and drag gestures (`files-navigation`); opening and creating documents in the editor
(`editor-integration`); the file settings that change these flows, such as storing originals or the delete
confirmation switch (`files-settings`); encrypted files (`private-rooms/file-operations`); the AI rooms (change
`ai-chat-agents-design`).

Implementation: `packages/client/src/store/uploadDataStore`, `packages/client/src/store/filesActionsStore`, the
context options store, `packages/client/src/components/GlobalEvents/CreateEvent.js`,
`packages/client/src/components/FilesSelector`, `packages/client/src/components/dialogs/{DeleteDialog,ConflictResolveDialog}`,
`packages/shared/dialogs/{conflict-resolve,download-dialog}`, `packages/client/src/components/panels/{UploadPanel,ConversionPanel}`,
`packages/client/src/pages/VersionHistory`.

## Requirements

### Requirement: Creating a folder

Creating a folder SHALL ask for its name in the open folder and create it there; an empty name SHALL be replaced by the
default name. A failure SHALL be shown as an error toast, and a refusal for an unpaid portal SHALL bring the portal into
its unpaid state.

#### Scenario: Empty name

- **WHEN** a user confirms the new folder dialog with an empty name
- **THEN** the folder is created with the default name

### Requirement: Creating a document

Creating a document, spreadsheet, presentation or PDF form SHALL ask for its name, use the default title for an empty
one, and open the editor's create page with the open folder and the chosen name, in a new tab when the user opens
files in a new tab. A Markdown file SHALL be created in the folder and opened in the Markdown plugin when it is
enabled, otherwise in the editor's viewer.

#### Scenario: New document

- **WHEN** a user creates a document named "Report"
- **THEN** the editor's create page opens for "Report.docx" in the open folder

### Requirement: Renaming

Renaming a file or folder SHALL save the new title and keep the renamed entry selected.

#### Scenario: Rename a file

- **WHEN** a user renames a file
- **THEN** the list shows the new title and the file stays selected

### Requirement: Uploading files and folders

Uploading SHALL send every file through an upload session in parts and finalize it, running at most the portal's
allowed number of sessions at a time and starting the next queued file as soon as one finishes. The upload panel SHALL
show each file's progress, and a completed upload SHALL refresh the open folder once.

#### Scenario: Four files

- **WHEN** a user drops four files and the portal allows two parallel uploads
- **THEN** no more than two sessions run at a time and all four files are uploaded

#### Scenario: All files uploaded

- **WHEN** the last file of a batch is uploaded without errors
- **THEN** a single success toast is shown and the folder is refreshed once

### Requirement: Name clashes on upload

Before uploading, the client SHALL ask the server which names already exist in the target folder. When some do, the
conflict dialog SHALL offer to overwrite, to keep both or to skip; otherwise the upload SHALL start directly.

#### Scenario: Existing name

- **WHEN** a user uploads a file whose name exists in the folder
- **THEN** the conflict dialog opens before any session starts

### Requirement: Cancelling an upload

Cancelling SHALL stop the queued files and abort the parts in flight, drop the cancelled files from the panel, announce
the cancellation in the progress bar and then in a toast, and hide the panel when nothing is left. A file whose
session finished despite the cancel SHALL be shown as uploaded.

#### Scenario: Cancel all

- **WHEN** a user cancels an upload of several files
- **THEN** no further session starts and the panel reports the cancellation

#### Scenario: Finalize completes after cancel

- **WHEN** the server finalizes a file after its cancellation
- **THEN** the file is shown as uploaded and not as failed

### Requirement: Upload errors and retry

A file that fails SHALL be marked failed while the rest continue. One error SHALL be toasted as is; several SHALL be
summed up in one toast; a quota error SHALL win with the uploaded and total counts; a password-protected file SHALL get
its own warning. Retry SHALL re-upload a failed file, or only finalize again when its parts were all stored, and a quota
retry SHALL re-upload exactly the files that failed for quota.

#### Scenario: Only finalize failed

- **WHEN** every part of a file was stored and only the finalize failed, and the user retries
- **THEN** the client finalizes the stored session instead of uploading again

#### Scenario: Quota exceeded

- **WHEN** some files fail because the storage quota is exceeded
- **THEN** the toast reports the quota with how many files were uploaded of the total

### Requirement: Conversion offered on upload

When uploaded files can be converted to an editable format, the client SHALL ask before converting, unless the user
chose not to be asked, in which case it SHALL convert at once. Conversion progress SHALL be shown, and a failed or
password-protected conversion SHALL be retryable for that file.

#### Scenario: Confirmation suppressed

- **WHEN** a user who turned off the conversion question uploads a convertible file
- **THEN** the file is converted without a dialog

### Requirement: Moving and copying

Move and Copy SHALL open the folder selector, check the chosen destination for name clashes and settle them in the
conflict dialog, then run the operation with its progress shown. A Form filling room SHALL accept only PDF forms and
SHALL say so for any other selection. The open folder SHALL be refreshed afterwards.

#### Scenario: Copy with a clash

- **WHEN** a user copies a file to a folder that holds a file of the same name
- **THEN** the conflict dialog asks whether to overwrite, keep both or skip before the copy runs

#### Scenario: Document into a Form filling room

- **WHEN** a user picks a Form filling room as the destination of a document that is not a PDF form
- **THEN** the selector says that only PDF forms can be moved there

### Requirement: The conflict dialog

The conflict dialog SHALL name what clashes (files, folders or both) and offer Overwrite (merge for folders), Keep both
and Skip, preselecting Overwrite. Where overwriting is not possible it SHALL offer only Keep both, preselected, and
Skip. Cancel SHALL abandon the operation.

#### Scenario: Overwrite not possible

- **WHEN** the dialog opens for a case that cannot overwrite
- **THEN** Overwrite is not offered and Keep both is selected

### Requirement: Duplicating

Duplicate SHALL create a copy of the selected files and folders next to them and show its progress.

#### Scenario: Duplicate a file

- **WHEN** a user duplicates a file
- **THEN** the duplicate operation runs and its copy appears in the folder

### Requirement: Moving to the Trash

Deleting outside the Trash SHALL move the items to the Trash after confirmation. The dialog SHALL say that the item
goes to the Trash and can be restored for 30 days, and offer "Don't ask again", whose hint points to My profile → File
management. Confirming with it ticked SHALL turn the confirmation off; cancelling SHALL change nothing. With the
confirmation off, Delete SHALL run at once.

#### Scenario: Dialog text

- **WHEN** a user presses Delete on a file in My documents
- **THEN** the dialog says the file will be moved to Trash and can be restored for 30 days

#### Scenario: Don't ask again

- **WHEN** the user confirms with "Don't ask again" ticked and later deletes another file
- **THEN** the second file is deleted without the dialog

#### Scenario: Cancel with the box ticked

- **WHEN** the user ticks "Don't ask again" and cancels
- **THEN** the setting is not changed and the next Delete asks again

### Requirement: Deleting for good

Deleting in the Trash, or where entries do not go to the Trash, SHALL warn that the deletion is permanent and name the
item or count the items. Emptying the Trash SHALL clear the Trash of the section being viewed, or the whole Trash when
the view has no section, with its progress shown.

#### Scenario: Several items

- **WHEN** a user deletes three items for good
- **THEN** the dialog uses the plural permanent wording

#### Scenario: Empty the Trash of a section

- **WHEN** a user empties the Trash while viewing the Trash of one section
- **THEN** only that section's Trash is cleared

### Requirement: Restoring from the Trash

Restore SHALL open the folder selector so that the user picks where the items return, and Restore all SHALL do the same
for every item of the Trash.

#### Scenario: Restore one file

- **WHEN** a user chooses Restore for a file in the Trash
- **THEN** the folder selector opens to pick its destination

### Requirement: Operation progress

Long-running operations (move, copy, duplicate, delete, empty Trash, download, mark as read) SHALL show their progress
until the server reports them finished. After a deletion the toast SHALL link to the Trash of the section the items came
from; after a move it SHALL link to the destination folder. When the user stops a deletion, the list SHALL be reloaded
instead of pruned.

#### Scenario: Deletion toast

- **WHEN** a deletion from Rooms completes
- **THEN** the toast's link opens the Trash of Rooms

### Requirement: Downloading

Downloading one file SHALL open its download address. Downloading several items or a folder SHALL build an archive on
the server with its progress shown and then download it. Download as SHALL let the user pick a format per file type and
ask for the passwords of protected files, keeping Continue disabled until each is given or the file is left out.

#### Scenario: One file

- **WHEN** a user downloads a single file
- **THEN** the browser receives the file's address

#### Scenario: Protected file in Download as

- **WHEN** a password-protected file is chosen for conversion and its password field is empty
- **THEN** Continue stays disabled

### Requirement: Locking a file

Lock and Unlock SHALL set and clear the lock of a file for the users who may lock it.

#### Scenario: Lock

- **WHEN** a user locks a file
- **THEN** the file is shown as locked

### Requirement: Versions of a file

The version history SHALL list the versions of a file with their authors, dates and comments, and SHALL let users with
the right restore a version, edit a version's comment, mark a revision as a new version or not, and delete versions.

#### Scenario: Restore a version

- **WHEN** a user restores an earlier version
- **THEN** a new version with that content becomes the current one

### Requirement: Marking as read

Mark as read SHALL clear the new marks of the selected entries and show its progress.

#### Scenario: Room with new files

- **WHEN** a user marks a room with new files as read
- **THEN** the mark-as-read operation runs with its progress shown

### Requirement: Retry of a document creation from a protected file

When a document is created from a password-protected file in a third-party folder, a retry after entering the password
SHALL create it in the same third-party folder.

#### Scenario: Third-party folder

- **WHEN** the creation asks for the source's password and the user enters it
- **THEN** the retry targets the same third-party folder
