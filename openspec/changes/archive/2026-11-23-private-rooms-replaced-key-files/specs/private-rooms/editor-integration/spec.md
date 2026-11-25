# Spec Delta

## MODIFIED Requirements

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

#### Scenario: Wrapped for a key the user no longer holds
- **WHEN** the user's access entry of the file names a key that is not in the user's key list
- **THEN** the key flow ends before the unlock dialog is raised, and the page shows Common:EncryptedFileKeyReplaced, no button and no editor component

#### Scenario: No key
- **WHEN** the key flow ends in the no-key state
- **THEN** the page shows Common:EncryptionKeysNotConfigured, no button and no editor component

#### Scenario: Request failed
- **WHEN** the key flow ends in the load-failed state
- **THEN** the page shows Common:EncryptionKeysLoadFailed with the button Common:TryAgain and no editor component

#### Scenario: Retry after a failed request
- **WHEN** the user presses Common:TryAgain and the repeated request succeeds
- **THEN** the key flow goes on from that step and the editor is mounted once it is ready, without a page reload
