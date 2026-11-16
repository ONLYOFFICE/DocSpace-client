# Proposal

## Why

Two mocks answer what `../server` does not. Found by the reads of
2026-11-16 at `6fb6dfb17a`:

- The room creation mock answers 200 to a public or a form-filling room
  created as private, where the server answers 403. The main
  `server-contract` says the same as the mock.
- The mock of the accounts offered for a room builds each account from the
  fixture of the caller's own profile, so it carries three fields the
  server never sends for another account and misses one it always sends.

A contract test that agrees with a wrong mock proves nothing, so both are
set right.

## What Changes

- The room creation mock answers 403 "Access denied" to a public or a
  form-filling room created as private, after the same refusals as before,
  as the server does.
- The main `server-contract` requirement on private room creation says so,
  with a scenario for it.
- The accounts-for-a-room mock builds an account from the fields the server
  fills for another account, without `workFrom`, `theme` and
  `loginEventId`, and with `registrationDate`.

Out of scope:

- The behaviour asked of the server for these rooms
  (`private-rooms-server-hardening` 12.8). Its
  delta replaces the scenario added here when it lands.
- Any change in `../server`.
- The search filters and the caller-dependent parts of the accounts route
  (the trimmed profile a user gets, the quota fields a DocSpace
  administrator gets): the mock lists the users a test gives it and has no
  caller.
- Client and SDK code. The interface never sends the private flag with
  these room types and reads none of the removed fields.

Decisions that need a human: none.

Depends on: nothing. `../server` is read, not changed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/server-contract`: "Private room creation requires keys"
  states what the server answers for a public or a form-filling room.

## Impact

- `packages/shared/__mocks__/handlers/rooms/createRoom.ts` and its contract
  test.
- `packages/shared/__mocks__/handlers/people/roomShared.ts` and its
  contract test.
- The specs that use the two mocks: `private-room-invite.spec.ts` and
  `private-room-members.spec.ts` of the client, the private suite of the
  SDK.
