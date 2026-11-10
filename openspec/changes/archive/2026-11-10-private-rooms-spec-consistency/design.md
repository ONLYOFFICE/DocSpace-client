# Design

## Context

See proposal.md, Why. Each statement this change writes was checked on
2026-11-10 against the client at `33022fe77e3` and the server at
`a7d94e4b81` (`release/v4.1.0`), read through CodeGraph and then in the
source by line range.

Recent. `EntryManager.MarkAsRecent`
(`products/ASC.Files/Core/Utils/EntryManager.cs:2130-2135`) returns at once
for an encrypted file, so neither the recent tag nor the shared-by-link tag is
written. `Tag.Recent` has one other caller, `FileSharingAceHelper.RemoveAceAsync`
(`products/ASC.Files/Core/Utils/FileSharing.cs:603`), which removes tags. The
client test "Duplicate started outside the room"
(`packages/client/src/store/filesActionsStore/__tests__/FilesActionsStore.encryption.test.ts:68`)
opens the duplicate from a Recent folder; the guard it covers is about the
open folder not being the file's room, which the scenario now says without the
Recent example.

Integrity. The chunk associated data
(`packages/shared/services/encryption/streaming-encryption.ts`,
`buildChunkAad`) is the chunk prefix, the suite, the file nonce, the chunk
count, the chunk index and the last-chunk flag. The header's chunk plaintext
size is not in it; decryption uses it to frame each chunk
(`ciphertextSize = chunkPlaintextSize + tag`), so a rewritten size misframes
the chunks and fails. The editor receives the file's DEK in its configuration
("DEK handed to the editor configuration") and saves every version under it
with a fresh file nonce, so an older version is a valid container for the same
key. `private-rooms-dse3-header-authentication` binds the header bytes,
including the chunk size, from version 3 on; it binds no file id or version.

Revocation. `FileSharingAceHelper.SetAceObjectAsync` collects the users who
lose a private room (`FileSharing.cs:443-446`: not a link, not a group, not
before an owner change, not the room's creator) and
`RevokeFileKeysAsync` (`FileSharing.cs:670-685`) deletes their wrapped keys;
a leave goes the same way (`FileSharing.cs:644-650`).

Groups and guests. In `SetAceObjectAsync` every user or group share of a
private room that is new, or replaces a non-group share, runs
`EncryptionLoginProvider.ThrowIfKeysAreNotSetAsync` for the subject's user
record (`FileSharing.cs:270-276`). A group id resolves to no user with keys,
so the check throws `InvalidOperationException`
(`common/ASC.FederatedLogin/LoginProviders/EncryptionLoginProvider.cs:97-104`),
which `ResponseWrapper` maps to 403
(`common/ASC.Api.Core/Middleware/ResponseWrapper.cs:86-88`). A guest cannot
create, replace or delete a key: `EncryptionKeyPairDtoHelper.DemandKeyOwnerAsync`
throws `SecurityException` for a guest
(`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs:118-128`), so
a guest has no key and is refused by the same check. The prospective-member
key route also leaves guests out ("Prospective members who cannot be invited
are absent").

Main specs after the syncs of 2026-11-10: "Invitee has no key" now says the
invitee does not become a member, and no requirement names an
`EncryptedRevoke*` key. `private-rooms-server-hardening` still modifies
"Removing a group revokes each member" and adds "File keys follow the share"
with a group clause; "Clearing the access of a private room" was kept in its
delta only because group members could keep their keys.

No stashed design document covers these topics.

## Goals / Non-Goals

**Goals:**
- On every topic of the proposal, the main specs and the open deltas say the
  same thing, and it is what the code and the server do.
- The two integrity limitations are shown by tests, as the other header
  limitations are.

**Non-Goals:**
- Changing any behaviour. Binding the file version into the chunk data is not
  planned here.
- Rewriting `sidebar-section` for the archive listing, owned by
  `private-rooms-server-section`.

## Decisions

1. **Limitations stay SHALL NOT requirements.** The older-version gap is a new
   requirement next to the header one, so it is visible and testable, rather
   than a sentence inside the header requirement.
2. **Rename the header requirement.** Adding the chunk size to the list
   changes what the name promises, so the delta renames it; the one code
   pointer to it (`dse3-tampering.test.ts`) follows in the test task.
3. **Remove the group revocation requirement rather than rewrite it.** No
   group can be a member, so there is nothing to revoke. The SDK requirement
   "Member removal warning" keeps its "Remove a group" scenario: a MODIFIED
   block cannot drop a scenario, and the scenario (a role update for the group
   alone) states nothing the server contradicts.
4. **Align `private-rooms-server-hardening` here.** Archiving this change
   removes "Removing a group revokes each member" from the main spec, which
   the hardening delta still modifies; its archive would then fail. Its group
   clause, its group tasks and the extension of 6.4 written earlier on
   2026-11-10 go in the same step, and the two requirements this frees are
   synced if the server matches them for users.
5. **Purpose by hand.** A sync leaves an existing Purpose as it is, so the two
   stale Purpose sections are rewritten directly in the main specs; they
   describe the branch, which the main specs are for.

## Risks / Trade-offs

- [`private-rooms-dse3-header-authentication` archives after this change with
  version 3 binding the header] → It must then modify or remove the renamed
  limitation for version-3 containers. A note in its tasks records that.
- [A guest who held a key before their type changed] → Not read; the server's
  key check would let such a user in. Recorded as an open question for the
  backend, not as behaviour.
