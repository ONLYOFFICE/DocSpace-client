import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import {
  getAiWorkspaceCreatePayload,
  getAiWorkspaceListType,
  getAiWorkspaceTabUrl,
  getAiWorkspaceTitle,
  isAiWorkspaceTemplates,
} from "../aiWorkspace";

const t = (key: string) => key;

describe("AI Chat section lists", () => {
  it.each([
    ["", RoomsType.AiProjectRoom, "Common:Agents", { isAiProjectCreate: true }],
    [`?type=${RoomsType.AiProjectRoom}`, RoomsType.AiProjectRoom, "Common:Agents", { isAiProjectCreate: true }],
    [
      `?searchArea=AiHub&type=${RoomsType.InstructionsRoom}`,
      RoomsType.InstructionsRoom,
      "Common:SkillSets",
      { startRoomType: RoomsType.InstructionsRoom },
    ],
    [
      `?type=${RoomsType.KnowledgeRoom}&page=1`,
      RoomsType.KnowledgeRoom,
      "Common:AIProjectKnowledgeRooms",
      { startRoomType: RoomsType.KnowledgeRoom },
    ],
    // Several types, or one from another section, are the agents' list.
    [`?type=${RoomsType.KnowledgeRoom}&type=${RoomsType.InstructionsRoom}`, RoomsType.AiProjectRoom, "Common:Agents", { isAiProjectCreate: true }],
    [`?type=${RoomsType.CustomRoom}`, RoomsType.AiProjectRoom, "Common:Agents", { isAiProjectCreate: true }],
  ])("%s lists %s", (search, type, title, payload) => {
    expect(getAiWorkspaceListType(search)).toBe(type);
    expect(getAiWorkspaceTitle(t, search)).toBe(title);
    expect(getAiWorkspaceCreatePayload(search)).toEqual(payload);
  });
});

describe("AI Chat section list tabs", () => {
  const params = (url: string) => new URLSearchParams(url.split("?")[1]);

  it("keeps both tabs on the section's path", () => {
    for (const isTemplates of [false, true])
      expect(
        getAiWorkspaceTabUrl(isTemplates, RoomsType.KnowledgeRoom),
      ).toMatch(/^\/ai-rooms\/filter\?/);
  });

  it("opens the agents' own tab on the section's list", () => {
    const search = params(getAiWorkspaceTabUrl(false, RoomsType.AiProjectRoom));
    expect(search.get("searchArea")).toBe("AiHub");
    expect(search.getAll("type")).toEqual([String(RoomsType.AiProjectRoom)]);
    expect(isAiWorkspaceTemplates(`?${search}`)).toBe(false);
  });

  it.each([
    RoomsType.AiProjectRoom,
    RoomsType.InstructionsRoom,
    RoomsType.KnowledgeRoom,
  ])("opens the templates of type %s, still that list", (type) => {
    const search = `?${params(getAiWorkspaceTabUrl(true, type))}`;
    expect(isAiWorkspaceTemplates(search)).toBe(true);
    expect(getAiWorkspaceListType(search)).toBe(type);
  });

  it("narrows a typed list's own tab to its type", () => {
    const search = `?${params(getAiWorkspaceTabUrl(false, RoomsType.InstructionsRoom))}`;
    expect(isAiWorkspaceTemplates(search)).toBe(false);
    expect(getAiWorkspaceListType(search)).toBe(RoomsType.InstructionsRoom);
  });
});
