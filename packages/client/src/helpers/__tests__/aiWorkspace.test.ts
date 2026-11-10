import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import {
  getAiWorkspaceCreatePayload,
  getAiWorkspaceListType,
  getAiWorkspaceTitle,
} from "../aiWorkspace";

const t = (key: string) => key;

describe("AI Workspace list", () => {
  it.each([
    ["", RoomsType.AiProjectRoom, "Common:AiWorkspace", { isAiProjectCreate: true }],
    [`?type=${RoomsType.AiProjectRoom}`, RoomsType.AiProjectRoom, "Common:AiWorkspace", { isAiProjectCreate: true }],
    [
      `?searchArea=AiHub&type=${RoomsType.InstructionsRoom}`,
      RoomsType.InstructionsRoom,
      "Common:Skills",
      { startRoomType: RoomsType.InstructionsRoom },
    ],
    [
      `?type=${RoomsType.KnowledgeRoom}&page=1`,
      RoomsType.KnowledgeRoom,
      "Common:AiWorkspaceKnowledge",
      { startRoomType: RoomsType.KnowledgeRoom },
    ],
    // Several types, or one from another section, are the agents' list.
    [`?type=${RoomsType.KnowledgeRoom}&type=${RoomsType.InstructionsRoom}`, RoomsType.AiProjectRoom, "Common:AiWorkspace", { isAiProjectCreate: true }],
    [`?type=${RoomsType.CustomRoom}`, RoomsType.AiProjectRoom, "Common:AiWorkspace", { isAiProjectCreate: true }],
  ])("%s lists %s", (search, type, title, payload) => {
    expect(getAiWorkspaceListType(search)).toBe(type);
    expect(getAiWorkspaceTitle(t, search)).toBe(title);
    expect(getAiWorkspaceCreatePayload(search)).toEqual(payload);
  });
});
