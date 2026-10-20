# Spec Delta

## ADDED Requirements

### Requirement: Private rooms availability is a server-side setting
The system SHALL decide whether private rooms are offered from a portal setting delivered with the server settings payload, and SHALL NOT read any browser-local opt-in. Administrators SHALL be able to turn the setting off for the portal.

#### Scenario: Setting on
- **WHEN** the portal setting allows private rooms
- **THEN** the Private room card, the E2E rooms app and the Keys management tab are offered to every user who may create rooms

#### Scenario: Setting off
- **WHEN** the portal setting denies private rooms
- **THEN** the Private room card, the E2E rooms app and the Keys management tab are absent, and the server refuses private room creation

#### Scenario: Browser-local flag ignored
- **WHEN** localStorage holds a `privateRooms` entry
- **THEN** it has no effect on any surface

### Requirement: Existing private rooms stay usable when the setting is off
The system SHALL keep rooms that are already private, and files that are already encrypted, readable and manageable when the setting is turned off; only the creation of new private rooms and new identities is withheld.

#### Scenario: Setting turned off after rooms exist
- **WHEN** an administrator turns the setting off on a portal with private rooms
- **THEN** members can still open, download and manage those rooms and their keys, but cannot create new private rooms

### Requirement: SDK private surface follows the server setting
The system SHALL serve the SDK private-room pages only when the portal setting allows private rooms or the embedding user already belongs to a private room; otherwise the pages SHALL show the setting-off empty state.

#### Scenario: SDK with setting off and no rooms
- **WHEN** a signed-in user without private rooms opens the SDK private surface on a portal with the setting off
- **THEN** the empty state explains that private rooms are not enabled on this portal

### Requirement: E2E suite covers the setting
The system SHALL cover both states of the portal setting in the client E2E suite: the default MSW settings payload allows private rooms, and a dedicated spec turns the setting off and asserts that each entry point disappears.

#### Scenario: Default fixture
- **WHEN** a client E2E test gets its page from the base fixture
- **THEN** no localStorage flag is set and the mocked settings payload allows private rooms

#### Scenario: Setting-off spec
- **WHEN** the setting-off spec mocks the settings payload with private rooms denied
- **THEN** the Private room card, the E2E rooms app and the Keys management tab are absent

## REMOVED Requirements

### Requirement: Opt-in flag is a browser-local presence flag
**Reason**: Replaced by the server-side availability setting.
**Migration**: Delete the flag helper; testers enable the portal setting instead of setting localStorage.

### Requirement: Unreadable storage means disabled
**Reason**: No browser storage is read for availability any more.
**Migration**: None; the settings payload is already required for the application to start.

### Requirement: Flag is read on demand
**Reason**: The setting arrives with the server settings on page load; no on-demand read exists.
**Migration**: Surfaces read the settings store; the route tables are built from the same store.

### Requirement: Private room card is gated in the create-room chooser
**Reason**: Superseded by the server-side setting requirement.
**Migration**: The chooser reads the setting; the card logic itself is unchanged.

### Requirement: E2E rooms app is gated as an unreleased app
**Reason**: The app is released; the "temporarily disabled" entry for `e2e-rooms` is removed.
**Migration**: The apps catalog and sidebar read the setting like any other app availability rule.

### Requirement: Keys management is gated in the profile
**Reason**: Superseded by the server-side setting requirement.
**Migration**: The tab and routes are registered unconditionally and hidden only when the setting denies private rooms and the user has no keys.

### Requirement: Gating hides, it does not disable the feature
**Reason**: There is no hidden mode any more.
**Migration**: None.

### Requirement: Existing private rooms stay visible without the flag
**Reason**: Replaced by "Existing private rooms stay usable when the setting is off".
**Migration**: None; behaviour is preserved under the new requirement.

### Requirement: SDK private routes are not gated by the flag
**Reason**: Replaced by "SDK private surface follows the server setting".
**Migration**: The SDK reads the setting from the portal settings it already loads.

### Requirement: Server API is not gated by the flag
**Reason**: Obsolete; the server enforces the availability rule itself (see `private-rooms/server-contract`).
**Migration**: None.

### Requirement: E2E suite runs with the flag enabled
**Reason**: Replaced by "E2E suite covers the setting".
**Migration**: Remove the flag from the base fixture; replace the hidden-surfaces spec with the setting-off spec.
