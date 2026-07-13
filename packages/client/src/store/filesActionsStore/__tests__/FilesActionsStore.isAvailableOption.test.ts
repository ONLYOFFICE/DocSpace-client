// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect } from "vitest";
import { FolderType } from "@docspace/shared/enums";
import { createTestFilesActionsStore } from "./testHarness";

const sec = (s: Record<string, boolean>) => ({ security: s });

describe("FilesActionsStore.isAvailableOption — characterization", () => {
  it("copy: needs a selection where every item has Copy", () => {
    expect(
      createTestFilesActionsStore({
        filesStore: { hasSelection: true, selection: [sec({ Copy: true })] },
      }).isAvailableOption("copy"),
    ).toBe(true);
    expect(
      createTestFilesActionsStore({
        filesStore: { hasSelection: true, selection: [sec({ Copy: false })] },
      }).isAvailableOption("copy"),
    ).toBe(false);
    expect(
      createTestFilesActionsStore({
        filesStore: { hasSelection: false, selection: [sec({ Copy: true })] },
      }).isAvailableOption("copy"),
    ).toBe(false);
  });

  it("download / showInfo: hasSelection && every Download", () => {
    const store = createTestFilesActionsStore({
      filesStore: { hasSelection: true, selection: [sec({ Download: true })] },
    });
    expect(store.isAvailableOption("download")).toBe(true);
    expect(store.isAvailableOption("showInfo")).toBe(true);
    expect(
      createTestFilesActionsStore({
        filesStore: {
          hasSelection: true,
          selection: [sec({ Download: true }), sec({ Download: false })],
        },
      }).isAvailableOption("download"),
    ).toBe(false);
  });

  it("downloadAs: every Download && canConvertSelected", () => {
    expect(
      createTestFilesActionsStore({
        filesStore: {
          canConvertSelected: true,
          selection: [sec({ Download: true })],
        },
      }).isAvailableOption("downloadAs"),
    ).toBe(true);
    expect(
      createTestFilesActionsStore({
        filesStore: {
          canConvertSelected: false,
          selection: [sec({ Download: true })],
        },
      }).isAvailableOption("downloadAs"),
    ).toBe(false);
  });

  it("moveTo: hasSelection && !editing && every Move && not in Trash", () => {
    const base = {
      hasSelection: true,
      allFilesIsEditing: false,
      selection: [sec({ Move: true })],
    };
    expect(
      createTestFilesActionsStore({ filesStore: base }).isAvailableOption(
        "moveTo",
      ),
    ).toBe(true);
    expect(
      createTestFilesActionsStore({
        filesStore: base,
        selectedFolderStore: { rootFolderType: FolderType.TRASH },
      }).isAvailableOption("moveTo"),
    ).toBe(false);
    expect(
      createTestFilesActionsStore({
        filesStore: { ...base, allFilesIsEditing: true },
      }).isAvailableOption("moveTo"),
    ).toBe(false);
  });

  it("archive / unarchive: every vs some Move", () => {
    expect(
      createTestFilesActionsStore({
        filesStore: {
          hasSelection: true,
          selection: [sec({ Move: true }), sec({ Move: false })],
        },
      }).isAvailableOption("archive"),
    ).toBe(false);
    expect(
      createTestFilesActionsStore({
        filesStore: {
          selection: [sec({ Move: true }), sec({ Move: false })],
        },
      }).isAvailableOption("unarchive"),
    ).toBe(true);
  });

  it("delete-room / delete-agent / delete", () => {
    expect(
      createTestFilesActionsStore({
        filesStore: { selection: [sec({ Delete: true }), sec({})] },
      }).isAvailableOption("delete-room"),
    ).toBe(true);
    expect(
      createTestFilesActionsStore({
        filesStore: { selection: [sec({ Delete: true }), sec({ Delete: true })] },
      }).isAvailableOption("delete-agent"),
    ).toBe(false); // needs exactly one
    expect(
      createTestFilesActionsStore({
        filesStore: {
          hasSelection: true,
          allFilesIsEditing: false,
          selection: [sec({ Delete: true })],
        },
      }).isAvailableOption("delete"),
    ).toBe(true);
  });

  it("create-room: some CreateRoomFrom", () => {
    expect(
      createTestFilesActionsStore({
        filesStore: { selection: [sec({ CreateRoomFrom: true })] },
      }).isAvailableOption("create-room"),
    ).toBe(true);
  });

  it("create-group / add-to-group / remove-from-group gating", () => {
    const on = {
      filesSettingsStore: { organizeRoomsGrouping: true },
      treeFoldersStore: { isRoomsFolder: true },
      filesStore: { hasSelection: true },
    };
    expect(
      createTestFilesActionsStore(on).isAvailableOption("create-group"),
    ).toBe(true);
    expect(
      createTestFilesActionsStore({
        ...on,
        dialogsStore: { roomGroups: [{ id: "g1" }] },
      }).isAvailableOption("add-to-group"),
    ).toBe(true);
    expect(
      createTestFilesActionsStore({
        ...on,
        dialogsStore: { roomGroups: [{ id: "g1" }] },
        filesStore: { hasSelection: true, roomsFilter: { groupId: "g1" } },
      }).isAvailableOption("remove-from-group"),
    ).toBe(true);
    expect(
      createTestFilesActionsStore({
        ...on,
        dialogsStore: { roomGroups: [{ id: "g1" }] },
      }).isAvailableOption("remove-from-group"),
    ).toBe(false); // no current groupId
  });

  it("quota options read filesStore flags directly", () => {
    const store = createTestFilesActionsStore({
      filesStore: {
        hasRoomsToChangeQuota: true,
        hasAIAgentsToChangeQuota: false,
        hasRoomsToDisableQuota: true,
        hasRoomsToResetQuota: false,
      },
    });
    expect(store.isAvailableOption("change-quota")).toBe(true);
    expect(store.isAvailableOption("change-agent-quota")).toBe(false);
    expect(store.isAvailableOption("disable-quota")).toBe(true);
    expect(store.isAvailableOption("default-quota")).toBe(false);
  });

  it("vectorization: some Vectorization; unknown option: false", () => {
    expect(
      createTestFilesActionsStore({
        filesStore: { selection: [sec({ Vectorization: true })] },
      }).isAvailableOption("vectorization"),
    ).toBe(true);
    expect(
      createTestFilesActionsStore().isAvailableOption("nonsense-option"),
    ).toBe(false);
  });
});
