## ADDED Requirements

### Requirement: Accepted peer keys stay trusted
The system SHALL NOT withdraw trust from a peer key once it was pinned or accepted, because the server may list several key pairs for one user and files are wrapped by any of them. A key the server lists again for that peer is used without a dialog, even after a later key was accepted; protection against a re-listed key whose private half leaked rests on the server.

#### Scenario: Peer with several keys
- **WHEN** a peer whose two keys were both accepted sends files wrapped by either of them
- **THEN** every file opens without the key-change dialog

#### Scenario: Earlier key listed again
- **WHEN** a peer's earlier accepted key is listed again after a newer key was accepted
- **THEN** it is used without the key-change dialog

## MODIFIED Requirements

### Requirement: Peer public keys are pinned on first use
The system SHALL pin each peer's public key the first time it is seen (per current user, in IndexedDB with an in-memory fallback when IndexedDB is unavailable), and SHALL compare later keys against the peer's pinned and accepted keys in constant time. A pin that cannot be read SHALL count as a refused key change, never as a first sight.

#### Scenario: First sight
- **WHEN** a peer's key is seen for the first time
- **THEN** it is stored as the pinned key for that user

#### Scenario: IndexedDB unavailable
- **WHEN** IndexedDB cannot be opened
- **THEN** pins are kept in memory for the session and the operation continues

#### Scenario: Pin cannot be read
- **WHEN** the pin store is open but reading a peer's pin fails
- **THEN** the key is not pinned, no file is decrypted with it, no wrap is produced for it, and the stored pin is not overwritten

### Requirement: Key mismatch on unwrap is refused unless a resolver accepts it
The system SHALL, before unwrapping a DEK, compare the sender's public key with the pin. On mismatch it SHALL ask the registered key-change resolver; without a resolver, or when the resolver refuses, the unwrap SHALL fail with an authentication error before any decryption.

#### Scenario: No resolver registered
- **WHEN** a sender key mismatch is detected in a context with no dialog
- **THEN** the file is not decrypted

#### Scenario: User accepts the new key
- **WHEN** the key-change dialog is accepted
- **THEN** the new key joins the peer's trusted keys and the unwrap proceeds

### Requirement: Decrypted filenames are session-scoped
The system SHALL cache decrypted filenames only in sessionStorage and SHALL clear the cache whenever the identity is locked, an unlocked session that expires on its own included.

#### Scenario: Lock clears names
- **WHEN** the identity locks (explicitly, on idle, or on tab hidden)
- **THEN** the filename cache is emptied and the list shows opaque names until the next unlock

#### Scenario: Unlocked session expires
- **WHEN** the unlocked identity expires without an explicit lock
- **THEN** the filename cache is emptied as on any other lock
