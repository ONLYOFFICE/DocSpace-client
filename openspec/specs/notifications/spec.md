# notifications Specification

## Purpose

Defines what the web client offers about notifications: the Notifications tab of the profile with its delivery
channels and Telegram link, the notification kinds a member switches, muting a room, the new files badge and its
panel, and the SMTP settings of the portal with the test message.

Server counterpart: `../server/openspec/specs/notifications` ("Delivery channels of the installation", "Notification
kinds a member can switch", "Muting single rooms", "Telegram link of a profile", "New items of a room", "New items
across all rooms", "SMTP settings of the portal", "SMTP test message"). Operations called:
`getNotificationChannels`, `getNotificationSettings`, `setNotificationSettings`, `setRoomsNotificationStatus`,
`linkTelegram`, `checkTelegram`, `unlinkTelegram`, `getNewFolderItems`, `getNewRoomItems`, `getSmtpSettings`,
`saveSmtpSettings`, `resetSmtpSettings`, `testSmtpSettings`, `getSmtpOperationStatus`.

Out of scope: the letters themselves, their digests and the retention letters, which the server writes; the Telegram
bot keys of the third-party services (`access-settings`); marking entries as read from the context menu
(`file-operations`); the new files of private rooms (`private-rooms/*`); who reaches the portal settings
(`portal-settings`).

Implementation: the notifications sub-components of the profile body, the Telegram store and its connect and
disconnect dialogs, the mute action of the rooms, the NewFilesBadge component and the SMTPSettings page of the
integration settings.

## Requirements

### Requirement: Notification channels

The Notifications tab SHALL show the e-mail channel with the user's address when the installation sends e-mail,
marked when the address is not valid, and the Telegram channel: not configured — with a link to the settings for an
admin and `Notifications:AdminSetupRequired` for others — or offered to connect, or connected with the username.

#### Scenario: Telegram without a bot for a member

- **WHEN** a user who is not an admin opens the Notifications tab and the portal has no Telegram bot
- **THEN** the Telegram channel says `Notifications:AdminSetupRequired` and offers no link

### Requirement: Linking Telegram

Connecting Telegram SHALL show the user's bot link to copy or open; once the server reports the link, the channel
SHALL show the connected username and `Notifications:SuccessConnected`. Disconnecting SHALL ask for a confirmation and
then report `Notifications:SuccessDisconnected`.

#### Scenario: Connect dialog

- **WHEN** a user clicks Connect on the Telegram channel
- **THEN** the dialog with the bot link is shown

### Requirement: Notification kinds

The Notifications tab SHALL let every member switch, for their own account, the badges of new files, the room
activity letters, the daily feed and the useful tips, each saved on its own.

#### Scenario: Turning the daily feed off

- **WHEN** a member switches the daily feed off
- **THEN** the daily feed kind is saved as disabled for that member

### Requirement: Muting a room

A room SHALL offer `Common:DisableNotifications` or `Common:EnableNotifications` when its security allows muting,
outside a public room. Muting SHALL take the room's new files out of the section counter and show a muted badge
that unmutes on click, and each change SHALL be confirmed by `Common:RoomNotificationsDisabled` or
`Common:RoomNotificationsEnabled`, with the agent variants for an AI agent.

#### Scenario: Unmuting from the badge

- **WHEN** a user clicks the muted badge of a room
- **THEN** the room's notifications are enabled again

### Requirement: New files badge

A section, room or folder with new files SHALL show their count, capped at `999+`. Its panel SHALL list the new files
by day, open a file or its location and mark it read, and mark all read with Mark read or Enter; Esc SHALL close it.
The Rooms panel SHALL leave form rooms to the Forms panel.

#### Scenario: Marking all read

- **WHEN** a user presses Enter in the new files panel of a room
- **THEN** the room's new files are marked read and the panel closes

### Requirement: SMTP settings

The SMTP settings SHALL take the host, the port, optional authentication with a login, a password and NTLM, the sender
name and address, and SSL. Save SHALL need the host, the port, a valid sender address and, with authentication, the
login and the password, and SHALL wait for a change; Default settings SHALL be disabled while the settings are the
defaults.

#### Scenario: Authentication without a password

- **WHEN** an administrator turns authentication on and leaves the password empty
- **THEN** Save is disabled

### Requirement: SMTP test message

Send test mail SHALL be offered only for saved settings without unsaved changes, follow the test until it ends and
report `Common:SuccessfullyCompletedOperation` or the error the server returns.

#### Scenario: Unsaved changes

- **WHEN** an administrator edits the host without saving
- **THEN** Send test mail is disabled
