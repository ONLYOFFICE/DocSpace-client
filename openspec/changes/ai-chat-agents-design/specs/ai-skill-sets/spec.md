# Spec Delta

## Purpose

Defines the Skill sets list (Instructions rooms) and what an opened skill set shows about its skills, how a skill is read and how it is edited: boards 11 "Skill sets", 12 "Skill set open" and 13 "Edit skill". A skill is a Markdown file with a frontmatter (`name`, `description`) followed by its instructions.

Implementation: `packages/shared/utils/skillFile.ts`; in the client the table columns of the two lists (`TableStore`, `TableHeader`, `SkillSetsRowData`, `SkillsRowData`), `SkillsStore` for the skill files read, the Details view and its `SkillSetInfo`, the files context options and `components/dialogs/EditSkillDialog` with its Markdown toolbar.

## ADDED Requirements

### Requirement: Columns of the Skill sets list
In the table view the Skill sets list SHALL show, in this order, Name, Skills (`Common:Skills`), the number of the set's files, Owner (`Common:Owner`), with the owner's avatar, and Last modified (`Common:LastModified`), the date and time of the set's last change. Name SHALL always be shown and the other columns MAY be hidden. Name, Owner and Last modified SHALL sort the list. Each list SHALL keep its own column choice and widths.

#### Scenario: Skill sets in the table
- **WHEN** a user opens Skill sets in the table view
- **THEN** the columns read Name, Skills, Owner and Last modified, and "Document assistant" with three skills shows 3 under Skills

#### Scenario: Sorted by owner
- **WHEN** the user sorts the list by Owner
- **THEN** the skill sets are ordered by their owners' names

### Requirement: Skill set in the Info panel
The Details tab of a skill set SHALL show its owner, its content as the number of its skills ("Skills: N"), its modification date, who modified it last, its creation date and its tags, and SHALL show no room type and no storage size. Under the properties it SHALL list the set's skills, each by its name and the command it is called by. A list that cannot be read SHALL be left out.

#### Scenario: Skill set selected
- **WHEN** a user selects "Document assistant", which holds three skills, with the Info panel open on Details
- **THEN** the properties read "Skills: 3" and the panel lists the three skills with their commands, "/document-summary" among them

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

### Requirement: Edit skill
A skill's menu SHALL offer "Edit skill" (`Common:EditSkill`) to those who may edit and rename the file, and to no one else. It SHALL open a modal dialog with the Name, the command that name gives ("Command in chat:", `Common:SkillCommandInChat`), the Description with a hint that it tells the assistant when to apply the skill (`Common:SkillDescriptionHint`), and the Instructions (`Common:SkillInstructions`) in a Markdown editor under a toolbar.

#### Scenario: Open
- **WHEN** a user who may edit the skill chooses "Edit skill"
- **THEN** the dialog opens on the skill's name, command, description and instructions

#### Scenario: Read-only user
- **WHEN** a user who may only read the skill set opens a skill's menu
- **THEN** no "Edit skill" is offered

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
