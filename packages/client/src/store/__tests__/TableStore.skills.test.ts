import { describe, expect, it } from "vitest";

import { FolderType, RoomsType } from "@docspace/shared/enums";

import TableStore from "../TableStore";

const create = ({
  isAiSectionFolder = false,
  roomType = null as RoomsType | null,
  parentRoomType = null as FolderType | null,
  type = null as string[] | null,
} = {}) => {
  const store = new TableStore(
    {} as never,
    { isAiSectionFolder } as never,
    { user: { id: "u1" } } as never,
    { isFrame: false } as never,
    {} as never,
    { roomType, parentRoomType, isIndexedFolder: false } as never,
    { usersStore: { contactsTab: null } } as never,
  );
  store.filesStore = { roomsFilter: { type } };
  return store;
};

describe("TableStore: skill sets", () => {
  it("keeps the columns of the Skill sets list apart from the other AI lists", () => {
    const skillSets = create({ isAiSectionFolder: true, type: [String(RoomsType.InstructionsRoom)] });
    const agents = create({ isAiSectionFolder: true, type: [String(RoomsType.AiProjectRoom)] });
    expect(skillSets.isSkillSetsList).toBe(true);
    expect(agents.isSkillSetsList).toBe(false);
    expect(skillSets.tableStorageName).toContain("skillSetsTableColumns");
    expect(skillSets.columnStorageName).toContain("skillSetsColumnsSize");
    expect(agents.tableStorageName).toContain("aiRoomsTableColumns");
  });

  it("lists an open skill set by its own columns", () => {
    const open = create({ roomType: RoomsType.InstructionsRoom });
    const other = create({ roomType: RoomsType.CustomRoom });
    expect(open.isSkillSet).toBe(true);
    expect(open.isSkillSetsList).toBe(false);
    expect(open.tableStorageName).toContain("skillsTableColumns");
    expect(open.columnInfoPanelStorageName).toContain("skillsColumnsSizeInfoPanel");
    expect(other.isSkillSet).toBe(false);
    expect(other.tableStorageName).toContain("filesTableColumns");
  });

  it("switches the columns of both tables", () => {
    const list = create({ isAiSectionFolder: true, type: [String(RoomsType.InstructionsRoom)] });
    list.setColumnEnable("OwnerSkillSets");
    expect(list.ownerSkillSetsColumnIsEnabled).toBe(false);
    const open = create({ roomType: RoomsType.InstructionsRoom });
    open.setColumnEnable("DescriptionSkill");
    expect(open.descriptionSkillColumnIsEnabled).toBe(false);
    expect(open.modifiedSkillColumnIsEnabled).toBe(true);
  });

  it("keeps the columns of the Knowledge bases list and of an open base apart", () => {
    const list = create({ isAiSectionFolder: true, type: [String(RoomsType.KnowledgeRoom)] });
    expect(list.isKnowledgeBasesList).toBe(true);
    expect(list.isSkillSetsList).toBe(false);
    expect(list.tableStorageName).toContain("knowledgeBasesTableColumns");
    expect(list.columnStorageName).toContain("knowledgeBasesColumnsSize");
    list.setColumnEnable("OwnerKnowledgeBases");
    expect(list.ownerKnowledgeBasesColumnIsEnabled).toBe(false);

    const open = create({ roomType: RoomsType.KnowledgeRoom });
    expect(open.isKnowledgeBase).toBe(true);
    expect(open.isKnowledgeBasesList).toBe(false);
    expect(open.isSkillSet).toBe(false);
    expect(open.tableStorageName).toContain("knowledgeFilesTableColumns");
    expect(open.columnInfoPanelStorageName).toContain("knowledgeFilesColumnsSizeInfoPanel");
    open.setColumnEnable("SizeKnowledgeFile");
    expect(open.sizeKnowledgeFileColumnIsEnabled).toBe(false);
    expect(open.createdKnowledgeFileColumnIsEnabled).toBe(true);

    const inFolder = create({ parentRoomType: FolderType.KnowledgeRoom });
    expect(inFolder.isKnowledgeBase).toBe(true);
  });
});
