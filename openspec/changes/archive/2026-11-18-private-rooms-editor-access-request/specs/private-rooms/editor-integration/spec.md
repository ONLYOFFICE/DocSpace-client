# Spec Delta

## ADDED Requirements

### Requirement: Editor error of an encrypted file offers a reload
When the editor reports an error for an encrypted file, the page SHALL show Common:SomethingWentWrong with the error description in place of the editor and SHALL offer Common:TryAgain, which loads the page again with a new configuration and a new key flow. The page SHALL NOT repeat the opening by itself.

#### Scenario: Editor error with the button
- **WHEN** the editor reports an error for an encrypted file
- **THEN** the page shows Common:SomethingWentWrong, the error description and the button Common:TryAgain, and no editor component

#### Scenario: Try again after an editor error
- **WHEN** the user presses Common:TryAgain on that page
- **THEN** the page is loaded again

#### Scenario: No repeat without the user
- **WHEN** the editor reports an error for an encrypted file and the user does nothing
- **THEN** the page stays on the error and is not loaded again

#### Scenario: Editor error on a plain file
- **WHEN** the editor reports an error for a file that is not encrypted
- **THEN** the editor stays mounted and no button is added

## MODIFIED Requirements

### Requirement: Editor fetches the file's access entries
For a file marked encrypted, the editor SHALL fetch the file's encryption access entries and SHALL require that an entry for the calling user exists before continuing. One attempt SHALL send that request once, however often the key flow restarts. A request that got no answer from the server SHALL be repeated once; a failed fetch SHALL then end the flow in the load-failed state, apart from the no-access state of a missing entry.

#### Scenario: Caller has an entry
- **WHEN** the access entries contain a wrap for the current user
- **THEN** the key-resolution flow continues to unlock the identity

#### Scenario: Caller has no entry
- **WHEN** the access entries contain no wrap for the current user
- **THEN** the key-resolution flow ends in the no-access state and the editor is not mounted

#### Scenario: Access entries could not be fetched
- **WHEN** the server answers the request for the access entries with an error
- **THEN** the key-resolution flow ends in the load-failed state and the editor is not mounted
- **AND** the request is not repeated until the user presses Common:TryAgain

#### Scenario: Key flow restarts within one attempt
- **WHEN** the user's key list arrives or the key state changes while the file is being opened
- **THEN** the key-resolution flow goes on with the access entries already requested
- **AND** no second request for them is sent

#### Scenario: Request without an answer
- **WHEN** the request for the access entries gets no answer from the server and the repeated request succeeds
- **THEN** the key-resolution flow continues without the load-failed state being shown

#### Scenario: Repeated request without an answer
- **WHEN** the request for the access entries and its one repeat both get no answer
- **THEN** the key-resolution flow ends in the load-failed state and the editor is not mounted
