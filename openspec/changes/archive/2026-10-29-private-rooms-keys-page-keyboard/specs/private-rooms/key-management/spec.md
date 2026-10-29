# Spec Delta

## ADDED Requirements

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
- **THEN** the focus visits the auto-lock selector, the passkey toggle when it is offered, Common:ForgetDeviceButton and Common:LockNow in their displayed order

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
