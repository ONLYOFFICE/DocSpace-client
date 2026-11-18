# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
