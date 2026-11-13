# Spec Delta

## MODIFIED Requirements

### Requirement: Version operations withheld
The system SHALL NOT offer version history, finalize version, version list, version blocking or editing of the version comment for an encrypted file. The version badge of an encrypted file MAY show the version count, but SHALL NOT open the version history or carry the Common:ShowVersionHistory tooltip, whatever history rights the server reports for the file.

#### Scenario: Context menu of an encrypted file
- **WHEN** the context menu of an encrypted file is opened
- **THEN** show-version-history, finalize-version, version and block-unblock-version are absent

#### Scenario: Version badge of an encrypted file
- **WHEN** the user clicks the version badge of an encrypted file that has several versions, in a list, table or tile view, and the server reports the ReadHistory right on it
- **THEN** the version history panel MUST NOT open, no version list is requested, and the badge has no Common:ShowVersionHistory tooltip

#### Scenario: Version badge of a file that is not encrypted
- **WHEN** the user clicks the version badge of a file that is not encrypted and has several versions, and the server reports the ReadHistory right on it
- **THEN** the version history panel opens, and the badge carries the Common:ShowVersionHistory tooltip

#### Scenario: Version comment of an encrypted file in the info panel
- **WHEN** the Details view of the info panel shows an encrypted file and the server reports the EditHistory right on it
- **THEN** the comment has no Common:EditButton or Common:AddButton control, no version list is requested, and a comment MUST NOT be sent to the server

#### Scenario: Version comment of a file that is not encrypted in the info panel
- **WHEN** the Details view of the info panel shows a file that is not encrypted and the server reports the EditHistory right on it
- **THEN** the comment carries the Common:EditButton or Common:AddButton control

### Requirement: Download decrypts on the client
The system SHALL download an encrypted file by fetching the ciphertext, decrypting it in the browser with the unlocked identity and saving it under its original name, reporting progress and surfacing a localized error on failure.

#### Scenario: Single file download
- **WHEN** the user downloads one encrypted file and the identity is unlocked
- **THEN** the browser saves the plaintext file with its original name

#### Scenario: Unlock declined
- **WHEN** the user dismisses the passphrase prompt during download
- **THEN** nothing is downloaded

#### Scenario: No own access entry
- **WHEN** the user downloads one encrypted file for which they hold no access entry
- **THEN** nothing is downloaded and Common:EncryptionDownloadFailed is shown

#### Scenario: Download from the media viewer
- **WHEN** the user downloads an encrypted file from the media viewer with its download button or Ctrl+S, and the identity is unlocked
- **THEN** the browser saves the plaintext file under its original name, and the ciphertext MUST NOT be handed to the browser as the download

#### Scenario: Download from the media viewer of a file that cannot be found
- **WHEN** the user downloads an encrypted file from the media viewer, and the file is neither in the current folder list nor the file the viewer was opened for
- **THEN** Common:EncryptionDownloadFailed is shown, nothing is downloaded, and the ciphertext MUST NOT be handed to the browser as the download
