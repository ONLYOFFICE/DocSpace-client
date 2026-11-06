## MODIFIED Requirements

### Requirement: Forgot passphrase and device setup link out to the client
The SDK SHALL NOT offer key recovery or key management itself, and SHALL offer key generation only where creating a private room needs a key; the forgot-passphrase link and the device-setup hint SHALL open the client's keys-management profile page in a new tab, and SHALL explain in place when the client page is not reachable from the host.

#### Scenario: Forgot passphrase
- **WHEN** the user clicks the forgot link in the SDK passphrase modal
- **THEN** the client's profile keys-management page opens in a new tab, its address carrying no opt-in parameter

#### Scenario: No keys on this device
- **WHEN** a user without an identity on this device enters a private room in the SDK
- **THEN** a hint pointing to the client's keys-management page is shown

#### Scenario: Client not reachable
- **WHEN** the host embeds the SDK from an origin where the client application is not available
- **THEN** the hint explains that keys are managed in the DocSpace profile (Common:EncryptionKeysManagedInProfile) instead of opening a broken link
