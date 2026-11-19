# Spec Delta

## ADDED Requirements

### Requirement: The strength grade counts letters of every script
The system SHALL grade a new passphrase by the Unicode category of its characters: a letter of any script counts as a letter, an upper- or lowercase letter of a cased script as that case, a decimal digit of any script as a digit, and punctuation or a symbol of any script as punctuation. A passphrase SHALL get the grade a Latin passphrase of the same length and the same kinds of characters gets.

#### Scenario: Cyrillic lowercase
- **WHEN** the user enters a passphrase of 12, 16 or 20 lowercase Cyrillic letters that matches no common pattern
- **THEN** the strength line shows Common:PassphraseStrengthFair, Common:PassphraseStrengthFair or Common:PassphraseStrengthGood, the grades of 12, 16 or 20 lowercase Latin letters

#### Scenario: Caseless script
- **WHEN** the user enters a passphrase of 12, 16 or 20 CJK characters
- **THEN** the strength line shows Common:PassphraseStrengthFair, Common:PassphraseStrengthFair or Common:PassphraseStrengthGood, the grades of 12, 16 or 20 lowercase Latin letters

#### Scenario: Cyrillic mixed case
- **WHEN** the user enters a 20-character passphrase of upper- and lowercase Cyrillic letters and a digit that matches no common pattern
- **THEN** the strength line shows Common:PassphraseStrengthStrong, the grade of the same passphrase in Latin letters

#### Scenario: Punctuation of another script
- **WHEN** the user enters 15 lowercase Latin letters followed by a guillemet that match no common pattern
- **THEN** the strength line shows Common:PassphraseStrengthGood, the grade of the same letters followed by an exclamation mark

## MODIFIED Requirements

### Requirement: Passphrase strength gate
The system SHALL require a new passphrase of at least 12 characters, show its strength as a grade, and SHALL refuse passphrases that match a common pattern (keyboard rows, sequences, brand names), at key creation, after a recovery with the recovery phrase and at a passphrase change alike. The strength line SHALL show the grade alone and SHALL NOT advise adding a capital letter, a digit or a punctuation character.

#### Scenario: Too short
- **WHEN** the user enters an 11-character passphrase
- **THEN** the confirm button stays disabled

#### Scenario: Common pattern
- **WHEN** the user enters a passphrase built from a keyboard row or the product name
- **THEN** it is rejected as weak even if it is long enough

#### Scenario: Passphrase change
- **WHEN** the user enters a new passphrase built from a common pattern in the passphrase change dialog
- **THEN** the new passphrase field is marked invalid with Common:PassphraseCommonPattern as its error, and the change MUST NOT be submitted

#### Scenario: Strength line shows a grade only
- **WHEN** the user types a new passphrase without a capital letter, a digit or a punctuation character
- **THEN** the strength line shows Common:PassphraseStrengthLabel with one grade and no advice to add a character of any kind

### Requirement: A new passphrase needs no particular characters
The system SHALL accept a new passphrase, at key creation, after a recovery with the recovery phrase and at a passphrase change, when it has at least 12 characters and matches no common pattern, in whatever script it is written, and SHALL NOT require a capital letter, a digit, a punctuation character or a Latin letter in it. The rules tooltip of the passphrase field SHALL name the length alone.

#### Scenario: Lowercase words
- **WHEN** the user enters a 22-character passphrase of lowercase words and spaces that matches no common pattern, and repeats it
- **THEN** the confirm button is enabled

#### Scenario: Passphrase change with lowercase words
- **WHEN** the user enters the current passphrase and such a passphrase twice as the new one in the passphrase-change dialog
- **THEN** the save button is enabled

#### Scenario: Common pattern still refused
- **WHEN** the user enters a passphrase of 12 or more characters built from a common pattern
- **THEN** the confirm button stays disabled

#### Scenario: Rules tooltip
- **WHEN** the rules tooltip of the passphrase field is shown
- **THEN** it names the minimum length of 12 and no rule on capital letters, digits or punctuation

#### Scenario: Passphrase in another script
- **WHEN** the user enters in the key setup dialog a passphrase of 12, 16 or 20 Cyrillic letters, or of 12, 16 or 20 CJK characters, that matches no common pattern, and repeats it
- **THEN** Common:ContinueButton is enabled and no error is shown

#### Scenario: New passphrase after a recovery in another script
- **WHEN** the user enters such a passphrase twice as the new passphrase after a recovery with the recovery phrase
- **THEN** the confirm button is enabled and no error is shown

#### Scenario: Passphrase change in another script
- **WHEN** the user enters the current passphrase and such a passphrase twice as the new one in the passphrase-change dialog
- **THEN** the save button is enabled and no error is shown

#### Scenario: Too short in another script
- **WHEN** the user enters a passphrase of 11 Cyrillic letters or of 11 CJK characters, and repeats it
- **THEN** the confirm button stays disabled

### Requirement: The strength grade does not contradict the passphrase rules
The system SHALL grade a new passphrase that fails the length or the common-pattern rule Common:PassphraseStrengthWeak and SHALL NOT show Common:PassphraseStrengthFair, Common:PassphraseStrengthGood or Common:PassphraseStrengthStrong for it. It SHALL NOT show Common:PassphraseStrengthWeak for a new passphrase that meets both rules. Both hold at key creation, after a recovery with the recovery phrase and at a passphrase change.

#### Scenario: Long passphrase without a required character
- **WHEN** the user enters a 22-character passphrase of lowercase words and spaces that matches no common pattern
- **THEN** the strength line shows the grade the meter gives it, since no character class is required any more

#### Scenario: Passphrase too short
- **WHEN** the user enters an 11-character passphrase of mixed letters, digits and punctuation
- **THEN** the strength line shows Common:PassphraseStrengthWeak

#### Scenario: All rules met
- **WHEN** the user enters a passphrase that meets every rule
- **THEN** the strength line shows the grade the meter gives it

#### Scenario: Passphrase change
- **WHEN** the new passphrase of the passphrase-change dialog fails a rule
- **THEN** its strength line shows Common:PassphraseStrengthWeak

#### Scenario: Accepted passphrase is not weak
- **WHEN** the user enters a passphrase of 12 characters that meets both rules but has few kinds of characters, such as 12 punctuation characters
- **THEN** the strength line shows Common:PassphraseStrengthFair or better, and the confirm button is enabled once the passphrase is repeated

#### Scenario: Accepted passphrase is not weak at a passphrase change
- **WHEN** such a passphrase is the new passphrase of the passphrase-change dialog
- **THEN** its strength line shows Common:PassphraseStrengthFair or better
