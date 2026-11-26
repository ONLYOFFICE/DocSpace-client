# webhooks-and-api-keys Specification

## Purpose

Defines the Developer Tools section of the web client as a whole — who is offered it, who may open it and what its
overview leads to — and its Webhooks and API keys pages: creating and managing webhooks, their delivery history and
event details, and creating and managing API keys.

Server counterpart: `../server/openspec/specs/webhooks-and-api-keys` (Developer Tools access rule, webhook
configurations, triggers, delivery journal, retries, API keys and their permissions). Operations called:
`getTenantWebhooks`, `createWebhook`, `updateWebhook`, `enableWebhook`, `removeWebhook`, `getWebhookTriggers`,
`getWebhooksLogs`, `retryWebhook`, `retryWebhooks`, `getApiKeys`, `createApiKey`, `updateApiKey`, `deleteApiKey`,
`getAllPermissions`.

Out of scope: the Developer Tools access setting itself (`access-settings`); the OAuth pages (`oauth2-applications`);
the Embed SDK and the Plugin SDK pages (`sdk-embedding`, `plugins`); the Docs Connect page (`docs-connect`); the
Developer Tools card of the dashboard (`dashboard`).

Implementation: the developer tools sidebar, the overview, Webhooks and API keys pages of
`packages/client/src/pages/PortalSettings/categories/developer-tools`, the webhooks store, and
`packages/shared/utils/devToolsAccess.ts`.

## Requirements

### Requirement: Who gets Developer Tools

Developer Tools SHALL open for the owner and DocSpace admins always, and for Room admins and Users unless the portal
limits it to administrators; a Guest SHALL NOT open it. Where the portal limits it, Room admins, Users and Guests
SHALL NOT be offered it at all; otherwise a Guest SHALL be shown the section and told why it does not open, and its
addresses SHALL lead a Guest nowhere.

#### Scenario: Guest

- **WHEN** a Guest picks the Developer Tools section on the dashboard
- **THEN** a toast explains why it does not open

#### Scenario: Guest by address

- **WHEN** a Guest opens a Developer Tools address
- **THEN** the section does not open

### Requirement: The Developer Tools overview

The overview SHALL describe each tool with a link into it — the REST API documentation, the Embed SDK, the Plugin SDK,
Webhooks, OAuth and API keys — and Docs Connect on SaaS for the owner and DocSpace admins only; the sidebar SHALL list
the same pages.

#### Scenario: Room admin on SaaS

- **WHEN** a Room admin opens Developer Tools on SaaS
- **THEN** Docs Connect is neither listed nor opened by its address

### Requirement: Creating and editing a webhook

A webhook SHALL take a name, a payload URL, a secret key that can be generated or reset, SSL verification on or off,
and either every event or chosen events, the latter optionally for given target IDs. A saved webhook SHALL be listed
with its state, which SHALL be switched on or off from the list; Settings SHALL edit it and Delete SHALL remove it
after a confirmation.

#### Scenario: Switching a webhook off

- **WHEN** a user switches a webhook off in the list
- **THEN** the webhook stays listed as disabled

### Requirement: Delivery history

The history of a webhook SHALL list its deliveries with status and time, filter them by delivery date and time and
by status (not sent or a response code), and let the user select deliveries and retry them, reporting `WebhookRedilivered`.

#### Scenario: Filter by status

- **WHEN** a user filters the history to deliveries that were not sent
- **THEN** only those deliveries are listed

### Requirement: Event details

The details of a delivery SHALL show its status, event and time, the request and the response with their headers and
bodies to copy, the raw payload, a notice when the payload is too large, and Retry.

#### Scenario: Retry from details

- **WHEN** a user presses Retry on the details of a failed delivery
- **THEN** the delivery is sent again and `WebhookRedilivered` is shown

### Requirement: Live webhook lists

The list of webhooks and the open history SHALL follow the server's events without a reload: a burst of changes SHALL
cause one re-read, a deleted webhook SHALL leave the list at once, records of another webhook or outside the filter
SHALL be ignored, and a failed re-read SHALL keep what is shown.

#### Scenario: Webhook deleted elsewhere

- **WHEN** another user deletes a webhook while the list is open
- **THEN** the webhook leaves the list without a request

### Requirement: API keys

API keys SHALL list the user's keys with their state, creator, last use and expiry. A new key SHALL take a name, all
permissions, read only or restricted permissions — read or write for files, rooms, profiles and accounts — and an
optional lifetime in days; it SHALL be shown once to copy. A key SHALL be switched on or off from the list, edited, or
deleted after a confirmation; an expired or deactivated key SHALL be marked.

#### Scenario: New key shown once

- **WHEN** a user creates an API key
- **THEN** the dialog shows the key to copy and it is not shown again afterwards
