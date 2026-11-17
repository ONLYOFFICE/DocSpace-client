# Spec Delta

## ADDED Requirements

### Requirement: The invitation result is readable
The system SHALL show every text of the invitation result of a private room, the names, the reasons and the notes about files that could not be shared, with a contrast of at least 4.5:1 against the panel, in the light and in the dark theme. A reason SHALL NOT be shown in a smaller size than the name it belongs to.

#### Scenario: Invitee left out
- **WHEN** the result names an invitee with Common:EncryptedInviteNoKey in the light theme
- **THEN** the sentence has a contrast of at least 4.5:1 and is not smaller than the names of the result

#### Scenario: Files not shared
- **WHEN** the result shows Common:EncryptedReencryptPartialFailure under a pending invitee in the dark theme
- **THEN** the sentence has a contrast of at least 4.5:1

#### Scenario: Reasons kept in the invite form
- **WHEN** nobody was invited and the reasons are shown above the list of the invite form
- **THEN** they have a contrast of at least 4.5:1 there as well
