# Spec Delta

## ADDED Requirements

### Requirement: An external link has a key pair of its own
The system SHALL give each external link of a private item an X25519 key pair made in the creator's browser, and SHALL wrap for the link's public key the key of every file the link covers, as for a member, with the id of the link as the recipient. The private key of the link SHALL NOT reach the server unsealed.

#### Scenario: Link to a file created
- **WHEN** a member creates an external link to an encrypted file
- **THEN** the server receives the link's public key, its sealed private key and one wrap of the file key for the link

#### Scenario: File added under a linked folder
- **WHEN** a member uploads a file into a folder or a room that an external link covers
- **THEN** the file key is wrapped for the link as well as for the members

#### Scenario: Wrap made for a member offered to a link
- **WHEN** a wrap made for a member, or for another link, is opened with the key of a link
- **THEN** opening fails

### Requirement: The secret of a link stays in the address
The system SHALL seal the private key of a link under a key derived from 256 random bits placed after `#` in the address, mixed with the link's password when one is set, and SHALL derive the value shown to the server as a proof under a separate label, so that the proof does not open the sealed key.

#### Scenario: Address without the secret
- **WHEN** the address of a link is opened without the part after `#`
- **THEN** nothing is decrypted and the page says the link is incomplete

#### Scenario: Wrong password
- **WHEN** a visitor enters a wrong password for a link that has one
- **THEN** the sealed key does not open and no file key is produced

#### Scenario: Proof seen by the server
- **WHEN** the server holds the proof value of a link and its sealed private key
- **THEN** the proof value does not open the sealed key

### Requirement: A link holder reads what the link covers
The system SHALL NOT claim that a private item with an external link is closed to anybody but its members: whoever holds the address, and the password when one is set, reads every file the link covers. Revoking a link SHALL NOT be presented as recalling what was already opened or downloaded.

#### Scenario: Link created
- **WHEN** a member creates an external link
- **THEN** the interface says that anybody with the address can read the item, and offers a password and an end date

#### Scenario: Link revoked
- **WHEN** a member revokes an external link
- **THEN** the interface says that what was opened through it stays with whoever opened it

### Requirement: The page of a visitor keeps the secret of a link to the address
The system SHALL read the secret of an opened link from the part of the address after `#` and leave it there, so that the address opens the item again. It SHALL NOT write the secret to a log, to browser storage or to statistics, send it to any server, or load on that page a script from an origin other than the portal and its Document Server.

#### Scenario: Link opened
- **WHEN** a visitor opens the address of a link
- **THEN** the item is shown and no request of the page carries the part after `#`

#### Scenario: Page reloaded
- **WHEN** the visitor reloads the page
- **THEN** the item opens again from the same address, after the password when the link has one

#### Scenario: Script from another origin
- **WHEN** code on the page of a visitor asks for a script from an origin other than the portal and its Document Server
- **THEN** the policy of the page itself refuses it, whatever policy the answer of the server carried

### Requirement: Texts name who was given access, not who is a member
The system SHALL describe a private item that can carry an external link by who the user gave access to: the members of the room and the holders of the links the user made, with the service holding no key. It SHALL NOT say that only members can read, or use the term zero-knowledge.

#### Scenario: Description of private rooms
- **WHEN** the interface describes who can read a private room
- **THEN** it names the members and the holders of links the user made, and says the service has no key

#### Scenario: Link created
- **WHEN** a link is created
- **THEN** the interface says the link carries the key, so anybody who has it opens the item, and that the server does not get the key

### Requirement: The secret of a link is wrapped for those who manage links
The system SHALL wrap the secret of an external link for the public key of the room's owner and of each room manager, as a file key is wrapped and bound to the link, so that any of them can show the address again. It SHALL NOT store the secret anywhere else, SHALL NOT store the private key of the link anywhere but sealed on the server, and SHALL wrap the secret for a manager named later from the browser of one who holds it.

#### Scenario: Address copied by another manager
- **WHEN** a room manager who did not create the link copies its address
- **THEN** the secret is unwrapped with that manager's key and the address is the one the creator got

#### Scenario: Wrap offered to another link
- **WHEN** the wrap made for one link is opened as the wrap of another link, or with the key of another user
- **THEN** opening fails

#### Scenario: Manager named later
- **WHEN** a member becomes a room manager after a link was created
- **THEN** the secret is wrapped for them the next time a manager who holds it opens the room

#### Scenario: Member who does not manage links
- **WHEN** a member with a lower role looks at a link of the room
- **THEN** no wrap of its secret exists for them and the address cannot be shown

### Requirement: The secret of a link is encoded for an address
The system SHALL write the secret of a link after `#` as 43 characters of the URL-safe base64 alphabet without padding, and SHALL check the length and the alphabet of what it reads before any request to the server. A secret that fails the check SHALL be reported as an address copied incompletely, not as a wrong password or a missing link.

#### Scenario: Secret cut short
- **WHEN** a visitor opens an address whose part after `#` has fewer than 43 characters
- **THEN** the page says the address was copied incompletely and sends nothing

#### Scenario: Foreign character in the secret
- **WHEN** the part after `#` holds a character outside the alphabet
- **THEN** the page says the address was copied incompletely

#### Scenario: Shortened address
- **WHEN** the secret is appended to the shortened form of the link's address
- **THEN** the address opens the item as the long one does
