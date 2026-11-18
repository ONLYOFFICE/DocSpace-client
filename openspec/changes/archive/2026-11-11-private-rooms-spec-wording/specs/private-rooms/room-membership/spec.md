# Spec Delta

## RENAMED Requirements

- FROM: `### Requirement: Leaving a room revokes own access first`
- TO: `### Requirement: Leaving a room drops the role without a client revocation`

## MODIFIED Requirements

### Requirement: Leaving a room drops the role without a client revocation
The system SHALL drop the leaver's role without a revocation of its own when a member leaves a private room; the server removes the leaver's wrapped keys with the role, the room's current owner excepted.

#### Scenario: Leave succeeds
- **WHEN** a member confirms leaving a private room
- **THEN** the role is dropped and the leaver's keys are gone from every encrypted file of the room

#### Scenario: Cleanup fails
- **WHEN** the role update fails before the server has written the role
- **THEN** the member stays in the room with their keys and the failure is shown
