# Spec Delta

## MODIFIED Requirements

### Requirement: Key dialogs are accessible and adapt to narrow screens
The system SHALL present the passphrase, recovery-phrase, key-change, passphrase-change and reset dialogs as centred modals on wide screens and as aside panels on narrow screens; each dialog SHALL expose a dialog role and an accessible name, and every input and action SHALL have an accessible name, so screen readers announce them. The passphrase fields SHALL carry a visible label, which is their accessible name.

#### Scenario: Mobile viewport
- **WHEN** a key dialog opens on a narrow screen
- **THEN** it renders as an aside panel with the same content and actions

#### Scenario: Screen reader
- **WHEN** a key dialog opens
- **THEN** it is announced with its title, every action has an accessible label and every input an accessible name

#### Scenario: Passphrase field
- **WHEN** the passphrase dialog opens
- **THEN** its passphrase and confirmation fields are named by visible labels, Common:Passphrase and Common:ConfirmPassphrase, and a placeholder no longer stands in for a name

#### Scenario: Passphrase-change fields
- **WHEN** the passphrase-change dialog opens
- **THEN** its three fields are named by visible labels, Common:CurrentPassphrase, Common:NewPassphrase and Common:ConfirmNewPassphrase

## ADDED Requirements

### Requirement: Key dialogs ignore a click beside them
The system SHALL NOT close a key dialog on a click or tap on the backdrop beside it; the header cross, Escape and the dialog's own actions remain the only ways to close it.

#### Scenario: Backdrop click on the unlock prompt
- **WHEN** the passphrase prompt is open and the user clicks beside the dialog
- **THEN** the dialog stays open and the pending operation keeps waiting for the passphrase

#### Scenario: Backdrop click on the key-change dialog
- **WHEN** a key-change dialog is open and the user clicks beside it
- **THEN** the dialog stays open and the changed key MUST NOT be accepted or refused by that click

#### Scenario: Escape still cancels
- **WHEN** the passphrase prompt is open and the user presses Escape
- **THEN** the dialog closes and the pending operation is aborted, as on Cancel

### Requirement: Closing a key dialog with typed input asks for confirmation
The system SHALL ask for confirmation (Common:UnsavedChanges) before the cross or Escape closes a passphrase-creation, passphrase-change or recovery-phrase-input dialog that holds typed input, or a recovery-phrase display whose phrase is not yet acknowledged; declining keeps the dialog open with its input, confirming discards it. The unlock prompt, the reset dialog and the key-change dialog SHALL close without a question.

#### Scenario: Typed passphrase kept
- **WHEN** the user has typed a new passphrase, presses Escape and declines the confirmation
- **THEN** the creation dialog stays open with the typed passphrase in place

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

### Requirement: Key dialogs take the focus when they open
The system SHALL move the keyboard focus into a key dialog as it opens: to its first text field when it has one, otherwise to the dialog itself, in both the modal and the aside presentation, so the next Tab moves within the dialog and not in the page behind it.

#### Scenario: Prompt opened
- **WHEN** the passphrase prompt opens
- **THEN** the passphrase field has the focus

#### Scenario: Key-change dialog opened
- **WHEN** the key-change dialog opens
- **THEN** the dialog itself has the focus and none of its actions is pre-selected

#### Scenario: Opened as an aside panel
- **WHEN** a key dialog opens on a narrow screen
- **THEN** the focus moves into the panel the same way

### Requirement: Key dialogs return the focus when they close
The system SHALL return the keyboard focus to the control that opened a key dialog when the dialog closes, whether through its actions, the cross or Escape, as long as that control is still on the page.

#### Scenario: Generation cancelled from the keyboard
- **WHEN** the user opens key generation from Common:GenerateNewKey, presses Escape and confirms the discard
- **THEN** the Common:GenerateNewKey button has the focus again

#### Scenario: Unlock completed
- **WHEN** the passphrase prompt was opened by a keyboard action and the user unlocks
- **THEN** the focus is back on the element that had it before the prompt

### Requirement: Tab order in key dialogs follows the visual order
The system SHALL move the focus with Tab through a key dialog's fields, links, checkboxes and actions in the order they are displayed, and backwards with Shift+Tab, without any hand-assigned order; the system SHALL NOT trap the focus inside the dialog in this version, so Tab from the last action leaves it.

#### Scenario: Forward through the creation dialog
- **WHEN** the creation dialog has the focus in the passphrase field and the user presses Tab repeatedly
- **THEN** the focus visits the confirmation field, then the dialog's links and actions in their displayed order

#### Scenario: Backwards from the primary action
- **WHEN** the focus is on the primary action and the user presses Shift+Tab
- **THEN** the focus moves to the control displayed before it

#### Scenario: No trap
- **WHEN** the focus is on the last action of a key dialog and the user presses Tab
- **THEN** the focus leaves the dialog

### Requirement: Enter confirms a key dialog from its text fields
The system SHALL treat Enter pressed in any text field of a key dialog as its primary action while that action is enabled, SHALL NOT submit while it is disabled, and SHALL leave Enter pressed on a button, link or checkbox to that control. In the recovery phrase field Shift+Enter inserts a line break instead.

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

#### Scenario: Line break in the recovery phrase
- **WHEN** the user presses Shift+Enter in the recovery phrase field
- **THEN** a line break is inserted and nothing is submitted

### Requirement: Key-dialog errors are tied to their field
The system SHALL mark an invalid key-dialog field as invalid, attach its error text to the field so that assistive technology reads both together, announce the error when it appears, and clear both once the input is corrected.

#### Scenario: Mismatched confirmation
- **WHEN** the confirmation does not match the passphrase
- **THEN** the confirmation field is marked invalid and Common:PassphraseMismatch is attached to it and announced

#### Scenario: Wrong passphrase announced
- **WHEN** an unlock attempt fails
- **THEN** the passphrase field is marked invalid, Common:InvalidPassphrase is attached to it and announced once, and typing again does not repeat the announcement

#### Scenario: Wrong recovery phrase
- **WHEN** the typed recovery phrase does not restore the key
- **THEN** the phrase field is marked invalid and Common:InvalidRecoveryPhrase is attached to it

#### Scenario: Error cleared
- **WHEN** the user corrects the field
- **THEN** it is no longer marked invalid and the error text is gone

### Requirement: A pending key-dialog action is reported as busy
While a key dialog's primary action is in progress the system SHALL report that action as busy, disable the dialog's fields and SHALL NOT accept a second submission until the action has finished.

#### Scenario: Unlock in progress
- **WHEN** an unlock is in progress and the user presses Enter again
- **THEN** no second unlock is started

#### Scenario: Busy reported to assistive technology
- **WHEN** key generation, unlock, re-sealing or recovery is in progress
- **THEN** the primary action is exposed as busy and the fields are disabled
