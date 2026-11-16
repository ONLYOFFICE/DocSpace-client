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
The system SHALL let a visitor with the viewer role read and download the files a link covers, and a visitor with the editor role also edit a document in the editor. It SHALL NOT let a visitor upload, delete, move, rename or share anything, or see the members of the room.

#### Scenario: Viewer opens a document
- **WHEN** a visitor with the viewer role opens a text document, a spreadsheet or a presentation
- **THEN** it opens in the editor for viewing only

#### Scenario: Editor edits a document
- **WHEN** a visitor with the editor role opens a document
- **THEN** it opens for editing, and a save stores the file encrypted under the same file key

#### Scenario: Visitor looks for other actions
- **WHEN** a visitor opens the menu of an item reached through a link
- **THEN** it offers no upload, delete, move, rename, share or members entry
