# Design

## Context

Read in the client code on 2026-11-19 at `54bed4b404d`. No stashed design
document covers file names on download, and nothing here concerns
`../server` or the Document Server: every name in question is produced and
consumed in the browser.

Where the names of a decrypted download are produced:

- `packages/shared/services/private-room/encrypted-download.ts`:
  `decryptDownloadedFile` builds the `File` of one decrypted file from the
  name in the container header, with `originalFileName` as the fallback the
  caller passes; `downloadAndDecryptFileToBuffer` hands that name on;
  `createZipFromBuffers` writes the archive; `deduplicateFileNames` is the
  clash rule of an archive; `triggerFileDownload` hands a blob and a name to
  the browser.
- `packages/client/src/store/filesActionsStore/download.helpers.ts`: the
  single download (`downloadEncryptedFileImpl`, also reached from the media
  viewer), and the archives of a selection and of a folder
  (`downloadDecryptedZipImpl`, with `listFolderTree` walking the folders and
  `toZipEntries` applying the clash rule per directory). The archive of a
  folder is named after the folder's title.
- `packages/sdk/src/app/(private)/_hooks/useEncryptedDownload.ts`: the SDK's
  single download and its flat archive; `useDownloadActions.ts` in
  `(docspace)/_hooks` decides between them for a selection.
- `packages/shared/services/private-room/encrypted-name-clash.ts`: the
  name-clash rule of a private room, which compares names without regard to
  letter case (`nameKey`).
- The list shows the decrypted name from the per-tab filename cache
  (`resolveDisplayTitle`, `useResolvedFileTitle`), filled by
  `encrypted-filename-recovery.ts` in the client and the SDK and by
  `useFileEncryptionKeys.ts` in the editor.

Downloads that do not decrypt, of plain files and of ciphertext, are
requested from the server (`downloadFiles`, or the file's view URL) and do
not pass through any of this.

## Goals / Non-Goals

Goals: the behaviour of the two deltas, one helper that holds the name
rule, one archive builder used by the client and the SDK, and unit tests
named after the scenarios with the full table of name shapes.

Non-goals: the names shown in the product (decision 6); the title handed
to the editor (decision 5); names handed to the server on copy or move out
of a private room; a limit on the length of a whole archive path; empty
folders in an archive; new texts.

## Decisions

1. **One helper, `packages/shared/services/private-room/safe-file-name.ts`.**
   It exports `toSafeFileName(...candidates)` and `fileNameKey(name)`.
   `toSafeFileName` applies the rule below to each candidate in turn and
   returns the first one that is not empty afterwards, `_` when none is
   left (callers always end the list with an id, so `_` is not reached in
   practice). The rule, in this order:
   1. Unicode NFC.
   2. Leave out C0 controls (U+0000 to U+001F), DEL (U+007F), C1 controls
      (U+0080 to U+009F) and the text-direction characters U+200E, U+200F,
      U+202A to U+202E and U+2066 to U+2069.
   3. Replace each of `/ \ : * ? " < > |` with `_`.
   4. Trim whitespace at both ends, then strip trailing dots and spaces
      until none is left; a name made of dots ends up empty here.
   5. If the part before the first dot, without trailing spaces, is CON,
      PRN, AUX, NUL, COM1 to COM9 or LPT1 to LPT9 in any letter case, put
      `_` in front.
   6. If the name takes more than 255 bytes in UTF-8, shorten the part
      before the extension (from the last dot that is not the first
      character, when the extension takes at most 32 bytes; otherwise the
      whole name) at a code point boundary until the whole fits, then
      apply step 4 again to the shortened part.

   The rule is idempotent: a name it returns comes back unchanged from a
   second pass. Decision 4 and `triggerFileDownload`, which applies the rule
   to names already made plain, rely on that.

   `fileNameKey` is `name.toLowerCase()`, the key the name-clash rule of a
   private room already uses; `encrypted-name-clash.ts` imports it instead
   of its local `nameKey`, which changes nothing there. The helper sits
   under `services/private-room` because only decrypted downloads hand a
   name to the browser themselves.

2. **Which candidates, in which order.** A single decrypted file:
   the name from the container header, then the name the caller passes
   (`originalFileName`: the title the server stores, `file.title` in the
   client and the item title in the SDK, in every path), then the file id.
   The shown name from the filename cache is not a candidate: the cache
   holds the header name, so a header name of which nothing is left would
   skip the stored title. It stays the name in the text of a partial
   failure. `decryptDownloadedFile` names its `File` this way, so the
   client, the media viewer and the SDK get the same name without a step of
   their own. A folder: its title, then its id. The archive of a folder: the
   folder's name by the same rule, followed by `.zip`. `triggerFileDownload`
   passes the name it is given through `toSafeFileName` as well, with
   `download` as the last candidate, so no caller can hand the browser a
   name that skipped the rule.

3. **One archive builder for the client and the SDK.**
   `encrypted-download.ts` gets `toArchiveEntries(items)`. Each item carries
   its decrypted data, its file name candidates and its folder chain, a list
   of `{ id, title }` from the folder the user picked down to the file's
   own folder (empty for a file at the root). The builder groups the items
   by directory: the children of one directory are its folders, each once,
   in the order their ids first appear, and its files, in order. It names
   the children of each directory with one call of `deduplicateFileNames`,
   which compares by `fileNameKey` and reserves every name listed in the
   directory before it picks a suffix, so "Decrypted names clash" keeps
   giving the clashing file ` (2)` when ` (1)` is listed. The suffix is
   built with `addCopySuffix` of `encrypted-copy.ts`, the suffix of the
   name-clash rule. When a suffixed name would take more than 255 bytes,
   the part before the suffix is shortened so that the suffix and the
   extension stay. Entry paths are the directory names joined with `/` plus
   the file name. The client's
   `toZipEntries` goes away; `listFolderTree` records the folder chain with
   ids instead of a path string; the SDK passes items with an empty chain.
   Rejected: keeping two builders and only adding the helper to each. The
   rule of "Archive directories come from the folder tree" would then live
   twice. Rejected: one set of names given out so far per directory,
   without reserving the listed ones. Files "a.txt", "a.txt" and
   "a (1).txt" would then end as "a.txt", "a (1).txt" and
   "a (1) (1).txt". Rejected: passing a suffixed name through the length
   step. For a name of 255 bytes the step cuts the suffix off again and
   returns the name it started from.

4. **The writer accepts only built paths.** `createZipFromBuffers` checks
   that every entry path is a `/`-joined list of non-empty segments, each
   equal to `toSafeFileName` of itself, and throws otherwise. Only a
   programming error reaches it; the download then fails with
   Common:EncryptionDownloadFailed like any other error of the archive
   step. This keeps the rule in force for a future caller that does not use
   `toArchiveEntries`.

5. **The editor title stays as it is.** `Editor.tsx` hands the decrypted
   name to the editor configuration as `document.title`, and the editor
   encrypts a saved version under that name (`encryptFile` with `fileName`,
   recorded under "Save" in the design of
   `private-rooms-editor-contract`). Normalising it would rename the file in
   its container header at its next save. The editor's name recovery
   (`useFileEncryptionKeys.ts`) therefore does not use the helper. Whether
   names the Document Server uses for saves from its own menus need a rule
   is decision 2 of the proposal and needs Document Server knowledge.

6. **The shown name stays the decrypted name (owner, 2026-11-19).** Lists,
   pickers, feeds, the info panel, client search and the editor caption keep
   the name from the filename cache as it is; only names leaving for the
   file system are normalised. Reasons: the shown name is the one the
   name-clash check compares and the one users search for, so a normalised
   display would let two different-looking names be the same file and make
   search miss; React renders it as text; and normalising at the exits
   covers every exit with one rule, while the cache has three writers (client,
   SDK, editor). Not taken: dropping only control and text-direction
   characters from the shown name, which would be a small separate change
   to `resolveDisplayTitle` and the cache writers.

7. **The SDK saves one selected file as a file.** `downloadFromSelection` in
   `useDownloadActions.ts` calls `encryptedActions.downloadFile` when the
   selection holds exactly one encrypted file, and `downloadZip` for two or
   more, as the client's `downloadActionImpl` does.

## Test plan

Unit tests carry the scenario names of the deltas.

- `services/private-room/__tests__/safe-file-name.test.ts`: one case per
  scenario of "Saved names are plain file names" except "Name shown in the
  list", each with a table of inputs and expected outputs: ordinary names
  (with and without extension, dotfiles, non-Latin letters, a name in NFD
  that comes out in NFC), separators at the start, the middle and the end,
  `..` and `.` with and without a separator, drive prefixes with either
  separator, each rejected character, each control range and each
  text-direction character, leading and trailing spaces, trailing dots,
  each reserved device name in mixed case with and without extension and
  with a trailing space before the dot (and `CONSOLE.txt`, `COM10` and
  `LPT0` left alone), names of 255 and 256 bytes with one-, two-, three-
  and four-byte characters at the cut, an extension longer than 32 bytes,
  and the candidate order (empty, dot-only and control-only names falling
  through to the next candidate and to `_`). Every output of the table
  passed through the rule a second time comes back unchanged. A case for
  `fileNameKey`.
- `services/private-room/__tests__/encrypted-download.test.ts`:
  `toArchiveEntries` with the cases of "Archive directories come from the
  folder tree" and "Names that differ only in case", the existing
  "Decrypted names clash" cases kept and run through it, a clash of a name
  of 255 bytes keeping its suffix; `createZipFromBuffers` refusing a path
  with an empty, `..` or unnormalised segment and round-tripping a built
  one through fflate; `decryptDownloadedFile` naming its file by the
  candidates; `triggerFileDownload` with a name that needs the rule.
- `services/private-room/__tests__/upload-download.integration.test.ts`:
  a file encrypted under a name holding separators and control characters
  and decrypted with the real format comes out under the plain name.
- Client: `store/filesActionsStore/__tests__/FilesActionsStore.deleteDownload.test.ts`
  for the archive and single-file scenarios through the store.
- SDK: `useEncryptedDownload.test.tsx` and `useDownloadActions.test.tsx`
  for the sdk-surface scenarios.

## Risks / Trade-offs

- A file saved from a decrypted download can carry a name that differs from
  the one shown in the list. Accepted: it happens only for names that would
  not be usable on some file system, and the list keeps the name the
  uploader gave.
- The rule follows the strictest common file system (Windows) for every
  user, so a name valid on the user's own system can still change. Accepted:
  an archive is often extracted elsewhere than where it was saved.
- Comparing names with `toLowerCase()` does not fold every case pair a file
  system may fold (for example the Turkish dotless i). Accepted: the same
  key is used by the name-clash rule, and both stay consistent.
