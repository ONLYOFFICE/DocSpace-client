import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import { getCopyTargetRoomTypes } from "../utils";

const VECTORIZED = [".txt", ".md", ".docx", ".pdf"];

const ordinary = [
  RoomsType.EditingRoom,
  RoomsType.CustomRoom,
  RoomsType.PublicRoom,
  RoomsType.VirtualDataRoom,
];

describe("getCopyTargetRoomTypes", () => {
  it("offers the ordinary rooms for an empty selection", () => {
    expect(getCopyTargetRoomTypes([], VECTORIZED, true)).toEqual(ordinary);
  });

  it("adds Instructions and Knowledge rooms for Markdown files", () => {
    const types = getCopyTargetRoomTypes(
      [{ fileExst: ".md" }, { fileExst: ".MD" }],
      VECTORIZED,
      true,
    );
    expect(types).toEqual([
      ...ordinary,
      RoomsType.InstructionsRoom,
      RoomsType.KnowledgeRoom,
    ]);
  });

  it("adds only a Knowledge room for other vectorized formats", () => {
    const types = getCopyTargetRoomTypes(
      [{ fileExst: ".docx" }, { fileExst: ".pdf" }],
      VECTORIZED,
      true,
    );
    expect(types).toEqual([...ordinary, RoomsType.KnowledgeRoom]);
  });

  it("keeps a Knowledge room out while vectorization is off", () => {
    const types = getCopyTargetRoomTypes([{ fileExst: ".docx" }], VECTORIZED, false);
    expect(types).toEqual(ordinary);
  });

  it("offers neither when one file cannot land there", () => {
    const types = getCopyTargetRoomTypes(
      [{ fileExst: ".md" }, { fileExst: ".png" }],
      VECTORIZED,
      true,
    );
    expect(types).toEqual(ordinary);
  });

  it("offers neither when a folder is selected", () => {
    const types = getCopyTargetRoomTypes(
      [{ fileExst: ".md" }, { isFolder: true }],
      VECTORIZED,
      true,
    );
    expect(types).toEqual(ordinary);
  });
});
