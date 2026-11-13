# Spec Delta

## MODIFIED Requirements

### Requirement: Invitees without usable keys are skipped with a warning
The system SHALL skip an invitee who has no encryption key or whose key changed and was refused, SHALL NOT grant them room access, and SHALL name them in the invite panel with the reason (Common:EncryptedInviteNoKey or Common:EncryptedSkippedKeyMismatch) and a way to invite them again. While the panel is open, the system SHALL NOT repeat that reason in a toast.

#### Scenario: Invitee has no key
- **WHEN** an invitee has no registered encryption key
- **THEN** the invitee does not become a room member, no file access entry is created for them, and the panel names them with Common:EncryptedInviteNoKey

#### Scenario: Invitee key mismatch refused
- **WHEN** the current public key of an invitee differs from the pinned one and the inviter refuses it
- **THEN** the invitee does not become a room member, no file access entry is created, and the panel lists their name under Common:EncryptedSkippedKeyMismatch

#### Scenario: Mixed invitation
- **WHEN** some invitees have verified keys and others are skipped
- **THEN** only the verified invitees are granted access and the skipped ones are listed inline without closing the panel

#### Scenario: Reason shown once
- **WHEN** an invitee is skipped while the invite panel is open
- **THEN** the reason appears in the panel and no toast with the same sentence is shown

### Requirement: Refused invitees are named in the invite result
The system SHALL name each refused invitee of a private-room invitation in the invite result: with Common:EncryptedInviteNoKey when the server refused with 403, which it does for a user who never registered a key, and with Common:EncryptedInviteFailed otherwise. When no invitee was invited, the same names and texts SHALL appear in the invite form, as "An invitation that invited nobody keeps the invite form" describes.

#### Scenario: Invitee without a key named
- **WHEN** the server refuses an invitee of a private room with 403
- **THEN** the invite result names that invitee with Common:EncryptedInviteNoKey

#### Scenario: Other refusal named
- **WHEN** the request of an invitee fails with another error
- **THEN** the invite result names that invitee with Common:EncryptedInviteFailed

#### Scenario: Every invitee refused
- **WHEN** the server refuses every invitee of a private-room invitation
- **THEN** the invite form stays and names them with Common:EncryptedInviteNoKey or Common:EncryptedInviteFailed

## ADDED Requirements

### Requirement: An invitation that invited nobody keeps the invite form
The system SHALL keep the invite form of a private room, with its invitees still in the list, when an invitation ends with every invitee skipped or refused, SHALL show the reasons above the list and announce them to assistive technology, and SHALL NOT replace the form with the invite result.

#### Scenario: Only invitee has no key
- **WHEN** the inviter sends an invitation to one user who has no registered encryption key
- **THEN** the invite form stays with that user in the list, Common:EncryptedInviteNoKey names them above the list, and no invite result is shown

#### Scenario: List corrected and sent again
- **WHEN** the inviter then removes that user, adds a user who holds a verified key and sends again
- **THEN** the new user is invited and the earlier reason is no longer shown

#### Scenario: Somebody was invited
- **WHEN** at least one invitee of the invitation was granted access
- **THEN** the invite result is shown with the invited, the pending and the left-out invitees, as before

### Requirement: Private room type is labelled Private
The system SHALL label a private room with Common:PrivateRoomType wherever the client shows the type of a room: the type column of the room list, the room row, the room tile and the type line of the info panel. A room without the private setting SHALL keep the label of its type, and the room type sent to and read from the server SHALL stay Custom.

#### Scenario: Type column in the Private section
- **WHEN** a user opens the Private section in the table view with the type column shown
- **THEN** the type of each private room reads Common:PrivateRoomType

#### Scenario: Info panel
- **WHEN** a user selects a private room and opens the details of the info panel
- **THEN** the type line reads Common:PrivateRoomType

#### Scenario: Archive holds both kinds
- **WHEN** a user opens the Archive, which holds an archived private room and an archived Custom room without the private setting
- **THEN** the first is labelled Common:PrivateRoomType and the second Common:CustomRooms
