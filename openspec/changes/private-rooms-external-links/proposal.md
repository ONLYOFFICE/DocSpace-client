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
- A visitor who adds files through a link. Uploading needs a link that
  wraps for the members and is left for a later change.
- Groups and guests as members of a private room.
- The desktop application.
- Any client code, mock or contract test before the server work has
  merged.

Decisions that need a human, with the answer this proposal assumes:

1. The order of the work. Assumed: the access to view first; commenting,
   reviewing and editing together after the Document Server opens a saved
   encrypted document again (`private-rooms-editor-contract` 6.2) and
   confirms an encrypted session for a visitor.
2. Who may create a link and who may forbid it. Assumed: whoever may
   change the access of the room; a portal setting, on by default, that a
   portal administrator can switch off.
3. Whether a link can be made without a password. Assumed: yes, the secret
   in the address is enough, and the password is a second factor sent by
   another channel.
4. What the marketing and the release notes say, since "only members who
   hold a key can read" stops being true for a room with a link.

Decided by the owner on 2026-11-16: the link types, the roles and the
settings are the portal's own; Proton is the reference for the approach
only.

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

## Impact

- `../server`, by the backend team, on its own branch.
- The Document Server, for every access but viewing.
- Later, in this repository: `packages/shared/services/encryption` and
  `packages/shared/services/private-room` (the link key and the wraps for
  it), `packages/shared/api` with its mocks and contract tests, the public
  pages of `packages/client` (`PublicRoom`, `PublicPreview`), the link
  controls the client and the SDK already have for ordinary items, which
  are withheld for private ones today, `packages/doceditor` for a visitor,
  and Common locale keys.
- `private-rooms-release-gate`: its documentation pack states the new
  promise.
