# portal-settings Specification

## Purpose

Defines the frame of the portal settings in the web client — which sections the settings offer by edition,
installation, tariff state and AI switch, and the tabs of Customization — and the General page of Customization:
language and time zone, the domain, the deep link mode and the promotional banners.

Server counterpart: `../server/openspec/specs/portal-settings` (time zone list, custom domain, deep link mode, banner
flag). Operations called: `getSupportedCultures`, `getTimeZones`, `saveDnsSettings`, `getDeepLinkSettings`,
`configureDeepLink`, `setTenantBannerSettings`; the language and time zone are saved with
`PUT settings/timeandlanguage`, which the API description does not list.

Out of scope: who reaches the settings at all (`user-type-permissions`); the settings list on a phone opened from the
profile menu (`app-shell`); the content of each section — security and integrations (`access-settings`), branding,
appearance and the greeting title (`branding-and-licensing`), portal renaming and Delete data (`portal-lifecycle`),
storage management (`quotas`), Apps (`apps`), payments (`billing`), backup and restore (`backup-and-restore`), data
import (`data-import`), document templates (`files-settings`), metadata templates (`metadata`); the AI settings and
the AI services switch (change `ai-chat-agents-design`).

Implementation: the portal settings sidebar and settings tree, and the Customization pages of
`packages/client/src/pages/PortalSettings/categories/common`.

## Requirements

### Requirement: Sections of the settings

The settings SHALL offer Customization, Security, Backup, Restore, Integration, Data import, Storage management and
Delete data, plus AI settings while AI services are on, Apps on a server installation, and Payments: Billing on SaaS,
Payments on a server installation outside Community Edition and Upgrade on Community Edition. Delete data SHALL be
offered to the owner only, and not on a portal served from localhost. Each entry SHALL be a link, so it can be opened in a new tab.

#### Scenario: AI services off

- **WHEN** an administrator opens the settings while AI services are switched off
- **THEN** AI settings are not offered

#### Scenario: DocSpace admin

- **WHEN** a DocSpace admin opens the settings
- **THEN** Delete data is not offered

### Requirement: Settings of an unpaid portal

While the portal is unpaid the settings SHALL offer only Backup, Payments and, to the owner, Delete data.

#### Scenario: Unpaid portal

- **WHEN** the owner opens the settings of an unpaid portal
- **THEN** only Backup, Payments and Delete data are offered

### Requirement: Tabs of Customization

Customization SHALL offer the tabs General, Appearance, Document templates and Metadata templates, and Branding outside
Community Edition. On a phone General SHALL list its pages, each opening on its own.

#### Scenario: General on a phone

- **WHEN** an administrator opens General on a phone
- **THEN** the list of General pages is shown

### Requirement: The General page

The General page SHALL show language and time zone, the welcome page, the domain, portal renaming where the portal may
be renamed, the deep link mode, the promotional banners on Enterprise Edition only, and the AI services switch.

#### Scenario: Not Enterprise

- **WHEN** an administrator opens General outside Enterprise Edition
- **THEN** the banners setting is not offered

### Requirement: Language and time zone

Language and time zone SHALL let an administrator pick the portal's language, marking a beta language, and its time
zone, and save them. When the administrator has no language of their own and the portal language changed, the page
SHALL reload in the new language.

#### Scenario: New portal language

- **WHEN** an administrator without a language of their own saves another portal language
- **THEN** the page reloads in that language

### Requirement: Domain

On a server installation the domain setting SHALL switch a custom domain name on, check the name as it is typed and
save it. On SaaS it SHALL show the current domain and a Send request button (`Common:SendRequest`) that opens a
request to support, disabled with the paid badge where the tariff has no customization.

#### Scenario: SaaS

- **WHEN** an administrator of a SaaS portal opens the domain setting
- **THEN** the current domain is shown with Send request instead of a field

### Requirement: Deep link mode

The deep link setting SHALL let an administrator choose how links open on a mobile device: offer the choice
(`ProvideChoice`), open in the browser only (`OpenInWebOnly`) or in the app only (`OpenInAppOnly`).

#### Scenario: App only

- **WHEN** an administrator picks Open in app only and saves
- **THEN** the deep link mode is saved as app only

### Requirement: Promotional banners

On Enterprise Edition the banners setting (`AdManagement`) SHALL let an administrator enable or disable the
promotional banners of the portal.

#### Scenario: Disabling banners

- **WHEN** an administrator disables the banners and saves
- **THEN** the banner setting is saved as hidden
