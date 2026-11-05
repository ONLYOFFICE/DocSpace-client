# Spec Delta

## ADDED Requirements

### Requirement: Key writes are left out of the History tab
The system SHALL leave the file-keys-issued entry the server lists in a file's and a folder's history (action FileKeysSet, 5164) out of the History tab of a private room and of its files, rendering the other entries as before; the write stays in the audit trail with its recipients.

#### Scenario: Key write listed
- **WHEN** the history of a private room or of one of its files carries a file-keys-issued entry
- **THEN** the tab shows nothing for it and the other entries as usual
