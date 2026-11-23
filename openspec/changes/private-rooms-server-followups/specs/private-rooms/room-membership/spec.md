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

#### Scenario: Owner removes the own profile
- **WHEN** the owner of a private room confirms the removal of the own profile and the server refuses for that room
- **THEN** Common:PrivateRoomOwnerCannotBeDisabled is shown on the confirmation page and the profile stays

#### Scenario: Refused for a private room
- **WHEN** an administrator turns the owner of a private room into a guest and the server refuses because the user who would take the rooms cannot open them
- **THEN** Common:PrivateRoomsCannotPassToUser is shown and the type is not changed

#### Scenario: Another failure
- **WHEN** the same request fails for another reason
- **THEN** the failure is shown as it was before, and neither text is shown

### Requirement: Private rooms left with an account are named
The system SHALL tell the administrator, when a reassignment of a user's data ends, that private rooms stayed with the account, and who can hand such a room over, when the server names rooms it left there.

#### Scenario: Private rooms kept
- **WHEN** the reassignment of a user's data ends and its progress names private rooms left with the account
- **THEN** Common:PrivateRoomsKeptWithAccount is shown in place of the message of success

#### Scenario: Every private room moved
- **WHEN** the reassignment ends and its progress names no room, with an empty list or with none
- **THEN** the message of success is shown as before
