# Proposal

## Why

The server refuses a guest who creates, replaces or deletes an encryption
key, and a guest cannot be a member of a private room. The client still
shows a guest the Keys management tab of the profile and serves its
routes: the tab follows the Private section and the keys the user holds,
never the type of the user. A guest can therefore start key generation,
type a passphrase, write down a recovery phrase, and only then meet a 403.

## What Changes

- The Keys management tab is not shown to a guest, and
  `/profile/keys-management` does not resolve to the page for one, whether
  or not the Private section is available and whether or not the guest
  holds a key from before they became a guest.
- The key offer of private room creation, shared by the client and the
  SDK, is not made to a guest. No route leads a guest there today: the
  server gives a guest no right to create a room, so the client offers no
  creation. The guard is a second line, without a message of its own.
- Nothing else changes for a guest: the Private item of the sidebar and
  the empty Private list stay as they are.

No user-facing string is added.

Out of scope:

- Hiding the Private section from guests. It is empty for them, since a
  guest cannot be a member of a private room; whether to hide it is a
  question of the sidebar, not of key generation.
- What the server does with the stored key pair of a user who is turned
  into a guest, asked in `private-rooms-server-followups` 1.5.
- Users of the other types.

Decisions taken:

1. A guest who holds a key loses the tab with it. Decided by the owner on
   2026-11-11: no guest holds a key from an earlier version, so the rule
   stays unconditional. The server refuses a guest every key write and no
   private room admits one.

Depends on: nothing in `../server` or the Document Server.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/key-management`: "Keys management tab follows the Private
  section" excludes guests; a new requirement withholds key generation
  from a guest.

## Impact

- `packages/client/src/helpers/privateRoomsSection.ts` and its two callers,
  the profile body and `KeysManagementRoute`, with their tests.
- `packages/shared/hooks/usePrivateRoomKeyGate.ts`, its callers in the
  client and SDK creation dialogs, and its test.
- No API, locale or dependency change.
