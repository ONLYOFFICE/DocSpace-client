# Spec Delta

## MODIFIED Requirements

### Requirement: Administrators switch private rooms for the portal
The system SHALL let a portal administrator turn the private rooms setting on and off from the portal settings. The control SHALL NOT carry the Beta badge. Users who are not portal administrators SHALL NOT see the control. Other users SHALL see the new state at the latest after their next page load.

#### Scenario: Administrator turns the setting on
- **WHEN** a portal administrator turns the private rooms setting on and another user reloads the page
- **THEN** that user is offered the Private section and the Keys management tab

#### Scenario: Not an administrator
- **WHEN** a user who is not a portal administrator opens the portal settings
- **THEN** no private rooms control is shown

#### Scenario: No beta label
- **WHEN** a portal administrator opens the private rooms control
- **THEN** no Beta badge is shown next to it
