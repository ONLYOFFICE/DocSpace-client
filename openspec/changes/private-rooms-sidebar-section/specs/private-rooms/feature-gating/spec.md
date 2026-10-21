# Spec Delta

## MODIFIED Requirements

### Requirement: Flag is read on demand
The system SHALL read the flag each time a gated surface is evaluated, so that flipping the flag from the browser console takes effect without a rebuild. The route tables and the Private section are the exception: they read the flag once per page load.

#### Scenario: Chooser re-reads the flag per render
- **WHEN** the flag is set after the application loaded and the create-room chooser is opened again
- **THEN** the chooser re-evaluates its room types and still offers no Private room card, because private rooms are created only from the Private section

#### Scenario: Profile re-reads the flag per render
- **WHEN** the flag is set after the application loaded and the user opens their profile again
- **THEN** the Keys management tab is shown without a page reload

#### Scenario: Routes need a reload
- **WHEN** the flag is set after the application loaded
- **THEN** the gated profile routes and the Private section stay unavailable until the page is reloaded

### Requirement: Private room card is gated in the create-room chooser
The system SHALL offer the Private room type for creation only while the flag is enabled, and then only through the Private section. The generic create-room chooser, its list and both dropdown variants, SHALL NOT offer it in either state. All other room types SHALL be offered in both states, exactly as they are without the flag.

#### Scenario: Chooser without the flag
- **WHEN** a user opens the create-room chooser with the flag disabled
- **THEN** the Private room card is absent and the other room types are offered

#### Scenario: Chooser with the flag
- **WHEN** a user opens the create-room chooser outside the Private section with the flag enabled
- **THEN** the Private room card is still absent and the other room types are offered as without the flag

#### Scenario: Section with the flag
- **WHEN** a user who may create rooms presses the create button of the Private section with the flag enabled
- **THEN** the create-room dialog opens on the Private room type

### Requirement: E2E rooms app is gated as an unreleased app
The system SHALL report the `e2e-rooms` app as temporarily disabled while the flag is disabled. That removes it from the apps catalog and the app launcher, removes the Private section from the sidebar, and sends the `/e2e-rooms` address to the dashboard. While the flag is enabled, the app stands for the Private section: switching it off hides the section.

#### Scenario: Catalog without the flag
- **WHEN** the apps catalog is built with the flag disabled
- **THEN** the `e2e-rooms` entry is filtered out

#### Scenario: Direct navigation without the flag
- **WHEN** a user navigates to `/e2e-rooms` with the flag disabled
- **THEN** the app route treats the app as not installed and redirects to the dashboard

#### Scenario: Sidebar with the flag
- **WHEN** the flag is enabled and the app is on for the portal
- **THEN** the sidebar shows the Private section with its Archive sub-item, and `/e2e-rooms` leads to that section

### Requirement: Existing private rooms stay visible without the flag
The system SHALL NOT hide rooms that are already private, or files that are already encrypted, when the flag is disabled. Only the entry points that create or configure the feature are gated. While the Private section is not available, private rooms SHALL be listed in Rooms. While it is available, they SHALL be listed there instead of in Rooms.

#### Scenario: Private room listed without the flag
- **WHEN** a user who is a member of a private room opens the rooms list with the flag disabled
- **THEN** the private room is listed in Rooms with its private badge and can be opened

#### Scenario: Private room listed with the section
- **WHEN** the same user opens the rooms lists with the flag enabled and the E2E rooms app on
- **THEN** the private room is listed in the Private section and not in Rooms

#### Scenario: App switched off with the flag
- **WHEN** the flag is enabled but an administrator switched the E2E rooms app off
- **THEN** the private room is listed in Rooms with its private badge and can be opened
