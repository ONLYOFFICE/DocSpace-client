# Spec Delta

## ADDED Requirements

### Requirement: Keys management opens with an introduction
The system SHALL show at the top of Keys management the sentence Common:KeysManagementIntro, which says what the encryption key, the passphrase and the recovery phrase are for. The sentence SHALL be shown whether the user holds a key or not.

#### Scenario: User with a key
- **WHEN** a user who holds a key opens Keys management
- **THEN** Common:KeysManagementIntro stands above the key

#### Scenario: User without a key
- **WHEN** a user who holds no key opens Keys management
- **THEN** Common:KeysManagementIntro stands above the empty state

### Requirement: Keys management shows whether the key is locked
The system SHALL show beside the heading of the key in Keys management the state of the user's key with a text, Common:KeyLocked or Common:KeyUnlocked, the words of the room header. The state SHALL NOT be told by colour alone and SHALL follow a lock or an unlock without a page reload. It SHALL NOT be shown to a user without a key or while the key list is not known. The status of the key, Common:Active, stays where it is.

#### Scenario: Locked key
- **WHEN** a user whose key is locked opens Keys management
- **THEN** the heading of the key shows Common:KeyLocked

#### Scenario: Key locks while the page is open
- **WHEN** the key is locked by the idle timeout or by Common:LockNow while the page is open
- **THEN** the heading shows Common:KeyLocked without a page reload

#### Scenario: User without a key
- **WHEN** a user who holds no key opens Keys management
- **THEN** no state is shown beside the heading

### Requirement: Key state on Keys management is readable
The system SHALL show the state of the key in Keys management with a contrast of at least 4.5:1 between its text and its background, in the light and in the dark theme.

#### Scenario: Both themes
- **WHEN** the state Common:KeyLocked or Common:KeyUnlocked is shown in the light or in the dark theme
- **THEN** its text has a contrast of at least 4.5:1 against its background

### Requirement: Keys management offers to unlock a locked key
While the user's key is locked, the system SHALL show under the heading of the key the sentence Common:PrivateRoomLockedBarText and under the key a primary action labelled Common:UnlockKey, which raises the unlock dialog. Neither SHALL be shown while the key is unlocked.

#### Scenario: Unlock from the page
- **WHEN** the user presses Common:UnlockKey in Keys management and enters the passphrase
- **THEN** the key is unlocked, the heading shows Common:KeyUnlocked, and the sentence and the action are gone

#### Scenario: Unlock cancelled
- **WHEN** the user presses Common:UnlockKey and dismisses the dialog
- **THEN** the page stays as it was, with the action offered

#### Scenario: Unlocked key
- **WHEN** a user whose key is unlocked opens Keys management
- **THEN** no unlock action is shown

### Requirement: Recovery phrase has a block of its own in Keys management
The system SHALL show the link Common:UseRecoveryPhrase under the heading Common:RecoveryPhraseTitle and the sentence Common:RecoveryPhraseSectionText, which says that the phrase sets a new passphrase and restores access to the existing key. The block SHALL be shown wherever the link is shown today.

#### Scenario: User with a key
- **WHEN** a user who holds a key opens Keys management
- **THEN** the heading, the sentence and the link of the recovery phrase stand together under the key
