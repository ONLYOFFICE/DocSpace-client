# Editor Integration Specification

## Purpose
Describes what the document editor application does today when it opens a file that belongs to a private (end-to-end encrypted) room, and the server-side editor behaviour the client relies on. The browser obtains the file's data encryption key (DEK) and hands it to the editor configuration; the document address still points at the ciphertext, so decryption of the document body is delegated to the Document Server. This capability records the contract as it exists on the branch; the pieces that have no encrypted-specific handling are stated as current behaviour. Implementation: packages/doceditor/src/hooks/useFileEncryptionKeys.ts, packages/doceditor/src/components/Editor.tsx, packages/doceditor/src/components/EncryptionProviderWrapper.tsx, packages/doceditor/src/hooks/useEditorEvents.ts, packages/doceditor/src/utils/actions.ts, packages/doceditor/src/utils/initDesktop.ts; server products/ASC.Files/Server/Api/EditorController.cs, Core/Helpers/DocSpaceHelper.cs, Core/Utils/FileChecker.cs, Core/Services/DocumentService/DocumentServiceTracker.cs, Core/HttpHandlers/FileHandler.ashx.cs.

## Requirements

### Requirement: Editor loads the caller's key envelopes before opening an encrypted file
The editor application SHALL load the current user's encryption key envelopes from the server when it starts, and SHALL wrap the editor page in the encryption provider so that unlock dialogs are available to the key-resolution flow.

#### Scenario: Envelopes loaded on start
- **WHEN** the editor page opens for any file
- **THEN** the user's key envelopes are requested from the server and kept in the encryption provider
- **AND** the passphrase modal and key-change dialog are mounted for later use

### Requirement: Editor fetches the file's access entries
For a file marked encrypted, the editor SHALL fetch the file's encryption access entries and SHALL require that an entry for the calling user exists before continuing.

#### Scenario: Caller has an entry
- **WHEN** the access entries contain a wrap for the current user
- **THEN** the key-resolution flow continues to unlock the identity

#### Scenario: Caller has no entry
- **WHEN** the access entries contain no wrap for the current user
- **THEN** the key-resolution flow ends in the error state and the editor is not mounted

### Requirement: Identity unlock precedes key unwrap
The editor SHALL unlock the user's identity through the shared passphrase or passkey dialog before unwrapping the file key, and SHALL remain in the unlocking state while the dialog is open.

#### Scenario: User unlocks
- **WHEN** the user enters the correct passphrase or completes passkey unlock
- **THEN** the identity becomes available and the file key is unwrapped

#### Scenario: User cancels unlock
- **WHEN** the user dismisses the unlock dialog
- **THEN** the flow stays in the unlocking state while keys are still loading, or moves to the error state once keys are known to be unusable

### Requirement: Sender keys resolved including subfolders
The editor SHALL resolve the public keys of the room members who may have wrapped the file key, locating the owning room even when the file sits in a subfolder of the private room.

#### Scenario: File in a subfolder
- **WHEN** an encrypted file is opened from a subfolder of a private room
- **THEN** the room's member keys are loaded from the room that contains the subfolder
- **AND** the wrap created by the uploader is verified against those keys

### Requirement: DEK unwrapped in the browser
The editor SHALL unwrap the file's data encryption key in the browser using the unlocked identity, applying the same trust-on-first-use checks as the file download path.

#### Scenario: Successful unwrap
- **WHEN** the caller's wrap entry and the sender's pinned key are valid
- **THEN** the DEK is available in memory for the editor configuration

#### Scenario: Sender key mismatch
- **WHEN** the sender's public key differs from the pinned key and the user refuses the change
- **THEN** the unwrap fails and the editor is not mounted

### Requirement: Display name recovered from the file header
The editor SHALL recover the real file name by reading only the first 4 KiB of the ciphertext through an HTTP Range request and decrypting the name field of the file header with the DEK, and SHALL use that name as the document title.

#### Scenario: Name recovered
- **WHEN** the DEK is available and the range request succeeds
- **THEN** the document title shown in the editor is the decrypted name instead of the opaque server placeholder

#### Scenario: Range request fails
- **WHEN** the header cannot be fetched or decrypted
- **THEN** the editor keeps the opaque placeholder title and still proceeds to open the file

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

### Requirement: Editor not mounted until keys are ready
For an encrypted file, the editor SHALL NOT mount the document editor component until the key flow reports the ready state, and SHALL show Common:SomethingWentWrong when the flow ends in error.

#### Scenario: Keys loading
- **WHEN** the key flow is loading or unlocking
- **THEN** a loading state is shown and the editor component is absent

#### Scenario: Key flow error
- **WHEN** the key flow ends in the error state
- **THEN** the page shows the text of Common:SomethingWentWrong and no editor component

### Requirement: AI editor tools disabled for encrypted files
The editor SHALL NOT register the AI editor-tool bridge for an encrypted file, even when the user is authenticated and AI is otherwise available.

#### Scenario: Encrypted file opened
- **WHEN** an encrypted file is opened by an authenticated user
- **THEN** the AI tool connector is not initialised for that session

### Requirement: Server attaches the caller's key pairs to the editor configuration
The server SHALL include the calling user's encryption key pairs in the editor configuration for a file located in a private room.

#### Scenario: File in a private room
- **WHEN** an editor configuration is requested for a file whose room is private
- **THEN** the response carries the caller's key pairs with their crypto engine id

### Requirement: Document Server save keeps the encrypted flag
The server SHALL accept the encrypted flag from the Document Server callback and SHALL store the returned content as an encrypted version of the file. A save of a file whose current version is encrypted that arrives without the encrypted flag SHALL be refused, and the previous version SHALL stay current.

#### Scenario: Callback with encrypted content
- **WHEN** the Document Server reports a save with the encrypted flag set
- **THEN** the new version is stored with the encrypted flag and is served as ciphertext afterwards

#### Scenario: Callback without the flag
- **WHEN** the Document Server reports a save of an encrypted file without the encrypted flag
- **THEN** the save is refused, no version MUST be stored as not encrypted, and the previous encrypted version stays current

### Requirement: File handler serves ciphertext for encrypted files
The server SHALL serve the stored bytes of an encrypted file unchanged when the editor or client downloads it, and SHALL skip the anonymous Document Server signature check that applies to non-encrypted files.

#### Scenario: Encrypted file requested
- **WHEN** the file handler is asked for an encrypted file
- **THEN** the stored ciphertext is returned as is

### Requirement: Conversion refused for private rooms
The server SHALL refuse conversion results and document-builder results that would read from or write into a private room.

#### Scenario: Conversion into a private room
- **WHEN** a conversion target folder belongs to a private room
- **THEN** the conversion is refused

#### Scenario: Conversion of a private-room file
- **WHEN** a file located in a private room is submitted for conversion
- **THEN** the conversion is refused

### Requirement: PDF forms classified from the encrypted header
The server SHALL classify an encrypted PDF as a form by reading the form flag from the unencrypted file header instead of scanning the document content.

#### Scenario: Flag set
- **WHEN** the header flags byte has the form bit set
- **THEN** the file is treated as a PDF form

#### Scenario: Flag clear
- **WHEN** the header flags byte has the form bit clear
- **THEN** the file is treated as a plain PDF

### Requirement: Legacy desktop path uses editor-provided keys
When the editor runs inside the desktop application, the editor SHALL pass the key pairs from the server configuration to the desktop encryption bridge and SHALL request file access through the desktop-specific access call, which has no server route and is answered with 404.

#### Scenario: Desktop session
- **WHEN** the editor is initialised in the desktop application with key pairs in the configuration
- **THEN** the key pairs are handed to the desktop bridge and the desktop access call is sent, which the server answers with 404, so no file keys are obtained through it

### Requirement: SDK opens encrypted files only with the Document Server capability
The SDK file list SHALL refuse to open an encrypted file in the editor while the Document Server capability is absent and SHALL show Common:PrivateRoomEditorNotSupported; when the capability is present it SHALL open the file through the same key flow as the client.

#### Scenario: Open from the SDK
- **WHEN** a user opens an encrypted file from a private room in the SDK and the capability is absent
- **THEN** an info toast with Common:PrivateRoomEditorNotSupported is shown and no editor is opened

#### Scenario: Open from the SDK with capability
- **WHEN** a user opens an encrypted file from a private room in the SDK and the capability is present
- **THEN** the editor opens and the key flow runs as in the client

### Requirement: Document Server capability check before opening
The client SHALL learn from the server whether the connected Document Server declares encrypted-editing support, and SHALL NOT mount the editor for an encrypted file when the capability is absent. The user SHALL see Common:PrivateRoomEditorNotSupported instead of the editor.

#### Scenario: Capability absent
- **WHEN** an encrypted file is opened and the Document Server does not declare encrypted-editing support
- **THEN** the key flow is not started, no DEK is unwrapped, and Common:PrivateRoomEditorNotSupported is shown

#### Scenario: Capability present
- **WHEN** the Document Server declares the capability
- **THEN** the key flow runs as specified and the editor is mounted when keys are ready

#### Scenario: Editor refused by the server
- **WHEN** the server refuses the editor configuration of an encrypted file of a private room because the Document Server cannot work with encrypted files
- **THEN** Common:PrivateRoomEditorNotSupported is shown, not the server's message or a format error

### Requirement: Encrypted files can be co-edited
The system SHALL let several members edit an encrypted file at the same time. Each co-editor's editor SHALL obtain the DEK from that member's own access entry, and the Document Server SHALL relay and store only changes encrypted with the DEK.

#### Scenario: Second editor
- **WHEN** a member with an access entry opens an encrypted file that another member is editing
- **THEN** both edit the file and each sees the other's changes

#### Scenario: Changes encrypted at the Document Server
- **WHEN** co-editing changes of an encrypted file reach the Document Server
- **THEN** every stored change is ciphertext and the typed text MUST NOT be readable there

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

### Requirement: Version history withheld in the editor for encrypted files
The editor SHALL NOT attach version-history events for an encrypted file, matching the client, where version operations are withheld for encrypted files.

#### Scenario: History rights on an encrypted file
- **WHEN** the user has history rights and opens an encrypted file
- **THEN** no history events are attached and the history panel is unavailable

### Requirement: Encrypted forms are not submitted to form-data collection
The system SHALL NOT accept a form submission of an encrypted file into form-data collection, where it would be stored without encryption and its field values reported in plaintext. The editor configuration of an encrypted file SHALL NOT offer the submit action, and the server SHALL refuse a submit of a file in a private room before storing anything.

#### Scenario: Submission refused
- **WHEN** the editor sends a submit of an encrypted PDF form that lies in a private room
- **THEN** the server refuses it, no result file is stored, and no field value MUST be indexed, exported or sent to an external database

#### Scenario: Submit action absent
- **WHEN** an encrypted PDF form is opened in the editor
- **THEN** the editor configuration offers no submit action

### Requirement: Share to fill out hidden in a private room
The editor SHALL NOT offer "Share to fill out" for a PDF form in a private room, since its destinations, a form-filling room and a virtual data room, take the form out of the private room.

#### Scenario: Form opened in a private room
- **WHEN** an encrypted PDF form is opened for editing in a private room
- **THEN** the "Share to fill out" action is absent from the editor
