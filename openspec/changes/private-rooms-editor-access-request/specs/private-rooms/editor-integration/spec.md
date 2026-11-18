# Spec Delta

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
