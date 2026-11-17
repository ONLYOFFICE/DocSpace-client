# Spec Delta

## ADDED Requirements

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
The system SHALL show the key fingerprint in Keys management as groups of eight characters separated by spaces, the same grouping the key-change dialog uses, and SHALL let the line wrap only between groups.

#### Scenario: Grouped fingerprint
- **WHEN** a user with a key opens Keys management
- **THEN** the fingerprint of 64 characters is shown as eight groups of eight

#### Scenario: Narrow screen
- **WHEN** the fingerprint does not fit in one line
- **THEN** it wraps between two groups and no group is split

#### Scenario: Same grouping as the key-change dialog
- **WHEN** a user compares the fingerprint of Keys management with the one a colleague sees in the key-change dialog
- **THEN** both are written in the same groups

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

### Requirement: File names stay as stored while the key is locked
The system SHALL keep the file list of a private room under the locked-key block as it is without the key: each file under its name as stored. While the key is locked the page SHALL NOT hold a decrypted file name of that room, whether readable, blurred or hidden by a style.

#### Scenario: List under the block
- **WHEN** the locked-key block is shown
- **THEN** the file list shows the names as stored and no decrypted name

#### Scenario: Key locks while the names are decrypted
- **WHEN** the key locks while the room shows decrypted names
- **THEN** the names are replaced by the names as stored, and no decrypted name is left on the page under a blur or another style

## MODIFIED Requirements

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

## REMOVED Requirements

### Requirement: A locked key is shown in a private room
**Reason**: The bar at the top of the room is replaced by a block with a primary unlock action and the forgot-passphrase link.
**Migration**: "A locked key is reported by a block in a private room" keeps every condition of the bar, and "File names stay as stored while the key is locked" states what the list shows under it.
