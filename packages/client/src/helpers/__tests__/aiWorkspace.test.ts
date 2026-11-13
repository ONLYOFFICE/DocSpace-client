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
  const search = (url: string) => `?${url.split("?")[1]}`;

  it.each([
    RoomsType.AiProjectRoom,
    RoomsType.InstructionsRoom,
    RoomsType.KnowledgeRoom,
  ])("keeps both tabs of type %s on that list of the section", (type) => {
    for (const isTemplates of [false, true]) {
      const url = getAiWorkspaceTabUrl(isTemplates, type);
      expect(url).toMatch(/^\/ai-rooms\/filter\?/);
      expect(new URLSearchParams(search(url)).get("searchArea")).toBe("AiHub");
      expect(getAiWorkspaceListType(search(url))).toBe(type);
      expect(isAiWorkspaceTemplates(search(url))).toBe(isTemplates);
    }
  });
});
