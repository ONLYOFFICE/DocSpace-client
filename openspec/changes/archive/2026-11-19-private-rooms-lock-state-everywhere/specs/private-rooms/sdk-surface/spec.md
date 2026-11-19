# Spec Delta

## MODIFIED Requirements

### Requirement: Shell side effects
The private layout SHALL run the shell effects: the locks of the user's other pages that every page follows (key-management, "A lock reaches every tab of the user"), in-flight operations aborted on lock, encrypted file names recovered after unlock, the backfill sweep re-wrapping every member for a room manager once per room and page session, a device-setup hint only once the user's key list loaded empty, a one-per-session ghost-state toast, a gate reset after unlock, and a disclosure banner.

#### Scenario: Lock in another tab
- **WHEN** the identity is locked by Lock now, a key change or a logout in another page of the user, an SDK page or a client page
- **THEN** every SDK page of the user locks as well and aborts its encrypted operations, and the remembered record is left to the page that locked

#### Scenario: Idle lock in another tab
- **WHEN** another SDK page of the user locks after its idle time or because it was hidden
- **THEN** this SDK page stays unlocked

#### Scenario: Unlock recovers names
- **WHEN** the identity becomes unlocked on a private page
- **THEN** encrypted file names in the current list are decrypted and shown

#### Scenario: Manager enters a room
- **WHEN** a room manager with an unlocked identity enters a private room in the SDK for the first time in the page session
- **THEN** the backfill sweep runs once for that room and re-wraps every member with a verified key

#### Scenario: Hint waits for the key list
- **WHEN** a private page opens and the key list has not been loaded yet
- **THEN** no device-setup hint is shown until the list has loaded and contains no key for this device
