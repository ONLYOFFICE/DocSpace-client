# Spec Delta

## ADDED Requirements

### Requirement: Refused access change in a private room is explained
The system SHALL show Common:EncryptedAccessChangeRefused when the server refuses with 403 a member's leave, a member's removal or a member's role change in a private room, and MUST NOT show the server's own message text for it. A refusal in a room that is not private, and a failure that is not a 403, SHALL be shown as before.

#### Scenario: Leave refused
- **WHEN** a member confirms leaving a private room and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown once, the member stays in the room, and no text of the server appears

#### Scenario: Removal refused
- **WHEN** a manager removes a member of a private room and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown, the member stays listed, and no text of the server appears

#### Scenario: Role change refused
- **WHEN** a manager changes the role of a member of a private room and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown, the member keeps the former role, and no text of the server appears

#### Scenario: Leave after an owner change refused
- **WHEN** the owner hands a private room over with the leave option and the server answers 403 to the leave
- **THEN** Common:EncryptedAccessChangeRefused is shown once and no second error follows it

#### Scenario: Refusal in an ordinary room
- **WHEN** the server answers 403 to a role change in a room that is not private
- **THEN** the failure is shown as it is for any room, and Common:EncryptedAccessChangeRefused is not shown

### Requirement: Leave dialog closes after a refused leave of a private room
The system SHALL close the leave dialog when the server refuses with 403 the leave of a private room, since confirming again cannot succeed. After any other failure of a leave the dialog SHALL stay open, with its buttons enabled, so the user can try again.

#### Scenario: Leave refused
- **WHEN** a member confirms leaving a private room and the server answers 403
- **THEN** the dialog closes

#### Scenario: Leave fails for another reason
- **WHEN** a member confirms leaving a room and the request fails without a 403
- **THEN** the failure is shown and the dialog stays open with its buttons enabled
