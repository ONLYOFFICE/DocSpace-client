# Proposal

## Why

A private room is reached through membership only: no link of any kind,
and nobody outside the portal. The owner asked on 2026-11-16 for external
links to encrypted items, with the link types, the roles and the settings
the portal already has for ordinary items, while the server still holds no
key.

That it can be done is shown by services people already use: Proton Drive
and Proton Docs open an encrypted document by a link without an account.
They are the reference for the approach, a secret that stays in the
address, and not a model for the interface or the roles.

The model of private rooms is close to it already: the key of a file is
wrapped once for each recipient, so a link can be one more recipient with
a key pair of its own.

## What Changes

Nothing is built before the decisions below are taken. What is proposed:

- A private item shows that it has active links, and how many.
- A member who may manage the access of a private room creates an external
  link to a file, a folder or the room, as for an ordinary item: a primary
  link and additional ones within the limits the server has today, with the
  access to view, to comment, to review or to edit.
- The link keeps the settings of an ordinary link that the server can
  enforce without reading the content: a title, an end date, a password, a
  limit of uses and "DocSpace users only".
- Two things of an ordinary link are not offered: the access to fill
  forms, since forms are not filled in private rooms, and the download
  ban, which encryption cannot keep.
- The browser makes a key pair for the link. The address of the link ends
  in a secret after `#`, which a browser never sends to a server; the
  private key of the link is stored on the server sealed under that secret
  and, when one is set, the password.
- The keys of the files the link covers are wrapped for the link as they
  are for a member, by the creator at once and by every later uploader.
- A visitor opens the address: the browser proves to the server that it
  knows the secret, gets the sealed key, the wraps and the ciphertext, and
  decrypts in the page. With the access to view the visitor reads and
  downloads; with the others the visitor works in the editor.
- Revoking a link removes its wraps and its key on the server.
- A portal administrator can forbid external links of private rooms.
- The limits are stated as requirements: whoever holds the address reads
  what it covers, a revoked link takes back nothing already opened, and
  the server cannot scan, preview or convert what a link serves.

Out of scope:

- Links for members ("link for room members"), invitation links and
  embedding, which stay withheld.
- The SDK. It offers no link controls for private items and serves no
  page of a visitor in this change; a link made in the client works
  whatever the SDK shows.
- A visitor who adds files through a link. Decided by the owner on
  2026-11-16: a link never lets a visitor upload.
- Groups and guests as members of a private room.
- The desktop application.
- Any client code, mock or contract test before the server work has
  merged.

Decisions that need a human: none open.

Decided by the owner on 2026-11-16:

- A link without a password is made only for one file, with the access to
  view and an end date, preset to seven days. Every other link, to a folder or a room or with
  the access to comment, review or edit, has a password. A link without a
  password is as strong as one with it against the server, the network
  and a guess of the secret; it does not protect against somebody who
  gets the address itself, and the rule bounds what such a person reads
  to one file for a limited time.
- The promise is worded by who decides, not by who reads: only the people
  the user gave access to can read, the members of the room and the
  holders of the links the user made, and the service holds no key. The
  interface says at the creation of a link that the link carries the key,
  and at its revocation that what was opened stays with whoever opened
  it.
- A private Virtual Data Room whose room-wide restriction on downloading
  is on takes no external link, and the links it holds stop working while
  the restriction is on: a visitor has to receive the encrypted file to
  see anything, and the restriction could not be kept.
- The owner and the managers of the room can copy the address of an
  existing link. The secret of the link is therefore stored wrapped for
  each of them, as a file key is.
- When a member who could copy the addresses leaves the room or stops
  being a manager, the links stay, and the interface warns at that moment
  that the member still knows them and offers to revoke them.
- The password of a link can be replaced and not read: nobody, the server
  included, stores it in a readable form. A new password leaves the
  address as it is.
- The link types, the roles and the settings are the portal's own; Proton
  is the reference for the approach only.
- The access to view comes first; commenting, reviewing and editing
  follow together, after the Document Server opens a saved encrypted
  document again (`private-rooms-editor-contract` 6.2) and confirms an
  encrypted session for a visitor.
- Whoever may change the access of the room creates a link; a portal
  setting, on by default, lets a portal administrator switch the links
  off.
- A link never lets a visitor upload files.

Depends on: `../server` for the key material of a link, the proof of the
secret, the routes a visitor reads through, the editor configuration for a
visitor and the portal setting; the server refuses every link in a private
room today (design.md, Context). The Document Server team for an encrypted
session of a visitor. `private-rooms-editor-contract` 6.2 for every access
but viewing.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `private-rooms/encryption-core`: the key pair of a link, the secret in
  the address, and the limits that follow.
- `private-rooms/room-membership`: external links are offered for private
  items; member links and embedding stay withheld.
- `private-rooms/file-operations`: what a visitor of a link can do.
- `private-rooms/server-contract`: the behaviour asked of the server.
- `private-rooms/sdk-surface`: the SDK offers no external links of
  private items.

## Impact

- `../server`, by the backend team, on its own branch.
- The Document Server, for every access but viewing.
- Later, in this repository: `packages/shared/services/encryption` and
  `packages/shared/services/private-room` (the link key and the wraps for
  it), `packages/shared/api` with its mocks and contract tests, the public
  pages of `packages/client` (`PublicRoom`, `PublicPreview`), the link
  controls the client already has for ordinary items, which are withheld
  for private ones today, `packages/doceditor` for a visitor,
  and Common locale keys.
- `private-rooms-release-gate`: its documentation pack states the new
  promise.
