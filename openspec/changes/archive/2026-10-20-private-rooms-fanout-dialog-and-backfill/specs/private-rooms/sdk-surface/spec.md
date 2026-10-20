# Spec Delta

## MODIFIED Requirements

### Requirement: Shell side effects
The private layout SHALL run the shell effects: lock state synchronised across tabs, in-flight operations aborted on lock, encrypted file names recovered after unlock, the backfill sweep that re-wraps every member for a room manager once per room and page session, a device-setup hint when the user has no keys, a one-per-session ghost-state toast, a gate reset after unlock, and a disclosure banner.

#### Scenario: Lock in another tab
- **WHEN** the identity is locked in one SDK tab
- **THEN** other SDK tabs lock as well and abort their encrypted operations

#### Scenario: Unlock recovers names
- **WHEN** the identity becomes unlocked on a private page
- **THEN** encrypted file names in the current list are decrypted and shown

#### Scenario: Manager enters a room
- **WHEN** a room manager with an unlocked identity enters a private room in the SDK for the first time in the page session
- **THEN** the backfill sweep runs once for that room and re-wraps every member with a verified key
