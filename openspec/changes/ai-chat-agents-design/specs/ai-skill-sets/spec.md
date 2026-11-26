# Spec Delta

## Purpose

Defines the Skill sets list (Instructions rooms) and what an opened skill set shows about its skills, how a skill is read and how it is edited: boards 11 "Skill sets", 12 "Skill set open" and 13 "Edit skill". A skill is a Markdown file with a frontmatter (`name`, `description`) followed by its instructions.

Implementation: `packages/shared/utils/skillFile.ts`; in the client the table columns of the two lists (`TableStore`, `TableHeader`, `SkillSetsRowData`, `SkillsRowData`), `SkillsStore` for the skill files read, the Details view with its `SkillSetInfo` and `UsedByAgents`, `getAiRoomProjects` in `packages/shared/api/ai/projects.ts`, the files context options, `components/dialogs/EditSkillDialog` with its Markdown toolbar and `components/dialogs/GenerateSkillDialog`.

## ADDED Requirements

### Requirement: Columns of the Skill sets list
In the table view the Skill sets list SHALL show, in this order, Name, Skills (`Common:Skills`), the number of the set's files, Used by (`Common:UsedBy`), Owner (`Common:Owner`), with the owner's avatar, and Last modified (`Common:LastModified`), the date and time of the set's last change. Name SHALL always be shown and the other columns MAY be hidden. Name, Owner and Last modified SHALL sort the list. Each list SHALL keep its own column choice and widths.

#### Scenario: Skill sets in the table
- **WHEN** a user opens Skill sets in the table view
- **THEN** the columns read Name, Skills, Used by, Owner and Last modified, and "Document assistant" with three skills, used by two agents, shows 3 under Skills and "2 agents" under Used by

#### Scenario: Sorted by owner
- **WHEN** the user sorts the list by Owner
- **THEN** the skill sets are ordered by their owners' names

### Requirement: Skill set in the Info panel
The Details tab of a skill set SHALL show its owner, its content as the number of its skills ("Skills: N"), its modification date, who modified it last, its creation date and its tags, and SHALL show no room type and no storage size. Under the properties it SHALL list the set's skills, each by its name and the command it is called by, and then the agents that use the set ("Agents that use a skill set"). A list that cannot be read SHALL be left out.

#### Scenario: Skill set selected
- **WHEN** a user selects "Document assistant", which holds three skills, with the Info panel open on Details
- **THEN** the properties read "Skills: 3" and the panel lists the three skills with their commands, "/document-summary" among them

### Requirement: Used by of a skill set
Used by SHALL tell how many agents use the set, counting every such agent, readable by the user or not: "1 agent" (`Common:OneAgent`), "N agents" (`Common:AgentsNumber`), and a dash for a set no agent uses. The table column and the tile of a set SHALL tell it under the same label; the compact row SHALL tell it after the label and leave it out for a set no agent uses. It SHALL follow a change without a reload.

#### Scenario: One agent, and none
- **WHEN** a user opens Skill sets, where one agent uses "Legal tone" and none uses "Sales assistant"
- **THEN** "Legal tone" reads "1 agent" under Used by and "Sales assistant" a dash

#### Scenario: An agent links the set meanwhile
- **WHEN** an agent links "Sales assistant", used by no agent, while the list is open
- **THEN** its Used by reads "1 agent" without a reload

### Requirement: Agents that use a skill set
The Details tab of a skill set SHALL list, under "Used by agents" (`Common:UsedByAgents`), the agents that use the set, each by its logo and its name, sorted by name, and only those the user may read. Agents past the first hundred SHALL be told by their number ("+N"). A set with no agent to list SHALL show no such list. The list SHALL be read again when the set's Used by number changes.

#### Scenario: Set used by two agents
- **WHEN** a user selects "Document assistant", which "Contract reviewer" and "Sales desk" use, with the Info panel open on Details
- **THEN** "Used by agents" lists "Contract reviewer" and "Sales desk"

#### Scenario: Agents the user may not read
- **WHEN** a user selects a set used by two agents, neither of which the user is a member of
- **THEN** its row reads "2 agents" under Used by and its Details show no "Used by agents"

### Requirement: Skills of an opened skill set
In the table view of an opened skill set the columns SHALL be Name, the skill's name without the `.md` extension, Description (`Common:DescriptionLabel`), the description the skill gives in its file with the full text on hover, and Last modified. A skill with no description, or whose file cannot be read, SHALL show an empty Description.

#### Scenario: Open a skill set
- **WHEN** a user opens the skill set "Document assistant"
- **THEN** each skill is listed by its name, its description and the date it was last changed

### Requirement: Command of a skill
The command a skill is called by, a slash and the skill's name, SHALL be shown in the skill's Details, in the skill list of its set's Details and under the name in the Edit skill dialog. The table of a skill set SHALL NOT have a Command column: its type column keeps the file type.

#### Scenario: Skill in the list
- **WHEN** a user selects "Document summary.md" in the skill set "Document assistant"
- **THEN** its Details read "/document-summary" under Command (`Common:SkillCommand`)

### Requirement: New skill
In a skill set the create menu's entry for a skill written from the template SHALL read "New skill" (`Common:NewSkill`).

#### Scenario: Create menu
- **WHEN** a user who may create files opens the create menu of a skill set
- **THEN** its first entry is "New skill"

### Requirement: Skill in the Info panel
The Details tab of a skill SHALL show its description first, when the file gives one, then the properties Skill set (`Common:SkillSet`), Owner, Command, Modification date, Last modified by and Creation date, and SHALL end with "View instructions" (`Common:ViewInstructions`). It SHALL show no file type, extension, size or versions. Skill set SHALL name the set the skill lies in directly.

#### Scenario: Skill selected
- **WHEN** a user selects "Document summary.md" with the Info panel open on Details
- **THEN** the panel shows the description, then Skill set "Document assistant", the owner, "/document-summary" and the dates, then "View instructions"

### Requirement: View instructions
"View instructions" SHALL open a dialog titled by the skill's name that shows its instructions, without the frontmatter, read-only. For those who may edit and rename the skill the dialog SHALL offer Edit (`Common:EditButton`), which turns it into the Edit skill form; everyone SHALL be offered Close. A file that cannot be read SHALL show that something went wrong, with no Edit.

#### Scenario: Reader
- **WHEN** a user who may only read the skill set chooses "View instructions"
- **THEN** the instructions are shown read-only with Close and no Edit

#### Scenario: Editor
- **WHEN** a user who may edit the skill chooses Edit in that dialog
- **THEN** the dialog shows the Edit skill form on the same skill

### Requirement: Formatted instructions
The dialog of "View instructions" SHALL show the instructions laid out as formatted text: the Markdown rendered with its headings, lists, tables and code, not shown as its source and not in an editor. HTML in the instructions SHALL be shown as text.

#### Scenario: Heading and list
- **WHEN** a user opens the instructions of a skill whose text has "## Steps" and a numbered list under it
- **THEN** the dialog shows the heading "Steps" and the numbered list, with no "##" and no editor

### Requirement: Opening a skill
A click on a skill in the list of its set and Preview (`Common:Preview`) in the skill's menu SHALL open the dialog of "View instructions", for those who may edit the skill too. A skill SHALL NOT be opened in the document editor.

#### Scenario: Click on a skill
- **WHEN** a user who may edit the skill clicks "Document summary" in the list of its set
- **THEN** its instructions are shown read-only, with Edit, and not the Edit skill form

#### Scenario: Reader clicks a skill
- **WHEN** a user who may only read the skill set clicks "Document summary" in the list
- **THEN** its instructions are shown read-only with no Edit

#### Scenario: Preview
- **WHEN** a user chooses Preview in the menu of "Document summary"
- **THEN** its instructions are shown read-only in the dialog and the document editor is not opened

### Requirement: The skill dialog
The instructions of a skill, the New skill and Edit skill forms and "Create skill with AI" SHALL open as one modal dialog in the middle of the window, not as a side panel. On a desktop it SHALL be 720px wide, and narrower only when the window is; with the instructions or a skill's form in it, it SHALL be as tall as the window allows, the instructions taking the height the other fields leave. Its buttons SHALL keep their own width.

#### Scenario: Width of the dialog
- **WHEN** a user opens a skill's instructions, its Edit skill form or "Create skill with AI" in a window 1440px wide
- **THEN** the dialog is 720px wide

### Requirement: Edit skill
A skill's menu SHALL offer "Edit skill" (`Common:EditSkill`) to those who may edit and rename the file, and to no one else. It SHALL open a modal dialog with the Name, the command that name gives ("Command in chat:", `Common:SkillCommandInChat`), the Description with a hint that it tells the assistant when to apply the skill (`Common:SkillDescriptionHint`), and the Instructions (`Common:SkillInstructions`) in a Markdown editor under a toolbar.

#### Scenario: Open
- **WHEN** a user who may edit the skill chooses "Edit skill"
- **THEN** the dialog opens on the skill's name, command, description and instructions

#### Scenario: Read-only user
- **WHEN** a user who may only read the skill set opens a skill's menu
- **THEN** no "Edit skill" is offered

### Requirement: Create skill with AI
Where AI is available, the create menu of a skill set SHALL offer "Create skill with AI" (`Common:CreateSkillWithAI`). It SHALL ask for a Name, which opens as "New skill", and a Description of what the skill should do, and SHALL end in "Generate skill" (`Common:GenerateSkill`) and Cancel, with nothing to save yet. "Generate skill" SHALL be disabled until the skill is described.

#### Scenario: Request for a skill
- **WHEN** a user chooses "Create skill with AI" in the create menu of a skill set
- **THEN** the dialog opens on the name "New skill" and an empty description, with "Generate skill" disabled and no Save

### Requirement: Generated skill
The generated skill SHALL be shown in the fields of the Edit skill form, named by the AI when the name was left as it opened, with Save in place of "Generate skill" and a way back to the request. Nothing SHALL be stored before Save.

#### Scenario: Create skill with AI
- **WHEN** a user describes a skill, leaves the name "New skill" and chooses "Generate skill"
- **THEN** the dialog shows the generated skill's name, command, description and instructions, with Save

### Requirement: Markdown toolbar
The toolbar over the instructions SHALL offer Bold, Italic, Heading, Bulleted list, Numbered list, Code and Link, in that order, each named on hover, and SHALL carry the note "Markdown supported" (`Common:MarkdownSupported`). Using a button SHALL keep the focus in the editor. The toolbar SHALL be disabled while the skill loads or saves.

#### Scenario: Toolbar
- **WHEN** a user opens "Edit skill"
- **THEN** the seven buttons are shown over the instructions with "Markdown supported" at their end

### Requirement: What the toolbar buttons do
Bold, Italic and Code SHALL wrap the selection in their marks and keep it selected, take the marks off a selection they already wrap, and with nothing selected insert an empty pair with the caret inside. Heading, Bulleted list and Numbered list SHALL mark every line of the selection, replacing another line mark, and unmark the lines when all of them already carry it. Link SHALL make the selection a link and select its address.

#### Scenario: Bold twice
- **WHEN** the user selects "Read the whole document" and uses Bold twice
- **THEN** the text is first "**Read the whole document**" and then plain again, still selected

#### Scenario: List over a heading
- **WHEN** the user selects a line "## Steps" and uses Bulleted list
- **THEN** the line reads "- Steps"

### Requirement: Saving a skill
Save SHALL rewrite the file in place with the new description and instructions and, when the name changed, rename the file so that its command follows, then tell the user that the skill was saved (`Common:SkillSaved`). A name without a letter or a digit (`Common:SkillNameNeedsLetterOrDigit`), or an empty description, SHALL NOT be saved. A refusal of the Files service SHALL be shown and SHALL keep the dialog open.

#### Scenario: Name changed
- **WHEN** the user renames "Clause check" to "Risk review" and saves
- **THEN** the file is "Risk review.md", its command is "/risk-review" and the list shows it

#### Scenario: Refused
- **WHEN** the Files service refuses the saved file
- **THEN** its message is shown and the dialog stays open with the user's text

### Requirement: Use a skill set in the chat
A row of the Skill sets list SHALL offer "Use in chat", which opens the chat on the default agent in a new conversation with that skill set connected. A row of an opened skill set SHALL offer the same for one skill, with the skill's call in the draft.

#### Scenario: Set in a new chat
- **WHEN** a user chooses "Use in chat" on "Sales assistant"
- **THEN** a new chat opens on the default agent with "Sales assistant" connected

#### Scenario: Skill in a new chat
- **WHEN** a user chooses "Use in chat" on the skill "Document summary"
- **THEN** a new chat opens with its set connected and the draft reads "/document-summary "
