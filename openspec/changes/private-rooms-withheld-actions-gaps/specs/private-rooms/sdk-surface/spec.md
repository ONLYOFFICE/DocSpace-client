# Spec Delta

## ADDED Requirements

### Requirement: SDK does not send an encrypted file to conversion
The SDK SHALL NOT start a server conversion of an encrypted file whose format must be converted, from a double click, the Enter key or any other open action, and SHALL show Common:PrivateRoomConvertNotSupported instead, as the client does. The conversion dialog SHALL NOT open for such a file.

#### Scenario: Encrypted file that must be converted opened
- **WHEN** the user double-clicks, or presses Enter on, an encrypted file of a private room whose format must be converted, while the Document Server can open encrypted files
- **THEN** Common:PrivateRoomConvertNotSupported is shown, no conversion dialog opens and no conversion is requested from the server

#### Scenario: File outside private rooms that must be converted
- **WHEN** the user opens a file that is not encrypted and must be converted
- **THEN** the conversion dialog opens as before

### Requirement: SDK declined unlock on a copy or move says nothing was transferred
The SDK SHALL show Common:EncryptionLockedCopy, and SHALL NOT show Common:EncryptionLockedAddMembers, when the user declines to unlock as an encrypted copy, move or duplicate starts. Nothing SHALL be transferred.

#### Scenario: Unlock declined on a copy in the SDK
- **WHEN** the user copies an encrypted file out of a private room in the SDK and dismisses the passphrase prompt
- **THEN** Common:EncryptionLockedCopy is shown and no file is copied

#### Scenario: Unlock declined on a duplicate in the SDK
- **WHEN** the user duplicates an encrypted file in the SDK and dismisses the passphrase prompt
- **THEN** Common:EncryptionLockedCopy is shown and no copy is stored

## MODIFIED Requirements

### Requirement: Menu entries withheld for encrypted items
The SDK SHALL withhold for an encrypted file, in row, header and selection menus, the entries the client withholds: rename, favorites, version entries, download-as, conversion, AI and integrator custom actions, and open and preview when the file opens only after a conversion; and for a folder inside a private room: copy, duplicate and favorites. It SHALL offer download without decryption in the row and header menus. The selection menu SHALL withhold copy for a selection that holds a folder of a private room, whatever rights the folder reports.

#### Scenario: Header menu of an encrypted file
- **WHEN** a single encrypted file is selected and the header menu is opened
- **THEN** no favorites, rename or download-as entry is shown and download without decryption is offered

#### Scenario: Header menu of a folder inside a private room
- **WHEN** a folder inside a private room is open and its header menu is opened
- **THEN** no copy, duplicate or favorites entry is shown

#### Scenario: Selection holding a folder of a private room
- **WHEN** a folder of a private room is ticked, alone or with encrypted files, and the selection menu is opened, whatever Copy right the folder reports
- **THEN** no copy entry is offered

#### Scenario: Selection of encrypted files only
- **WHEN** only encrypted files of a private room are ticked and the selection menu is opened
- **THEN** copy is offered although the server reports no Copy right for the files

#### Scenario: Integrator action on an encrypted file
- **WHEN** the host registered custom context actions and the user opens the menu of an encrypted file
- **THEN** the custom actions are not shown

#### Scenario: Encrypted file that must be converted
- **WHEN** the user opens the menu of an encrypted file that opens only after a conversion
- **THEN** no open or preview entry is shown
