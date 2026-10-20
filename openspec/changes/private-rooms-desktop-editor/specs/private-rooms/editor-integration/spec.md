# Spec Delta

## ADDED Requirements

### Requirement: Private-room files are withheld in the desktop application
When the editor runs inside the desktop application, the system SHALL NOT open a private-room file: it SHALL NOT ask for the identity unlock, SHALL NOT unwrap the file key or place any key in the editor configuration, and SHALL show Common:PrivateRoomDesktopEditorNotSupported instead of the editor. Files outside private rooms open in the desktop application as before.

#### Scenario: Private-room file opened in the desktop application
- **WHEN** a user opens an encrypted file from a private room in the desktop application
- **THEN** the editor is not mounted and Common:PrivateRoomDesktopEditorNotSupported is shown; no unlock prompt appears and no file key is unwrapped or passed to the editor configuration

#### Scenario: Ordinary file opened in the desktop application
- **WHEN** a user opens a file outside private rooms in the desktop application
- **THEN** the editor opens the file as it did before this change

#### Scenario: Private-room file opened in the browser
- **WHEN** a user opens the same private-room file in the browser
- **THEN** the identity unlock and the key hand-over run as the other editor-integration requirements describe
