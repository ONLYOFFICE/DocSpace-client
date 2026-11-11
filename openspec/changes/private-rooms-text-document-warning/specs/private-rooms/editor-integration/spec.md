# Spec Delta

## ADDED Requirements

### Requirement: Encrypted text documents carry a reopening warning
The system SHALL show Common:PrivateRoomTextDocumentWarning when the editor opens an encrypted text document for editing, before the user makes a first edit, once per opening. It SHALL NOT show the warning for an encrypted spreadsheet, presentation or PDF, for a document opened for viewing, or for a file that is not encrypted.

#### Scenario: Text document opened for editing
- **WHEN** the editor opens an encrypted text document in a private room for editing
- **THEN** Common:PrivateRoomTextDocumentWarning is shown once, before any edit

#### Scenario: Spreadsheet, presentation or PDF
- **WHEN** the editor opens an encrypted spreadsheet, presentation or PDF for editing
- **THEN** the warning is not shown

#### Scenario: Text document opened for viewing
- **WHEN** the editor opens an encrypted text document for viewing
- **THEN** the warning is not shown

#### Scenario: Text document that is not encrypted
- **WHEN** the editor opens a text document of an ordinary room for editing
- **THEN** the warning is not shown
