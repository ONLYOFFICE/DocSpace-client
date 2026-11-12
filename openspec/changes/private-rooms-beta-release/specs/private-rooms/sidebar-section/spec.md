# Spec Delta

## ADDED Requirements

### Requirement: Private item carries the Beta badge
The system SHALL show the Beta badge next to the label of the Private sidebar item while the sidebar is expanded. The badge tooltip SHALL show the title Common:PrivateRoomsBetaTitle and the text Common:PrivateRoomsBetaDescription, followed by the feedback links the other Beta badges of the client show. The Archive sub-item SHALL NOT carry the badge.

#### Scenario: Beta badge shown
- **WHEN** the expanded sidebar renders while the section is available
- **THEN** the Private item shows the Beta badge, and the Archive sub-item shows none

#### Scenario: Badge tooltip
- **WHEN** the user opens the tooltip of the Beta badge of the Private item
- **THEN** it shows Common:PrivateRoomsBetaTitle as its title and Common:PrivateRoomsBetaDescription with the feedback links, and no text of another beta feature

### Requirement: Section availability follows the E2E rooms app
The system SHALL make the Private section available while the E2E rooms app is on for the portal. Every app is on in SaaS, so the section is always available there. For the client in an embedded frame, the frame configuration SHALL also carry the `privateRooms` property, read once that configuration has arrived. Switching the app on or off in the apps settings SHALL take effect without a reload.

#### Scenario: SaaS portal
- **WHEN** the page loads on a SaaS portal outside a frame
- **THEN** the Private section is available

#### Scenario: Standalone portal with the app on
- **WHEN** the page loads on a standalone portal where the E2E rooms app is on
- **THEN** the Private section is available

#### Scenario: Frame configuration carries the opt-in
- **WHEN** the client runs in an embedded frame whose configuration carries `privateRooms: true`, on a portal where the E2E rooms app is on
- **THEN** the Private section is available once the configuration has arrived

#### Scenario: Frame configuration without the opt-in
- **WHEN** the client runs in an embedded frame whose configuration does not carry the opt-in
- **THEN** the Private section is not available in the frame

#### Scenario: App switched off on a standalone portal
- **WHEN** an administrator switches the E2E rooms app off while the section is shown
- **THEN** the section disappears without a reload, and private rooms are listed nowhere: the Rooms section leaves them out too

### Requirement: Private addresses open in Rooms while the section is not available
The system SHALL open a `/private` address under the matching Rooms address, keeping its query, when the section is not available, so a shared link to a private room keeps working. The list and room addresses map to `/rooms/shared`, and the archive addresses to `/rooms/archived`.

#### Scenario: Link opened while the section is not available
- **WHEN** a member of a private room opens `/private/{roomId}/filter` on a standalone portal where the E2E rooms app is off
- **THEN** the address is replaced with `/rooms/shared/{roomId}/filter` and the room opens in the Rooms section

### Requirement: Apps catalog titles the E2E rooms app Private
The system SHALL title the E2E rooms app Common:Private in the apps catalog, the same label as the sidebar section. Its description stays Common:DashboardE2eRoomsDescription. The name "Rooms E2E" SHALL NOT appear anywhere in the client.

#### Scenario: Catalog on a standalone portal
- **WHEN** an administrator of a standalone portal opens the apps settings
- **THEN** the E2E rooms app is listed as Common:Private with its description, and can be switched off and on

## MODIFIED Requirements

### Requirement: Rooms section excludes private rooms while the section is available
The system SHALL request the Rooms list and Rooms → Archive with the privacy filter NotPrivate while the Private section is available, so a private room is listed only in its own section. While the section is not available, the Rooms list SHALL carry no privacy filter, the server leaving private rooms out of the Rooms area, and Rooms → Archive SHALL keep the filter NotPrivate, so private rooms are listed nowhere.

#### Scenario: Section available
- **WHEN** the user opens Rooms or Rooms → Archive while the section is available
- **THEN** the request carries `privacyFilter=NotPrivate` and no private room is listed

#### Scenario: Section not available
- **WHEN** the user opens Rooms or Rooms → Archive while the section is not available
- **THEN** the Rooms request carries no privacy filter, the Rooms → Archive request carries `privacyFilter=NotPrivate`, and no private room is listed

#### Scenario: Address asks Rooms for private rooms
- **WHEN** a Rooms address carrying `privacyFilter=Private` is opened while the section is available
- **THEN** the request carries `privacyFilter=NotPrivate`

#### Scenario: Room group opened in Rooms
- **WHEN** a room group that contains private rooms is opened in Rooms while the section is available
- **THEN** the private rooms of that group are not listed

#### Scenario: Room group editor in Rooms
- **WHEN** the user edits the room groups of the Rooms section while the Private section is available
- **THEN** private rooms are not offered for grouping

## REMOVED Requirements

### Requirement: Section availability
**Reason**: Replaced by "Section availability follows the E2E rooms app"; the browser-local opt-in is gone.
**Migration**: The section reads the E2E rooms app and, in a frame, the host opt-in.

### Requirement: Section addresses fall back to Rooms when the section is not available
**Reason**: Replaced by "Private addresses open in Rooms while the section is not available", whose scenario no longer names the browser flag.
**Migration**: None. The fallback is unchanged.

### Requirement: Apps catalog uses the section label
**Reason**: Replaced by "Apps catalog titles the E2E rooms app Private", whose scenario no longer names the flag.
**Migration**: None. The label is unchanged.
