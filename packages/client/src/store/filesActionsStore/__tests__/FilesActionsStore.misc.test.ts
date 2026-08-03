// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  finalizeVersion: vi.fn(async () => [{ id: 1 }]),
  checkFileConflicts: vi.fn(async () => []),
  markAsRead: vi.fn(async () => [{}]),
}));

import { createTestFilesActionsStore, t } from "./testHarness";

describe("FilesActionsStore — misc methods (batch 9)", () => {
  it("updateFilesAfterDelete closes selection and folder actions", () => {
    const setSelected = vi.fn();
    const setIsFolderActions = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { setSelected },
      dialogsStore: { setIsFolderActions },
    });
    store.updateFilesAfterDelete("op1", "delete" as never);
    expect(setSelected).toHaveBeenCalledWith("close");
    expect(setIsFolderActions).toHaveBeenCalledWith(false);
  });

  it("setSelectedItems pushes length & title to the progress store", () => {
    const setItemsSelectionLength = vi.fn();
    const setItemsSelectionTitle = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { selection: [{ id: 1 }], selectionTitle: "Doc" },
      uploadDataStore: {
        secondaryProgressDataStore: {
          setItemsSelectionLength,
          setItemsSelectionTitle,
          setSecondaryProgressBarData: vi.fn(),
          clearSecondaryProgressData: vi.fn(),
        },
      },
    });
    store.setSelectedItems();
    expect(setItemsSelectionLength).toHaveBeenCalledWith(1);
    expect(setItemsSelectionTitle).toHaveBeenCalledWith("Doc");
  });

  it("checkFileConflicts marks items active before the API check", () => {
    const addActiveItems = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { addActiveItems },
    });
    store.checkFileConflicts(9, [1], [2]);
    expect(addActiveItems).toHaveBeenCalledTimes(2);
  });

  it("setConflictDialogData opens the conflict-resolve dialog", () => {
    const setConflictResolveDialogItems = vi.fn();
    const setConflictResolveDialogData = vi.fn();
    const setConflictResolveDialogVisible = vi.fn();
    const store = createTestFilesActionsStore({
      dialogsStore: {
        setConflictResolveDialogItems,
        setConflictResolveDialogData,
        setConflictResolveDialogVisible,
      },
    });
    store.setConflictDialogData([], {} as never);
    expect(setConflictResolveDialogItems).toHaveBeenCalledTimes(1);
  });

  it("markAsRead drives the progress bar", () => {
    const setSecondaryProgressBarData = vi.fn();
    const store = createTestFilesActionsStore({
      uploadDataStore: {
        secondaryProgressDataStore: {
          setSecondaryProgressBarData,
          clearSecondaryProgressData: vi.fn(),
        },
      },
    });
    store.markAsRead([], ["1"]);
    expect(setSecondaryProgressBarData).toHaveBeenCalled();
  });

  it("finalizeVersionAction stores the finalized file", async () => {
    const setFile = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { setFile, setActiveFiles: vi.fn() },
    });
    await store.finalizeVersionAction(1);
    expect(setFile).toHaveBeenCalled();
  });

  it("revokeFilesOrder is a no-op when there is no previous list", () => {
    const setFiles = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { setFiles, setFolders: vi.fn() },
      indexingStore: { previousFilesList: [] },
    });
    store.revokeFilesOrder();
    expect(setFiles).not.toHaveBeenCalled();
  });

  it("getPublicKey returns null for an unshared folder", async () => {
    const store = createTestFilesActionsStore();
    await expect(
      store.getPublicKey({ id: 1, shared: false } as never),
    ).resolves.toBeFalsy();
  });

  it("onSelectItem sets the buffer selection for the item", () => {
    const setBufferSelection = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: {
        setBufferSelection,
        setSelected: vi.fn(),
        setSelection: vi.fn(),
        setHotkeyCaret: vi.fn(),
        setHotkeyCaretStart: vi.fn(),
        setEnabledHotkeys: vi.fn(),
        filesList: [{ id: 5, isFolder: false }],
        selection: [],
      },
    });
    // withSelect=false, isContextItem=true → buffer-selection branch
    store.onSelectItem({ id: 5, isFolder: false }, false, true, false);
    expect(setBufferSelection).toHaveBeenCalled();
  });
});
