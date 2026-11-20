# Spec Delta

## Purpose

Defines the Knowledge bases list (Knowledge rooms) and an opened knowledge base: their columns, the indexing state of a base and of its files, and what the Info panel tells about each: boards 14 "Knowledge bases" and 15 "Knowledge base open".

Implementation: in the client the table columns of the two lists (`TableStore`, `TableHeader`, `KnowledgeBasesRowData`, `KnowledgeFilesRowData`), `KnowledgeBasesStore` for the state of a base, `KnowledgeBaseStatusBadge`, the Details view with its `UsedByAgents`; in shared the file badges and `FailedVectorizationBadge`.

## ADDED Requirements

### Requirement: Columns of the Knowledge bases list
In the table view the Knowledge bases list SHALL show, in this order, Name, Used by (`Common:UsedBy`), Owner (`Common:Owner`), with the owner's avatar, and Last modified (`Common:LastModified`), the date of the base's last change. Name SHALL always be shown and the other columns MAY be hidden. Name, Owner and Last modified SHALL sort the list. The list SHALL keep its own column choice and widths.

#### Scenario: Knowledge bases in the table
- **WHEN** a user opens Knowledge bases in the table view
- **THEN** the columns read Name, Used by, Owner and Last modified, with no Type, Tags or Storage column, and "Company policies", used by two agents, shows 2 under Used by

### Requirement: Indexing state of a knowledge base
In the table a knowledge base SHALL carry, after its name, "Indexing" (`Common:Indexing`) while any of its files is being indexed and none has failed, and "Error" (`Common:Error`) when any of its files failed, with a hint that some files could not be indexed and that opening the base shows which (`Common:KnowledgeBaseIndexingFailedInfo`). A base whose files are all indexed, or that holds none, SHALL carry no mark.

#### Scenario: One file failed
- **WHEN** one of the 48 files of "Company policies" failed to index while two are still being indexed
- **THEN** its row carries "Error", and its hint says to open the base to see which files

#### Scenario: All indexed
- **WHEN** every file of "Company glossary" is indexed
- **THEN** its row carries no mark

### Requirement: The list does not follow indexing live
The state of a knowledge base SHALL be read from its files when its row is shown, and again when its number of files changes or its Details are opened. The list SHALL NOT follow indexing live, and a state that cannot be read SHALL show no mark.

#### Scenario: Indexing finished meanwhile
- **WHEN** the last file of "Product documentation" finishes indexing while the list is open
- **THEN** the row keeps "Indexing" until the base's Details are opened or a file is added or removed

### Requirement: Knowledge base in the Info panel
The Details tab of a knowledge base SHALL show its owner, its content as the number of its files ("Files: N"), its Status (`Common:Status`): "Indexing", "Error" or "Indexed" (`Common:Indexed`), its modification date, who modified it last, its creation date, its tags and its storage, and SHALL show no room type. Status SHALL be left out while it is not known and for a base with no files.

#### Scenario: Indexed base
- **WHEN** a user selects "Company policies", whose 48 files are indexed, with the Info panel open on Details
- **THEN** the properties read "Files: 48" and Status "Indexed"

### Requirement: Used by of a knowledge base
Used by SHALL be the number of agents that use the base, told as a skill set's is (`ai-skill-sets`, "Used by of a skill set"): every such agent is counted, the table column, the tile and the compact row tell the same number, and it follows a change without a reload.

#### Scenario: Base used by two agents in the list
- **WHEN** a user opens Knowledge bases, where two agents use "Company policies" and none uses "Company glossary"
- **THEN** "Company policies" reads 2 under Used by and "Company glossary" reads 0

### Requirement: Agents that use a knowledge base
The Details tab of a knowledge base SHALL list, under "Used by agents" (`Common:UsedByAgents`), the agents that use the base, as the Details of a skill set list theirs (`ai-skill-sets`, "Agents that use a skill set"): by logo and name, sorted by name, only the agents the user may read, and no list when there is none to show.

#### Scenario: Base used by two agents
- **WHEN** a user selects "Company policies", which "Contract reviewer" and "Onboarding guide" use, with the Info panel open on Details
- **THEN** "Used by agents" lists "Contract reviewer" and "Onboarding guide"

#### Scenario: Base no agent uses
- **WHEN** a user selects "Company glossary", which no agent uses
- **THEN** its row reads 0 under Used by and its Details show no "Used by agents"

### Requirement: Files of an opened knowledge base
In the table view of an opened knowledge base the columns SHALL be Name, Size (`Common:Size`), Added by (`Common:AddedBy`), the user who added the file, and Added (`Common:Added`), the date it was added. Name SHALL always be shown and the other columns MAY be hidden. Every column SHALL sort the files.

#### Scenario: Open a knowledge base
- **WHEN** a user opens "Company policies" in the table view
- **THEN** each file is listed with its size, who added it and when

### Requirement: Indexing state of a file
In the table and row views a file that is being indexed SHALL carry "Indexing" after its name, and a file whose indexing failed SHALL carry "Error", whose hint says that the file could not be prepared and offers "Try again" (`Common:TryAgain`) to those who may index it again. The tile view SHALL mark a failed file with the alert icon.

#### Scenario: Failed file
- **WHEN** a Content creator opens a knowledge base in which "Information security policy.pdf" failed to index
- **THEN** its row carries "Error", and the hint offers "Try again"

### Requirement: File in the Info panel
The Details tab of a file that has an indexing state SHALL show it as Status: "Indexing", "Error" or "Indexed". For a failed file it SHALL show above the properties a note that the file could not be prepared for AI and should be prepared again (`Common:PreparationForAIFailedInfo`). The note SHALL NOT name the cause of the failure.

#### Scenario: Failed file selected
- **WHEN** a user selects "Information security policy.pdf", whose indexing failed, with the Info panel open on Details
- **THEN** the note is shown above the properties and Status reads "Error"

### Requirement: Use a knowledge base in the chat
A row of the Knowledge bases list SHALL offer "Use in chat", which opens the chat on the default agent in a new conversation with that knowledge base connected. It SHALL NOT be offered while vectorization is off on the portal.

#### Scenario: Base in a new chat
- **WHEN** a user chooses "Use in chat" on "Company policies"
- **THEN** a new chat opens on the default agent with "Company policies" connected
