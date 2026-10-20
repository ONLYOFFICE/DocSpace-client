# Spec Delta

## MODIFIED Requirements

### Requirement: Legacy desktop path uses editor-provided keys
When the editor runs inside the desktop application, the editor SHALL pass the key pairs from the server configuration to the desktop encryption bridge and SHALL resolve file keys through the room access route of the room that contains the file, not through a per-file privacy access route.

#### Scenario: Desktop session
- **WHEN** the editor is initialised in the desktop application with key pairs in the configuration
- **THEN** the key pairs are handed to the desktop bridge and the room access route is used for file keys

#### Scenario: File in a subfolder on desktop
- **WHEN** the desktop editor opens an encrypted file that sits in a subfolder of a private room
- **THEN** the room is located from the file's parent chain and its access route answers with the member keys
