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

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { FolderType } from "@docspace/shared/enums";

const progressStore = (extra: Record<string, unknown> = {}) => ({
  loopFilesOperations: vi.fn(async () => ({})),
  clearActiveOperations: vi.fn(),
  itemOperationToFolder: vi.fn(async () => {}),
  secondaryProgressDataStore: {
    setSecondaryProgressBarData: vi.fn(),
    clearSecondaryProgressData: vi.fn(),
    isOperationStopped: vi.fn(() => false),
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

describe("FilesActionsStore - private-room transfer plan", () => {
  const file = { id: 1, title: "a.docx", isFolder: false } as never;
  const folder = { id: 2, title: "Sub", isFolder: true } as never;

  it("returns generic when neither side is a private room", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file],
      sourceInPrivateRoom: false,
      sourceRootFolderId: 10,
      dest: { private: false, rootFolderId: 20 },
    });
    expect(plan).toEqual({ kind: "generic" });
  });

  it("returns refuse-into when a non-private source targets a private room", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file],
      sourceInPrivateRoom: false,
      sourceRootFolderId: 10,
      dest: { private: true, rootFolderId: 20 },
    });
    expect(plan).toEqual({ kind: "refuse-into" });
  });

  it("falls back to same-room for a destination under the same section root when privacy is unknown", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file],
      sourceInPrivateRoom: true,
      sourceRootFolderId: 10,
      dest: { rootFolderId: 10 },
    });
    expect(plan).toEqual({ kind: "same-room" });
  });

  it("treats a rooms-section destination as the same room when the root is unknown", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file],
      sourceInPrivateRoom: true,
      sourceRootFolderId: null,
      dest: { rootFolderType: FolderType.Rooms },
    });
    expect(plan).toEqual({ kind: "same-room" });
  });

  it("returns refuse-folder-out when only folders leave a private room", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [folder],
      sourceInPrivateRoom: true,
      sourceRootFolderId: 10,
      dest: { private: false, rootFolderId: 20 },
    });
    expect(plan).toEqual({ kind: "refuse-folder-out" });
  });

  it("returns decrypt-out with the files and the refused folders when files leave a private room", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file, folder],
      sourceInPrivateRoom: true,
      sourceRootFolderId: 10,
      dest: { private: false, rootFolderId: 20 },
    });
    expect(plan).toEqual({
      kind: "decrypt-out",
      files: [file],
      refusedFolders: [folder],
    });
  });

  it("leaves generic and same-room plans to the caller", () => {
    const store = createTestFilesActionsStore();
    expect(
      store.runPrivateTransferPlan({ kind: "generic" }, 5, null, { move: false }),
    ).toBe(false);
    expect(
      store.runPrivateTransferPlan({ kind: "same-room" }, 5, null, { move: true }),
    ).toBe(false);
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("refuses refuse-into with Common:CannotTransferToPrivateRoom", () => {
    const store = createTestFilesActionsStore();
    expect(
      store.runPrivateTransferPlan({ kind: "refuse-into" }, 5, null, { move: false }),
    ).toBe(true);
    expect(toastr.error).toHaveBeenCalledWith("Common:CannotTransferToPrivateRoom");
  });

  it("refuses refuse-folder-out with Common:CannotTransferFolderFromPrivateRoom", () => {
    const store = createTestFilesActionsStore();
    expect(
      store.runPrivateTransferPlan({ kind: "refuse-folder-out" }, 5, null, { move: true }),
    ).toBe(true);
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:CannotTransferFolderFromPrivateRoom",
    );
  });

  it.each([
    [false, false],
    [true, true],
  ])(
    "decrypt-out with move=%s copies the files with deleteSourceOnSuccess=%s",
    (move, deleteSourceOnSuccess) => {
      const store = createTestFilesActionsStore();
      const copy = vi.fn(async () => {});
      store.copyEncryptedFilesToFolder = copy;
      const handled = store.runPrivateTransferPlan(
        { kind: "decrypt-out", files: [file], refusedFolders: [folder] },
        5,
        { private: false, rootFolderId: 20 },
        { move },
      );
      expect(handled).toBe(true);
      expect(toastr.error).toHaveBeenCalledWith(
        "Common:CannotTransferFolderFromPrivateRoom",
      );
      expect(copy).toHaveBeenCalledWith([file], 5, {
        private: false,
        rootFolderId: 20,
        roomType: undefined,
        deleteSourceOnSuccess,
      });
    },
  );
});

describe("FilesActionsStore - private-room transfer plan with a known destination", () => {
  const file = { id: 1, title: "a.docx", isFolder: false } as never;

  it("returns decrypt-out for another room in the same section when the destination is known to be non-private", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file],
      sourceInPrivateRoom: true,
      sourceRootFolderId: 10,
      dest: { rootFolderId: 10, insidePrivateRoom: false },
    });
    expect(plan).toEqual({ kind: "decrypt-out", files: [file], refusedFolders: [] });
  });

  it("returns refuse-into for a subfolder known to be inside a private room", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file],
      sourceInPrivateRoom: false,
      sourceRootFolderId: 20,
      dest: { private: false, rootFolderId: 10, insidePrivateRoom: true },
    });
    expect(plan).toEqual({ kind: "refuse-into" });
  });
});

describe("FilesActionsStore - drag out of a private room", () => {
  it.each([
    [true, true],
    [false, false],
  ])(
    "dragging files with Move=%s decrypts them with deleteSourceOnSuccess=%s",
    (canMove, deleteSourceOnSuccess) => {
      const item = {
        id: 1,
        title: "a.docx",
        isFolder: false,
        security: { Move: canMove },
      };
      const store = createTestFilesActionsStore({
        treeFoldersStore: { isPrivacyFolder: true },
        selectedFolderStore: { rootFolderId: 10 },
        filesStore: { selection: [item], bufferSelection: null },
      });
      const copy = vi.fn(async () => {});
      store.copyEncryptedFilesToFolder = copy;

      store.moveDragItems(5, "Docs", {
        id: 5,
        private: false,
        rootFolderId: 20,
      } as never);

      expect(copy).toHaveBeenCalledWith(
        [item],
        5,
        expect.objectContaining({ deleteSourceOnSuccess }),
      );
    },
  );
});
