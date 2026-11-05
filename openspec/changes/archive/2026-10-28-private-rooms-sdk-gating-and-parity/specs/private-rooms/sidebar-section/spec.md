# Spec Delta

## MODIFIED Requirements

### Requirement: Section availability
The system SHALL make the Private section available only while two conditions hold: the private-rooms opt-in is set, and the E2E rooms app is on for the portal. Every app is on in SaaS. The opt-in is the browser-local flag, read once per page load, or, for the client in an embedded frame, the `privateRooms` property of the frame configuration, read once that configuration has arrived. Switching the app on or off in the apps settings SHALL take effect without a reload.

#### Scenario: Opt-in set and app on
- **WHEN** the page loads with the opt-in set on a portal where the E2E rooms app is on
- **THEN** the Private section is available

#### Scenario: Opt-in absent
- **WHEN** the page loads without the browser-local flag, outside a frame or in a frame whose configuration does not carry the opt-in
- **THEN** the Private section is not available, whatever the state of the app

#### Scenario: Opt-in from the frame configuration
- **WHEN** the client runs in an embedded frame whose configuration carries `privateRooms: true`, on a portal where the E2E rooms app is on
- **THEN** the Private section is available once the configuration has arrived, without the browser-local flag

#### Scenario: App switched off on a standalone portal
- **WHEN** an administrator switches the E2E rooms app off while the section is shown
- **THEN** the section disappears without a reload, and the Rooms section lists private rooms again

#### Scenario: Opt-in set after load
- **WHEN** the browser-local flag is set after the page loaded
- **THEN** the section stays unavailable until the page is reloaded
