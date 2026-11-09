# Spec Delta

## ADDED Requirements

### Requirement: Backup warns about private rooms
The system SHALL show on the backup and restore settings pages, while private rooms are available on the portal, an information bar titled Common:PrivateRoomsBackupWarningTitle with the notice Common:PrivateRoomsBackupWarning: a backup does not include the keys of private rooms, and a portal restored from it cannot open their files. The restore confirmation SHALL name that loss before the restore starts. The notice SHALL NOT be shown while private rooms are not available on the portal.

#### Scenario: Backup page opened
- **WHEN** an administrator opens the manual or automatic backup settings while private rooms are available
- **THEN** the page shows Common:PrivateRoomsBackupWarning

#### Scenario: Restore confirmed
- **WHEN** an administrator starts a restore while private rooms are available
- **THEN** the confirmation names the loss of the private rooms' content before the restore starts

#### Scenario: Private rooms not available
- **WHEN** an administrator opens the backup settings on a standalone portal where the E2E rooms app is off
- **THEN** no private-rooms notice is shown
