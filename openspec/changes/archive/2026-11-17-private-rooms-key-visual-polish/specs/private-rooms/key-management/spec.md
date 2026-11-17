# Spec Delta

## ADDED Requirements

### Requirement: Key state indicator is coloured by the state
The system SHALL draw the key state indicator as a rounded pill whose colour follows the state of the key: one colour while the key is unlocked, another while it is locked. The text of the indicator SHALL have a contrast of at least 4.5:1 against the pill, and its icon at least 3:1, in the light and in the dark theme. The icon SHALL be the same in both states.

#### Scenario: Unlocked and locked differ
- **WHEN** the key is locked while a private room is open
- **THEN** the indicator changes its colour together with its text

#### Scenario: Readable in both themes
- **WHEN** the indicator is shown in either state, in the light or in the dark theme
- **THEN** its text has a contrast of at least 4.5:1 and its icon of at least 3:1 against the pill

#### Scenario: Same icon
- **WHEN** the state of the key changes
- **THEN** the icon of the indicator stays the same

### Requirement: Recovery phrase words are shown as numbered tiles
The system SHALL show each word of the recovery phrase in a tile of its own with its number, the tiles read row by row in the order of the phrase: four in a row on a wide screen and two on a phone. No word SHALL be cut or wrapped. A selection copied by hand SHALL hold the words alone, in order, without the numbers.

#### Scenario: Wide screen
- **WHEN** the recovery phrase is shown on a wide screen
- **THEN** the 24 words stand in six rows of four tiles, the first row holding the words 1 to 4

#### Scenario: Phone
- **WHEN** the recovery phrase is shown on a phone
- **THEN** the words stand two in a row, the first row holding the words 1 and 2

#### Scenario: Longest word
- **WHEN** the phrase holds a word of eight letters
- **THEN** the word is shown whole on one line of its tile

#### Scenario: Copied by hand
- **WHEN** the user selects the tiles and copies the selection
- **THEN** the clipboard holds the 24 words in order, separated by spaces, with no number

### Requirement: Recovery phrase save actions carry icons
The system SHALL show an icon before the label of each save action of the recovery phrase (Common:RecoveryKitPrint, Common:Download, Common:CopyToClipboard). The three actions SHALL keep the same weight and SHALL stand in one row where their labels fit and wrap to further rows where they do not. An icon SHALL NOT be the name of its action for assistive technology.

#### Scenario: Icons shown
- **WHEN** the recovery phrase is shown
- **THEN** each of the three save actions shows an icon and its label

#### Scenario: Long labels
- **WHEN** the labels of the three actions do not fit in one row
- **THEN** the actions wrap and no label is cut

#### Scenario: Name of an action
- **WHEN** assistive technology reads a save action
- **THEN** it reads the label and nothing for the icon

### Requirement: Key setup terms carry icons
The system SHALL show an icon before each of the three terms of the explanation step of key setup. The icons SHALL be decoration: hidden from assistive technology, with the titles and descriptions unchanged.

#### Scenario: Three icons
- **WHEN** the explanation step is open
- **THEN** Common:KeySetupKeyTitle, Common:KeySetupPassphraseTitle and Common:KeySetupRecoveryTitle each stand next to an icon

#### Scenario: Read aloud
- **WHEN** assistive technology reads the explanation step
- **THEN** it reads the three titles and their descriptions and nothing for the icons

### Requirement: The question that closes key setup names key setup
The system SHALL title the confirmation asked when key setup is closed with Common:KeySetupDiscardTitle and SHALL label its confirming action Common:KeySetupDiscardConfirm. The other key dialogs SHALL keep Common:UnsavedChanges and Common:CloseMenu.

#### Scenario: Closed on the recovery phrase step
- **WHEN** the user closes key setup while the recovery phrase is shown
- **THEN** the confirmation is titled Common:KeySetupDiscardTitle, carries Common:KeySetupDiscardRecovery and is confirmed with Common:KeySetupDiscardConfirm

#### Scenario: Closed on the passphrase step with typed input
- **WHEN** the user closes key setup on the passphrase step after typing
- **THEN** the confirmation is titled Common:KeySetupDiscardTitle and is confirmed with Common:KeySetupDiscardConfirm

#### Scenario: Passphrase change dialog
- **WHEN** the user closes the passphrase change dialog after typing
- **THEN** the confirmation is titled Common:UnsavedChanges and is confirmed with Common:CloseMenu

## MODIFIED Requirements

### Requirement: Key fingerprint is shown in groups
The system SHALL show the key fingerprint in Keys management as groups of eight characters separated by spaces, the same grouping the key-change dialog uses, and SHALL let the line wrap only between groups. Where the fingerprint does not fit in one line it SHALL break into lines of four groups, and into lines of two where four do not fit.

#### Scenario: Grouped fingerprint
- **WHEN** a user with a key opens Keys management
- **THEN** the fingerprint of 64 characters is shown as eight groups of eight

#### Scenario: Narrow screen
- **WHEN** the fingerprint does not fit in one line
- **THEN** it wraps between two groups and no group is split

#### Scenario: Even lines
- **WHEN** the fingerprint takes more than one line
- **THEN** every line holds the same number of groups, four or two

#### Scenario: Same grouping as the key-change dialog
- **WHEN** a user compares the fingerprint of Keys management with the one a colleague sees in the key-change dialog
- **THEN** both are written in the same groups
