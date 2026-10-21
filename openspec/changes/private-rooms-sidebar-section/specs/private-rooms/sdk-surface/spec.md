# Spec Delta

## REMOVED Requirements

### Requirement: Client app embeds the SDK surface
**Reason**: The client lists and opens private rooms natively in its Private rooms section (`private-rooms/sidebar-section`), with its own encryption shell, key management and menus. A framed copy of the SDK pages would be a second, weaker home for the same rooms.
**Migration**: `/e2e-rooms` and `/e2e-rooms?section=archive` redirect to `/private/filter` and `/private/archived/filter`. The SDK keeps serving `/sdk/private*` for embedding hosts, unchanged.
