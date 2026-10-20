# Spec Delta

## ADDED Requirements

### Requirement: No desktop encryption bridge
When the client or the editor runs inside the desktop application, the system SHALL NOT hand encryption keys to the desktop application and SHALL NOT answer its key requests; the desktop login carries only the user, portal and theme data and, when the desktop holds no key for the portal, an API key.

#### Scenario: Desktop login
- **WHEN** the client or the editor is initialised in the desktop application for a user with encryption keys
- **THEN** the login data sent to the desktop application carries no encryption keys and no handler for its key commands is registered

## REMOVED Requirements

### Requirement: Legacy desktop path uses editor-provided keys
**Reason**: The desktop encryption bridge is dropped: its per-file access call had no server route and its key write was answered 404, so it never obtained or stored keys.
**Migration**: None; the bridge never obtained or stored keys, so nothing that worked is lost.
