# Spec Delta

## MODIFIED Requirements

### Requirement: Context-menu entries withheld for encrypted files
The system SHALL NOT show the following entries for an encrypted file: link-for-room-members, copy-general-link, send-by-email, create-room, ask-ai, make-form, submit-to-gallery, docu-sign, custom-filter, update-xlsx-data, vectorization, embedding-settings, convert, download-as, mark-as-favorite, rename, edit-index, version entries and form-filling entries; it SHALL add download-encrypted.

#### Scenario: Full menu of an encrypted file
- **WHEN** the context menu of an encrypted file is built
- **THEN** none of the listed entries is present and download-encrypted is present

### Requirement: Context-menu entries withheld for folders in private rooms
The system SHALL NOT show link-for-room-members, create-room, favorites, edit-index, copy-to or duplicate for a folder inside a private room, and SHALL add download-encrypted when the folder is downloadable; the standard download decrypts the folder on the client (Decrypted folder download).

#### Scenario: Folder menu in a private room
- **WHEN** the context menu of a folder inside a private room is built
- **THEN** none of the listed entries is present

## ADDED Requirements

### Requirement: A visitor opens an external link without an account
The system SHALL open the address of an external link of a private item for a visitor who is not signed in: it asks for the password when the link has one, decrypts in the page and shows the item under its real name. It SHALL NOT upload, store or send anywhere the decrypted content or the secret of the address.

#### Scenario: Link to a file
- **WHEN** a visitor opens a valid link to an encrypted file
- **THEN** the file is shown under its decrypted name, with a preview where the browser can show it and a download of the decrypted file

#### Scenario: Link to a folder or a room
- **WHEN** a visitor opens a valid link to a folder or a private room
- **THEN** its files and folders are listed under their decrypted names

#### Scenario: File the link has no key for
- **WHEN** a listed file has no wrap for the link yet
- **THEN** the file is shown as not available yet and cannot be opened

#### Scenario: Revoked or expired link
- **WHEN** a visitor opens a link that was revoked or whose end date has passed
- **THEN** the page says the link no longer works and nothing is decrypted

### Requirement: What a visitor of an external link can do
The system SHALL let a visitor read and download the files a link covers, and open a document in the editor in the mode of the link's access: viewing, commenting, reviewing or editing. It SHALL NOT let a visitor upload, delete, move, rename or share anything, or see the members of the room.

#### Scenario: Link with the access to view
- **WHEN** a visitor of a link with the access to view opens a text document, a spreadsheet or a presentation
- **THEN** it opens in the editor for viewing only

#### Scenario: Link with the access to comment or review
- **WHEN** a visitor of a link with the access to comment or to review opens a document
- **THEN** it opens in that mode, and what the visitor adds is stored inside the encrypted file

#### Scenario: Link with the access to edit
- **WHEN** a visitor of a link with the access to edit opens a document
- **THEN** it opens for editing, and a save stores the file encrypted under the same file key

#### Scenario: Link for DocSpace users only
- **WHEN** a signed-in user of the portal who is not a member opens a link made for DocSpace users only
- **THEN** the item opens with the key of the link, and the user does not become a member of the room

#### Scenario: Link for DocSpace users only opened without signing in
- **WHEN** a visitor who is not signed in opens such a link
- **THEN** the sign-in is asked first and nothing is decrypted before it

#### Scenario: Visitor looks for other actions
- **WHEN** a visitor opens the menu of an item reached through a link
- **THEN** it offers no upload, delete, move, rename, share or members entry

### Requirement: Link entries of private items are shown to those who manage links
The system SHALL show sharing-settings, copy-shared-link and manage-links for an encrypted file and for a folder inside an active private room only to a member who may manage the room's links, while the portal allows external links of private rooms.

#### Scenario: Manager opens the menu of an encrypted file
- **WHEN** the owner or a room manager opens the context menu of an encrypted file
- **THEN** the three link entries are present

#### Scenario: Other member opens the menu
- **WHEN** a member who may not manage links opens the same menu
- **THEN** none of the three entries is present

#### Scenario: Archived room or links forbidden by the portal
- **WHEN** the room is archived, or the portal setting for external links of private rooms is off
- **THEN** none of the three entries is present for anybody
