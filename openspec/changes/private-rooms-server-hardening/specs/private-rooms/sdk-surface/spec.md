# Spec Delta

## ADDED Requirements

### Requirement: Private room creation needs a Document Server that encrypts
The SDK SHALL refuse to start private room creation when its files settings report that the connected Document Server cannot work with encrypted files, with Common:PrivateRoomDocServiceNotSupported, and SHALL show the same key when the server refuses the creation for that reason.

#### Scenario: Document Server without encryption
- **WHEN** a user starts creating a private room and the files settings report no encrypted-editing support
- **THEN** Common:PrivateRoomDocServiceNotSupported is shown and no dialog opens

#### Scenario: Creation refused by the server
- **WHEN** the server refuses the creation of a private room because the Document Server cannot encrypt
- **THEN** Common:PrivateRoomDocServiceNotSupported is shown instead of the server's message

## MODIFIED Requirements

### Requirement: Member removal warning
When a member is removed from a private room in the SDK, the removal dialog SHALL warn that the member will lose access to encrypted files, and the removal SHALL run through the role update alone, without a revocation of the SDK's own; the server removes the member's wrapped keys with the share.

#### Scenario: Remove a member
- **WHEN** a member is removed from a private room
- **THEN** the warning is shown, the role update runs and the SDK writes no access entry

#### Scenario: Remove a group
- **WHEN** a group is removed from a private room
- **THEN** the role update runs for the group alone, without expanding it into its members, and the SDK writes no access entry

### Requirement: Leaving a private room revokes own access first
The SDK SHALL, when the user leaves a private room, including through an owner change with the leave option, drop the role without a revocation of its own; the server removes the leaver's wrapped keys with the role, the room's creator excepted.

#### Scenario: Member leaves
- **WHEN** a member leaves a private room
- **THEN** the role is dropped, the SDK writes no access entry, and the leaver's keys are gone from every encrypted file of the room

## RENAMED Requirements

- FROM: `### Requirement: Member removal warning and group expansion`
- TO: `### Requirement: Member removal warning`
