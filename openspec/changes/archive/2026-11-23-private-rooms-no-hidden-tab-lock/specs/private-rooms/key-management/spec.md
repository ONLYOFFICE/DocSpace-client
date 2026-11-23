# Spec Delta

## MODIFIED Requirements

### Requirement: Auto-lock timeout presets
The system SHALL let the user pick an auto-lock timeout of 5, 15 or 30 minutes (30 by default) and SHALL NOT offer a preset longer than the 30-minute limit of the in-memory key. The identity SHALL lock after that much inactivity (mouse, keyboard, touch, a scroll of the page or of a list in it). It SHALL NOT lock because the tab is hidden, with any preset. On a remembered device auto-lock SHALL wipe the in-memory key and the filename cache but SHALL NOT delete the remembered record.

#### Scenario: Idle lock
- **WHEN** the preset is 5 minutes and the user is inactive for 5 minutes
- **THEN** the identity locks and the filename cache is cleared

#### Scenario: Tab hidden
- **WHEN** the preset is 5 or 15 minutes and the tab is hidden
- **THEN** the identity stays unlocked, and the page shows Common:KeyUnlocked when the user returns to it within the idle time

#### Scenario: Tab hidden with the default preset
- **WHEN** the preset is 30 minutes and the tab is hidden
- **THEN** the identity stays unlocked

#### Scenario: Document opened in another tab
- **WHEN** the preset is 5 minutes and the user opens a document of a private room, which opens the editor in a new tab, and returns to the file list within 5 minutes
- **THEN** the file list shows Common:KeyUnlocked and no locked-key block

#### Scenario: Idle time runs while the tab is hidden
- **WHEN** the preset is 5 minutes and the tab stays hidden for more than 5 minutes without activity in it
- **THEN** the identity of that tab is locked by the idle timeout

#### Scenario: Preset off
- **WHEN** the value stored by an earlier version is off or 60 minutes
- **THEN** the setting shows 30 minutes and the identity locks as with that preset

#### Scenario: Offered presets
- **WHEN** the user opens the auto-lock list
- **THEN** it offers Common:AutoLock5m, Common:AutoLock15m and Common:AutoLock30m, and nothing else

#### Scenario: Auto-lock on a remembered device
- **WHEN** the device is remembered and the idle timeout locks the identity
- **THEN** the next encrypted operation restores the key from the device record without a prompt, and Keys management still shows the device as remembered

#### Scenario: Scrolling a list counts as activity
- **WHEN** the preset is 5 minutes and the user does nothing but scroll the file list of a room for 6 minutes
- **THEN** the identity stays unlocked, and it locks 5 minutes after the last scroll

### Requirement: Forget device and Lock now are offered one at a time
The system SHALL offer Common:ForgetDeviceButton only while the identity is locked on a remembered device, and SHALL NOT offer it while the identity is unlocked: there Common:LockNow is the one action, and it locks the identity and forgets the device. The line Common:DeviceUnlockRememberedUntil SHALL be shown in both states.

#### Scenario: Remembered device, identity unlocked
- **WHEN** the user opens Keys management on a remembered device while the identity is unlocked
- **THEN** Common:DeviceUnlockRememberedUntil and Common:LockNow are shown, and Common:ForgetDeviceButton is not

#### Scenario: Remembered device, identity locked
- **WHEN** the identity of a remembered device is locked by the idle timeout and the user opens Keys management
- **THEN** Common:DeviceUnlockRememberedUntil and Common:ForgetDeviceButton are shown, and Common:LockNow is not

#### Scenario: Lock now on a remembered device
- **WHEN** the user clicks Common:LockNow on a remembered device
- **THEN** the identity is locked, the remembered record is removed, and the next encrypted operation MUST NOT run without the passphrase or a passkey

### Requirement: A newly picked auto-lock preset applies at once
The system SHALL apply an auto-lock preset to the unlocked identity as soon as the user picks it, in the page where it is picked and in every other open page of the same user in this browser: the idle time SHALL be counted from that moment with the new length, without a lock and a new unlock in between.

#### Scenario: Shorter preset picked while unlocked
- **WHEN** the identity was unlocked with the 30-minute preset and the user picks 5 minutes
- **THEN** the identity locks after 5 minutes of inactivity counted from the pick, and MUST NOT stay unlocked for the rest of the earlier 30 minutes

#### Scenario: Longer preset picked while unlocked
- **WHEN** the identity was unlocked with the 5-minute preset and the user picks 30 minutes
- **THEN** the identity stays unlocked through 5 minutes of inactivity

#### Scenario: Preset picked in another tab
- **WHEN** two tabs hold the key unlocked with the 30-minute preset and the user picks 5 minutes in one of them
- **THEN** the other tab shows 5 minutes, locks after 5 minutes of inactivity counted from the pick

### Requirement: A lock reaches every tab of the user
The system SHALL lock the identity in every open page of the same user in this browser, files, editor and SDK pages alike, within a second and without a reload, when Common:LockNow, Common:ForgetDeviceButton, a key deletion, a reset, a passphrase change or a logout happens in one of them. A lock by idle time or by the in-memory expiry SHALL stay with its page. An unlock SHALL NOT be shared.

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
- **THEN** neither tab locks: the hidden tab keeps the key until its idle time passes

#### Scenario: Unlock not shared
- **WHEN** the user unlocks the key in one tab while another tab is locked
- **THEN** the other tab stays locked until it is unlocked on its own
