# Spec Delta

## ADDED Requirements

### Requirement: Private rooms availability is a portal setting
The system SHALL offer private rooms only while the portal setting for private rooms, delivered with the server settings, allows them. A settings payload without the setting SHALL count as not allowing them. No browser-local value and no URL parameter SHALL turn the feature on.

#### Scenario: Setting on
- **WHEN** the settings payload allows private rooms
- **THEN** the Private section, the E2E rooms app and the Keys management tab are offered as the other private-rooms requirements describe

#### Scenario: Setting off
- **WHEN** the settings payload does not allow private rooms
- **THEN** the Private section, the E2E rooms app and the Private room type are absent, and the Keys management tab is shown only to users who hold a key

#### Scenario: Setting absent from the payload
- **WHEN** the server sends a settings payload without the setting
- **THEN** private rooms are treated as not allowed

#### Scenario: Browser-local flag ignored
- **WHEN** localStorage holds a `privateRooms` entry, or the address carries `?privateRooms=true`, on a portal whose setting does not allow private rooms
- **THEN** no private-rooms surface appears and nothing is written to localStorage

### Requirement: Administrators switch private rooms for the portal
The system SHALL let a portal administrator turn the private rooms setting on and off from the portal settings, and SHALL label the control as a beta with the Beta badge. Users who are not portal administrators SHALL NOT see the control. Other users SHALL see the new state at the latest after their next page load.

#### Scenario: Administrator turns the setting on
- **WHEN** a portal administrator turns the private rooms setting on and another user reloads the page
- **THEN** that user is offered the Private section and the Keys management tab

#### Scenario: Not an administrator
- **WHEN** a user who is not a portal administrator opens the portal settings
- **THEN** no private rooms control is shown

### Requirement: Existing private rooms stay usable when the setting is off
The system SHALL keep rooms that are already private, and files that are already encrypted, readable and manageable for their members when the setting is off. Only the creation of new private rooms is withheld. While the setting is off, private rooms SHALL be listed in Rooms with their private badge.

#### Scenario: Setting turned off after rooms exist
- **WHEN** an administrator turns the setting off on a portal with private rooms
- **THEN** members still find their private rooms in Rooms with the private badge, and can open them and download or upload encrypted files

#### Scenario: No new private room while off
- **WHEN** the setting is off
- **THEN** no create entry offers the Private room type

### Requirement: E2E rooms app follows the setting
The system SHALL offer the E2E rooms app in the apps catalog and the app launcher only while the setting allows private rooms. While the setting is off, `/e2e-rooms` SHALL lead to the dashboard as for an app that is not installed.

#### Scenario: Catalog with the setting off
- **WHEN** the apps catalog is built while the setting does not allow private rooms
- **THEN** the E2E rooms app is not listed

#### Scenario: Old bookmark with the setting off
- **WHEN** a user opens `/e2e-rooms` while the setting does not allow private rooms
- **THEN** the dashboard opens

### Requirement: E2E suite covers the setting
The system SHALL cover both states of the portal setting in the client E2E suite. The base fixture SHALL set no browser-local flag. The private-room specs SHALL run with the setting on, and a dedicated spec SHALL turn it off and assert that each entry point disappears while existing private rooms stay listed in Rooms.

#### Scenario: Base fixture
- **WHEN** a client E2E test gets its page from the base fixture
- **THEN** no `privateRooms` entry is written to localStorage

#### Scenario: Setting-off spec
- **WHEN** the setting-off spec mocks the settings payload with private rooms not allowed
- **THEN** the Private sidebar item, the E2E rooms app and the Private room type are absent, and an existing private room is listed in Rooms

### Requirement: Private room type is offered only from the Private section
The system SHALL offer the Private room type for creation only while the Private section is available, and then only through the Private section. The generic create-room chooser, its list and both dropdown variants, SHALL NOT offer it in any state. All other room types SHALL be offered whatever the state of the setting.

#### Scenario: Chooser with the setting off
- **WHEN** a user opens the create-room chooser while the setting does not allow private rooms
- **THEN** the Private room card is absent and the other room types are offered

#### Scenario: Chooser with the setting on
- **WHEN** a user opens the create-room chooser outside the Private section while the setting allows private rooms
- **THEN** the Private room card is still absent and the other room types are offered as with the setting off

#### Scenario: Section with the setting on
- **WHEN** a user who may create rooms presses the create button of the Private section
- **THEN** the create-room dialog opens on the Private room type

### Requirement: SDK private routes need the setting and the host opt-in
The system SHALL serve the embeddable SDK private-room pages under `/sdk/private*` only when the portal setting allows private rooms and the embedding host passes the private-rooms opt-in. Otherwise the pages SHALL render the not-available view.

#### Scenario: SDK route without the host opt-in
- **WHEN** a signed-in user opens `/sdk/private` on a portal whose setting allows private rooms, and the host has not enabled private rooms
- **THEN** the not-available view renders and no private-room data is requested

#### Scenario: SDK route with the setting off
- **WHEN** a signed-in user opens `/sdk/private` with the host opt-in on a portal whose setting does not allow private rooms
- **THEN** the not-available view renders and no private-room data is requested

## MODIFIED Requirements

### Requirement: Client in an embedded frame takes the host opt-in
While the client runs inside an embedded frame, the client SHALL offer private rooms only when the portal setting allows them and the frame configuration carries the `privateRooms` property. A framed list SHALL be requested only after that configuration has arrived, so it is scoped once.

#### Scenario: Host enables private rooms in a frame
- **WHEN** a host embeds the client with `privateRooms: true` on a portal whose setting allows private rooms and where the E2E rooms app is on
- **THEN** the Private section is available in the frame

#### Scenario: Frame without the property
- **WHEN** a host embeds the client without the property on a portal whose setting allows private rooms
- **THEN** the Private section is not available in the frame and the Rooms list carries no privacy filter

## REMOVED Requirements

### Requirement: Private room card is gated in the create-room chooser
**Reason**: Replaced by "Private room type is offered only from the Private section", which states the rule without the browser flag.
**Migration**: None. The chooser keeps leaving the card out; the section keeps offering the type.

### Requirement: SDK private routes honour the host opt-in
**Reason**: Replaced by "SDK private routes need the setting and the host opt-in".
**Migration**: The SDK private layout reads the portal setting in addition to the host opt-in.

### Requirement: Opt-in flag is a browser-local presence flag
**Reason**: Replaced by "Private rooms availability is a portal setting".
**Migration**: Delete the browser flag and its URL parameter. Testers ask a portal administrator to turn the setting on.

### Requirement: Unreadable storage means disabled
**Reason**: Browser storage is no longer read to decide availability.
**Migration**: None. The settings payload is already required for the application to start.

### Requirement: Flag is read on demand
**Reason**: The setting arrives with the server settings when the page loads, so nothing reads it on demand.
**Migration**: Surfaces and route tables read the settings store.

### Requirement: E2E rooms app is gated as an unreleased app
**Reason**: Replaced by "E2E rooms app follows the setting".
**Migration**: Remove the temporarily-disabled entry for `e2e-rooms`; the setting decides instead.

### Requirement: Keys management is gated in the profile
**Reason**: Replaced by "Keys management tab follows the private rooms setting" in `private-rooms/key-management`.
**Migration**: The tab and its routes read the setting and the user's keys.

### Requirement: Gating hides, it does not disable the feature
**Reason**: There is no hidden mode any more. The beta is offered through the setting.
**Migration**: None.

### Requirement: Existing private rooms stay visible without the flag
**Reason**: Replaced by "Existing private rooms stay usable when the setting is off".
**Migration**: None. The behaviour is kept under the new requirement.

### Requirement: Server API is not gated by the flag
**Reason**: There is no client flag any more. Server enforcement belongs in `private-rooms/server-contract`, through the availability rule of `private-rooms-server-hardening`.
**Migration**: None.

### Requirement: E2E suite runs with the flag enabled
**Reason**: Replaced by "E2E suite covers the setting".
**Migration**: Remove the flag from the base fixture, and replace the hidden-surfaces spec with the setting-off spec.
