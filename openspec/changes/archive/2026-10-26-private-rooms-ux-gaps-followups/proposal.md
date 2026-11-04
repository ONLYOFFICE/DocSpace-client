# Proposal

## Why

The review of `private-rooms-ux-gaps` (archived 2026-10-23), made on 2026-10-26, found no blocker but four places where the branch, its specs and its tests do not say the same thing. Closing them now, while the change is fresh, keeps the main specs an honest description of the branch:

- **Bulk download of a folder still delivers ciphertext.** The context menu of a folder in a private room decrypts it on the client since `private-rooms-ux-gaps` 4.2, but the header menu goes through the selection download, which sends every folder of the selection to the server archive. A folder selected in a private room and downloaded from the header therefore comes back as a zip of ciphertext, and a selection of files and folders produces two archives, one decrypted and one not. "Download without decryption" in the header menu, added by the same change, then gives the same result as "Download" for folders.
- **The spec promises labelled passphrase fields the branch does not have.** "Key dialogs are accessible and adapt to narrow screens" requires "labelled inputs", but the passphrase fields keep their placeholder as their accessible name because the kit's password input forwards no aria attribute (recorded in the archived design D5); the a11y test asserts the placeholder only.
- **The New-files panel asks for the room member keys once per file.** Each row schedules its own name recovery, and every recovery loads `privacyroom/{roomId}/access` anew; the batching added at the end of the change reached History and the pickers, which recover per list, but not the panel.
- **"Download without decryption" shows the raw error.** A failed request is toasted by the shared download before any caller sees it, so the header-menu entry, whose catch passes the error object on, and a folder's context-menu entry, whose catch maps it, both show the raw error, against "Errors on encrypted paths are localized".

Also: the scenario "Decrypted names clash" was added to the delta after its tests were written, so no test carries its name.

## What Changes

- A folder of a private room in a download selection is decrypted on the client like a folder downloaded from its context menu: a single selected folder downloads as `<title>.zip`, a selection of files and folders as one `Files.zip` with each folder's subtree under its name, and no server archive is requested for them.
- The key-management requirement says what the branch does: every input has an accessible name, and the passphrase fields are named by their placeholder, with the kit follow-up recorded in design.md.
- The New-files panel recovers the names of the rows on screen in one batch per list, so the room member keys load once.
- "Download without decryption", in the header menu and in a folder's context menu, shows a failed request through the encrypted-operation mapper.
- The two zip-dedupe tests take the scenario name "Decrypted names clash"; the passphrase a11y test takes the name of the new scenario.

Out of scope:
- the ui-kit change that lets `PasswordInput` take a label (recorded as a follow-up in design.md, done in `docspace-ui-kit-react`);
- mapping the standard header-menu "Download" error, which is shared with every room type;
- the other open changes; the CRLF normalisation of `ItemList.tsx` noted in the review is a repository-wide decision outside this change.

Decisions that need a human: none. The alternatives considered are recorded in design.md.

Server dependency: none. The folder listing and the file access read used to walk a folder are the ones `private-rooms-ux-gaps` already relies on; no new server fact is stated.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`:
  - "Multiple encrypted files download as a decrypted zip" also covers the folders of the selection that lie in a private room, with the scenario "Files and folders selected";
  - "Decrypted folder download" holds for a folder selected alone in the header menu, with the scenario "Folder selected in the header menu";
  - "Errors on encrypted paths are localized" gains the scenario "Download without decryption fails".
- `private-rooms/key-management`:
  - "Key dialogs are accessible and adapt to narrow screens" asks for named inputs instead of labelled ones and states that the passphrase fields carry no label of their own, with the scenario "Passphrase field".

## Impact

- Client: `packages/client/src/store/filesActionsStore/download.helpers.ts` (selection download, the two decrypting zip paths and the error toast of the server archive), `packages/client/src/store/FilesHeaderOptionStore.ts`, `packages/client/src/store/ContextOptionsStore.tsx`, `packages/client/src/components/NewFilesBadge/sub-components/{NewFilesPanelFileList,NewFilesPanelItemFile}.tsx`.
- Tests: `src/store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts`, `src/store/contextOptionsStore/__tests__/ContextOptionsStore.actions3.test.ts`, `src/components/NewFilesBadge/__tests__`, `packages/shared/services/private-room/__tests__/encrypted-download.test.ts`, `packages/shared/dialogs/__tests__/key-dialogs.a11y.test.tsx`, `packages/client/__tests__/private-room-cross-user-download.spec.ts`.
- No locale, server, SDK, doceditor or ui-kit change in this repository.
