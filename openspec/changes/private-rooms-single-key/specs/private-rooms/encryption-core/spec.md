# Spec Delta

## ADDED Requirements

### Requirement: One selected key per user
The system SHALL operate with exactly one identity key per user. When the server lists several envelopes for a user, the system SHALL use the one with the newest server-set date, ties going to the last one listed, for the current user's own key and for every room member's key alike, and SHALL NOT register a second key for a user who already has one.

#### Scenario: Own key with leftover envelopes
- **WHEN** the server lists two envelopes for the current user
- **THEN** the envelope with the newer date is the user's key on every device and the other one is not used

#### Scenario: Member listed with two keys
- **WHEN** the room access list holds two keys for one member
- **THEN** the member's key with the newer date is the one used for that member

#### Scenario: File wrapped for an unused key
- **WHEN** the user's only access entry on a file was wrapped for an envelope that is not the selected one
- **THEN** the file cannot be unwrapped and the ghost-state notification applies

## MODIFIED Requirements

### Requirement: One access-list entry per user
The system SHALL write at most one wrap per user into a file's access list, because the server keys the list by file and user, and SHALL wrap for that user's selected key. A write SHALL never name the same user twice.

#### Scenario: Multi-key user at upload
- **WHEN** a file is wrapped for a user the server lists with two key pairs
- **THEN** the access list holds one entry for that user, wrapped for the selected key, and the write succeeds

### Requirement: Preferences stored in localStorage are validated on read
The system SHALL keep the auto-lock preset in localStorage and SHALL ignore values outside the allowed set when reading it back. No key choice and no migration progress is stored.

#### Scenario: Tampered auto-lock value
- **WHEN** the stored auto-lock value is not one of the offered presets
- **THEN** the default preset is used

### Requirement: Identity is per device
The system SHALL NOT synchronise unlocked identities or passphrases across devices. A new device SHALL need the passphrase-protected envelope or the recovery phrase of the user's key; only a user without a key generates one.

#### Scenario: Second device
- **WHEN** a user signs in on a second device
- **THEN** encrypted files show as inaccessible until the identity is unlocked or set up on that device

## REMOVED Requirements

### Requirement: Several identity envelopes per user
**Reason**: The client operates with one key per user; the server keeps at most one wrap per (file, user), so a second key never served a file.
**Migration**: Use the selected key; leftover envelopes are deleted through the unused-key cleanup in key management.

### Requirement: Active key is chosen per device and never auto-picked
**Reason**: With one key per user there is nothing to choose; the selection rule is deterministic and identical on every device.
**Migration**: Remove the per-device active-key preference; existing stored preferences are ignored.

### Requirement: Identity rotation re-wraps every file
**Reason**: Switching between a user's keys no longer exists; a new key is only reached by deleting or resetting the old one.
**Migration**: Remove the rotation runner and its checkpoints; an interrupted run is dropped.
