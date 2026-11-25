# apps Specification

## Purpose

Defines how the web client lets an administrator of a server installation switch the portal's applications (Files,
Rooms, Forms and the unreleased ones) on and off in Settings → Apps, and what a switched-off application takes away:
its sidebar section, its addresses, the room creation entries, the folder pickers' branches and the start page choice.

Server counterpart: `../server/openspec/specs/apps` (catalogue, who may write, the switch, the real-time event).
Operations called: `getAll`, `setEnabled`; the AI applications also call `getSettings` and `setSettings` while they
are installed, which belongs to the change `ai-chat-agents-design`.

Out of scope: the Private section and its application (`private-rooms/feature-gating`, `private-rooms/sidebar-section`);
the application cards of the dashboard and switching an application on from there (`dashboard`); the AI applications'
own pages and install flows (change `ai-chat-agents-design`); web plugins (`plugins`); who reaches the portal settings
at all (`user-type-permissions`).

Implementation: the apps store, the Apps settings page, the apps catalogue and the app route guard of the client.

## Requirements

### Requirement: Where applications can be switched

Settings → Apps SHALL exist only on a server installation. On SaaS every application SHALL be on whatever the server
stores, the Apps entry SHALL NOT be offered in the settings, and its address SHALL lead to the portal settings.

#### Scenario: SaaS portal

- **WHEN** an administrator of a SaaS portal opens the Apps settings address
- **THEN** the portal settings open instead and every application stays on

### Requirement: The Apps settings list

Settings → Apps (`Common:AppsSectionTitle`) SHALL list Files, Rooms and Forms with their descriptions and a switch,
plus an unreleased application only where its opt-in is set. Files SHALL be shown on and SHALL NOT be switchable. A
switch that fails SHALL report `Common:SomethingWentWrong` and keep the previous state.

#### Scenario: Switching Rooms off

- **WHEN** an administrator turns the Rooms switch off
- **THEN** the server stores the application as off and the switch shows off

#### Scenario: Files

- **WHEN** an administrator opens Settings → Apps
- **THEN** the Files switch is on and locked

### Requirement: Switches wait for the real state

Until the list of applications has arrived, and while a switch is being saved, the switches SHALL be locked; if the
list fails to load they SHALL stay locked, so that an administrator never flips a state the client only assumed.

#### Scenario: List pending

- **WHEN** Settings → Apps opens before the list of applications has arrived
- **THEN** the Rooms switch is shown but cannot be flipped

### Requirement: A switched-off application is gone

While Rooms or Forms is off, its sidebar section SHALL NOT be shown and every address of it SHALL lead to the
dashboard; an address shared by Rooms and Forms SHALL stay open while either is on.

#### Scenario: Rooms address after the switch

- **WHEN** a user opens a Rooms address while the Rooms application is off
- **THEN** the client navigates to the dashboard

### Requirement: Before the list of applications arrives

On a server installation an address of a switchable application SHALL wait for the list before it opens or leaves;
the sidebar SHALL show the sections meanwhile. If the list fails to load, every application SHALL count as on.

#### Scenario: List fails to load

- **WHEN** the list of applications answers with an error and a user opens Rooms
- **THEN** the Rooms section opens

### Requirement: What a switched-off application takes along

While Rooms is off, no entry SHALL offer to create a room from files or folders. Folder pickers SHALL NOT offer the
Rooms or Forms branch while that application is off. A start page set to a switched-off section SHALL open the home
page instead, and the start page setting SHALL NOT offer it, leaving the user's saved choice untouched.

#### Scenario: Create room from a file

- **WHEN** the Rooms application is off and a user opens a file's context menu
- **THEN** no create-room entry is offered

#### Scenario: Start page switched off

- **WHEN** a user whose start page is Rooms signs in while Rooms is off
- **THEN** the home page opens

### Requirement: A switch made elsewhere

When an administrator switches an application, every open client of the portal SHALL show or hide it without a
reload.

#### Scenario: Another administrator switches Forms off

- **WHEN** another administrator switches Forms off while a user has the client open
- **THEN** the Forms section leaves that user's client without a reload
