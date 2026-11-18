# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
