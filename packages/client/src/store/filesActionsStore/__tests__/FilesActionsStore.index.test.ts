// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  changeIndex: vi.fn(async () => ({})),
  reorderIndex: vi.fn(async () => ({})),
}));

import { createTestFilesActionsStore, t } from "./testHarness";

describe("FilesActionsStore — quota/index/media (batch 10)", () => {
  it("disableAIAgentQuota sets a custom agent quota of -1", async () => {
    const setCustomAIAgentQuota = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      filesStore: { setCustomAIAgentQuota },
    });
    await store.disableAIAgentQuota([{ id: 1 }, 2] as never, t);
    expect(setCustomAIAgentQuota).toHaveBeenCalledWith([1, 2], -1);
  });

  it("resetAIAgentQuota delegates to filesStore.resetAIAgentQuota", async () => {
    const resetAIAgentQuota = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      filesStore: { resetAIAgentQuota },
    });
    await store.resetAIAgentQuota([{ id: 3 }] as never, t);
    expect(resetAIAgentQuota).toHaveBeenCalledWith([3]);
  });

  it("isExpiredLinkAsync: explicitly-expired link short-circuits to true", async () => {
    await expect(
      createTestFilesActionsStore().isExpiredLinkAsync({
        isLinkExpired: true,
      } as never),
    ).resolves.toBe(true);
  });

  it("isExpiredLinkAsync: non-external item is never expired", async () => {
    await expect(
      createTestFilesActionsStore().isExpiredLinkAsync({
        isLinkExpired: false,
        external: false,
      } as never),
    ).resolves.toBe(false);
  });

  it("setListOrder updates the indexing selection", () => {
    const setUpdateSelection = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: {
        filesList: [
          { id: 1, order: "1", isFolder: false },
          { id: 2, order: "2", isFolder: false },
          { id: 3, order: "3", isFolder: false },
        ],
        setFiles: vi.fn(),
        setFolders: vi.fn(),
      },
      indexingStore: { setUpdateSelection, setPreviousFilesList: vi.fn() },
    });
    store.setListOrder(0, 1);
    expect(setUpdateSelection).toHaveBeenCalled();
  });

  it("saveIndexOfFiles calls the reindex API when there are items", async () => {
    const { changeIndex } = await import("@docspace/shared/api/files");
    const store = createTestFilesActionsStore({
      indexingStore: { getIndexingArray: () => [{ id: 1, order: "1" }] },
    });
    await store.saveIndexOfFiles(t);
    expect(changeIndex).toHaveBeenCalledTimes(1);
  });

  it("reorderIndexOfFiles reorders and leaves index-editing mode", async () => {
    const setIsIndexEditingMode = vi.fn();
    const store = createTestFilesActionsStore({
      indexingStore: { setIsIndexEditingMode },
    });
    await store.reorderIndexOfFiles(9, t);
    expect(setIsIndexEditingMode).toHaveBeenCalledWith(false);
  });

  it("closeMediaViewerAndRestoreUrl hides the media viewer", async () => {
    const setMediaViewerData = vi.fn();
    const store = createTestFilesActionsStore({
      mediaViewerDataStore: {
        setMediaViewerData,
        getFirstUrl: vi.fn(async () => null),
      },
    });
    await store.closeMediaViewerAndRestoreUrl();
    expect(setMediaViewerData).toHaveBeenCalledWith({ visible: false, id: null });
  });
});
