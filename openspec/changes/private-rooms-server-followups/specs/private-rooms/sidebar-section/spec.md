# Spec Delta

## MODIFIED Requirements

### Requirement: Section availability follows the E2E rooms app
The system SHALL make the Private section available while the E2E rooms app is on for the portal, on a standalone portal and on any other, since the server serves private rooms by the state of that app on every installation. Until the state of the app is read, the section counts as available. For the client in an embedded frame, the frame configuration SHALL also carry the `privateRooms` property, read once that configuration has arrived. Switching the app on or off SHALL take effect without a reload.

#### Scenario: SaaS portal
- **WHEN** the page loads on a SaaS portal outside a frame, where the E2E rooms app is on
- **THEN** the Private section is available

#### Scenario: App off on a portal that is not standalone
- **WHEN** the page loads on a portal that is not standalone, where the E2E rooms app is off
- **THEN** the Private section is not available, and an address of the section is not opened before the state of the app is read

#### Scenario: Standalone portal with the app on
- **WHEN** the page loads on a standalone portal where the E2E rooms app is on
- **THEN** the Private section is available

#### Scenario: Frame configuration carries the opt-in
- **WHEN** the client runs in an embedded frame whose configuration carries `privateRooms: true`, on a portal where the E2E rooms app is on
- **THEN** the Private section is available once the configuration has arrived

#### Scenario: Frame configuration without the opt-in
- **WHEN** the client runs in an embedded frame whose configuration does not carry the opt-in
- **THEN** the Private section is not available in the frame

#### Scenario: App switched off on a standalone portal
- **WHEN** an administrator switches the E2E rooms app off while the section is shown
- **THEN** the section disappears without a reload, and private rooms are listed nowhere: the Rooms section leaves them out too

#### Scenario: App off, private room requested by id
- **WHEN** the address of a private room is opened while the E2E rooms app is off
- **THEN** the address opens under Rooms, the server answers that the room is not found, and nothing of the room is shown
