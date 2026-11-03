# Proposal

## Why

The pre-PR review of the branch on 2026-11-03 found seven defects that
testers would hit as soon as the branch reaches the release branch:
- one loses access to files;
- one blanks the SDK private pages;
- two leave encrypted uploads in a wrong state after a cancel;
- three break the key dialogs.

Each was re-checked against the code before this proposal, and the server
facts it relies on against the server source. They are fixed before the PR is
opened, so the review of the PR starts from a branch without known blockers.

## What Changes

- **Key list not loaded is not "no key"** (review H2).
  - A failed or pending load of the user's own key list no longer counts as
    "the user has no key". Key generation and import are offered only after
    the server answered with an empty list.
  - Otherwise, the list is fetched again. If that fails,
    Common:EncryptionKeysLoadFailed is shown with Common:TryAgain on the keys
    page, and nothing is offered.
  - Covers the client's create-room flow and keys page, and the SDK
    private-room creation, whose key store turned a failed load into an
    empty list.
- **The SDK private pages keep the host opt-in** (review H3). Sorting,
  searching or clearing the filters of the private list or its archive no
  longer drops `privateRooms` from the address. A later navigation or a reload
  of the frame stays on the private surface.
- **Cancelling an encrypted upload is honest** (review M1 and M2).
  - Once the ciphertext is stored, a cancel no longer interrupts the wrap
    stage. The file is shared with the uploader and the members as for any
    upload and reported as uploaded, or, if sharing fails, reported as shared
    with nobody.
  - Before that point, a cancel ends as cancelled, never as an error, whether
    the chunks go one by one or in parallel. The upload session is aborted.
- **One dialog per key change** (review M4). Each queued key-change request
  opens its own dialog, which takes the focus and shows its own fingerprints.
  An action can no longer answer a request the user has not seen.
- **A peer name that cannot be read stays silent** (review M5). The name
  lookup of the key-change dialog no longer triggers the page's access-denied
  handling. The dialog falls back to the user id, as the spec already allows.
- **Cancelling key generation closes a private-room creation** (review M6).
  A cancel inside the passphrase or recovery-phrase dialog closes the
  private-room creation it started from, as the room-membership spec already
  requires for a cancel of the prompt.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`:
  - "Generate a new key" and "Import a key" are offered only for a key list the
    server answered as empty;
  - "Key-change dialog" names the peer without access-denied side effects;
  - "Key dialogs take the focus when they open" covers a queued key-change
    request.
- `private-rooms/room-membership`: "Starting private room creation without a
  key starts key generation" covers a cancel inside generation and a key list
  that could not be loaded.
- `private-rooms/file-operations`: a new requirement for cancelling an
  encrypted upload.
- `private-rooms/sdk-surface`: a new requirement that the private pages keep
  the host opt-in through list sorting, search and filter changes.

## Impact

- **Client:**
  - `CreateRoomDialog.js`: key checks;
  - the keys page `KeysManagement.tsx`;
  - `uploadDataStore/chunkUpload.helpers.ts`: the cancel watcher and the
    result handling.
- **Shared:**
  - `services/private-room/encrypted-upload-orchestrator.ts`: cancel stages;
  - `hooks/usePrivateRoomKeyGate.ts`;
  - `dialogs/key-generation/useGenerateKeyFlow.tsx`: a cancel callback;
  - `context/encryption/EncryptionContext.tsx`: the key-change queue and the
    name lookup;
  - `api/people/index.ts`: a lookup that skips the forbidden handling;
  - the locales: one new Common key.
- **SDK:**
  - `(private)/_store/EncryptionIdentityStore.tsx`: load errors;
  - `(private)` opt-in helpers and hooks;
  - the `(rooms)` URL writers used by the private list: `useRoomsFilter`,
    `rooms-list`, `empty-view`.
- **Server (`../server`):** no work. The name lookup goes to
  `GET people/{userId}` (`UserController.GetProfileByUserId`), which refuses a
  User or Guest caller with `SecurityException` through
  `UserManager.CanUserViewAnotherUserAsync` (`UserExtensions.cs:184`). The
  envelope create route stores any new id, as `private-rooms/server-contract`
  "Key envelope creation" states.
- **Document Server:** no work.

## Out of scope

- The other findings of the review: the lock wiping an in-use key, the SDK
  personal-files address, M3 and M7 to M12, the zip entry names, and the low
  and nit items. They are tracked for the beta in a later change.
- Deleting a stored file after a cancel. The design keeps it and completes its
  wraps instead (design decision 2).
- The ui-kit swipe-to-close behaviour of key dialogs.

## Decisions needed

None. The approach for each fix is in design.md; no product decision is
involved.
