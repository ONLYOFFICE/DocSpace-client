# Proposal

## Why

The pins of peer public keys are what lets this device notice that a room
member's key changed. This change states, in `private-rooms/encryption-core`,
when a key counts as first seen, what an operation does when the pins cannot
be read, stored or opened, how concurrent first sights of one peer are
decided, in which order the pin comparison and the unwrap run, and how one
unusable member key is contained, with unit tests for each behaviour.

## What Changes

- A peer key counts as first seen only once its pin is stored. A pin that
  cannot be stored, like one that cannot be read, refuses the part of the
  operation that needed the key.
- The in-memory pin store is used only when the browser gives the page no
  IndexedDB at all. A pin store that exists but cannot be opened, or whose
  opening waits on another tab, refuses the operation; the next operation
  tries to open it again.
- The first sight of a peer's key is decided once per peer, also when
  several operations or tabs see that peer at the same time.
- The unwrap compares the sender key with the pins before it unwraps:
  pinned keys are tried first, a changed key only after the user accepted
  it, and a sender key seen for the first time is pinned once it opened the
  wrap, with the file key released only after that pin is stored.
- A changed key the user accepts is used only once it is stored among the
  peer's trusted keys.
- When a key could not be checked, each operation says so in its own terms
  instead of reporting a refused key change or the ghost-state toast: the
  upload names the member with a new text and keeps them pending, an
  invitation names the invitee under Common:EncryptedInviteFailed, a re-wrap
  keeps the files pending, the backfill retries on the next sweep, and a
  download, copy or preview shows a new text.
- A listed member key that is not a well-formed public key affects only that
  member: it is not pinned or wrapped for, the other members still get their
  wraps, and the unwrap goes on to the next candidate key.

New user-facing texts: `Common:EncryptedUploadKeyCheckFailed` (upload) and
`Common:EncryptedKeyCheckFailed` (download, copy, preview), translated into
every supported language.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/encryption-core`: three requirements modified ("Peer public
  keys are pinned on first use", "Key mismatch on unwrap is refused unless a
  resolver accepts it", "Member keys are verified against pins when granting
  access") and three added ("The first sight of a peer key is decided once
  per peer", "A peer key that could not be checked is reported per
  operation", "An unusable member key affects only that member").

## Server and Document Server

None. The pins live in the browser of each device and the change reads no
new server data; the member keys and wraps it handles are the ones the
client already loads. No statement about `../server` is made, so none had to
be looked up.

## Out of scope

- The pin of the user's own key (written when a key is generated, imported
  or deleted in Keys management); its callers keep their behaviour.
- Cross-device pin sync and key transparency (a SHALL NOT of the main spec).
- The remembered-device store, which is a separate IndexedDB database.
- The editor's error screen: the editor keeps its existing error state when
  the unwrap is refused; no new editor text.

## Decisions

Taken by the owner on 2026-11-19:

1. A pin store that exists but cannot be opened refuses every operation
   that needs a peer key until it opens. There is no in-session override;
   the texts tell the user to reload and try again.
2. The unit tests use the `fake-indexeddb` package, added as a
   devDependency of `packages/shared`.
3. An open that is blocked by another tab is waited for 5 seconds before
   the operation is refused.

## Impact

- `packages/shared/services/encryption/tofu-store.ts` (open, single
  transaction first-sight decision, write completion, per-peer ordering in
  the in-memory store).
- `packages/shared/services/encryption/room-file-access.ts` (comparison
  before unwrap, candidate order, per-recipient wrapping, key-format check).
- `packages/shared/services/encryption/errors.ts` and `error-i18n.ts` (an
  error for a key that could not be checked, kept apart from the ghost-state
  notification in `ghost-state-notifier.ts`).
- `packages/shared/services/private-room/member-key-verification.ts`,
  `room-encryption.ts`, `room-member-flows.ts` and
  `encrypted-upload-orchestrator.ts` (the new outcome and the unusable key).
- Upload texts in `packages/client/src/store/uploadDataStore/encryption.helpers.ts`,
  `packages/client/src/components/panels/UploadPanel/FileRow.js` and
  `packages/sdk/src/app/(private)/_hooks/useEncryptedUpload.ts`; the invite
  result in `packages/client/src/components/panels/InvitePanel/sub-components/InviteResult.js`
  and its SDK counterpart.
- Two keys in `public/locales/*/Common.json` with their `.meta` comments.
- The devDependency `fake-indexeddb` in `packages/shared/package.json` and
  `pnpm-lock.yaml` (decision 2).
