# Spec Delta

## MODIFIED Requirements

### Requirement: Closing a key dialog with typed input asks for confirmation
The system SHALL ask for confirmation (Common:UnsavedChanges) before the cross or Escape closes a passphrase-creation, passphrase-change or recovery-phrase-input dialog that holds typed input, or a recovery-phrase display whose phrase is not yet acknowledged; declining keeps the dialog open with its input, confirming discards it, whether the answer is given with a pointer or with the keyboard. The unlock prompt, the reset dialog and the key-change dialog SHALL close without a question.

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

### Requirement: Key dialogs return the focus when they close
The system SHALL return the keyboard focus to the control that opened a key dialog when the dialog closes, whether through its actions, the cross or Escape, as long as that control is still on the page; when a flow replaces one dialog with another, the control that opened the flow receives the focus when the last dialog closes.

#### Scenario: Generation cancelled from the keyboard
- **WHEN** the user opens key generation from Common:GenerateNewKey, presses Escape and confirms the discard
- **THEN** the Common:GenerateNewKey button has the focus again

#### Scenario: Flow ended by a later dialog
- **WHEN** key generation was opened from Common:GenerateNewKey, the recovery-phrase display has replaced the passphrase prompt and the user cancels it
- **THEN** the Common:GenerateNewKey button has the focus again

#### Scenario: Unlock completed
- **WHEN** the passphrase prompt was opened by a keyboard action and the user unlocks
- **THEN** the focus is back on the element that had it before the prompt

### Requirement: Enter confirms a key dialog from its text fields
The system SHALL treat Enter pressed in any text field of a key dialog as its primary action while that action is enabled, SHALL NOT submit while it is disabled, and SHALL leave Enter pressed on a button, link or checkbox to that control, acting once for a held key. In the recovery phrase field Shift+Enter inserts a line break instead.

#### Scenario: Passphrase change on Enter
- **WHEN** the three passphrase-change fields are valid and the user presses Enter in the confirmation field
- **THEN** the envelope is re-sealed as if the primary action were clicked

#### Scenario: Recovery phrase on Enter
- **WHEN** the user has typed the recovery phrase and presses Enter in its field
- **THEN** the phrase is checked as if the primary action were clicked

#### Scenario: Reset token on Enter
- **WHEN** the typed text matches Common:ResetEncryptionKeysConfirmationToken and the user presses Enter in the field
- **THEN** the reset starts as if the primary action were clicked

#### Scenario: Enter while the action is disabled
- **WHEN** the new passphrase is shorter than the minimum and the user presses Enter
- **THEN** nothing is submitted and the dialog stays as it is

#### Scenario: Enter on the cancel action
- **WHEN** the focus is on the cancel action and the user presses Enter
- **THEN** the dialog cancels and nothing is submitted

#### Scenario: Held Enter on an action link
- **WHEN** the user holds Enter on a key dialog's action link, such as Common:GenerateNewKey in the passphrase prompt
- **THEN** the link acts once, not once per auto-repeat

#### Scenario: Line break in the recovery phrase
- **WHEN** the user presses Shift+Enter in the recovery phrase field
- **THEN** a line break is inserted and nothing is submitted

### Requirement: Key-dialog errors are tied to their field
The system SHALL mark an invalid key-dialog field as invalid, attach its error text to the field so that assistive technology reads both together, announce the error when it appears, keep or return the keyboard focus to that field once the failed action has settled, and clear both the mark and the text once the input is corrected.

#### Scenario: Mismatched confirmation
- **WHEN** the confirmation does not match the passphrase
- **THEN** the confirmation field is marked invalid and Common:PassphraseMismatch is attached to it and announced

#### Scenario: Wrong passphrase announced
- **WHEN** an unlock attempt fails
- **THEN** the passphrase field is marked invalid, Common:InvalidPassphrase is attached to it and announced once, and typing again does not repeat the announcement

#### Scenario: Focus kept after a failure
- **WHEN** an unlock attempt fails while the passphrase field had the focus
- **THEN** the passphrase field has the focus again once Common:InvalidPassphrase is shown, so the next keystroke goes into it and Tab stays within the dialog's order

#### Scenario: Wrong recovery phrase
- **WHEN** the typed recovery phrase does not restore the key
- **THEN** the phrase field is marked invalid and Common:InvalidRecoveryPhrase is attached to it

#### Scenario: Error cleared
- **WHEN** the user corrects the field
- **THEN** it is no longer marked invalid and the error text is gone
