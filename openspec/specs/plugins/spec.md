# plugins Specification

## Purpose

Defines how the web client manages web plugins in Settings → Integration → Plugins, what the Plugin SDK page of
Developer Tools offers, and how a running plugin extends the client: the entries it adds to context menus, the main
button, the sidebar, the profile, the info panel and the Home page, the files and events it handles, the dialogs and
selectors it opens, and who sees each of its entries.

Server counterpart: `../server/openspec/specs/plugins` (installation-wide switches, listing, upload, package rules,
switching, stored settings, deletion, change events). Operations called: `getWebPlugins`, `getWebPlugin`,
`addWebPluginFromFile`, `updateWebPlugin`, `deleteWebPlugin`.

Out of scope: the plugin SDK package itself; the profile menu's placement of plugin entries (`app-shell`); who reaches
the settings (`user-type-permissions`).

Implementation: the plugins settings page of `categories/integration`, the Plugin SDK page of Developer Tools, the
plugin store and `packages/client/src/helpers/plugins` of the client.

## Requirements

### Requirement: The plugins page

Plugins SHALL list the portal's plugins with name, version, description and a switch, or an empty screen. Where the
installation allows uploads, a `.zip` SHALL be uploaded by button or by dropping it, reporting success, a failed load
(`PluginLoadFailed`), a failed initialization (`PluginInitFailed`) or an incompatible SDK version, and warning that a
plugin is only replaced when its version grows.

#### Scenario: Upload

- **WHEN** an administrator uploads a plugin package where uploads are allowed
- **THEN** the plugin appears in the list and success is reported

### Requirement: Switching, configuring and deleting a plugin

A plugin SHALL be switched on or off from its card; its settings dialog SHALL show the plugin's own controls, save
them and show them again on reopening; a plugin SHALL be deleted after the confirmation
(`DeletePluginDescription`). A switch made in another session SHALL turn the plugin on or off here too.

#### Scenario: Saved settings

- **WHEN** an administrator changes a plugin's settings, saves and reopens the dialog
- **THEN** the dialog shows the saved values

### Requirement: Broken plugins

A plugin that fails to load SHALL stay in the list marked with an icon whose tooltip names the cause; it SHALL be
switched off but not back on, and its settings dialog SHALL report the failure and offer deletion. A plugin whose
initialization fails SHALL be marked but stay switchable, and the mark SHALL survive switching it off and on until a
start succeeds. A broken plugin SHALL add nothing to the client.

#### Scenario: Missing package

- **WHEN** a plugin's bundle imports a package the portal does not provide
- **THEN** the plugin is listed with a load-error icon naming that package

### Requirement: Language of a plugin

A plugin's name, description and settings texts SHALL follow the user's language where the plugin translates them,
and fall back to English otherwise.

#### Scenario: Unsupported language

- **WHEN** a user whose language the plugin does not translate opens the plugins page
- **THEN** the plugin's name and description are shown in English

### Requirement: Who sees a plugin's entries

An entry of a plugin SHALL be shown only to the user types it lists and, when it lists users or groups, only to those
users and members of those groups; an empty list SHALL show it to nobody, and an entry SHALL be withheld while no user
is loaded. Entries of several plugins SHALL be ordered by plugin name, numbers compared as numbers.

#### Scenario: Outside the lists

- **WHEN** a user who is neither listed nor in a listed group opens the client
- **THEN** none of that plugin's restricted entries are shown

### Requirement: Context menu and main button entries

A plugin SHALL add entries to the context menu of the file types it names, nested under More options when it gives
children, and group actions SHALL appear only when several items are selected. It SHALL add entries, also nested, to
a More submenu of the main button.

#### Scenario: Group action

- **WHEN** a user selects several files and opens the context menu
- **THEN** the plugin's group action is offered, and it is not offered for a single file

### Requirement: Sidebar entries and plugin pages

A plugin SHALL add buttons and navigation items to the sidebars of the sections it names, open its page from an item
or by its address, mark the open item, and SHALL NOT be reachable from a section it does not appear in or by an
unknown item. Its widget SHALL sit above the navigation, one per sidebar by plugin name, and in a collapsed sidebar
open from its icon.

#### Scenario: Unknown item

- **WHEN** a user opens a plugin page address with an item key no plugin owns
- **THEN** the client navigates away from the plugin route

### Requirement: Profile entries

A plugin SHALL add entries to the profile menu, a tab to the profile after the portal's own that opens by its address
once plugins load, and rows to the profile card after the portal's own; an address of a tab no plugin owns SHALL open
the Login tab.

#### Scenario: Plugin tab by address

- **WHEN** a user opens the address of a plugin's profile tab
- **THEN** the tab opens once the plugins have loaded

### Requirement: Info panel tabs

A plugin SHALL add info panel tabs for the items and file types it names, showing its content when the tab is chosen.

#### Scenario: Image tab

- **WHEN** a user opens the info panel of a document
- **THEN** a plugin tab meant for images is not shown

### Requirement: Files and events a plugin handles

A plugin SHALL handle a click on the file types it registers instead of the client, take part in the media viewer for
the media it registers, and receive the portal events it listens to, such as file and room creation.

#### Scenario: Click on a registered file type

- **WHEN** a user clicks a PDF file that a plugin registered
- **THEN** the plugin's action runs instead of the client's

### Requirement: What a plugin can show

A plugin SHALL be able to open dialogs and a create dialog, the base, file, room, group and user selectors, an
embedded page that exchanges messages with the client, a floating progress of its operations, and toasts; to call the
portal API; and to navigate the client and open the info panel.

#### Scenario: Room selector

- **WHEN** a plugin opens the room selector and the user picks a room and submits
- **THEN** the plugin receives the room and the selector closes

### Requirement: Entries on the Home page

A plugin's navigation item with a card SHALL join the apps block of the Home page and open its page or run its own
action, and its widget SHALL be a Home page block; both SHALL follow the plugin's access lists, and a disabled plugin
SHALL add nothing.

#### Scenario: Disabled plugin

- **WHEN** an administrator switches a plugin off
- **THEN** its card and widget leave the Home page

### Requirement: The Plugin SDK page

The Plugin SDK page of Developer Tools SHALL link to the plugins settings and to the SDK documentation, and list the
sample plugins the installation ships, each with its icon, version and a link to its repository.

#### Scenario: Sample repository

- **WHEN** a user presses Go to repo on a sample plugin
- **THEN** the sample's repository opens in a new tab
