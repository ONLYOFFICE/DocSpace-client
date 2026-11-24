# Spec Delta

## MODIFIED Requirements

### Requirement: Sidebar item
The system SHALL show a top-level sidebar item labelled Common:Private while the section is available, to every user whose sidebar shows the Rooms tree. The item SHALL be placed after Forms (after Rooms when Forms is absent) and before AI Chat (Common:AIChat) when that item is shown. It SHALL have exactly one sub-item, Archive (Common:Archive).

#### Scenario: Section available
- **WHEN** the sidebar renders while the section is available and AI services are on
- **THEN** a Private item follows Forms and precedes AI Chat, and expanding it shows only the Archive sub-item

#### Scenario: Item clicked
- **WHEN** the user clicks the Private item
- **THEN** the private rooms list opens at `/private/filter`

#### Scenario: Section not available
- **WHEN** the sidebar renders while the section is not available
- **THEN** no Private item is shown

### Requirement: Dashboard shows a card of private rooms
The system SHALL show among the apps of the dashboard a card of private rooms to every user who is shown the sidebar item of the section, and as a disabled card to a user who can switch apps while the E2E rooms app is off. The card SHALL carry the icon of that item, the title Common:Private and the description Common:DashboardE2eRoomsDescription, and SHALL stand after the Forms card and before the AI Workspace card. The card SHALL offer no onboarding tour.

#### Scenario: Section available
- **WHEN** a user who sees the Private item in the sidebar opens the dashboard
- **THEN** the apps show a card titled Common:Private with Common:DashboardE2eRoomsDescription, after Forms

#### Scenario: Section not available
- **WHEN** the section is not available to a user who cannot switch apps
- **THEN** the dashboard shows no card of private rooms

#### Scenario: App switched off on a standalone portal
- **WHEN** an administrator of a standalone portal opens the dashboard while the E2E rooms app is off
- **THEN** the card is shown as disabled and its button, Common:GoToSettings, leads to the apps settings
- **AND** a user who cannot switch apps on is shown no card

### Requirement: Private section in an embedded frame
The system SHALL offer the Private section to the client running inside an embedded frame under the same availability as outside a frame once the frame's configuration carries the `privateRooms` opt-in. A frame opened at a `/private` address SHALL show the Private list or the private room it names, and a frame that shows the menu SHALL show the Private item in it.

#### Scenario: Frame opened in the Private section
- **WHEN** a host embeds the client with the root path `/private/` while the section is available
- **THEN** the frame shows the Private list and its requests name the section's search area (`searchArea=PrivateRooms`) and carry no privacy filter

#### Scenario: Frame showing the menu
- **WHEN** a host embeds the client with the menu shown while the section is available
- **THEN** the frame's menu contains the Private item
