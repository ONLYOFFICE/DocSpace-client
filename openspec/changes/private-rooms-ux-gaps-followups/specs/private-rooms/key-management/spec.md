# Spec Delta

## MODIFIED Requirements

### Requirement: Key dialogs are accessible and adapt to narrow screens
The system SHALL present the passphrase, recovery-phrase, key-change, passphrase-change and reset dialogs as centred modals on wide screens and as aside panels on narrow screens; each dialog SHALL expose a dialog role and an accessible name, and every input and action SHALL have an accessible name, so screen readers announce them. The passphrase fields SHALL NOT be given a label of their own in this version; their placeholder is their accessible name.

#### Scenario: Mobile viewport
- **WHEN** a key dialog opens on a narrow screen
- **THEN** it renders as an aside panel with the same content and actions

#### Scenario: Screen reader
- **WHEN** a key dialog opens
- **THEN** it is announced with its title, every action has an accessible label and every input an accessible name

#### Scenario: Passphrase field
- **WHEN** the passphrase dialog opens
- **THEN** its passphrase and confirmation fields are named by their placeholders, Common:Passphrase and Common:ConfirmPassphrase, and no separate label is rendered for them
