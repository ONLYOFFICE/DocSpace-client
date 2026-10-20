# Spec Delta

## MODIFIED Requirements

### Requirement: Desktop path uses editor-provided keys
When the editor runs inside the desktop application, the editor SHALL pass the user's key pair from the server configuration, with the crypto engine id stored with it, to the desktop encryption bridge, and SHALL answer the desktop's sharing-keys request through a key route the server exposes, never through the removed per-file privacy access route.

#### Scenario: Desktop session
- **WHEN** the editor is initialised in the desktop application with key pairs in the configuration
- **THEN** the user's key pair and its crypto engine id are handed to the desktop bridge, and the desktop's sharing-keys request is answered from a key route the server exposes

#### Scenario: File in a subfolder on desktop
- **WHEN** the desktop editor asks for the sharing keys of an encrypted file that sits in a subfolder of a private room
- **THEN** the answer lists the public keys of the users who can open the file

## RENAMED Requirements

- FROM: `### Requirement: Legacy desktop path uses editor-provided keys`
- TO: `### Requirement: Desktop path uses editor-provided keys`
