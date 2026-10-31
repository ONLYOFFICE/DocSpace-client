# Spec Delta

## Purpose

Defines the open-project view: how a project opens, the header and chat it shows, the sources column beside the chat, and how the view follows edits, deletion and leaving. What the chat does with the project's sources is in `ai-chat-sources`.

## ADDED Requirements

### Requirement: Opening a project
Opening a project from the "AI Projects" list, or through a `/ai-projects/{id}/filter?folder={id}` deep link, SHALL start a fresh thread in the section body under a header with back, the project name, its context menu, the Info panel toggle and the chat toolbar (chat history, new chat). The workspace replaces the file list of the Home page for a room of type 12; the URL keeps the room URL shape. A deep link to a project the caller cannot read SHALL show the server's error as a toast.

#### Scenario: Open from the list
- **WHEN** the user opens the "Sales" project from the list
- **THEN** the URL becomes `/ai-projects/{id}/filter?folder={id}` and a new thread of the project's chat fills the section under the project header

#### Scenario: Deep link to an unreadable project
- **WHEN** the user loads `/ai-projects/{id}/filter?folder={id}` for a project that is gone or not shared with them
- **THEN** a toast shows the server's error and no project opens

### Requirement: Fixed model
Inside a project the model picker SHALL be a read-only label for every role, showing the model the chat runs on.

#### Scenario: Member looks at the composer
- **WHEN** a Member looks at the composer inside a project
- **THEN** the project's model is shown as plain text that cannot be changed

### Requirement: Project intro
An empty project chat SHALL show, in place of the default illustration and suggestion chips: the project's logo and name, the model it chats with, and its available linked rooms as chips that open the room. After the first three rooms the rest SHALL fold into `+N`.

#### Scenario: Empty thread
- **WHEN** a project's chat has no messages
- **THEN** the intro with logo, name, model and room chips is shown and no suggestion chips appear

### Requirement: Sources column
On desktop (1024px and wider) a sources column SHALL sit beside the chat with the Instructions, Knowledge and Context cards. A card SHALL be left out when the project links no room of its type that the caller can read. While a project is open, at any width, the composer's own source chips SHALL be hidden.

#### Scenario: Project without Knowledge rooms
- **WHEN** the open project links Instructions rooms but no Knowledge room
- **THEN** the column shows the Instructions and Context cards only

#### Scenario: Only Knowledge room deleted
- **WHEN** the open project's only Knowledge room has been deleted
- **THEN** the Knowledge card is left out

### Requirement: Source card contents
Each card SHALL list its sources:
- **Instructions:** one row per linked room, expanding to its skills (name, description as tooltip).
- **Knowledge:** one row per linked room, expanding to all of its files with their vectorization state.
- **Context:** the caller's own Context folder, or an "Add room" action.

A skill or file SHALL open in the editor in a new tab. A room's name SHALL open the room in Files.

#### Scenario: Open a skill
- **WHEN** the user expands an Instructions room and clicks one of its skills
- **THEN** the skill's file opens in the editor in a new tab

#### Scenario: Files not yet indexed
- **WHEN** a linked Knowledge room holds files that are still being vectorized
- **THEN** every file of the room is listed under it, and each one shows its vectorization state

### Requirement: Sources read on expand
A room's skills or files SHALL be read from the server when its row is expanded, not refreshed live.

#### Scenario: Expand a room
- **WHEN** the user expands a room row in a source card
- **THEN** its skills or files are read once and listed; they do not change until the row is expanded again

### Requirement: Failed vectorization in the Knowledge card
A file whose vectorization failed SHALL be marked as failed in its room's list and SHALL offer "Vectorization" (retry) to a user who holds that right in the room, as in the room itself. A room with at least one failed file SHALL show a warning icon at the end of its row, with a tooltip naming the failure; the icon SHALL disappear when no failed file is left.

#### Scenario: Retry from the card
- **WHEN** a user with the Vectorization right chooses "Vectorization" on a failed file in the Knowledge card
- **THEN** the file is queued again, its state turns to in progress and the room's warning icon goes once no failed file remains

#### Scenario: No right to retry
- **WHEN** a Viewer of the room expands it in the Knowledge card
- **THEN** its failed files are marked as failed without a retry action, and the room keeps its warning icon

### Requirement: Personal Context folder
The Context card SHALL let the user connect, change or disconnect one folder as the context of their own chat rounds; while none is connected the context is the user's Files. The folder SHALL NOT be saved to the project, SHALL NOT be visible to other members, and SHALL be cleared when a project is opened or the page is left. Users who cannot edit the project SHALL see a note that each member picks their own context.

#### Scenario: Member picks a context folder
- **WHEN** a Member connects a folder in the Context card
- **THEN** their rounds use that folder as context, the card shows the "your folder only" note, and the project's settings are unchanged

#### Scenario: Reopening the project
- **WHEN** the user leaves a project with a connected Context folder and opens it again
- **THEN** the Context card is back in its "Add room" state

### Requirement: Sources on tablet and mobile
Below 1024px the sources SHALL show as a strip of tabs above the chat, one tab per shown card. Tapping a tab SHALL open its card, and tapping the open tab SHALL close it. While the chat history or the Info panel is open, the strip SHALL be hidden.

#### Scenario: Toggle a tab
- **WHEN** a mobile user taps the Knowledge tab, then taps it again
- **THEN** the Knowledge card opens on the first tap and closes on the second

### Requirement: History and Info panel share the side
On desktop the chat history and the Info panel SHALL each take the sources column's place while open, and opening one SHALL close the other.

#### Scenario: Open Info after history
- **WHEN** the history is open and the user opens the Info panel on desktop
- **THEN** the history closes and the Info panel takes its place

### Requirement: Edits reach the open chat
An edit of the open project's model or rooms, made by the caller or by someone else, SHALL reach the open chat without losing the current thread.

#### Scenario: Edited by another user
- **WHEN** a Project manager adds a Knowledge room to the project while a Member has its chat open
- **THEN** the Member's chat gains that knowledge base and keeps the current thread

### Requirement: Lost project closes the view
When the open project is deleted by someone else, or the caller loses access to it, the chat SHALL close, a toast SHALL tell the user what happened, and the URL SHALL return to `/ai-projects`. The toast SHALL say that the project was deleted when it was deleted, and that it is no longer available when the caller lost access.

#### Scenario: Deleted while open
- **WHEN** the owner deletes a project another member has open
- **THEN** that member's chat closes, a toast says the project was deleted, and they land on the list

#### Scenario: Access lost while open
- **WHEN** a member is removed from a project they have open
- **THEN** their chat closes, a toast says the project is no longer available, and they land on the list

### Requirement: Leaving a project resets the chat
Leaving a project by any route (Back, a deleted or lost project, leaving or handing over the project, navigating away from the page) SHALL reset the chat's model to the default and disconnect the project's rooms, so a chat opened elsewhere starts clean.

#### Scenario: Leaving the page
- **WHEN** the user navigates from an open project to the Rooms section and opens the AI chat there
- **THEN** the chat uses the default model and has no project rooms connected
