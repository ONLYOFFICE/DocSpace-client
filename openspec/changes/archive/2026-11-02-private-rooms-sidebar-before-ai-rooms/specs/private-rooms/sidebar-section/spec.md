# Spec Delta

## MODIFIED Requirements

### Requirement: Sidebar item
The system SHALL show a top-level sidebar item labelled Common:Private while the section is available, to every user whose sidebar shows the Rooms tree. The item SHALL be placed after Forms (after Rooms when Forms is absent) and before AI rooms (Common:AiRooms) when that item is shown. It SHALL have exactly one sub-item, Archive (Common:Archive).

#### Scenario: Section available
- **WHEN** the sidebar renders while the section is available and AI services are on
- **THEN** a Private item follows Forms and precedes AI rooms, and expanding it shows only the Archive sub-item

#### Scenario: Item clicked
- **WHEN** the user clicks the Private item
- **THEN** the private rooms list opens at `/private/filter`

#### Scenario: Section not available
- **WHEN** the sidebar renders while the section is not available
- **THEN** no Private item is shown
