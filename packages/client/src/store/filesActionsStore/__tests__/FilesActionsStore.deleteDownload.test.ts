// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  removeFiles: vi.fn(async () => [{}]),
  duplicate: vi.fn(async () => [{}]),
}));

import { createTestFilesActionsStore, t } from "./testHarness";

const progress = () => {
  const setSecondaryProgressBarData = vi.fn();
  return {
    setSecondaryProgressBarData,
    store: {
      loopFilesOperations: vi.fn(async () => ({})),
      clearActiveOperations: vi.fn(),
      secondaryProgressDataStore: {
        setSecondaryProgressBarData,
        clearSecondaryProgressData: vi.fn(),
      },
    },
  };
};

describe("FilesActionsStore — delete/download/duplicate (batch 8)", () => {
  it("deleteAction is a no-op when the selection is empty", async () => {
    const p = progress();
    const store = createTestFilesActionsStore({
      filesStore: {
        selection: [],
        bufferSelection: null,
        activeFiles: [],
        activeFolders: [],
        getIsEmptyTrash: vi.fn(),
        addActiveItems: vi.fn(),
      },
      uploadDataStore: p.store,
    });
    await store.deleteAction(null, []);
    expect(p.setSecondaryProgressBarData).not.toHaveBeenCalled();
  });

  it("downloadAction on a single file opens the file's view URL", async () => {
    const openUrl = vi.fn();
    const store = createTestFilesActionsStore({
      settingsStore: { openUrl },
      filesStore: {
        selection: [
          { id: 1, isFolder: false, fileExst: ".docx", viewUrl: "http://x/1", security: { Download: true } },
        ],
        bufferSelection: null,
      },
    });
    await store.downloadAction("label");
    expect(openUrl).toHaveBeenCalledTimes(1);
  });

  it("duplicateAction returns early for a folder in a Privacy room", async () => {
    const p = progress();
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder: true },
      uploadDataStore: p.store,
    });
    await store.duplicateAction({ id: 1, isFolder: true } as never);
    expect(p.setSecondaryProgressBarData).not.toHaveBeenCalled();
  });

  it("duplicateAction on a normal file duplicates and loops the operation", async () => {
    const p = progress();
    const store = createTestFilesActionsStore({
      uploadDataStore: p.store,
      filesStore: { addActiveItems: vi.fn(), setActiveFiles: vi.fn() },
    });
    await store.duplicateAction({ id: 1, fileExst: ".docx" } as never);
    expect(p.setSecondaryProgressBarData).toHaveBeenCalled();
    expect(p.store.loopFilesOperations).toHaveBeenCalledTimes(1);
  });
});
