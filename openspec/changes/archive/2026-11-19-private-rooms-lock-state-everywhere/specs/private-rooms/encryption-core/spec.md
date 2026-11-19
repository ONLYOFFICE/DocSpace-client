# Spec Delta

## MODIFIED Requirements

### Requirement: Remembered device keeps the key in IndexedDB
The system SHALL, when the user opts to remember the device, store the private key in IndexedDB encrypted with AES-GCM under a non-extractable wrapping key kept in the same database, together with the time it was written. It SHALL restore the key silently on the next identity request, including after auto-lock, until the user locks or forgets the device, deletes or resets the key, or the record is older than the maximum age (30 days by default).

#### Scenario: Silent restore
- **WHEN** a remembered device needs the identity after a page reload
- **THEN** the key is restored without a passphrase prompt

#### Scenario: Explicit lock forgets the device
- **WHEN** the user chooses Lock now or Forget device
- **THEN** the IndexedDB record is deleted

#### Scenario: Key deletion forgets the device
- **WHEN** the user deletes the key the record holds, or resets all keys, on this device
- **THEN** the IndexedDB record is deleted in the same action

#### Scenario: Record older than the maximum age
- **WHEN** a restore finds a record written more than 30 days ago, or with a timestamp in the future
- **THEN** the record is deleted and no key is returned, so the caller prompts the user

#### Scenario: Successful passphrase unlock refreshes the record
- **WHEN** the user unlocks with the passphrase and the remember option on a device whose record expired
- **THEN** a new record with the current time replaces the old one
