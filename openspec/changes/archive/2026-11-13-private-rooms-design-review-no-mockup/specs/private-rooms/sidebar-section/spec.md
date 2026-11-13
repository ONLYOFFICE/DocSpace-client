# Spec Delta

## MODIFIED Requirements

### Requirement: Private rooms are created from the section
The system SHALL open the create-room dialog directly on the Private room type, with the type locked, from every create entry point of the section:
- the header create button and the header "+" on an empty page;
- the mobile create button;
- "+ New" and the context menu of empty space in the list;
- the empty-state button;
- the Shift+R hotkey.

A user without the right to create rooms SHALL get none of these entry points.

#### Scenario: Room admin creates from the section
- **WHEN** a room admin with an encryption key presses the create button in the Private list
- **THEN** the create-room dialog opens on the Private room type with no type chooser and the type cannot be changed

#### Scenario: Hotkey in the section
- **WHEN** a room admin presses Shift+R on the Private list
- **THEN** the create-room dialog opens on the Private room type, not on the generic chooser

#### Scenario: User without the room-creation right
- **WHEN** a user of type User or Guest opens the Private list
- **THEN** no create entry point is offered and Shift+R does nothing

### Requirement: Quick actions in the section
The system SHALL NOT show a quick-action banner in the Private list: a private room is created with the create button of the section. No room type, room template or AI tile SHALL be offered there.

#### Scenario: Banner on a non-empty Private list
- **WHEN** a room admin opens a non-empty Private list with quick actions enabled in the profile
- **THEN** no quick-action banner is shown above the list

#### Scenario: Banner inside a private room
- **WHEN** the same user opens a private room from that list
- **THEN** the quick actions of the room are shown as file-operations, "Quick actions in private rooms", describes

### Requirement: Section empty state
The system SHALL show the Private section empty state when the unfiltered section list is empty, with the title EmptyView:EmptyRootPrivateRoomsTitle and the illustration of an empty private room. Users who may create rooms SHALL see Common:PrivateRoomsListEmptyDescription and one action, Common:CreatePrivateRoom; other users SHALL see EmptyView:EmptyRootPrivateRoomsUserDescription and no action. An empty filtered list SHALL show the standard nothing-found view.

#### Scenario: Room admin without private rooms
- **WHEN** a room admin opens an empty Private list
- **THEN** the empty state shows EmptyView:EmptyRootPrivateRoomsTitle, Common:PrivateRoomsListEmptyDescription and Common:CreatePrivateRoom as its only option, with no invite, import or AI entry

#### Scenario: User without private rooms
- **WHEN** a user of type User opens an empty Private list
- **THEN** the empty state shows EmptyView:EmptyRootPrivateRoomsUserDescription and no create button

#### Scenario: Illustration of the section
- **WHEN** any user opens an empty Private list
- **THEN** the illustration is the one of an empty private room, not the one of the Rooms section

#### Scenario: Rooms section unchanged
- **WHEN** a room admin opens an empty Rooms list
- **THEN** the illustration, the texts and the options of the Rooms empty state are shown as before

## ADDED Requirements

### Requirement: Create entries of the section name the private room
The system SHALL label the create button of the Private list, its header action and the "+ New" entry of the list with Common:NewPrivateRoom. The Rooms and AI sections SHALL keep Common:NewRoom.

#### Scenario: Create button in the Private list
- **WHEN** a room admin opens the Private list
- **THEN** the create button reads Common:NewPrivateRoom

#### Scenario: Create button in the Rooms list
- **WHEN** a room admin opens the Rooms list
- **THEN** the create button reads Common:NewRoom
