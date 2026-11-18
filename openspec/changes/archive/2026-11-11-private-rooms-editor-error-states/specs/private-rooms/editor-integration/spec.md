# Spec Delta

## MODIFIED Requirements

### Requirement: Editor loads the caller's key envelopes before opening an encrypted file
The editor application SHALL load the current user's encryption key envelopes from the server when it starts, and SHALL wrap the editor page in the encryption provider so that unlock dialogs are available to the key-resolution flow. A failed load SHALL NOT be taken for an empty list: for an encrypted file the flow SHALL end in the load-failed state, from which the load can be repeated.

#### Scenario: Envelopes loaded on start
- **WHEN** the editor page opens for any file
- **THEN** the user's key envelopes are requested from the server and kept in the encryption provider
- **AND** the passphrase modal and key-change dialog are mounted for later use

#### Scenario: Envelopes could not be loaded
- **WHEN** the request for the user's key envelopes fails and the file is encrypted
- **THEN** the key-resolution flow ends in the load-failed state, not in the state of a user without a key

#### Scenario: User without a key
- **WHEN** the envelopes are loaded, hold no key, and the file is encrypted
- **THEN** the key-resolution flow ends in the no-key state and the editor is not mounted

### Requirement: Editor fetches the file's access entries
For a file marked encrypted, the editor SHALL fetch the file's encryption access entries and SHALL require that an entry for the calling user exists before continuing. A failed fetch SHALL end the flow in the load-failed state, apart from the no-access state of a missing entry.

#### Scenario: Caller has an entry
- **WHEN** the access entries contain a wrap for the current user
- **THEN** the key-resolution flow continues to unlock the identity

#### Scenario: Caller has no entry
- **WHEN** the access entries contain no wrap for the current user
- **THEN** the key-resolution flow ends in the no-access state and the editor is not mounted

#### Scenario: Access entries could not be fetched
- **WHEN** the request for the access entries fails
- **THEN** the key-resolution flow ends in the load-failed state and the editor is not mounted

### Requirement: Identity unlock precedes key unwrap
The editor SHALL unlock the user's identity through the shared passphrase or passkey dialog before unwrapping the file key, and SHALL remain in the unlocking state while the dialog is open. A dismissed dialog SHALL end the flow in the unlock-cancelled state, from which the unlock can be requested again without a page reload.

#### Scenario: User unlocks
- **WHEN** the user enters the correct passphrase or completes passkey unlock
- **THEN** the identity becomes available and the file key is unwrapped

#### Scenario: User cancels unlock
- **WHEN** the user dismisses the unlock dialog
- **THEN** the flow stays in the unlocking state while keys are still loading, or moves to the unlock-cancelled state once the user's key is known

#### Scenario: Unlock requested again
- **WHEN** the user presses Common:UnlockKey in the unlock-cancelled state and unlocks
- **THEN** the file key is unwrapped and the editor is mounted, without a page reload

### Requirement: Editor not mounted until keys are ready
For an encrypted file, the editor SHALL NOT mount the document editor component until the key flow reports the ready state. It SHALL show a message of its own for each state the flow ends in, with an action where the step can be repeated: Common:UnlockKey after a dismissed unlock and Common:TryAgain after a failed request.

#### Scenario: Keys loading
- **WHEN** the key flow is loading or unlocking
- **THEN** a loading state is shown and the editor component is absent

#### Scenario: Key flow error
- **WHEN** the key flow ends in the error state
- **THEN** the page shows the text of Common:SomethingWentWrong and no editor component

#### Scenario: Unlock dismissed
- **WHEN** the key flow ends in the unlock-cancelled state
- **THEN** the page shows Common:EncryptedFileUnlockToOpen with the button Common:UnlockKey and no editor component

#### Scenario: No access entry
- **WHEN** the key flow ends in the no-access state
- **THEN** the page shows Common:EncryptedFileNoAccessYet, no button and no editor component

#### Scenario: No key
- **WHEN** the key flow ends in the no-key state
- **THEN** the page shows Common:EncryptionKeysNotConfigured, no button and no editor component

#### Scenario: Request failed
- **WHEN** the key flow ends in the load-failed state
- **THEN** the page shows Common:EncryptionKeysLoadFailed with the button Common:TryAgain and no editor component

#### Scenario: Retry after a failed request
- **WHEN** the user presses Common:TryAgain and the repeated request succeeds
- **THEN** the key flow goes on from that step and the editor is mounted once it is ready, without a page reload
