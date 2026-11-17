# Spec Delta

## ADDED Requirements

### Requirement: The strength grade does not contradict the passphrase rules
The system SHALL NOT show Common:PassphraseStrengthFair, Common:PassphraseStrengthGood or Common:PassphraseStrengthStrong for a new passphrase that fails the length, the composition or the common-pattern rule, at key creation and at a passphrase change alike. Such a passphrase SHALL be graded Common:PassphraseStrengthWeak.

#### Scenario: Long passphrase without a required character
- **WHEN** the user enters a 22-character passphrase of lowercase words and spaces
- **THEN** the strength line shows Common:PassphraseStrengthWeak

#### Scenario: All rules met
- **WHEN** the user enters a passphrase that meets every rule
- **THEN** the strength line shows the grade the meter gives it

#### Scenario: Passphrase change
- **WHEN** the new passphrase of the passphrase-change dialog fails a rule
- **THEN** its strength line shows Common:PassphraseStrengthWeak

### Requirement: The list of passphrase rules leaves the dialog readable
The system SHALL show the list of rules a new passphrase must meet without covering the title of the dialog, its hint, its generate action or its fields, on wide and on narrow screens.

#### Scenario: Rules shown while typing
- **WHEN** the user types in the passphrase field of the creation dialog and the list of rules is shown
- **THEN** the hint of the dialog and Common:GenerateLogoButton stay visible and can be used

#### Scenario: Narrow screen
- **WHEN** the same happens in the aside presentation on a narrow screen
- **THEN** the list covers neither the fields nor the actions of the dialog

### Requirement: The recovery phrase input counts its words
The system SHALL show under the recovery phrase input how many words it holds out of 24 (Common:RecoveryPhraseWordCount) as the user types, and SHALL report a phrase submitted with another number of words with Common:RecoveryPhraseRequired.

#### Scenario: Count while typing
- **WHEN** the user has entered 23 words
- **THEN** the input shows 23 of 24

#### Scenario: Too few words submitted
- **WHEN** the user submits 23 words
- **THEN** Common:RecoveryPhraseRequired is shown and the phrase is not tried

#### Scenario: Extra spaces and line breaks
- **WHEN** the words are separated by several spaces or by line breaks
- **THEN** they are counted as the same words separated by single spaces

### Requirement: A word that is no recovery word is named
The system SHALL name, when a submitted recovery phrase of 24 words holds a word that no recovery phrase can hold, the first such word and its position (Common:RecoveryPhraseUnknownWord), and SHALL NOT try the phrase.

#### Scenario: Misspelled word
- **WHEN** the tenth of 24 submitted words is misspelled
- **THEN** Common:RecoveryPhraseUnknownWord names that word and the position 10

#### Scenario: All words valid, phrase wrong
- **WHEN** every word can belong to a recovery phrase and the phrase does not open the key
- **THEN** Common:InvalidRecoveryPhrase is shown

### Requirement: Recovery messages use plain words
The system SHALL word Common:InvalidRecoveryPhrase and the other messages of the recovery phrase input without the name of a word-list standard or another term of cryptography.

#### Scenario: Wrong phrase
- **WHEN** Common:InvalidRecoveryPhrase is shown
- **THEN** the text asks to check the words and their order and names no standard

### Requirement: The recovery phrase input takes no input assistance
The system SHALL ask the browser for no spelling check, no automatic correction, no automatic capital letters and no saved suggestions in the field the recovery phrase is entered into.

#### Scenario: Recovery input
- **WHEN** the recovery phrase input is shown
- **THEN** the field declares spelling check, automatic correction, automatic capital letters and saved suggestions off

### Requirement: Technical key details are folded
The system SHALL show the key id and the algorithm of a key in Keys management under a control named Common:Details that is closed when the page opens, and SHALL keep the status, the creation date and the fingerprint in view. The control SHALL be operable from the keyboard and SHALL expose whether it is open.

#### Scenario: Page opens
- **WHEN** a user with a key opens Keys management
- **THEN** the status, the creation date and the fingerprint are shown, and the key id and the algorithm are not

#### Scenario: Details opened
- **WHEN** the user activates Common:Details with a pointer, Enter or Space
- **THEN** the key id and the algorithm are shown and the control is exposed as expanded

### Requirement: The fingerprint says what it is for
The system SHALL show next to the key fingerprint in Keys management a sentence (Common:KeyFingerprintHint) saying that a colleague may ask for it to confirm a change of the user's key.

#### Scenario: Hint shown
- **WHEN** a user with a key opens Keys management
- **THEN** Common:KeyFingerprintHint is shown with the fingerprint and is read as its description

### Requirement: Key details are readable
The system SHALL show the labels of the key details in Keys management with a contrast of at least 4.5:1 against their background, and the icons of the key actions with at least 3:1, in the light and in the dark theme.

#### Scenario: Labels in the light theme
- **WHEN** a user with a key opens Keys management in the light theme
- **THEN** the labels of the key details have a contrast of at least 4.5:1

#### Scenario: Labels in the dark theme
- **WHEN** the same page is open in the dark theme
- **THEN** the labels have a contrast of at least 4.5:1

#### Scenario: Action icons
- **WHEN** the key actions are shown in either theme
- **THEN** each icon has a contrast of at least 3:1 against the card
