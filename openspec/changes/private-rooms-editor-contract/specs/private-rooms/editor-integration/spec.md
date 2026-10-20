# Spec Delta

## ADDED Requirements

### Requirement: Versioned Document Server encryption contract
The client SHALL rely on a written, versioned contract with the Document Server for encrypted files. The contract SHALL state how the encryption keys entry of the editor configuration is read in a web session, how the DSE3 container is decrypted for editing and re-encrypted on save, what the save callback returns, how the signed token treats the entry, and the first Document Server version that implements it.

#### Scenario: Contract referenced by version
- **WHEN** the client builds the editor configuration for an encrypted file
- **THEN** the configuration carries the contract version the client implements

#### Scenario: Save round-trip
- **WHEN** the Document Server saves an encrypted document
- **THEN** the callback delivers a DSE3 container encrypted with the same DEK and the server stores it as a new encrypted version

### Requirement: Document Server capability check before opening
The client SHALL learn from the server whether the connected Document Server declares encrypted-editing support, and SHALL NOT mount the editor for an encrypted file when the capability is absent. The user SHALL see Common:PrivateRoomEditorNotSupported instead of the editor.

#### Scenario: Capability absent
- **WHEN** an encrypted file is opened and the Document Server does not declare encrypted-editing support
- **THEN** the key flow is not started, no DEK is unwrapped, and Common:PrivateRoomEditorNotSupported is shown

#### Scenario: Capability present
- **WHEN** the Document Server declares the capability
- **THEN** the key flow runs as specified and the editor is mounted when keys are ready

### Requirement: Co-editing disabled for encrypted files
The server SHALL emit a co-editing configuration for an encrypted file that forbids concurrent editing sessions, and the Document Server SHALL open the file in single-user mode. A second user opening the same encrypted file for editing SHALL get view-only access while the first session is open.

#### Scenario: Second editor
- **WHEN** an encrypted file is already open for editing by one user and another member opens it
- **THEN** the second user receives the file in view mode with a notice that it is being edited

#### Scenario: Configuration content
- **WHEN** the editor configuration of an encrypted file is requested
- **THEN** the co-editing section forbids fast and strict co-editing

### Requirement: Save-as withheld for encrypted files
The editor SHALL NOT offer save-as for an encrypted file in v1, because the Document Server output address would deliver plaintext into a destination folder.

#### Scenario: Save-as hidden
- **WHEN** an encrypted file is open in the editor
- **THEN** the save-as action is absent from the editor menu

### Requirement: Download-as withheld for encrypted files
The editor SHALL NOT offer download-as for an encrypted file in v1; users download the original through the client, which decrypts it locally.

#### Scenario: Download-as hidden
- **WHEN** an encrypted file is open in the editor
- **THEN** the download-as action is absent and the client download path remains available

### Requirement: Print allowed for encrypted files
The editor SHALL allow printing an encrypted document from the editor; printing happens from the decrypted document already loaded in the editor session.

#### Scenario: Print
- **WHEN** the user prints an encrypted document from the editor
- **THEN** the print dialog opens with the decrypted content

### Requirement: Version history withheld in the editor for encrypted files
The editor SHALL NOT attach version-history events for an encrypted file, matching the client, where version operations are withheld for encrypted files.

#### Scenario: History rights on an encrypted file
- **WHEN** the user has history rights and opens an encrypted file
- **THEN** no history events are attached and the history panel is unavailable

### Requirement: Form submission withheld for encrypted files
The editor SHALL open an encrypted PDF form for editing of the form itself but SHALL NOT offer filling or submitting it in v1.

#### Scenario: Encrypted form opened
- **WHEN** an encrypted PDF form is opened in the editor
- **THEN** the fill and submit actions are absent

## MODIFIED Requirements

### Requirement: DEK handed to the editor configuration
The editor SHALL pass the base64-encoded DEK, a crypto engine identifier and the contract version to the editor configuration under the encryption keys entry, keeping the document address pointing at the ciphertext stored on the server. The entry SHALL be typed in the editor configuration types and SHALL be included in, or explicitly excluded from, the signed token as the contract states.

#### Scenario: Configuration extended
- **WHEN** keys reach the ready state
- **THEN** the editor configuration contains the DEK, crypto engine id and contract version
- **AND** the document URL is unchanged and still references the encrypted blob

#### Scenario: Engine id taken from the server
- **WHEN** the server configuration lists key pairs with a crypto engine id
- **THEN** that engine id is used; otherwise the client default is used

#### Scenario: Token handling
- **WHEN** the editor configuration is signed by the server
- **THEN** the encryption keys entry is treated exactly as the contract version specifies, and the Document Server does not drop it

### Requirement: Co-authoring flag cleared for encrypted files
The editor SHALL set the co-authoring flag of the editor configuration to false for an encrypted file, and SHALL rely on the server-emitted co-editing configuration for the actual restriction.

#### Scenario: Encrypted configuration received
- **WHEN** the editor configuration for an encrypted file is received from the server
- **THEN** the co-authoring flag is false in the configuration passed to the editor
- **AND** the co-editing section from the server forbids concurrent sessions

### Requirement: SDK does not open encrypted files in the editor
The SDK file list SHALL refuse to open an encrypted file in the editor while the Document Server capability is absent and SHALL show Common:PrivateRoomEditorNotSupported; when the capability is present it SHALL open the file through the same key flow as the client.

#### Scenario: Open from the SDK
- **WHEN** a user opens an encrypted file from a private room in the SDK and the capability is absent
- **THEN** an info toast with Common:PrivateRoomEditorNotSupported is shown and no editor is opened

#### Scenario: Open from the SDK with capability
- **WHEN** a user opens an encrypted file from a private room in the SDK and the capability is present
- **THEN** the editor opens and the key flow runs as in the client

## REMOVED Requirements

### Requirement: Editor actions without encrypted-specific handling
**Reason**: Replaced by explicit per-action policies (save-as, download-as, print, version history, form submission).
**Migration**: Implement the policies above; the generic flows stay for non-encrypted files.

### Requirement: No Document Server version is declared
**Reason**: Replaced by the versioned contract and the capability check.
**Migration**: The client declares the contract version it implements and refuses to open encrypted files when the Document Server lacks the capability.
