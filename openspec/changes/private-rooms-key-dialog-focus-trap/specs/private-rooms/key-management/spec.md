# Spec Delta

## MODIFIED Requirements

### Requirement: Tab order in key dialogs follows the visual order
The system SHALL move the focus with Tab through a key dialog's fields, links, checkboxes and actions in the order they are displayed, and backwards with Shift+Tab, without any hand-assigned order. While the dialog is open the system SHALL keep the focus inside it: Tab from the last stop moves to the first, Shift+Tab from the first moves to the last, and the page behind is never reached.

#### Scenario: Forward through the creation dialog
- **WHEN** the creation dialog has the focus in the passphrase field and the user presses Tab repeatedly
- **THEN** the focus visits the confirmation field, then the dialog's links and actions in their displayed order

#### Scenario: Backwards from the primary action
- **WHEN** the focus is on the primary action and the user presses Shift+Tab
- **THEN** the focus moves to the control displayed before it

#### Scenario: Tab from the last action wraps
- **WHEN** the focus is on the last action of a key dialog and the user presses Tab
- **THEN** the focus moves to the dialog's first stop and MUST NOT reach any control behind the dialog

#### Scenario: Shift+Tab from the first stop wraps
- **WHEN** the focus is on the first stop of a key dialog and the user presses Shift+Tab
- **THEN** the focus moves to the dialog's last action and MUST NOT reach any control behind the dialog
