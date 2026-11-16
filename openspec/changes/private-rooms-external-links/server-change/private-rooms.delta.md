# Spec Delta (draft for `../server/openspec/specs/private-rooms`)

Field names, sizes and status codes below are proposals; the backend team
sets the final ones.

## MODIFIED Requirements

Current text, quoted from `../server/openspec/specs/private-rooms/spec.md`
at `0396e6910f`:

> ### Requirement: No links to a private room
>
> `setRoomLink` MUST answer 403 for an external and for an invitation link on a private room, because somebody entering by a link
> holds no key. Revoking an existing link stays possible.
>
> #### Scenario: Creating a link
>
> - **WHEN** the owner sets an external or an invitation link
> - **THEN** the answer is 403

### Requirement: No links to a private room

`setRoomLink`, and the operations that set a link on a file or a folder, MUST answer 403 for an invitation link on a private item
and for an external link that carries no key material, because somebody entering by such a link holds no key. An external link
with key material is accepted as "External link of a private item" states. Revoking an existing link stays possible.

#### Scenario: Creating a link

- **WHEN** the owner sets an invitation link, or an external link without key material
- **THEN** the answer is 403

#### Scenario: Creating a link with key material

- **WHEN** the owner or a room manager sets an external link with `linkPublicKey`, `linkPrivateKeyEnc` and `linkProofHash`
- **THEN** the link is stored and the answer carries it

## ADDED Requirements

### Requirement: External link of a private item

An external link on a private room, or on a folder or file of one, SHALL be stored with `linkPublicKey`, `linkPrivateKeyEnc` and
`linkProofHash` next to the fields of an ordinary link, within the limits and the audience `shared-links` gives a room of the
same type. The access SHALL be read, comment, review or editing; form filling and `denyDownload` MUST be refused with 403.

#### Scenario: Limits of the room type

- **WHEN** a private Custom room already has its primary and five additional links and another is requested
- **THEN** the answer is 403, as for an open Custom room

#### Scenario: Private Virtual Data Room

- **WHEN** a link is set on a file of a private Virtual Data Room for anyone with the link
- **THEN** the link is for DocSpace users only, as in an open Virtual Data Room

#### Scenario: Form filling or deny-download

- **WHEN** the link is requested with the form filling access or with `denyDownload:true`
- **THEN** the answer is 403 and nothing is stored

### Requirement: Key material of a link has fixed sizes

`linkPublicKey` SHALL be 32 bytes and `linkProofHash` 32 bytes, both base64; `linkPrivateKeyEnc` SHALL be a non-empty string of at
most 4096 characters. A request with a missing, empty, malformed or oversized value MUST be refused with 400 and store nothing.

#### Scenario: Public key of another length

- **WHEN** `linkPublicKey` decodes to 31 or to 33 bytes
- **THEN** the answer is 400

#### Scenario: Empty sealed key

- **WHEN** `linkPrivateKeyEnc` is empty
- **THEN** the answer is 400

#### Scenario: Sealed key at and over the limit

- **WHEN** `linkPrivateKeyEnc` holds 4096 characters, and then 4097
- **THEN** the first is stored and the second answers 400

#### Scenario: Proof hash of another length

- **WHEN** `linkProofHash` decodes to a length other than 32 bytes
- **THEN** the answer is 400

### Requirement: A link of a private item without a password is limited

A link of a private item SHALL carry `passwordRequired:true`, unless it is a link to one file with the read access and an
expiration date. A request that breaks the rule, at creation or at a change, MUST be refused with 403. The password itself MUST
NOT be sent to the server; a request that carries `password` for such a link MUST be refused with 400.

#### Scenario: File link to read with an expiration date

- **WHEN** a link to one file with the read access, an expiration date and `passwordRequired:false` is set
- **THEN** it is stored

#### Scenario: Outside the rule

- **WHEN** a link with `passwordRequired:false` is set on a folder or a room, with another access, or without an expiration date
- **THEN** the answer is 403

#### Scenario: Password sent

- **WHEN** the request of a link of a private item carries `password`
- **THEN** the answer is 400 and nothing is stored

### Requirement: A link of a private item is served against its proof

The operations a visitor reads a link through SHALL answer with `linkPrivateKeyEnc`, the wraps made for the link and the stored
content only to a request that carries the proof whose hash is `linkProofHash`. Any other request MUST be answered as for an
invalid link. Wrong proofs SHALL be counted and blocked as wrong link passwords are.

#### Scenario: Valid proof

- **WHEN** a visitor sends the proof of a link that is neither revoked nor expired
- **THEN** the answer carries `linkPrivateKeyEnc`, and the items the link covers are served as stored, without conversion

#### Scenario: Wrong or missing proof

- **WHEN** a request names the link without the proof or with a wrong one
- **THEN** the answer carries no key, no wrap and no content

#### Scenario: Too many wrong proofs

- **WHEN** wrong proofs for one link keep coming from one address
- **THEN** the answer is 403 until the block expires

#### Scenario: Link for DocSpace users only without signing in

- **WHEN** a request for such a link comes from a visitor who is not signed in, with a valid proof
- **THEN** authentication is required first

### Requirement: Links are recipients of file keys

`getUserKeysForRoom` and the keys of one file SHALL list `linkPublicKey` of every working link that covers the file with the
members' keys. The operation that issues file keys SHALL store a wrap for such a link and refuse with 403 one for a link that
does not cover the file. `getRoomMissingFileKeys` SHALL report the files a link has no wrap for.

#### Scenario: Wrap for a link

- **WHEN** a member issues a file key for a link that covers the file
- **THEN** the wrap is stored

#### Scenario: Link that does not cover the file

- **WHEN** a member issues a file key for a link of another item, or for a revoked link
- **THEN** the answer is 403

#### Scenario: Link revoked

- **WHEN** a link is revoked
- **THEN** `linkPrivateKeyEnc` and every wrap made for the link are deleted

### Requirement: A visitor of a link acts with the access of the link

A visitor of a link of a private item SHALL get the rights of the link's access on the items it covers and none of a member's:
no upload, delete, move, rename, sharing or members. `openEditFile` SHALL answer the mode of the access, and a save MUST be
accepted only as an encrypted file.

#### Scenario: Read access

- **WHEN** a visitor of a link with the read access opens a document
- **THEN** the configuration is for viewing

#### Scenario: Upload through a link

- **WHEN** a visitor of a link with the editing access starts an upload into the folder the link covers
- **THEN** the answer is 403

### Requirement: The portal switches external links of private rooms

A portal setting, on by default, SHALL allow external links of private items; only the portal owner and DocSpace admins SHALL
change it. While it is off, setting such a link MUST answer 403 and an existing one MUST be served as an invalid link; nothing
is deleted.

#### Scenario: Setting off

- **WHEN** the setting is off and a room manager sets a link on a private item
- **THEN** the answer is 403

#### Scenario: Setting on again

- **WHEN** the setting is turned on again
- **THEN** the links stored before work as they did

### Requirement: The secret of a link is wrapped for those who manage links

The server SHALL store a wrap of the link's secret for the room's owner and for each room manager, answer a wrap only to the
user it was made for while that user manages links, and delete the wraps of a user who stops managing them; the links stay. It
SHALL report the managers who have no wrap of a link's secret.

#### Scenario: Wrap read by its manager

- **WHEN** a room manager reads the wrap of a link's secret made for them
- **THEN** the answer carries it

#### Scenario: Caller who does not manage links

- **WHEN** a member with a lower role, or a DocSpace admin outside the room, reads a wrap of a link's secret
- **THEN** the answer is 403

#### Scenario: Manager loses the role

- **WHEN** a room manager is removed from the room or given a lower role
- **THEN** the wraps made for that user are deleted and the links of the room keep working

### Requirement: Replacing the password of a link of a private item

A user who manages links SHALL replace `linkPrivateKeyEnc` and `linkProofHash` of an existing link, with `passwordRequired`; the
link keeps its id, `linkPublicKey` and the wraps made for it, and the proof of the earlier hash MUST be refused from then on. A
request that also changes `linkPublicKey` MUST be refused with 400.

#### Scenario: Password replaced

- **WHEN** a manager sends a new sealed key and proof hash for a link
- **THEN** the earlier proof is answered as for an invalid link and the new one is served

#### Scenario: Public key in the same request

- **WHEN** the request carries another `linkPublicKey`
- **THEN** the answer is 400 and nothing changes

### Requirement: No link in a private Virtual Data Room that restricts downloading

While the room-wide restriction on downloading and copying is on in a private Virtual Data Room, setting an external link on an
item of the room MUST answer 403, and a link the room holds MUST be served as an invalid link. The links SHALL NOT be deleted
and SHALL work again when the restriction is turned off.

#### Scenario: Link requested with the restriction on

- **WHEN** a room manager sets a link on a file of such a room
- **THEN** the answer is 403

#### Scenario: Restriction turned on and off

- **WHEN** the restriction is turned on in a room that holds a link, and then off
- **THEN** the link answers as invalid while it is on and is served again after
