# branding-and-licensing Specification

## Purpose

Defines how the web client lets an administrator change the look of the portal: the Branding tab (brand name, logos,
company details, help and community links), the colour themes of Appearance, and the greeting title of the welcome
page, together with where each of them is offered by edition and installation.

Server counterpart: `../server/openspec/specs/branding-and-licensing` (editions, whether branding may be changed, logo
slots, logo text, company details, links, colour themes, greeting title). Operations called: `getWhiteLabelLogos`,
`getIsDefaultWhiteLabelLogos`, `saveWhiteLabelSettings`, `restoreWhiteLabelLogos`, `getWhiteLabelLogoText`,
`saveWhiteLabelLogoText`, `getCompanyWhiteLabelSettings`, `saveCompanyWhiteLabelSettings`,
`deleteCompanyWhiteLabelSettings`, `getAdditionalWhiteLabelSettings`, `saveAdditionalWhiteLabelSettings`,
`deleteAdditionalWhiteLabelSettings`, `getPortalColorTheme`, `savePortalColorTheme`, `deletePortalColorTheme`,
`saveGreetingSettings`, `getIsDefaultGreetingSettings`, `restoreGreetingSettings`.

Out of scope: the license file and the license state of a server installation (`billing`, "Payments on a server
installation"); where the About dialog and the help links show the branding (`app-shell`); the default branding of a
multi-portal installation set in the management app (`spaces-management`); the other Customization pages
(`portal-settings`).

Implementation: the Branding, Appearance and welcome page settings of
`packages/client/src/pages/PortalSettings/categories/common` and the branding pages of `packages/shared/pages/Branding`.

## Requirements

### Requirement: Where branding is offered

Community Edition SHALL offer no Branding tab, and every Branding address SHALL answer with the 404 page; other
editions SHALL show the tab and open it by its address. On SaaS, branding SHALL be a paid feature: without it the
pages SHALL be shown disabled with the paid badge. Company details and the help links SHALL be offered only on a
server installation with a single portal.

#### Scenario: Community Edition

- **WHEN** an administrator of a Community Edition server opens the brand name address
- **THEN** the 404 page is shown

#### Scenario: Multi-portal installation

- **WHEN** an administrator of one of several portals of an installation opens Branding
- **THEN** only the brand name and the logos are offered

### Requirement: Brand name

Brand name SHALL let an administrator enter the name shown in the product's texts, refuse an empty one, one outside 2
to 40 characters (`Common:BrandNameLength`) or one with forbidden characters (`Common:BrandNameForbidden`), remind of
an unsaved change, and Cancel SHALL go back to the saved name.

#### Scenario: Saving a brand name

- **WHEN** an administrator types a new brand name and saves
- **THEN** the brand name is saved

### Requirement: Logos

White label SHALL show each logo slot — the light small logo, the compact one, the sign-in page, About, the favicon
and the editors' logos — in its light and dark variant, and let an administrator upload an image for a slot, generate
every logo from a text, save, and restore the built-in logos (`Common:Restore`), disabled while they are in force.

#### Scenario: Text as logo

- **WHEN** an administrator enters a text and generates the logos from it
- **THEN** every logo slot shows a logo made from that text

### Requirement: Company details

Company details SHALL let an administrator set the company name, email, phone, site and address and whether the
About window is shown, mark invalid values, enable saving only for a valid change, and restore the defaults.

#### Scenario: Invalid email

- **WHEN** an administrator enters a malformed company email
- **THEN** the field is marked and saving is disabled

### Requirement: Help and community links

Additional resources SHALL let an administrator choose whether the portal shows the feedback and support link and the
help center, remind of unsaved changes, and restore the defaults, the restore button disabled while they are in force.

#### Scenario: Hiding the help center

- **WHEN** an administrator clears Show help center and saves
- **THEN** the setting is saved without the help center

### Requirement: Branding on a phone

On a phone the Branding tab SHALL list its pages — brand name, logos and, where offered, company details and help
links — each opening its own page.

#### Scenario: Phone

- **WHEN** an administrator opens Branding on a phone
- **THEN** the list of branding pages is shown

### Requirement: Colour themes

Appearance SHALL show the standard and custom colour themes with a light and dark preview, let an administrator pick
one and save it, and add up to three custom themes (`Settings:LimitThemesTooltip` once nine exist) by choosing the
accent and button colours. A standard theme SHALL NOT be edited or deleted; a custom one SHALL be.

#### Scenario: Deleting a custom theme

- **WHEN** an administrator deletes the selected custom theme
- **THEN** the theme is removed and another theme is selected

#### Scenario: Standard theme

- **WHEN** an administrator selects a standard theme
- **THEN** editing and deleting are disabled

### Requirement: Greeting title

The welcome page settings SHALL let an administrator set the portal's greeting title, refuse an empty one, and restore
the default title (`Common:Restore`), each with `SuccessfullySaveGreetingSettingsMessage`.

#### Scenario: Restoring the title

- **WHEN** an administrator presses Restore
- **THEN** the default greeting title is restored
