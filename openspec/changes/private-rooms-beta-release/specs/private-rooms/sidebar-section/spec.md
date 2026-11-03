# Spec Delta

## ADDED Requirements

### Requirement: Private item carries the Beta badge
The system SHALL show the Beta badge next to the label of the Private sidebar item while the sidebar is expanded. The badge tooltip SHALL show Common:PrivateRoomsBetaDescription, followed by the feedback links the other Beta badges of the client show. The Archive sub-item SHALL NOT carry the badge.

#### Scenario: Beta badge shown
- **WHEN** the expanded sidebar renders while the section is available
- **THEN** the Private item shows the Beta badge, and the Archive sub-item shows none

#### Scenario: Badge tooltip
- **WHEN** the user hovers or focuses the Beta badge of the Private item
- **THEN** the tooltip shows Common:PrivateRoomsBetaDescription with the feedback links

### Requirement: Section availability follows the portal setting
The system SHALL make the Private section available only while two conditions hold: the portal setting allows private rooms, and the E2E rooms app is on for the portal. Every app is on in SaaS. For the client in an embedded frame, the frame configuration SHALL also carry the `privateRooms` property, read once that configuration has arrived. Switching the app on or off in the apps settings SHALL take effect without a reload.

#### Scenario: Setting on and app on
- **WHEN** the page loads on a portal whose setting allows private rooms and where the E2E rooms app is on
- **THEN** the Private section is available

#### Scenario: Setting off
- **WHEN** the page loads on a portal whose setting does not allow private rooms
- **THEN** the Private section is not available, whatever the state of the app

#### Scenario: Frame configuration carries the opt-in
- **WHEN** the client runs in an embedded frame whose configuration carries `privateRooms: true`, on a portal whose setting allows private rooms and where the E2E rooms app is on
- **THEN** the Private section is available once the configuration has arrived

#### Scenario: Frame configuration without the opt-in
- **WHEN** the client runs in an embedded frame whose configuration does not carry the opt-in, on a portal whose setting allows private rooms
- **THEN** the Private section is not available in the frame

#### Scenario: App switched off on a standalone portal
- **WHEN** an administrator switches the E2E rooms app off while the section is shown
- **THEN** the section disappears without a reload, and the Rooms section lists private rooms again

### Requirement: Private addresses open in Rooms while the section is not available
The system SHALL open a `/private` address under the matching Rooms address, keeping its query, when the section is not available, so a shared link to a private room keeps working. The list and room addresses map to `/rooms/shared`, and the archive addresses to `/rooms/archived`.

#### Scenario: Link opened while the section is not available
- **WHEN** a member of a private room opens `/private/{roomId}/filter` while the portal setting does not allow private rooms
- **THEN** the address is replaced with `/rooms/shared/{roomId}/filter` and the room opens in the Rooms section

### Requirement: Apps catalog titles the E2E rooms app Private
The system SHALL title the E2E rooms app Common:Private in the apps catalog, the same label as the sidebar section. Its description stays Common:DashboardE2eRoomsDescription. The name "Rooms E2E" SHALL NOT appear anywhere in the client.

#### Scenario: Catalog with the setting on
- **WHEN** an administrator opens the apps settings while the portal setting allows private rooms
- **THEN** the E2E rooms app is listed as Common:Private with its description

## REMOVED Requirements

### Requirement: Section availability
**Reason**: Replaced by "Section availability follows the portal setting"; the browser-local opt-in is gone.
**Migration**: The section reads the portal setting, the E2E rooms app and, in a frame, the host opt-in.

### Requirement: Section addresses fall back to Rooms when the section is not available
**Reason**: Replaced by "Private addresses open in Rooms while the section is not available", whose scenario no longer names the browser flag.
**Migration**: None. The fallback is unchanged.

### Requirement: Apps catalog uses the section label
**Reason**: Replaced by "Apps catalog titles the E2E rooms app Private", whose scenario reads the portal setting instead of the flag.
**Migration**: None. The label is unchanged.
