# Spec Delta

## MODIFIED Requirements

### Requirement: Decrypted filenames are session-scoped
The system SHALL cache decrypted filenames only in sessionStorage and SHALL clear the cache whenever the identity is locked, an unlocked session that expires on its own included.

#### Scenario: Lock clears names
- **WHEN** the identity locks (explicitly or on idle)
- **THEN** the filename cache is emptied and the list shows opaque names until the next unlock

#### Scenario: Unlocked session expires
- **WHEN** the unlocked identity expires without an explicit lock
- **THEN** the filename cache is emptied as on any other lock
