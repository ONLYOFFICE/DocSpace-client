# Spec Delta

## MODIFIED Requirements

### Requirement: Private room is a flagged Custom room
The system SHALL present "Private room" as its own room type in the create-room dialog opened from the Private section, while sending the server a Custom room with the private flag set to true. Only a Custom room SHALL be encryptable; a room of any other type SHALL be created with the private flag set to false.

#### Scenario: Private card chosen
- **WHEN** the user creates a room from the Private section, where the dialog shows the Private room type, and confirms creation
- **THEN** the create request carries room type Custom and the private flag set to true

#### Scenario: Other room type
- **WHEN** a Public, Form filling, Virtual data or Collaboration room is created
- **THEN** the create request carries the private flag set to false and the room is not encrypted
