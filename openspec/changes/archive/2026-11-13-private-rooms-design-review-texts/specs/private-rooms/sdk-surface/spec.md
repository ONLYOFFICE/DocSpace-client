# Spec Delta

## ADDED Requirements

### Requirement: Private room dialog explains the room
The SDK SHALL show Common:PrivateRoomPanelDescription under Common:PrivateRoomTitle in the private block of its create and edit room dialog, the text the client shows there. It SHALL NOT show a help link in that block.

#### Scenario: Creating a private room
- **WHEN** the SDK's create dialog of a private room is open
- **THEN** the private block shows Common:PrivateRoomTitle and Common:PrivateRoomPanelDescription and no link
