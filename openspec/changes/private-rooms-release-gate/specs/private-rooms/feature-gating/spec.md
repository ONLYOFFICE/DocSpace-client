# Spec Delta

## ADDED Requirements

### Requirement: Administrators switch private rooms for the portal
The system SHALL let a portal administrator, on SaaS and standalone portals, turn the private rooms portal setting on and off from the portal settings. The setting is delivered with the server settings. The control SHALL NOT carry the Beta badge. Users who are not portal administrators SHALL NOT see the control. Other users SHALL see the new state at the latest after their next page load.

#### Scenario: Administrator turns the setting off
- **WHEN** a portal administrator turns the private rooms setting off and another user reloads the page
- **THEN** that user is no longer offered the Private section, and keeps the Keys management tab only if they hold a key

#### Scenario: Not an administrator
- **WHEN** a user who is not a portal administrator opens the portal settings
- **THEN** no private rooms control is shown

#### Scenario: No beta label
- **WHEN** a portal administrator opens the private rooms control
- **THEN** no Beta badge is shown next to it

## MODIFIED Requirements

### Requirement: Private rooms are offered on every portal
The system SHALL offer private rooms on every portal, SaaS and standalone, while the private rooms portal setting allows them, with no opt-in of the user. On a standalone portal the E2E rooms app SHALL also be on. A settings payload without the setting SHALL count as allowing private rooms, so a server without the setting keeps the behaviour of the beta. No browser-local value and no URL parameter SHALL turn the feature on or off.

#### Scenario: SaaS portal
- **WHEN** a user loads the client on a SaaS portal whose setting allows private rooms
- **THEN** the Private section and the Keys management tab are offered as the other private-rooms requirements describe

#### Scenario: Standalone portal with the app on
- **WHEN** a user loads the client on a standalone portal whose setting allows private rooms and where the E2E rooms app is on
- **THEN** the Private section and the Keys management tab are offered as on SaaS

#### Scenario: Standalone portal with the app off
- **WHEN** a user loads the client on a standalone portal where an administrator switched the E2E rooms app off
- **THEN** the Private section, the E2E rooms app and the Private room type are absent, and the Keys management tab is shown only to users who hold a key

#### Scenario: Setting off
- **WHEN** a user loads the client on a portal whose setting does not allow private rooms
- **THEN** the Private section, the E2E rooms app and the Private room type are absent, whatever the state of the app, and the Keys management tab is shown only to users who hold a key

#### Scenario: Setting absent from the payload
- **WHEN** the server sends a settings payload without the setting
- **THEN** private rooms are offered as with the setting on

#### Scenario: Browser-local flag ignored
- **WHEN** localStorage holds a `privateRooms` entry, or the address carries `?privateRooms=true`, on a portal whose setting does not allow private rooms
- **THEN** no private-rooms surface appears and nothing is written to localStorage
