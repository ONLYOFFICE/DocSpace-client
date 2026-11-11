# Spec Delta

## ADDED Requirements

### Requirement: Key generation is withheld from guests
The system SHALL NOT let a guest start key generation, from the profile or from private room creation, in the client or in the SDK, since the server refuses every key write of a guest.

#### Scenario: Guest opens the profile
- **WHEN** a guest opens their profile while the Private section is available
- **THEN** no Keys management tab is shown, and key generation cannot be started

#### Scenario: Guest reaches the key offer of room creation
- **WHEN** private room creation would offer a guest to create a key
- **THEN** the offer is not made, no key generation starts, and the creation does not go on

## MODIFIED Requirements

### Requirement: Keys management tab follows the Private section
The system SHALL show the Keys management tab (Common:KeysManagement) in the profile, and serve its routes, while the Private section is available or while the user holds an encryption key, and never to a guest. A user who holds a key SHALL keep the tab when an administrator switches the E2E rooms app off, so they can still unlock, export, change and reset their key.

#### Scenario: Section available
- **WHEN** a user opens their profile while the Private section is available
- **THEN** the Keys management tab is shown and `/profile/keys-management` opens it

#### Scenario: App off, no key
- **WHEN** a user without an encryption key opens their profile on a standalone portal where the E2E rooms app is off
- **THEN** no Keys management tab is shown and `/profile/keys-management` does not resolve to the page

#### Scenario: App off, key held
- **WHEN** a user who holds an encryption key opens their profile on a standalone portal where the E2E rooms app is off
- **THEN** the Keys management tab is shown and its actions work as with the app on

#### Scenario: Guest
- **WHEN** a guest opens their profile, with the Private section available or holding a key from before they became a guest
- **THEN** no Keys management tab is shown and `/profile/keys-management` does not resolve to the page
