# sdk-embedding Specification

## Purpose

Defines how the portal is embedded with the Embed SDK as the web client offers and serves it: the JavaScript SDK page
of Developer Tools (presets, preview, generated code, event log, version, allowed domains, connectors), and the
contract of the embedded frames — the modes the SDK app serves, the methods a host may call, how a frame reports a
missing or refused target, and how a frame signs in with an OAuth token.

Server counterpart: `../server/openspec/specs/portal-settings` ("Configuring the Content Security Policy", "Domains of
the Content Security Policy"). Operations called: `getCspSettings`, `configureCsp`.

Out of scope: the pages a frame shows once it has opened — rooms, personal files, forms, the media viewer, the
editor — which follow their own specs (`room-types`, `files-navigation`, `form-filling-workflow`, `media-viewer`,
`editor-integration`); private rooms in a frame (`private-rooms/sdk-surface`, `private-rooms/feature-gating`); the AI
agents and chat frames (change `ai-chat-agents-design`); who reaches Developer Tools (`webhooks-and-api-keys`); the
Embed SDK package itself, which lives in its own repository.

Implementation: the JavaScript SDK page of `packages/client/src/pages/PortalSettings/categories/developer-tools`,
`packages/sdk` (its proxy, the SDK config provider and the frame pages), and the SDK hooks of the client.

## Requirements

### Requirement: Presets

The JavaScript SDK page SHALL offer a preset for each frame mode — DocSpace, Manager, a public room, the room and file
selectors, the editor, the viewer, the media viewer and the uploader — as tiles that keep two columns on a wide screen,
shrink together between 600 and 700 pixels and stack into one below 600.

#### Scenario: Narrow screen

- **WHEN** a user opens the JavaScript SDK page in a window narrower than 600 pixels
- **THEN** the preset tiles stack into one full-width column

### Requirement: A preset page

A preset page SHALL let the user set the frame's size, the target room, folder or file, the displayed elements and
filters, preview the frame, and get the code to embed it highlighted and ready to copy, with the SDK version to load
and an event log of what the frame reports.

#### Scenario: Getting the code

- **WHEN** a user opens Get code on a preset page and copies it
- **THEN** `EmbedCodeSuccessfullyCopied` is shown

### Requirement: Allowed domains

The page SHALL list the domains allowed to embed the portal and let an administrator add several at once, separated by
spaces, skipping those already listed, and remove one; Room admins and Users SHALL see the list without changing it.
A server installation without HTTPS SHALL be warned (`CSPInfoBarHeader`).

#### Scenario: Room admin

- **WHEN** a Room admin opens the allowed domains
- **THEN** the domains are shown and cannot be added or removed

### Requirement: Connectors

The page SHALL list the connectors below the presets, split into embedding and automation, each with an icon, a
repository and three steps, and open the connector's own page where one exists, or the connectors catalog otherwise.

#### Scenario: Workflow connector

- **WHEN** a user opens a workflow connector
- **THEN** its automation instructions open

### Requirement: Methods a host may call

A frame SHALL answer a method of its mode with the method's result, a method of another mode with the wrong-mode reply,
and a failing method with its error, and SHALL ignore messages that do not come from the host window. Folder
information SHALL be returned serializable, keeping the fields hosts rely on and dropping the portal settings.

#### Scenario: Wrong mode

- **WHEN** a host calls a Manager method on a frame opened in another mode
- **THEN** the frame answers with the wrong-mode reply

### Requirement: Frame targets

A frame opened for a folder or a link SHALL report `onNotFound` when the target is missing and `onNoAccess` when it
cannot be read or a link is refused, before showing anything, and SHALL open a link with a password on the password
page.

#### Scenario: Refused link

- **WHEN** a media viewer frame is opened with a link the portal refused
- **THEN** the frame reports the refusal and shows no gallery

### Requirement: Signing in a frame with an OAuth token

A frame signed in with an OAuth token SHALL load its data in the browser, report the token as unauthorized when the
portal answers it anonymously, and sign out without touching the portal's cookie session.

#### Scenario: Rejected token

- **WHEN** the portal answers a frame's bearer token as anonymous
- **THEN** the frame reports that it is unauthorized

### Requirement: Host storage for a frame

A frame SHALL be able to read and write values kept by its host, matching parallel answers by their call, ignoring
answers of another type or source, and returning nothing when the host does not answer in time or the page is not
framed.

#### Scenario: Not framed

- **WHEN** the page reads a host value outside a frame
- **THEN** it gets nothing at once
