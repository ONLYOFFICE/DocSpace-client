# Spec Delta

## ADDED Requirements

### Requirement: Private-room invitations are sent one invitee per request
The system SHALL send the invitations of a private room one invitee per room security request, in the client and the SDK. An invitee whose request is refused SHALL NOT stop the others, and every invitee whose request succeeded SHALL be re-wrapped as "Invited members receive re-wrapped file keys" describes. Rooms that are not private keep one request for all invitees.

#### Scenario: One invitee has never registered a key
- **WHEN** the inviter invites A, who holds a key, and B, who never registered one, into a private room
- **THEN** A becomes a member and receives the file keys, and B does not become a member

#### Scenario: Every invitee refused
- **WHEN** every invitee of a private-room invitation is refused
- **THEN** no re-wrap runs

### Requirement: Refused invitees are named in the invite result
The system SHALL name each refused invitee of a private-room invitation in the invite result: with Common:EncryptedInviteNoKey when the server refused with 403, which it does for a user who never registered a key, and with the generic error text otherwise.

#### Scenario: Invitee without a key named
- **WHEN** the server refuses an invitee of a private room with 403
- **THEN** the invite result names that invitee with Common:EncryptedInviteNoKey

#### Scenario: Other refusal named
- **WHEN** the request of an invitee fails with another error
- **THEN** the invite result names that invitee with the generic error text

## MODIFIED Requirements

### Requirement: Invitees without usable keys are skipped with a warning
The system SHALL skip re-encryption for an invitee whose key set is empty or whose key changed and was refused, SHALL still leave them as a room member, and SHALL name them in Common:EncryptedSkippedNoKeys or Common:EncryptedSkippedKeyMismatch. An invitee who never registered a key is refused by the server and never becomes a member; "Private-room invitations are sent one invitee per request" covers that case.

#### Scenario: Invitee has no key
- **WHEN** an invitee registered encryption keys earlier and has since deleted all of them
- **THEN** the invitee becomes a room member, no file access entry is created for them, and Common:EncryptedSkippedNoKeys lists their name

#### Scenario: Invitee key mismatch refused
- **WHEN** the current public key of an invitee differs from the pinned one and the inviter refuses it
- **THEN** no file access entry is created for them and Common:EncryptedSkippedKeyMismatch lists their name
