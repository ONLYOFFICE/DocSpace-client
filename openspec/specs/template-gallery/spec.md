# template-gallery Specification

## Purpose

Defines the Template gallery of the web client: where it opens, its file type tabs, the search and the filter by
language, purpose and categories, the template details, creating a file or a form space from a template, the keyboard
inside the gallery, the error screens, and submitting a file to the gallery.

Server counterpart: none. The templates, their taxonomy and the languages come from the external templates CMS whose
address the portal settings give; a submitted file goes to the gallery's upload address. The only DocSpace call is
the download of the submitted file.

Out of scope: creating a file in a folder once its name is given (`file-operations`); the form space created from a
template and the Forms section (`form-filling-workflow`, `room-types`); the room templates of the portal
(`room-types`); the info panel of the files list (`info-panel`).

Implementation: the TemplateGallery component, the Gallery view of the info panel, the SubmitToFormGallery dialog,
the oforms store and `packages/shared/api/oforms`.

## Requirements

### Requirement: Opening the gallery

The Template gallery SHALL open from the main button and the create menu of a folder where it is available, with tabs `Common:Documents`,
`Common:Spreadsheets`, `Common:Presentations` and `Common:PDFs`. Opened from the Forms section it SHALL show the PDF
templates only, without tabs. Switching a tab SHALL reset the filter to that file type.

#### Scenario: Forms section

- **WHEN** a user opens the Template gallery from the Forms section
- **THEN** only PDF templates are shown and no tabs are offered

### Requirement: Filtering templates

The gallery SHALL search templates by name and filter them by language, by purpose and by categories of the chosen
purpose, showing only categories that have templates of the current type, sorted by name. Every condition SHALL be a
chip, and with two or more chips `Common:ClearAll` SHALL drop all but the search. A language switch SHALL keep only the
categories that language has.

#### Scenario: Clear all

- **WHEN** a user with a purpose and a category chosen clicks Clear all
- **THEN** both are dropped and the search is kept

### Requirement: Template details

The info icon of a template SHALL open its details with the preview, the description, the last update and the size,
and a link to suggest changes (`FormGallery:SuggestChanges`).

#### Scenario: Details of a template

- **WHEN** a user clicks the info icon of a template
- **THEN** the details panel of that template is shown

### Requirement: Creating from a template

Choosing a template SHALL ask for the name of a new file of its type in the folder the gallery was opened from and
then open it in the editor. Opened from the Forms section, it SHALL open the dialog of a form space built around the
template and create nothing before it is confirmed.

#### Scenario: Template in the Forms section

- **WHEN** a user presses Enter on a template in the gallery opened from the Forms section
- **THEN** the form space dialog opens and no file is created

### Requirement: Keyboard in the gallery

Arrow keys, Home and End SHALL move through the templates, Enter SHALL choose one and `i` open its details, while a
focused tab or button keeps its own keys. The hotkeys of the files list SHALL NOT act behind the gallery, and with the
filter panel open the arrows SHALL leave the templates alone. Esc SHALL close the topmost layer — the filter panel or
the submit dialog first, then the gallery; a click outside SHALL close the filter panel.

#### Scenario: Esc with the filter panel open

- **WHEN** a user presses Esc while the filter panel is open
- **THEN** the filter panel closes and the gallery stays open

### Requirement: Loading and errors

Changing the filter SHALL dim the list until the answer comes, keep only the latest answer, and load more templates on
scroll. A network failure and a refusing or incompatible CMS SHALL show the error screen with
`FormGallery:ErrorViewDescriptionNetworkError` or `FormGallery:ErrorViewDescription`, never an empty gallery.

#### Scenario: CMS of the previous contract

- **WHEN** the CMS answers in the format of its previous version
- **THEN** the error screen is shown

### Requirement: Submitting to the gallery

Every user but a guest SHALL be offered `Common:SubmitToTemplateGallery` in the gallery, where a supported file is
chosen and sent to the gallery's upload page, which then opens. A failure SHALL report `Common:SomethingWentWrong`.

#### Scenario: Guest

- **WHEN** a guest opens the Template gallery
- **THEN** no submit button is offered
