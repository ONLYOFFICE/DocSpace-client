# Spec Delta

## MODIFIED Requirements

### Requirement: Invite panel offers people only and reports the invitation result
The SDK invite panel of a private room SHALL offer portal users only, with no Guests tab and no groups. It SHALL grant room access to the verified invitees before wrapping their file keys, and SHALL stay open after sending with the result of each invitee (granted, pending access, or skipped with Common:EncryptedSkippedNoKeys or Common:EncryptedSkippedKeyMismatch) until the user closes it, as the client does.

#### Scenario: People selector
- **WHEN** the user opens "choose from list" in the invite panel of a private room
- **THEN** no Guests tab and no group is shown

#### Scenario: Order of operations
- **WHEN** an invitation to a private room is sent from the SDK
- **THEN** room access is granted to the verified invitees before their file keys are wrapped, and each granted invitee ends up holding an access entry for every encrypted file in the room or shown as pending access

#### Scenario: Mixed invitation
- **WHEN** some invitees have verified keys and others are skipped
- **THEN** only the verified invitees are granted access, and the panel stays open listing the skipped ones with the reason

### Requirement: Member removal is blocked during active uploads
The SDK SHALL refuse to start removing a member of a private room while uploads into the room or any folder inside it are in progress on this device, showing Common:CannotRemoveMemberWhileUploads with the upload count, and SHALL let the removal start once they finish.

#### Scenario: Uploads in flight
- **WHEN** the user removes a member while an upload into the room is running
- **THEN** Common:CannotRemoveMemberWhileUploads is shown and no removal starts

#### Scenario: Uploads into a subfolder
- **WHEN** the user removes a member while an upload into a subfolder of the room is running
- **THEN** Common:CannotRemoveMemberWhileUploads counts that upload and no removal starts

## ADDED Requirements

### Requirement: Pending access in the SDK members list
The SDK SHALL show a member of a private room for whom some files could not be re-wrapped as pending access (Common:EncryptedAccessPending), with a retry action for a user who may edit the room that re-wraps the missing files, as the client does.

#### Scenario: Retry from the SDK members list
- **WHEN** a user who may edit the room retries a pending member and every missing file is re-wrapped
- **THEN** the pending marker disappears and Common:EncryptedAccessRestored is shown

### Requirement: SDK reads pending access from the server
The SDK SHALL read the room's missing file keys from the server whenever its private members list loads for a user who may invite into the room or edit its members, and SHALL show the listed members as pending access, as the client does.

#### Scenario: Marker after a reload
- **WHEN** a member of a private room lacks the key of some encrypted file and a user who may invite reloads the SDK page and opens the members list
- **THEN** the member's row shows Common:EncryptedAccessPending

#### Scenario: User who may neither invite nor edit
- **WHEN** such a member opens the members list
- **THEN** the missing keys are not requested

## RENAMED Requirements

- FROM: `### Requirement: Invite panel offers people only and closes before re-encryption`
- TO: `### Requirement: Invite panel offers people only and reports the invitation result`
