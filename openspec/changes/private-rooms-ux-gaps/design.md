# Design

## Context

See proposal.md for motivation. Observed state on the branch:

- `packages/client/src/helpers/encryptedFileCreation.ts:115-122` throws plain English `Error`s that `packages/client/src/components/GlobalEvents/CreateEvent.js:225` passes straight to `toastr.error`.
- `packages/client/src/store/filesActionsStore/navigation.helpers.ts:715` and `packages/client/src/store/ContextOptionsStore.tsx:364-501` catch encrypted download/open failures with `toastr.error(err as string)`; `packages/client/src/store/filesActionsStore/copyMove.helpers.ts:260` and `packages/client/src/components/FilesSelector/index.tsx:648-654` carry English `defaultValue` fallbacks for keys that already exist in `public/locales/en/Common.json` (`EncryptedTransferBannerTitle/Description`).
- History already reads the name cache (`packages/client/src/pages/Home/InfoPanel/Body/views/History/HistoryBlockContent/ItemList.tsx:128`) but never triggers recovery, so a cold session shows UUIDs; the New-files panel (`packages/client/src/components/NewFilesBadge/**`) has no resolution at all.
- "New PDF form" is built for private rooms in `packages/client/src/store/contextOptionsStore/folderModel.helpers.ts:389` and in `EmptyPrivateRoomView.tsx`, while every form action is withheld by `packages/client/src/store/filesStore/contextOptions.helpers.ts`.
- Folder download in a private room is ciphertext-only (`ContextOptionsStore.tsx:498-501`); decrypted multi-file zip exists in `packages/client/src/store/filesActionsStore/download.helpers.ts`.
- `packages/shared/dialogs/passphrase-modal/PassphraseModal.tsx` and `packages/shared/dialogs/key-change-dialog/KeyChangeDialog.tsx` contain zero `aria-`/`role` attributes and force `ModalDialogType.modal`; the stashed `AUDIT_FRONTEND.md` lists this as open item BL-12.
- The bulk header menu for private rooms (`packages/client/src/store/filesActionsStore/menu.helpers.ts:239`) offers download, move, delete and info only.
- `useDeleteKeyFlow.tsx:141` shows a generic `Common:DeleteKeyWarning`.

## Goals / Non-Goals

**Goals:**
- Zero English literals on encrypted paths; every toast resolvable to a Common key.
- Names resolved wherever a file name is displayed, not only in the file list.
- Remove dead-end entries (PDF form) rather than explain them.
- Folder download parity with file download.
- Dialogs usable with a screen reader and on a phone.

**Non-Goals:**
- Changing the transfer rules, the DSE3 format or the SDK.
- Server-side zip of decrypted content (impossible by design).

## Decisions

**D1. Errors: typed error classes mapped to keys, not string matching.** `encryptedFileCreation.ts` throws an `EncryptedCreateError` with a `code`; `CreateEvent.js` maps the code through `getEncryptionErrorMessage` (already used by Keys management). Download/open catches use the same mapper with `Common:EncryptedOperationFailed` as the generic fallback. Alternative: wrap every throw site in `t()` — rejected, the helpers are store code without a `t` instance.

**D2. Feed names: a shared `useResolvedFileTitle` hook already exists in `packages/shared/hooks/useResolvedFileTitle.ts`.** New-files panel items and History items use it; it reads the cache and schedules recovery when unlocked, so no new recovery trigger is invented. While locked it returns the raw title and never prompts (feeds must not raise unlock dialogs).

**D3. Withhold "New PDF form" in private rooms (recommended).** The alternative, keeping creation and adding a "cannot be filled" hint, produces files that only exist to be downloaded. Removing the entry also deletes the mobile PDF toast path. Flip by changing the "Create menu opened" scenario if the product owner disagrees.

**D4. Decrypted folder download walks the subtree on the client.** List the folder recursively through the existing folder API, decrypt each file with the multi-file zip pipeline, keep relative paths inside the zip. Files without an access entry are skipped and reported (`Common:EncryptedDownloadPartial`). Memory: the zip is assembled from blobs already held per file; the encryption-core spec accepts whole-file buffering, so a large folder is bounded by the same limit as a large multi-selection. Alternative: refuse folders over N files — not needed until a real limit is hit.

**D5. Dialogs: use the ui-kit `ModalDialog` `displayType` auto-switch (`modal` on desktop, `aside` on mobile) that the rest of the client uses, plus `aria-labelledby` on the dialog and `aria-label`/`htmlFor` on inputs.** The kit already renders `role="dialog"` when given a labelled title; no new component. Visual regression on the shared dialogs is covered by the Playwright keys-management specs with screenshots.

**D6. Delete-key warning lists rooms by calling the same private-room listing the rotation runner uses**, filtered to rooms where the key id appears in at least one file access entry. The server has no per-room read of file access entries: `privacyroom/{roomId}/access` returns the members' key pairs, not the wraps (`../server/products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs:245-296`). The caller's entries are read per file with `GET files/{fileId}/access`, which returns the access entries issued to the caller for that file, each naming the public key id it was wrapped for (`../server/products/ASC.Files/Server/Api/FilesController.cs:1228-1251`). Cost: one room list, one listing per room, and up to one access read per encrypted file (a room can stop at its first match). Whether that cost is acceptable for large portals, or needs a bound, is open (see Open Questions).

## Risks / Trade-offs

- [Folder zip of a large tree exhausts memory] → report partial result and keep the ciphertext zip as the fallback; a size cap is a follow-up if hit.
- [Changing dialog display type shifts screenshots] → update screenshots in the same change via `pnpm test:e2e:docker:update-screenshots`.
- [The delete-key warning needs one access read per encrypted file, not per room] → stop per room at the first match and show progress; a cap or a server-side query is the follow-up if large portals make it slow.
- [Translation of 8-10 new keys across 31 languages] → `translate-locales` skill in the same task group; locale tests gate the push.

## Migration Plan

Pure client change; ships with the flag still on. Rollback is a revert.

## Open Questions

- Cost of the affected-rooms list (D6): the server offers no per-room read of file access entries, so the warning reads the caller's entries file by file. Options: accept the per-file reads with early exit per room, cap the scan and say "at least these rooms", or ask the backend for a query that returns the rooms where a public key id holds entries. Owner: product owner with the backend team. Does not change the delta spec; blocks task 5.1.
- Whether notifications (socket toasts for new files in a private room) should show the resolved name or no name at all; the delta specifies resolved name when unlocked, opaque otherwise, which can be narrowed later without changing the approach.
