# Spec Delta

## ADDED Requirements

### Requirement: No external links of private items in the SDK
The SDK SHALL NOT offer the creation, the list, the address or the revocation of an external link of a private item, the mark of active links, or the page a visitor of such a link opens. A link created in the client SHALL keep working whatever the SDK shows.

#### Scenario: Manager in the SDK
- **WHEN** the owner or a room manager opens the menus and the info panel of a private item in the SDK
- **THEN** no link entry and no Share tab is shown

#### Scenario: Address of a link opened in an embedding frame
- **WHEN** the address of a link of a private item is opened where the SDK serves the page
- **THEN** the visitor is sent to the portal's own page for the link
