# app-shell Specification

## Purpose

Defines the frame the web client puts around every section: the profile menu and who sees each entry, the live chat,
the About dialog, the error pages, recovery from a broken load of the client and the login app, the redirect away from
a portal name that no longer exists, how dialogs hold the keyboard focus, and how the top row and the settings list fit
the screen.

Server counterpart: none of its own; the portal settings and capabilities that switch entries on come from
`../server/openspec/specs/portal-settings` and `branding-and-licensing`. Operations called: `getPortalSettings`,
`getCompanyWhiteLabelSettings`, `getAdditionalWhiteLabelSettings`, `logout`.

Out of scope: what each linked section does (their own specs); sections by user type (`user-type-permissions`); signing
in and out and where a sign-in leads (`authentication`); the deactivated, blocked and restoring portal
(`portal-lifecycle`); keyboard shortcuts (`keyboard-and-hotkeys`); the editor's own loading recovery
(`editor-integration`); the AI chat in the top row (change `ai-chat-agents-design`).

Implementation: the profile actions store, the client's sidebar and top row, the live chat block, the About dialog,
`packages/shared/components/errors`, the error boundary, the chunk retry bootstrap of the client and login apps, and the
portal-not-found handling of `packages/shared/routes`.

## Requirements

### Requirement: The profile menu

The profile menu SHALL offer Profile, Contacts to every type but User and Guest, Settings to administrators, Billing (or
Payments on a server installation) to administrators outside Community Edition, and Spaces to administrators of a server
installation, and to them too, right below Settings, the editors' admin panel in a new tab where the backend publishes
its address. While the portal is unpaid it SHALL leave out Profile, Contacts, Settings and Billing.

#### Scenario: User's menu

- **WHEN** a User opens the profile menu
- **THEN** neither Contacts nor Settings is offered

#### Scenario: Room admin on a server installation

- **WHEN** a Room admin of a server installation opens the profile menu
- **THEN** the editors' admin panel is not offered

### Requirement: Help and session entries of the profile menu

The profile menu SHALL offer the help center, support and feature request entries the portal enables, Hotkeys and the
live chat outside phones, About where the portal shows it, and Sign out unless an embedding frame hides it.

#### Scenario: Frame without sign-out

- **WHEN** the client runs in an embedding frame configured without sign-out
- **THEN** the profile menu offers no Sign out

### Requirement: Menu entries as links

A profile menu entry that leads to a page SHALL be a link to that page's absolute address, so that a middle click or
"open in new tab" opens exactly one new tab there and leaves the current tab in place.

#### Scenario: Middle click on Contacts

- **WHEN** the Owner middle-clicks Contacts in the profile menu from a nested page
- **THEN** one new tab opens at the Contacts list and the current tab stays

### Requirement: Plugin entries in the profile menu

Entries added by plugins SHALL be placed above the chat block with a separator on either side, and more of them than
the menu keeps SHALL be folded into one submenu (`Common:MoreOptions`) in their order.

#### Scenario: Many plugin entries

- **WHEN** plugins add more entries than the menu keeps
- **THEN** the extra entries are listed in one submenu after the kept ones

### Requirement: Live chat

Where the portal has a live chat key, the profile menu SHALL offer a live chat switch that loads the chat widget when on,
hides it when off, and keeps the choice. The widget SHALL step aside from the create button and other floating buttons
while they are on screen. Without a key no live chat SHALL be offered.

#### Scenario: Switch on

- **WHEN** the user turns the live chat switch on
- **THEN** the chat widget loads and the switch stays on

### Requirement: About

The About dialog, and on a phone the About page, SHALL show the products with their versions — the AI tools marked as
beta when present — the company's details, and the legal links of the edition: terms and privacy on SaaS, the AGPL on
Community Edition, the commercial license on Enterprise Edition, leaving out a link without an address.

#### Scenario: Community Edition

- **WHEN** a user opens About on a Community Edition server
- **THEN** AGPL-3.0 is shown instead of terms and privacy links

### Requirement: Error pages

The client SHALL show dedicated pages for a missing sign-in (401), a refused access (403), a missing page (404), no
network (offline), restricted access and an invalid link. An unexpected crash SHALL show the crash page (520) with a
report that is sent automatically where error reporting is enabled.

#### Scenario: Crash

- **WHEN** a section throws while rendering
- **THEN** the crash page is shown instead of the section

### Requirement: Recovering from a broken load

When scripts or styles of the client or the login app fail to load, the page SHALL load them again, wait while the tab
is hidden or offline, and reload a bounded number of times; a crash caused by a failed chunk SHALL reload the page
instead of showing the crash page, but not again right after a reload.

#### Scenario: Network outage while loading

- **WHEN** the network drops while the client loads and comes back
- **THEN** the client finishes loading without a white screen

### Requirement: A portal name that no longer exists

When the server reports that the portal at this address does not exist, the client and the login app SHALL redirect to
the site for a wrong portal name without passing through the portal root, and SHALL NOT bounce a stale session back to
the portal. A session the API rejects, an API error or an unreachable API SHALL keep the visitor on the login form.

#### Scenario: Deleted portal

- **WHEN** a visitor opens a page of a portal that was deleted
- **THEN** the browser goes to the wrong portal name site

### Requirement: Focus in dialogs and panels

A dialog or panel SHALL take the keyboard focus when it opens, keep Tab and Shift+Tab inside it in the order of its
controls, and on Escape or Cancel give the focus back to what opened it; a panel opened from a dialog SHALL hold the focus
and hand it back to the dialog when closed.

#### Scenario: Escape

- **WHEN** a user opens a dialog from a row's context menu and presses Escape
- **THEN** the dialog closes and the row has the focus

### Requirement: Fitting the top row

The top row SHALL keep the sidebar collapse button at its trailing edge at every width, and SHALL collapse a squeezed
button rather than clip it. On a phone, Settings from the profile menu SHALL open the list of settings sections.

#### Scenario: Phone settings

- **WHEN** a DocSpace admin opens Settings from the profile menu on a phone
- **THEN** the list of settings sections is shown

### Requirement: A crowded room header

When the header of a room runs out of width — a long room name, a longer language, the info panel open — nothing SHALL
spill out of its row: the tariff line SHALL disappear rather than be cut, the AI chat button SHALL give up its label
before its neighbours are cut, a shortened share label SHALL end in an ellipsis, and the room name SHALL keep a readable
minimum.

#### Scenario: Info panel open

- **WHEN** a user opens the info panel in a room with a long name at 1280 pixels
- **THEN** every control of the header stays inside its row
