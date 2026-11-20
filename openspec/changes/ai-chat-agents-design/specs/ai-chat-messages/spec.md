# Spec Delta

## Purpose

Defines how the messages of a conversation look in the redesign: replies without a logo, the user's attachments above their own message, a generated image without a card, and a card for a document a reply created.

Implementation: the ai-chat library draws the messages; ui-kit supplies the document card and the "Save to room…" action; the client passes the name of the agent the chat runs on. The library and ui-kit can draw a logo at the start of a reply; the client hands them none (decided 2026-11-20, against the boards). The attachments inside the message and the card of a generated image, both drawn on the boards, were taken out of the library the same day.

## ADDED Requirements

### Requirement: No logo beside replies
A reply SHALL carry no logo, whether the chat runs on an agent or on the default agent: the agent's room logo is not drawn in the conversation.

#### Scenario: Conversation with an agent
- **WHEN** a Member reads a conversation with the agent "Legal Reviewer"
- **THEN** the replies carry no logo

#### Scenario: Default agent
- **WHEN** a user reads a conversation with the default agent
- **THEN** the replies carry no logo

### Requirement: Attachments above the user's message
A user's message SHALL show its attachments above the bubble of its text, not inside it: an image as a thumbnail, any other file as a chip with its type icon and name.

#### Scenario: Image
- **WHEN** the user sends a message with the image "Whiteboard notes.jpg"
- **THEN** the picture stands above the bubble, and the bubble holds the text alone

#### Scenario: Document
- **WHEN** the user sends a message with "Service agreement v3.docx" attached
- **THEN** a chip with the document icon and that name stands above the bubble, and the bubble holds the text alone

### Requirement: Generated image without a card
An image a reply generated SHALL be drawn in the reply as it is, without a card around it: no file name line and no Download or "Save to room…" button of its own.

#### Scenario: Chart
- **WHEN** a reply generates a chart
- **THEN** the chart is drawn in the reply with no card, footer or buttons

### Requirement: Generated files are never shown as unsaved
A generated file SHALL be available as a portal file from the moment it appears in the reply. The interface SHALL NOT mark a generated file as unsaved and SHALL NOT ask the user to save it before it can be opened or downloaded.

#### Scenario: Card just appeared
- **WHEN** a reply has just produced an image
- **THEN** nothing marks the image as "Not saved"

### Requirement: Save to room
"Save to room…" on the card of a created document SHALL ask for a room or folder the user may add files to and SHALL put a copy of the document there, leaving the first copy where it is.

#### Scenario: Copy to a room
- **WHEN** the user chooses "Save to room…" on a created proposal and picks the room "Design for Marketing"
- **THEN** a copy of the document appears in that room and the card stays as it was

#### Scenario: Room the user only reads
- **WHEN** the user opens a room in the selector in which they are a Viewer
- **THEN** the selector does not let them confirm that room as the target

### Requirement: Generated document card
A document a reply created SHALL be shown in the reply as a card with the file's type icon and name. In a chat that runs on an agent the card SHALL add the line "created by <agent name>". A click on the card SHALL open the document. The card SHALL NOT state a page count.

#### Scenario: Document from an agent
- **WHEN** the agent "Legal Reviewer" creates "Proposal for Acme Corp.docx" in a reply
- **THEN** the reply shows a card with the document icon, that name and "created by Legal Reviewer", and a click opens the document

#### Scenario: Document from the default agent
- **WHEN** the default agent creates a document
- **THEN** the card shows the icon and the name, with no "created by" line

### Requirement: Cards stay with the conversation
The attachments and the document cards of a message SHALL be shown the same way when the conversation is opened again later.

#### Scenario: Reopened conversation
- **WHEN** the user reopens yesterday's conversation in which a document was created
- **THEN** the reply still shows the document card, and a click opens the document
