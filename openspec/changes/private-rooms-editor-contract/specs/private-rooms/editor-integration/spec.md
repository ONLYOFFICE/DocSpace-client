# Spec Delta

## ADDED Requirements

### Requirement: Versioned Document Server encryption contract
The client SHALL rely on a written, versioned contract with the Document Server for encrypted files. It SHALL state how the editor's web client reads the encryption keys entry, that the DSE3 container is decrypted and re-encrypted in the browser with the crypto library the Document Server ships, which container versions are read (2 and 3) and written (3), which library build ships, how the signed token treats the entry, and the first Document Server version.

#### Scenario: Contract referenced by version
- **WHEN** the client builds the editor configuration for an encrypted file
- **THEN** the configuration carries the contract version the client implements

#### Scenario: Save round-trip
- **WHEN** the user saves an encrypted document in the editor
- **THEN** the editor encrypts it in the browser with the same DEK, the server stores it as a new encrypted version, and no new key wraps are written

#### Scenario: Container versions
- **WHEN** the Document Server opens a file stored as a DSE3 version-2 or version-3 container and saves it
- **THEN** it decrypts either version and the saved container is version 3

#### Scenario: Plaintext stays in the browser
- **WHEN** an encrypted document is opened, edited and saved in the editor
- **THEN** neither the DEK nor the document's plaintext MUST be sent to the Document Server or to the portal

### Requirement: Document Server capability check before opening
The client SHALL learn from the server whether the connected Document Server declares encrypted-editing support, and SHALL NOT mount the editor for an encrypted file when the capability is absent. The user SHALL see Common:PrivateRoomEditorNotSupported instead of the editor.

#### Scenario: Capability absent
- **WHEN** an encrypted file is opened and the Document Server does not declare encrypted-editing support
- **THEN** the key flow is not started, no DEK is unwrapped, and Common:PrivateRoomEditorNotSupported is shown

#### Scenario: Capability present
- **WHEN** the Document Server declares the capability
- **THEN** the key flow runs as specified and the editor is mounted when keys are ready

### Requirement: Encrypted files can be co-edited
The system SHALL let several members edit an encrypted file at the same time. Each co-editor's editor SHALL obtain the DEK from that member's own access entry, and the Document Server SHALL relay and store only changes encrypted with the DEK.

#### Scenario: Second editor
- **WHEN** a member with an access entry opens an encrypted file that another member is editing
- **THEN** both edit the file and each sees the other's changes

#### Scenario: Changes encrypted at the Document Server
- **WHEN** co-editing changes of an encrypted file reach the Document Server
- **THEN** every stored change is ciphertext and the typed text MUST NOT be readable there

### Requirement: Saved encrypted file reopens without replaying its changes
After the editor saves an encrypted document, the system SHALL open it again from a base that matches the editing session: a later open SHALL NOT apply changes that the saved version already contains, so a saved encrypted file always opens.

#### Scenario: Reopen after save
- **WHEN** a user saves an encrypted document in the editor, everyone closes it, and the user opens it again
- **THEN** the saved version opens with the saved content and no change error

#### Scenario: Rejoin after a save
- **WHEN** a member saves an encrypted document and opens it again while another member is still editing it
- **THEN** the member rejoins the same session and sees the current content without a change error

### Requirement: Document address reachable from the browser
For an encrypted file, the document address in the editor configuration SHALL be reachable from the user's browser, because the editor downloads and decrypts the file there. An address meant only for requests from the Document Server to the portal SHALL NOT be used for it.

#### Scenario: Internal address for the Document Server
- **WHEN** the portal uses an internal address for requests from the Document Server that the user's browser cannot reach
- **THEN** the document address of an encrypted file uses an address the browser reaches, and the editor opens the file

### Requirement: Decrypted copies only on the user's device
The editor SHALL offer download-as and save-copy-as for an encrypted file only as a copy built in the browser and saved to the user's device, decrypted, as DOCX or PDF. Such a copy SHALL NOT be stored in a portal folder and SHALL NOT be produced by Document Server conversion.

#### Scenario: Download as DOCX
- **WHEN** the user downloads an encrypted document as DOCX from the editor
- **THEN** a decrypted DOCX is saved on the user's device and no conversion request reaches the Document Server

#### Scenario: Save copy as
- **WHEN** the user chooses save-copy-as for an encrypted document
- **THEN** a decrypted copy is saved on the user's device and no file MUST be created in any portal folder

### Requirement: Print allowed for encrypted files
The editor SHALL allow printing an encrypted document; the printable PDF is built in the browser from the decrypted document already loaded in the editor session.

#### Scenario: Print
- **WHEN** the user prints an encrypted document from the editor
- **THEN** the print dialog opens with the decrypted content and nothing is sent to the Document Server for conversion

### Requirement: Version history withheld in the editor for encrypted files
The editor SHALL NOT attach version-history events for an encrypted file, matching the client, where version operations are withheld for encrypted files.

#### Scenario: History rights on an encrypted file
- **WHEN** the user has history rights and opens an encrypted file
- **THEN** no history events are attached and the history panel is unavailable

### Requirement: Encrypted PDF forms are filled as edits
The editor SHALL let a member with edit rights create, edit and fill an encrypted PDF form in a private room through the edit mode, and SHALL save it as a new encrypted version of the same file.

#### Scenario: Form filled and saved
- **WHEN** a member fills the fields of an encrypted PDF form in a private room and saves it
- **THEN** a new encrypted version of the form is stored and the file is still a form

### Requirement: Encrypted form keeps its form flag when saved
When the editor saves an encrypted PDF form, the saved DSE3 container SHALL carry the form flag in its header, as the container the form was opened from did.

#### Scenario: Form flag after a save
- **WHEN** the editor saves an encrypted PDF form whose header carries the form flag
- **THEN** the header of the saved container carries the form flag

### Requirement: Encrypted forms are not submitted to form-data collection
The system SHALL NOT accept a form submission of an encrypted file into form-data collection (a form-filling room). Such a submission would be stored without encryption and its field values reported in plaintext, so the server SHALL refuse it.

#### Scenario: Submission refused
- **WHEN** a filler submits an encrypted PDF form in a form-filling room
- **THEN** the server refuses it, no result file is stored, and no field value MUST be indexed, exported or sent to an external database

### Requirement: Share to fill out hidden in a private room
The editor SHALL NOT offer "Share to fill out" for a PDF form in a private room, since its destinations, a form-filling room and a virtual data room, take the form out of the private room.

#### Scenario: Form opened in a private room
- **WHEN** an encrypted PDF form is opened for editing in a private room
- **THEN** the "Share to fill out" action is absent from the editor

## MODIFIED Requirements

### Requirement: DEK handed to the editor configuration
The editor SHALL pass the base64-encoded DEK, a crypto engine identifier and the contract version to the editor configuration under the encryption keys entry, keeping the document address pointing at the ciphertext stored on the server. The entry SHALL be typed in the editor configuration types, and the DEK SHALL stay outside the signed token, so that it never reaches the portal or the Document Server.

#### Scenario: Configuration extended
- **WHEN** keys reach the ready state
- **THEN** the editor configuration contains the DEK, crypto engine id and contract version
- **AND** the document URL is unchanged and still references the encrypted blob

#### Scenario: Engine id taken from the server
- **WHEN** the server configuration lists key pairs with a crypto engine id
- **THEN** that engine id is used; otherwise the client default is used

#### Scenario: Token handling
- **WHEN** the server signs the editor configuration of an encrypted file
- **THEN** the DEK is not part of the signed payload, and the Document Server accepts the configuration with the DEK beside it

### Requirement: SDK does not open encrypted files in the editor
The SDK file list SHALL refuse to open an encrypted file in the editor while the Document Server capability is absent and SHALL show Common:PrivateRoomEditorNotSupported; when the capability is present it SHALL open the file through the same key flow as the client.

#### Scenario: Open from the SDK
- **WHEN** a user opens an encrypted file from a private room in the SDK and the capability is absent
- **THEN** an info toast with Common:PrivateRoomEditorNotSupported is shown and no editor is opened

#### Scenario: Open from the SDK with capability
- **WHEN** a user opens an encrypted file from a private room in the SDK and the capability is present
- **THEN** the editor opens and the key flow runs as in the client

## REMOVED Requirements

### Requirement: Co-authoring flag cleared for encrypted files
**Reason**: Co-editing of encrypted files is allowed (decided 2026-10-29), and the Document Server does not read the flag.
**Migration**: Stop clearing `canCoAuthoring` for encrypted files; the generic co-editing configuration applies.

### Requirement: Editor actions without encrypted-specific handling
**Reason**: Replaced by explicit per-action policies (decrypted copies on the device, print, version history, PDF forms).
**Migration**: Implement the policies above; the generic flows stay for non-encrypted files.

### Requirement: No Document Server version is declared
**Reason**: Replaced by the versioned contract and the capability check.
**Migration**: The client declares the contract version it implements and refuses to open encrypted files when the Document Server lacks the capability.
