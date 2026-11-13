## MODIFIED Requirements

### Requirement: AI and plugin actions withheld
The system SHALL NOT offer AI actions or plugin actions for a private room, its folders or its files, neither in the context menu nor as plugin tabs of the info panel.

#### Scenario: Context menu in a private room
- **WHEN** any item inside a private room is right-clicked
- **THEN** ask-ai and plugin entries are absent

#### Scenario: Info panel of a private item
- **WHEN** a plugin that adds an info-panel tab is enabled and the info panel shows a private room, a folder inside one or an encrypted file
- **THEN** the plugin tab MUST NOT be shown

#### Scenario: Info panel of an item outside private rooms
- **WHEN** the same plugin is enabled and the info panel shows a room, folder or file outside private rooms that meets the plugin's own conditions
- **THEN** the plugin tab is shown
