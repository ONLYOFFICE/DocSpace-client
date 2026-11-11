# Design

## Context

See proposal.md for the motivation. No stashed design document covers this.

Server, `../server` at `a7d94e4b81`, read through CodeGraph on 2026-11-11:

- `EncryptionKeyPairDtoHelper.DemandKeyOwnerAsync`
  (`products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs`) throws a
  `SecurityException` for an account that is not authenticated or is a
  guest (`userManager.IsGuestAsync`). The create and replace of a key pair
  call it before anything else; the main spec `server-contract`, "Guests
  cannot hold encryption keys", states the same for the delete.
- `FileSecurity.FilterEntryAsync`
  (`products/ASC.Files/Core/Core/Security/FileSecurity.cs`) grants Create
  on the Rooms and the Private rooms roots inside a branch a guest does not
  enter, so a guest gets no right to create a room.

Client, as read:

- `isKeysManagementAvailable(isSectionAvailable, encryptionKeys)` in
  `packages/client/src/helpers/privateRoomsSection.ts` is true while the
  section is available or the user holds a key. The profile body
  (`pages/Profile/Section/Body/index.tsx`) uses it for the tab and
  `components/KeysManagementRoute` for the two routes.
- Key generation is reached from two places only: the Keys management page
  (`KeysManagement.tsx`) and the key offer of private room creation
  (`packages/shared/hooks/usePrivateRoomKeyGate.ts`, used by the client's
  `CreateRoomDialog` and the SDK's `PrivateCreateRoomDialog`).
- The user object carries `isVisitor`, the client's name for the guest
  type.

## Goals / Non-Goals

**Goals:**

- No path in the client or the SDK lets a guest start key generation.

**Non-Goals:**

- Changing what a guest sees of the Private section.

## Decisions

1. **The rule lives in the availability helper.** `isKeysManagementAvailable`
   takes whether the user is a guest and answers false for one; both
   callers pass it from the user store, so the tab and the routes cannot
   drift apart. Alternative: a check in each caller. Rejected: two copies.
2. **A guest who holds a key loses the tab too (proposed, proposal
   decision 1).** Every action of the page that reaches the server is
   refused for a guest, and the key opens nothing.
3. **The creation offer is guarded in the shared hook, silently.** A guest
   has no creation entry, so the guard is never met in normal use; when it
   is, it declines the offer as the missing secure context does, and the
   caller closes the creation. No message is added for a path that should
   not exist. Alternative: leave the hook alone. Rejected: the cost is one
   parameter, and the hook is the only other way into key generation.
4. **The route waits for the user as it waits for the apps.** The guard
   already renders nothing until the apps list is settled; the user is
   loaded before the routes render, so no extra state is needed.

## Risks / Trade-offs

- [A guest who was a user loses the view of a key they still hold on the
  server] → Proposal decision 1; the server keeps the key, and the answer
  to `private-rooms-server-followups` 1.5 decides what becomes of it.
- [A future flow adds a third way into key generation and forgets guests]
  → The requirement states the rule for key generation as a whole, not for
  the tab.
