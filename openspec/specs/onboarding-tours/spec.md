# onboarding-tours Specification

## Purpose

Defines the guided tours of the web client: the Dashboard tour and the tours of the Files, Rooms and Forms sections,
how they are started, which audience sees which steps, the sample content they stand in with on an empty section,
and how a tour moves, scrolls and ends.

Server counterpart: none. The sample content of a tour never reaches the server.

Out of scope: the dashboard itself and its welcome dialog (`dashboard`); the sections the tours walk through
(`files-navigation`, `room-types`, `form-filling-workflow`); the tour of the AI forms application in the SDK
(change `ai-chat-agents-design`).

Implementation: the Tour components (audience, step builders, demo swap, pending tour), the DashboardTour,
FilesTour, RoomsTour and FormsTour components with their stores, and the tour demo data of `packages/client/src/api`.

## Requirements

### Requirement: Starting a tour

A tour SHALL start only on request: the Dashboard tour from the welcome dialog, a section tour from the tour button of
its application card, which opens the section and starts the tour once the section has loaded. No tour SHALL start on
its own, not even on a first visit, and none SHALL run on a phone.

#### Scenario: Rooms tour from the dashboard

- **WHEN** a user presses the tour button of the Rooms card
- **THEN** the Rooms section opens and its tour starts once the list is shown

### Requirement: Audiences of a tour

A tour SHALL talk to one of three audiences: the owner, DocSpace admins and Room admins as admins, Users as users,
and guests as guests. Users and guests SHALL get the steps of what they may do with what they were given and SHALL
NOT be pointed at a create action they do not have; a guest's Files tour SHALL walk Shared with me instead of a
personal section, without Trash.

#### Scenario: Guest in Rooms

- **WHEN** a guest takes the Rooms tour
- **THEN** the tour covers the rooms they were invited into and offers no step that creates a room

### Requirement: Steps follow the page

A tour SHALL keep only the steps whose target is on the page — dropping, for instance, a dismissed profile card, a
missing Developer Tools or integrations card, or the sidebar steps on a narrow screen — and SHALL open a menu or the
info panel a step needs and put it away afterwards. The Dashboard tour SHALL walk the page top to bottom and end on the
sidebar.

#### Scenario: Dismissed profile card

- **WHEN** the profile card has been dismissed and the Dashboard tour starts
- **THEN** the tour has no profile step

### Requirement: Sample content on an empty section

On an empty Files, Rooms or Forms section a tour SHALL stand in sample rows marked as a sample, walk them, and give the
section back before its closing step, which SHALL be the real create button for those who may create and the empty
list for the others. A section with its own content SHALL end on its New button.

#### Scenario: Empty Forms section for a form filler

- **WHEN** a form filler takes the Forms tour on an empty section
- **THEN** the sample spaces are walked and the tour closes on the empty list

### Requirement: Moving through a tour

A tour SHALL move with its buttons and the arrow keys without the list underneath reacting, survive a click on the
backdrop, scroll each step's anchor into its own scroll container, and leave the page as it was when it ends.

#### Scenario: Arrow keys

- **WHEN** a user walks the Files tour with the arrow keys
- **THEN** the steps change and the file list selection does not
