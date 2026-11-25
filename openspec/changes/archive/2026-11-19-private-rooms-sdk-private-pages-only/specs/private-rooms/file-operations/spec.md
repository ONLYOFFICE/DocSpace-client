# Spec Delta

## ADDED Requirements

### Requirement: Frame methods create nothing in a private room without the opt-in
The client running in an embedding frame SHALL refuse the `createFile` frame method for a private room or a folder inside one, and the `createFolder` method there unless the frame configuration carries the private-rooms opt-in. It SHALL decide from the room on the folder's path before any request about the new item, answer the host with an error and leave the list as it is.

#### Scenario: File created into a private room through a frame method
- **WHEN** the host calls `createFile` with a private room or a folder inside one, whether or not the frame carries the opt-in
- **THEN** the host receives an error, no request carries the title of the file, and no file is created

#### Scenario: Folder created into a private room without the opt-in
- **WHEN** the host of a frame without the private-rooms opt-in calls `createFolder` with a private room or a folder inside one
- **THEN** the host receives an error, no request carries the title of the folder, and no folder is created

#### Scenario: Folder created into a private room with the opt-in
- **WHEN** the host of a frame with the private-rooms opt-in calls `createFolder` with a private room or a folder inside one
- **THEN** the folder is created and returned to the host, as in a room without the private setting

#### Scenario: Folder outside private rooms
- **WHEN** the host calls `createFile` or `createFolder` with a folder outside private rooms
- **THEN** the item is created and returned to the host as before
