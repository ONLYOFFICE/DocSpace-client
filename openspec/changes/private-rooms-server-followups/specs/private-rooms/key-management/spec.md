# Spec Delta

## MODIFIED Requirements

### Requirement: Keys management tab follows the Private section
The system SHALL show the Keys management tab (Common:KeysManagement) in the profile, and serve its routes, while the Private section is available or while the user holds an encryption key, and never to a guest. A user who holds a key SHALL keep the tab while the E2E rooms app is off, so they can still unlock, export, change and reset their key.

#### Scenario: Section available
- **WHEN** a user opens their profile while the Private section is available
- **THEN** the Keys management tab is shown and `/profile/keys-management` opens it

#### Scenario: App off, no key
- **WHEN** a user without an encryption key opens their profile on a portal where the E2E rooms app is off
- **THEN** no Keys management tab is shown and `/profile/keys-management` does not resolve to the page

#### Scenario: App off, key held
- **WHEN** a user who holds an encryption key opens their profile on a portal where the E2E rooms app is off
- **THEN** the Keys management tab is shown and its actions work as with the app on

#### Scenario: Guest
- **WHEN** a guest opens their profile, with the Private section available, or with a key that an account made a guest by an earlier server still holds
- **THEN** no Keys management tab is shown and `/profile/keys-management` does not resolve to the page

#### Scenario: User turned into a guest
- **WHEN** a user who held an encryption key is turned into a guest and opens their profile
- **THEN** the account holds no key, belongs to no private room, and no Keys management tab is shown
