# Spec Delta

## ADDED Requirements

### Requirement: File rights reported to the owner of a private room
The server SHALL report on a file of a private room, to the room's owner, the file rights it computes for the room and the file's category; it SHALL deny on such a file the fill-forms, form-filling, AI, conversion, embedding and vectorization rights. In an archived private room it SHALL deny the comment, review, custom-filter, edit-history, form-gallery and open-form rights as well.

#### Scenario: Spreadsheet in an active private room
- **WHEN** the owner of an active private room lists an encrypted spreadsheet in it
- **THEN** the file reports FillForms, StartFilling, FillingStatus, ResetFilling, StopFilling, OpenForm, AskAi, Convert, Embed and Vectorization as false

#### Scenario: PDF in an active private room
- **WHEN** the owner of an active private room of the custom type lists an encrypted PDF in it
- **THEN** the file reports FillForms as false, and SubmitToFormGallery as false unless the encrypted header marks the file as a PDF form

#### Scenario: Image in an active private room
- **WHEN** the owner of an active private room lists an encrypted image in it
- **THEN** the file reports SubmitToFormGallery and OpenForm as false

#### Scenario: File in an archived private room
- **WHEN** the owner of an archived private room lists an encrypted file in it
- **THEN** the file reports Comment, Review, CustomFilter, EditHistory, SubmitToFormGallery and OpenForm as false
