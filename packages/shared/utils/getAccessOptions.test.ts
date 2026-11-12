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
  const accessOf = (key: string) => {
    const option = getAccessOptions(t, RoomsType.AiProjectRoom).find(
      (item) => "key" in item && item.key === key,
    );
    return option && "access" in option ? option.access : undefined;
  };

  it("offers Project manager and Member, a member reading the project", () => {
    expect(accessOf("projectManager")).toBe(ShareAccessRights.RoomManager);
    expect(accessOf("projectMember")).toBe(ShareAccessRights.ReadOnly);
  });

  it("creates the invitation link as Project manager", () => {
    expect(getDefaultAccessUser(RoomsType.AiProjectRoom)).toBe(
      ShareAccessRights.RoomManager,
    );
  });
});

describe("Editor role of a private room does not promise form filling", () => {
  const editorDescription = (isPrivateRoom: boolean) => {
    const editor = getAccessOptions(
      t,
      RoomsType.CustomRoom,
      false,
      false,
      false,
      false,
      false,
      isPrivateRoom,
    ).find((item) => "key" in item && item.key === "editor");

    return editor && "description" in editor ? editor.description : undefined;
  };

  it("Role list of a private room", () => {
    expect(editorDescription(true)).toBe("Common:EditorDescription");
  });

  it("Role list of another room", () => {
    expect(editorDescription(false)).toBe("Common:RoleEditorDescription");
    expect(
      getAccessOptions(t, RoomsType.CustomRoom).find(
        (item) => "key" in item && item.key === "editor",
      ),
    ).toMatchObject({ description: "Common:RoleEditorDescription" });
  });
});
