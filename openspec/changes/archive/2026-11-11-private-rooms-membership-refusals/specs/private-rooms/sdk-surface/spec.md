# Spec Delta

## ADDED Requirements

### Requirement: SDK explains a refused access change in a private room
The SDK SHALL show Common:EncryptedAccessChangeRefused when the server refuses with 403 a leave, a member's removal or a member's role change in a private room, MUST NOT show the server's own message text for it, and SHALL close its leave dialog after a refused leave, as the client does. Any other failure SHALL be shown as before, the leave dialog staying open.

#### Scenario: Leave refused
- **WHEN** a member confirms leaving a private room in the SDK and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown, the dialog closes, and no text of the server appears

#### Scenario: Removal or role change refused
- **WHEN** a manager removes a member of a private room or changes the member's role in the SDK and the server answers 403
- **THEN** Common:EncryptedAccessChangeRefused is shown, the member stays as listed, and no text of the server appears

#### Scenario: Leave fails for another reason
- **WHEN** a member confirms leaving a private room in the SDK and the request fails without a 403
- **THEN** the failure is shown and the dialog stays open
