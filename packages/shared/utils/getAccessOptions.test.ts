import { describe, expect, it } from "vitest";

import { RoomsType } from "../enums";
import type { TTranslation } from "../types";
import { getAccessOptions } from "./getAccessOptions";

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
