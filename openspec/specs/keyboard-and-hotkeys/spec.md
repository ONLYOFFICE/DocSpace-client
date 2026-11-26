# keyboard-and-hotkeys Specification

## Purpose

Defines the keyboard of the web client's lists: when the hotkeys of the files list act, selecting and moving with the
keys, the create, upload, delete and other action hotkeys, the clipboard, the keyboard focus inside the list, reaching
every control of the page by Tab, the hotkeys of the Contacts lists and the hotkeys panel.

Server counterpart: none of its own. A hotkey runs the same action as its menu entry, which its own capability
defines.

Out of scope: what each action does (`file-operations`, `room-types`, `file-sharing`); the keys of the media viewer
(`media-viewer`), the Template gallery (`template-gallery`) and the tours (`onboarding-tours`); dialogs holding the
focus (`app-shell`); the hotkeys inside private rooms (`private-rooms/file-operations`); the AI chat (change
`ai-chat-agents-design`).

Implementation: the withHotkeys wrapper of the files list, `packages/client/src/helpers/hotkeys.ts`, the hotkey store,
the Contacts hotkeys store and the HotkeysPanel.

## Requirements

### Requirement: When list hotkeys act

The hotkeys of the files list SHALL act only while the list has loaded and no dialog, context menu or media viewer is
open, and SHALL NOT act while the user types in a text field. A key that the focused control uses — Tab, Enter or
Space on a button or link, the arrows in a widget that moves within itself, any key of a trigger whose menu is open —
SHALL stay with that control.

#### Scenario: Delete confirmation open

- **WHEN** the delete confirmation is open and the user presses an arrow key
- **THEN** the list selection does not change

### Requirement: Selecting with the keyboard

The arrows and `j`, `k`, `h`, `l` on any keyboard layout SHALL move the selection, row by row in a table and by the
grid in tiles; Shift with an arrow SHALL extend it from the caret; Ctrl or Cmd with an arrow SHALL move the caret
keeping the selection; Ctrl+A SHALL select all; Esc and Shift+N SHALL clear it keeping the caret; `x` SHALL select the
caret item; Enter SHALL open it and Backspace SHALL go up a level.

#### Scenario: Range after Esc

- **WHEN** a user presses Esc after Ctrl+A and then Shift+Down
- **THEN** the range starts at the caret

### Requirement: Action hotkeys

Where the user may create, Shift+D, Shift+S, Shift+P and Shift+O SHALL create a document, a spreadsheet, a
presentation and a PDF form, Shift+F a folder, Alt+Shift+O a form from a file, and Shift+U and Shift+I SHALL upload
files and a folder, never in Trash, Recent, Favorites, Archive, the rooms and Forms roots or for a guest. Shift+R
SHALL create a room in Rooms and Forms. Shift+C SHALL open the context menu, F2 rename, Ctrl+I ask AI, V switch the
view and Ctrl+/ open the hotkeys panel.

#### Scenario: New document

- **WHEN** a user who may create presses Shift+D in a folder, releasing either key first
- **THEN** the New document dialog opens

### Requirement: Deleting with the keyboard

Delete SHALL delete the selection after a confirmation, or at once when the confirmation is off in the settings;
in Rooms it SHALL archive the selected rooms, in Archive delete them, in Favorites remove them from favorites, and in
Recent do nothing. Esc SHALL cancel the confirmation.

#### Scenario: Cancel

- **WHEN** a user presses Delete and then Esc
- **THEN** the confirmation closes and nothing is deleted

### Requirement: Clipboard

Ctrl+C and Ctrl+X SHALL copy or cut the selection and Ctrl+V paste it into the current folder: a cut pasted into its
own folder SHALL do nothing and a copy there SHALL check for conflicts; a folder without the right to receive SHALL
ignore it. Files pasted from the system SHALL be uploaded. Ctrl+Shift+C SHALL copy the selected rows as text.

#### Scenario: Copy into the same folder

- **WHEN** a user copies a file and pastes it into the same folder
- **THEN** the conflict check runs

### Requirement: Focus in the list

The arrows SHALL move the keyboard focus to the caret row as they select. Tab SHALL go through the row's controls and
then out of the list, Shift+Tab back, and coming back SHALL land on the caret row keeping a selection of several. Tab
into the list SHALL focus and select a row; a dialog opened from a row SHALL give the focus back to it; Shift+F10 SHALL
open the focused item's menu. Rooms and tiles SHALL behave alike.

#### Scenario: Back into the list

- **WHEN** a user tabs out of the list and comes back
- **THEN** the focus lands on the caret row

### Requirement: Reaching the page by Tab

Every control a mouse uses SHALL be reachable by Tab in a visible order with a visible focus, and Shift+Tab SHALL visit
them in reverse; collapsed sidebar sections SHALL keep their links out of the order. Search, the filter panel (Enter to
open, Esc to close), an item's menu, sorting, the view switch, the sidebar collapse and the group tabs SHALL work from
the keyboard, with Esc giving the focus back.

#### Scenario: Room menu

- **WHEN** a user opens a room's menu from the keyboard and presses Esc
- **THEN** the menu closes and the focus returns to its trigger

### Requirement: Contacts hotkeys

The people and groups lists SHALL take the arrows and `j`, `k` to move the selection, Shift with an arrow to extend it
from the caret, Ctrl+A to select all, Esc and Shift+N to clear it, and Ctrl+Shift+C to copy the selected rows, which
SHALL copy nothing without a selection; Ctrl+A SHALL do nothing under an open context menu.

#### Scenario: Copy without a selection

- **WHEN** a user presses Ctrl+Shift+C in the people list with nothing selected
- **THEN** nothing is copied
