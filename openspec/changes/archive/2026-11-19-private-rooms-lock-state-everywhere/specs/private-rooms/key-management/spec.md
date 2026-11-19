# Spec Delta

## ADDED Requirements

### Requirement: Removing the key removes what this device keeps of it
The system SHALL remove from this device the remembered record and the passkey record of a key when the user deletes that key or resets all keys, in the same action that locks the identity. A record whose key is not in the user's key list SHALL be removed once that list is known, and SHALL NOT be removed on that ground while the list is not known. A remembered record past its maximum age SHALL be removed when a page loads.

#### Scenario: Key deleted on a remembered device
- **WHEN** the user deletes their key on a device that is remembered and has a passkey enrolled
- **THEN** the remembered record and the passkey record of that key are removed from this device, and when the same key is imported again later, no encrypted operation MUST run before its passphrase is entered

#### Scenario: Reset on a remembered device
- **WHEN** the user resets all keys on a device that is remembered and has a passkey enrolled, whether every deletion succeeds or some fail
- **THEN** the remembered record and the passkey record are removed from this device

#### Scenario: Key removed on another device
- **WHEN** a page loads on a device that holds a remembered record or a passkey record of a key, and the user's key list, once read, does not hold that key
- **THEN** both records of that key are removed without a prompt

#### Scenario: Key list not known
- **WHEN** the read of the user's key list fails on page load
- **THEN** no record is removed on account of the list

#### Scenario: Expired record without an unlock
- **WHEN** a page loads more than 30 days after the remembered record was written and no encrypted operation runs
- **THEN** the record is removed, and Keys management shows no Common:DeviceUnlockRememberedUntil line

### Requirement: A lock reaches every tab of the user
The system SHALL lock the identity in every open page of the same user in this browser, files, editor and SDK pages alike, within a second and without a reload, when Common:LockNow, Common:ForgetDeviceButton, a key deletion, a reset, a passphrase change or a logout happens in one of them. A lock by idle time, by a hidden tab or by the in-memory expiry SHALL stay with its page. An unlock SHALL NOT be shared.

#### Scenario: Lock now in another tab
- **WHEN** two tabs show a private room with the key unlocked and the user presses Common:LockNow in one of them
- **THEN** the other tab shows Common:KeyLocked and the locked-key block without a reload, and its next encrypted operation MUST NOT run without the passphrase or a passkey

#### Scenario: Key deleted in another tab
- **WHEN** the user deletes the key in Keys management in one tab while another tab holds it unlocked
- **THEN** the other tab locks and MUST NOT decrypt with that key afterwards

#### Scenario: Reset in another tab
- **WHEN** the user resets all keys in one tab while another tab holds the key unlocked
- **THEN** the other tab locks

#### Scenario: Passphrase changed in another tab
- **WHEN** the user changes the passphrase in one tab while another tab holds the key unlocked
- **THEN** the other tab locks

#### Scenario: Forget device in another tab
- **WHEN** one tab is locked on a remembered device, another tab holds the key unlocked, and the user presses Common:ForgetDeviceButton in the first
- **THEN** the other tab locks, and its next encrypted operation asks for the passphrase or a passkey

#### Scenario: Logout in another tab
- **WHEN** the user logs out in one tab while another tab holds the key unlocked
- **THEN** the other tab locks

#### Scenario: Editor tab
- **WHEN** an encrypted document is open in the editor in one tab and the user presses Common:LockNow in another
- **THEN** the identity of the editor tab is locked as an idle lock in that tab would lock it

#### Scenario: Idle lock stays in its tab
- **WHEN** one tab locks after the idle time while the user works in another tab of the same user
- **THEN** the tab the user works in stays unlocked

#### Scenario: Hidden-tab lock stays in its tab
- **WHEN** the preset is 5 minutes and the user switches from one tab with the key unlocked to another
- **THEN** the hidden tab locks and the tab the user switched to stays unlocked

#### Scenario: Unlock not shared
- **WHEN** the user unlocks the key in one tab while another tab is locked
- **THEN** the other tab stays locked until it is unlocked on its own

### Requirement: Other tabs read the key list again after a key change
The system SHALL read the user's key list again in every other open page of the user when a key is deleted, all keys are reset or the passphrase is changed in one page. Until that read has answered, the page SHALL treat its key list as not known, so its unlock dialog accepts only the passphrase of the envelope the server holds and Keys management shows the current key without a reload.

#### Scenario: New passphrase in the other tab
- **WHEN** the passphrase is changed in one tab and the user then unlocks in another tab
- **THEN** the new passphrase unlocks, and the old passphrase is refused with Common:InvalidPassphrase

#### Scenario: Key deleted while Keys management is open elsewhere
- **WHEN** the key is deleted in one tab while Keys management is open in another
- **THEN** the other tab shows the state without a key, with Common:GenerateNewKey, without a reload

#### Scenario: Read fails in the other tab
- **WHEN** the passphrase is changed in one tab and the read of the key list fails in another
- **THEN** the other tab treats its key list as not known, as after a failed load, and the old passphrase MUST NOT unlock there

### Requirement: The shown key state follows the key in memory
The system SHALL show the key as locked, in the header of a private room (Common:KeyLocked), in Keys management (Common:KeyLocked with Common:UnlockKey) and by the locked-key block, whenever the key is not in memory, whatever removed it: its own expiry after 30 minutes without use, a key change on the page, or a lock in another page. No page SHALL show Common:KeyUnlocked while the key is not in memory.

#### Scenario: In-memory key expires
- **WHEN** the key is unlocked and the user works for more than 30 minutes in sections that run no encrypted operation, then opens a private room
- **THEN** the header shows Common:KeyLocked, the room is handled as with a locked key, and no page showed Common:KeyUnlocked after the expiry

#### Scenario: Passphrase change with a failed list refresh
- **WHEN** the user changes the passphrase and the following read of the key list fails
- **THEN** Keys management shows Common:KeyLocked and Common:UnlockKey, and Common:LockNow is not offered

#### Scenario: Partial reset
- **WHEN** a reset leaves a key on the server because some deletions failed
- **THEN** Keys management shows that key as Common:KeyLocked and no page shows Common:KeyUnlocked

### Requirement: Concurrent requests for the key share one unlock dialog
The system SHALL show one unlock dialog when several operations ask for the locked key before the user answers, and SHALL give every waiting operation the outcome of that dialog: all continue after the unlock, all are aborted when the dialog is dismissed or the user's key becomes unavailable. No operation SHALL be left waiting after the dialog closes.

#### Scenario: Two operations wait
- **WHEN** two operations ask for the locked key before the user answers the unlock dialog, and the user unlocks
- **THEN** one dialog was shown, and both operations continue

#### Scenario: Dismissed with two operations waiting
- **WHEN** two operations wait for the unlock dialog and the user dismisses it
- **THEN** both operations are aborted and nothing is decrypted

#### Scenario: Key removed while operations wait
- **WHEN** operations wait for the unlock dialog and the user's key list changes to hold no key
- **THEN** the dialog closes and every waiting operation is aborted

### Requirement: Key setup is not closed while the key is registered
The system SHALL NOT close key setup by the cross, Escape or its cancel action while the new key is being registered, and SHALL report the outcome once: the success of a registered key or the failure of one that was not registered, never a cancellation together with either.

#### Scenario: Escape during registration
- **WHEN** the user confirms the recovery phrase step and presses Escape while the key is being registered
- **THEN** the dialog stays open as busy, and when the registration ends only Common:EncryptionKeyGenerated or the error of the registration follows

#### Scenario: Private room creation during registration
- **WHEN** key setup was opened by private room creation and the user presses Escape while the key is being registered
- **THEN** the creation is not cancelled and goes on after the key is registered, as after a registration without Escape

### Requirement: An unknown key list is not shown as no key
The system SHALL NOT show Common:NoKey or Common:NoEncryptionKey in Keys management while the user's key list is not known. While the list loads, the page SHALL show a loading state; when the load fails, it SHALL show Common:EncryptionKeysLoadFailed with Common:TryAgain and nothing that says the user has no key.

#### Scenario: List loading
- **WHEN** Keys management opens before the key list has loaded
- **THEN** a loading state is shown, and neither Common:NoKey nor Common:NoEncryptionKey

#### Scenario: List failed
- **WHEN** the read of the key list fails
- **THEN** Common:EncryptionKeysLoadFailed and Common:TryAgain are shown, and neither Common:NoKey nor Common:NoEncryptionKey

#### Scenario: List empty
- **WHEN** the key list loads and holds no key
- **THEN** Common:NoKey, Common:NoEncryptionKey and Common:GenerateNewKey are shown

## MODIFIED Requirements

### Requirement: Remember this device
The system SHALL offer a "remember this device" option in the unlock dialog where enabled; when ticked, later identity requests on this device SHALL need no prompt until the user locks or forgets the device, deletes or resets the key, or the remembered record exceeds its maximum age (30 days by default). The option SHALL explain that it outlasts auto-lock and expires. It SHALL sit directly under the passphrase field, before the dialog's other links, and SHALL NOT be ticked by default.

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

#### Scenario: Remembered until right after the unlock
- **WHEN** the user unlocks with the option ticked from Common:UnlockKey in Keys management
- **THEN** Common:DeviceUnlockRememberedUntil is shown on the page as soon as the key is unlocked, without a reload or leaving the page

### Requirement: Lock now
The system SHALL offer Common:LockNow while the identity is unlocked; it SHALL wipe the in-memory key, forget the remembered device and confirm with Common:EncryptionLocked. Besides Forget device, a key deletion, a reset and record expiry, Lock now is the only lock that removes the remembered record.

#### Scenario: Manual lock
- **WHEN** the user clicks Lock now
- **THEN** the identity is locked, the device is forgotten and the next operation prompts for the passphrase

### Requirement: Auto-lock timeout presets
The system SHALL let the user pick an auto-lock timeout of 5, 15 or 30 minutes (30 by default) and SHALL NOT offer a preset longer than the 30-minute limit of the in-memory key. The identity SHALL lock after that much inactivity (mouse, keyboard, touch, a scroll of the page or of a list in it); with the 5 or 15 minute preset it SHALL also lock once the tab is hidden. On a remembered device auto-lock SHALL wipe the in-memory key and the filename cache but SHALL NOT delete the remembered record.

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

#### Scenario: Scrolling a list counts as activity
- **WHEN** the preset is 5 minutes and the user does nothing but scroll the file list of a room for 6 minutes
- **THEN** the identity stays unlocked, and it locks 5 minutes after the last scroll

### Requirement: A newly picked auto-lock preset applies at once
The system SHALL apply an auto-lock preset to the unlocked identity as soon as the user picks it, in the page where it is picked and in every other open page of the same user in this browser: the idle time SHALL be counted from that moment with the new length, and the hidden-tab rule of the new preset SHALL hold from that moment, without a lock and a new unlock in between.

#### Scenario: Shorter preset picked while unlocked
- **WHEN** the identity was unlocked with the 30-minute preset and the user picks 5 minutes
- **THEN** the identity locks after 5 minutes of inactivity counted from the pick, and MUST NOT stay unlocked for the rest of the earlier 30 minutes

#### Scenario: Longer preset picked while unlocked
- **WHEN** the identity was unlocked with the 5-minute preset and the user picks 30 minutes
- **THEN** the identity stays unlocked through 5 minutes of inactivity and when the tab is hidden

#### Scenario: Preset picked in another tab
- **WHEN** two tabs hold the key unlocked with the 30-minute preset and the user picks 5 minutes in one of them
- **THEN** the other tab shows 5 minutes, locks after 5 minutes of inactivity counted from the pick, and locks when it is hidden

### Requirement: Reset all keys with a typed token
The system SHALL offer Common:ResetEncryptionKeysCta to a user who lost both passphrase and recovery phrase; it SHALL require typing the localized token (Common:ResetEncryptionKeysConfirmationToken, compared trimmed and case-insensitively), then read the user's key list from the server, delete every envelope it lists, unused ones included, lock the identity and refresh the list.

#### Scenario: Token mismatch
- **WHEN** the typed text does not match the token
- **THEN** the confirm button stays disabled

#### Scenario: Partial failure
- **WHEN** some key deletions fail
- **THEN** Common:ResetEncryptionKeysPartialFailure reports the count and the identity is still locked

#### Scenario: Key registered after the page opened
- **WHEN** a key was registered for the user on another device after Keys management was opened, and the user confirms a reset
- **THEN** that key is deleted together with the keys the page showed

#### Scenario: List cannot be read at confirmation
- **WHEN** the read of the key list at the confirmation of a reset fails
- **THEN** Common:ResetEncryptionKeysFailed is shown and no key is deleted
