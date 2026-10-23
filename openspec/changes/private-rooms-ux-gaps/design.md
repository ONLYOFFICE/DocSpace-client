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
- Folder download parity with file download.
- Dialogs usable with a screen reader and on a phone.

**Non-Goals:**
- Changing the transfer rules, the DSE3 format or the SDK.
- Server-side zip of decrypted content (impossible by design).

## Decisions

**D1. Errors: typed error classes mapped to keys, not string matching.** `encryptedFileCreation.ts` throws an `EncryptedCreateError` with a `code`; `CreateEvent.js` maps the code through `getEncryptionErrorMessage` (already used by Keys management). Download/open catches use the same mapper with `Common:EncryptedOperationFailed` as the generic fallback. Alternative: wrap every throw site in `t()` — rejected, the helpers are store code without a `t` instance.

**D2. Feed names: the shared `useResolvedFileTitle` hook (`packages/shared/hooks/useResolvedFileTitle.ts`) also schedules recovery.** On the branch the hook only reads the filename cache; recovery runs for the file list alone. The hook gains an optional recovery context (user id, room id): for an encrypted file without a cached name it runs the existing single-file recovery (`ensureDecryptedFilename`) when the identity is already unlocked (`SecretStorage.getCached`), and does nothing otherwise, so a feed never raises an unlock prompt. Recovery reads the file header through the file's `viewUrl`. New-files items are file DTOs and carry it. History entries carry it only for some events: the server sets a view URL for moved and updated files and none for a created one (`FileCreateInterpreter` in `../server/products/ASC.Files/Core/Core/History/Interpreters/FileInterpreters.cs`), so for an entry without one the History list loads the file once (`GET files/file/{id}`) to get it, only while unlocked and on a cache miss. Alternatives: build the download URL on the client from the file id, rejected because it ties the client to the server's handler path; recover only entries that carry a view URL, rejected because created files, the most common entry, would stay opaque until the file list is opened.

**D3. Keep PDF creation in private rooms (decided 2026-10-23).** The plan first withheld "New PDF form": a form cannot be filled, started or submitted in a private room, so it seemed a file only to download. The editor edits a PDF itself, so an empty PDF is a document to edit like a docx, xlsx or pptx, and filling is not needed for it to be useful. The create entries, the tiles, the Shift+O hotkey and the mobile PDF toast stay as they are; form filling stays withheld under the forms requirement. Sharing documents of a private room through temporary links or codes, and the research into how the editor handles encrypted documents (`private-rooms-editor-contract`), are what later work on fillable forms would build on.

**D4. Decrypted folder download walks the subtree on the client.** List the folder recursively through the existing folder API, decrypt each file with the multi-file zip pipeline, keep relative paths inside the zip. Files without an access entry are skipped and reported (`Common:EncryptedDownloadPartial`). Memory: the zip is assembled from blobs already held per file; the encryption-core spec accepts whole-file buffering, so a large folder is bounded by the same limit as a large multi-selection. Alternative: refuse folders over N files — not needed until a real limit is hit.

**D5. Dialogs: use the ui-kit `ModalDialog` `displayType` auto-switch (`modal` on desktop, `aside` on mobile) that the rest of the client uses, plus `aria-labelledby` on the dialog and `aria-label`/`htmlFor` on inputs.** The kit already renders `role="dialog"` when given a labelled title; no new component. Visual regression on the shared dialogs is covered by the Playwright keys-management specs with screenshots.

**D7. Pickers resolve names through the app, not inside ui-kit (found on a local portal, 2026-10-22).** The Copy and Move dialogs list encrypted files by their opaque server titles: the picker is `@onlyoffice/apps-ui-kit/selectors/Files`, which fetches its own items and renders `title`, and it cannot import the client's filename cache in `@docspace/shared/services/encryption/filename-cache`. Its props offer no title hook today (`FilesSelector.types`: `onSubmit`, `getIsDisabled`, `getIcon`, ...). ui-kit gains an optional title resolver and a re-render signal; the client passes `resolveDisplayTitle` and schedules recovery like D2, so a locked identity shows opaque names without a prompt. Alternative: decrypt names inside ui-kit. Rejected: ui-kit would need the crypto core and the key state of the app.

The ui-kit side (task 2.3) is commit `73f72534` on `hotfix/v4.0.2` of `docspace-ui-kit-react` and ships in `@onlyoffice/apps-ui-kit` 4.0.2, not published as of 2026-10-23; until then the client builds against a local pack (`pnpm run update-ui-kit`). `FilesSelector` takes three optional props: `resolveItemTitle(file)` returns the title a file row shows, or undefined to keep the server's, and is applied where the rows reach the list, so first and later pages, search and socket updates are covered and the selected file's title in `onSubmit` is the shown one; `itemTitlesVersion` redraws the rows on screen when it changes; `onFilesLoaded(files, { folderId, roomId, isInsidePrivateRoom })` reports each loaded page with the room on its path. File rows carry `encrypted`. Search and sorting still use the server's titles, so a search in the picker matches opaque names; that limit stays. The client (task 2.4) passes `resolveDisplayTitle` for encrypted files, the filename-cache version, and an `onFilesLoaded` that hands the files of a private room to the D2 recovery for that room.

**D8. The pinned Move dialog drops the decryption warning.** A Move from a private room is pinned to that room (`pinnedRootId`), so the "saved in decrypted form" banner describes something that cannot happen there. `getShowEncryptedTransferBanner` shows it for a Copy only.

**D6. Delete-key warning lists the private rooms where the user holds at least one file access entry.** The client operates with one key per user (`private-rooms-single-key`), so every entry the user holds is for that key and no key-id filter is needed; the room listing is the plain private-room list (the rotation runner it used to share is removed by that change). The server has no per-room read of file access entries: `privacyroom/{roomId}/access` returns the members' key pairs, not the wraps (`../server/products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs:245-296`). The caller's entries are read per file with `GET files/{fileId}/access`, which returns the access entries issued to the caller for that file, each naming the public key id it was wrapped for (`../server/products/ASC.Files/Server/Api/FilesController.cs:1228-1251`). Cost: one room list, one listing per room, and up to one access read per encrypted file (a room can stop at its first match). Decided on 2026-10-23: per-file reads with an early exit per room, no cap. Every member of a private room is a recipient of each file wrapped after they joined, so the first encrypted file of a room usually answers it and a room costs about two requests; only a room in which every file left the user out is read to the end. Alternatives: a capped scan that says "at least these rooms", rejected because the typical cost is already low and the wording would need a new key; private rooms with files in them as one request, rejected because it lists rooms in which the user holds no entry; a new server query, not needed for this cost.

**D9. The key-change dialog loads the peer's name itself.** Several mismatch requests come without a display name: the recipients of the upload fan-out (`encryptKeysForRoomMembers`, the upload orchestrator) and of one room-encryption path carry only user ids and keys, so the dialog fell back to the id, while the skipped-member toast looks the name up afterwards (`reportSkippedMembersImpl`). The dialog host in `EncryptionContext` now does the same before it shows a request without a name: one `GET people/{userId}`, then the dialog opens. A failed lookup falls back to the user id, as the toast does. Alternative: pass names from every caller. Rejected: each path would need a members query of its own, and a new path could forget it again.

## Risks / Trade-offs

- [Folder zip of a large tree exhausts memory] → report partial result and keep the ciphertext zip as the fallback; a size cap is a follow-up if hit.
- [Changing dialog display type shifts screenshots] → update screenshots in the same change via `pnpm test:e2e:docker:update-screenshots`.
- [The delete-key warning needs one access read per encrypted file, not per room] → stop per room at the first match and show progress; a cap or a server-side query is the follow-up if large portals make it slow.
- [Translation of 8-10 new keys across 31 languages] → `translate-locales` skill in the same task group; locale tests gate the push.

## Migration Plan

Pure client change; ships with the flag still on. Rollback is a revert.

## Open Questions

- Whether notifications (socket toasts for new files in a private room) should show the resolved name or no name at all; the delta specifies resolved name when unlocked, opaque otherwise, which can be narrowed later without changing the approach.
