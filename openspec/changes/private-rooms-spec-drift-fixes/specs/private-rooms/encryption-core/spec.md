## MODIFIED Requirements

### Requirement: Peer public keys are pinned on first use
The system SHALL pin each peer's public key the first time it is seen (per current user, in IndexedDB with an in-memory fallback when IndexedDB is unavailable), and SHALL compare later keys against the pin in constant time. The pin is the peer's most recently accepted key: an earlier key of the peer SHALL count as a key change, and a pin that cannot be read SHALL count as a refused key change, never as a first sight.

#### Scenario: First sight
- **WHEN** a peer's key is seen for the first time
- **THEN** it is stored as the pinned key for that user

#### Scenario: IndexedDB unavailable
- **WHEN** IndexedDB cannot be opened
- **THEN** pins are kept in memory for the session and the operation continues

#### Scenario: Peer returns to an earlier key
- **WHEN** a peer whose changed key was accepted presents the key it had before
- **THEN** the key-change dialog is shown, and nothing is decrypted or wrapped with that key unless the user accepts it

#### Scenario: Pin cannot be read
- **WHEN** the pin store is open but reading a peer's pin fails
- **THEN** the key is not pinned, no file is decrypted with it, no wrap is produced for it, and the stored pin is not overwritten

### Requirement: Decrypted filenames are session-scoped
The system SHALL cache decrypted filenames only in sessionStorage and SHALL clear the cache whenever the identity is locked, an unlocked session that expires on its own included.

#### Scenario: Lock clears names
- **WHEN** the identity locks (explicitly, on idle, or on tab hidden)
- **THEN** the filename cache is emptied and the list shows opaque names until the next unlock

#### Scenario: Unlocked session expires
- **WHEN** the unlocked identity expires without an explicit lock
- **THEN** the filename cache is emptied as on any other lock
