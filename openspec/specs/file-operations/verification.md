# file-operations — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; E2E
paths omit `packages/client/__tests__/`. Shorthands: `upload/` =
`packages/client/src/store/uploadDataStore/__tests__/`, `CreateEvent` =
`packages/client/src/components/GlobalEvents/CreateEvent.js`, `ConflictResolve` =
`packages/shared/dialogs/conflict-resolve/ConflictResolve.tsx`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Creating a folder** | | |
| Empty name replaced by the default, created in the open folder, error toast, 402 marks the portal unpaid | `CreateEvent:132-185` | CODE-ONLY |
| **Creating a document** | | |
| Default title for an empty name; the editor's create page with folder and title, new tab per setting | `CreateEvent:139-148, 280-328` | CODE-ONLY |
| Markdown created in the open folder and opened in the plugin, not in the editor | `packages/client/src/components/GlobalEvents/__tests__/CreateEvent.test.tsx:417` | UNIT-CONFIRMED |
| Markdown opened in the viewer without the plugin | `CreateEvent:186-222` | CODE-ONLY |
| **Renaming** | | |
| The renamed item is selected again | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.operations.test.ts:42` | UNIT-CONFIRMED |
| **Uploading files and folders** | | |
| Session in parts, finalize once, slot freed and next file chained | `upload/UploadDataStore.chunks.test.ts:94, 141, 212, 780` | UNIT-CONFIRMED |
| At most the allowed number of sessions in flight | `upload/UploadDataStore.chunks.test.ts:1072` | UNIT-CONFIRMED |
| Folder refreshed once; one success toast without errors | `upload/UploadDataStore.finish.test.ts:62, 117, 255` | UNIT-CONFIRMED |
| Session size and parallel limits come from the server | `../server/openspec/specs/file-operations/spec.md`, "Chunked upload session" | SERVER-SPEC |
| **Name clashes on upload** | | |
| `checkUpload` first; conflict dialog when names exist, direct start otherwise | `upload/UploadDataStore.conversion.test.ts:253, 293`; `upload/start.helpers.test.ts:133, 214, 305` | UNIT-CONFIRMED |
| **Cancelling an upload** | | |
| Queue stopped, parts aborted, rows pruned, bar then toast, panel hidden when empty | `upload/UploadDataStore.cancel.test.ts:57, 147, 458`; `upload/UploadDataStore.chunks.test.ts:316, 359` | UNIT-CONFIRMED |
| Finalize completing after cancel shows the file uploaded | `upload/UploadDataStore.chunks.test.ts:401, 545` | UNIT-CONFIRMED |
| **Upload errors and retry** | | |
| A failed file does not stop the rest; aggregate toast | `upload/UploadDataStore.chunks.test.ts:913, 990` | UNIT-CONFIRMED |
| One error verbatim, several summed, quota wins with counters, password warning | `upload/UploadDataStore.finish.test.ts:287, 316, 343, 355` | UNIT-CONFIRMED |
| Retry re-uploads; only finalize again when parts were stored | `upload/UploadDataStore.retry.test.ts:90, 161, 210, 248` | UNIT-CONFIRMED |
| Quota retry re-uploads exactly the quota failures | `upload/UploadDataStore.retry.test.ts:456, 557` | UNIT-CONFIRMED |
| Quota error recognised from status 507, the exception or its text | `packages/shared/utils/uploadErrors.test.ts:41-141` | UNIT-CONFIRMED |
| **Conversion offered on upload** | | |
| Ask first, convert at once when the question is off | `upload/UploadDataStore.conversion.test.ts:158, 191, 217` | UNIT-CONFIRMED |
| Progress shown, retry of a failed or protected conversion | `upload/UploadDataStore.conversion.test.ts:355-562`; `upload/UploadDataStore.retry.test.ts:367, 623` | UNIT-CONFIRMED |
| **Moving and copying** | | |
| Folder selector, conflict check with `checkMoveOrCopyBatchItems`, progress, refresh | `packages/client/src/components/FilesSelector/index.tsx:320-344`; `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.misc.test.ts:47, 56`; `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.operations.test.ts:60` | UNIT-CONFIRMED |
| Form filling room accepts only PDF forms, with the warning | `packages/client/src/components/FilesSelector/index.tsx:254-296` | CODE-ONLY |
| Which destinations accept which entries | `../server/openspec/specs/file-operations/spec.md`, "Checking whether a destination accepts the files" | SERVER-SPEC |
| **The conflict dialog** | | |
| Overwrite / Keep both / Skip, Overwrite preselected; clash wording for files, folders or both | `packages/shared/dialogs/conflict-resolve/ConflictResolve.test.tsx:70, 110, 120`; `packages/client/src/components/dialogs/ConflictResolveDialog/index.tsx:285-365` | UNIT-CONFIRMED |
| Without overwrite: Keep both preselected | `packages/shared/dialogs/conflict-resolve/ConflictResolve.test.tsx:90`; `ConflictResolve:71-123` | UNIT-CONFIRMED |
| Cancel closes | `packages/shared/dialogs/conflict-resolve/ConflictResolve.test.tsx:101` | UNIT-CONFIRMED |
| **Duplicating** | | |
| Duplicate runs and loops the operation | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts:188` | UNIT-CONFIRMED |
| **Moving to the Trash** | | |
| Dialog text: Trash, 30 days, "Don't ask again" | `delete-dialog.spec.ts:140-162` | E2E-CONFIRMED |
| Hint points to My profile → File management | `delete-dialog.spec.ts:164-180` | E2E-CONFIRMED |
| Without the box: asks again, nothing written | `delete-dialog.spec.ts:182-195` | E2E-CONFIRMED |
| Cancel with the box: nothing written, asks again | `delete-dialog.spec.ts:197-211` | E2E-CONFIRMED |
| Confirm with the box: setting off, next Delete runs at once | `delete-dialog.spec.ts:213-231`; `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts:269-298` | E2E-CONFIRMED |
| Item moved to the Trash | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts:227, 234` | UNIT-CONFIRMED |
| **Deleting for good** | | |
| Permanent wording, item named, plural for several; Trash wording kept where it applies | `packages/client/src/components/dialogs/DeleteDialog/__tests__/DeleteDialog.helper.test.tsx:72-113` | UNIT-CONFIRMED |
| Empty Trash of the viewed section, whole Trash without one | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.empty.test.ts:29, 55, 79` | UNIT-CONFIRMED |
| **Restoring from the Trash** | | |
| Restore and Restore all open the folder selector | `packages/client/src/store/ContextOptionsStore.tsx:331-334, 930`; `packages/client/src/components/FilesSelector/index.tsx:229-235` | CODE-ONLY |
| **Operation progress** | | |
| Progress until the server reports completion (download, empty Trash, mark as read) | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.operations.test.ts:28`; `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.empty.test.ts:29`; `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.misc.test.ts:71` | UNIT-CONFIRMED |
| Deletion toast links to the section's Trash; move toast to the destination | `packages/client/src/store/__tests__/SecondaryProgressDataStore.trashToast.test.tsx:100, 128` | UNIT-CONFIRMED |
| Stopped deletion reloads instead of pruning | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts:121, 157` | UNIT-CONFIRMED |
| **Downloading** | | |
| Single file opens its address | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts:96, 789` | UNIT-CONFIRMED |
| Several items or a folder: archive with progress | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts:343, 401, 419`; `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.operations.test.ts:28` | UNIT-CONFIRMED |
| Download as: formats, passwords, Continue disabled until given | `packages/shared/dialogs/download-dialog/DownloadDialog.test.tsx:103-191` | UNIT-CONFIRMED |
| **Locking a file** | | |
| `lockFile` sets and clears the lock | `packages/shared/api/files/index.ts:1161` | CODE-ONLY |
| Who may lock | `../server/openspec/specs/file-operations/spec.md`, "Locking and unlocking a file" | SERVER-SPEC |
| **Versions of a file** | | |
| History, restore, comment, mark as version, delete | `packages/client/src/pages/VersionHistory`; `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.misc.test.ts:86` (finalize) | CODE-ONLY |
| Version rules | `../server/openspec/specs/file-operations/spec.md`, "File versions and their history" … "Deleting versions" | SERVER-SPEC |
| **Marking as read** | | |
| Operation with progress | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.misc.test.ts:71` | UNIT-CONFIRMED |
| **Retry of a document creation from a protected file** | | |
| Retry in the same third-party folder | `convert-password-retry.spec.ts:69` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Moving, copying, uploading and downloading encrypted files | Owned by `private-rooms/file-operations` | `packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.copyDelete.test.ts:74-569`; `upload/start.helpers.test.ts:335-467` |
| A deferred counter reset that can clear an upload started inside its timeout | Pinned as a known race by a unit test; see `openspec/deviations.md` C3 | `upload/UploadDataStore.finish.test.ts:229` |
| The context menu of each file type in My documents | Owned by `room-role-permissions` and `user-type-permissions` | `files-context-menu.spec.ts` |
