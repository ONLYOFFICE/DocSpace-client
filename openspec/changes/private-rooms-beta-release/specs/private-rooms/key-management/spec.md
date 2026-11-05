# Spec Delta

## ADDED Requirements

### Requirement: Keys management tab follows the Private section
The system SHALL show the Keys management tab (Common:KeysManagement) in the profile, and serve its routes, while the Private section is available or while the user holds an encryption key. A user who holds a key SHALL keep the tab when an administrator switches the E2E rooms app off, so they can still unlock, export, change and reset their key.

#### Scenario: Section available
- **WHEN** a user opens their profile while the Private section is available
- **THEN** the Keys management tab is shown and `/profile/keys-management` opens it

#### Scenario: App off, no key
- **WHEN** a user without an encryption key opens their profile on a standalone portal where the E2E rooms app is off
- **THEN** no Keys management tab is shown and `/profile/keys-management` does not resolve to the page

#### Scenario: App off, key held
- **WHEN** a user who holds an encryption key opens their profile on a standalone portal where the E2E rooms app is off
- **THEN** the Keys management tab is shown and its actions work as with the app on

### Requirement: Keys management tab carries the Beta badge
The system SHALL show the Beta badge after the label of the Keys management tab. The badge tooltip SHALL show the title Common:PrivateRoomsBetaTitle and the text Common:PrivateRoomsBetaDescription, followed by the feedback links the other Beta badges of the client show.

#### Scenario: Tab label
- **WHEN** the profile renders with the Keys management tab
- **THEN** the tab label is followed by the Beta badge

#### Scenario: Badge tooltip
- **WHEN** the user opens the tooltip of the Beta badge of the tab
- **THEN** it shows Common:PrivateRoomsBetaTitle as its title and Common:PrivateRoomsBetaDescription with the feedback links

## REMOVED Requirements

### Requirement: Keys management tab exists only behind the feature flag
**Reason**: Replaced by "Keys management tab follows the Private section".
**Migration**: The tab and its routes read the section availability and the user's keys instead of the browser flag.
