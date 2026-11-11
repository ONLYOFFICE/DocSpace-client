# Spec Delta

## ADDED Requirements

### Requirement: Editor role of a private room does not promise form filling
The system SHALL describe the Editor role in the role list of a private room with Common:EditorDescription, which names viewing, editing, reviewing and commenting, and SHALL NOT use the description that adds form filling.

#### Scenario: Role list of a private room
- **WHEN** a room manager opens the role list for a member of a private room
- **THEN** the Editor role is described by Common:EditorDescription

#### Scenario: Role list of another room
- **WHEN** the role list is opened in a room that is not private
- **THEN** the Editor role keeps Common:RoleEditorDescription

## MODIFIED Requirements

### Requirement: Invite panel offers people only
The system SHALL hide the Guests tab, exclude groups and limit search to portal users when inviting into a private room. The panel SHALL describe the invitation as adding existing members (Common:InviteToRoomManuallyInfoMembers, placeholder Common:InviteToRoomAddPlaceholder) and SHALL NOT offer an invitation language, whatever the portal's guest setting.

#### Scenario: Searching invitees
- **WHEN** the user types in the invite input of a private room
- **THEN** only portal users are suggested; groups and guests do not appear and the Guests tab is absent

#### Scenario: Portal allows inviting guests
- **WHEN** the invite panel of a private room opens on a portal that allows inviting guests
- **THEN** its description and placeholder are those of adding existing members, with no mention of an invitation by email or of the Guests list, and no invitation-language choice is shown
