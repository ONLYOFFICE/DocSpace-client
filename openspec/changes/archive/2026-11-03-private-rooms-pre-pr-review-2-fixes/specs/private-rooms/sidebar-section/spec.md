# Spec Delta

## ADDED Requirements

### Requirement: Live updates skip rooms the user cannot read
The system SHALL read a room or folder that arrives through a live update without the forbidden handling, and SHALL drop the update silently when the read is refused or fails. The server sends the events of every room in Rooms to all portal administrators, including private rooms they are not members of, so a refused read is an expected outcome, not an error the user caused.

#### Scenario: Administrator outside a new private room
- **WHEN** a portal administrator has the Rooms list open and another user creates a private room the administrator is not a member of
- **THEN** no Access denied message is shown, the rights of the open list are not refreshed, and the room is not inserted

#### Scenario: Private room updated
- **WHEN** a private room the administrator is not a member of is renamed while the administrator has the Rooms list open
- **THEN** no Access denied message is shown and the list is unchanged
