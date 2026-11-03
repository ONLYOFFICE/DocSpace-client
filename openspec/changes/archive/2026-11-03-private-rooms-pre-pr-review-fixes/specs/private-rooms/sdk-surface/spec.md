# Spec Delta

## ADDED Requirements

### Requirement: Private pages keep the host opt-in
The SDK SHALL keep the private-rooms opt-in in the address of the private pages through every change of the list's sorting, search, filters and page, and SHALL build every private navigation from the opt-in the page was opened with, not from the address it has at that moment.

#### Scenario: Room opened after sorting
- **WHEN** the user sorts or searches the private rooms list and then opens a room
- **THEN** the room page renders its content and its address carries the opt-in

#### Scenario: Frame reloaded after a filter change
- **WHEN** the user clears a filter of the private rooms list or its archive and the frame is then reloaded
- **THEN** the same private page renders, not the not-available view

## MODIFIED Requirements

### Requirement: Private room creation gate
The SDK SHALL refuse to start private room creation when the browser does not expose WebCrypto, with Common:EncryptionRequiresHttps. It SHALL re-fetch the keys before creating, refuse with Common:EncryptionKeysRequiredForPrivateRoom when none exist, and close the creation when the user cancels or key generation fails. A key list that failed to load SHALL NOT count as an empty one.

#### Scenario: Plain HTTP origin
- **WHEN** a user starts creating a private room on an origin without WebCrypto
- **THEN** Common:EncryptionRequiresHttps is shown and no dialog opens

#### Scenario: Key generation cancelled
- **WHEN** a user without keys starts creating a private room and cancels key generation
- **THEN** no creation dialog is left open

#### Scenario: Key list failed to load
- **WHEN** the SDK's request for the user's key list fails, on page load or on a reload when the tab regains focus
- **THEN** the keys known before the failure are kept, no key-generation prompt is offered on account of the failure, and an unlocked identity is not locked by it
