# Spec Delta

## ADDED Requirements

### Requirement: SDK private-room dialog waits for the key
The SDK SHALL NOT show the private-room creation dialog behind the key-generation prompt, the passphrase dialog or the recovery-phrase dialog. For a user whose key list is known to be empty the creation dialog SHALL appear once a key is registered, and cancelling the prompts SHALL leave no dialog open. A key list that is not known yet SHALL keep the dialog shown, as "Private room creation waits for a known key list" describes.

#### Scenario: Key-less user starts a private room
- **WHEN** a user whose key list is known to be empty starts creating a private room in the SDK
- **THEN** the key-generation prompt is shown on its own, and the creation dialog appears after the key is registered

#### Scenario: Prompt cancelled
- **WHEN** that user cancels the key-generation prompt or one of its dialogs
- **THEN** no creation dialog is shown and no room is created

#### Scenario: Key holder
- **WHEN** a user who holds a key starts creating a private room in the SDK
- **THEN** the creation dialog opens at once and no key prompt is shown

#### Scenario: Editing a room
- **WHEN** a user opens the edit dialog of a private room in the SDK
- **THEN** the dialog opens at once, whatever the state of the key list
