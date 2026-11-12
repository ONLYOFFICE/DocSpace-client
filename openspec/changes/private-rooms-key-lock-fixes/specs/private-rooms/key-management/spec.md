# Spec Delta

## ADDED Requirements

### Requirement: Forget device locks the identity
The system SHALL lock the identity when the user forgets the device: Common:ForgetDeviceButton SHALL wipe the in-memory key and the filename cache together with the remembered record, so the next encrypted operation asks for the passphrase whether or not the identity was unlocked at that moment.

#### Scenario: Forget device while unlocked
- **WHEN** the user clicks Common:ForgetDeviceButton while the identity is unlocked in memory
- **THEN** the remembered record is removed, the identity is locked, Common:DeviceUnlockForgotten is shown, and the next encrypted operation MUST NOT run without the passphrase or a passkey

#### Scenario: Forget device while locked
- **WHEN** the user clicks Common:ForgetDeviceButton while the identity is locked
- **THEN** the remembered record is removed and Common:DeviceUnlockForgotten is shown

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
