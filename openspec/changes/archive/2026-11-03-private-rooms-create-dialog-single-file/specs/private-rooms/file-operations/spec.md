# Spec Delta

## ADDED Requirements

### Requirement: One create action makes one file
The system SHALL create exactly one file for one create action in a private room, under the name the user confirmed, and SHALL NOT start a second creation when the file-name setting changes while the file is being created. The name dialog SHALL stay open, with its Create button loading, until the creation has finished.

#### Scenario: Don't ask again ticked in the name dialog
- **GIVEN** a user with keys who is asked for file names (Common:DontAskAgain is off in the profile)
- **WHEN** the user chooses "New presentation" in a private room, ticks Common:DontAskAgain in the name dialog and presses Create
- **THEN** exactly one encrypted presentation, Common:NewPresentation, is created and one editor opens
- **AND** no second file is created after the setting has been saved

#### Scenario: Name typed and Don't ask again ticked
- **WHEN** the user types "Q4 plan" in the name dialog of a new presentation, ticks Common:DontAskAgain and presses Create
- **THEN** only "Q4 plan.pptx" is created, and no file with the default name appears

#### Scenario: Dialog during the creation
- **WHEN** the user presses Create with Common:DontAskAgain ticked and the encrypted file is still being produced
- **THEN** the name dialog stays open with its Create button loading, and closes once the file is created or the creation fails

#### Scenario: File names not asked
- **GIVEN** Common:DontAskAgain is on in the profile
- **WHEN** a user with keys chooses "New document" in a private room
- **THEN** no name dialog is shown and exactly one encrypted document, Common:NewDocument, is created
