// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  checkFileConflicts: vi.fn(async () => []),
  deleteFilesFromRoom: vi.fn(async () => [{}]),
  removeFiles: vi.fn(async () => [{}]),
}));

import { createTestFilesActionsStore, t } from "./testHarness";

const progressStore = (extra: Record<string, unknown> = {}) => ({
  loopFilesOperations: vi.fn(async () => ({})),
  clearActiveOperations: vi.fn(),
  itemOperationToFolder: vi.fn(async () => {}),
  secondaryProgressDataStore: {
    setSecondaryProgressBarData: vi.fn(),
    clearSecondaryProgressData: vi.fn(),
    setItemsSelectionLength: vi.fn(),
    setItemsSelectionTitle: vi.fn(),
  },
  ...extra,
});

describe("FilesActionsStore — copy/delete operations (batch 14)", () => {
  it("updateCurrentFolder refetches files for a non-rooms folder", async () => {
    const fetchFiles = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      filesStore: { fetchFiles, filter: { clone: () => ({}) } },
      uploadDataStore: progressStore(),
    });
    await store.updateCurrentFolder(false, "op1", undefined, false);
    expect(fetchFiles).toHaveBeenCalledTimes(1);
  });

  it("deleteItemAction opens the delete dialog when confirmation is required", async () => {
    const setDeleteDialogVisible = vi.fn();
    const setIsRoomDelete = vi.fn();
    const store = createTestFilesActionsStore({
      filesSettingsStore: { confirmDelete: true },
      dialogsStore: {
        setDeleteDialogVisible,
        setIsRoomDelete,
        setIsFolderActions: vi.fn(),
        setRemoveItem: vi.fn(),
      },
    });
    await store.deleteItemAction(1, "Doc", null, null, null, true);
    expect(setIsRoomDelete).toHaveBeenCalledWith(true);
    expect(setDeleteDialogVisible).toHaveBeenCalledWith(true);
  });

  it("copyFromTemplateForm copies to the folder when there is no conflict", async () => {
    const itemOperationToFolder = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      uploadDataStore: progressStore({ itemOperationToFolder }),
    });
    await store.copyFromTemplateForm({ id: 1, title: "Form" } as never);
    expect(itemOperationToFolder).toHaveBeenCalledTimes(1);
  });

  it("copyFileToAiKnowledge copies the files to the knowledge folder", async () => {
    const itemOperationToFolder = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      aiRoomStore: { knowledgeId: 42, setKnowledgeId: vi.fn() },
      uploadDataStore: progressStore({ itemOperationToFolder }),
    });
    await store.copyFileToAiKnowledge([{ id: 1, title: "Doc" }] as never);
    expect(itemOperationToFolder).toHaveBeenCalledTimes(1);
  });
});
