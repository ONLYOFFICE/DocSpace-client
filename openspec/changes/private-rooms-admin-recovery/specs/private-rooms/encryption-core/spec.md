# Spec Delta

## ADDED Requirements

### Requirement: Identity key wrapped for a recovery administrator
The system SHALL, while organisational recovery is on, wrap the user's identity private key for the public key of each recovery administrator with authenticated HPKE, under a context of its own, and send only those wraps to the server. The raw private key SHALL NOT leave the browser.

#### Scenario: Wrap made
- **WHEN** an enrolled user's key is unlocked and a recovery administrator has no wrap of it
- **THEN** a wrap for that administrator's public key is made in the browser and stored on the server

#### Scenario: Wrap opened by the administrator
- **WHEN** the recovery administrator it was made for opens the wrap with their own unlocked key
- **THEN** the user's private key is produced and matches the user's public key

#### Scenario: Wrap opened by somebody else
- **WHEN** a key other than that administrator's is used to open the wrap
- **THEN** opening fails and no private key is produced

#### Scenario: File-key wrap offered as an identity wrap
- **WHEN** a wrap of a file key is offered where a wrap of an identity key is expected, or the reverse
- **THEN** opening fails

### Requirement: A recovery administrator can read a recovered user's files
The system SHALL NOT claim that the files of an enrolled user are closed to the recovery administrators of the portal: an administrator who opens the user's wrap holds the user's private key and with it every file key wrapped for the user. One administrator SHALL be enough to open a wrap; no quorum is required in this version.

#### Scenario: Enrolled user reads the notice
- **WHEN** a user is enrolled in organisational recovery
- **THEN** the interface names the recovery administrators and says that they can restore the key and open the user's private rooms

#### Scenario: Single administrator
- **WHEN** one recovery administrator recovers a user's key
- **THEN** no second administrator is asked
