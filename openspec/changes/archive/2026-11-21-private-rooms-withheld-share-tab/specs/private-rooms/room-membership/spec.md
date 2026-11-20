## MODIFIED Requirements

### Requirement: Share tab hidden for private items
The system SHALL NOT show the Share tab of the info panel for a private room, a folder inside it, or an encrypted file, whatever share right the server reports for the item.

#### Scenario: Encrypted file selected
- **WHEN** an encrypted file is selected and the info panel opens
- **THEN** the tabs do not include Share

#### Scenario: Private room selected in a list
- **WHEN** a private room is selected in the Private or Rooms list and the info panel opens
- **THEN** the tabs do not include Share

#### Scenario: Folder inside a private room selected
- **WHEN** a folder inside a private room is selected while that room or one of its folders is open, and the info panel opens
- **THEN** the tabs do not include Share, even when the folder reports the share right
