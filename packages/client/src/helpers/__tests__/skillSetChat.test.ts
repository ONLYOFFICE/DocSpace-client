import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import { getUseInChatSkillSet } from "../skillSetChat";

const skillSet = { id: 12, title: "Sales assistant", isRoom: true, roomType: RoomsType.InstructionsRoom };
const openSet = { id: 12, title: "Sales assistant", roomType: RoomsType.InstructionsRoom };
const skill = { id: 40, title: "Document summary.md", fileExst: ".md", folderId: 12 };

describe("getUseInChatSkillSet", () => {
  it("connects a skill set of the list itself", () => {
    expect(getUseInChatSkillSet(skillSet)).toEqual({ id: 12, title: "Sales assistant" });
  });

  it("connects the open set for one of its skills", () => {
    expect(getUseInChatSkillSet(skill, openSet)).toEqual({ id: 12, title: "Sales assistant" });
  });

  it("offers nothing for another room, a folder or a file outside a skill set", () => {
    expect(getUseInChatSkillSet({ ...skillSet, roomType: RoomsType.KnowledgeRoom })).toBeNull();
    expect(getUseInChatSkillSet({ id: 3, title: "Folder", isFolder: true }, openSet)).toBeNull();
    expect(getUseInChatSkillSet({ ...skill, fileExst: ".docx" }, openSet)).toBeNull();
    expect(getUseInChatSkillSet(skill, { ...openSet, roomType: RoomsType.CustomRoom })).toBeNull();
    expect(getUseInChatSkillSet({ ...skill, folderId: 99 }, openSet)).toBeNull();
    expect(getUseInChatSkillSet(skill, null)).toBeNull();
  });
});
