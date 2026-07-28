// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  deleteFile: vi.fn(async () => ({ id: "op" })),
  deleteFolder: vi.fn(async () => ({ id: "op" })),
  removeFiles: vi.fn(async () => [{}]),
  deleteFilesFromRoom: vi.fn(async () => [{}]),
}));

import { createTestFilesActionsStore, t } from "./testHarness";

const progressStore = () => ({
  loopFilesOperations: vi.fn(async () => ({})),
  clearActiveOperations: vi.fn(),
  secondaryProgressDataStore: {
    setSecondaryProgressBarData: vi.fn(),
    clearSecondaryProgressData: vi.fn(),
    setItemsSelectionLength: vi.fn(),
    setItemsSelectionTitle: vi.fn(),
  },
});

describe("FilesActionsStore — archive/delete operations (batch 15)", () => {
  it("setArchiveAction aborts when the default categories are missing", async () => {
    const p = progressStore();
    const store = createTestFilesActionsStore({
      treeFoldersStore: { myRoomsId: undefined, archiveRoomsId: undefined },
      uploadDataStore: p,
    });
    await store.setArchiveAction("archive", [{ id: 1 }] as never, t);
    expect(p.secondaryProgressDataStore.setSecondaryProgressBarData).not.toHaveBeenCalled();
  });

  it("deleteRoomsAction drives the progress bar", async () => {
    const p = progressStore();
    const store = createTestFilesActionsStore({ uploadDataStore: p });
    await store.deleteRoomsAction([1]);
    expect(p.secondaryProgressDataStore.setSecondaryProgressBarData).toHaveBeenCalled();
  });

  it("deleteItemOperation (folder) drives the progress bar", async () => {
    const p = progressStore();
    const store = createTestFilesActionsStore({
      uploadDataStore: p,
      filesStore: {
        files: [],
        folders: [{ id: 1 }],
        addActiveItems: vi.fn(),
        getIsEmptyTrash: vi.fn(),
        removeFiles: vi.fn(),
      },
    });
    await store.deleteItemOperation(false, 1, null, false, "op1", "delete" as never);
    expect(p.secondaryProgressDataStore.setSecondaryProgressBarData).toHaveBeenCalled();
  });
});
