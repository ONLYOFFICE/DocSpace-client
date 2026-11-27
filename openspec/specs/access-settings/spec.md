# access-settings Specification

## Purpose

Defines the security settings the web client offers an administrator under Security → Access portal (external
sharing, password strength, two-factor authentication, trusted mail domains, Developer Tools access, invitation
settings, IP security, brute force protection, the administrator message, the session lifetime) and the sign-in
integrations under Integration: single sign-on, LDAP and the third-party service keys.

Server counterpart: `../server/openspec/specs/access-settings` (password policy, sign-in limits, IP restrictions,
two-factor policy, single sign-on, third-party service keys); the trusted mail domains and the session lifetime are
in `../server/openspec/specs/portal-settings`, the invitation settings in `invitations`, the Developer Tools rule in
`webhooks-and-api-keys`, and the external sharing switch in `file-sharing`. Operations called:
`changeExternalSharingSettings`, `getPasswordSettings`, `updatePasswordSettings`, `getTfaSettings`,
`updateTfaSettingsLink`, `saveMailDomainSettings`, `setTenantDevToolsAccessSettings`, `updateInvitationSettings`,
`saveIpRestrictions`, `getLoginSettings`, `updateLoginSettings`, `setDefaultLoginSettings`,
`enableAdminMessageSettings`, `updateCookieSettings`, `getSsoSettingsV2`, `saveSsoSettingsV2`, `resetSsoSettingsV2`,
`getAuthServices`, `saveAuthKeys`; LDAP calls `settings/ldap`, `settings/ldap/sync`, `settings/ldap/cron` and
`settings/ldap/status`, which the API description does not list.

Out of scope: what the settings change for links (`shared-links`), for signing in (`authentication`), for inviting
(`invitations`) and for Developer Tools (`webhooks-and-api-keys`); the login history and the audit trail
(`history-and-audit`); SMTP (`notifications`); the Document Server address (`files-settings`); plugins (`plugins`);
who reaches the settings at all (`user-type-permissions`).

Implementation: `packages/client/src/pages/PortalSettings/categories/security/access-portal` and the single sign-on,
LDAP and third-party services pages of `categories/integration`.

## Requirements

### Requirement: The Access portal page

On a desktop, Access portal SHALL show every security section with its description and, where the portal has a help
address, a Learn more link. On a phone it SHALL list the sections, each opening its own page, and a section page
widened to a desktop SHALL lead back to the overview. Each section SHALL save with Save, report
`Common:SuccessfullySaveSettingsMessage`, and remind of unsaved changes (`Common:YouHaveUnsavedChanges`).

#### Scenario: Unsaved change

- **WHEN** an administrator changes a section without saving
- **THEN** the section reminds that there are unsaved changes

### Requirement: External sharing

Access control SHALL let an administrator allow or restrict external sharing. While allowed it SHALL offer the
default type of a new link (anyone with the link or internal). When restricted it SHALL ask whether the restriction
applies to documents, to rooms or both, and whether existing links are blocked (`Settings:BlockAccessRecommended`) or
keep working until removed. Cancel SHALL restore the saved state.

#### Scenario: Restricted for rooms only

- **WHEN** an administrator restricts external sharing for rooms only and saves
- **THEN** the restriction is saved for rooms and documents stay unrestricted

### Requirement: Password strength

Password strength SHALL set the minimum length from 8 to 30 characters and whether a password needs upper case
letters, digits and special characters.

#### Scenario: Longer minimum

- **WHEN** an administrator sets the minimum length to 12 and saves
- **THEN** the password policy requires 12 characters

### Requirement: Two-factor authentication

Two-factor authentication SHALL offer Disabled, By SMS and By app, the last two only where the portal supports them.
Saving a method that needs setup SHALL take the administrator to the setup page the server returns.

#### Scenario: App on an installation without SMS

- **WHEN** an administrator opens two-factor authentication where SMS is not available
- **THEN** By SMS is offered disabled

### Requirement: Trusted mail domains

Trusted mail SHALL offer Disabled, All domains and Custom domains; custom domains SHALL be entered one per field, each
checked on leaving it, and a malformed domain (`Common:IncorrectDomain`) or a repeated one
(`Common:DomainAlreadyAdded`) SHALL block saving.

#### Scenario: Repeated domain

- **WHEN** an administrator enters the same custom domain twice
- **THEN** the second is marked as already added and the settings are not saved

### Requirement: Developer Tools access

Developer Tools access SHALL let an administrator choose between every user except guests (Enabled) and the owner and
DocSpace admins only (Disabled).

#### Scenario: Restricting Developer Tools

- **WHEN** an administrator picks Disabled and saves
- **THEN** only the owner and DocSpace admins keep Developer Tools

### Requirement: Invitation settings

Invitation settings SHALL let an administrator decide whether members may be invited from Contacts (or only through
LDAP) and whether guests may be invited.

#### Scenario: Guests off

- **WHEN** an administrator clears Invite guests and saves
- **THEN** the setting to invite guests is saved as off

### Requirement: IP security

IP security SHALL offer Disabled and Enabled with a list of allowed IPv4 addresses and the warning
`IPSecurityWarningHelper`; a malformed address (`Common:IncorrectIp`) or a repeated one (`Common:IpAlreadyAdded`)
SHALL block saving. Saving with Disabled SHALL clear the allowed list.

#### Scenario: Disabling clears the list

- **WHEN** an administrator with allowed addresses picks Disabled and saves
- **THEN** the restrictions are saved off with an empty list

### Requirement: Brute force protection

Brute force protection SHALL set the number of failed attempts, the blocking time and the check period as whole
numbers of up to four digits, marking an empty one (`ErrorMessageBruteForceProtection`). Restore to default
(`RestoreToDefault`) SHALL reset the server's values and SHALL be disabled while they are the defaults.

#### Scenario: Restore to default

- **WHEN** an administrator presses Restore to default
- **THEN** the server's default limits are restored and shown

### Requirement: Administrator message

The administrator message SHALL switch on or off a form on the sign-in page through which people can contact the
DocSpace admins.

#### Scenario: Enabling the form

- **WHEN** an administrator enables the administrator message and saves
- **THEN** the setting is saved as enabled

### Requirement: Session lifetime

Session lifetime SHALL be off or a number of minutes that is positive and at most four digits; the page SHALL say that
saving signs everyone out.

#### Scenario: Zero minutes

- **WHEN** an administrator enters 0 minutes
- **THEN** the field is marked and the lifetime is not saved

### Requirement: Single sign-on

Where the tariff includes single sign-on, Integration → SSO SHALL let an administrator fill the identity provider from
its metadata file or address, manage the provider and service certificates, map the user fields, choose the type of
new users, switch single sign-on on, save or reset the settings, and get the service provider metadata. Without the
feature the switch, saving and the metadata download SHALL be disabled and the switch SHALL carry the paid badge.

#### Scenario: Plan without SSO

- **WHEN** an administrator of a portal without the SSO feature opens SSO
- **THEN** the switch and saving are disabled and marked as paid

### Requirement: LDAP

Where the tariff includes LDAP, Integration → LDAP SHALL let an administrator set the connection, the attribute and
group mapping and the authentication, save them, synchronize at once with progress, and schedule automatic
synchronization showing the next run in UTC. A certificate to confirm SHALL be shown with its details, and confirming
it SHALL save again with it accepted. Without the feature the controls SHALL be disabled and the switch SHALL carry the
paid badge.

#### Scenario: Manual sync

- **WHEN** an administrator presses the synchronize button with LDAP on
- **THEN** a synchronization starts and its progress is shown

#### Scenario: Certificate to confirm

- **WHEN** saving reaches an LDAP server whose certificate is not trusted and the administrator confirms it
- **THEN** the settings are saved again with the certificate and its hash accepted

### Requirement: Third-party services

Third-party services SHALL list the services whose keys the portal may hold, each switched on by entering its keys in
a dialog, and offer a request for a missing integration. A service backed by an external database SHALL show the
fields its chosen options need and offer Test connection. Without the feature the services SHALL be
marked as included in the Business plan (`IncludedInBusiness`).

#### Scenario: Enabling a service

- **WHEN** an administrator enters the keys of a service and saves
- **THEN** the service is shown as enabled
