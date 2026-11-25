# form-filling-workflow Specification

## Purpose

Defines how the web client takes a PDF form through filling: the choices offered when a form outside a form room is
filled or shared, starting filling in a Form filling room and in a Virtual Data Room with recipients, the filling status
panel, stopping and restarting filling, the pages shown after a form is submitted or a filling is started, the report
of renamed form fields, and what the file list and the quick actions offer for forms.

Server counterpart: `../server/openspec/specs/form-filling-workflow` (filling states and actions, results, role-based
filling, the fill result) and `form-filling-room-roles`, `vdr-room-roles` (who may do what). Operations called:
`manageFormFilling`, `saveFormRoleMapping`, `getAllFormRoles`, `setFormFieldChanges`, `getFillResult`,
`checkMoveOrCopyBatchItems`, `copyBatchItems`, `copyFileAs`; the editor saves a copy into a room through the file
handler, which has no operationId.

Out of scope: the settings of a Form filling room — results spreadsheet and database export (`room-types`); form links
and their Filling access (`shared-links`); opening the editor in general (`editor-integration`); the form template
gallery (`template-gallery`); encrypted forms (`private-rooms/editor-integration`).

Implementation: the file context options of the client, the fill, share-form, assign-roles, role-mapping, filling
status and stop-filling dialogs, and in `packages/doceditor` the start-filling and completed-form pages and the form
field changes hook.

## Requirements

### Requirement: Filling a form outside a form room

Choosing Fill for a PDF form that is not in a Form filling room and that the user may copy SHALL offer three ways: fill
it out oneself in the editor, collect its data in a Form filling room, or fill it by recipients in a Virtual Data Room.
A form inside a Form filling room, or one the user may not copy, SHALL open in the editor for filling at once.

#### Scenario: Form in My documents

- **WHEN** a User chooses Fill for a PDF form in My documents
- **THEN** a dialog offers filling it out oneself, form data collection and recipient-based filling

### Requirement: Sharing a form to collect its data

Choosing form data collection or recipient-based filling SHALL open a selector of rooms of that type, which can also
create one, and copy the form there with `Common:CopyHere`; from the file list a name already taken SHALL be resolved
first. A copy in a Form filling room SHALL start filling at once; a copy in a Virtual Data Room SHALL offer assigning
recipients. In the editor the same choices, plus quick sharing with portal users, come from its share-to-fill-out request.

#### Scenario: Copy to a new Form filling room

- **WHEN** the user chooses form data collection and creates a new Form filling room in the selector
- **THEN** the form is copied into the new room

### Requirement: Starting filling in a Form filling room

A form whose `security.StartFilling` is true SHALL offer Start filling. Started from the list, filling SHALL begin and a
dialog SHALL offer to copy the form's public link (`Common:CopyPublicLink`), with Later and Don't show again. Started
from the editor, the client SHALL first report renamed fields, then disconnect co-editors and return to the room in
Forms.

#### Scenario: Start from the list

- **WHEN** a Room manager chooses Start filling for a form in a Form filling room
- **THEN** filling starts and the dialog offers to copy the public link

### Requirement: Starting filling by recipients

In a Virtual Data Room, Start filling SHALL open the form in the editor with the recipients panel, where each recipient
role of the form is assigned to a person, people can be added to the room, and Start begins the filling. On a phone it
SHALL say that starting is not available (`Common:MobileStartFillingPdfNotAvailableInfo`). Assigning the recipients of a
copied form SHALL be possible now or later (`Common:Later`).

#### Scenario: Start on a phone

- **WHEN** a Room manager chooses Start filling for a form of a Virtual Data Room on a phone
- **THEN** a message says starting is not available on mobile

### Requirement: Filling status panel

A form whose `security.FillingStatus` is true SHALL offer its filling status: the form's state and the progress of each
recipient. When it is the user's turn the panel SHALL offer Fill and, with `StopFilling`, Stop filling; when filling is
stopped, Reset and start filling with `ResetFilling` and Delete with `Delete`; while in progress, Stop filling with
`StopFilling`; nothing once completed.

#### Scenario: Stopped form

- **WHEN** a Room manager opens the filling status of a stopped form
- **THEN** the panel offers Reset and start filling and Delete

### Requirement: Stopping and restarting filling

Stop filling SHALL ask for confirmation (`Common:StopFillingTitle`) before it stops the filling. Reset and start filling
SHALL restart the form's filling with the recipients cleared, keeping the form out of other actions while it runs.

#### Scenario: Stop

- **WHEN** a Room manager confirms Stop filling
- **THEN** the filling stops and the form shows the stopped state

### Requirement: Form actions in the file list

The file list SHALL offer Start filling, Reset and start filling, Stop filling and Filling status only by the form's
`StartFilling`, `ResetFilling`, `StopFilling` and `FillingStatus` rights, editing a PDF form only while its filling has
not started, and turning an old-format form into a PDF form only to those who may duplicate it. It SHALL mark a form's
filling state and a saved draft with badges.

#### Scenario: Started form

- **WHEN** a Room manager opens the menu of a form whose filling has started
- **THEN** editing the form is not offered

### Requirement: Only PDF forms in a Form filling room

The quick actions of a Form filling room and of its folders SHALL offer only a blank PDF form, whether the room is opened
from Forms or from Rooms.

#### Scenario: Room opened from Rooms

- **WHEN** a Room manager opens a Form filling room under the Rooms address
- **THEN** the quick actions offer the PDF form and no document, spreadsheet or presentation

### Requirement: After a form is submitted

Submitting a form SHALL open the completed form page: a success title, a text for a registered user or an anonymous
visitor, the form number and owner. An anonymous visitor SHALL be offered downloading the form; a member SHALL be offered
copying its link, the ready forms, going back to the room outside the SDK, and filling it out again. Without a fill
result the page SHALL show its empty state.

#### Scenario: Missing fill result

- **WHEN** the completed form page gets an answer without a fill result
- **THEN** the empty state is shown and no error occurs

### Requirement: Recipient pages of a Virtual Data Room

After a recipient starts or completes their part in a Virtual Data Room, the page SHALL say whether it is the
recipient's turn, whether the next recipient was notified, or that the form is finalized, and SHALL offer filling the
form, copying its link or going to the room accordingly. Without access it SHALL show its empty state.

#### Scenario: Filling started

- **WHEN** a Room manager starts filling and is the first recipient
- **THEN** the page confirms the start and offers to fill out the form

### Requirement: Report of renamed form fields

While the original form of a Form filling room is edited, outside the Community Edition editors, the client SHALL
report renamed fields to the server: each
rename once, an undone rename as an empty report, fields without an id or sharing a key left out. A failed report SHALL
be retried with a growing wait, a refused one SHALL end reporting for the session, and a pending report SHALL be sent as
the editor is left.

#### Scenario: Rename then close

- **WHEN** an editor renames a field and closes the editor at once
- **THEN** the rename reaches the server once
