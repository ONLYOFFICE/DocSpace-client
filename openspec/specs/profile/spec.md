# profile Specification

## Purpose

Defines the user's own profile page in the web client: the profile block (photo, name, email, password, language), the
profile's actions menu, deleting one's own profile, and the Login and Interface theme tabs — two-factor backup codes and
authenticator reset, linked social accounts, active sessions — together with how the page picks its tab from the
address and adds tabs of plugins.

Server counterpart: `../server/openspec/specs/people-and-groups` (profile edits, photos, email change, self-deletion,
third-party accounts, theme) and `../server/openspec/specs/access-settings` (two-factor authentication).
Operations called: `getSelfProfile`, `updateMember`, `sendEmailChangeInstructions`, `sendUserPassword`,
`updateMemberCulture`, `uploadMemberPhoto`, `deleteMemberPhoto`,
`sendInstructionsToDelete`, `getThirdPartyAuthProviders`, `linkThirdPartyAccount`, `unlinkThirdPartyAccount`,
`getTfaAppCodes`, `updateTfaAppCodes`, `unlinkTfaApp`, `getAllActiveConnections`, `logOutActiveConnection`,
`logOutAllExceptThisConnection`, `logOutAllActiveConnectionsChangePassword`, `changePortalTheme`.

Out of scope: the Notifications tab (`notifications`); the File management tab (`files-settings`); the Authorized apps
tab (`oauth2-applications`); the Keys management tab (`private-rooms/key-management`); editing other accounts
(`people-and-groups`); the pages behind the emailed links, such as confirming an email change or a deletion
(`authentication`); the profile menu's other entries (`app-shell`).

Implementation: `packages/client/src/pages/Profile`, the change name, email, password and avatar dialogs, the delete
profile dialogs, the active sessions store.

## Requirements

### Requirement: Tabs of the profile

The profile SHALL offer the tabs Login, Notifications, File management, Interface theme and, where the portal has an
identity server, Authorized apps, plus Keys management where private rooms allow it, followed by the tabs plugins add.
The address SHALL name the open tab, and a portal tab the user does not have SHALL open the first tab.

#### Scenario: Open by address

- **WHEN** the user opens `/profile/interface-theme`
- **THEN** the Interface theme tab is open

#### Scenario: Unknown tab

- **WHEN** the user opens the address of a portal tab they do not have
- **THEN** the Login tab is open instead

### Requirement: Tabs added by plugins

A plugin tab SHALL come after the portal's own tabs and stay apart from a portal tab with the same key. While plugins
are loading, a plugin tab's address SHALL show a skeleton for a bounded time; an address no loaded plugin owns SHALL
open the Login tab.

#### Scenario: Plugins never finish loading

- **WHEN** a plugin tab's address is opened and the plugins never finish loading
- **THEN** the page stops waiting and opens the Login tab

### Requirement: The profile block

The profile block SHALL show the photo, name, email, password mask, type and interface language. For an account that is
neither SSO nor LDAP it SHALL let the user change the name, the email and the password; SSO and LDAP accounts SHALL show
their mark with an explanation instead. An LDAP account SHALL NOT edit its photo.

#### Scenario: SSO account

- **WHEN** a user signed in through SSO opens the profile
- **THEN** the SSO mark is shown and no edit button is offered for the name, email or password

### Requirement: Changing one's own name, email and password

Changing the name SHALL validate the first and last name and confirm with `Common:ChangesSavedSuccessfully`. Changing
the email SHALL validate the address and send activation instructions to it; changing the password SHALL send
instructions to the user's email. Returning from a confirmed email change SHALL show `Profile:EmailChangeSuccess`.

#### Scenario: Email change confirmed

- **WHEN** the user returns to the profile from a confirmed email change link
- **THEN** a success toast is shown and the address loses its success marker

### Requirement: Unconfirmed email

While the user's email is not confirmed, the profile SHALL mark it, explain it in a tooltip (`EmailNotVerified`) and
offer to send the activation email again (`SendAgain`), confirmed with a toast.

#### Scenario: Send again

- **WHEN** a user with an unconfirmed email presses Send again
- **THEN** the activation email is sent and a toast confirms it

### Requirement: Interface language

Choosing another language SHALL save it for the account and switch the interface to it without a reload; choosing the
current language SHALL do nothing, and a failure SHALL be shown as an error.

#### Scenario: Switch language

- **WHEN** the user picks another language in the profile
- **THEN** the interface is shown in that language

### Requirement: Profile photo

The photo editor SHALL let the user upload a picture, choose the visible part and save it, and delete the current
photo, confirming a saved change with `Common:ChangesSavedSuccessfully`; a failed save SHALL be shown as an error.

#### Scenario: Upload a photo

- **WHEN** the user uploads a picture and saves it
- **THEN** the new photo is shown in the profile

### Requirement: Deleting one's own profile

The profile's actions menu SHALL offer deleting the profile. For any user but the Owner it SHALL send a confirmation
email after the user agrees; for the Owner it SHALL explain that the portal owner must first be changed and offer the
owner change instead.

#### Scenario: Owner deletes the profile

- **WHEN** the Owner chooses to delete their profile
- **THEN** a dialog explains the restriction and offers to change the portal owner

#### Scenario: User deletes the profile

- **WHEN** a User chooses to delete their profile and confirms
- **THEN** an email with the deletion link is sent

### Requirement: Two-factor authentication on the Login tab

While two-factor authentication by app is on, the Login tab SHALL offer the backup codes, which can be printed or
replaced with new ones, and resetting the authenticator app, which after confirmation shows `SuccessResetApplication`
and goes to the address the server returns.

#### Scenario: Backup codes

- **WHEN** the user opens the backup codes
- **THEN** a dialog lists the unused codes with the counter, Print and Request new

#### Scenario: Reset the application

- **WHEN** the user opens Reset application
- **THEN** a confirmation dialog explains that the app will have to be connected again

### Requirement: Linked social accounts

Where third-party sign-in is enabled and providers are set up, the Login tab SHALL list them and let the user connect or
disconnect each, confirmed with `ProviderSuccessfullyConnected` or `ProviderSuccessfullyDisconnected`; an account
already linked to another user SHALL be refused with `ErrorAccountAlreadyUse`.

#### Scenario: Providers shown

- **WHEN** the portal has third-party providers set up
- **THEN** the Login tab shows the social networks block

### Requirement: Active sessions

The Login tab SHALL list the user's active sessions with the current one marked. Every other session SHALL be closable
after confirmation, confirmed with `Profile:SuccessLogout`. Logging out of all sessions SHALL close every session but
this one, or, with `Profile:ChangePasswordAfterLoggingOut` ticked, all of them followed by a password change.

#### Scenario: Close another session

- **WHEN** the user closes a session that is not the current one and confirms
- **THEN** the session leaves the list and a toast confirms it

### Requirement: Interface theme

The Interface theme tab SHALL offer the light, the dark and the system theme, the last one labelled as the desktop
theme in the desktop app, and SHALL apply and save the choice at once.

#### Scenario: Dark theme

- **WHEN** the user chooses the dark theme
- **THEN** the interface switches to it and the choice is saved for the account
