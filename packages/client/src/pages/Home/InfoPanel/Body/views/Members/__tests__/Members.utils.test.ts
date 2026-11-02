import { describe, expect, it } from "vitest";

import { RoomsType, ShareAccessRights } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";

import MembersHelper from "../Members.utils";

const t = ((key: string) => key) as unknown as TTranslation;

const keysOf = (roomType: RoomsType, canChangeUserRole = false) =>
  new MembersHelper({ t }).getOptionsByRoomType(roomType, canChangeUserRole)?.map((o) => o.key);

describe("MembersHelper.getOptionsByRoomType", () => {
  it("offers no Editor in a Knowledge room: its files are read or uploaded, never edited", () => {
    expect(keysOf(RoomsType.KnowledgeRoom)).toEqual(["roomAdmin", "collaborator", "viewer"]);
  });

  it("keeps the Editor in an Instructions room", () => {
    expect(keysOf(RoomsType.InstructionsRoom)).toEqual(["roomAdmin", "collaborator", "editor", "viewer"]);
  });

  it("appends the remove option when the caller may change roles", () => {
    expect(keysOf(RoomsType.KnowledgeRoom, true)).toEqual(["roomAdmin", "collaborator", "viewer", "s2", "remove"]);
  });
});

describe("MembersHelper.getOptionByUserAccess", () => {
  const keyOf = (access: ShareAccessRights, roomType?: RoomsType) =>
    new MembersHelper({ t }).getOptionByUserAccess(access, roomType)?.key;

  it("names the project roles in a project only", () => {
    expect(keyOf(ShareAccessRights.ReadOnly, RoomsType.AiProjectRoom)).toBe("projectMember");
    expect(keyOf(ShareAccessRights.RoomManager, RoomsType.AiProjectRoom)).toBe("projectManager");
  });

  it("keeps Viewer and Room manager in any other room", () => {
    for (const roomType of [RoomsType.CustomRoom, RoomsType.VirtualDataRoom, RoomsType.PublicRoom, undefined]) {
      expect(keyOf(ShareAccessRights.ReadOnly, roomType)).toBe("viewer");
      expect(keyOf(ShareAccessRights.RoomManager, roomType)).toBe("roomAdmin");
    }
  });
});
