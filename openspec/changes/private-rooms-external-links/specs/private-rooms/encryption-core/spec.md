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
