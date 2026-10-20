# Proposal

## Why

The client was built for several identity keys per user: a per-device active-key preference, a "Use on this device" switch that re-wraps every private room to another key, a resumable migration runner, imports and generations that add a second key, and key-by-key handling of room members. None of it pays off. The server stores at most one wrap per (file, user) and never marks a key as active, so a second key buys nothing; it only creates states nobody can reason about. It also breaks uploads today: the store's upload fan-out wraps once per member key, so a room member with two keys makes the file-key write name that user twice, the server refuses the whole write, and no other member gets access to the new file (the error is only logged). Supporting exactly one key on the client removes this class of bugs and a large amount of code before the feature is released.

## What Changes

- **One key per user on the client.** The server may still hold several envelopes for a user; the client reads them all but operates with exactly one, chosen by one deterministic rule shared by every client: the envelope with the newest `date`, ties broken by the last one in the server's response. The same rule picks a room member's key for wraps, invitations, backfill and the owner check.
- **Wraps: one per member.** Upload (client store and the shared orchestrator used by the SDK and file creation), invitation, backfill and owner-change validation build exactly one recipient per user. This fixes the refused write for members with several keys.
- **Own key everywhere.** The client, editor and SDK identity providers, the upload self-wrap and the desktop bridge use the selected key; the per-device active-key preference and the "choose a key" hint go away.
- **Key management with one key.** "Generate new key" and "Import key" are offered only while the user has no key. Change passphrase and recovery keep re-sealing the same key in place. Delete and reset are the only ways to a different key. The key list shows one key; "Use on this device", the key switch with room migration, the resume banner and the migration runner are removed. **BREAKING** for test accounts that hold several keys: see below.
- **Accounts that already hold several keys.** No migration. The client uses the selected key; files wrapped for another key show the existing ghost-state notice. Keys management notes that unused keys are stored on the server and offers to delete them.
- **Specs.** encryption-core drops "Several identity envelopes per user", "Active key is chosen per device and never auto-picked" and "Identity rotation re-wraps every file", and states the selection rule; key-management drops the key switch, the resume banner and the device marker and restricts generate and import; file-operations states one wrap per member for uploads.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `private-rooms/encryption-core`: key selection rule, one wrap per member, removal of the multi-key requirements.
- `private-rooms/key-management`: single-key lifecycle, removal of switching and migration, unused-key cleanup.
- `private-rooms/file-operations`: upload wraps one key per member.

## Impact

- Shared: `services/encryption` (active-key-preference and rotation-state removed, apply-new-identity, room-file-access unwrap ordering), `services/private-room` (room-member-keys, room-encryption add/backfill/validate/rotate, encrypted-upload-orchestrator), `dialogs/key-generation`, `dialogs/key-recovery`, `store/UserStore`.
- Client: Profile keys-management (page, list, flows), `store/uploadDataStore` (encryption.helpers, selectors.helpers), `EncryptionProviderWrapper`, `ChangeRoomOwnerPanel`, create-room dialog.
- Doceditor: `EncryptionProviderWrapper`, `initDesktop`. SDK: identity store, encrypted upload, owner-change flow, device-setup hint.
- Locales: the keys used only by the multi-key UI are removed from all languages; one new key for the unused-key notice and one for its action, translated into all 31 languages.
- Tests: multi-key unit tests removed or rewritten; new tests for the selection rule and one wrap per member; E2E keys-management specs checked for the removed controls.
- Other changes: `private-rooms-server-hardening` drops the per-key file-key plan (BL-8); `private-rooms-tofu-on-upload` and `private-rooms-ux-gaps` are reworded for one key per member and per user.
- Server: none. Server facts this relies on are cited in design.md.

## Out of scope

- Server-side enforcement of one key per user; the server keeps accepting several.
- Re-wrapping files of accounts that already hold several keys.
- The server bug where saving keys may remove the user's other account link (reported in design.md for the server team).

## Decisions taken

- Selection rule: newest `date`, ties to the last listed (user decision, 2026-10-20).
- Existing multi-key accounts: no migration, cleanup offered (user decision).
- Generate and import hidden while a key exists (user decision).
