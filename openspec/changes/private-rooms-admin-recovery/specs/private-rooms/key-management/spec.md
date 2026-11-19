# Spec Delta

## ADDED Requirements

### Requirement: Enrolment in organisational recovery
The system SHALL enrol every key holder of a portal whose organisational recovery is on: at key creation, and at the next unlock for a key made earlier or for a recovery administrator named since. The user SHALL be told before the key is created that the named recovery administrators can restore it. A guest, who holds no key, is not enrolled.

#### Scenario: Key created with recovery on
- **WHEN** a user creates a key on a portal with organisational recovery on
- **THEN** the dialog names the recovery administrators before the key is created, and the key is enrolled once it exists

#### Scenario: Existing key unlocked
- **WHEN** a user whose key is not enrolled unlocks it on a portal with organisational recovery on
- **THEN** the key is enrolled without another passphrase prompt, and the user is told once

#### Scenario: Recovery off
- **WHEN** a user creates or unlocks a key on a portal with organisational recovery off
- **THEN** nothing is enrolled and no recovery text is shown

#### Scenario: Enrolment fails
- **WHEN** the wraps cannot be stored
- **THEN** the key stays usable, the profile shows that the key cannot be restored by an administrator, and the enrolment is tried again at the next unlock

### Requirement: Recovery status in the keys management tab
The system SHALL show in the keys management tab whether the user's key can be restored by an administrator, the names of the recovery administrators, and the last recovery of the key until the user has set a new passphrase after it.

#### Scenario: Enrolled
- **WHEN** an enrolled user opens the keys management tab
- **THEN** the tab names the recovery administrators and says they can restore the key

#### Scenario: Recovered key
- **WHEN** a user whose key was recovered opens the tab before setting a new passphrase
- **THEN** the tab shows who recovered the key and when

### Requirement: Recovery of a user's key by a recovery administrator
The system SHALL let a recovery administrator restore the key of an enrolled user: after the administrator unlocks their own key, the user's key is sealed under a one-time passphrase that is shown to the administrator once. The action SHALL NOT be offered to anybody else, for a user who is not enrolled, or for the administrator's own key.

#### Scenario: Key restored
- **WHEN** a recovery administrator restores the key of an enrolled user
- **THEN** a one-time passphrase is shown once with the advice to hand it over in person or by phone, and the user's key pair stays the same

#### Scenario: Not a recovery administrator
- **WHEN** a portal administrator who is not a recovery administrator opens the actions of a user
- **THEN** the restore action is absent

#### Scenario: User not enrolled
- **WHEN** a recovery administrator opens the actions of a user who has no wrap for that administrator
- **THEN** the restore action is absent or disabled with the reason

#### Scenario: Administrator's key locked
- **WHEN** the recovery administrator starts a restore with a locked key
- **THEN** the unlock is asked first, and nothing is read of the user's key before it succeeds

### Requirement: New passphrase is required after a recovery
The system SHALL, after a user unlocks a recovered key with the one-time passphrase, require a new passphrase and offer a new recovery phrase before the key is used for anything else. The one-time passphrase SHALL NOT open the key once the new passphrase is set.

#### Scenario: First unlock after a recovery
- **WHEN** a user unlocks a recovered key with the one-time passphrase
- **THEN** the passphrase change opens at once and cannot be dismissed while the key is used

#### Scenario: New passphrase set
- **WHEN** the user has set the new passphrase
- **THEN** the one-time passphrase no longer opens the key, and the files of the user's private rooms open as before the loss
