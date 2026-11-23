# Spec Delta

## REMOVED Requirements

### Requirement: Refused access change in a private room is explained
**Reason**: The server no longer refuses a leave, a removal or a role change of a member for want of keys (`server-contract`, "Key check only when access is first granted"), so the text Common:EncryptedAccessChangeRefused had no case left to explain.
**Migration**: A failed leave, removal or role change in a private room is shown as in any room. The helper, its call sites and the Common key are deleted.

## ADDED Requirements

### Requirement: Refused change of an account that owns private rooms is explained
The system SHALL show a text of its own, and not the server's message, when the server refuses to disable an account or to turn it into a guest because of the private rooms the account owns. A failure of another kind SHALL be shown as before.

#### Scenario: Deactivated owner
- **WHEN** an administrator disables one or several accounts in the accounts list and the server refuses because one of them owns a private room
- **THEN** Common:PrivateRoomOwnerCannotBeDisabled is shown once and no account is shown as disabled

#### Scenario: Refused for a private room
- **WHEN** an administrator turns the owner of a private room into a guest and the server refuses because the user who would take the rooms cannot open them
- **THEN** Common:PrivateRoomsCannotPassToUser is shown and the type is not changed

#### Scenario: Another failure
- **WHEN** the same request fails for another reason
- **THEN** the failure is shown as it was before, and neither text is shown
