import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";
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
