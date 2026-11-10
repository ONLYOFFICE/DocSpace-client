## MODIFIED Requirements

### Requirement: Version operations withheld
The system SHALL NOT offer version history, finalize version, version list or version blocking for an encrypted file. The version badge of an encrypted file MAY show the version count, but SHALL NOT open the version history or carry the Common:ShowVersionHistory tooltip, whatever history rights the server reports for the file.

#### Scenario: Context menu of an encrypted file
- **WHEN** the context menu of an encrypted file is opened
- **THEN** show-version-history, finalize-version, version and block-unblock-version are absent

#### Scenario: Version badge of an encrypted file
- **WHEN** the user clicks the version badge of an encrypted file that has several versions, in a list, table or tile view, and the server reports the ReadHistory right on it
- **THEN** the version history panel MUST NOT open, no version list is requested, and the badge has no Common:ShowVersionHistory tooltip

#### Scenario: Version badge of a file that is not encrypted
- **WHEN** the user clicks the version badge of a file that is not encrypted and has several versions, and the server reports the ReadHistory right on it
- **THEN** the version history panel opens, and the badge carries the Common:ShowVersionHistory tooltip
