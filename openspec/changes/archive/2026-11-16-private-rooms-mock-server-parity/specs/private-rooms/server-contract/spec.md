# Spec Delta

## MODIFIED Requirements

### Requirement: Private room creation requires keys
The server SHALL refuse with 403 a room creation request that sets the private flag when the caller has no stored key record or an empty key set, and with 400 on third-party storage and on the AI hub room types. It SHALL answer 403 for a public or a form-filling room created as private, and SHALL otherwise store the room with the requested room type and the private setting.

#### Scenario: Caller without keys
- **WHEN** a user without encryption keys creates a private room
- **THEN** the server answers 403

#### Scenario: Caller who deleted all keys
- **WHEN** a user whose key set is empty creates a private room
- **THEN** the server answers 403

#### Scenario: Caller with keys
- **WHEN** a user with encryption keys creates a private room
- **THEN** the room is created with the requested room type and the private setting

#### Scenario: Third-party room created as private
- **WHEN** a user, with or without encryption keys, creates a room on a connected third-party storage as private
- **THEN** the server answers 400, creates no room, and the connection can still back an ordinary room

#### Scenario: AI hub room created as private
- **WHEN** a Knowledge, Instructions or AI project room creation request sets the private flag
- **THEN** the server answers 400 and creates no room

#### Scenario: AI agent created as private
- **WHEN** a user with encryption keys creates an AI agent with the private flag while the Document Server encrypts
- **THEN** the agent is created with the private setting

#### Scenario: Public or form-filling room created as private
- **WHEN** a user with encryption keys creates a public or a form-filling room with the private flag while the Document Server encrypts
- **THEN** the server answers 403 "Access denied"
