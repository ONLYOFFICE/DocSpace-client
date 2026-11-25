# files-settings Specification

## Purpose

Defines the file settings the web client offers: each user's switches on the File management tab of the profile,
the quick actions bar those switches govern, the portal's document templates an administrator replaces in
Customization, and the Document Server address under Integration.

Server counterpart: `../server/openspec/specs/files-settings` (personal switches, quick actions and room grouping,
conversion prompt, default templates, Document Server address). Operations called: `keepNewFileName`,
`storeOriginal`, `changeDeleteConfirm`, `setOpenEditorInSameTab`, `displayFileExtension`, `hideConfirmCancelOperation`,
`setOrganizeRoomsGrouping`, `showQuickActions`, `getDefaultTemplates`, `setDefaultTemplate`,
`uploadDefaultTemplate`, `resetDefaultTemplate`, `getDocServiceUrl`, `checkDocServiceUrl`.

Out of scope: the conversion prompt and its don't-ask-again (ile-operations); the start page choices of the same tab, which follow the applications (`apps`); what room grouping does
in the Rooms list (`room-types`); what the quick actions offer in a form room (`form-filling-workflow`); connecting
Docs Connect editors from the Document Server page (`docs-connect`); the other profile tabs (`profile`).

Implementation: the file management tab of the profile, the files settings store, the Document templates page of
Customization and the Document Server page of Integration.

## Requirements

### Requirement: Personal file settings

The File management tab SHALL let every user set, each saved at once: not asking for the name of a new file, keeping
the original when a file is converted, confirming a move to Trash, opening the editor in the same tab, showing file
extensions, hiding the notice when an operation is cancelled, grouping rooms, and showing the quick actions.

#### Scenario: Editor in the same tab

- **WHEN** a user turns on opening the editor in the same tab
- **THEN** the setting is saved and documents open in the current tab

### Requirement: The quick actions bar

The quick actions bar SHALL be hideable from the file list, with a toast that brings it back, also from the keyboard.
Hiding SHALL be saved for the user and shown by the profile toggle, which SHALL turn it back on. When the portal
refuses the change the bar SHALL come back, and a user who turned it off SHALL NOT see it.

#### Scenario: Portal refuses

- **WHEN** a user hides the quick actions bar and the portal refuses the change
- **THEN** the bar is shown again

### Requirement: Document templates

Document templates SHALL list a template for each kind of new file with a Default or Customized badge, and let an
administrator replace it with a file from the portal or from the device of the same format, preview or download a
customized one, and reset it to the default after a confirmation.

#### Scenario: Replacing from the portal

- **WHEN** an administrator replaces the document template with a file picked from the portal
- **THEN** the template is shown as Customized

#### Scenario: Reset

- **WHEN** an administrator resets a customized template and confirms
- **THEN** the template is shown as Default

### Requirement: Document Server address

The Document Server page SHALL let an administrator set the editors' address and, under the advanced settings, the
portal address the editors use and the editors' internal address; each address SHALL be cleaned of whitespace and
checked, saving and restoring the defaults SHALL report `Common:ChangesSavedSuccessfully`.

#### Scenario: Address with spaces

- **WHEN** an administrator pastes an address with spaces and a line break
- **THEN** the address is cleaned before it is checked and saved
