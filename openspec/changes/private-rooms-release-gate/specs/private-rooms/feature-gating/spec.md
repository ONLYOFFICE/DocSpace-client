# Spec Delta

## ADDED Requirements

### Requirement: Administrators switch private rooms for the portal
The system SHALL let a portal administrator turn private rooms off and on with the switch of the E2E rooms app in the apps settings, where the portal offers the apps settings. The control SHALL NOT carry the Beta badge. Users who are not portal administrators SHALL NOT see the control. Other users SHALL see the new state at the latest after their next page load.

#### Scenario: Administrator turns the setting off
- **WHEN** a portal administrator switches the E2E rooms app off and another user reloads the page
- **THEN** that user is no longer offered the Private section, and keeps the Keys management tab only if they hold a key

#### Scenario: Not an administrator
- **WHEN** a user who is not a portal administrator opens the portal settings
- **THEN** no private rooms control is shown

#### Scenario: No beta label
- **WHEN** a portal administrator opens the private rooms control
- **THEN** no Beta badge is shown next to it

## MODIFIED Requirements

### Requirement: Private rooms are offered on every portal
The system SHALL offer private rooms on every portal, SaaS and standalone, while the E2E rooms app is on for the portal, with no opt-in of the user. The state of the app SHALL decide on every portal, whether or not the portal offers the apps settings, and until it is read private rooms SHALL count as offered. No browser-local value and no URL parameter SHALL turn the feature on or off.

#### Scenario: SaaS portal
- **WHEN** a user loads the client on a SaaS portal where the E2E rooms app is on
- **THEN** the Private section and the Keys management tab are offered as the other private-rooms requirements describe

#### Scenario: Standalone portal with the app on
- **WHEN** a user loads the client on a standalone portal where the E2E rooms app is on
- **THEN** the Private section and the Keys management tab are offered as on SaaS

#### Scenario: Standalone portal with the app off
- **WHEN** a user loads the client on a standalone portal where an administrator switched the E2E rooms app off
- **THEN** the Private section, the E2E rooms app and the Private room type are absent, and the Keys management tab is shown only to users who hold a key

#### Scenario: App off on a portal that is not standalone
- **WHEN** a user loads the client on a portal that is not standalone, where the E2E rooms app is off
- **THEN** the Private section and the Private room type are absent, and the Keys management tab is shown only to users who hold a key

#### Scenario: Browser-local flag ignored
- **WHEN** localStorage holds a `privateRooms` entry, or the address carries `?privateRooms=true`, on a portal where the E2E rooms app is off
- **THEN** no private-rooms surface appears and nothing is written to localStorage
