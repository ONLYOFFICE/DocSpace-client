# Spec Delta

## MODIFIED Requirements

### Requirement: Invite panel offers people only and reports the invitation result
The SDK invite panel of a private room SHALL offer portal users only, with no Guests tab and no groups. It SHALL grant room access to the verified invitees before wrapping their file keys, and SHALL stay open after sending with the result of each invitee (granted, pending access, or skipped with Common:EncryptedInviteNoKey or Common:EncryptedSkippedKeyMismatch) until the user closes it. When nobody was invited it SHALL keep the invite form, and it SHALL NOT repeat a skip reason in a toast.

#### Scenario: People selector
- **WHEN** the user opens "choose from list" in the invite panel of a private room
- **THEN** no Guests tab and no group is shown

#### Scenario: Order of operations
- **WHEN** an invitation to a private room is sent from the SDK
- **THEN** room access is granted to the verified invitees before their file keys are wrapped, and each granted invitee ends up holding an access entry for every encrypted file in the room or shown as pending access

#### Scenario: Mixed invitation
- **WHEN** some invitees have verified keys and others are skipped
- **THEN** only the verified invitees are granted access, and the panel stays open listing the skipped ones with the reason

#### Scenario: Nobody invited
- **WHEN** the only invitee of an SDK invitation into a private room has no registered encryption key
- **THEN** the invite form stays with that user in the list, Common:EncryptedInviteNoKey names them above the list, and neither an invite result nor a toast with the same sentence is shown
