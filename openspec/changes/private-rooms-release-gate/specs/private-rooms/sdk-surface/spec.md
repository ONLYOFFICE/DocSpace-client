# Spec Delta

## ADDED Requirements

### Requirement: SDK private surface follows the E2E rooms app
The SDK private routes SHALL render the "feature not available" view for a signed-in user while the E2E rooms app is off for the portal, also when the host has passed the private-rooms opt-in. An app the installation does not list SHALL count as off. When the state of the app cannot be read, the routes SHALL render as with the app on.

#### Scenario: SDK route with the app off
- **WHEN** the host configuration enables private rooms, the E2E rooms app is off and a signed-in user opens `/sdk/private`
- **THEN** the not-available view is rendered

#### Scenario: State of the app not known
- **WHEN** the request for the state of the app fails
- **THEN** the private pages render as with the app on
