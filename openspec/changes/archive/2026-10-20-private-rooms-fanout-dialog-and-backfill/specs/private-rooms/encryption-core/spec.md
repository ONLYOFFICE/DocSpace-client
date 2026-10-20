# Spec Delta

## MODIFIED Requirements

### Requirement: File access list holds one wrap per member
The system SHALL store the per-member wraps in the file's access list on the server, one entry per user id. Each entry carries the user id, the public key id it was wrapped for, and the wrap blob. A wrap SHALL only be produced for a member key that passed the pin check; a batch of uploads SHALL meet a changed member key once.

#### Scenario: Upload fan-out
- **WHEN** a member uploads a file into a private room
- **THEN** the file's access list is written with a wrap for the uploader and one per room member, for that member's selected key, when the key matches its pin or was pinned on first sight; at most one entry per user

#### Scenario: Member key mismatch on upload
- **WHEN** a listed member key differs from its pin and the uploader refuses it or no resolver is registered
- **THEN** no wrap is written for that member, the file is still uploaded, and Common:EncryptedUploadNotSharedWith names the member

#### Scenario: Member key change accepted on upload
- **WHEN** a listed member key differs from its pin and the uploader accepts it in the key-change dialog
- **THEN** the new key is pinned and the wrap is written for it

#### Scenario: Batch meets one changed key
- **WHEN** several files of one upload batch finish while a member's key differs from its pin
- **THEN** the key-change dialog is shown once, the user's decision applies to every file of the batch, and a file whose fan-out started before the decision still gets the wrap when the user accepts

#### Scenario: Unanswered request is not a refusal
- **WHEN** a fan-out's key-change request is still waiting when another fan-out asks about the same key
- **THEN** the waiting request MUST NOT be counted as refused and MUST NOT be remembered as a refusal for the session
