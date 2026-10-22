# Spec Delta

## ADDED Requirements

### Requirement: Private list header uses the section label
The SDK private rooms list SHALL show Common:Private as its header title, the same label as the client's Private section. The archive page SHALL keep Common:Archive.

#### Scenario: List header
- **WHEN** a signed-in user opens the SDK private rooms list
- **THEN** the header title is Common:Private

#### Scenario: Archive header
- **WHEN** a signed-in user opens the SDK private archive
- **THEN** the header title is Common:Archive

## REMOVED Requirements

### Requirement: Client app embeds the SDK surface
**Reason**: The client lists and opens private rooms natively in its Private section (`private-rooms/sidebar-section`), with its own encryption shell, key management and menus. A framed copy of the SDK pages would be a second, weaker home for the same rooms.
**Migration**: `/e2e-rooms` and `/e2e-rooms?section=archive` redirect to `/private/filter` and `/private/archived/filter`. The SDK keeps serving `/sdk/private*` for embedding hosts, unchanged.
