# Spec Delta

## ADDED Requirements

### Requirement: The mark of a missing key is a badge next to the name
The system SHALL draw the mark of a person without a key (Common:NoKey), in the people list of the invite panel of a private room, as a badge next to the person's name. The text of the badge SHALL have a contrast of at least 4.5:1 against the badge in the light and in the dark theme. The mark SHALL NOT be drawn like the note of a person already invited. A long name SHALL be shortened before the badge is.

#### Scenario: Badge next to the name
- **WHEN** the people list shows a person who has no registered key
- **THEN** Common:NoKey stands in a badge after the name, on the line of the name

#### Scenario: Readable in both themes
- **WHEN** the badge is shown in the light or in the dark theme
- **THEN** its text has a contrast of at least 4.5:1 against the badge

#### Scenario: Next to an invited person
- **WHEN** the list shows a person already invited and a person without a key
- **THEN** the mark and the note of the invited person differ in place and in colour

#### Scenario: Long name
- **WHEN** the name of a marked person does not fit in the row
- **THEN** the name is shortened and the badge is shown whole
