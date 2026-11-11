## ADDED Requirements

### Requirement: Groups and guests are not members of a private room
The system SHALL NOT make a group or a guest a member of a private room in this version. The server refuses a group's share with 403, because its key check finds no encryption key for a group, and it refuses a guest the same way, because a guest cannot store an encryption key. The invite panels offer neither.

#### Scenario: Group shared with a private room
- **WHEN** a group is sent in the share request of a private room
- **THEN** the server answers 403 and the group gets no access

#### Scenario: Guest shared with a private room
- **WHEN** a guest is sent in the share request of a private room
- **THEN** the server answers 403, since the guest holds no key, and the guest gets no access

#### Scenario: Guest tries to store a key
- **WHEN** a guest submits an encryption key pair
- **THEN** the server refuses it with 403 and stores nothing

## REMOVED Requirements

### Requirement: Removing a group revokes each member
**Reason**: A group cannot be a member of a private room (see "Groups and guests are not members of a private room"), so there is no group to remove.
**Migration**: None.
