# Proposal

## Why

An encrypted upload stores the ciphertext first and writes the uploader's
access entry afterwards. When that write fails, the file stays on the
server with no entry at all and its key is wiped from memory: nobody can
ever decrypt it, the uploader included. The client marks the row "uploaded
with error" and asks the user to remove the file and upload it again by
hand. The main spec forbids this outcome for a cancelled upload only; an
upload that simply failed at this step is not covered.

## What Changes

- The write of the uploader's own access entry is tried again while the key
  is still in memory, before anything is reported.
- When the entry still cannot be written, the client deletes the stored
  file permanently, since it cannot be read by anyone, and reports the
  upload as failed, the way a failed transfer is reported, so the row can
  be retried.
- When the deletion fails as well, the row stays "uploaded with error" with
  today's message, `Common:EncryptionUploadWrapFailed`, which tells the
  user to remove the file and upload it again.
- The SDK gets the same outcome through the shared upload code.
- A failure of the members' entries is not touched: the file then has its
  uploader's entry, and the members are marked as pending access, as today.

Proposed wording for the new outcome, for the owner to approve before it is
translated; one short message, new key `Common:EncryptionUploadNotKept`:
"The file was not saved: its encryption could not be completed. Upload it
again."

Out of scope:

- The order of the upload itself. Writing the entry before the ciphertext
  is impossible: the server takes entries only for a stored file.
- Files already orphaned on a portal. They have no entry to find them by
  from the client; a server-side sweep would be a request to the backend.
- The retry of a failed row, which exists and is not changed.

Decisions that need a human:

1. The wording of `Common:EncryptionUploadNotKept`, or the choice to reuse
   an existing message instead of adding a key.

Depends on: nothing in `../server` or the Document Server. The delete
route and the uploader's right to delete the file are read in the server
source in the first task, before the code.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: a new requirement, a stored upload whose
  uploader's entry cannot be written is not kept.

## Impact

- `packages/shared/services/private-room/encrypted-upload-orchestrator.ts`
  and its unit tests.
- `packages/client/src/store/uploadDataStore/chunkUpload.helpers.ts` and
  its tests; `packages/sdk/src/app/(private)/_hooks/useEncryptedUpload.ts`
  only if its handling needs to tell the two outcomes apart.
- `packages/shared/__mocks__/handlers/files/encryptedFiles.ts`: a mock-only
  switch that makes the access write fail, for one E2E case.
- `public/locales/*/Common.json`: one new key, if approved.
