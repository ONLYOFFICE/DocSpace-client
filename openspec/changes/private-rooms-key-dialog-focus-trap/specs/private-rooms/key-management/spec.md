# Spec Delta

## REMOVED Requirements

### Requirement: Tab order in key dialogs follows the visual order
**Reason**: Its "SHALL NOT trap the focus inside the dialog in this version" no longer holds: every dialog of the product keeps the focus inside while it is open, the key dialogs included, and the "No trap" scenario has no place in a requirement that traps it.
**Migration**: Replaced by "Tab in key dialogs follows the visual order and stays inside the dialog", which keeps the visual order and both of its scenarios and replaces "No trap" with the wrap in both directions.

## ADDED Requirements

### Requirement: Tab in key dialogs follows the visual order and stays inside the dialog
The system SHALL move the focus with Tab through a key dialog's fields, links, checkboxes and actions in the order they are displayed, and backwards with Shift+Tab, without any hand-assigned order, and SHALL keep the focus inside the dialog while it is open: Tab from its last control goes to its first, Shift+Tab from its first control to its last, and the page behind the dialog is not reached.

#### Scenario: Forward through the creation dialog
- **WHEN** the creation dialog has the focus in the passphrase field and the user presses Tab repeatedly
- **THEN** the focus visits the confirmation field, then the dialog's links and actions in their displayed order

#### Scenario: Backwards from the primary action
- **WHEN** the focus is on the primary action and the user presses Shift+Tab
- **THEN** the focus moves to the control displayed before it

#### Scenario: Tab wraps from the last control
- **WHEN** the focus is on the last control of a key dialog and the user presses Tab
- **THEN** the focus moves to the dialog's first control and stays inside the dialog

#### Scenario: Shift+Tab wraps from the first control
- **WHEN** the focus is on the first control of a key dialog and the user presses Shift+Tab
- **THEN** the focus moves to the dialog's last control and stays inside the dialog

#### Scenario: A confirmation over a key dialog holds the focus
- **WHEN** the unsaved-changes confirmation is open over the creation dialog and the user presses Tab repeatedly
- **THEN** the focus moves only among the confirmation's controls, reaching neither the creation dialog below it nor the page
