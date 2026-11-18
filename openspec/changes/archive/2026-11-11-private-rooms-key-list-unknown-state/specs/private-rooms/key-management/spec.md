# Spec Delta

## MODIFIED Requirements

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
