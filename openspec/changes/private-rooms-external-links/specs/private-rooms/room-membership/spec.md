# Spec Delta

## MODIFIED Requirements

### Requirement: No public sharing for private rooms
The system SHALL offer external links for a private room, its folders and its files to a member who may change the room's access, while the portal allows them, and SHALL NOT offer member links or embedding settings for them.

#### Scenario: Room context menu
- **WHEN** the context menu of a private room is opened by a member who may change its access
- **THEN** it contains the external-link entry and no link-for-room-members or embedding-settings entry

#### Scenario: Members view
- **WHEN** the Members tab of a private room is shown to a member who may change its access
- **THEN** the external links of the room are listed with a control to create one, and no member-link control is rendered

#### Scenario: Members view of a room selected in a list
- **WHEN** a private room is selected in the Private or Rooms list with the info panel open on its Members tab
- **THEN** the same block of external links is rendered as inside the room

#### Scenario: Member who may not change the access
- **WHEN** a member without the right to change the access opens the menus of a private item
- **THEN** no external-link entry and no control to create a link is shown

#### Scenario: Portal forbids external links of private rooms
- **WHEN** the portal setting for external links of private rooms is off
- **THEN** no external-link entry and no link block is shown for a private item

## ADDED Requirements

### Requirement: External link of a private item keeps the link model of the portal
The system SHALL offer for a private item the primary and the additional external links of an ordinary item, within the same limits, with the access to view, comment, review or edit and the settings title, end date, password, limit of uses and DocSpace users only. It SHALL NOT offer the access to fill forms or the download ban. The address SHALL be shown for copying with its secret part and SHALL NOT be sent to the server whole.

#### Scenario: Link with the access to view
- **WHEN** a member creates a link with the access to view
- **THEN** the address is shown for copying and the link is listed with its access, title and end date

#### Scenario: Accesses offered
- **WHEN** the access list of an external link of a private item is opened
- **THEN** it offers viewing, commenting, reviewing and editing, and no form filling

#### Scenario: Download ban
- **WHEN** the settings of an external link of a private item are shown
- **THEN** no option to forbid the download is offered

#### Scenario: Limit of links reached
- **WHEN** a private item already holds as many links as an ordinary item of its kind may hold
- **THEN** no further link can be created

#### Scenario: Room of a type without room links
- **WHEN** the private room is of a type whose ordinary rooms have no link of the room itself
- **THEN** links are offered for its files and folders only

#### Scenario: Private virtual data room
- **WHEN** a link is created in a private room of the virtual data room type
- **THEN** it is for DocSpace users only and the choice of who has access is not offered

#### Scenario: Creator's key locked
- **WHEN** a member creates a link while their key is locked
- **THEN** the unlock is asked first and no link is created before it succeeds

### Requirement: Revoking an external link
The system SHALL let a member who may change the access revoke an external link of a private item at any time, after a confirmation that names the limit of a revocation.

#### Scenario: Link revoked
- **WHEN** the member confirms the revocation
- **THEN** the link leaves the list and its address no longer opens anything

### Requirement: A link without a password is limited to one file to view
The system SHALL require a password for an external link of a private item, except for a link to one file with the access to view, which SHALL carry an end date instead, preset to seven days from its creation. It SHALL ask for the missing password or end date before the link is created or changed.

#### Scenario: Link to a file to view without a password
- **WHEN** a member creates a link to one file with the access to view and no password
- **THEN** the end date is preset to seven days from now, and the link is created with it

#### Scenario: End date cleared
- **WHEN** the member clears the end date of such a link
- **THEN** the link is not created or changed until a date or a password is set

#### Scenario: Link to a folder or a room without a password
- **WHEN** a member creates a link to a folder or a private room without a password
- **THEN** the password is asked and no link is created without it

#### Scenario: Access raised on a link without a password
- **WHEN** a member changes a link without a password to the access to comment, review or edit
- **THEN** the password is asked and the access is not changed without it

### Requirement: A private item shows its active links
The system SHALL mark a private room, a folder or a file that holds an external link which still works, with the number of such links, for a member who may see the access of the room.

#### Scenario: Item with links
- **WHEN** a member who may see the access looks at a private item with two links that work
- **THEN** the item carries the mark with the number two

#### Scenario: Last link revoked or expired
- **WHEN** the last link of a private item is revoked or passes its end date
- **THEN** the mark is gone
