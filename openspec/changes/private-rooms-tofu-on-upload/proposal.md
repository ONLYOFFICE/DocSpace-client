# Proposal

## Why

Trust-on-first-use pins protect two of the three places where a peer public key is consumed: unwrapping a file key (the sender's key is checked) and granting access during invite and backfill (each invitee's key is checked). The third place, the upload fan-out, wraps the fresh file key for every public key the server lists for the room without consulting the pins. A server that substitutes a key under an existing member's user id therefore receives a readable wrap on the very next upload, with no dialog and no refusal. The recovered SECURITY.md only documents the unwrap check ("deferred item #3"), so this gap was never an accepted limitation.

## What Changes

- Every recipient key used in the upload fan-out, in the client upload pipeline and in the shared orchestrator, is checked against the current user's TOFU pin before the wrap is produced.
- A key never seen before is pinned, as on every other path.
- A mismatch invokes the registered key-change resolver (the same dialog the unwrap path uses); if the user refuses or no resolver is registered, no wrap is produced for that member and the uploader is told which members did not receive access.
- The resulting access list may therefore be shorter than the member list; the existing backfill and the pending-access retry (`private-rooms-invite-atomic-rewrap`) are the recovery paths.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/encryption-core`: "File access list holds one wrap per member" (the upload fan-out scenario now requires the pin check) and "Member keys are verified against pins when granting access" (extended to the upload fan-out).

## Impact

- Shared: `packages/shared/services/private-room/encrypted-upload-orchestrator.ts` (fan-out loop) and the TOFU store API in `packages/shared/services/encryption/tofu-store.ts` (reuse `checkKey` and the registered resolver).
- Client: `packages/client/src/store/uploadDataStore/encryption.helpers.ts` (the store's own fan-out), the upload panel summary for members not granted.
- Locale: one Common key for "file uploaded but not shared with N members".
- Tests: `packages/shared/services/private-room/__tests__/encrypted-upload-orchestrator.test.ts`, `packages/client/src/store/uploadDataStore/__tests__/encryption.helpers.test.ts`, an MSW integration case next to `tofu-mismatch.integration.test.ts`.
- Server: none.

## Out of scope

- Cross-device pin synchronisation and key transparency (accepted v1 limitations).
- Changing how the unwrap or invite paths handle mismatches.

## Decisions needed

- None blocking. The resolver dialog is reused as is; whether the upload should pause for the dialog or skip the member and report afterwards is a UX choice recorded in design.md (recommended: pause, because the dialog already exists and the upload queue is sequential per file).
