# Spec Delta

## MODIFIED Requirements

### Requirement: Section availability follows the E2E rooms app
The system SHALL make the Private section available while the private rooms portal setting allows private rooms and the E2E rooms app is on for the portal. Every app is on in SaaS, so there the setting alone decides. For the client in an embedded frame, the frame configuration SHALL also carry the `privateRooms` property, read once that configuration has arrived. Switching the app on or off in the apps settings SHALL take effect without a reload.

#### Scenario: SaaS portal
- **WHEN** the page loads on a SaaS portal outside a frame, and the setting allows private rooms
- **THEN** the Private section is available

#### Scenario: Standalone portal with the app on
- **WHEN** the page loads on a standalone portal whose setting allows private rooms and where the E2E rooms app is on
- **THEN** the Private section is available

#### Scenario: Setting off
- **WHEN** the page loads on a portal whose setting does not allow private rooms
- **THEN** the Private section is not available, whatever the state of the app

#### Scenario: Frame configuration carries the opt-in
- **WHEN** the client runs in an embedded frame whose configuration carries `privateRooms: true`, on a portal where the section is otherwise available
- **THEN** the Private section is available once the configuration has arrived

#### Scenario: Frame configuration without the opt-in
- **WHEN** the client runs in an embedded frame whose configuration does not carry the opt-in
- **THEN** the Private section is not available in the frame

#### Scenario: App switched off on a standalone portal
- **WHEN** an administrator switches the E2E rooms app off while the section is shown
- **THEN** the section disappears without a reload, and private rooms are listed nowhere: the Rooms section leaves them out too

## REMOVED Requirements

### Requirement: Private item carries the Beta badge
**Reason**: Private rooms leave the beta at general availability.
**Migration**: Remove the badge from the Private sidebar item. Common:PrivateRoomsBetaTitle and Common:PrivateRoomsBetaDescription go once no surface uses them.
