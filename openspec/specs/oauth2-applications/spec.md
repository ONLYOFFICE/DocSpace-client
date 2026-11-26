# oauth2-applications Specification

## Purpose

Defines what the web client offers around OAuth 2.0 applications: registering and managing applications under
Developer Tools, the developer token, the applications a user has authorized in the profile, and the sign-in,
portal choice and consent pages of the login app that an application's authorization request leads to.

Server counterpart: `../server/openspec/specs/oauth2-applications`. Operations called: `getClients`, `getClient`,
`createClient`, `updateClient`, `changeActivation`, `regenerateSecret`, `deleteClient`, `getScopes`, `getConsents`,
`revokeUserClient`, `submitConsent`, `exchangeToken`, `generateJwtToken`; reading one scope by name and revoking or
checking a developer token go to `oauth2/scopes/{name}`, `oauth2/revoke` and `oauth2/introspect`, which the API
description does not list.

Out of scope: who reaches Developer Tools at all (`webhooks-and-api-keys`, "Developer Tools access rule"); signing in
without an application (`authentication`); the OAuth sign-in frames of the Embed SDK and the editor (`sdk-embedding`).

Implementation: the OAuth pages of Developer Tools and the OAuth store of the client, the authorized apps tab of the
profile, and the consent and tenant list pages of `packages/login`.

## Requirements

### Requirement: Applications list

Developer Tools → OAuth SHALL list the applications the user may manage — every application of the portal for the
owner and DocSpace admins, their own for others — with an empty screen and a register button when there are none.
Each row SHALL offer Info, Edit, the authorization button code (`OAuth:AuthButton`), Enable or Disable, Generate token,
Revoke token and Delete; several selected rows SHALL be enabled, disabled or deleted together.

#### Scenario: Disabled application

- **WHEN** a user opens the menu of a disabled application
- **THEN** the authorization button code and the token actions are disabled

### Requirement: Registering and editing an application

The application form SHALL ask for the name, the website, the redirect URLs and the allowed origins, the scopes with
read or write access, and optionally a description, an icon, PKCE, and the privacy policy and terms of service
addresses. An address with spaces or of a wrong form, and a redirect URL or an origin with a query or a fragment,
SHALL be refused, and a short name SHALL be marked
(`ErrorName`). On edit the client ID and secret SHALL be shown for copying.

#### Scenario: Redirect URL with a query

- **WHEN** a user enters a redirect URL with a query string
- **THEN** the URL is marked as wrong and not added to the list

### Requirement: Resetting the secret, disabling and deleting

Resetting an application's secret SHALL warn that every consent and authorization is revoked
(`ResetDescription`); disabling and deleting SHALL ask for confirmation, for one application or several, and report
success.

#### Scenario: Reset

- **WHEN** a user resets an application's secret and confirms
- **THEN** `OAuth:ClientSecretResetSuccessfully` is shown and the form holds the new secret

### Requirement: Developer token

For an enabled application the user SHALL be able to generate a developer token for their own account, with its
scopes and expiry, copy it, and revoke it; Revoke token SHALL take a token, refuse one that is not valid
(`OAuth:InvalidToken`) and say the revocation cannot be undone.

#### Scenario: Invalid token

- **WHEN** a user enters a token that the server does not recognise in Revoke token
- **THEN** `OAuth:InvalidToken` is shown and nothing is revoked

### Requirement: Authorized applications in the profile

The profile SHALL list the applications the user has authorized, with an empty screen when there are none, and let
the user open an application's site, see its details, and revoke one or several of them after a confirmation.

#### Scenario: Revoking

- **WHEN** a user revokes an authorized application and confirms
- **THEN** the application leaves the list and has to be authorized again

### Requirement: Signing in for an application

An authorization request SHALL show the login page with the application's details. A user with several portals
SHALL pick one from the list and SHALL be able to go back to the sign-in. Once signed in, the consent page SHALL list
the scopes the application asks for and offer Allow and Deny; Deny SHALL return to the application, and the user
SHALL be able to sign in as someone else.

#### Scenario: Consent

- **WHEN** a signed-in user opens an authorization request
- **THEN** the consent page lists the requested scopes with Allow and Deny

#### Scenario: Several portals

- **WHEN** a user with accounts on several portals signs in for an application
- **THEN** the list of portals is shown and the user picks one
