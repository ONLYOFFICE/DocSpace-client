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
});
