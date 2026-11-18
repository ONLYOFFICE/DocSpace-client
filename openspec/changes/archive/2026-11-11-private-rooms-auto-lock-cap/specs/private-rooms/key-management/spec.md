# Spec Delta

## MODIFIED Requirements

### Requirement: Auto-lock timeout presets
The system SHALL let the user pick an auto-lock timeout of 5, 15 or 30 minutes, 30 minutes by default, and SHALL NOT offer a preset that keeps the identity unlocked longer than the 30-minute limit of the in-memory key. The identity SHALL lock after that much inactivity (mouse, keyboard, scroll, touch); with the 5 or 15 minute preset it SHALL also lock as soon as the tab becomes hidden. On a remembered device auto-lock SHALL wipe the in-memory key and the filename cache but SHALL NOT delete the remembered record.

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
