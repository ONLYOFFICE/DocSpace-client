# Spec Delta

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
