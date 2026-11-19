# Private Rooms Key Management Specification

## Purpose
Describes the identity lifecycle as the user experiences it: creating encryption keys, unlocking them on a device, keeping a device unlocked, locking, recovering a lost passphrase, moving keys between devices, resetting all keys or deleting unused ones, and the prompts that guide a user who enters a private room without a usable key. The Keys management tab in the profile is the home of these flows; the unlock dialog appears wherever an encrypted operation needs the identity. Implementation: `packages/client/src/pages/Profile/Section/Body/sub-components/keys-management/**`, `packages/shared/dialogs/{passphrase-modal,key-generation,key-recovery,key-change-dialog}`, `packages/shared/context/encryption/EncryptionContext.tsx`, `packages/client/src/components/EncryptionProviderWrapper.jsx`.

## Requirements

### Requirement: Generate a new key
The system SHALL let a user with no key generate one from the Keys management tab (Common:GenerateNewKey) or when choosing the Private room type: the user sets a passphrase, receives a recovery phrase, and the sealed envelope plus public key are registered on the server. Success is confirmed with Common:EncryptionKeyGenerated. The action SHALL NOT be offered while the user has a key, nor while the user's key list is not known because it has not loaded or failed to load.

#### Scenario: First key
- **WHEN** a user without keys completes passphrase creation and acknowledges the recovery phrase
- **THEN** a key pair is registered and the identity is unlocked on this device

#### Scenario: Generation fails
- **WHEN** registration on the server fails
- **THEN** an error toast is shown and no key is left half-registered

#### Scenario: Key already exists
- **WHEN** the user already has a key
- **THEN** Keys management offers no way to generate another one

#### Scenario: Key list could not be loaded
- **WHEN** the user opens Keys management and the request for their key list fails
- **THEN** Common:EncryptionKeysLoadFailed is shown with Common:TryAgain, no generate or import action is offered, and no key is registered until a reload of the list answers with an empty list

### Requirement: Passphrase strength gate
The system SHALL require a new passphrase of at least 12 characters, show its strength as a grade, and SHALL refuse passphrases that match a common pattern (keyboard rows, sequences, brand names), at key creation, after a recovery with the recovery phrase and at a passphrase change alike. The strength line SHALL show the grade alone and SHALL NOT advise adding a capital letter, a digit or a punctuation character.

#### Scenario: Too short
- **WHEN** the user enters an 11-character passphrase
- **THEN** the confirm button stays disabled

#### Scenario: Common pattern
- **WHEN** the user enters a passphrase built from a keyboard row or the product name
- **THEN** it is rejected as weak even if it is long enough

#### Scenario: Passphrase change
- **WHEN** the user enters a new passphrase built from a common pattern in the passphrase change dialog
- **THEN** the new passphrase field is marked invalid with Common:PassphraseCommonPattern as its error, and the change MUST NOT be submitted

#### Scenario: Strength line shows a grade only
- **WHEN** the user types a new passphrase without a capital letter, a digit or a punctuation character
- **THEN** the strength line shows Common:PassphraseStrengthLabel with one grade and no advice to add a character of any kind

### Requirement: Recovery phrase is shown once and must be acknowledged
The system SHALL display the 24-word recovery phrase after key generation as a numbered list in the order of the phrase, with print, download (HTML recovery kit) and copy as three actions of equal weight, and SHALL require the user to tick the acknowledgement (Common:RecoveryPhraseAcknowledge) before the dialog can be closed. The acknowledgement SHALL be available whether or not a save action was used, and a save action SHALL NOT tick it.

#### Scenario: Acknowledge before close
- **WHEN** the recovery phrase dialog is open and the checkbox is not ticked
- **THEN** the confirm action is unavailable

#### Scenario: Copy to clipboard
- **WHEN** the user clicks copy
- **THEN** the phrase is copied and Common:Copied is shown

#### Scenario: Words written down by hand
- **WHEN** the recovery phrase dialog opens and the user has used none of the save actions
- **THEN** the acknowledgement can be ticked, and ticking it makes the confirm action available

#### Scenario: Save action does not acknowledge
- **WHEN** the user prints, downloads or copies the phrase and does not tick the acknowledgement
- **THEN** the confirm action stays unavailable and no key is registered

#### Scenario: Numbered words
- **WHEN** the recovery phrase dialog is open
- **THEN** each of the 24 words is shown with its position from 1 to 24, read left to right whatever the direction of the interface language

#### Scenario: Numbers stay out of the copy
- **WHEN** the user clicks copy, or selects the words by hand and copies them
- **THEN** the clipboard holds the 24 words separated by spaces and no position number

#### Scenario: Recovery kit
- **WHEN** the user prints or downloads the recovery kit
- **THEN** the kit lists the same 24 words with the same position numbers

### Requirement: Unlock with the passphrase
The system SHALL prompt for the passphrase (Common:EnterPassphrase) whenever an encrypted operation needs the locked identity, SHALL label the confirm action of that prompt Common:UnlockKey, SHALL accept Enter as confirmation, and SHALL report a wrong passphrase with Common:InvalidPassphrase without closing the dialog.

#### Scenario: Enter confirms
- **WHEN** the user types the passphrase and presses Enter
- **THEN** the identity is unlocked and the pending operation continues

#### Scenario: Wrong passphrase
- **WHEN** the entered passphrase does not open the envelope
- **THEN** Common:InvalidPassphrase is shown and the user can retry

#### Scenario: Cancel
- **WHEN** the user closes the dialog
- **THEN** the pending operation is aborted and nothing is decrypted

#### Scenario: Confirm action names the unlock
- **WHEN** the unlock dialog opens
- **THEN** its confirm action is labelled Common:UnlockKey

### Requirement: Forgot passphrase link
The system SHALL offer a Common:ForgotPassphrase link in the unlock dialog from the moment the dialog opens, wherever the dialog has a recovery path to lead to, and SHALL keep it after a failed attempt. The link SHALL lead to the recovery-phrase flow and SHALL stand after the remember-device option, as "Remember this device" places it.

#### Scenario: Link before any attempt
- **WHEN** the unlock dialog opens and nothing has been typed
- **THEN** the Forgot passphrase link is visible and opens the recovery flow

#### Scenario: Link after failure
- **WHEN** an unlock attempt failed
- **THEN** the Forgot passphrase link is visible and opens the recovery flow

#### Scenario: Link under the remember option
- **WHEN** the unlock dialog opens with the remember-device option
- **THEN** the Forgot passphrase link follows that option and its hint in the reading and the Tab order

#### Scenario: Passphrase creation
- **WHEN** the passphrase-creation dialog is open
- **THEN** no Forgot passphrase link is shown

### Requirement: Remember this device
The system SHALL offer a "remember this device" option in the unlock dialog where enabled; when ticked, later identity requests on this device SHALL be served without a prompt until the user locks or forgets the device or the remembered record exceeds its maximum age (30 days by default). The option SHALL explain that it survives auto-lock and expires. The option SHALL sit directly under the passphrase field, before the other links of the dialog, and SHALL NOT be ticked by default.

#### Scenario: Remembered
- **WHEN** the user unlocks with the option ticked and reloads the page
- **THEN** the next encrypted operation runs without a passphrase prompt

#### Scenario: Forget device
- **WHEN** the user clicks Common:ForgetDeviceButton in Keys management
- **THEN** the stored unlock is removed, Common:DeviceUnlockForgotten is shown, and the next operation prompts again

#### Scenario: Remembered record expired
- **WHEN** a remembered device needs the identity more than 30 days after the record was written
- **THEN** the record is discarded and the user is prompted for the passphrase (or passkey) as if the device had never been remembered

#### Scenario: Option explains the trade-off
- **WHEN** the unlock dialog shows the remember option
- **THEN** its hint (Common:RememberDeviceHint) states that the key stays on this device across auto-lock and expires after 30 days

#### Scenario: Option placed with the passphrase field
- **WHEN** the unlock dialog opens with the remember option
- **THEN** the option follows the passphrase field, comes before the forgot-passphrase and passkey links in the reading and the Tab order, and is not ticked

### Requirement: Passkey unlock
The system SHALL offer a passkey toggle (Common:PasskeyUnlockLabel) when the platform supports it or a passkey is already enrolled. Enrolling requires an unlocked identity; once enrolled, the unlock dialog SHALL try the passkey automatically on open before asking for the passphrase.

#### Scenario: Enrol
- **WHEN** an unlocked user enables the toggle and completes the authenticator prompt
- **THEN** Common:PasskeyEnabled is shown and the toggle stays on

#### Scenario: Enrol fails
- **WHEN** the authenticator does not support the required extension
- **THEN** Common:PasskeyEnrollFailed is shown and the toggle stays off

#### Scenario: Auto-try on unlock
- **WHEN** an enrolled user triggers an unlock dialog
- **THEN** the passkey prompt is attempted once before the passphrase field is used

#### Scenario: Remove
- **WHEN** the user disables the toggle
- **THEN** the passkey record is deleted and Common:PasskeyDisabled is shown

### Requirement: Auto-lock timeout presets
The system SHALL let the user pick an auto-lock timeout of 5, 15 or 30 minutes, 30 minutes by default, and SHALL NOT offer a preset longer than the 30-minute limit of the in-memory key. The identity SHALL lock after that much inactivity (mouse, keyboard, scroll, touch); with the 5 or 15 minute preset it SHALL also lock as soon as the tab is hidden. On a remembered device auto-lock SHALL wipe the in-memory key and the filename cache but SHALL NOT delete the remembered record.

#### Scenario: Idle lock
- **WHEN** the preset is 5 minutes and the user is inactive for 5 minutes
- **THEN** the identity locks and the filename cache is cleared

#### Scenario: Tab hidden
- **WHEN** the preset is 5 or 15 minutes and the tab is hidden
- **THEN** the identity locks immediately

#### Scenario: Tab hidden with the default preset
- **WHEN** the preset is 30 minutes and the tab is hidden
- **THEN** the identity stays unlocked

#### Scenario: Preset off
- **WHEN** the value stored by an earlier version is off or 60 minutes
- **THEN** the setting shows 30 minutes and the identity locks as with that preset

#### Scenario: Offered presets
- **WHEN** the user opens the auto-lock list
- **THEN** it offers Common:AutoLock5m, Common:AutoLock15m and Common:AutoLock30m, and nothing else

#### Scenario: Auto-lock on a remembered device
- **WHEN** the device is remembered and the idle timeout or a hidden tab locks the identity
- **THEN** the next encrypted operation restores the key from the device record without a prompt, and Keys management still shows the device as remembered

### Requirement: Lock now
The system SHALL offer Common:LockNow while the identity is unlocked; it SHALL wipe the in-memory key, forget the remembered device and confirm with Common:EncryptionLocked. Besides Forget device and record expiry, Lock now is the only lock that removes the remembered record.

#### Scenario: Manual lock
- **WHEN** the user clicks Lock now
- **THEN** the identity is locked, the device is forgotten and the next operation prompts for the passphrase

### Requirement: Export a key
The system SHALL export a registered key as a JSON file named after the key fingerprint after the user confirms the passphrase, confirming with Common:EncryptionKeyExported. The export contains the sealed envelope, never the raw private key. The file name SHALL NOT carry a product or brand name.

#### Scenario: Export
- **WHEN** the user chooses export and enters the correct passphrase
- **THEN** an `encryption-key-<fingerprint>.json` file is downloaded

### Requirement: Import a key
The system SHALL import a key from a previously exported JSON file (Common:ImportKey) for a user who has no key: the user picks the file, enters its passphrase, and the key is registered for this account and unlocked, confirming with Common:EncryptionKeyImported. Over HTTP the import SHALL be refused with Common:EncryptionRequiresHttps. The action SHALL NOT be offered while the user has a key, nor while the user's key list is not known.

#### Scenario: Import
- **WHEN** a user without a key selects a valid export file and enters the right passphrase
- **THEN** the key becomes the user's key and is unlocked

#### Scenario: Wrong passphrase on import
- **WHEN** the passphrase does not open the imported envelope
- **THEN** Common:InvalidPassphrase is shown and nothing is registered

#### Scenario: Key already exists
- **WHEN** the user already has a key
- **THEN** Keys management offers no import

#### Scenario: Key list not known
- **WHEN** the user's key list has not loaded or failed to load
- **THEN** Keys management offers no import

### Requirement: Change passphrase
The system SHALL let the user re-seal their key under a new passphrase after proving the current one, replacing the envelope in place and locking the identity, confirming with Common:PassphraseUpdated. The recovery phrase SHALL keep working.

#### Scenario: Rotate passphrase
- **WHEN** the user enters the current passphrase and a new acceptable one
- **THEN** the envelope on the server is replaced and the old passphrase no longer unlocks it

### Requirement: Recover with the recovery phrase
The system SHALL let the user restore access on this device by entering the 24-word phrase (Common:UseRecoveryPhrase) and then set a new passphrase; success is confirmed with Common:RecoveryPhraseRestored. A wrong phrase SHALL report Common:InvalidRecoveryPhrase.

#### Scenario: Recovery
- **WHEN** the user enters the correct phrase and a new passphrase
- **THEN** the identity is unlocked and sealed under the new passphrase

### Requirement: Delete a key
The system SHALL delete a registered key only after a warning (Common:DeleteKeyWarning) that lists the private rooms in which the user holds file access entries, all of which become unreadable without the user's only key, followed by passphrase confirmation, confirming with Common:EncryptionKeyDeleted. The confirm action SHALL wait for the list; when the rooms cannot be listed, the warning is shown without it.

#### Scenario: Delete
- **WHEN** the user confirms the warning and enters the key's passphrase
- **THEN** the key is removed from the server and from the list

#### Scenario: Affected rooms listed
- **WHEN** the delete-key warning opens for a user who holds access entries in three private rooms
- **THEN** the warning names those three rooms (Common:DeleteKeyAffectedRooms) before the user can confirm

#### Scenario: No affected rooms
- **WHEN** the user holds no access entry in any private room
- **THEN** the warning states that no room is affected (Common:DeleteKeyNoAffectedRooms)

### Requirement: Reset all keys with a typed token
The system SHALL offer Common:ResetEncryptionKeysCta to a user who lost both passphrase and recovery phrase; it SHALL require typing the localized token (Common:ResetEncryptionKeysConfirmationToken, compared trimmed and case-insensitively), then delete every envelope the server lists for the user, unused ones included, lock the identity and refresh the list.

#### Scenario: Token mismatch
- **WHEN** the typed text does not match the token
- **THEN** the confirm button stays disabled

#### Scenario: Partial failure
- **WHEN** some key deletions fail
- **THEN** Common:ResetEncryptionKeysPartialFailure reports the count and the identity is still locked

### Requirement: Device setup hint on entering a private room without keys
The system SHALL show, once per browser session, an info toast (Common:EncryptionDeviceSetupHint) with a link to Keys management when the user enters a private room on a device with no configured key. The hint SHALL wait until the user's key list is known.

#### Scenario: First private room this session
- **WHEN** a user without keys on this device opens a private room
- **THEN** the hint toast appears with the link

#### Scenario: Second room same session
- **WHEN** the same user opens another private room
- **THEN** the hint is not repeated

#### Scenario: Key list not known
- **WHEN** a user opens a private room while their key list has not loaded or failed to load
- **THEN** no hint is shown until the list has loaded and holds no key for this device

### Requirement: Ghost-state notification
The system SHALL show, once per session, a toast (Common:GhostStateDetected) linking to Keys management when a download, copy or filename recovery fails because the user's key cannot unwrap the file.

#### Scenario: Unreadable file
- **WHEN** an encrypted operation finds no usable wrap for the current user
- **THEN** the ghost-state toast appears once, later failures in the session stay silent

### Requirement: Key-change dialog
The system SHALL show a dialog when a peer's public key differs from its pin, naming the peer by display name, stating how long the previous key was active, listing possible causes and an out-of-band verification tip, with accept and refuse actions. Concurrent mismatches SHALL wait for the open dialog and be shown one after another; requests for the same user and key SHALL share the user's one decision. The system SHALL NOT answer a request on the user's behalf.

#### Scenario: Refuse
- **WHEN** the user refuses the changed key
- **THEN** the operation that needed the peer's key fails and the pin is unchanged

#### Scenario: Second mismatch while a dialog is open
- **WHEN** another operation detects a mismatch for a different user or key while a key-change dialog is open
- **THEN** the open dialog stays unanswered until the user decides, and the second request is shown afterwards

#### Scenario: Same key asked twice
- **WHEN** several operations detect the same changed key of the same user while its dialog is open
- **THEN** one dialog is shown and the user's decision answers every waiting request for that key, with no second dialog

#### Scenario: No automatic refusal
- **WHEN** a new mismatch request arrives while a dialog is open
- **THEN** the pending request MUST NOT be resolved as refused by the arrival alone

#### Scenario: Peer named in the dialog
- **WHEN** the key-change dialog opens for a room member whose key changed
- **THEN** the dialog names the member by display name, as the skipped-member toast does; the user id stands in only when the name cannot be loaded

#### Scenario: Peer name not readable
- **WHEN** the server refuses the current user the profile of the peer whose key changed
- **THEN** the dialog names the peer by user id, and no access-denied message, rights refresh or selection reset follows from the refused lookup

#### Scenario: Next request after an answer
- **WHEN** the user answers a key-change dialog while another request for a different user or key is waiting
- **THEN** the waiting request opens as a new dialog with its own peer and fingerprints, and MUST NOT be answered by the same click, key press or key repeat that answered the previous one

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

### Requirement: Unused keys on the server can be deleted
The system SHALL show in Keys management how many of the user's envelopes on the server are not the selected key (Common:UnusedEncryptionKeysNotice) and SHALL offer to delete them (Common:DeleteUnusedEncryptionKeys) after a warning and passphrase confirmation of the selected key; the selected key is never deleted by this action.

#### Scenario: Leftover keys
- **WHEN** the server lists three envelopes for the user
- **THEN** the notice reports two unused keys and the action deletes those two, keeping the selected one

#### Scenario: Single key
- **WHEN** the server lists one envelope for the user
- **THEN** neither the notice nor the action is shown

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

#### Scenario: Queued key-change dialog opened
- **WHEN** a waiting key-change request opens right after the user answered the previous one
- **THEN** the new dialog itself has the focus and none of its actions is pre-selected, as for the first dialog

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

### Requirement: A pending key-dialog action is reported as busy
While a key dialog's primary action is in progress the system SHALL report that action as busy, disable the dialog's fields and SHALL NOT accept a second submission until the action has finished.

#### Scenario: Unlock in progress
- **WHEN** an unlock is in progress and the user presses Enter again
- **THEN** no second unlock is started

#### Scenario: Busy reported to assistive technology
- **WHEN** key generation, unlock, re-sealing or recovery is in progress
- **THEN** the primary action is exposed as busy and the fields are disabled

### Requirement: Keys management controls are reachable with Tab
The system SHALL make every enabled control of the keys management page a tab stop, in the order the page displays them: the key card's change-passphrase, export and delete actions, the generate, import, recovery-phrase, delete-unused and reset actions, and the device section's auto-lock selector, passkey toggle, forget-device and lock-now actions. A disabled control SHALL NOT be a tab stop.

#### Scenario: Tab across the key card
- **WHEN** a user with a key moves the focus with Tab across the key card
- **THEN** it visits the Common:ChangePassphrase, Common:ExportKey and Common:Delete actions in that order

#### Scenario: No key yet
- **WHEN** a user without a key moves the focus with Tab from Common:GenerateNewKey
- **THEN** the next stop is Common:ImportKey, followed by Common:UseRecoveryPhrase when it is offered

#### Scenario: Device section
- **WHEN** the device is remembered, the identity is unlocked and the user tabs through the device section
- **THEN** the focus visits the auto-lock selector, the passkey toggle when it is offered and Common:LockNow in their displayed order

#### Scenario: Device section while locked
- **WHEN** the device is remembered, the identity is locked and the user tabs through the device section
- **THEN** the focus visits the auto-lock selector, the passkey toggle when it is offered and Common:ForgetDeviceButton in their displayed order

#### Scenario: Action disabled during a deletion
- **WHEN** a key is being deleted
- **THEN** Tab skips that key card's actions

### Requirement: Keys management actions answer Enter and Space
The system SHALL run a keys management action when Enter or Space is pressed while it has the focus, exactly as a click on it does.

#### Scenario: Export from the keyboard
- **WHEN** the Common:ExportKey action has the focus and the user presses Enter
- **THEN** the passphrase prompt of the export opens with the focus in its passphrase field

#### Scenario: Lock with Space
- **WHEN** Common:LockNow has the focus and the user presses Space
- **THEN** the identity is locked, Common:EncryptionLocked is shown and the page does not scroll

#### Scenario: Delete from the keyboard
- **WHEN** the Common:Delete action has the focus and the user presses Space
- **THEN** the delete warning opens, and nothing is deleted before it is confirmed

### Requirement: Keys management actions are announced as named buttons
The system SHALL expose each keys management action to assistive technology as a button with a name: the key card actions as Common:ChangePassphrase, Common:ExportKey and Common:Delete, and the import, recovery-phrase, forget-device and lock-now actions by their visible text.

#### Scenario: Key card actions announced
- **WHEN** a screen reader reaches the key card's actions
- **THEN** it announces three buttons named Common:ChangePassphrase, Common:ExportKey and Common:Delete

#### Scenario: Text actions announced
- **WHEN** a screen reader reaches Common:LockNow
- **THEN** it announces a button named by that text

### Requirement: Device settings are named by their labels
The system SHALL name the passkey toggle by Common:PasskeyUnlockLabel and the auto-lock selector by Common:AutoLockLabel, so assistive technology announces what is switched or chosen together with its state or current preset.

#### Scenario: Passkey toggle
- **WHEN** the passkey toggle has the focus
- **THEN** it is announced with Common:PasskeyUnlockLabel and whether it is on

#### Scenario: Auto-lock selector
- **WHEN** the auto-lock selector has the focus
- **THEN** it is announced with Common:AutoLockLabel and the selected preset

### Requirement: Keyboard focus on the keys management page is visible
The system SHALL draw a visible focus indicator on whichever keys management control has the keyboard focus.

#### Scenario: Focused key card action
- **WHEN** the Common:ExportKey action receives the focus from Tab
- **THEN** a focus indicator is drawn around it

### Requirement: The auto-lock list does not announce its highlight
The system SHALL NOT announce the preset highlighted in the open auto-lock list in this version; the highlight is drawn only, and the chosen preset is announced as the selector's value once the list closes.

#### Scenario: Moving through the open list
- **WHEN** the auto-lock list is open and the user moves its highlight with the arrow keys
- **THEN** the highlighted preset is shown but not announced, and Enter still selects it

### Requirement: Tab in key dialogs follows the visual order and stays inside the dialog
The system SHALL move the focus with Tab through a key dialog's fields, links, checkboxes and actions in the order they are displayed, and backwards with Shift+Tab, without any hand-assigned order, and SHALL keep the focus inside the dialog while it is open: Tab from its last control goes to its first, Shift+Tab from its first control to its last, and the page behind the dialog is not reached.

#### Scenario: Forward through the creation dialog
- **WHEN** the creation dialog has the focus in the passphrase field and the user presses Tab repeatedly
- **THEN** the focus visits the passphrase field's show-passphrase toggle, the confirmation field and its toggle, then the dialog's links and actions in their displayed order

#### Scenario: Backwards from the primary action
- **WHEN** the focus is on the primary action and the user presses Shift+Tab
- **THEN** the focus moves to the control displayed before it

#### Scenario: Tab wraps from the last control
- **WHEN** the focus is on the last control of a key dialog and the user presses Tab
- **THEN** the focus moves to the dialog's first control and stays inside the dialog

#### Scenario: Shift+Tab wraps from the first control
- **WHEN** the focus is on the first control of a key dialog and the user presses Shift+Tab
- **THEN** the focus moves to the dialog's last control and stays inside the dialog

#### Scenario: A confirmation over a key dialog holds the focus
- **WHEN** the unsaved-changes confirmation is open over the creation dialog and the user presses Tab repeatedly
- **THEN** the focus moves only among the confirmation's controls, reaching neither the creation dialog below it nor the page

### Requirement: Backup warns about private rooms
The system SHALL show on the backup and restore settings pages, while private rooms are available on the portal, an information bar titled Common:PrivateRoomsBackupWarningTitle with the notice Common:PrivateRoomsBackupWarning: a backup does not include the keys of private rooms, and a portal restored from it cannot open their files. The restore confirmation SHALL name that loss before the restore starts. The notice SHALL NOT be shown while private rooms are not available on the portal.

#### Scenario: Backup page opened
- **WHEN** an administrator opens the manual or automatic backup settings while private rooms are available
- **THEN** the page shows Common:PrivateRoomsBackupWarning

#### Scenario: Restore confirmed
- **WHEN** an administrator starts a restore while private rooms are available
- **THEN** the confirmation names the loss of the private rooms' content before the restore starts

#### Scenario: Private rooms not available
- **WHEN** an administrator opens the backup settings on a standalone portal where the E2E rooms app is off
- **THEN** no private-rooms notice is shown

### Requirement: Keys management tab follows the Private section
The system SHALL show the Keys management tab (Common:KeysManagement) in the profile, and serve its routes, while the Private section is available or while the user holds an encryption key, and never to a guest. A user who holds a key SHALL keep the tab when an administrator switches the E2E rooms app off, so they can still unlock, export, change and reset their key.

#### Scenario: Section available
- **WHEN** a user opens their profile while the Private section is available
- **THEN** the Keys management tab is shown and `/profile/keys-management` opens it

#### Scenario: App off, no key
- **WHEN** a user without an encryption key opens their profile on a standalone portal where the E2E rooms app is off
- **THEN** no Keys management tab is shown and `/profile/keys-management` does not resolve to the page

#### Scenario: App off, key held
- **WHEN** a user who holds an encryption key opens their profile on a standalone portal where the E2E rooms app is off
- **THEN** the Keys management tab is shown and its actions work as with the app on

#### Scenario: Guest
- **WHEN** a guest opens their profile, with the Private section available or with a key stored for the account
- **THEN** no Keys management tab is shown and `/profile/keys-management` does not resolve to the page

### Requirement: Keys management tab carries the Beta badge
The system SHALL show the Beta badge after the label of the Keys management tab. The badge tooltip SHALL show the title Common:PrivateRoomsBetaTitle and the text Common:PrivateRoomsBetaDescription, followed by the feedback links the other Beta badges of the client show.

#### Scenario: Tab label
- **WHEN** the profile renders with the Keys management tab
- **THEN** the tab label is followed by the Beta badge

#### Scenario: Badge tooltip
- **WHEN** the user opens the tooltip of the Beta badge of the tab
- **THEN** it shows Common:PrivateRoomsBetaTitle as its title and Common:PrivateRoomsBetaDescription with the feedback links

### Requirement: Key generation is withheld from guests
The system SHALL NOT let a guest start key generation, from the profile or from private room creation, in the client or in the SDK, since the server refuses every key write of a guest.

#### Scenario: Guest opens the profile
- **WHEN** a guest opens their profile while the Private section is available
- **THEN** no Keys management tab is shown, and key generation cannot be started

#### Scenario: Guest reaches the key offer of room creation
- **WHEN** private room creation would offer a guest to create a key
- **THEN** the offer is not made, no key generation starts, and the creation does not go on

### Requirement: A locked key is reported by a block in a private room
The system SHALL show a block (Common:PrivateRoomLockedBarTitle, Common:PrivateRoomLockedBarText) with an illustration, a primary unlock action (Common:UnlockKey) and Common:ForgotPassphrase above the file list of a private room, or of a folder inside one, while the user's key is configured and locked. The block SHALL NOT be shown while the room's own unlock request is pending, to a user without a key, or while the key list is not known.

#### Scenario: Prompt cancelled on entry
- **WHEN** a user with a locked key opens a private room and cancels the unlock dialog
- **THEN** the block is shown above the file list with the unlock action

#### Scenario: Unlock from the block
- **WHEN** the user presses Common:UnlockKey and enters the passphrase
- **THEN** the block is removed and the file names are decrypted, without a page reload

#### Scenario: Unlock from the block cancelled
- **WHEN** the user presses Common:UnlockKey and cancels the dialog
- **THEN** the block stays

#### Scenario: Key locks while the room is open
- **WHEN** the key is locked by the idle timeout or by Common:LockNow while a private room is open
- **THEN** the block is shown without a new prompt

#### Scenario: Remembered device
- **WHEN** a user opens a private room on a remembered device
- **THEN** the key is unlocked without a prompt and the block is not shown at any moment

#### Scenario: Entry prompt open
- **WHEN** the unlock dialog raised on entering the room is open
- **THEN** the block is not shown under it

#### Scenario: User without a key
- **WHEN** a user whose key list is known to hold no key, or is not known, opens a private room
- **THEN** the block is not shown

#### Scenario: Forgot passphrase from the block
- **WHEN** the user presses Common:ForgotPassphrase in the block
- **THEN** the recovery-phrase flow opens

#### Scenario: Room without files
- **WHEN** a user with a locked key opens a private room that holds no file and cancels the unlock dialog
- **THEN** the block is shown and the empty view of the room is not

### Requirement: Key-change dialog speaks the interface language
The system SHALL show the dates and the duration of the key-change dialog in the interface language: the duration as a number with a unit word of that language, never with fixed Latin suffixes.

#### Scenario: Duration in the interface language
- **WHEN** the key-change dialog reports how long the known key was active
- **THEN** Common:KeyChangedActiveFor carries a duration formatted in the interface language, such as "5 days" in English

### Requirement: Key texts do not tie the key to a device
The system SHALL describe the encryption key as the key of the user's account in the texts that prompt for the passphrase or the recovery phrase, report a missing key, or explain a changed key, and SHALL NOT say that the key is stored or configured per device.

#### Scenario: Passphrase prompt
- **WHEN** the unlock dialog shows Common:PassphraseHint
- **THEN** the text asks for the passphrase of the key without naming a device

#### Scenario: Reasons of a key change
- **WHEN** the key-change dialog lists the legitimate reasons of a change
- **THEN** it names a replaced key (Common:KeyChangedReasonReplaced), a recovery and a reset, and no reason that keys are stored per device

### Requirement: A new passphrase needs no particular characters
The system SHALL accept a new passphrase, at key creation, after a recovery with the recovery phrase and at a passphrase change, when it has at least 12 characters and matches no common pattern, in whatever script it is written, and SHALL NOT require a capital letter, a digit, a punctuation character or a Latin letter in it. The rules tooltip of the passphrase field SHALL name the length alone.

#### Scenario: Lowercase words
- **WHEN** the user enters a 22-character passphrase of lowercase words and spaces that matches no common pattern, and repeats it
- **THEN** the confirm button is enabled

#### Scenario: Passphrase change with lowercase words
- **WHEN** the user enters the current passphrase and such a passphrase twice as the new one in the passphrase-change dialog
- **THEN** the save button is enabled

#### Scenario: Common pattern still refused
- **WHEN** the user enters a passphrase of 12 or more characters built from a common pattern
- **THEN** the confirm button stays disabled

#### Scenario: Rules tooltip
- **WHEN** the rules tooltip of the passphrase field is shown
- **THEN** it names the minimum length of 12 and no rule on capital letters, digits or punctuation

#### Scenario: Passphrase in another script
- **WHEN** the user enters in the key setup dialog a passphrase of 12, 16 or 20 Cyrillic letters, or of 12, 16 or 20 CJK characters, that matches no common pattern, and repeats it
- **THEN** Common:ContinueButton is enabled and no error is shown

#### Scenario: New passphrase after a recovery in another script
- **WHEN** the user enters such a passphrase twice as the new passphrase after a recovery with the recovery phrase
- **THEN** the confirm button is enabled and no error is shown

#### Scenario: Passphrase change in another script
- **WHEN** the user enters the current passphrase and such a passphrase twice as the new one in the passphrase-change dialog
- **THEN** the save button is enabled and no error is shown

#### Scenario: Too short in another script
- **WHEN** the user enters a passphrase of 11 Cyrillic letters or of 11 CJK characters, and repeats it
- **THEN** the confirm button stays disabled

### Requirement: A passphrase change keeps the key pair
The system SHALL NOT generate a new key pair when the passphrase is changed or the key is recovered with the recovery phrase: only the envelope is sealed again. A copy of the key exported earlier, with the passphrase it was exported under, SHALL keep opening the user's files, so a leaked passphrase or export is not cured by a passphrase change. No action replaces the key pair of a user who keeps access to their files.

#### Scenario: Old export after a passphrase change
- **WHEN** the user exports the key, changes the passphrase, and the old export is later imported on another device with the old passphrase
- **THEN** that device opens the user's encrypted files

#### Scenario: Public key unchanged
- **WHEN** the user changes the passphrase
- **THEN** the public key registered on the server and the Key ID shown in Keys management are the same as before

### Requirement: Forget device and Lock now are offered one at a time
The system SHALL offer Common:ForgetDeviceButton only while the identity is locked on a remembered device, and SHALL NOT offer it while the identity is unlocked: there Common:LockNow is the one action, and it locks the identity and forgets the device. The line Common:DeviceUnlockRememberedUntil SHALL be shown in both states.

#### Scenario: Remembered device, identity unlocked
- **WHEN** the user opens Keys management on a remembered device while the identity is unlocked
- **THEN** Common:DeviceUnlockRememberedUntil and Common:LockNow are shown, and Common:ForgetDeviceButton is not

#### Scenario: Remembered device, identity locked
- **WHEN** the identity of a remembered device is locked by the idle timeout or a hidden tab and the user opens Keys management
- **THEN** Common:DeviceUnlockRememberedUntil and Common:ForgetDeviceButton are shown, and Common:LockNow is not

#### Scenario: Lock now on a remembered device
- **WHEN** the user clicks Common:LockNow on a remembered device
- **THEN** the identity is locked, the remembered record is removed, and the next encrypted operation MUST NOT run without the passphrase or a passkey

### Requirement: A newly picked auto-lock preset applies at once
The system SHALL apply an auto-lock preset to the unlocked identity as soon as the user picks it: the idle time SHALL be counted from that moment with the new length, and the hidden-tab rule of the new preset SHALL hold from that moment, without a lock and a new unlock in between.

#### Scenario: Shorter preset picked while unlocked
- **WHEN** the identity was unlocked with the 30-minute preset and the user picks 5 minutes
- **THEN** the identity locks after 5 minutes of inactivity counted from the pick, and MUST NOT stay unlocked for the rest of the earlier 30 minutes

#### Scenario: Longer preset picked while unlocked
- **WHEN** the identity was unlocked with the 5-minute preset and the user picks 30 minutes
- **THEN** the identity stays unlocked through 5 minutes of inactivity and when the tab is hidden

### Requirement: The unlock dialog on entry is raised once per private room
The system SHALL raise the unlock dialog by itself once per private room that a user with a locked key enters, and SHALL NOT raise it again when the user moves between the folders of that room: after the first answer the locked-key block is the way to unlock. Entering another private room SHALL raise the dialog again.

#### Scenario: Subfolder after a cancelled prompt
- **WHEN** a user with a locked key cancels the unlock dialog on entering a private room and then opens a folder of that room
- **THEN** no unlock dialog is raised, and the locked-key block is shown in the folder

#### Scenario: Back to the root of the room
- **WHEN** that user returns from the folder to the root of the same room
- **THEN** no unlock dialog is raised and the block is shown

#### Scenario: Another private room
- **WHEN** that user leaves the room and opens another private room
- **THEN** the unlock dialog is raised once for that room

### Requirement: A generated passphrase fills both fields
The system SHALL put the passphrase generated by Common:GenerateLogoButton of the passphrase-creation dialog into the passphrase field and into its confirmation. A later edit of either field SHALL be checked against the other as typed input is, and a generated passphrase SHALL pass the same strength rules as a typed one before the confirm action is enabled. A generated passphrase SHALL have 12 characters with at least one Latin capital letter, one digit and one punctuation character.

#### Scenario: Generate
- **WHEN** the user presses Common:GenerateLogoButton in the passphrase-creation dialog
- **THEN** both fields hold the generated passphrase, the passphrase is readable in its field, and the confirm action is enabled without typing

#### Scenario: Generate over typed input
- **WHEN** the user has typed a passphrase and a different confirmation and presses Common:GenerateLogoButton
- **THEN** both fields hold the generated passphrase and Common:PassphraseMismatch is gone

#### Scenario: Edit after generating
- **WHEN** the user changes the passphrase field after generating
- **THEN** the confirmation is marked invalid with Common:PassphraseMismatch and the confirm action is disabled until the two match again

#### Scenario: Generated characters
- **WHEN** the user presses Common:GenerateLogoButton
- **THEN** the generated passphrase has 12 characters and holds a Latin capital letter, a digit and a punctuation character

### Requirement: A new passphrase equal to the current one is named
The system SHALL mark the new-passphrase field of the passphrase-change dialog invalid with Common:PassphraseMustBeDifferent while it holds the same text as the current-passphrase field, without waiting for a submit, and SHALL NOT submit the change in that state.

#### Scenario: Same passphrase typed
- **WHEN** the user types the current passphrase and then the same text as the new passphrase
- **THEN** the new-passphrase field is marked invalid, Common:PassphraseMustBeDifferent is attached to it and announced, and the save action is disabled

#### Scenario: Enter with the same passphrase
- **WHEN** the three fields hold the same acceptable passphrase and the user presses Enter
- **THEN** nothing is submitted and the envelope on the server is not replaced

#### Scenario: Passphrase corrected
- **WHEN** the user changes the new passphrase so that it differs from the current one
- **THEN** the field is no longer marked invalid and Common:PassphraseMustBeDifferent is gone

### Requirement: Key status badges are readable
The system SHALL show the Common:Active and Common:NoKey badges of the keys management page with a contrast of at least 4.5:1 between the badge text and the badge background, in the light and in the dark theme.

#### Scenario: Active key in the light theme
- **WHEN** a user with a key opens the keys management page in the light theme
- **THEN** the text of the Common:Active badge has a contrast of at least 4.5:1 against the badge

#### Scenario: No key in the dark theme
- **WHEN** a user without a key opens the keys management page in the dark theme
- **THEN** the text of the Common:NoKey badge has a contrast of at least 4.5:1 against the badge

### Requirement: The strength grade does not contradict the passphrase rules
The system SHALL grade a new passphrase that fails the length or the common-pattern rule Common:PassphraseStrengthWeak and SHALL NOT show Common:PassphraseStrengthFair, Common:PassphraseStrengthGood or Common:PassphraseStrengthStrong for it. It SHALL NOT show Common:PassphraseStrengthWeak for a new passphrase that meets both rules. Both hold at key creation, after a recovery with the recovery phrase and at a passphrase change.

#### Scenario: Long passphrase without a required character
- **WHEN** the user enters a 22-character passphrase of lowercase words and spaces that matches no common pattern
- **THEN** the strength line shows the grade the meter gives it, since no character class is required any more

#### Scenario: Passphrase too short
- **WHEN** the user enters an 11-character passphrase of mixed letters, digits and punctuation
- **THEN** the strength line shows Common:PassphraseStrengthWeak

#### Scenario: All rules met
- **WHEN** the user enters a passphrase that meets every rule
- **THEN** the strength line shows the grade the meter gives it

#### Scenario: Passphrase change
- **WHEN** the new passphrase of the passphrase-change dialog fails a rule
- **THEN** its strength line shows Common:PassphraseStrengthWeak

#### Scenario: Accepted passphrase is not weak
- **WHEN** the user enters a passphrase of 12 characters that meets both rules but has few kinds of characters, such as 12 punctuation characters
- **THEN** the strength line shows Common:PassphraseStrengthFair or better, and the confirm button is enabled once the passphrase is repeated

#### Scenario: Accepted passphrase is not weak at a passphrase change
- **WHEN** such a passphrase is the new passphrase of the passphrase-change dialog
- **THEN** its strength line shows Common:PassphraseStrengthFair or better

### Requirement: The strength grade counts letters of every script
The system SHALL grade a new passphrase by the Unicode category of its characters: a letter of any script counts as a letter, an upper- or lowercase letter of a cased script as that case, a decimal digit of any script as a digit, and punctuation or a symbol of any script as punctuation. A passphrase SHALL get the grade a Latin passphrase of the same length and the same kinds of characters gets.

#### Scenario: Cyrillic lowercase
- **WHEN** the user enters a passphrase of 12, 16 or 20 lowercase Cyrillic letters that matches no common pattern
- **THEN** the strength line shows Common:PassphraseStrengthFair, Common:PassphraseStrengthFair or Common:PassphraseStrengthGood, the grades of 12, 16 or 20 lowercase Latin letters

#### Scenario: Caseless script
- **WHEN** the user enters a passphrase of 12, 16 or 20 CJK characters
- **THEN** the strength line shows Common:PassphraseStrengthFair, Common:PassphraseStrengthFair or Common:PassphraseStrengthGood, the grades of 12, 16 or 20 lowercase Latin letters

#### Scenario: Cyrillic mixed case
- **WHEN** the user enters a 20-character passphrase of upper- and lowercase Cyrillic letters and a digit that matches no common pattern
- **THEN** the strength line shows Common:PassphraseStrengthStrong, the grade of the same passphrase in Latin letters

#### Scenario: Punctuation of another script
- **WHEN** the user enters 15 lowercase Latin letters followed by a guillemet that match no common pattern
- **THEN** the strength line shows Common:PassphraseStrengthGood, the grade of the same letters followed by an exclamation mark

### Requirement: The passphrase rules tooltip leaves the dialog readable
The system SHALL show the rules a new passphrase must meet in the tooltip of the passphrase field, as the other password forms of the product do. On a wide screen the tooltip SHALL open beside the passphrase field and cover none of the texts, fields and actions of the dialog; on a narrow screen it SHALL open below the passphrase field and SHALL NOT cover the title, the hint, Common:GenerateLogoButton or the actions of the dialog.

#### Scenario: Rules shown while typing
- **WHEN** the user types in the passphrase field of the creation dialog on a wide screen
- **THEN** the rules tooltip covers neither the title, the hint, Common:GenerateLogoButton, the passphrase field with its reveal button, the confirmation field nor the actions

#### Scenario: Narrow screen
- **WHEN** the same happens in the aside presentation on a narrow screen
- **THEN** the tooltip opens below the passphrase field and covers neither the title, the hint, Common:GenerateLogoButton nor the actions; it may cover the confirmation field while the passphrase is typed

#### Scenario: Passphrase change
- **WHEN** the user types a new passphrase in the passphrase-change dialog
- **THEN** its rules tooltip opens in the same way

### Requirement: The recovery phrase input counts its words
The system SHALL show under the recovery phrase input how many words it holds out of 24 (Common:RecoveryPhraseWordCount) as the user types, and SHALL report a phrase submitted with another number of words with Common:RecoveryPhraseRequired.

#### Scenario: Count while typing
- **WHEN** the user has entered 23 words
- **THEN** the input shows 23 of 24

#### Scenario: Too few words submitted
- **WHEN** the user submits 23 words
- **THEN** Common:RecoveryPhraseRequired is shown and the phrase is not tried

#### Scenario: Extra spaces and line breaks
- **WHEN** the words are separated by several spaces or by line breaks
- **THEN** they are counted as the same words separated by single spaces

### Requirement: A word that is no recovery word is named
The system SHALL name, when a submitted recovery phrase of 24 words holds a word that no recovery phrase can hold, the first such word and its position (Common:RecoveryPhraseUnknownWord), and SHALL NOT try the phrase.

#### Scenario: Misspelled word
- **WHEN** the tenth of 24 submitted words is misspelled
- **THEN** Common:RecoveryPhraseUnknownWord names that word and the position 10

#### Scenario: All words valid, phrase wrong
- **WHEN** every word can belong to a recovery phrase and the phrase does not open the key
- **THEN** Common:InvalidRecoveryPhrase is shown

### Requirement: Recovery messages use plain words
The system SHALL word Common:InvalidRecoveryPhrase and the other messages of the recovery phrase input without the name of a word-list standard or another term of cryptography.

#### Scenario: Wrong phrase
- **WHEN** Common:InvalidRecoveryPhrase is shown
- **THEN** the text asks to check the words and their order and names no standard

### Requirement: The recovery phrase input takes no input assistance
The system SHALL ask the browser for no spelling check, no automatic correction, no automatic capital letters and no saved suggestions in the field the recovery phrase is entered into.

#### Scenario: Recovery input
- **WHEN** the recovery phrase input is shown
- **THEN** the field declares spelling check, automatic correction, automatic capital letters and saved suggestions off

### Requirement: Technical key details are folded
The system SHALL show the key id and the algorithm of a key in Keys management under a control named Common:Details that is closed when the page opens, and SHALL keep the status, the creation date and the fingerprint in view. The control SHALL be operable from the keyboard and SHALL expose whether it is open.

#### Scenario: Page opens
- **WHEN** a user with a key opens Keys management
- **THEN** the status, the creation date and the fingerprint are shown, and the key id and the algorithm are not

#### Scenario: Details opened
- **WHEN** the user activates Common:Details with a pointer, Enter or Space
- **THEN** the key id and the algorithm are shown and the control is exposed as expanded

### Requirement: The fingerprint says what it is for
The system SHALL show next to the key fingerprint in Keys management a sentence (Common:KeyFingerprintHint) saying that a colleague may ask for it to confirm a change of the user's key.

#### Scenario: Hint shown
- **WHEN** a user with a key opens Keys management
- **THEN** Common:KeyFingerprintHint is shown with the fingerprint and is read as its description

### Requirement: Key details are readable
The system SHALL show the labels of the key details in Keys management with a contrast of at least 4.5:1 against their background, and the icons of the key actions with at least 3:1, in the light and in the dark theme.

#### Scenario: Labels in the light theme
- **WHEN** a user with a key opens Keys management in the light theme
- **THEN** the labels of the key details have a contrast of at least 4.5:1

#### Scenario: Labels in the dark theme
- **WHEN** the same page is open in the dark theme
- **THEN** the labels have a contrast of at least 4.5:1

#### Scenario: Action icons
- **WHEN** the key actions are shown in either theme
- **THEN** each icon has a contrast of at least 3:1 against the card

### Requirement: Key setup is one dialog of three steps
The system SHALL run key generation in one dialog with three steps in this order: an explanation, the passphrase, the recovery phrase. The dialog SHALL show which step is open and how many there are. The rules of passphrase creation and of the recovery phrase display SHALL apply to their steps unchanged. No key SHALL be registered before the recovery phrase step is confirmed.

#### Scenario: Steps in order
- **WHEN** a user without a key starts key generation
- **THEN** one dialog opens on the explanation step, its continue action leads to the passphrase step, and a valid passphrase leads to the recovery phrase step

#### Scenario: Step shown
- **WHEN** any step of the dialog is open
- **THEN** the dialog shows the number of the step and the number of steps

#### Scenario: Nothing registered before the last step
- **WHEN** the user leaves the dialog on the explanation step or on the passphrase step
- **THEN** no key is registered

### Requirement: Key setup opens with an explanation
The system SHALL name on the first step of key setup the encryption key, the passphrase and the recovery phrase, each with one sentence on what it is for, and SHALL say that neither phrase is stored on the server. The step SHALL NOT say that the key belongs to a browser or a device.

#### Scenario: Three terms explained
- **WHEN** the explanation step is open
- **THEN** it shows Common:KeySetupKeyTitle, Common:KeySetupPassphraseTitle and Common:KeySetupRecoveryTitle, each with its description, and Common:KeySetupNotStored

#### Scenario: Key of the account
- **WHEN** the explanation step describes the encryption key
- **THEN** the text names no browser and no device

### Requirement: Key setup steps can be walked back
The system SHALL offer a way back from the passphrase step to the explanation and from the recovery phrase step to the passphrase. Going back SHALL keep the typed passphrase. While the dialog stays open the recovery phrase SHALL stay the same, and its acknowledgement SHALL be cleared every time the recovery phrase step is opened.

#### Scenario: Back from the recovery phrase
- **WHEN** the user goes back from the recovery phrase step
- **THEN** the passphrase step shows the passphrase and its confirmation as they were typed

#### Scenario: Acknowledgement cleared
- **WHEN** the user ticks the acknowledgement, goes back to the passphrase step and comes forward again
- **THEN** the same 24 words are shown, the acknowledgement is not ticked and the confirm action is unavailable

#### Scenario: Passphrase changed after going back
- **WHEN** the user goes back, changes the passphrase, comes forward and confirms
- **THEN** the key is registered under the changed passphrase

### Requirement: Discarding key setup names what is lost
The system SHALL say, when it asks to confirm closing key setup on the recovery phrase step, that the shown recovery phrase will not be valid (Common:KeySetupDiscardRecovery). On the explanation step the dialog SHALL close without a question.

#### Scenario: Closed on the recovery phrase step
- **WHEN** the user closes key setup while the recovery phrase is shown
- **THEN** the confirmation carries Common:KeySetupDiscardRecovery

#### Scenario: Closed on the explanation
- **WHEN** the user closes key setup on the explanation step
- **THEN** the dialog closes at once and no confirmation is asked

### Requirement: Key state is shown in the header of a private room
The system SHALL show in the header of a private room, and of a folder inside one, an indicator of the state of the user's key with a text, Common:KeyUnlocked or Common:KeyLocked. The state SHALL NOT be told by colour or icon alone. The indicator SHALL NOT be shown to a user without a key or while the key list is not known.

#### Scenario: Unlocked key
- **WHEN** a user with an unlocked key opens a private room
- **THEN** the header shows the indicator with Common:KeyUnlocked

#### Scenario: Key locks while the room is open
- **WHEN** the key is locked by the idle timeout or by Common:LockNow while the room is open
- **THEN** the indicator shows Common:KeyLocked without a page reload

#### Scenario: User without a key
- **WHEN** a user whose key list holds no key, or is not known, opens a private room
- **THEN** no indicator is shown

#### Scenario: Room that is not private
- **WHEN** the user opens a room that is not private
- **THEN** no indicator is shown

### Requirement: Key state indicator leads to the key actions
The system SHALL open from the indicator of an unlocked key a popover with the state, the auto-lock setting, Common:LockNow and a link to Keys management. The auto-lock setting SHALL offer the same presets as Keys management and a pick SHALL apply at once in both places. Activating the indicator of a locked key SHALL raise the unlock dialog. The indicator SHALL be operable from the keyboard.

#### Scenario: Popover of an unlocked key
- **WHEN** the user activates the indicator while the key is unlocked
- **THEN** a popover shows Common:KeyUnlocked, the auto-lock setting with Common:AutoLock5m, Common:AutoLock15m and Common:AutoLock30m, Common:LockNow and a link to Keys management

#### Scenario: Preset picked in the popover
- **WHEN** the user picks 5 minutes in the popover
- **THEN** the preset applies at once and Keys management shows 5 minutes

#### Scenario: Lock from the popover
- **WHEN** the user presses Common:LockNow in the popover
- **THEN** the key is locked as Lock now of Keys management does, and the indicator shows Common:KeyLocked

#### Scenario: Locked key
- **WHEN** the user activates the indicator while the key is locked
- **THEN** the unlock dialog is raised and no popover opens

#### Scenario: Keyboard
- **WHEN** the indicator has the keyboard focus and the user presses Enter or Space
- **THEN** it acts as on a click, and Escape closes the popover and returns the focus to the indicator

### Requirement: Lock now in the popover names the remembered device
The system SHALL say in the popover of the key state indicator, while this device is remembered, that Common:LockNow makes the device ask for the passphrase again (Common:LockNowForgetsDevice). The note SHALL NOT be shown on a device that is not remembered.

#### Scenario: Remembered device
- **WHEN** the popover opens on a remembered device
- **THEN** Common:LockNowForgetsDevice is shown next to Common:LockNow

#### Scenario: Device not remembered
- **WHEN** the popover opens on a device that is not remembered
- **THEN** the note is not shown

### Requirement: Unlock prompt speaks about files
The system SHALL say in the hint of the unlock dialog (Common:PassphraseHint) that the passphrase opens the encrypted files of private rooms. The hint SHALL NOT use the words "private key" and SHALL NOT name a device.

#### Scenario: Hint of the unlock dialog
- **WHEN** the unlock dialog opens
- **THEN** Common:PassphraseHint names the encrypted files of private rooms and neither a private key nor a device

### Requirement: Key fingerprint is shown in groups
The system SHALL show the key fingerprint in Keys management as groups of eight characters separated by spaces, the same grouping the key-change dialog uses, and SHALL let the line wrap only between groups. Where the fingerprint does not fit in one line it SHALL break into lines of four groups, and into lines of two where four do not fit.

#### Scenario: Grouped fingerprint
- **WHEN** a user with a key opens Keys management
- **THEN** the fingerprint of 64 characters is shown as eight groups of eight

#### Scenario: Narrow screen
- **WHEN** the fingerprint does not fit in one line
- **THEN** it wraps between two groups and no group is split

#### Scenario: Even lines
- **WHEN** the fingerprint takes more than one line
- **THEN** every line holds the same number of groups, four or two

#### Scenario: Same grouping as the key-change dialog
- **WHEN** a user compares the fingerprint of Keys management with the one a colleague sees in the key-change dialog
- **THEN** both are written in the same groups

### Requirement: File names stay as stored while the key is locked
The system SHALL keep the file list of a private room under the locked-key block as it is without the key: each file under its name as stored. While the key is locked the page SHALL NOT hold a decrypted file name of that room, whether readable, blurred or hidden by a style.

#### Scenario: List under the block
- **WHEN** the locked-key block is shown
- **THEN** the file list shows the names as stored and no decrypted name

#### Scenario: Key locks while the names are decrypted
- **WHEN** the key locks while the room shows decrypted names
- **THEN** the names are replaced by the names as stored, and no decrypted name is left on the page under a blur or another style

### Requirement: Key state indicator is coloured by the state
The system SHALL draw the key state indicator as a rounded pill whose colour follows the state of the key: one colour while the key is unlocked, another while it is locked. The text of the indicator SHALL have a contrast of at least 4.5:1 against the pill, and its icon at least 3:1, in the light and in the dark theme. The icon SHALL be the same in both states.

#### Scenario: Unlocked and locked differ
- **WHEN** the key is locked while a private room is open
- **THEN** the indicator changes its colour together with its text

#### Scenario: Readable in both themes
- **WHEN** the indicator is shown in either state, in the light or in the dark theme
- **THEN** its text has a contrast of at least 4.5:1 and its icon of at least 3:1 against the pill

#### Scenario: Same icon
- **WHEN** the state of the key changes
- **THEN** the icon of the indicator stays the same

### Requirement: Recovery phrase words are shown as numbered tiles
The system SHALL show each word of the recovery phrase in a tile of its own with its number, the tiles read row by row in the order of the phrase: four in a row on a wide screen and two on a phone. No word SHALL be cut or wrapped. A selection copied by hand SHALL hold the words alone, in order, without the numbers.

#### Scenario: Wide screen
- **WHEN** the recovery phrase is shown on a wide screen
- **THEN** the 24 words stand in six rows of four tiles, the first row holding the words 1 to 4

#### Scenario: Phone
- **WHEN** the recovery phrase is shown on a phone
- **THEN** the words stand two in a row, the first row holding the words 1 and 2

#### Scenario: Longest word
- **WHEN** the phrase holds a word of eight letters
- **THEN** the word is shown whole on one line of its tile

#### Scenario: Copied by hand
- **WHEN** the user selects the tiles and copies the selection
- **THEN** the clipboard holds the 24 words in order, separated by spaces, with no number

### Requirement: Recovery phrase save actions carry icons
The system SHALL show an icon before the label of each save action of the recovery phrase (Common:RecoveryKitPrint, Common:Download, Common:CopyToClipboard). The three actions SHALL keep the same weight and SHALL stand in one row where their labels fit and wrap to further rows where they do not. An icon SHALL NOT be the name of its action for assistive technology.

#### Scenario: Icons shown
- **WHEN** the recovery phrase is shown
- **THEN** each of the three save actions shows an icon and its label

#### Scenario: Long labels
- **WHEN** the labels of the three actions do not fit in one row
- **THEN** the actions wrap and no label is cut

#### Scenario: Name of an action
- **WHEN** assistive technology reads a save action
- **THEN** it reads the label and nothing for the icon

### Requirement: Key setup terms carry icons
The system SHALL show an icon before each of the three terms of the explanation step of key setup. The icons SHALL be decoration: hidden from assistive technology, with the titles and descriptions unchanged.

#### Scenario: Three icons
- **WHEN** the explanation step is open
- **THEN** Common:KeySetupKeyTitle, Common:KeySetupPassphraseTitle and Common:KeySetupRecoveryTitle each stand next to an icon

#### Scenario: Read aloud
- **WHEN** assistive technology reads the explanation step
- **THEN** it reads the three titles and their descriptions and nothing for the icons

### Requirement: The question that closes key setup names key setup
The system SHALL title the confirmation asked when key setup is closed with Common:KeySetupDiscardTitle and SHALL label its confirming action Common:KeySetupDiscardConfirm. The other key dialogs SHALL keep Common:UnsavedChanges and Common:CloseMenu.

#### Scenario: Closed on the recovery phrase step
- **WHEN** the user closes key setup while the recovery phrase is shown
- **THEN** the confirmation is titled Common:KeySetupDiscardTitle, carries Common:KeySetupDiscardRecovery and is confirmed with Common:KeySetupDiscardConfirm

#### Scenario: Closed on the passphrase step with typed input
- **WHEN** the user closes key setup on the passphrase step after typing
- **THEN** the confirmation is titled Common:KeySetupDiscardTitle and is confirmed with Common:KeySetupDiscardConfirm

#### Scenario: Passphrase change dialog
- **WHEN** the user closes the passphrase change dialog after typing
- **THEN** the confirmation is titled Common:UnsavedChanges and is confirmed with Common:CloseMenu

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
