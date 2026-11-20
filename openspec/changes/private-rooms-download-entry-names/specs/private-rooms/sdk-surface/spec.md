## ADDED Requirements

### Requirement: SDK saved names follow the client rules
The SDK SHALL name a decrypted file it saves, and each entry of a decrypted archive it saves, by the rules of the client: "Saved names are plain file names" and "Archive directories come from the folder tree" of private-rooms/file-operations, so the same file is saved under the same name from either.

#### Scenario: Name with separators in an SDK archive
- **WHEN** two encrypted files are downloaded together in the SDK and one decrypts to a name holding "/"
- **THEN** that file is one entry at the root of the archive, with the separator saved as "_"

#### Scenario: Names that differ only in case in an SDK archive
- **WHEN** two encrypted files that decrypt to "Budget.xlsx" and "budget.xlsx" are downloaded together in the SDK
- **THEN** the archive holds "Budget.xlsx" and "budget (1).xlsx"

#### Scenario: Single file saved from the SDK
- **WHEN** one encrypted file whose decrypted name holds a control character is downloaded in the SDK
- **THEN** the browser is asked to save it under the name without that character

## MODIFIED Requirements

### Requirement: Encrypted file actions shared with the generic views
The SDK SHALL provide encrypted download, zip download, copy, move and duplicate through a shared encrypted-actions context so the generic file views use the same handlers as the private pages. A selection of one encrypted file SHALL be saved as that file, as from its own menu; only two or more encrypted files are saved as a zip.

#### Scenario: Download from a private room
- **WHEN** the user downloads one or more encrypted files
- **THEN** each file is decrypted in the browser before it is saved, with a zip for several files

#### Scenario: One encrypted file selected
- **WHEN** exactly one encrypted file is selected and downloaded from the header menu
- **THEN** the decrypted file itself is saved under its decrypted name, and no archive is built
