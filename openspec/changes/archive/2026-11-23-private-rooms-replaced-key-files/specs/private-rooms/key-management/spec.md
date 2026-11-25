# Spec Delta

## MODIFIED Requirements

### Requirement: Ghost-state notification
The system SHALL show, once per session, a toast (Common:GhostStateDetected) linking to Keys management when a download, copy or filename recovery fails because the user's key cannot unwrap the file. It SHALL NOT show that toast for a file whose access entry names a key the user no longer holds.

#### Scenario: Unreadable file
- **WHEN** an encrypted operation finds no usable wrap for the current user
- **THEN** the ghost-state toast appears once, later failures in the session stay silent

#### Scenario: File wrapped for a previous key
- **WHEN** filename recovery, a download or a copy meets a file whose access entry names a key that is not in the user's key list
- **THEN** the ghost-state toast is not shown and the session's one toast is not used up
