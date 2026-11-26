# dashboard Specification

## Purpose

Defines the Dashboard (Overview) page of the web client: the welcome header with its plan or upgrade line, the
reader's profile card, the section that creates or uploads files, the application cards, the Developer Tools and
integrations cards, the welcome dialog, and how the page adapts to the reader's type, the edition, the plan, the AI
switch and the width of the window.

Server counterpart: none of its own. The page reads the portal settings, the tariff, the user and the applications
the other capabilities load; the files it creates and uploads go through `file-operations`.

Out of scope: the Dashboard tour (`onboarding-tours`); switching applications on in the portal settings (`apps`);
the pages behind the cards — Developer Tools (`webhooks-and-api-keys`), Docs Connect (`docs-connect`), Billing
(`billing`), the private rooms section (`private-rooms/*`); the AI applications' own pages and install flows and the
AI chat (change `ai-chat-agents-design`); plugin widgets (`plugins`); renaming the portal (`portal-lifecycle`).

Implementation: the Dashboard page of `packages/client/src/pages/Dashboard` and the IntegrationsCard component.
The screenshot matrix and its axes are described in `.claude/rules/dashboard-matrix.md`.

## Requirements

### Requirement: Welcome header

The header SHALL welcome the reader to the organization. A SaaS owner or DocSpace admin SHALL see the plan line naming
Startup or Business with an offer leading to the payments page; on a Community server installation they SHALL see the
offer of the Enterprise and Developer editions instead. Nobody else SHALL see either line.

#### Scenario: Room admin on a paid SaaS portal

- **WHEN** a Room admin opens the dashboard of a portal on the Business plan
- **THEN** no plan line is shown

#### Scenario: Community administrator

- **WHEN** an administrator of a Community server installation opens the dashboard
- **THEN** the offer of the Enterprise and Developer editions is shown instead of a plan line

### Requirement: Profile card

The profile card SHALL show the reader's own name, e-mail and type, with a help icon describing the type for every type
but the owner. Only the owner and DocSpace admins SHALL get the pencil that renames the portal. A reader without a
password SHALL be offered `Common:SetPassword`, reachable with Tab and opened with Enter.

#### Scenario: User without the rename pencil

- **WHEN** a User opens the dashboard
- **THEN** the profile card shows the type with its help icon and no rename pencil

### Requirement: Creating and uploading

The create section SHALL create a document, a spreadsheet, a presentation or a PDF form in My documents, upload files
there, and offer the AI chat while AI is on. A guest SHALL see the create tiles disabled with
`Common:GuestCantCreateOrUploadTitle` and SHALL NOT be offered the AI chat.

#### Scenario: Guest

- **WHEN** a guest opens the dashboard
- **THEN** the create tiles are disabled with the guest restriction and the AI Chat action is absent

### Requirement: Application cards

The apps section SHALL offer Files, Rooms, Forms, Private rooms with a Beta badge after Forms, and AI Chat last where
the AI rooms section is served. Rooms, Forms and Private rooms SHALL offer creating to those who may create rooms and
Open to others. A switched-off application on a server installation SHALL keep a disabled card leading to the settings
only for those who may switch it on. The subtitle SHALL name the plan for a SaaS administrator only.

#### Scenario: AI off

- **WHEN** AI services are off on the portal
- **THEN** no AI Chat card is shown

#### Scenario: Switched-off application for a User

- **WHEN** a User opens the dashboard of a server installation where Private rooms are switched off
- **THEN** no card of private rooms is shown

### Requirement: Developer Tools card

The Developer Tools card SHALL be shown wherever Developer Tools are offered, a guest included, listing the REST API,
webhooks, OAuth, API keys, the Embed and Plugin SDKs and, on SaaS, Docs Connect. An entry the reader may not open SHALL
warn `Common:AdminOnlyFeature` instead of opening. Limited to admins, the card SHALL NOT be shown to other readers.

#### Scenario: Developer Tools limited to admins

- **WHEN** a User opens the dashboard while Developer Tools are limited to admins
- **THEN** neither the Developer Tools card nor the integrations card is shown

### Requirement: Integrations card

On SaaS, where Developer Tools are offered, the integrations card SHALL show the platform tiles, each opening the
steps for its platform with an offer to create the Docs Connect instance or, once one exists, to manage it. A reader
who may not manage Docs Connect SHALL see the action disabled and told why; another platform SHALL lead to the API
reference. The link to connect the editors SHALL be offered to the owner and DocSpace admins only.

#### Scenario: Room admin

- **WHEN** a Room admin opens a platform of the integrations card
- **THEN** creating the instance is disabled and the lack of permission is explained

### Requirement: Welcome dialog

The welcome dialog SHALL open only from the help button of the header and offer to start the Dashboard tour or to do
it later; it SHALL NOT open on its own, and the help button SHALL NOT be shown where no tour can run.

#### Scenario: First visit

- **WHEN** a user opens the dashboard
- **THEN** no dialog opens until the help button is pressed

### Requirement: Layout of the dashboard

The application cards SHALL fill their rows in three columns on a desktop, two on a tablet and one on a phone, and the
content SHALL keep its width whether the page scrolls or not, without flickering between the two.

#### Scenario: Phone

- **WHEN** the dashboard is opened in a window narrower than the phone breakpoint
- **THEN** the application cards stand in one column
