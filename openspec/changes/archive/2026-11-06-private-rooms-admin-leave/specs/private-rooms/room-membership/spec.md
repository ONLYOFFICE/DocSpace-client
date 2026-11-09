# Spec Delta

## ADDED Requirements

### Requirement: Leaving a private room ends its listing
The system SHALL treat a portal administrator or the portal owner who leaves a private room as any other member: the room SHALL leave the open list at once, and a user who leaves from inside the room SHALL be taken to the Private list without it. This covers the room's own leave action and the leave ticked in an ownership transfer. An ordinary room an administrator leaves SHALL stay listed, as before.

#### Scenario: Administrator leaves from the list
- **WHEN** a portal administrator leaves a private room from the Private list
- **THEN** the room's row is removed without a reload, and a later reload does not show it

#### Scenario: Administrator leaves through the owner change
- **WHEN** a portal administrator hands a private room over with the leave option ticked
- **THEN** the room's row is removed from the Private list once the transfer succeeds

#### Scenario: Administrator leaves from inside the room
- **WHEN** a portal administrator leaves a private room while it is open
- **THEN** they land on the Private list, which does not show the room

#### Scenario: Administrator leaves an ordinary room
- **WHEN** a portal administrator leaves a room without the private setting from the Rooms list
- **THEN** the room stays listed, as the server still lets them read it
