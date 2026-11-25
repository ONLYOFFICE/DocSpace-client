# authentication Specification

## Purpose

Defines how a person signs in to and out of a portal in the web client: the login page of the login app — email and
password, LDAP, SSO, third-party providers, captcha, password recovery, registration and access recovery requests —
where a successful sign-in leads, the pages behind the confirmation links of an account (sign-in by link, activation,
email confirmation and change, password change, two-factor setup and code, profile removal), how a session that ended
is resumed, and signing out.

Server counterpart: `../server/openspec/specs/access-settings` (two-factor authentication, login settings, trusted
domains) and `people-and-groups` (activation, email change, self-deletion, third-party accounts). Operations called:
`authenticateMe`, `authenticateMeFromBodyWithCode`, `getIsAuthentificated`, `logout`, `getThirdPartyAuthProviders`,
`getPortalCapabilities`, `sendUserPassword`, `sendJoinInviteMail`, `sendAdminMail`, `checkConfirm`,
`changeUserPassword`, `changeUserEmail`, `updateUserActivationStatus`, `updateMember`, `deleteProfile`,
`tfaAppGenerateSetupCode`, `tfaValidateAuthCode`.

Out of scope: joining through an invitation and the guest share approval (`invitations`); OAuth 2.0 consent and portal
choice for an application (`oauth2-applications`); the portal lifecycle links — suspend, continue, remove, owner change
(`portal-lifecycle`); the one's own profile page (`profile`); the login settings an administrator sets
(`access-settings`); loading resilience of the login app (`app-shell`).

Implementation: `packages/login` (the root login page, the `confirm` pages, the error pages, the confirm link guard) and
the private route and auth store of `packages/shared`.

## Requirements

### Requirement: Signing in with email and password

The login page SHALL ask for the email and the password, mark an empty or malformed email and an unknown domain before
sending, and show the server's refusal on the form. Leaving `Common:Remember` unticked SHALL keep the sign-in for the
browser session only. The fields SHALL be reached with Tab in the order they are shown.

#### Scenario: Wrong password

- **WHEN** a person submits an email and a wrong password
- **THEN** the form stays open and shows that authentication failed

#### Scenario: Malformed email

- **WHEN** a person submits `email` as the email
- **THEN** the email field is marked as incorrect and nothing is sent

### Requirement: LDAP and SSO sign-in

Where LDAP is enabled the login page SHALL offer signing in with the directory account (`SignInLDAP`). Where SSO is set
up it SHALL offer the SSO button, and where the portal hides its own login page it SHALL go straight to the SSO
provider unless the address asks to skip that redirect.

#### Scenario: Login page hidden behind SSO

- **WHEN** a person opens the login page of a portal that hides it behind SSO
- **THEN** the browser is sent to the SSO provider

### Requirement: Third-party sign-in

Where third-party sign-in is enabled and providers are set up, the login page SHALL offer a button per provider. A
failed provider sign-in, such as one with an account no user has linked, SHALL be shown as an error
(`Common:ProviderLoginError`, `Common:ProviderNotConnected`).

#### Scenario: Unlinked provider account

- **WHEN** a person signs in with a provider account that no user has linked
- **THEN** the login page says the provider account is not connected

### Requirement: Captcha after repeated failures

When the server answers a sign-in with too many attempts, the login page SHALL show the captcha the portal uses
(reCAPTCHA or hCaptcha) and SHALL NOT send the next attempt until it is solved.

#### Scenario: hCaptcha

- **WHEN** a sign-in is answered with too many attempts on a portal that uses hCaptcha
- **THEN** the hCaptcha container appears on the form

### Requirement: Requests from the login page

The login page SHALL offer password recovery, which sends instructions to the entered email. Where the portal accepts
registrations from trusted domains it SHALL offer a registration request listing those domains; where it accepts
messages for the administrator it SHALL offer an access recovery request.

#### Scenario: Registration offered

- **WHEN** a person opens the login page of a portal with trusted domains
- **THEN** the registration button is shown

### Requirement: Where a sign-in leads

After signing in, the client SHALL open the page named by `referenceUrl` when it is a page of the portal, or the page
kept when the session ran out for the same user; SHALL NOT open a page another user left; SHALL go to the two-factor
page when the second factor is required; and otherwise SHALL open the portal root.

#### Scenario: Session ran out in a room

- **WHEN** a user's session runs out in a room and the same user signs in again
- **THEN** the room opens again

#### Scenario: Another user

- **WHEN** another user signs in in that tab
- **THEN** the room the first user left is not opened

### Requirement: Signing in elsewhere

A login tab SHALL open the portal once a session started in another tab is alive, and stay on the form while it is not.
Signing out in one tab SHALL end the session in the other tabs of the portal.

#### Scenario: Login tab after sign-in in another tab

- **WHEN** the user signs in in another tab while a login tab is open
- **THEN** the login tab opens the portal

### Requirement: Confirmation links

Every confirmation page SHALL first check its link. An invalid link SHALL show `Common:InvalidLink`, an expired one
`Common:LinkExpired`, a link over the paid users limit `Common:QuotaPaidUserLimitError`; an invitation link that expired
or is over quota SHALL open its own error page.

#### Scenario: Expired password link

- **WHEN** a person opens a password change link that expired
- **THEN** the page says the link expired

### Requirement: Sign-in by a confirmation link

A sign-in link SHALL sign the person in and open the page named by `referenceUrl` when it is a page of the portal, or the
two-factor page when required, or the portal root. A reference to a file download SHALL stay on a download page
(`DownloadOperationTitle`) that fetches the file once the person is signed in.

#### Scenario: Link with a file download

- **WHEN** a person opens a sign-in link whose reference is a file download
- **THEN** the download page is shown and the file is fetched after the sign-in

### Requirement: Account activation

The activation page SHALL ask for the first and last name and a password meeting the portal's rules, offer to generate a
password, and sign the person in on success; it SHALL show the error for a failed activation, the paid users limit, an
existing user and a failed quota.

#### Scenario: Paid users limit

- **WHEN** a person activates an account while the portal is at its paid users limit
- **THEN** the page shows the paid users limit error

### Requirement: Email confirmation and change

An email confirmation link SHALL confirm the address and open the login page with `MessageEmailConfirmed`. An email
change link SHALL apply the new address and open the profile's Login tab with a success marker; a failure SHALL be
shown on the page.

#### Scenario: Email confirmed

- **WHEN** a person opens a valid email confirmation link
- **THEN** the login page opens with the confirmation message

### Requirement: Password change

The password change page SHALL ask for a new password meeting the portal's rules, offer to generate one, and on
success open the login page with `ChangePasswordSuccess`; it SHALL show the errors for an invalid password, an expired
link and an excluded user.

#### Scenario: Password changed

- **WHEN** a person sets a valid new password from a recovery link
- **THEN** the login page opens and says the password was changed

### Requirement: Two-factor authentication

The two-factor setup page SHALL show what is needed to connect an authenticator app and verify the first code.
The two-factor code page SHALL ask for the app's code and continue where the sign-in was going, a room included. A code
that does not validate SHALL be refused on the page.

#### Scenario: Code accepted with a room

- **WHEN** a person enters a valid code after signing in from a room's link
- **THEN** the room opens

### Requirement: Profile removal confirmation

The profile removal link SHALL ask the person to confirm deleting their profile, delete it on confirmation and say so.

#### Scenario: Profile deleted

- **WHEN** a person confirms the removal from the emailed link
- **THEN** the profile is deleted and the page says it was deleted
