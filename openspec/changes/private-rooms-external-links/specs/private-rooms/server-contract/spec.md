# Spec Delta

## MODIFIED Requirements

### Requirement: No external or invitation links on a private room
The server SHALL accept on an active private room, and on a folder or file inside one, only an external link that carries a link public key, a sealed private key and a proof hash, with the access to view and no download ban, from a caller who may change the access of the room, while the portal allows such links. It SHALL refuse with 403 any other external link and every invitation link, and with 400 a link whose key material is malformed, that sends a password, or whose new id somebody else holds. Every refusal SHALL come before anything of the request is stored. Revoking a link SHALL stay possible.

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
- **THEN** the link is stored as an ordinary link is, primary or additional within the limits of a room of the same type, with the access to view, its title, end date, limit of uses and internal flag, and whether it asks for a password

#### Scenario: Another access or a download ban requested
- **WHEN** an external link of a private item is requested with the access to comment, review, edit or fill forms, or with the download ban
- **THEN** the server refuses it with 403

#### Scenario: Malformed key material
- **WHEN** the public key or the proof hash of the request is not the canonical base64 of 32 bytes, or the sealed private key is empty or longer than 4096 characters
- **THEN** the server answers 400 and stores nothing

#### Scenario: Password sent
- **WHEN** the request of a link of a private item carries a password
- **THEN** the server answers 400 and stores nothing

#### Scenario: Id of a new link held by somebody else
- **WHEN** a new link is requested under an id that a user, a group, a share or another link holds
- **THEN** the server answers 400 and stores nothing

#### Scenario: Link of a file or a folder set by a room manager
- **WHEN** the owner or a room manager sets, reads or revokes an external link of a file or a folder of a private room
- **THEN** the request is served by the right to change the access of the room, and a member with a lower role reads no link

#### Scenario: Link read
- **WHEN** a member who may read the links of a private item reads one
- **THEN** the answer carries the public key of the link and whether it asks for a password, and neither the sealed private key nor the proof hash

#### Scenario: Portal forbids the links
- **WHEN** the portal setting for external links of private rooms is off
- **THEN** the server refuses to create one and serves none that exists

## ADDED Requirements

### Requirement: Links of an archived private room are not served
The server SHALL refuse with 403 an external link on an archived private room or on an item of one, and SHALL serve the links the room held as invalid while it is archived, as it does for an ordinary archived room. It SHALL NOT delete them; they work again when the room is restored.

#### Scenario: Link requested in the archive
- **WHEN** a room manager requests a link on an archived private room
- **THEN** the server answers 403

#### Scenario: Visitor of a link of an archived room
- **WHEN** a visitor opens a link the room held before it was archived
- **THEN** the server answers as for an invalid link, with any proof

#### Scenario: Room restored
- **WHEN** the room is restored
- **THEN** the link is served again

### Requirement: The secret of a link is stored wrapped for those who manage links
The server SHALL store, for a link of a private item, a wrap of its secret for the room's owner and for each room manager, SHALL give a wrap only to the user it was made for while that user manages links, and SHALL delete the wraps of a user who stops managing them. It SHALL report which managers have no wrap of a link's secret.

#### Scenario: Wrap read by its manager
- **WHEN** a room manager requests the wrap of a link's secret made for them
- **THEN** the server answers with it

#### Scenario: Member who does not manage links
- **WHEN** a member with a lower role, or an administrator outside the room, requests a wrap of a link's secret
- **THEN** the server refuses

#### Scenario: Manager loses the role
- **WHEN** a room manager is removed from the room or given a lower role
- **THEN** the wraps of the secrets made for that user are deleted, and the links stay

#### Scenario: Wrap for a user who does not manage links
- **WHEN** a request carries a wrap of a link's secret for a user who is neither the owner nor a room manager, or two wraps for one user
- **THEN** the server answers 400 and stores nothing

#### Scenario: Manager without a wrap
- **WHEN** a link is read while the owner or a room manager has no wrap of its secret
- **THEN** the answer names that user among the managers without a wrap

#### Scenario: Wrap added to an existing link
- **WHEN** a manager sends a wrap of the secret for another manager with a change of an existing link and no key material
- **THEN** the server stores the wrap and keeps the key material of the link

### Requirement: Password of a link of a private item is replaced with new key material
The server SHALL accept, from a user who manages links, a new sealed private key and a new proof hash for an existing link of a private item, keeping its id, its public key and its wraps, and SHALL refuse from then on the proof of the earlier ones.

#### Scenario: Password replaced
- **WHEN** a manager sends a new sealed key and proof hash for a link
- **THEN** the link keeps its address, the earlier proof is refused and the new one is served

#### Scenario: Public key changed in the same request
- **WHEN** the request also carries another public key for the link
- **THEN** the server answers 400 and changes nothing

#### Scenario: Password flag changed without new key material
- **WHEN** a change of an existing link says otherwise than the link whether a password is asked, and carries no key material
- **THEN** the server answers 400 and changes nothing

#### Scenario: Change meets a revocation
- **WHEN** a change of a link arrives while the same link is being revoked
- **THEN** the server answers 404 and the link stays revoked

### Requirement: No link in a private virtual data room that restricts downloading
The server SHALL refuse with 403 an external link on a private Virtual Data Room, or on an item of one, while the room-wide restriction on downloading is on, and SHALL serve none that the room holds until it is off. It SHALL NOT delete them.

#### Scenario: Link requested with the restriction on
- **WHEN** a room manager requests a link in such a room
- **THEN** the server answers 403

#### Scenario: Restriction turned on over existing links
- **WHEN** the restriction is turned on in a room that holds links, and then off again
- **THEN** the links are served as invalid while it is on and work again after

### Requirement: A link of a private item without a password is limited
The server SHALL refuse with 403 to store an external link of a private item that asks for no password, unless the link is to one file and has an end date. It SHALL apply the same rule when a link is changed, and SHALL count a new link that does not say whether it asks for a password as one that does.

#### Scenario: Link to a file to view with an end date
- **WHEN** a link to one file with an end date is requested as one that asks for no password
- **THEN** the server stores it

#### Scenario: Link without a password outside the rule
- **WHEN** a link that asks for no password is requested for a folder or a room, or without an end date
- **THEN** the server refuses it and stores nothing

#### Scenario: Password removed from a link
- **WHEN** a change removes the password of a link that the rule does not allow without one
- **THEN** the server refuses the change

#### Scenario: End date removed from a link without a password
- **WHEN** a change removes the end date of a link to a file that asks for no password
- **THEN** the server answers 403 and the link keeps its end date

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
The server SHALL open a session of a link of a private item only for a request that carries the proof value whose hash the link was stored with. It SHALL give the sealed private key of the link in the answer to that request and in no other, SHALL serve the wraps made for the link and the content it covers only within the session that request opened, and SHALL answer every other request with nothing of the link. It SHALL NOT store the proof value itself or accept the secret of the address.

#### Scenario: Valid proof
- **WHEN** a visitor without an account sends the proof of a link that is neither revoked nor past its end date
- **THEN** the server answers with the sealed key and opens a session that serves the items the link covers

#### Scenario: Request of an open session
- **WHEN** a request without a proof comes in the session a valid proof opened
- **THEN** the server serves the items the link covers and MUST NOT answer with the sealed key again

#### Scenario: Wrong or missing proof
- **WHEN** a request names a link with a wrong proof, or with no proof outside a session of the link
- **THEN** the server refuses it and MUST NOT answer with the sealed key, a wrap or any content

#### Scenario: Link that asks for no password requested without a proof
- **WHEN** a request names a link of a private item that asks for no password and carries no proof
- **THEN** the server answers as for a link that waits for its password, and serves nothing

#### Scenario: Repeated wrong proofs
- **WHEN** wrong proofs keep coming for one link
- **THEN** the server slows or blocks the requests as it does for a wrong link password

### Requirement: A visitor of a link gets the content as stored
The server SHALL serve a file to a visitor of an external link of a private item as the stored ciphertext with its wrap for the link, and SHALL NOT convert it, build a preview or a thumbnail of it, or index it. It SHALL give a visitor the right to read and to download what the link covers and none of the rights of a member.

#### Scenario: File requested through a link with the access to view
- **WHEN** a visitor of a link requests a file the link covers
- **THEN** the server answers with the ciphertext and the wrap, and reports no right to edit, delete, move, rename or share

#### Scenario: Document opened through a link
- **WHEN** a visitor of a link opens a document the link covers in the editors
- **THEN** the editor configuration carries the view mode, and a save of that session is refused

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

### Requirement: The address of a link of a private item is one route without a secret
The server SHALL build the address of an external link of a private room, folder or file as `share/private?key=<key>`, with `&folder=<id>` for a folder, and its short address, without a fragment. It SHALL NOT shorten an address a caller sends.

#### Scenario: Address of a link to a file
- **WHEN** a link of an encrypted file is set or read
- **THEN** its address is `share/private?key=<key>` on the portal, whatever the type of the file, and has no `#`

#### Scenario: Address of a link to a folder
- **WHEN** a link of a folder of a private room is set or read
- **THEN** its address is `share/private?key=<key>&folder=<id>` and has no `#`

#### Scenario: Short address followed
- **WHEN** the short address of such a link is requested
- **THEN** the server redirects to the stored address, and the redirect carries no fragment

### Requirement: The key material of a link goes with its item
The server SHALL delete the sealed key, the proof hash and the wraps of the secret of the links of a file, a folder with everything under it, or a private room when the item is deleted for good, and SHALL keep them while the item is in the Trash.

#### Scenario: Item deleted for good
- **WHEN** a file, a folder or a private room that holds links is deleted for good
- **THEN** nothing of the key material of those links is stored

#### Scenario: Item moved to the Trash and restored
- **WHEN** an item that holds a link is moved to the Trash and restored
- **THEN** the link and its key material are as they were
