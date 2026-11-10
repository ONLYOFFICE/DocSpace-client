# Private Rooms Feature Gating Specification

## Purpose
Private (end-to-end encrypted) rooms are built but not released: the editor half of the feature is unfinished, so commit 2409f4e01d1 (2026-08-14) hid every surface that offers the feature to a user behind a tester opt-in stored in the browser. This capability defines what the opt-in is, which surfaces it hides, and which surfaces stay reachable regardless, so the feature can be exercised by testers and E2E suites without being discoverable by ordinary users. Implementation: `packages/shared/utils/privateRooms.ts`, `packages/shared/utils/rooms.tsx` (`getCreateRoomTypes`), `packages/client/src/helpers/disabled-apps.ts`, `packages/client/src/store/AppsStore.ts` (`isPrivateRoomsSectionAvailable`), `packages/client/src/components/PrivateRoomsSectionRoute`, `packages/client/src/components/ClientArticleSidebar`, `packages/client/src/routes/general.js`, `packages/client/src/routes/client.js` (the `/private` routes and the `/e2e-rooms` redirect), `packages/client/src/pages/Profile/Section/Body/index.tsx`, E2E fixture `packages/client/__tests__/fixtures/base.ts`.

## Requirements

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

### Requirement: Client in an embedded frame takes the host opt-in
While the client runs inside an embedded frame, the client SHALL offer private rooms only when the frame configuration carries the `privateRooms` property, on top of the conditions that apply outside a frame. Nothing outside the frame configuration SHALL opt a frame in. A framed list SHALL be requested only after that configuration has arrived, so it is scoped once.

#### Scenario: Host enables private rooms in a frame
- **WHEN** a host embeds the client with `privateRooms: true` on a portal where the E2E rooms app is on
- **THEN** the Private section is available in the frame

#### Scenario: Frame without the property
- **WHEN** a host embeds the client without the property
- **THEN** the Private section is not available in the frame, the Rooms list carries no privacy filter and lists no private room

#### Scenario: Browser flag in a frame
- **WHEN** a host embeds the client without the property in a browser whose localStorage holds a `privateRooms` entry
- **THEN** the Private section is not available in the frame

### Requirement: Private rooms are offered on every portal
The system SHALL offer private rooms on every portal, SaaS and standalone, with no opt-in of the user. On a standalone portal an administrator SHALL switch them off and on with the E2E rooms app in the apps settings; on SaaS every app is on, so private rooms are always offered there. No browser-local value and no URL parameter SHALL turn the feature on or off.

#### Scenario: SaaS portal
- **WHEN** a user loads the client on a SaaS portal
- **THEN** the Private section and the Keys management tab are offered as the other private-rooms requirements describe

#### Scenario: Standalone portal with the app on
- **WHEN** a user loads the client on a standalone portal where the E2E rooms app is on
- **THEN** the Private section and the Keys management tab are offered as on SaaS

#### Scenario: Standalone portal with the app off
- **WHEN** a user loads the client on a standalone portal where an administrator switched the E2E rooms app off
- **THEN** the Private section, the E2E rooms app and the Private room type are absent, and the Keys management tab is shown only to users who hold a key

#### Scenario: Browser-local flag ignored
- **WHEN** localStorage holds a `privateRooms` entry, or the address carries `?privateRooms=true`, on a standalone portal where the E2E rooms app is off
- **THEN** no private-rooms surface appears and nothing is written to localStorage

### Requirement: Private room type is offered only from the Private section
The system SHALL offer the Private room type for creation only while the Private section is available, and then only through the Private section. The generic create-room chooser, its list and both dropdown variants, SHALL NOT offer it in any state. All other room types SHALL be offered whether or not the section is available.

#### Scenario: Chooser with the app off
- **WHEN** a user opens the create-room chooser on a standalone portal where the E2E rooms app is off
- **THEN** the Private room card is absent and the other room types are offered

#### Scenario: Chooser while the section is available
- **WHEN** a user opens the create-room chooser outside the Private section while the section is available
- **THEN** the Private room card is still absent and the other room types are offered as with the app off

#### Scenario: Create from the section
- **WHEN** a user who may create rooms presses the create button of the Private section
- **THEN** the create-room dialog opens on the Private room type
