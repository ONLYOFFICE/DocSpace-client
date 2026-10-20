# Spec Delta

## ADDED Requirements

### Requirement: E2E mocks mirror the server contract
The client E2E mocks for private-room endpoints SHALL answer with the routes, status codes, response envelope and DTO fields of the server implementation, and every mock handler SHALL name the server action it mirrors. A shape that cannot be traced to the server source SHALL NOT be added to a mock.

#### Scenario: Duplicate key id
- **WHEN** an E2E spec posts a key envelope whose id is already stored
- **THEN** the mock answers 409 and stores nothing, as the server does

#### Scenario: Access entries read
- **WHEN** an E2E spec reads a file's access entries as one user
- **THEN** the mock returns only that user's wrapped keys

#### Scenario: Entry inside a room
- **WHEN** a mock returns a file or folder that lives inside a room
- **THEN** its root folder id is the Rooms section id, not the room id
