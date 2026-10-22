# Spec Delta

## ADDED Requirements

### Requirement: Client in an embedded frame takes the host opt-in
The client SHALL treat the `privateRooms` property of the frame configuration as the private-rooms opt-in while it runs inside an embedded frame, in addition to the browser-local flag. A framed list SHALL be requested only after that configuration has arrived, so it is scoped once.

#### Scenario: Host enables private rooms in a frame
- **WHEN** a host embeds the client with `privateRooms: true` in a browser without the flag, on a portal where the E2E rooms app is on
- **THEN** the Private section is available in the frame

#### Scenario: Frame without the property
- **WHEN** a host embeds the client without the property in a browser without the flag
- **THEN** the Private section is not available in the frame and the Rooms list carries no privacy filter

## MODIFIED Requirements

### Requirement: SDK private routes honour the host opt-in
The system SHALL serve the embeddable SDK private-room pages under `/sdk/private*` only when the embedding host passes the private-rooms opt-in. Without the opt-in the pages render the not-available view.

#### Scenario: SDK route without the flag
- **WHEN** a signed-in user opens `/sdk/private` and the host has not enabled private rooms
- **THEN** the not-available view renders and no private-room data is requested

## RENAMED Requirements

- FROM: `### Requirement: SDK private routes are not gated by the flag`
- TO: `### Requirement: SDK private routes honour the host opt-in`
