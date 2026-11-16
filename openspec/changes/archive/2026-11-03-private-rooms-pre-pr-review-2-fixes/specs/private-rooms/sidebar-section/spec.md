# Spec Delta

## ADDED Requirements

### Requirement: Live updates skip rooms the user cannot read
The system SHALL read a room or folder that arrives through a live update without the forbidden handling, and SHALL drop the update silently when the read is refused or fails. A refused read is an expected outcome, not an error the user caused.

#### Scenario: Administrator outside a new private room
- **WHEN** a live update names a new private room the user cannot read while the Rooms list is open
- **THEN** no Access denied message is shown, the rights of the open list are not refreshed, and the room is not inserted

#### Scenario: Private room updated
- **WHEN** a live update names a private room the user cannot read while the Rooms list is open
- **THEN** no Access denied message is shown and the list is unchanged
