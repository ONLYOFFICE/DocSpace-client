# Design

## Context

See proposal.md. Every rewording was checked against the code on
`release/v4.1.0` on 2026-11-24. No statement about `../server` is added or
changed; the one server fact used, that a room's EditRoom and EditAccess rights
both follow the room manager role (`FileSecurity.cs`, the two `case` branches
of `FilesSecurityActions`), only served to drop a finding and appears in no
delta.

What the code does, per rewording:

- Move out of a private room: `copyMove.helpers.ts` shows
  Common:EncryptedMovePartialFailure when the transfer deletes its sources and
  Common:EncryptedCopyFailed otherwise.
- General messages: the decrypting download shows
  Common:EncryptionDownloadFailed (`download.helpers.ts`), the media viewer
  Common:EncryptionDecryptPartialFailed, the download without decryption
  Common:EncryptedOperationFailed through `getEncryptedOperationErrorMessage`.
- Archives: the folder archive names skipped files with
  Common:EncryptedDownloadPartial, the multi-file archive with
  Files:DecryptPartialFailed (`download.helpers.ts`).
- Room notice: a recorded file is skipped by name recovery and stays recorded
  until the filename cache is cleared (`encrypted-filename-recovery.ts`,
  `filename-cache.ts`).
- Device setup hint: shown when the key list is loaded and holds no key
  (`EncryptionProviderWrapper.jsx`).
- Key setup: `KeySetupDialog.tsx` asks before closing only on the passphrase
  step with input and on the recovery step without the acknowledgement.
- Import: `useImportKeyFlow.tsx` returns while the user has a key.
- Tab order: the render order of `KeysManagement.tsx`.
- Recovery block: `useRecoverKeyFlow.tsx`, `available` is true while the key
  list holds a key.
- Ghost-state toast: `useResetKeysFlow.tsx` clears the session gate.
- SDK re-import: `useEncryptedUpload.ts` calls the shared orchestrator, whose
  `prepareReimport` decrypts and encrypts again.
- SDK backfill: `PrivateRoomFilesStore.tsx` calls the shared
  `backfillEncryptedFilesForRoomMembers`, which reads the missing-keys list.
- SDK header menu: `useContextMenuModel.ts` adds the entry for one selected
  encrypted file only.
- Sidebar: `ClientArticleSidebar/index.tsx`, the item after Private has the
  label Common:AIChat.
- Dashboard card: `Dashboard/index.tsx` and `AppsStore.ts`, states on, off
  and none.
- Frame: `AppsStore.isPrivateRoomsSectionAvailable` returns false in a frame
  without the opt-in.

## Goals / Non-Goals

**Goals:**

- Text that matches the branch, with the smallest edit that makes it so.

**Non-Goals:**

- Renaming requirements or scenarios.

## Decisions

1. **MODIFIED blocks built from the main specs by script.** Each delta is the
   whole current requirement with the listed fragments replaced, so no
   scenario is lost at the archive.
2. **Requirements that an unarchived change carries are left alone.** A
   rewording here would be overwritten by that change's older copy when it is
   archived. The four are named in proposal.md.
3. **The Purpose of `sdk-surface` is edited in the main spec.** A delta cannot
   carry the Purpose of an existing capability.

## Risks / Trade-offs

- [A later change copies one of these requirements from an old checkout] →
  its archive would bring the old wording back; the review of that change has
  to catch it, as for any MODIFIED delta.
