# Spec Delta

## ADDED Requirements

### Requirement: SDK copy picker lists private rooms under a Private entry
The SDK SHALL list private rooms under a Private entry at the root of the copy destination picker of its private pages, since the Rooms list of the picker holds no private room. The entry SHALL NOT be offered for a move or a restore, nor on the generic pages.

#### Scenario: Copy into another private room
- **WHEN** a user copies an encrypted file on a private page and picks another private room under the Private entry
- **THEN** the copy is stored in that room encrypted for it, and the source file stays

#### Scenario: Copy into a folder of another private room
- **WHEN** the user picks a folder of another private room under the Private entry
- **THEN** the copy is stored in that folder, encrypted for the room that holds it

#### Scenario: Move on a private page
- **WHEN** a user opens the move picker on a private page
- **THEN** it offers no Private entry
