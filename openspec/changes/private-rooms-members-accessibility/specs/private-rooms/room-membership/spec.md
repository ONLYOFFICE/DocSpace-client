# Spec Delta

## ADDED Requirements

### Requirement: Private-room invite panel is operable from the keyboard
The system SHALL let a user complete an invitation to a private room with the keyboard alone: the search field, the list of contacts, the role list, the removal of an invitee, sending and cancelling are reached with Tab in the order they are shown and are operated with Enter or Space. The system SHALL NOT offer in this panel an action that only a pointer can reach.

#### Scenario: Invitee removed from the keyboard
- **WHEN** the user moves the focus to the remove control of an invitee and presses Enter
- **THEN** the invitee leaves the list and the focus stays inside the panel

#### Scenario: Role chosen from the keyboard
- **WHEN** the user opens the role list of an invitee with the keyboard and picks a role with the arrow keys and Enter
- **THEN** the invitee carries that role and the role list has the focus again

### Requirement: Private-room invite panel controls have accessible names
The system SHALL give every control of the invite panel of a private room an accessible name: the search field, the role list of each invitee, the remove control of each invitee and the warning of an invitee who cannot be given access. A control that belongs to one invitee SHALL be named after that invitee.

#### Scenario: Invitee row read out
- **WHEN** assistive technology reads the row of an invitee
- **THEN** the remove control and the role list are named after the invitee, and a warning on the row is read with its text

### Requirement: Invitation result takes the focus and is announced
The system SHALL move the keyboard focus to the invitation result of a private room when it replaces the invitee list, SHALL expose it as one region named Common:EncryptedInviteResultTitle, and SHALL name each of its groups: invited, pending access, refused and skipped. The system SHALL NOT leave the focus on a control that the result replaced.

#### Scenario: Result shown
- **WHEN** the re-encryption for the invited members ends and the result is shown
- **THEN** the result has the focus and assistive technology announces its title and its groups

#### Scenario: Result with a skipped invitee
- **WHEN** the result holds an invitee who was left out
- **THEN** the reason (Common:EncryptedSkippedNoKeys or Common:EncryptedSkippedKeyMismatch) is read as part of the result

### Requirement: Re-encryption progress is announced
The system SHALL expose the re-encryption progress of a private room as a named progress indicator with its value, and SHALL announce its end once: completed, completed with files left out, or failed. The system SHALL NOT announce every step of the value.

#### Scenario: Re-encryption completes
- **WHEN** the re-encryption started by an invitation or a retry completes
- **THEN** assistive technology announces the completion once

#### Scenario: Re-encryption fails
- **WHEN** the re-encryption fails as a whole
- **THEN** Common:EncryptedReencryptFailed is announced as an alert

### Requirement: Pending access is exposed to assistive technology
The system SHALL expose Common:EncryptedAccessPending as the state of the member it is shown for, without the drawn separator, and SHALL offer the retry as a button named after the member, reachable with Tab and operated with Enter or Space. The button SHALL be exposed as busy while the retry runs and SHALL NOT start a second retry then.

#### Scenario: Retry from the keyboard
- **WHEN** a user who may change access moves the focus to the retry button of a pending member and presses Enter
- **THEN** the retry starts, the button is exposed as busy, and the focus stays on it

#### Scenario: Retry succeeds
- **WHEN** the retry leaves the member with every file key
- **THEN** the pending state is no longer exposed for that member and the focus is not lost

### Requirement: Member rows of a private room are operable from the keyboard
The system SHALL let a user who may change access open the role list of a member of a private room with the keyboard, pick a role or the removal in it, and answer the removal confirmation, with the focus returning when the confirmation closes: to the role list when the removal is declined, to the tab of the Members view when the member is removed. The role list SHALL be named after the member.

#### Scenario: Removal confirmed from the keyboard
- **WHEN** the user picks the removal in a member's role list with the keyboard and confirms it with Enter
- **THEN** the member is removed and the tab of the Members view has the focus

#### Scenario: Removal declined from the keyboard
- **WHEN** the user picks the removal with the keyboard and declines the confirmation
- **THEN** the member stays and the role list of that member has the focus again
