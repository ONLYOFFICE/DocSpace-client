# Proposal

## Why

The private-rooms client UI is functionally complete but ships several rough edges that a tester hits within minutes: English strings that bypass i18n, opaque UUID names in the New-files panel and History before the name cache is warm, no decrypted download for folders, key dialogs without accessibility attributes or a mobile layout, a delete-key warning that does not say what is lost, and a bulk header menu without "Download without decryption". None of these needs a product decision; they block a release on polish grounds only.

## What Changes

- Every user-visible error on the encrypted create, download and open paths goes through an i18n key; `defaultValue` English fallbacks on existing keys are removed.
- Encrypted file names are resolved in the New-files panel, in History when the cache is cold, and in notifications that name a file, the same way Details does.
- Folders inside a private room get a decrypted "Download" that builds a zip on the client from decrypted files, reusing the multi-file zip path; "Download without decryption" stays as the alternative.
- The delete-key confirmation lists the private rooms whose files become unreadable once the user's only key is deleted.
- Key dialogs (passphrase, recovery phrase, key change, passphrase change, reset) get dialog roles, labelled inputs and an aside variant on narrow screens.
- The bulk header menu in a private room gets "Download without decryption".

Found on a local portal on 2026-10-22 and added here:
- the Copy and Move dialogs list encrypted files by their opaque server titles; they get the decrypted names the feeds get, through a title resolver that ui-kit has to offer first (external dependency on `docspace-ui-kit-react`);
- the Move dialog of a private room, pinned to that room, warns that files will be saved decrypted; the warning is dropped there.

Also found on the local portal: the key-change dialog names the peer by user id instead of display name, and the empty private room view nests a list inside a paragraph.

Out of scope: any change to the encryption model or transfer rules (see `private-rooms-upload-fail-closed`), the SDK surface (see `private-rooms-sdk-gating-and-parity`), editor behaviour. PDF creation in private rooms stays as it is (decided 2026-10-23, design D3).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/file-operations`: "Create new file in a private room" (localized creation errors), "Feeds show opaque names" (becomes resolved names), "No decrypted folder download" (becomes decrypted folder download), "Download without decryption" (bulk header menu), "Multiple encrypted files download as a decrypted zip" (clashing names get a free suffix), "Context-menu entries withheld for folders in private rooms" (download no longer withheld), "No decrypted folder download in an archived private room" (becomes decrypted folder download there too), "Errors on encrypted paths are localized", "Pickers show resolved names" and "No decryption warning in a Move that stays in the room" (added).
- `private-rooms/key-management`: "Key-change dialog" (names the peer by display name), "Delete a key" (lists affected rooms), "All key dialogs are modal" (becomes accessible dialogs with an aside variant).

## Impact

- Client: `packages/client/src/helpers/encryptedFileCreation.ts`, `packages/client/src/components/GlobalEvents/CreateEvent.js`, `packages/client/src/store/ContextOptionsStore.tsx`, `packages/client/src/store/filesActionsStore/{navigation,download,menu,copyMove}.helpers.ts`, `packages/client/src/store/contextOptionsStore/folderModel.helpers.ts`, `packages/client/src/components/EmptyContainer/EmptyPrivateRoomView.tsx`, `packages/client/src/components/NewFilesBadge/**`, `packages/client/src/pages/Home/InfoPanel/Body/views/History/**`, keys-management flows and the shared key dialogs under `packages/shared/dialogs/**`.
- Locales: new keys in `public/locales/en/Common.json`, translated to all 31 languages.
- Tests: client store unit tests, shared dialog tests, `encrypted-file-ui.spec.ts`, `keys-management.spec.ts`.
- No server or Document Server dependency.
