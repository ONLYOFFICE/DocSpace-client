# Spec Delta

## ADDED Requirements

### Requirement: Organisational recovery is a portal policy
The server SHALL keep, per portal, whether organisational recovery is on and which users are its recovery administrators. Only the portal owner SHALL change either. A recovery administrator SHALL be a portal administrator who holds an encryption key. The policy and the administrators, with their public keys, SHALL be readable by every signed-in user of the portal.

#### Scenario: Owner turns recovery on
- **WHEN** the portal owner turns organisational recovery on and names an administrator who holds a key
- **THEN** every user reads the policy as on with that administrator and the administrator's public key

#### Scenario: Somebody else changes the policy
- **WHEN** a user who is not the portal owner changes the policy or the administrators
- **THEN** the server refuses and changes nothing

#### Scenario: Administrator without a key named
- **WHEN** the owner names a user who holds no encryption key, is not a portal administrator or is a guest
- **THEN** the server refuses

#### Scenario: Recovery turned off
- **WHEN** the owner turns organisational recovery off
- **THEN** the server deletes every stored wrap of the portal

### Requirement: Recovery wraps are stored per user and administrator
The server SHALL store, for a user and a recovery administrator, the wrap of the user's private key the user sends, and SHALL NOT accept a raw private key. A user SHALL write only wraps of their own key, and only for a current recovery administrator. A guest SHALL be refused.

#### Scenario: User stores wraps
- **WHEN** a key holder sends the wraps of their key for the current recovery administrators while recovery is on
- **THEN** the server stores them and reports the user as enrolled

#### Scenario: Wrap for somebody who is not a recovery administrator
- **WHEN** a wrap names a user who is not a current recovery administrator
- **THEN** the server refuses it and stores nothing

#### Scenario: Recovery off
- **WHEN** a wrap is sent while organisational recovery is off
- **THEN** the server refuses it

### Requirement: Stale recovery wraps are deleted
The server SHALL delete the wraps made for a recovery administrator who is removed from the administrators, loses the portal administrator role, is deactivated, is deleted or resets the encryption key, and the wraps of a user who is deleted, is turned into a guest or resets the encryption key.

#### Scenario: Administrator removed
- **WHEN** the owner removes a recovery administrator
- **THEN** no wrap made for that administrator can be read any more

#### Scenario: User resets the key
- **WHEN** an enrolled user resets the encryption key
- **THEN** the wraps of the old key are deleted and the user is reported as not enrolled

### Requirement: A recovery administrator reads only the wrap made for them
The server SHALL give the wrap of a user's key only to the recovery administrator it was made for, and SHALL record each read in the audit trail with the administrator, the user and the time.

#### Scenario: Wrap read
- **WHEN** a recovery administrator reads the wrap made for them of an enrolled user's key
- **THEN** the server answers with it and writes the audit event

#### Scenario: Somebody else reads
- **WHEN** another user, a portal administrator or the portal owner who is not that recovery administrator requests the wrap
- **THEN** the server refuses and MUST NOT answer with the wrap

### Requirement: Recovered key is written for the user by a recovery administrator
The server SHALL accept from a recovery administrator a new key envelope for an enrolled user only when its public key equals the user's current public key, SHALL mark the key as recovered with the administrator and the time until the user replaces the envelope, SHALL notify the user and SHALL write an audit event. The wrapped file keys of the user SHALL stay as they are.

#### Scenario: Recovered envelope stored
- **WHEN** a recovery administrator sends an envelope with the user's current public key for an enrolled user
- **THEN** the envelope replaces the user's, the key is marked as recovered, the user gets a letter and the audit trail holds the event

#### Scenario: Different public key
- **WHEN** the envelope carries a public key other than the user's current one
- **THEN** the server refuses it and MUST NOT change the user's key

#### Scenario: Not a recovery administrator
- **WHEN** a user who is not a recovery administrator sends an envelope for another user
- **THEN** the server refuses it

#### Scenario: User sets a new passphrase
- **WHEN** the user replaces the recovered envelope with one of their own
- **THEN** the recovered mark is cleared
