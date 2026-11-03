# Spec Delta

## ADDED Requirements

### Requirement: Keys management tab follows the private rooms setting
The system SHALL show the Keys management tab (Common:KeysManagement) in the profile, and serve its routes, while the portal setting allows private rooms or while the user holds an encryption key. A user who holds a key SHALL keep the tab when the setting is turned off, so they can still unlock, export, change and reset their key.

#### Scenario: Setting on
- **WHEN** a user opens their profile while the setting allows private rooms
- **THEN** the Keys management tab is shown and `/profile/keys-management` opens it

#### Scenario: Setting off, no key
- **WHEN** a user without an encryption key opens their profile while the setting does not allow private rooms
- **THEN** no Keys management tab is shown and `/profile/keys-management` does not resolve to the page

#### Scenario: Setting off, key held
- **WHEN** a user who holds an encryption key opens their profile while the setting does not allow private rooms
- **THEN** the Keys management tab is shown and its actions work as with the setting on

### Requirement: Keys management tab carries the Beta badge
The system SHALL show the Beta badge after the label of the Keys management tab. The badge tooltip SHALL show Common:PrivateRoomsBetaDescription, followed by the feedback links the other Beta badges of the client show.

#### Scenario: Tab label
- **WHEN** the profile renders with the Keys management tab
- **THEN** the tab label is followed by the Beta badge

#### Scenario: Badge tooltip
- **WHEN** the user hovers or focuses the Beta badge of the tab
- **THEN** the tooltip shows Common:PrivateRoomsBetaDescription with the feedback links

## REMOVED Requirements

### Requirement: Keys management tab exists only behind the feature flag
**Reason**: Replaced by "Keys management tab follows the private rooms setting".
**Migration**: The tab and its routes read the portal setting and the user's keys instead of the browser flag.
