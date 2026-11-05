## MODIFIED Requirements

### Requirement: No upload or creation without the create right
The SDK SHALL NOT start an upload or a file creation from any entry, hotkeys and drops onto a row included, in a private room folder where the user cannot create files, an archived private room included, and SHALL NOT send the names of picked or dropped files to the server for it.

#### Scenario: Upload hotkey in an archived room
- **WHEN** the user presses the upload hotkey in an archived private room
- **THEN** no file picker opens and no request carries a file name

#### Scenario: File dropped on a row of an archived room
- **WHEN** the user drops a file onto a row of an archived private room
- **THEN** no upload starts and no request carries a file name

#### Scenario: File dropped without the create right
- **WHEN** a user who cannot create files in a private room folder drops a file onto it or onto one of its rows
- **THEN** no upload starts, no unlock prompt opens and no request carries a file name
