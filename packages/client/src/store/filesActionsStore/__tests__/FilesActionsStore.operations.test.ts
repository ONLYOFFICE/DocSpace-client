// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";
import { FileAction } from "@docspace/shared/enums";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  downloadFiles: vi.fn(async () => [{}]),
  checkFileConflicts: vi.fn(async () => []),
}));

import { createTestFilesActionsStore } from "./testHarness";

const progressStore = (setSecondaryProgressBarData = vi.fn()) => ({
  loopFilesOperations: vi.fn(async () => ({})),
  clearActiveOperations: vi.fn(),
  itemOperationToFolder: vi.fn(async () => {}),
  secondaryProgressDataStore: {
    setSecondaryProgressBarData,
    clearSecondaryProgressData: vi.fn(),
    setItemsSelectionLength: vi.fn(),
    setItemsSelectionTitle: vi.fn(),
  },
});

describe("FilesActionsStore — operations (batch 13)", () => {
  it("downloadFiles drives the progress bar and loops the operation", async () => {
    const setSecondaryProgressBarData = vi.fn();
    const store = createTestFilesActionsStore({
      uploadDataStore: progressStore(setSecondaryProgressBarData),
      dialogsStore: {
        setDownloadItems: vi.fn(),
        setSortedPasswordFiles: vi.fn(),
        setDownloadDialogVisible: vi.fn(),
      },
    });
    await store.downloadFiles([1], [], "label");
    expect(setSecondaryProgressBarData).toHaveBeenCalled();
  });

  it("completeAction(Rename) re-selects the renamed item", () => {
    const setBufferSelection = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: {
        setBufferSelection,
        setSelected: vi.fn(),
        setSelection: vi.fn(),
        setHotkeyCaret: vi.fn(),
        setHotkeyCaretStart: vi.fn(),
        setEnabledHotkeys: vi.fn(),
        filesList: [{ id: 7, isFolder: false }],
        selection: [],
      },
    });
    store.completeAction({ id: 7, isFolder: false }, FileAction.Rename);
    expect(setBufferSelection).toHaveBeenCalled();
  });

  it("checkOperationConflict clears the current selection first", async () => {
    const setSelected = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: {
        setSelected,
        setBufferSelection: vi.fn(),
        selection: [{ id: 1 }],
        selectionTitle: "Doc",
        addActiveItems: vi.fn(),
      },
      uploadDataStore: progressStore(),
    });
    await store.checkOperationConflict({
      destFolderId: 5,
      folderIds: [],
      fileIds: [1],
    } as never);
    expect(setSelected).toHaveBeenCalledWith("none");
  });

  it("preparingDataForCopyingToRoom is a no-op for an empty selection", async () => {
    const addActiveItems = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { addActiveItems },
    });
    await store.preparingDataForCopyingToRoom(5, []);
    expect(addActiveItems).not.toHaveBeenCalled();
  });
});
