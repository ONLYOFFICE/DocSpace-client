# Design

## Context

See proposal.md for motivation. Two fan-out implementations exist:

- The shared orchestrator `wrapDekForSelfAndRoom` (`packages/shared/services/private-room/encrypted-upload-orchestrator.ts:215-300`) fetches `getRoomEncryptionKeys(roomId)` and the file's existing access list, builds the recipient list from every listed key (lines 253-275) and wraps for each; no call to the TOFU store. Once `private-rooms-single-key` lands, both paths build one recipient per member from the selected key, and the pin check applies to that one key.
- The client store path `encryptKeysForRoomMembersImpl` (`packages/client/src/store/uploadDataStore/encryption.helpers.ts:98-170`) does the same against `getRoomEncryptionKeys` and is the one the main upload pipeline uses.

The invite path already does the check: `room-encryption.ts:130-156` calls `tofu.checkKey(userId, publicKey)` and resolves a mismatch through the per-call resolver or `getKeyMismatchHandler()` (registered by the key-change dialog, `tofu-store.ts:507-515`). The unwrap path does the same in `room-file-access.ts`. The stashed SECURITY.md records the unwrap check as "deferred item #3, done" and FORMAT.md §6 says every key response should be compared with the stored entry; neither mentions the fan-out, so this is an omission rather than a decision.

## Goals / Non-Goals

**Goals:**
- One verification helper used by invite, backfill, upload (both implementations) and unwrap, so the paths cannot drift again.
- No wrap for a key that fails verification; the uploader learns which members were left out.

**Non-Goals:**
- Pin sync across devices, key transparency, changing the resolver dialog.

## Decisions

1. **Extract `verifyMemberKeys(recipients, { resolver })` into the shared private-room service (`member-key-verification.ts`, next to `room-encryption.ts`)** and call it from both fan-out implementations before wrapping. It returns `{ verified, skipped: [{ userId, displayName, reason: "key-mismatch-refused" }] }`, with no registered resolver counted as a refusal as on the invite and unwrap paths, and it pins first-seen keys. Alternative: duplicate the three-line check in both fan-outs. Rejected: the duplication is exactly what produced the gap.
2. **Pause the upload for the dialog.** The client pipeline processes one file at a time, so awaiting the resolver inside the fan-out is safe and reuses the existing modal. Alternative: skip mismatching members and let the user resolve later. Rejected because it would silently produce fewer wraps on every upload until the user notices.
3. **Resolver decisions are remembered for the session per (userId, newKey).** The TOFU store already updates the pin on accept, so later uploads in the session do not re-prompt; a refusal is remembered in memory so the same upload batch does not prompt per file. Alternative: prompt per file. Rejected as unusable for batches.
4. **Report, do not fail, the upload when members are left out.** The file is encrypted and readable by the uploader and the verified members; refusing the whole upload would punish the uploader for another member's key change. Because the member fan-out runs after the upload-finish toast and may wait for the key-change dialog, the uploader gets a separate warning toast, Common:EncryptedUploadNotSharedWith with the names, when a file's fan-out finishes, and the file's row in the upload panel carries the same message; the room key list has user ids only, so the names come from the people API.

## Risks / Trade-offs

- [A refused member keeps missing new files until resolved] → the pending-access retry from `private-rooms-invite-atomic-rewrap` and the backfill re-check pins and wrap once the user accepts.
- [The orchestrator is used by the SDK and by tests with no dialog registered] → with no resolver the helper refuses, matching the unwrap path; the SDK shell registers the dialog already.
- [Pausing an upload on a modal while the tab is hidden] → the auto-lock on tab hidden already stops uploads needing the identity; the dialog is dismissed and the member is skipped.

## Migration Plan

No format or server change. Behind the `privateRooms` flag; rollback by revert.
