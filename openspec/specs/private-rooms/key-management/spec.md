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
The system SHALL require a new passphrase of at least 12 characters, show a strength meter with suggestions, and SHALL refuse passphrases that match a common pattern (keyboard rows, sequences, brand names), at key creation and at a passphrase change alike.

#### Scenario: Too short
- **WHEN** the user enters an 11-character passphrase
- **THEN** the confirm button stays disabled

#### Scenario: Common pattern
- **WHEN** the user enters a passphrase built from a keyboard row or the product name
- **THEN** it is rejected as weak even if it is long enough

#### Scenario: Passphrase change
- **WHEN** the user enters a new passphrase built from a common pattern in the passphrase change dialog
- **THEN** the new passphrase field is marked invalid with Common:PassphraseCommonPattern as its error, and the change MUST NOT be submitted

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
The system SHALL prompt for the passphrase (Common:EnterPassphrase) whenever an encrypted operation needs the locked identity, SHALL accept Enter as confirmation, and SHALL report a wrong passphrase with Common:InvalidPassphrase without closing the dialog.

#### Scenario: Enter confirms
- **WHEN** the user types the passphrase and presses Enter
- **THEN** the identity is unlocked and the pending operation continues

#### Scenario: Wrong passphrase
- **WHEN** the entered passphrase does not open the envelope
- **THEN** Common:InvalidPassphrase is shown and the user can retry

#### Scenario: Cancel
- **WHEN** the user closes the dialog
- **THEN** the pending operation is aborted and nothing is decrypted

### Requirement: Forgot passphrase link
The system SHALL offer a Common:ForgotPassphrase link in the unlock dialog once an unlock attempt has failed, leading to the recovery-phrase flow.

#### Scenario: Link after failure
- **WHEN** an unlock attempt failed
- **THEN** the Forgot passphrase link is visible and opens the recovery flow

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
- **WHEN** a guest opens their profile, with the Private section available or holding a key from before they became a guest
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

### Requirement: A locked key is shown in a private room
The system SHALL show a bar (Common:PrivateRoomLockedBarTitle, Common:PrivateRoomLockedBarText) with an unlock action (Common:UnlockKey) at the top of a private room, or of a folder inside one, while the user's key is configured and locked. The action SHALL raise the unlock dialog. The bar SHALL NOT be shown while the room's own unlock request is pending, to a user without a key, or while the key list is not known.

#### Scenario: Prompt cancelled on entry
- **WHEN** a user with a locked key opens a private room and cancels the unlock dialog
- **THEN** the bar is shown above the file list with the unlock action

#### Scenario: Unlock from the bar
- **WHEN** the user presses Common:UnlockKey and enters the passphrase
- **THEN** the bar is removed and the file names are decrypted, without a page reload

#### Scenario: Unlock from the bar cancelled
- **WHEN** the user presses Common:UnlockKey and cancels the dialog
- **THEN** the bar stays

#### Scenario: Key locks while the room is open
- **WHEN** the key is locked by the idle timeout or by Common:LockNow while a private room is open
- **THEN** the bar is shown without a new prompt

#### Scenario: Remembered device
- **WHEN** a user opens a private room on a remembered device
- **THEN** the key is unlocked without a prompt and the bar is not shown at any moment

#### Scenario: Entry prompt open
- **WHEN** the unlock dialog raised on entering the room is open
- **THEN** the bar is not shown under it

#### Scenario: User without a key
- **WHEN** a user whose key list is known to hold no key, or is not known, opens a private room
- **THEN** the bar is not shown

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

### Requirement: Passphrase composition rules
The system SHALL accept a new passphrase, at key creation and at a passphrase change, only when it holds at least one Latin capital letter, one digit and one ASCII punctuation character, on top of the length and the common-pattern rules. The system SHALL NOT count a capital letter of another script as the capital letter.

#### Scenario: No capital letter
- **WHEN** the user enters a 16-character passphrase of lowercase letters, digits and punctuation
- **THEN** the confirm button stays disabled

#### Scenario: Capital letter of another script
- **WHEN** the user enters a long passphrase whose only capital letters are Cyrillic
- **THEN** the confirm button stays disabled

#### Scenario: All rules met
- **WHEN** the user enters a passphrase of 12 characters with a Latin capital letter, a digit and a punctuation character that matches no common pattern, and repeats it
- **THEN** the confirm button is enabled

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
The system SHALL raise the unlock dialog by itself once per private room that a user with a locked key enters, and SHALL NOT raise it again when the user moves between the folders of that room: after the first answer the locked-key bar is the way to unlock. Entering another private room SHALL raise the dialog again.

#### Scenario: Subfolder after a cancelled prompt
- **WHEN** a user with a locked key cancels the unlock dialog on entering a private room and then opens a folder of that room
- **THEN** no unlock dialog is raised, and the locked-key bar is shown in the folder

#### Scenario: Back to the root of the room
- **WHEN** that user returns from the folder to the root of the same room
- **THEN** no unlock dialog is raised and the bar is shown

#### Scenario: Another private room
- **WHEN** that user leaves the room and opens another private room
- **THEN** the unlock dialog is raised once for that room

### Requirement: A generated passphrase fills both fields
The system SHALL put the passphrase generated by Common:GenerateLogoButton of the passphrase-creation dialog into the passphrase field and into its confirmation. A later edit of either field SHALL be checked against the other as typed input is, and a generated passphrase SHALL pass the same strength and composition rules as a typed one before the confirm action is enabled.

#### Scenario: Generate
- **WHEN** the user presses Common:GenerateLogoButton in the passphrase-creation dialog
- **THEN** both fields hold the generated passphrase, the passphrase is readable in its field, and the confirm action is enabled without typing

#### Scenario: Generate over typed input
- **WHEN** the user has typed a passphrase and a different confirmation and presses Common:GenerateLogoButton
- **THEN** both fields hold the generated passphrase and Common:PassphraseMismatch is gone

#### Scenario: Edit after generating
- **WHEN** the user changes the passphrase field after generating
- **THEN** the confirmation is marked invalid with Common:PassphraseMismatch and the confirm action is disabled until the two match again

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
