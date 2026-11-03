# Spec Delta

## MODIFIED Requirements

### Requirement: Remember this device
The system SHALL offer a "remember this device" option in the unlock dialog where enabled; when ticked, later identity requests on this device SHALL be served without a prompt until the user locks or forgets the device or the remembered record exceeds its maximum age (30 days by default). The option SHALL explain that it survives auto-lock and expires.

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

### Requirement: Auto-lock timeout presets
The system SHALL let the user pick an auto-lock timeout from off, 5, 15, 30 or 60 minutes. With a non-zero timeout the identity SHALL lock after that much inactivity (mouse, keyboard, scroll, touch) and also as soon as the tab becomes hidden. On a remembered device auto-lock SHALL wipe the in-memory key and the filename cache but SHALL NOT delete the remembered record.

#### Scenario: Idle lock
- **WHEN** the preset is 5 minutes and the user is inactive for 5 minutes
- **THEN** the identity locks and the filename cache is cleared

#### Scenario: Tab hidden
- **WHEN** the preset is non-zero and the tab is hidden
- **THEN** the identity locks immediately

#### Scenario: Preset off
- **WHEN** the preset is off
- **THEN** neither inactivity nor a hidden tab locks the identity

#### Scenario: Auto-lock on a remembered device
- **WHEN** the device is remembered and the idle timeout or a hidden tab locks the identity
- **THEN** the next encrypted operation restores the key from the device record without a prompt, and Keys management still shows the device as remembered

### Requirement: Lock now
The system SHALL offer Common:LockNow while the identity is unlocked; it SHALL wipe the in-memory key, forget the remembered device and confirm with Common:EncryptionLocked. Besides Forget device and record expiry, Lock now is the only lock that removes the remembered record.

#### Scenario: Manual lock
- **WHEN** the user clicks Lock now
- **THEN** the identity is locked, the device is forgotten and the next operation prompts for the passphrase
