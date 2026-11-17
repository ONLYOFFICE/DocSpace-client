# Design

## Context

See proposal.md for the motivation.

Stashed design: `V1_RELEASE_PROGRESS.md` lists administrative recovery as
item #55 and `private-rooms-server-hardening` (design decision 5) took its
model from there, a wrap for the recovery administrator. The stash was not
read again for this change; where it differs from what is written here, the
decisions below are taken anew.

Client, as the main specs describe it (`private-rooms/encryption-core`):

- Each user has one X25519 identity key pair. The private key leaves the
  browser only inside an identity envelope with a passphrase slot and an
  optional recovery slot from a 24-word phrase.
- A file key is wrapped for each member with authenticated HPKE. The wraps
  are made for the public key, so they stay valid as long as the key pair
  does.
- A user who loses the passphrase recovers with the phrase
  (`private-rooms/key-management`, "Recover with the recovery phrase");
  without the phrase the only way on is "Reset all keys with a typed
  token", which makes a new key pair and gives up every file key.

Server, `../server` at `6fb6dfb17a`, read on 2026-11-16:

- The key envelopes of a user are one record of the account links, written
  and read by `EncryptionLoginProvider`
  (`common/ASC.FederatedLogin/LoginProviders/EncryptionLoginProvider.cs`).
- The routes of a user's own keys are in `PrivacyRoomController`
  (`products/ASC.Files/Server/Api/PrivacyRoomController.cs`). Creating,
  replacing and deleting a key demand a signed-in caller who is not a
  guest (`EncryptionKeyPairDtoHelper.DemandKeyOwnerAsync`,
  `products/ASC.Files/Core/Core/Entries/EncryptionKeyPairDto.cs`), and act
  on the caller's own record only. No route writes another user's key.
- No code for recovery exists: no setting, no role, no storage and no
  route. The main `server-contract` records it as "No recovery or
  offboarding endpoints".

## Goals / Non-Goals

**Goals:**

- A locked user gets the same key pair back, so nothing is re-encrypted.
- The server never holds a private key it can open.
- Every use of the recovery is visible to the user and in the audit trail.

**Non-Goals:**

- Protecting a user from the recovery administrators of their own portal.
- Choosing the storage and the route names for the backend team.

## Decisions

Decisions 1 to 6 are the assumed answers of proposal.md. They are recorded
as taken, with their date, by task 0.1 before any other task starts.

1. **Recovery administrators are named by the portal owner among the
   portal administrators who hold a key.** The role decides who can read
   the files of a recovered user, so it is not given with the
   administrator role itself. Alternative: every portal administrator.
   Rejected: it would widen who can read private rooms each time an
   administrator is added.
2. **Enrolment follows a portal policy and is not a choice of the user.**
   An organisation that turns recovery on needs it to cover everyone, and
   a user who could opt out is the user who cannot be recovered. The user
   is told before the key is created and sees the notice afterwards.
   Alternative: opt-in per user. Rejected for the B2B case; it stays
   possible later as a second policy value.
3. **One wrap per recovery administrator, made in the user's browser.**
   The private key is wrapped with authenticated HPKE for the
   administrator's public key, as a file key is wrapped for a member, with
   its own context label so that a wrap of a file key and a wrap of an
   identity key cannot be taken for one another. The wrap can only be made
   while the user's key is unlocked, so a new administrator is covered at
   each user's next unlock. Alternative: one shared recovery key pair of
   the portal. Rejected: its private key would have to be shared among the
   administrators or kept by the server.
4. **The key comes back in a new envelope under a one-time passphrase.**
   The administrator's browser opens the wrap, seals the same private key
   in an ordinary identity envelope with a generated passphrase and no
   recovery slot, and sends it to the server for that user. The server
   accepts it only from a recovery administrator, only for an enrolled
   user and only when its public key is the user's current one, and marks
   the key as recovered. The client forces a passphrase change while the
   mark is set, which also offers a new recovery phrase. Alternative: a
   temporary key pair made by the locked user. Kept as the alternative of
   proposal decision 4; it removes the hand-over of a passphrase and adds
   a stored request and a second visit of the user.
5. **No quorum.** One recovery administrator recovers a key. Two of N
   would need a threshold scheme over the wraps, which is new cryptography
   rather than a reuse of the file-key wrap. The limit is a requirement,
   so it is visible.
6. **The user is told every time.** A recovery writes an audit event with
   the administrator, the user and the time, and sends the user a letter;
   the profile shows the last recovery until the user has set a new
   passphrase.
7. **The behaviour asked of the server is a delta of `server-contract`
   with ADDED requirements.** The main spec keeps describing the server as
   it is until the work lands, as in `private-rooms-server-followups`
   (decision 2).

## Risks / Trade-offs

- [A recovery administrator opens a user's wrap without being asked and
  reads the user's files] → Accepted and stated: the audit event and the
  letter make it visible, and the documentation pack of
  `private-rooms-release-gate` 3.1 says who the recovery administrators can
  read.
- [The one-time passphrase is sent over an unsafe channel] → It opens the
  envelope only together with a sign-in as the user, and it stops working
  when the user sets a new passphrase. The interface tells the
  administrator to hand it over in person or by phone.
- [The only recovery administrator loses their own key] → The wraps made
  for that key are lost with it. The owner names another administrator and
  the users are covered again at their next unlock; a user who is locked
  out in between cannot be recovered. Naming two administrators is
  advised in the interface.
- [The envelope written by an administrator replaces one the user could
  still open] → The server keeps the public key unchanged, so every file
  key stays valid; the user is told by the letter.
- [The server routes land under other names or shapes than assumed] →
  Every client task starts by reading the merged server through CodeGraph.

## Migration Plan

Recovery is off on every portal until its owner turns it on. Turning it on
enrols nobody at once: each user is enrolled at the next unlock. Turning it
off deletes the wraps on the server. No stored file changes.

## Open Questions

- Whether a later version adds a quorum or a break-glass path. Owner:
  product and security.
- Whether the letter of a recovery names the administrator. It changes the
  wording of the letter only.
