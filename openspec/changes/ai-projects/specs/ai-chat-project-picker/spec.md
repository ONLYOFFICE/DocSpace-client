# Spec Delta

## Purpose

Brings AI projects into an AI chat that is not inside an open project: a user can apply one of their projects to the open chat, or save the chat's current setup as a new project.

## ADDED Requirements

### Requirement: Choose AI Project in the model picker
Outside an open project, the chat's model picker SHALL offer a "Choose AI Project" entry listing the caller's projects, most recently active first, up to 100. The list SHALL be read when the user signs in and again each time the chat opens. A failed read SHALL keep the last list. The entry SHALL be absent while that list is empty.

#### Scenario: User with projects
- **WHEN** a user who belongs to two projects opens the AI chat in the Rooms section
- **THEN** the model picker offers "Choose AI Project" with both projects

#### Scenario: User without projects
- **WHEN** a user who belongs to no project opens the model picker
- **THEN** no "Choose AI Project" entry is shown

#### Scenario: Project created meanwhile
- **WHEN** a project is shared with the user while the chat is closed, and the user then opens the chat
- **THEN** the new project is listed in the picker

### Requirement: Applying a project to the open chat
Picking a project SHALL read it again from the server and apply the fresh copy to the open chat without starting a new thread:
- its model;
- its available Instructions rooms as the skills rooms;
- its available Knowledge rooms as the knowledge bases.

The chat SHALL show the project's name as its title. If the re-read fails for any reason other than 404 or 403, the picker's copy SHALL be applied instead.

#### Scenario: Apply a project
- **WHEN** the user picks the "Sales" project in the model picker
- **THEN** the chat switches to the project's model, connects its Instructions and Knowledge rooms and shows "Sales" as its title

### Requirement: A gone project is not applied
A picked project that is gone (404) or no longer readable (403) SHALL NOT be applied, SHALL drop from the picker, and SHALL trigger a "project not available" notice.

#### Scenario: Project deleted meanwhile
- **WHEN** the user picks a project that was deleted after the picker loaded
- **THEN** nothing is applied, a "project not available" notice is shown and the project leaves the picker

### Requirement: Closing the chat drops the project
Closing the chat SHALL drop the applied project entirely: its title, its model (back to the default) and all of its Instructions and Knowledge rooms (see `ai-chat-sources`). Closing a chat that no project was applied to SHALL leave its model and rooms as the user set them.

#### Scenario: Chat closed
- **WHEN** the user closes the chat after applying a project and opens it again
- **THEN** the chat shows no project title, runs on the default model and has none of the project's rooms connected

#### Scenario: No project applied
- **WHEN** the user picks a model and a Knowledge room in a plain chat, closes it and opens it again
- **THEN** the chosen model and room are still there

### Requirement: Save the chat setup as a project
For users who may create projects (portal owner, DocSpace admins, room admins), the chat header SHALL offer a save action. It SHALL ask for a name, pre-filled with "New AI project", and create a project from the chat's current setup: its model, its DocSpace Instructions rooms and its DocSpace Knowledge rooms. Rooms from other clouds SHALL NOT be linked.

#### Scenario: Save
- **WHEN** a room admin with a model and two connected DocSpace rooms saves the chat as "Research"
- **THEN** a project "Research" is created with that model and those rooms, and a success toast names it

#### Scenario: Not allowed to create
- **WHEN** a User opens the chat header
- **THEN** no save action is offered

### Requirement: Save is hidden inside a project
On the AI Projects page, while a project is applied to the chat, the save action SHALL NOT be offered: the chat already is that project. Elsewhere a project applied from the picker keeps the save action, so a tweaked setup can be saved as a new project.

#### Scenario: Project applied on the projects page
- **WHEN** a project is open on the AI Projects page, or was applied from the picker on that page
- **THEN** no save action is offered

#### Scenario: Project applied in Rooms
- **WHEN** a room admin applies a project from the picker in the Rooms section and adds one more Knowledge room
- **THEN** the save action is still offered and creates a new project with the extended setup

### Requirement: Save failures and warnings
A refused create SHALL keep the save dialog open and show the server's error as a toast. Warnings the server returns with a created project SHALL be shown as toasts.

#### Scenario: Create refused
- **WHEN** the server rejects the create
- **THEN** the dialog stays open with the entered name and a toast shows the server's error
