# Proposal

## Why

A review of the private-rooms specs on 2026-11-24 compared them with each
other and with the code on the branch. Seventeen requirements say something the
product does not do, contradict a neighbour, or leave a case to a phrase such
as "as the client does" that turned out not to hold. The product is right in
each of them; the text is not.

## What Changes

No behaviour changes. The requirements below are reworded to what the code on
the branch does.

- `file-operations`: the message of a failed move; the general message each
  encrypted operation falls back to; the media viewer's fallback now that a
  replaced key has a message of its own; the folder archive no longer claims
  the error reporting of the multi-file archive; the room notice says how long
  a file stays counted.
- `key-management`: the device setup hint speaks of the account's key, not of
  a device; closing key setup on the explanation step asks nothing (owner,
  2026-11-24); the old-export scenario names the deletion that makes the
  import possible; the Tab order is the order the page shows; the recovery
  block is shown while the user has a key; the ghost-state toast can come
  once more after a key reset.
- `sdk-surface`: a re-imported file is encrypted again under a new file key,
  as in the client; the backfill sweep wraps what the server lists as missing;
  download without decryption is offered in the header menu for one selected
  file only.
- `sidebar-section`: the item after Private is AI Chat (Common:AIChat); the
  dashboard card has a disabled state for a user who can switch apps; a frame
  needs the host's opt-in.

Out of scope:

- Four requirements that unarchived changes already carry and will rewrite:
  "Server API is not gated by the flag" (`private-rooms-beta-release`), "DEK
  handed to the editor configuration" (`private-rooms-editor-contract`),
  "Legacy desktop path uses editor-provided keys"
  (`private-rooms-remove-dead-api-calls`), and the two names in
  `server-contract` that disagree with their bodies
  (`private-rooms-server-hardening`).
- Scenario names that no longer fit their bodies ("Preset off", "Revocation
  succeeds", "Cleanup fails"): tests carry these names, and a rename is not
  worth the churn.
- "Copy within the same private room" against the name-clash rule: the review
  was not sure of it and the code was not read far enough to decide.

Decisions that need a human: none.

Depends on: nothing in `../server` or the Document Server.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/file-operations`: five requirements reworded.
- `private-rooms/key-management`: six requirements reworded.
- `private-rooms/sdk-surface`: three requirements reworded.
- `private-rooms/sidebar-section`: three requirements reworded.

## Impact

- `openspec/specs/private-rooms/*`: text only.
- Two code comments that describe removed behaviour
  (`EncryptionContext.tsx`, `filename-cache.ts`).
- No code path, test expectation, locale or API changes.
