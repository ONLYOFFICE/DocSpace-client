# metadata Specification

## Purpose

Defines how the web client shows and edits the structured metadata of files, folders and rooms: the Metadata
templates page of the portal settings, the Metadata tab of the info panel with its templates, values and custom
fields, applying a template to the content of a folder or a room, the metadata filter of the listings, and filling
or proposing the metadata of a file with AI.

Server counterpart: `../server/openspec/specs/metadata` and, for the AI proposal and filling,
`../server/openspec/specs/ai-agents` ("Metadata fields proposed for a file", "Metadata values filled from a file",
"The model and the failures of the metadata routes"). Operations called: `getTemplates`, `createTemplate`,
`updateTemplate`, `deleteTemplate`, `createField`, `updateField`, `deleteField`, `getFileMetadata`,
`getFolderMetadata`, `assignFileTemplates`, `assignFolderTemplates`, `unassignFileTemplate`,
`unassignFolderTemplate`, `updateFolderTemplate`, `getCascadeProgress`, `setFileValues`, `setFolderValues`,
`setFileCustomFields`, `setFolderCustomFields`, `aiMetaFill`, `aiMetaGenerate`.

Out of scope: the order and presence of the info panel tabs (`info-panel`); the other filters of the listings
(`files-navigation`); the sections of the portal settings and who reaches them (`portal-settings`); the AI settings,
models and spending limits (change `ai-chat-agents-design`); what metadata does through copy, Trash, backup and the
text search, which the server decides.

Implementation: the MetadataTemplates page of the portal settings, the Metadata view of the info panel, the
MetadataFilter of the listing filter, the MetadataAIPanel and `packages/shared/utils/metadata.ts`.

## Requirements

### Requirement: Metadata templates page

The Metadata templates page SHALL list the portal's templates with their fields count, author, last change and a
visibility switch, and SHALL let a DocSpace admin create a template, edit it, hide or show it, and delete it after a
confirmation (`Metadata:DeleteTemplateTitle`).

#### Scenario: Showing a hidden template

- **WHEN** an administrator switches the visibility of a hidden template on
- **THEN** the template is shown as visible in the list

### Requirement: Editing a template

A template SHALL need a name no other template has, ignoring case, and never `System` (`Metadata:TemplateNameReserved`),
and at least one field. A field SHALL need a name unique in the template and a type — text, number, date, single or
multiple choice — and a choice field at least one option, each option unique. Fields SHALL be reorderable; removing
fields SHALL be confirmed (`Metadata:DeleteFieldsTitle`), and Save SHALL wait for a change.

#### Scenario: Taken field name

- **WHEN** an administrator gives a new field the name of another field of the template
- **THEN** `Metadata:FieldNameExists` is shown and the field cannot be added

#### Scenario: Repeated option

- **WHEN** an administrator enters the same option twice in a choice field
- **THEN** `Metadata:OptionExists` is shown and the field cannot be added

### Requirement: Entries that have metadata

The Metadata tab SHALL exist for the portal's files, folders and rooms, and SHALL NOT exist for section roots,
third-party entries, Trash, private rooms with their content, encrypted files, and anything in the AI section.

#### Scenario: Third-party file

- **WHEN** a user selects a file of a connected third-party storage
- **THEN** the info panel offers no Metadata tab

### Requirement: Who edits metadata

Adding or removing a template, writing values and setting custom fields SHALL be offered on a file to those who may
edit it, on a folder to those who may create in it, and on a room to those who may edit the room; anyone else SHALL
see the values without these actions.

#### Scenario: Viewer of a room

- **WHEN** a Viewer opens the Metadata tab of a file in the room
- **THEN** the values are shown and no add, edit or delete action is offered

### Requirement: Metadata of an entry

The tab SHALL show the visible templates that have fields, sorted by name, then the custom fields, and an empty state
for files, folders or rooms otherwise. It SHALL re-read the metadata when the server reports a change of the entry,
and SHALL remove a template or all custom fields only after a confirmation (`Metadata:DeleteMetadataTitle`).

#### Scenario: Removing a template

- **WHEN** an editor removes a template from a file and confirms
- **THEN** the template and its values are gone from the tab

### Requirement: Adding a template and its values

Adding from a template SHALL list only visible templates with fields not yet assigned, searchable by name; without any
the admin SHALL be led to the settings and others told to ask an admin. A number SHALL be a whole number within the
safe range (`Metadata:WholeNumberError`, `Metadata:NumberOutOfRangeError`); a date SHALL keep its calendar day; only
the changed values SHALL be sent.

#### Scenario: Fractional number

- **WHEN** an editor enters 1.5 in a number field
- **THEN** `Metadata:WholeNumberError` is shown and the values cannot be saved

### Requirement: Custom fields

An editor SHALL add custom fields by name and value up to 50 per entry; a name SHALL NOT repeat another one ignoring
case, a rename SHALL NOT change only the case (`Metadata:FieldNameCaseOnly`), and a rename SHALL be written as the old
name removed and the new one set.

#### Scenario: Taken custom field name

- **WHEN** an editor adds a custom field with the name of an existing one in another case
- **THEN** `Metadata:FieldNameExists` is shown and the field cannot be saved

### Requirement: Applying a template to the content

On a folder or a room the editor SHALL be able to apply an assigned template to all items inside, choosing to skip
or overwrite existing values (skip by default), see the progress while it runs, and be told when it is done
(`Metadata:MetadataAppliedToItems`) or failed. Turning it off SHALL NOT ask for a confirmation.

#### Scenario: Overwriting existing values

- **WHEN** an editor applies a template to a room's items choosing to overwrite existing values
- **THEN** the cascade is started with the overwrite choice and its progress is shown

### Requirement: Filtering by metadata

The listing filter SHALL offer metadata outside public rooms, third-party folders, private rooms, Trash and the AI
section, when a visible template with fields exists or a metadata filter is set. Conditions SHALL use the operators
of the field type, show one chip each, drop fields and options deleted since, and stay while searching.

#### Scenario: Removing a condition

- **WHEN** a user closes the chip of one of two conditions
- **THEN** the list is filtered by the remaining condition only

#### Scenario: Deleted option in a link

- **WHEN** a user opens a link whose metadata filter names an option deleted from the template
- **THEN** the option is dropped from the filter

### Requirement: Filling metadata with AI

Where AI is enabled and its model is ready, the AI tools of a file SHALL offer filling the template fields and
proposing custom fields to a non-guest outside a public room who may edit the file's metadata and download it, when
it reads as text and is not in the archive or a room template; filling SHALL be offered only when the file has fields. The result SHALL be
reviewed, undone by field or with Ctrl+Z, and saved.

#### Scenario: Undoing a change

- **WHEN** a user presses Ctrl+Z in the review of an AI filling
- **THEN** the latest AI change is put back to the saved value

### Requirement: AI refusals

Without a model for the metadata, an admin SHALL be led to the model assignment and others asked to contact the Full
admin. A reached AI spending limit, an empty wallet or an exhausted provider SHALL be explained, and every other
refusal SHALL be reported by its cause.

#### Scenario: No model for a regular user

- **WHEN** a user who is not an admin opens the AI filling without a model assigned
- **THEN** `Metadata:AINoModelContactAdmin` is shown and no settings link is offered
