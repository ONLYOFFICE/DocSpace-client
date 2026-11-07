# Spec Delta

## ADDED Requirements

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

### Requirement: Existing private rooms stay usable when the app is off
The system SHALL keep rooms that are already private, and files that are already encrypted, readable and manageable for their members, who reach them by their address, when an administrator switches the E2E rooms app off. Only the creation of new private rooms is withheld. While the app is off, private rooms SHALL NOT be listed: the server leaves them out of the Rooms area, and the client does not ask for them.

#### Scenario: App switched off after rooms exist
- **WHEN** an administrator switches the E2E rooms app off on a standalone portal with private rooms
- **THEN** members no longer find their private rooms in Rooms, and a private room opened by its address still opens under Rooms and lets them download or upload encrypted files

#### Scenario: No new private room while off
- **WHEN** the E2E rooms app is off
- **THEN** no create entry offers the Private room type

### Requirement: E2E suite runs without the flag
The system SHALL run the client E2E suite without any browser-local flag. The base fixture SHALL write no `privateRooms` entry, so every spec sees the Private section as a portal user does. A dedicated spec SHALL switch the E2E rooms app off on a standalone portal and assert that each entry point disappears while existing private rooms stay listed in Rooms.

#### Scenario: Base fixture
- **WHEN** a client E2E test gets its page from the base fixture
- **THEN** no `privateRooms` entry is written to localStorage, and the Private sidebar item is shown

#### Scenario: App-off spec
- **WHEN** the app-off spec mocks a standalone portal whose E2E rooms app is off
- **THEN** the Private sidebar item, the E2E rooms app and the Private room type are absent, and an existing private room is listed in Rooms

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

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: Private room card is gated in the create-room chooser
**Reason**: Replaced by "Private room type is offered only from the Private section", which states the rule without the browser flag.
**Migration**: None. The chooser keeps leaving the card out; the section keeps offering the type.

### Requirement: Opt-in flag is a browser-local presence flag
**Reason**: Replaced by "Private rooms are offered on every portal".
**Migration**: Delete the browser flag and its URL parameter. Testers need nothing; standalone administrators use the E2E rooms app.

### Requirement: Unreadable storage means disabled
**Reason**: Browser storage is no longer read to decide availability.
**Migration**: None.

### Requirement: Flag is read on demand
**Reason**: There is no flag to read. Availability comes from the apps list, which already updates without a reload.
**Migration**: Surfaces and route tables read the apps store.

### Requirement: E2E rooms app is gated as an unreleased app
**Reason**: The app is released; on a standalone portal it is the administrator's switch for the feature.
**Migration**: Remove the `e2e-rooms` entry from the unreleased apps.

### Requirement: Keys management is gated in the profile
**Reason**: Replaced by "Keys management tab follows the Private section" in `private-rooms/key-management`.
**Migration**: The tab and its routes read the section availability and the user's keys.

### Requirement: Gating hides, it does not disable the feature
**Reason**: There is no hidden mode any more. The beta is offered to every user.
**Migration**: None.

### Requirement: Existing private rooms stay visible without the flag
**Reason**: Replaced by "Existing private rooms stay usable when the app is off".
**Migration**: None. The behaviour is kept under the new requirement.

### Requirement: Server API is not gated by the flag
**Reason**: There is no client flag any more. Server enforcement belongs in `private-rooms/server-contract`, through the availability rule of `private-rooms-server-hardening`.
**Migration**: None.

### Requirement: E2E suite runs with the flag enabled
**Reason**: Replaced by "E2E suite runs without the flag".
**Migration**: Remove the flag from the base fixture, and replace the hidden-surfaces spec with the app-off spec.
