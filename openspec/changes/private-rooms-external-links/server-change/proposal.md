# Proposal (draft for `../server`)

A draft of the change the server needs for external links of private
items, written for the server's own OpenSpec (`../server/openspec`) and by
its rules. It lives in the client repository until the backend team takes
it; nothing in `../server` is changed from here. The client side is
`private-rooms-external-links`, whose design.md holds the reasons.

Read against `../server` at `0396e6910f` on 2026-11-16.

## Why

A private room is reached through membership only. The product owner
decided on 2026-11-16 to allow external links to encrypted items, with the
link types, the accesses and the settings the portal already has, while
the server still holds no key that opens the content.

A link becomes one more recipient of file keys: the browser of its creator
makes a key pair for the link, wraps the file keys for it and stores the
private half sealed under a secret that stays after `#` in the address.
The server never receives that secret, nor the password of such a link.

## What Changes

- `setRoomLink` and the operations that set a link on a file or a folder
  accept an external link on a private item when the request carries the
  link's key material; every other link stays refused.
- A link of a private item never carries the access to fill forms or the
  download ban, and has a password unless it is a link to one file to view
  with an end date.
- The password of such a link does not reach the server. The server stores
  a flag that one is needed and the hash of a proof value the visitor
  sends.
- A visitor is served the link's sealed key, the wraps made for the link
  and the stored ciphertext only against the proof.
- The operations that list the public keys a file is wrapped for, store a
  wrap and report missing wraps also cover the links of the item.
- A portal setting, on by default, switches external links of private
  rooms.
- Creating, changing, revoking and opening such a link are audited.

## Capabilities

- `private-rooms`: `setRoomLink`, `getRoomLinks`, `getUserKeysForRoom`,
  `getRoomCandidateKeys`, `getRoomMissingFileKeys`, the operation that
  issues file keys, `openEditFile`, and the new operations a visitor reads
  a link through.
- `shared-links`: `setRoomLink`, `getRoomLinks`, the operations that set
  and read the links of a file and of a folder, `getExternalShareData`
  and the operation that applies a link password. Its matrices of where a
  link is allowed, how many and with which settings apply to a private
  room of the same type unchanged, except for the rows named under "Breaks
  current behaviour".

The operationIds of the file and folder link operations and of the
password operation are to be filled in from `docspace-backend.yaml` by
whoever takes the draft.

## Breaks current behaviour

- `private-rooms`, "No links to a private room". Today `setRoomLink`
  answers 403 for every external link on a private room. After the change
  an external link with key material is stored; a request without it still
  gets 403, and so does every invitation link.
  - Web client: it offers no link for private items today, so no existing
    call changes; the client change shows the controls only after this
    lands.
  - SDKs and the OpenAPI document: three optional request fields and three
    response fields on a link, and new operations for a visitor.
  - Webhooks and socket events: the events of a link now also occur for
    private items; their payload must keep naming a private room by the
    neutral title ("Titles in webhooks").
  - Backup and restore: the sealed keys of links and the wraps made for
    links are key material like the rest and follow "Keys and file keys
    are not backed up"; a restored portal's links of private items open
    nothing.
  - Stored data: none exists, since no private item holds a link.
- `shared-links`, "Link settings by room type". For a private item the
  deny-download flag is refused instead of stored, and the password is not
  stored. Ordinary items are not affected.
- `shared-links`, "Deny-download on links combines with the VDR room
  setting". Open: in a private Virtual Data Room with the room-wide
  restriction on, a visitor must still receive the ciphertext to see
  anything. To be decided with the product owner before the delta is
  final.

## Deviations

None of the rows of `openspec/deviations.md` is touched. PR4 (backup
without keys) extends to the key material of links, as stated above.

## Out of scope

- A visitor who uploads through a link: decided against.
- Links for members, invitation links and embedding on private items.
- Groups and guests as members of a private room.
