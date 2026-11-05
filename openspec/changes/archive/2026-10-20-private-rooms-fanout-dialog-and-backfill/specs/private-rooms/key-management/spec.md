# Spec Delta

## MODIFIED Requirements

### Requirement: Key-change dialog
The system SHALL show a dialog when a peer's public key differs from its pin, stating how long the previous key was active, listing possible causes and an out-of-band verification tip, with accept and refuse actions. Concurrent mismatches SHALL wait for the open dialog and be shown one after another; requests for the same user and key SHALL share the user's one decision. The system SHALL NOT answer a request on the user's behalf.

#### Scenario: Refuse
- **WHEN** the user refuses the changed key
- **THEN** the operation that needed the peer's key fails and the pin is unchanged

#### Scenario: Second mismatch while a dialog is open
- **WHEN** another operation detects a mismatch for a different user or key while a key-change dialog is open
- **THEN** the open dialog stays unanswered until the user decides, and the second request is shown afterwards

#### Scenario: Same key asked twice
- **WHEN** several operations detect the same changed key of the same user while its dialog is open
- **THEN** one dialog is shown and the user's decision answers every waiting request for that key, with no second dialog

#### Scenario: No automatic refusal
- **WHEN** a new mismatch request arrives while a dialog is open
- **THEN** the pending request MUST NOT be resolved as refused by the arrival alone
