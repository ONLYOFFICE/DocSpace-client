# Spec Delta

## MODIFIED Requirements

### Requirement: No external or invitation links on a private room
The server SHALL accept on a private room, active or archived, and on a folder or file inside one, only an external link that carries a link public key, a sealed private key and a proof hash, with an access other than form filling and no download ban, from a caller who may change the access, while the portal allows such links. It SHALL refuse with 403 any other external link and every invitation link. Revoking a link SHALL stay possible.

#### Scenario: External link requested
- **WHEN** a room manager requests an external link for a private room without the link's key material
- **THEN** the server refuses the request with 403 and the room has no external link

#### Scenario: Invitation link requested
- **WHEN** a room manager requests an invitation link for a private room
- **THEN** the server refuses the request with 403 and no link is created

#### Scenario: Link revoked
- **WHEN** a room manager sets the access of a link that a private room still holds to none
- **THEN** the request is accepted, the link is removed, and its sealed key and its wrapped file keys are deleted

#### Scenario: External link with key material requested
- **WHEN** a room manager requests an external link for a private item with the link's public key, sealed private key and proof hash
- **THEN** the link is stored as an ordinary link is, primary or additional within the same limits, with its access, title, end date, password, limit of uses and internal flag

#### Scenario: Form filling or a download ban requested
- **WHEN** an external link of a private item is requested with the access to fill forms or with the download ban
- **THEN** the server refuses it with 403

#### Scenario: Portal forbids the links
- **WHEN** the portal setting for external links of private rooms is off
- **THEN** the server refuses to create one and serves none that exists

## ADDED Requirements

### Requirement: A link of a private item without a password is limited
The server SHALL refuse to store an external link of a private item without a password, unless the link is to one file, carries the access to view and has an end date. It SHALL apply the same rule when a link is changed.

#### Scenario: Link to a file to view with an end date
- **WHEN** a link to one file with the access to view, an end date and no password is requested
- **THEN** the server stores it

#### Scenario: Link without a password outside the rule
- **WHEN** a link without a password is requested for a folder or a room, with another access, or without an end date
- **THEN** the server refuses it and stores nothing

#### Scenario: Password removed from a link
- **WHEN** a change removes the password of a link that the rule does not allow without one
- **THEN** the server refuses the change

### Requirement: External links of a private item are recipients of file keys
The server SHALL list the public keys of the external links that cover a file with the public keys of its members, SHALL store a wrap of a file key for a link as for a member, and SHALL report which files a link has no wrap for.

#### Scenario: Keys of a room with a link
- **WHEN** a member reads the public keys a file of a linked room is wrapped for
- **THEN** the answer holds the keys of the members and the public key of each link that covers the file

#### Scenario: Wrap stored for a link
- **WHEN** a member writes the wrap of a file key for a link that covers the file
- **THEN** the server stores it

#### Scenario: Wrap for a link that does not cover the file
- **WHEN** a wrap names a link that does not cover the file, or a revoked one
- **THEN** the server refuses it and stores nothing

### Requirement: A link is served only against a proof of its secret
The server SHALL give the sealed private key of a link, the wraps made for it and the content it covers only to a request that carries the proof value whose hash the link was stored with, and SHALL answer every other request with nothing of the link. It SHALL NOT store the proof value itself or accept the secret of the address.

#### Scenario: Valid proof
- **WHEN** a visitor without an account sends the proof of a link that is neither revoked nor past its end date
- **THEN** the server answers with the sealed key and serves the items the link covers

#### Scenario: Wrong or missing proof
- **WHEN** a request names a link without its proof or with a wrong one
- **THEN** the server refuses it and MUST NOT answer with the sealed key, a wrap or any content

#### Scenario: Repeated wrong proofs
- **WHEN** wrong proofs keep coming for one link
- **THEN** the server slows or blocks the requests as it does for a wrong link password

### Requirement: A visitor of a link gets the content as stored
The server SHALL serve a file to a visitor of an external link of a private item as the stored ciphertext with its wrap for the link, and SHALL NOT convert it, build a preview or a thumbnail of it, or index it. It SHALL give a visitor the rights of the link's access and none of the rights of a member.

#### Scenario: File requested through a link with the access to view
- **WHEN** a visitor of a link with the access to view requests a file the link covers
- **THEN** the server answers with the ciphertext and the wrap, and reports no right to edit, delete, move, rename or share

#### Scenario: Document opened through a link with another access
- **WHEN** a visitor of a link with the access to comment, review or edit opens a document the link covers
- **THEN** the editor configuration carries that mode, and a save is accepted only as an encrypted file

#### Scenario: Internal link opened without signing in
- **WHEN** a request for a link made for DocSpace users only comes without a signed-in user
- **THEN** the server refuses it whatever proof it carries

#### Scenario: Item outside the link
- **WHEN** a visitor requests an item of the same room that the link does not cover
- **THEN** the server refuses

### Requirement: Use of an external link of a private item is audited
The server SHALL write an audit event when an external link of a private item is created, changed, revoked and opened, with the link, the item and the time, and with the member for the first three.

#### Scenario: Link opened
- **WHEN** a visitor opens a link with a valid proof
- **THEN** the audit trail holds the opening with the link and the time
