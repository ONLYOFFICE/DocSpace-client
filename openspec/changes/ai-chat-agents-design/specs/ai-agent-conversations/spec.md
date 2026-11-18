# Spec Delta

## Purpose

Defines what a conversation belongs to, an agent or the default agent, which conversations each history lists, how the chat moves between agents, and the rules a chat follows while it runs on an agent, on the agent's page and in the chat panel alike. It replaces the single per-user conversation scope of the `ai-projects` change.

Implementation: the ai-chat library's threads store and history, ui-kit's chat store and bridges, the client's `Shell`, `AiPresetsBridge` and sidebar, and ASC.AI.Chat for the scope of a conversation.

## ADDED Requirements

### Requirement: A conversation belongs to one agent
Every conversation SHALL belong to the agent it was started on, or to the default agent when it was started with no agent picked, and SHALL keep that for as long as it exists. A conversation SHALL NOT be moved to another agent, and "New chat" (`Common:AINewChat`) SHALL start a conversation on the agent the chat runs on.

#### Scenario: Started on an agent
- **WHEN** a Member starts a conversation on the agent "Legal Reviewer" and later opens it again
- **THEN** it opens on "Legal Reviewer"

#### Scenario: New chat on an agent
- **WHEN** a Member chooses "New chat" while the chat runs on "Legal Reviewer"
- **THEN** the new conversation belongs to "Legal Reviewer"

### Requirement: History of an agent
While the chat runs on an agent, its chat history (`Common:ChatHistory`), on the agent's page and in the chat panel, SHALL list only the user's conversations with that agent, and its search SHALL look only among them.

#### Scenario: Three of eight
- **WHEN** a Member with three conversations with "Legal Reviewer" and five with other agents opens the history on "Legal Reviewer"
- **THEN** the three are listed and the other five are not

### Requirement: History of the default agent
While the chat runs on the default agent, its chat history SHALL list all of the user's conversations, those with agents included. Until the AI storage can list them together, it SHALL list the conversations that belong to no agent: the storage lists a conversation of an agent for that agent only (`ai-projects-api` "Conversations of a project").

#### Scenario: Default agent
- **WHEN** the same Member opens the history on the default agent
- **THEN** the eight conversations with agents and the conversations with the default agent are all listed

### Requirement: Recent in the sidebar
The sidebar's Recent (`Common:AIChatRecent`) SHALL list the user's latest conversations whatever agent they belong to, and its "Show more" (`Common:ShowMore`) SHALL open the history of all conversations. Until the AI storage can list them together, Recent SHALL list the latest conversations that belong to no agent.

#### Scenario: Mixed conversations
- **WHEN** a user's latest conversations are two with "Legal Reviewer" and one with the default agent
- **THEN** Recent lists all three

### Requirement: Opening a conversation of another agent
Opening a conversation from Recent or from the default agent's history SHALL open it on the agent it belongs to. In the chat panel the panel SHALL switch to that agent. From the sidebar the agent's page SHALL open, or the AI Chat page for a conversation of the default agent.

#### Scenario: From Recent
- **WHEN** a user on the Rooms section clicks a conversation with "Legal Reviewer" in Recent
- **THEN** the page of "Legal Reviewer" opens on that conversation

#### Scenario: From the panel's history
- **WHEN** a user opens the history in the chat panel on the default agent and clicks a conversation with "Legal Reviewer"
- **THEN** the panel switches to "Legal Reviewer" and shows that conversation

### Requirement: Conversations of an agent the user cannot open
A conversation whose agent the user can no longer open SHALL NOT be listed in any history or in Recent. When the user's access to the agent ends, by removal or by leaving, the server deletes the conversations they started with it, with their files, and they SHALL NOT come back with a new membership. A change of owner deletes none. After an agent is deleted its conversations SHALL no longer be listed for anyone.

#### Scenario: Removed from an agent
- **WHEN** an Agent manager removes a Member who has conversations with the agent
- **THEN** those conversations are deleted and leave the Member's Recent and history

#### Scenario: Invited again
- **WHEN** that user is invited to the agent again
- **THEN** their earlier conversations with it are not listed and cannot be opened

#### Scenario: Owner handed over
- **WHEN** the Agent owner hands the agent over and stays as Agent manager
- **THEN** their conversations with the agent are still listed

### Requirement: Picking an agent in the chat panel
Picking an agent, or the default agent, in the chat panel SHALL switch the chat to it. A chat with no messages SHALL continue on the picked agent. A chat with messages SHALL stay in the history of the agent it belongs to, and a new conversation SHALL start on the picked agent.

#### Scenario: Empty chat
- **WHEN** a user with an empty chat on the default agent picks "Legal Reviewer"
- **THEN** the chat is on "Legal Reviewer" and no conversation was created for the default agent

#### Scenario: Chat with messages
- **WHEN** a user with three messages on the default agent picks "Legal Reviewer"
- **THEN** a new empty conversation opens on "Legal Reviewer", and the earlier one is listed in the default agent's history

### Requirement: Model of a chat on an agent
A chat that runs on an agent SHALL run on the agent's model, or on the portal's default chat model when the agent stores none. The composer SHALL show that model as a label that no role can change there, on the agent's page and in the chat panel alike.

#### Scenario: Member in the chat panel
- **WHEN** a Member picks an agent in the chat panel of a room
- **THEN** the composer shows the agent's model as plain text that cannot be changed

### Requirement: Sources of a chat on an agent
A chat that runs on an agent SHALL use the agent's skill sets and knowledge bases, and none that the user had connected on the default agent.

#### Scenario: Own knowledge base connected before
- **WHEN** a user who connected the knowledge base "Product documentation" on the default agent picks an agent that links only "Company policies"
- **THEN** the agent's chat lists and searches "Company policies" only

### Requirement: Only members chat with an agent
The chat SHALL run on an agent only for its members. A portal owner or DocSpace admin who is not a member of an agent SHALL NOT be offered it in any agent menu, and on its page SHALL get the "not a member" view (`Common:AIProjectNotMember`) with no conversation started.

#### Scenario: Admin outside the agent
- **WHEN** a DocSpace admin who is not a member of "Legal Reviewer" opens the agent menu of the chat panel
- **THEN** "Legal Reviewer" is not listed

### Requirement: Returning to the default agent
Closing the chat panel, or leaving an agent's page, SHALL return the chat to the default agent: opened again elsewhere, the chat SHALL run on the portal's default model with none of the agent's skill sets or knowledge bases connected.

#### Scenario: Panel closed on an agent
- **WHEN** a user closes the chat panel while it runs on "Legal Reviewer" and opens it again
- **THEN** the title reads "AI Chat" (`Common:AIChatButton`) and the chat is on the default agent

### Requirement: Agent lost while the chat runs on it
When the agent the chat panel runs on is deleted, or the user loses access to it, the panel SHALL return to the default agent and tell the user that the agent is no longer available.

#### Scenario: Deleted by the owner
- **WHEN** the agent owner deletes an agent while a Member's chat panel runs on it
- **THEN** the Member's panel shows the default agent and a notice that the agent is no longer available

### Requirement: A reload keeps the open chat
Outside an agent's page, a reload SHALL bring back the fullscreen chat the user had open, on the conversation that was on screen, or on the chat or its history when no conversation was. A conversation that is no longer listed SHALL give way to a new chat. Closing the chat, leaving the fullscreen view or opening an agent's page SHALL forget it. It SHALL be kept per browser tab and per user.

#### Scenario: Reload in a conversation
- **WHEN** a user reloads the page while the fullscreen chat shows one of their conversations
- **THEN** the fullscreen chat opens again on that conversation, not on the agents list under it

#### Scenario: Conversation deleted in another tab
- **WHEN** the conversation that was on screen was deleted before the reload
- **THEN** the fullscreen chat opens on a new chat

#### Scenario: Chat closed before the reload
- **WHEN** the user closed the chat and then reloads the page
- **THEN** the page shows what its address names, with no chat over it

### Requirement: Deleting a conversation of an agent
Deleting a conversation of an agent SHALL take effect at once: the conversation leaves the history, Recent and the search, and the chat on screen gives way to a new chat when it was the one deleted. Its artifacts and attachments are removed later by the server and SHALL NOT be listed on Content meanwhile.

#### Scenario: Delete from the history
- **WHEN** a Member deletes the conversation on screen, which has files, from the agent's history
- **THEN** it is gone from the history at once, a new chat opens and Content shows both sections empty

### Requirement: Conversations are private
A conversation SHALL be listed and readable for its author only. No role SHALL see another member's conversations with an agent: not the agent owner, not an Agent manager, not a portal owner or DocSpace admin.

#### Scenario: Agent owner opens the history
- **WHEN** the agent owner opens the chat history on an agent that five members chat with
- **THEN** only the owner's own conversations are listed
