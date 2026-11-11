# Proposal

## Why

The main private-rooms specs contradict themselves, the code or the server
on several topics, so a reader cannot tell which statement holds:

- `file-operations` lists Recent among the feeds that show encrypted files and
  uses Recent as the example of a list outside a file's room, while the server
  never records an encrypted file as recent, as `sidebar-section` already
  says.
- `encryption-core` says the content of a file "cannot be changed
  undetected". The chunk associated data binds neither the file id nor the
  version, and the editor saves every version under the same file key, so the
  server can serve an older version of the same file without decryption
  noticing. The list of unauthenticated header fields also leaves out the
  chunk size.
- `encryption-core`, "Revocation removes access-list entries only", says the
  server keeps a removed member's wrapped keys. The server deletes them itself
  when the member's share of the room is removed.
- `room-membership` has a requirement for removing a group from a private
  room. The server never lets a group into one, and a guest cannot hold a key,
  so neither can be a member. The owner decided on 2026-11-10 that groups and
  guests are not supported in private rooms in this version.
- The Purpose sections of `feature-gating` and `editor-integration` still
  describe a browser-local tester flag and an editor without encrypted-specific
  handling.

Two related contradictions are already settled and are only recorded
here: private rooms are listed nowhere while the E2E rooms app is off (the
beta release and release gate deltas and the main specs say so since
2026-11-10), and the "Invitee has no key" scenario and the `EncryptedRevoke*`
keys left the main specs with the invite and server hardening syncs of the
same day.

## What Changes

- `file-operations`: Recent leaves the list of feeds that show resolved names,
  with a scenario saying an encrypted file never appears there; the duplicate
  scenario drops the Recent example.
- `encryption-core`: the header requirement is renamed to include the chunk
  size and loses the "cannot be changed undetected" claim; a new limitation
  says an older version of the same file is not detected; the revocation
  requirement says the server deletes the removed member's wrapped keys.
- `room-membership`: a new v1 limitation, groups and guests are not members of
  a private room; the requirement on removing a group is removed.
- The Purpose of `feature-gating` and of `editor-integration` is rewritten to
  describe the branch (by hand: a sync leaves Purpose untouched).
- `private-rooms-server-hardening` is aligned with the group decision: its
  group revocation requirement, the group part of "File keys follow the share"
  and tasks 6.4 and 6.5 go. The two requirements this frees are synced if the
  server matches them.
- Two unit tests show the limitations: a rewritten chunk size fails
  decryption, and an older version served in place of the current one
  decrypts without error.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: "Feeds show resolved names", "Copy within
  the same private room".
- `private-rooms/encryption-core`: "Revocation removes access-list entries
  only"; "DSE3 header flags and name length are not authenticated", renamed;
  new "Older versions of a file are not detected".
- `private-rooms/room-membership`: new "Groups and guests are not members of a
  private room"; "Removing a group revokes each member" removed.

## Impact

- Specs only, plus the two Purpose sections and two unit tests in
  `packages/shared/services/encryption/__tests__/dse3-tampering.test.ts`, whose
  spec pointer follows the renamed requirement. No application code changes.
- Other changes: `private-rooms-server-hardening` (group requirement, tasks
  6.4 and 6.5, two syncs); `private-rooms-dse3-header-authentication` gets a
  note that its version-3 header binding must update the renamed limitation
  when it archives.
- Server (`../server`): no work. The facts stated come from the server at
  `a7d94e4b81`, read through CodeGraph (design.md).

## Out of scope

- The auto-lock contradiction between `key-management` and `encryption-core`:
  it is fixed by its own change, which shortens the presets.
- Rooms → Archive listing archived private rooms while the app is off, and the
  `sidebar-section` requirement "Rooms section excludes private rooms while the
  section is available": `private-rooms-server-section` rewrites that
  requirement and owns the server's archive filter.
- A threat model, the open metadata and the limits of search and download:
  they are written by a separate change.
- Detecting an older version or authenticating the header: version 3 of the
  container (`private-rooms-dse3-header-authentication`) authenticates the
  header; binding the file version is not planned.

## Decisions needed

None. Groups and guests in private rooms were decided by the owner on
2026-11-10 (not supported in this version, the group revocation tasks go).
