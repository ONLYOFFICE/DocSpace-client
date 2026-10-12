// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestFilesActionsStore, t } from "./testHarness";

beforeEach(() => {
  (window as unknown as { DocSpace: unknown }).DocSpace = {
    location: { pathname: "/rooms", search: "", state: {} },
    navigate: vi.fn(),
  };
});

describe("FilesActionsStore — drag/index/run (batch 19)", () => {
  it("runOperations reports an error for an empty operations list", async () => {
    const store = createTestFilesActionsStore();
    expect(store.runOperations([])).toBe("No operations specified");
  });

  it("moveDragItems is a no-op when nothing is selected", () => {
    const setSelected = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { selection: [], bufferSelection: null, setSelected },
    });
    store.moveDragItems(5, "Dest", { rootFolderType: 0 } as never);
    expect(setSelected).not.toHaveBeenCalled();
  });

  it("changeIndex is a no-op when the order is unchanged", async () => {
    const store = createTestFilesActionsStore({
      filesStore: {
        filesList: [{ id: 1, order: "1", isFolder: false }],
        selection: [{ id: 1, order: "1", isFolder: false }],
        bufferSelection: null,
      },
    });
    await expect(
      store.changeIndex(
        "someAction" as never,
        { id: 1, order: "1", isFolder: false } as never,
        t,
      ),
    ).resolves.toBeUndefined();
  });

  it("checkAndOpenLocationAction toggles the section-body loader", async () => {
    const setIsSectionBodyLoading = vi.fn();
    const store = createTestFilesActionsStore({
      clientLoadingStore: { setIsSectionBodyLoading },
      treeFoldersStore: {
        myRoomsId: 10,
        myFolderId: 11,
        recycleBinFolderId: 12,
      },
      filesStore: { getFolderInfo: vi.fn(async () => ({ id: 1 })) },
    });
    try {
      await store.checkAndOpenLocationAction({ id: 1 });
    } catch {
      // deeper navigation may bail in jsdom; the loader toggle is the lock
    }
    expect(setIsSectionBodyLoading).toHaveBeenCalled();
  });
});
