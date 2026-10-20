# Spec Delta

## MODIFIED Requirements

### Requirement: Legacy desktop path uses editor-provided keys
When the editor runs inside the desktop application, the editor SHALL pass the key pairs from the server configuration to the desktop encryption bridge and SHALL resolve the member keys of a file through a key route the server exposes, never through the removed legacy privacy access route for a single file.

#### Scenario: Desktop session
- **WHEN** the editor is initialised in the desktop application with key pairs in the configuration
- **THEN** the key pairs are handed to the desktop bridge and the member keys for the file come from a key route the server exposes

#### Scenario: File in a subfolder on desktop
- **WHEN** the desktop editor opens an encrypted file that sits in a subfolder of a private room
- **THEN** the key request answers with the keys of the members who can open the file
