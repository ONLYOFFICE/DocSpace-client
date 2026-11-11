# Proposal

## Why

The client reads the user's key list once at start-up and again when the
files section initialises; both reads swallow a failure and leave
`UserStore.encryptionKeys` at `null`. Everything in a private room then
reads that `null` as "the user has no key": every encrypted file gets the
no-access lock, the room greets the user with
Common:EncryptionKeysNotConfigured and the device-setup hint, and download,
copy, upload and file creation are refused as for a user who never set up
a key. A user who does hold a key is told to set one up because one
request failed. The SDK already tells the two states apart
(`sdk-surface`, "Private room creation waits for a known key list"), and
so do Keys management and private room creation in the client.

## What Changes

- The client passes `keysLoaded` to `EncryptionProvider`, false while its
  key list is `null`, as the SDK does. The provider no longer assumes a
  loaded list for the client.
- A list that is not known is not treated as an empty one inside a private
  room:
  - no no-access lock on encrypted files, and their menus keep the open
    and download entries;
  - no Common:EncryptionKeysNotConfigured toast and no device-setup hint.
- Entering a private room with an unknown list reads it again. When that
  read fails, the room shows the error toast
  Common:EncryptionKeysLoadFailed with a Common:TryAgain link; the link
  reads the list again, and a successful read brings the room to its
  normal state (unlock prompt, decrypted names) without a page reload.
- Download (single, zip, folder), copy and move, upload and file creation
  read an unknown list again before they decide. When the read fails they
  report Common:EncryptionKeysLoadFailed and do nothing; they refuse as
  for a user without a key only when the list is known to be empty.

No user-facing string is added: Common:EncryptionKeysLoadFailed ("Could
not load your encryption keys. Check your connection and try again.") and
Common:TryAgain exist and are translated.

Out of scope:

- The editor page (`packages/doceditor`), whose key errors are card C8.
- The locked-key banner of card C7.
- The SDK, which already carries the flag.
- Retrying the start-up read on its own; the list is read again when the
  user enters a private room or starts an action there.

Depends on: nothing in `../server` or the Document Server. The change
states nothing about server behaviour.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: "Opening without keys is withheld" and
  "Entering a private room without keys warns" apply to a list known to
  be empty; a new requirement covers the actions that read an unknown list
  again.
- `private-rooms/key-management`: "Device setup hint on entering a private
  room without keys" waits for a known list in the client too.

## Impact

- `packages/shared/store/UserStore.ts`: one deduplicated "read the list if
  it is not known" action.
- `packages/client/src/components/EncryptionProviderWrapper.jsx`,
  `ItemIcon.tsx`, and the helpers of `filesStore` (fetch, context
  options), `filesActionsStore` (download, copy/move), `uploadDataStore`
  and `GlobalEvents/CreateEvent.js`, with their unit tests.
- An E2E case in `packages/client/__tests__/private-room-access.spec.ts`
  with a failing key-list handler.
- No API, locale or dependency change.
