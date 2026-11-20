# Spec Delta

## Purpose

Defines how the messages of a conversation look in the redesign: replies without a logo, the user's attachments inside their own message, and cards for the files a reply produced.

Implementation: the ai-chat library draws the messages; ui-kit supplies the document card and the "Save to room…" action; the client passes the name of the agent the chat runs on. The library and ui-kit can draw a logo at the start of a reply; the client hands them none (decided 2026-11-20, against the boards).

## ADDED Requirements

### Requirement: No logo beside replies
A reply SHALL carry no logo, whether the chat runs on an agent or on the default agent: the agent's room logo is not drawn in the conversation.

#### Scenario: Conversation with an agent
- **WHEN** a Member reads a conversation with the agent "Legal Reviewer"
- **THEN** the replies carry no logo

#### Scenario: Default agent
- **WHEN** a user reads a conversation with the default agent
- **THEN** the replies carry no logo

### Requirement: Attachments inside the user's message
A user's message SHALL show its attachments inside the message, under the text: an image as a preview with its file name under it, any other file as a chip with its type icon and name.

#### Scenario: Image
- **WHEN** the user sends a message with the image "Whiteboard notes.jpg"
- **THEN** the message shows the text, then the image preview with "Whiteboard notes.jpg" under it

#### Scenario: Document
- **WHEN** the user sends a message with "Service agreement v3.docx" attached
- **THEN** the message shows the text, then a chip with the document icon and that name

### Requirement: Generated image card
An image a reply generated SHALL be shown in a card with a footer: the image's file name, the word "generated", a Download action and a "Save to room…" action.

#### Scenario: Chart
- **WHEN** a reply generates a chart
- **THEN** the chart is shown in a card whose footer names the file as generated and offers Download and "Save to room…"

### Requirement: Generated files are never shown as unsaved
A generated file SHALL be available as a portal file from the moment its card appears. The interface SHALL NOT mark a generated file as unsaved and SHALL NOT ask the user to save it before it can be opened or downloaded.

#### Scenario: Card just appeared
- **WHEN** a reply has just produced an image
- **THEN** the card carries no "Not saved" mark and Download works at once

### Requirement: Save to room
"Save to room…" SHALL ask for a room or folder the user may add files to and SHALL put a copy of the generated file there, leaving the first copy where it is.

#### Scenario: Copy to a room
- **WHEN** the user chooses "Save to room…" on a generated chart and picks the room "Design for Marketing"
- **THEN** a copy of the image appears in that room and the card stays as it was

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
The attachments and the file cards of a message SHALL be shown the same way when the conversation is opened again later.

#### Scenario: Reopened conversation
- **WHEN** the user reopens yesterday's conversation in which a document was created
- **THEN** the reply still shows the document card, and a click opens the document
