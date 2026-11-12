import { describe, expect, it } from "vitest";

import { RoomsType } from "@docspace/shared/enums";

import { getCopyTargetRoomTypes, getRoomSectionTreeFolders } from "../utils";

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

// Bug 84825: Move to / Copy listed Rooms with its "New room" while the Rooms
// app was switched off, so a file could go into a room nobody can open.
describe("getRoomSectionTreeFolders", () => {
  const installedExcept =
    (...off: string[]) =>
    (id: string) =>
      !off.includes(id);

  it("lists Rooms and Forms while both apps are on", () => {
    expect(getRoomSectionTreeFolders(installedExcept(), {})).toEqual({
      withRoomsTreeFolder: true,
      withFormsTreeFolder: true,
    });
  });

  it("drops Rooms while the Rooms app is off", () => {
    expect(getRoomSectionTreeFolders(installedExcept("ai-rooms"), {})).toEqual(
      { withRoomsTreeFolder: false, withFormsTreeFolder: true },
    );
  });

  it("drops Forms while the Forms app is off", () => {
    expect(getRoomSectionTreeFolders(installedExcept("ai-forms"), {})).toEqual(
      { withRoomsTreeFolder: true, withFormsTreeFolder: false },
    );
  });

  it("keeps what the caller asked for", () => {
    expect(
      getRoomSectionTreeFolders(installedExcept("ai-rooms", "ai-forms"), {
        withRoomsTreeFolder: true,
        withFormsTreeFolder: true,
      }),
    ).toEqual({ withRoomsTreeFolder: true, withFormsTreeFolder: true });
  });
});
