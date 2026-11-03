import { describe, expect, it } from "vitest";

import { RoomsType } from "../../enums";
import type { TTranslation } from "../../types";
import { getUserRoleOptionsByRoomType } from "./getUserRoleOptionsByRoomType";

const t = ((key: string) => key) as unknown as TTranslation;

const keysOf = (roomType: RoomsType) =>
  getUserRoleOptionsByRoomType(t, roomType)?.map((option) => option.key);

describe("getUserRoleOptionsByRoomType", () => {
  it("offers no Editor in a Knowledge room: its files are read or uploaded, never edited", () => {
    expect(keysOf(RoomsType.KnowledgeRoom)).toEqual(["roomAdmin", "collaborator", "viewer"]);
  });

  it("keeps the Editor in an Instructions room, whose skills are edited in place", () => {
    expect(keysOf(RoomsType.InstructionsRoom)).toEqual(["roomAdmin", "collaborator", "editor", "viewer"]);
  });

  it("appends the remove option when the caller may change roles", () => {
    expect(getUserRoleOptionsByRoomType(t, RoomsType.KnowledgeRoom, true)?.map((o) => o.key)).toEqual([
      "roomAdmin",
      "collaborator",
      "viewer",
      "s2",
      "remove",
    ]);
  });
});
