# Spec Delta

## ADDED Requirements

### Requirement: Client API surface matches server routes
The client SHALL NOT keep request functions for private-room routes the server does not expose. Every private-room request in the client API modules SHALL have a matching server route and an MSW handler with a contract test.

#### Scenario: Privacy availability removed
- **WHEN** the client API modules are inspected
- **THEN** no request targets the privacy availability route, the privacy settings route or a per-file privacy access route

#### Scenario: New private-room request added
- **WHEN** a developer adds a private-room request to the client API modules
- **THEN** a server route, an MSW handler and a contract test exist for it before the change is merged

## REMOVED Requirements

### Requirement: Client calls without a server route
**Reason**: The three dead requests are deleted; the desktop path is redirected to the room access route that exists.
**Migration**: Delete the request functions and their callers; the desktop bridge resolves keys through the room access route as specified in `private-rooms/editor-integration`.
