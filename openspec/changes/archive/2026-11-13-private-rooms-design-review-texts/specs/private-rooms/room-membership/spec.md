# Spec Delta

## MODIFIED Requirements

### Requirement: Private badge in permanent settings
The system SHALL show one "private room" block with Common:PrivateRoomTitle and Common:PrivateRoomPanelDescription in the create and edit dialogs of a private room, in the place of the room type, and SHALL NOT show the Custom room block or a second private-room block there. Under the description it SHALL show a Common:LearnMore link to the help-center entry `privaterooms` when the portal's resources carry that entry, and no link otherwise.

#### Scenario: Edit dialog of a private room
- **WHEN** the edit dialog of a private room is open
- **THEN** the room type block shows the private room icon, Common:PrivateRoomTitle and Common:PrivateRoomPanelDescription, and neither Common:CustomRoomTitle nor a second private-room block is shown

#### Scenario: Create dialog of a private room
- **WHEN** the create dialog is open on the Private type
- **THEN** the same block is shown, with the same icon, title and description as in the edit dialog

#### Scenario: Edit dialog of an ordinary Custom room
- **WHEN** the edit dialog of a Custom room without the private setting is open
- **THEN** the room type block shows Common:CustomRoomTitle as before

#### Scenario: Help article configured
- **WHEN** the help-center resources of the portal carry the entry `privaterooms` and the create dialog is open on the Private type
- **THEN** a Common:LearnMore link under the description opens that article in a new tab

#### Scenario: No help article
- **WHEN** the help-center resources carry no entry `privaterooms`, or no help-center domain
- **THEN** the block shows no link
