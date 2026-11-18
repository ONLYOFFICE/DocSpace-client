# Spec Delta

## MODIFIED Requirements

### Requirement: Forgot passphrase link
The system SHALL offer a Common:ForgotPassphrase link in the unlock dialog from the moment the dialog opens, wherever the dialog has a recovery path to lead to, and SHALL keep it after a failed attempt. The link SHALL lead to the recovery-phrase flow and SHALL stand after the remember-device option, as "Remember this device" places it.

#### Scenario: Link before any attempt
- **WHEN** the unlock dialog opens and nothing has been typed
- **THEN** the Forgot passphrase link is visible and opens the recovery flow

#### Scenario: Link after failure
- **WHEN** an unlock attempt failed
- **THEN** the Forgot passphrase link is visible and opens the recovery flow

#### Scenario: Link under the remember option
- **WHEN** the unlock dialog opens with the remember-device option
- **THEN** the Forgot passphrase link follows that option and its hint in the reading and the Tab order

#### Scenario: Passphrase creation
- **WHEN** the passphrase-creation dialog is open
- **THEN** no Forgot passphrase link is shown
