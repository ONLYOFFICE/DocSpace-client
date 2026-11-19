# Spec Delta

## ADDED Requirements

### Requirement: The invite panel waits for the room it invites to
The system SHALL show neither the shared links nor the invitation form of a room's invite panel, and SHALL send no invitation, until the panel has read the room it invites to. When that read fails, the panel SHALL show Common:InviteRoomLoadFailed in place of the form and SHALL offer and send nothing.

#### Scenario: Room read fails
- **WHEN** the invite panel is opened from inside a room and reading that room fails
- **THEN** Common:InviteRoomLoadFailed is shown, no link, invitation input or send action is offered, and no share request is sent

#### Scenario: Room read still on its way
- **WHEN** the invite panel is opened from inside a private room and the read of the room has not answered yet
- **THEN** the panel shows its loader and no link or invitation input

#### Scenario: Room read succeeds
- **WHEN** the read of a private room answers
- **THEN** the panel offers the invitation of a private room, without links, and an invitation goes through the unlock, the key check and the re-wrap

### Requirement: The key check of invitees is sent in batches
The system SHALL ask for the keys of the invitees of a private room for at most 40 users per request, the size the marks of the people list use, so that an invitation of any size can be checked. When one of these requests fails, the system SHALL send no invitation and SHALL report the failure as for an invitation of a few people.

#### Scenario: Large invitation
- **WHEN** the inviter invites 200 people who hold keys into a private room
- **THEN** their keys are asked for in requests of at most 40 users each, and all 200 are invited and receive the file keys

#### Scenario: One batch fails
- **WHEN** one of the requests for the invitees' keys fails
- **THEN** no invitation is sent and an error is shown

### Requirement: A private-room invitation sends people only
The system SHALL send the invitation of a private room for portal users only. An item of the invite list that is not a portal user, such as a group or an e-mail address, SHALL NOT be sent, SHALL be named with Common:EncryptedInviteFailed in the invite result or, when nobody was invited, above the list of the invite form, and SHALL NOT be counted as invited. The panel SHALL NOT show Common:UsersInvited for an invitation that invited nobody.

#### Scenario: Group in the list
- **WHEN** a private-room invitation holds a user with a verified key and a group
- **THEN** only the user is sent and invited, and the result names the group with Common:EncryptedInviteFailed

#### Scenario: Only an e-mail address in the list
- **WHEN** a private-room invitation holds only an e-mail address
- **THEN** no share request is sent, the form stays and names the address with Common:EncryptedInviteFailed, and Common:UsersInvited is not shown

### Requirement: The backfill sweep starts from any folder of the room
The system SHALL start the backfill sweep that "Backfill re-wraps every member" describes when a room manager opens a private room or any folder inside it, on the first open of the page as on navigation, and SHALL decide whether the user may run it from the rights of the room, not of the folder.

#### Scenario: Page loaded inside a subfolder
- **WHEN** a room manager reloads the page while a subfolder of a private room is open and a member lacks entries on files of the room
- **THEN** the sweep runs for the room and the member gains those entries without the room root being opened

#### Scenario: Member opens a subfolder
- **WHEN** a member without room-edit rights opens a subfolder of a private room
- **THEN** no sweep runs

## MODIFIED Requirements

### Requirement: Owner candidates are current members
The system SHALL offer only current members of the private room, excluding the current owner, as ownership candidates; administrators who are not members SHALL be excluded. Every member and administrator SHALL be read for that, however many there are; when they cannot be read, no candidate SHALL be offered and Common:OwnerCandidatesLoadFailed SHALL be shown. A candidate who is not a member when the owner is assigned SHALL be refused with Common:EncryptedChangeOwnerNotMember.

#### Scenario: Owner selector opened
- **WHEN** the change-owner panel opens for a private room
- **THEN** the list contains room members only, without the current owner and without non-member administrators

#### Scenario: Room with more than 100 members
- **WHEN** the change-owner panel opens for a private room with 150 members, the last of whom is an administrator
- **THEN** that administrator is offered

#### Scenario: Portal with more than 100 administrators
- **WHEN** the change-owner panel opens on a portal with 150 administrators, the last of whom is not a member of the room
- **THEN** that administrator is not offered

#### Scenario: Members cannot be read
- **WHEN** the read of the room's members or of the administrators fails
- **THEN** no candidate is offered and Common:OwnerCandidatesLoadFailed is shown

#### Scenario: Candidate left the room meanwhile
- **WHEN** the owner assigns a candidate who left the room after the panel opened
- **THEN** ownership is not transferred and Common:EncryptedChangeOwnerNotMember names the candidate
