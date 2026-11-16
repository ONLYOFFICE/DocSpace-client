# Proposal

## Why

A user who loses both the passphrase and the recovery phrase loses every
file of the private rooms for good: nobody else can open the user's key.
The owner set the launch scope to B2B on 2026-11-12
(`private-rooms-release-gate`, decision 1), and an organisation expects to
get an employee's access back. Until 2026-11-16 this was half of one task
of `private-rooms-server-hardening` (8.1) with one design decision and no
answer to who recovers, how a user enrols or how the key gets back to the
user. It is a feature with its own interface, policy and trust model, so it
gets a change of its own; the offboarding half stays in
`private-rooms-server-hardening` 8.1.

## What Changes

Nothing is built before the decisions below are taken. What is proposed:

- A portal can switch organisational recovery on. The portal owner names
  the recovery administrators among the portal administrators who hold an
  encryption key.
- While recovery is on, every key holder is enrolled: the browser wraps
  the user's private key for the public key of each recovery
  administrator and the server stores those wraps, never the key. The user
  is told that recovery is on and who can recover the key.
- A recovery administrator recovers a user who lost the passphrase and the
  recovery phrase: the administrator's browser opens the wrap and seals the
  same private key in a new envelope under a one-time passphrase, which the
  administrator hands to the user. The key pair does not change, so the
  file keys wrapped for the user stay valid.
- The user unlocks with the one-time passphrase and has to set a new one
  before anything else.
- Every recovery is written to the audit trail and the user is notified.
- The limits are stated as requirements: a recovery administrator can open
  the files of the user whose key they recover, one administrator is
  enough (no quorum), and a user who is not enrolled cannot be recovered.

Out of scope:

- Offboarding (`private-rooms-server-hardening` 8.1) and SCIM, which
  `../server` does not have.
- A quorum of administrators and a break-glass path for a recovery
  administrator who loses their own key.
- Recovering files without the user's key, by re-encrypting them.
- The desktop application.
- Any client code, mock or contract test before the server work has
  merged.

Decisions that need a human, with the answer this proposal assumes:

1. Who is a recovery administrator. Assumed: portal administrators the
   portal owner names, each holding an encryption key; one or more.
2. Enrolment. Assumed: a portal policy the owner switches; while it is on
   every key holder is enrolled, at key creation and at the next unlock of
   an existing key, and cannot opt out.
3. A change among the recovery administrators. Assumed: a named
   administrator gets a wrap at each user's next unlock; the wraps of an
   administrator who is removed, loses the role or resets the key are
   deleted by the server.
4. How the key gets back. Assumed: the one-time passphrase described
   above, handed over outside the portal. Alternative: the locked user
   makes a temporary key pair and the administrator wraps the private key
   for it, which needs no hand-over but a request the server stores.
5. Quorum. Assumed: none in this version.
6. What the user is told. Assumed: an e-mail and a notice in the profile
   for every recovery, and a standing notice that names the recovery
   administrators while enrolled.

Depends on: `../server` for the policy, the list of recovery
administrators, the storage and the routes of the wraps, the write of the
recovered envelope, the audit events and the notification. None of it
exists (design.md, Context). `private-rooms-server-hardening` is archived
first: it renames the main requirement that says the server has no
recovery endpoints, which this change then removes (task 6.2).

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/encryption-core`: a wrap of the identity private key for
  a recovery administrator, and the limit that follows from it.
- `private-rooms/key-management`: enrolment, the notice, the recovery by an
  administrator and the forced passphrase change after it.
- `private-rooms/server-contract`: the behaviour asked of the server.

## Impact

- `../server`, by the backend team, on its own branch: new settings,
  storage, routes, audit events and a letter.
- Later, in this repository: `packages/shared/services/encryption` (the
  wrap), `packages/shared/api/privacy` with its mocks and contract tests,
  the key dialogs under `packages/shared/dialogs`, the keys management tab
  and the accounts list of `packages/client`, the key creation of
  `packages/sdk`, and Common locale keys.
- `private-rooms-release-gate`: criterion 1.7 waits for this change, and
  the recovery procedure of its documentation pack (3.1) describes it.
