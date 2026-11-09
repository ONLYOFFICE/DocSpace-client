// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  removeFiles: vi.fn(async () => [{}]),
  deleteFile: vi.fn(async () => [{}]),
  duplicate: vi.fn(async () => [{}]),
  getFolder: vi.fn(),
  getFileEncryptionAccess: vi.fn(),
  downloadFiles: vi.fn(),
}));

vi.mock("@docspace/shared/services/encryption/secret-storage", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  requireUnlock: vi.fn(async () => ({ publicKey: "pk" })),
}));

vi.mock("@docspace/shared/services/private-room/room-member-keys", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  loadRoomMemberKeysSafe: vi.fn(async () => [{ userId: "user-1" }]),
}));

vi.mock("@docspace/shared/services/private-room/encrypted-download", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  downloadAndDecryptFileToBuffer: vi.fn(),
  createZipFromBuffers: vi.fn(() => new Uint8Array([1])),
  triggerFileDownload: vi.fn(),
}));

import { createTestFilesActionsStore, t } from "./testHarness";
// After the harness, which mocks the toast module.
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import {
  deleteFile,
  downloadFiles,
  getFileEncryptionAccess,
  getFolder,
  removeFiles,
} from "@docspace/shared/api/files";
import {
  createZipFromBuffers,
  downloadAndDecryptFileToBuffer,
  triggerFileDownload,
} from "@docspace/shared/services/private-room/encrypted-download";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";

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
        isOperationStopped: vi.fn((): boolean => false),
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

  it("deleteAction refetches instead of pruning the list when the user cancels the operation", async () => {
    const p = progress();
    // the user hit cancel: terminateItem marked the item stopped
    p.store.secondaryProgressDataStore.isOperationStopped.mockReturnValue(true);

    const removeFiles = vi.fn();
    const fetchFiles = vi.fn(async () => {});
    const setSelected = vi.fn();

    const store = createTestFilesActionsStore({
      filesStore: {
        selection: [
          { id: 1, fileExst: ".docx", security: { Delete: true } },
          { id: 2, security: { Delete: true } },
        ],
        bufferSelection: null,
        activeFiles: [],
        activeFolders: [],
        getIsEmptyTrash: vi.fn(),
        addActiveItems: vi.fn(),
        removeFiles,
        fetchFiles,
        setSelected,
      },
      uploadDataStore: { ...p.store, removeFiles: vi.fn() },
    });

    await store.deleteAction({ deleteFromTrash: "x" } as never);

    // the whole selection must NOT be dropped from the list...
    expect(removeFiles).not.toHaveBeenCalled();
    // ...the survivors come from the server instead
    expect(fetchFiles).toHaveBeenCalledTimes(1);
    expect(setSelected).toHaveBeenCalledWith("close");
  });

  it("deleteAction prunes the deleted items when the operation completes normally", async () => {
    const p = progress();

    const removeFiles = vi.fn();
    const fetchFiles = vi.fn(async () => {});

    const store = createTestFilesActionsStore({
      filesStore: {
        selection: [
          { id: 1, fileExst: ".docx", security: { Delete: true } },
          { id: 2, security: { Delete: true } },
        ],
        bufferSelection: null,
        activeFiles: [],
        activeFolders: [],
        getIsEmptyTrash: vi.fn(),
        addActiveItems: vi.fn(),
        removeFiles,
        fetchFiles,
        setSelected: vi.fn(),
      },
      uploadDataStore: { ...p.store, removeFiles: vi.fn() },
    });

    await store.deleteAction({ deleteFromTrash: "x" } as never);

    expect(removeFiles).toHaveBeenCalledTimes(1);
    expect(removeFiles).toHaveBeenCalledWith([1], [2], expect.any(Function), undefined);
    expect(fetchFiles).not.toHaveBeenCalled();
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

describe("FilesActionsStore — delete confirmation in a private room", () => {
  const setup = (isPrivacyFolder: boolean) => {
    const setDeleteDialogVisible = vi.fn();
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder },
      filesSettingsStore: { confirmDelete: false },
      dialogsStore: { setDeleteDialogVisible, setIsRoomDelete: vi.fn() },
      filesStore: {
        hasSelection: true,
        allFilesIsEditing: false,
        selection: [
          { id: 5, title: "plan.docx", fileExst: ".docx", security: { Delete: true } },
        ],
        files: [],
        removeFiles: vi.fn(),
        getIsEmptyTrash: vi.fn(),
      },
      uploadDataStore: progress().store,
    });
    return { store, setDeleteDialogVisible };
  };

  const headerDelete = (store: ReturnType<typeof setup>["store"]) =>
    (store.getHeaderMenu(t) as Array<{ id?: string; onClick?: () => void }>)
      .find((option) => option?.id === "menu-delete")
      ?.onClick?.();

  it("Confirmation disabled in settings: the item menu", async () => {
    const { store, setDeleteDialogVisible } = setup(true);

    await store.deleteItemAction(5, "plan.docx", null, true);

    expect(store.isDeleteConfirmationForced).toBe(true);
    expect(setDeleteDialogVisible).toHaveBeenCalledWith(true);
    expect(deleteFile).not.toHaveBeenCalled();
  });

  it("Confirmation disabled in settings: the header menu", async () => {
    const { store, setDeleteDialogVisible } = setup(true);

    headerDelete(store);

    expect(setDeleteDialogVisible).toHaveBeenCalledWith(true);
    expect(removeFiles).not.toHaveBeenCalled();
  });

  it("deletes from the item menu without the dialog outside a private room", async () => {
    const { store, setDeleteDialogVisible } = setup(false);

    await store.deleteItemAction(5, "plan.docx", null, true);

    expect(store.isDeleteConfirmationForced).toBe(false);
    expect(setDeleteDialogVisible).not.toHaveBeenCalled();
    expect(deleteFile).toHaveBeenCalledWith(5);
  });

  it("deletes from the header menu without the dialog outside a private room", async () => {
    const { store, setDeleteDialogVisible } = setup(false);

    headerDelete(store);

    await vi.waitFor(() => expect(removeFiles).toHaveBeenCalledTimes(1));
    expect(setDeleteDialogVisible).not.toHaveBeenCalled();
  });
});

describe("FilesActionsStore — decrypted folder download", () => {
  const ROOM_ID = 10;
  const encrypted = (id: number) => ({
    id,
    title: `opaque-${id}.txt`,
    encrypted: true,
    viewUrl: `http://x/${id}`,
  });
  const listing = (files: unknown[], folders: unknown[] = []) => ({
    files,
    folders,
    total: files.length + folders.length,
  });

  const setup = (selection: unknown[] = []) => {
    const { store: uploadDataStore } = progress();
    return createTestFilesActionsStore({
      userStore: { user: { id: "user-1" }, encryptionKeys: [{ id: "k1" }] },
      selectedFolderStore: { id: ROOM_ID, isRoom: true, navigationPath: [] },
      filesStore: { selection, bufferSelection: null },
      uploadDataStore,
    });
  };
  const reports = { id: 20, title: "Reports", isFolder: true, private: true };

  const decryptsTo = (names: Record<number, string>) =>
    vi.mocked(downloadAndDecryptFileToBuffer).mockImplementation(
      async ({ fileId }) =>
        ({
          success: true,
          data: new Uint8Array([fileId as number]),
          fileName: names[fileId as number],
        }) as never,
    );

  it("Folder download", async () => {
    vi.mocked(getFolder).mockImplementation(async (folderId) =>
      (folderId === 20
        ? listing([encrypted(1)], [{ id: 21, title: "Drafts" }])
        : listing([encrypted(2), encrypted(3)])) as never,
    );
    vi.mocked(getFileEncryptionAccess).mockResolvedValue({
      fileKeys: [{ userId: "user-1", publicKeyId: "k1", privateKeyEnc: "w" }],
    } as never);
    decryptsTo({ 1: "plan.txt", 2: "plan.txt", 3: "plan.txt" });

    await setup().downloadEncryptedFolder({
      id: 20,
      title: "Reports",
      isFolder: true,
    } as never);

    expect(
      vi.mocked(createZipFromBuffers).mock.calls[0][0].map((e) => e.name),
    ).toEqual(["plan.txt", "Drafts/plan.txt", "Drafts/plan (1).txt"]);
    expect(vi.mocked(triggerFileDownload).mock.calls[0][1]).toBe(
      "Reports.zip",
    );
    expect(toastr.warning).not.toHaveBeenCalled();
  });

  it("A file cannot be decrypted", async () => {
    vi.mocked(getFolder).mockResolvedValue(
      listing([encrypted(1), encrypted(2)]) as never,
    );
    vi.mocked(getFileEncryptionAccess).mockImplementation(
      async (fileId) =>
        ({
          fileKeys:
            fileId === 2
              ? [{ userId: "someone-else", publicKeyId: "x", privateKeyEnc: "w" }]
              : [{ userId: "user-1", publicKeyId: "k1", privateKeyEnc: "w" }],
        }) as never,
    );
    decryptsTo({ 1: "plan.txt" });

    await setup().downloadEncryptedFolder({
      id: ROOM_ID,
      title: "Pirate room",
      isRoom: true,
    } as never);

    expect(
      vi.mocked(createZipFromBuffers).mock.calls[0][0].map((e) => e.name),
    ).toEqual(["plan.txt"]);
    expect(toastr.warning).toHaveBeenCalledWith(
      "Common:EncryptedDownloadPartial",
      null,
      0,
      true,
    );
  });

  it("Files and folders selected", async () => {
    vi.mocked(getFolder).mockResolvedValue(listing([encrypted(2)]) as never);
    vi.mocked(getFileEncryptionAccess).mockResolvedValue({
      fileKeys: [{ userId: "user-1", publicKeyId: "k1", privateKeyEnc: "w" }],
    } as never);
    decryptsTo({ 1: "budget.xlsx", 2: "plan.txt" });

    await setup([{ ...encrypted(1), fileExst: ".xlsx" }, reports]).downloadAction(
      "label",
    );

    expect(
      vi.mocked(createZipFromBuffers).mock.calls[0][0].map((e) => e.name),
    ).toEqual(["budget.xlsx", "Reports/plan.txt"]);
    expect(vi.mocked(triggerFileDownload).mock.calls[0][1]).toBe("Files.zip");
    expect(downloadFiles).not.toHaveBeenCalled();
  });

  it("Folder selected in the header menu", async () => {
    vi.mocked(getFolder).mockResolvedValue(listing([encrypted(2)]) as never);
    vi.mocked(getFileEncryptionAccess).mockResolvedValue({
      fileKeys: [{ userId: "user-1", publicKeyId: "k1", privateKeyEnc: "w" }],
    } as never);
    decryptsTo({ 2: "plan.txt" });

    await setup([reports]).downloadAction("label");

    expect(
      vi.mocked(createZipFromBuffers).mock.calls[0][0].map((e) => e.name),
    ).toEqual(["plan.txt"]);
    expect(vi.mocked(triggerFileDownload).mock.calls[0][1]).toBe(
      "Reports.zip",
    );
    expect(downloadFiles).not.toHaveBeenCalled();
  });
});

describe("FilesActionsStore — decrypted download of several files", () => {
  it("Decrypted names clash", async () => {
    vi.mocked(getFileEncryptionAccess).mockResolvedValue({
      fileKeys: [{ userId: "user-1", publicKeyId: "k1", privateKeyEnc: "w" }],
    } as never);
    const decrypted: Record<number, string> = {
      1: "New document (1).docx",
      2: "New document.docx",
      3: "New document.docx",
    };
    vi.mocked(downloadAndDecryptFileToBuffer).mockImplementation(
      async ({ fileId }) =>
        ({
          success: true,
          data: new Uint8Array([fileId as number]),
          fileName: decrypted[fileId as number],
        }) as never,
    );
    const { store: uploadDataStore } = progress();
    const store = createTestFilesActionsStore({
      userStore: { user: { id: "user-1" }, encryptionKeys: [{ id: "k1" }] },
      selectedFolderStore: { id: 10, isRoom: true, navigationPath: [] },
      uploadDataStore,
    });

    await store.downloadEncryptedFilesAsZip(
      [1, 2, 3].map((id) => ({
        id,
        title: `opaque-${id}.docx`,
        encrypted: true,
        viewUrl: `http://x/${id}`,
      })) as never,
    );

    expect(
      vi.mocked(createZipFromBuffers).mock.calls.at(-1)![0].map((e) => e.name),
    ).toEqual([
      "New document (1).docx",
      "New document.docx",
      "New document (2).docx",
    ]);
    expect(vi.mocked(triggerFileDownload).mock.calls.at(-1)![1]).toBe(
      "Files.zip",
    );
  });
});

describe("FilesActionsStore — single encrypted download", () => {
  it("No own access entry", async () => {
    vi.mocked(getFileEncryptionAccess).mockResolvedValue({
      fileKeys: [{ userId: "someone-else", publicKeyId: "k9", privateKeyEnc: "w" }],
    } as never);
    const { store: uploadDataStore } = progress();
    const store = createTestFilesActionsStore({
      userStore: { user: { id: "user-1" }, encryptionKeys: [{ id: "k1" }] },
      uploadDataStore,
    });

    await store.downloadEncryptedFile({
      id: 5,
      title: "opaque-5.txt",
      encrypted: true,
    } as never);

    expect(getFileEncryptionAccess).toHaveBeenCalledWith(5);
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionDownloadFailed",
    );
    expect(requireUnlock).not.toHaveBeenCalled();
    expect(downloadAndDecryptFileToBuffer).not.toHaveBeenCalled();
  });
});
