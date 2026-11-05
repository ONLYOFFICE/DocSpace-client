# Spec Delta

## MODIFIED Requirements

### Requirement: Unlocked identity lives in memory with idle expiry
The system SHALL keep the unlocked private key only in process memory, in a single slot bound to the user id, and SHALL discard it after 30 minutes without use. Idle expiry and auto-lock affect this slot only; a remembered-device record is governed by its own maximum age.

#### Scenario: Idle expiry
- **WHEN** 30 minutes pass without any encryption operation
- **THEN** the next operation finds the identity locked

#### Scenario: User switch
- **WHEN** a different user id requests the slot
- **THEN** the stored key is wiped and nothing is returned

#### Scenario: Idle expiry on a remembered device
- **WHEN** the in-memory slot expires and a remembered-device record within its age limit exists
- **THEN** the next operation restores the key from the record without a prompt

### Requirement: Remembered device keeps the key in IndexedDB
The system SHALL, when the user opts to remember the device, store the private key in IndexedDB encrypted with AES-GCM under a non-extractable wrapping key kept in the same database, together with the time it was written. It SHALL restore the key silently on the next identity request, including after auto-lock, until the user locks or forgets the device or the record is older than the maximum age (30 days by default).

#### Scenario: Silent restore
- **WHEN** a remembered device needs the identity after a page reload
- **THEN** the key is restored without a passphrase prompt

#### Scenario: Explicit lock forgets the device
- **WHEN** the user chooses Lock now or Forget device
- **THEN** the IndexedDB record is deleted

#### Scenario: Record older than the maximum age
- **WHEN** a restore finds a record written more than 30 days ago, or with a timestamp in the future
- **THEN** the record is deleted and no key is returned, so the caller prompts the user

#### Scenario: Successful passphrase unlock refreshes the record
- **WHEN** the user unlocks with the passphrase and the remember option on a device whose record expired
- **THEN** a new record with the current time replaces the old one
