# Spec Delta

## ADDED Requirements

### Requirement: Dashboard shows a card of private rooms
The system SHALL show among the apps of the dashboard a card of private rooms to every user who is shown the sidebar item of the section. The card SHALL carry the icon of that item, the title Common:Private and the description Common:DashboardE2eRoomsDescription, and SHALL stand after the Forms card and before the AI Workspace card. The card SHALL offer no onboarding tour.

#### Scenario: Section available
- **WHEN** a user who sees the Private item in the sidebar opens the dashboard
- **THEN** the apps show a card titled Common:Private with Common:DashboardE2eRoomsDescription, after Forms

#### Scenario: Section not available
- **WHEN** the section is not available to the user
- **THEN** the dashboard shows no card of private rooms

#### Scenario: App switched off on a standalone portal
- **WHEN** an administrator of a standalone portal opens the dashboard while the E2E rooms app is off
- **THEN** the card is shown as disabled and its button, Common:GoToSettings, leads to the apps settings
- **AND** a user who cannot switch apps on is shown no card

### Requirement: Dashboard card of private rooms creates or opens
The button of the card SHALL read Common:CreatePrivateRoom for a user who may create rooms, open the Private list and start the creation of a private room there as the create button of the section does. For a user without that right it SHALL read Common:Open and open the Private list. The dashboard SHALL NOT open the create-room dialog itself.

#### Scenario: Room admin
- **WHEN** a room admin presses Common:CreatePrivateRoom on the card
- **THEN** the Private list opens and the creation of a private room starts there, on the Private type with the type locked

#### Scenario: Room admin without a key
- **WHEN** a room admin who holds no encryption key presses Common:CreatePrivateRoom on the card
- **THEN** the Private list opens and the key setup dialog is shown, as it is for the create button of the section

#### Scenario: User who cannot create rooms
- **WHEN** a user of type User opens the dashboard
- **THEN** the button of the card reads Common:Open and opens the Private list

### Requirement: Dashboard card of private rooms carries the Beta badge
The system SHALL show the Beta badge beside the title of the card, the same badge as on the sidebar item of the section.

#### Scenario: Card with the badge
- **WHEN** the card of private rooms is shown
- **THEN** the Beta badge stands beside its title

### Requirement: Private list says that its files are encrypted
The system SHALL show in the header of the Private list the line Common:PrivateRoomsSectionNote with an encryption mark. The line SHALL speak about the files, not about everything in the section: the names of rooms and their members are not encrypted. The line SHALL NOT be shown in the header of a room or of a folder inside one.

#### Scenario: Private list
- **WHEN** the user opens the Private list or its Archive
- **THEN** the header shows Common:PrivateRoomsSectionNote

#### Scenario: Inside a room
- **WHEN** the user opens a private room
- **THEN** the header shows no such line

#### Scenario: Narrow window
- **WHEN** the header has no room for the whole line
- **THEN** the line is cut with an ellipsis or dropped, and the title and the header actions stay whole
