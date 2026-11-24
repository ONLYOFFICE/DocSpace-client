# Spec Delta

## MODIFIED Requirements

### Requirement: Device setup hint on entering a private room without keys
The system SHALL show, once per browser session, an info toast (Common:EncryptionDeviceSetupHint) with a link to Keys management when a user whose account has no encryption key enters a private room. The hint SHALL wait until the user's key list is known.

#### Scenario: First private room this session
- **WHEN** a user without an encryption key opens a private room
- **THEN** the hint toast appears with the link

#### Scenario: Second room same session
- **WHEN** the same user opens another private room
- **THEN** the hint is not repeated

#### Scenario: Key list not known
- **WHEN** a user opens a private room while their key list has not loaded or failed to load
- **THEN** no hint is shown until the list has loaded and holds no key

### Requirement: Closing a key dialog with typed input asks for confirmation
The system SHALL ask for confirmation (Common:UnsavedChanges) before the cross or Escape closes a passphrase-creation, passphrase-change or recovery-phrase-input dialog whose step holds typed input, or a recovery-phrase display whose phrase is not yet acknowledged; declining keeps the dialog open with its input, confirming discards it, whether the answer is given with a pointer or with the keyboard. The unlock prompt, the reset dialog and the key-change dialog SHALL close without a question.

#### Scenario: Typed passphrase kept
- **WHEN** the user has typed a new passphrase, presses Escape and declines the confirmation
- **THEN** the creation dialog stays open with the typed passphrase in place

#### Scenario: Declined from the keyboard
- **WHEN** the user has typed a new passphrase, presses Escape, moves the focus to Common:CancelButton of the confirmation and presses Enter
- **THEN** the creation dialog stays open with the typed passphrase in place and nothing is discarded

#### Scenario: Typed passphrase discarded
- **WHEN** the user has typed a new passphrase, presses Escape and confirms
- **THEN** the dialog closes, key generation is cancelled and no key is registered

#### Scenario: Nothing typed yet
- **WHEN** the creation dialog is open with empty fields and the user presses Escape
- **THEN** the dialog closes at once without a confirmation

#### Scenario: Recovery phrase not yet acknowledged
- **WHEN** the recovery phrase is displayed, the acknowledgement is not ticked and the user clicks the cross
- **THEN** confirmation is asked; confirming cancels the generation, so no key is registered whose phrase was never acknowledged

#### Scenario: Unlock prompt closes at once
- **WHEN** the user has typed into the unlock prompt and presses Escape
- **THEN** the prompt closes without a confirmation and the pending operation is aborted

#### Scenario: Explanation step after going back
- **WHEN** the user typed a passphrase in key setup, went back to the explanation step and presses the cross or Escape there
- **THEN** the dialog closes without a question and the typed passphrase is dropped

### Requirement: A passphrase change keeps the key pair
The system SHALL NOT generate a new key pair when the passphrase is changed or the key is recovered with the recovery phrase: only the envelope is sealed again. A copy of the key exported earlier, with the passphrase it was exported under, SHALL keep opening the user's files, so a leaked passphrase or export is not cured by a passphrase change. No action replaces the key pair of a user who keeps access to their files.

#### Scenario: Old export after a passphrase change
- **WHEN** the user exports the key, changes the passphrase, later deletes the key and imports the old export with the old passphrase
- **THEN** the imported key opens the user's encrypted files

#### Scenario: Public key unchanged
- **WHEN** the user changes the passphrase
- **THEN** the public key registered on the server and the Key ID shown in Keys management are the same as before

### Requirement: Keys management controls are reachable with Tab
The system SHALL make every enabled control of the keys management page a tab stop, in the order the page displays them: the key card's change-passphrase, export and delete actions, the unlock, delete-unused, generate, import and recovery-phrase actions, the device section's auto-lock selector, passkey toggle, forget-device and lock-now actions, and the reset action. A disabled control SHALL NOT be a tab stop.

#### Scenario: Tab across the key card
- **WHEN** a user with a key moves the focus with Tab across the key card
- **THEN** it visits the Common:ChangePassphrase, Common:ExportKey and Common:Delete actions in that order

#### Scenario: No key yet
- **WHEN** a user without a key moves the focus with Tab from Common:GenerateNewKey
- **THEN** the next stop is Common:ImportKey

#### Scenario: Device section
- **WHEN** the device is remembered, the identity is unlocked and the user tabs through the device section
- **THEN** the focus visits the auto-lock selector, the passkey toggle when it is offered and Common:LockNow in their displayed order

#### Scenario: Device section while locked
- **WHEN** the device is remembered, the identity is locked and the user tabs through the device section
- **THEN** the focus visits the auto-lock selector, the passkey toggle when it is offered and Common:ForgetDeviceButton in their displayed order

#### Scenario: Action disabled during a deletion
- **WHEN** a key is being deleted
- **THEN** Tab skips that key card's actions

### Requirement: Recovery phrase has a block of its own in Keys management
The system SHALL show the link Common:UseRecoveryPhrase under the heading Common:RecoveryPhraseTitle and the sentence Common:RecoveryPhraseSectionText, which says that the phrase sets a new passphrase and restores access to the existing key. The block SHALL be shown while the user has a key.

#### Scenario: User with a key
- **WHEN** a user who holds a key opens Keys management
- **THEN** the heading, the sentence and the link of the recovery phrase stand together under the key

### Requirement: Ghost-state notification
The system SHALL show, once per session and once more after the user resets their keys, a toast (Common:GhostStateDetected) linking to Keys management when a download, copy or filename recovery fails because the user's key cannot unwrap the file. It SHALL NOT show that toast for a file whose access entry names a key the user no longer holds.

#### Scenario: Unreadable file
- **WHEN** an encrypted operation finds no usable wrap for the current user
- **THEN** the ghost-state toast appears once, later failures in the session stay silent

#### Scenario: File wrapped for a previous key
- **WHEN** filename recovery, a download or a copy meets a file whose access entry names a key that is not in the user's key list
- **THEN** the ghost-state toast is not shown and the session's one toast is not used up

#### Scenario: After a key reset
- **WHEN** the toast was shown in the session, the user resets their keys and an encrypted operation again finds no usable wrap
- **THEN** the toast is shown once more
