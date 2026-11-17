import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import {
  getAiWorkspaceCreatePayload,
  getAiWorkspaceListType,
  getAiWorkspaceTabUrl,
  hasAiWorkspaceTemplates,
  getAiWorkspaceTitle,
  isAiWorkspaceCreateRefused,
  isAiWorkspaceTemplates,
  isAgent,
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
  const search = (url: string) => `?${url.split("?")[1]}`;

  it("keeps both tabs of the agents on that list of the section", () => {
    for (const isTemplates of [false, true]) {
      const url = getAiWorkspaceTabUrl(isTemplates, RoomsType.AiProjectRoom);
      expect(url).toMatch(/^\/ai-rooms\/filter\?/);
      expect(new URLSearchParams(search(url)).get("searchArea")).toBe("AiHub");
      expect(getAiWorkspaceListType(search(url))).toBe(RoomsType.AiProjectRoom);
      expect(hasAiWorkspaceTemplates(search(url))).toBe(true);
      expect(isAiWorkspaceTemplates(search(url))).toBe(isTemplates);
    }
  });

  it.each([RoomsType.InstructionsRoom, RoomsType.KnowledgeRoom])(
    "gives the list of type %s no Templates tab",
    (type) => {
      const url = getAiWorkspaceTabUrl(true, type);
      expect(new URLSearchParams(search(url)).has("tab")).toBe(false);
      expect(getAiWorkspaceListType(search(url))).toBe(type);
      expect(hasAiWorkspaceTemplates(search(url))).toBe(false);
      // A stale address with the tab still shows the list.
      expect(isAiWorkspaceTemplates(`${search(url)}&tab=templates`)).toBe(false);
    },
  );
});

describe("isAgent", () => {
  it.each([
    ["a project read through the projects API", { id: 1, isAIProject: true }, true],
    ["an agent room of the Files list", { id: 1, isRoom: true, roomType: RoomsType.AiProjectRoom }, true],
    ["a skill set", { id: 1, isRoom: true, roomType: RoomsType.InstructionsRoom }, false],
    ["a knowledge base", { id: 1, isRoom: true, roomType: RoomsType.KnowledgeRoom }, false],
    ["a custom room", { id: 1, isRoom: true, roomType: RoomsType.CustomRoom }, false],
    ["a file", { id: 1, fileExst: ".docx" }, false],
    ["nothing", null, false],
  ])("tells %s", (_, item, expected) => {
    expect(isAgent(item)).toBe(expected);
  });
});

describe("isAiWorkspaceCreateRefused", () => {
  it.each([
    [RoomsType.KnowledgeRoom, false, true],
    [RoomsType.KnowledgeRoom, true, false],
    [RoomsType.InstructionsRoom, false, false],
    [RoomsType.AiProjectRoom, false, false],
  ])("the list of type %s with vectorization on: %s refuses New room: %s", (type, vectorizationEnabled, refused) => {
    expect(isAiWorkspaceCreateRefused(`?type=${type}`, vectorizationEnabled)).toBe(refused);
  });
});
