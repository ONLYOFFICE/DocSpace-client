# Private Rooms Feature Gating Specification

## Purpose
Private (end-to-end encrypted) rooms are built but not released: the editor half of the feature is unfinished, so commit 2409f4e01d1 (2026-08-14) hid every surface that offers the feature to a user behind a tester opt-in stored in the browser. This capability defines what the opt-in is, which surfaces it hides, and which surfaces stay reachable regardless, so the feature can be exercised by testers and E2E suites without being discoverable by ordinary users. Implementation: `packages/shared/utils/privateRooms.ts`, `packages/shared/utils/rooms.tsx` (`getCreateRoomTypes`), `packages/client/src/helpers/disabled-apps.ts`, `packages/client/src/store/AppsStore.ts` (`isPrivateRoomsSectionAvailable`), `packages/client/src/components/PrivateRoomsSectionRoute`, `packages/client/src/components/ClientArticleSidebar`, `packages/client/src/routes/general.js`, `packages/client/src/routes/client.js` (the `/private` routes and the `/e2e-rooms` redirect), `packages/client/src/pages/Profile/Section/Body/index.tsx`, E2E fixture `packages/client/__tests__/fixtures/base.ts`.

## Requirements

### Requirement: Opt-in flag is a browser-local presence flag
The system SHALL treat private rooms as enabled when the browser's localStorage holds a non-empty value under the key `privateRooms`, and as disabled otherwise. The value itself is not interpreted.

#### Scenario: Flag never set
- **WHEN** localStorage has no `privateRooms` entry
- **THEN** private rooms are disabled

#### Scenario: Any non-empty value enables
- **WHEN** localStorage holds `privateRooms` = `"true"`, `"1"` or `"on"`
- **THEN** private rooms are enabled

#### Scenario: Empty value does not enable
- **WHEN** localStorage holds `privateRooms` = `""`
- **THEN** private rooms are disabled

### Requirement: Unreadable storage means disabled
The system SHALL treat private rooms as disabled when localStorage cannot be read (no window, sandboxed iframe, cookies blocked, storage access throws).

#### Scenario: Storage access throws
- **WHEN** reading localStorage throws an exception
- **THEN** private rooms are disabled and no error is surfaced to the user

#### Scenario: Server-side rendering
- **WHEN** the check runs without a `window` object
- **THEN** private rooms are disabled

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

### Requirement: Keys management is gated in the profile
The system SHALL show the Keys management profile tab and serve the `profile/keys-management` routes only while the flag is enabled. Without the flag the tab is absent and the routes do not exist, so the page cannot be reached by URL.

#### Scenario: Profile without the flag
- **WHEN** a user opens their profile with the flag disabled
- **THEN** no Keys management tab is shown and `/profile/keys-management` does not resolve to the page

#### Scenario: Profile with the flag
- **WHEN** a user opens their profile with the flag enabled
- **THEN** the Keys management tab is shown (Common:KeysManagement) and `/profile/keys-management` opens it

### Requirement: Gating hides, it does not disable the feature
The system SHALL keep all private-room code paths intact and functional behind the flag. Once the flag is enabled every gated surface SHALL behave exactly as it did before gating was introduced.

#### Scenario: Behaviour parity with the flag on
- **WHEN** the flag is enabled
- **THEN** private room creation, invitation, encrypted upload, download and keys management work as specified in the other private-rooms capabilities

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

### Requirement: SDK private routes honour the host opt-in
The system SHALL serve the embeddable SDK private-room pages under `/sdk/private*` only when the embedding host passes the private-rooms opt-in. Without the opt-in the pages render the not-available view.

#### Scenario: SDK route without the flag
- **WHEN** a signed-in user opens `/sdk/private` and the host has not enabled private rooms
- **THEN** the not-available view renders and no private-room data is requested

### Requirement: Server API is not gated by the flag
The system SHALL NOT rely on the flag for security: the server applies its own authorisation to the private-room endpoints whether or not the flag is set (own keys only, guests refused for key writes, room membership and an own key for room access, read access for file access), and the flag MUST be treated as a discoverability control only.

#### Scenario: API call without the flag
- **WHEN** a client calls the private-room key endpoints with the flag disabled
- **THEN** the server answers as it would with the flag enabled

#### Scenario: Guest creates a key
- **WHEN** a guest asks the server to store an encryption key, with or without the flag
- **THEN** the server refuses the request

### Requirement: E2E suite runs with the flag enabled
The system SHALL enable the flag for every Playwright page in the client E2E base fixture, so the existing private-room specs cover the released behaviour, while a dedicated spec asserts that each entry point disappears without the flag and returns with it.

#### Scenario: Base fixture
- **WHEN** a client E2E test gets its page from the base fixture
- **THEN** `privateRooms` is set in localStorage before the first navigation

#### Scenario: Hidden-surfaces spec
- **WHEN** the hidden-surfaces spec clears the flag
- **THEN** the Private room card and the Keys management tab are absent, and present again once the flag is restored

### Requirement: Client in an embedded frame takes the host opt-in
The client SHALL treat the `privateRooms` property of the frame configuration as the private-rooms opt-in while it runs inside an embedded frame, in addition to the browser-local flag. A framed list SHALL be requested only after that configuration has arrived, so it is scoped once.

#### Scenario: Host enables private rooms in a frame
- **WHEN** a host embeds the client with `privateRooms: true` in a browser without the flag, on a portal where the E2E rooms app is on
- **THEN** the Private section is available in the frame

#### Scenario: Frame without the property
- **WHEN** a host embeds the client without the property in a browser without the flag
- **THEN** the Private section is not available in the frame and the Rooms list carries no privacy filter
