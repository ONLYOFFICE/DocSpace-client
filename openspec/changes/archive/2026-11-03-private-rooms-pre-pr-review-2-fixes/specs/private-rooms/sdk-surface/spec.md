# Spec Delta

## ADDED Requirements

### Requirement: Private room creation waits for a known key list
The SDK SHALL treat a key list that is not loaded, or failed to load, as one that may hold a key: the private-room dialog SHALL NOT offer key generation or import until the list is known to be empty. Creating a room while the list is unknown SHALL load it first; a load that fails SHALL show Common:EncryptionKeysLoadFailed and create nothing.

#### Scenario: Key list still loading
- **WHEN** a user who holds a key opens the private-room dialog before the key list has loaded
- **THEN** the dialog offers no key generation, and its Create button creates the room once the list has loaded

#### Scenario: Key list failed to load
- **WHEN** the key list fails to load and the user presses Create in the private-room dialog
- **THEN** Common:EncryptionKeysLoadFailed is shown, no key is generated and no room is created

#### Scenario: Key list known to be empty
- **WHEN** the key list has loaded and holds no key
- **THEN** the dialog offers key generation as before

### Requirement: SDK invitations into a private room are sent one invitee per request
The SDK SHALL invite into a private room as the room-membership requirements "Private-room invitations are sent one invitee per request" and "Refused invitees are named in the invite result" describe.

#### Scenario: One invitee has never registered a key
- **WHEN** the SDK invite panel invites A, who holds a key, and B, who never registered one, into a private room
- **THEN** A becomes a member and receives the file keys, and the result names B with Common:EncryptedInviteNoKey
