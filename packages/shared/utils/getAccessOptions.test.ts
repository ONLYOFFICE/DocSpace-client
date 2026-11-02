import { describe, expect, it } from "vitest";

import { RoomsType, ShareAccessRights } from "../enums";
import type { TTranslation } from "../types";
import { getAccessOptions } from "./getAccessOptions";
import { getDefaultAccessUser } from "./getDefaultAccessUser";

const t = ((key: string) => key) as unknown as TTranslation;

const keysOf = (roomType: RoomsType) =>
  getAccessOptions(t, roomType).map((option) => ("key" in option ? option.key : "separator"));

describe("getAccessOptions for the AI source rooms", () => {
  it("offers Room manager, Content creator and Viewer in a Knowledge room, no Editor", () => {
    expect(keysOf(RoomsType.KnowledgeRoom)).toEqual([
      "roomManager",
      "s1",
      "contentCreator",
      "viewer",
    ]);
  });

  it("keeps the Editor in an Instructions room", () => {
    expect(keysOf(RoomsType.InstructionsRoom)).toEqual([
      "roomManager",
      "s1",
      "contentCreator",
      "editor",
      "viewer",
    ]);
  });
});

describe("getAccessOptions for an AI project", () => {
  const accessOf = (key: string) =>
    getAccessOptions(t, RoomsType.AiProjectRoom).find(
      (option) => "key" in option && option.key === key,
    )?.access;

  it("grants a member Content creator, as the server does", () => {
    expect(accessOf("projectManager")).toBe(ShareAccessRights.RoomManager);
    expect(accessOf("projectMember")).toBe(ShareAccessRights.Collaborator);
  });

  it("invites a member by default", () => {
    expect(getDefaultAccessUser(RoomsType.AiProjectRoom)).toBe(
      ShareAccessRights.Collaborator,
    );
  });
});
