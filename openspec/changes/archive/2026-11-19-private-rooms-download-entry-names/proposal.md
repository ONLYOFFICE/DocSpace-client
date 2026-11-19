# Proposal

## Why

A decrypted download hands file names to the user's file system: the name
the browser suggests when it saves one file, and the entry paths of the zip
it saves for several files or a folder. The main specs say that these names
are the original names and that clashes are renamed, but not what makes a
name usable as a file name on every system the archive may be extracted on,
nor that the clash rule of the archive matches the one a private room
already applies to names ("Name clashes in a private room are checked on the
client"). This change writes those rules down and keeps them in one helper
shared by the client and the SDK.

The SDK also saves a single selected encrypted file differently from the
client; the change brings it in line.

## What Changes

- Every name that leaves the client for the file system after decryption,
  the suggested name of one saved file, each entry of a decrypted archive
  and the name of the archive itself, is a plain file name: one path
  segment, without separators, parent or current directory references,
  drive prefixes, characters that common file systems reject, control or
  text-direction characters, trailing dots or spaces and reserved device
  names, and within the length a file system accepts. When nothing usable is
  left, the next known name is taken, ending with the file's id.
- The directories of a decrypted archive come only from the folders the
  client walked, one directory per folder, each named by the same rule; a
  file name never adds a directory.
- Inside one directory of an archive, names that differ only in letter case
  are treated as the same name, for files and folders alike, as the
  name-clash rule of a private room already does; the later one takes the
  lowest free numbered suffix.
- The SDK saves a single selected encrypted file as the file itself, as the
  client does, instead of an archive holding it.

Out of scope:

- The names shown in lists, pickers, feeds, the info panel and the editor
  caption. They keep the decrypted name as it is (owner, 2026-11-19);
  design.md records why.
- The document title handed to the editor configuration. The editor encrypts
  a saved version under that title, so normalising it would rename the file
  at its next save (design.md, decision 5).
- Names handed to the server when a file is copied or moved out of a private
  room, and downloads that do not decrypt, which the client requests from
  the server without handling any name itself.
- File names in the SDK beyond the two download paths it has: folder
  downloads stay refused there ("Mixed and folder downloads refused").

## Decisions

1. Taken by the owner on 2026-11-19: the displayed name stays the decrypted
   name as it is (design.md decision 6).
2. Not part of this change: whether names the Document Server uses for its
   own saves from the editor menus need a rule of their own. That needs
   Document Server knowledge the client does not have and is left to a
   separate change if wanted.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: two requirements added ("Saved names are
  plain file names", "Archive directories come from the folder tree"), three
  modified ("Download decrypts on the client", "Multiple encrypted files
  download as a decrypted zip", "Decrypted folder download").
- `private-rooms/sdk-surface`: one requirement added ("SDK saved names follow
  the client rules"), one modified ("Encrypted file actions shared with the
  generic views").

## Impact

- New shared helper `packages/shared/services/private-room/safe-file-name.ts`
  with its unit tests.
- `packages/shared/services/private-room/encrypted-download.ts` (the name of
  a decrypted file, the archive builder, the clash rule of the archive) and
  `packages/shared/services/private-room/encrypted-name-clash.ts` (takes its
  comparison key from the helper, behaviour unchanged).
- `packages/client/src/store/filesActionsStore/download.helpers.ts` (folder
  walk and archive entries).
- `packages/sdk/src/app/(private)/_hooks/useEncryptedDownload.ts` and
  `packages/sdk/src/app/(docspace)/_hooks/useDownloadActions.ts`.
- Unit tests next to each; the existing E2E spec
  `packages/client/__tests__/private-room-cross-user-download.spec.ts` is
  run again unchanged.
- No new user-facing text, so no locale work.
- Nothing from `../server` or the Document Server: every name in question is
  produced and consumed in the browser.
