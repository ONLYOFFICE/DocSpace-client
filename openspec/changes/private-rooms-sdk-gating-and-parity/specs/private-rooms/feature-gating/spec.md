# Spec Delta

## MODIFIED Requirements

### Requirement: SDK private routes honour the host opt-in
The system SHALL serve the embeddable SDK private-room pages under `/sdk/private*` only when the embedding host passes the private-rooms opt-in; the client application passes its own flag state when it frames these pages. Without the opt-in the pages render the not-available view.

#### Scenario: SDK route without the flag
- **WHEN** a signed-in user opens `/sdk/private` and the host has not enabled private rooms
- **THEN** the not-available view renders and no private-room data is requested

#### Scenario: Client passes its flag
- **WHEN** the client's E2E rooms page is opened with the flag set
- **THEN** the framed SDK page renders the private rooms list

## RENAMED Requirements

- FROM: `### Requirement: SDK private routes are not gated by the flag`
- TO: `### Requirement: SDK private routes honour the host opt-in`
