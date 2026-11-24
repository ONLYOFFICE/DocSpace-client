# Spec Delta

## MODIFIED Requirements

### Requirement: Recovery phrase save actions carry icons
The system SHALL show an icon before the label of each save action of the recovery phrase (Common:RecoveryKitPrint, Common:Download, Common:CopyToClipboard). The three actions SHALL keep the same weight and SHALL stand in one row where their labels fit and wrap to further rows where they do not. An icon SHALL have the colour of its label, in the light and the dark theme and while the action is disabled. An icon SHALL NOT be the name of its action for assistive technology.

#### Scenario: Icons shown
- **WHEN** the recovery phrase is shown
- **THEN** each of the three save actions shows an icon and its label

#### Scenario: Long labels
- **WHEN** the labels of the three actions do not fit in one row
- **THEN** the actions wrap and no label is cut

#### Scenario: Name of an action
- **WHEN** assistive technology reads a save action
- **THEN** it reads the label and nothing for the icon

#### Scenario: Dark theme
- **WHEN** the recovery phrase is shown in the dark theme
- **THEN** each icon has the colour of the label next to it and is as readable as the label
