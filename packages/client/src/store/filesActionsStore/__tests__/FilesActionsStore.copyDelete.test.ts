// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { afterEach, describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  checkFileConflicts: vi.fn(async () => []),
  deleteFilesFromRoom: vi.fn(async () => [{}]),
  removeFiles: vi.fn(async () => [{}]),
}));

import { createTestFilesActionsStore, t } from "./testHarness";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { FolderType } from "@docspace/shared/enums";
import TreeFoldersStore from "../../TreeFoldersStore";

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
      dest: { private: false, rootFolderId: 20 },
    });
    expect(plan).toEqual({ kind: "generic" });
  });

  it("returns refuse-into when a non-private source targets a private room", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file],
      sourceInPrivateRoom: false,
      dest: { private: true, rootFolderId: 20 },
    });
    expect(plan).toEqual({ kind: "refuse-into" });
  });

  it.each([false, true])(
    "returns same-room for a destination in the source room (move=%s)",
    (move) => {
      const store = createTestFilesActionsStore();
      const plan = store.planPrivateTransfer({
        items: [file, folder],
        sourceInPrivateRoom: true,
        sourceRoomId: 7,
        move,
        dest: { insidePrivateRoom: true, roomId: "7", rootFolderId: 10 },
      });
      expect(plan).toEqual({ kind: "same-room" });
    },
  );

  it("Copy to another private room: plans a re-encrypting copy of the files", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file],
      sourceInPrivateRoom: true,
      sourceRoomId: 7,
      dest: { insidePrivateRoom: true, roomId: 8, rootFolderId: 10 },
    });
    expect(plan).toEqual({
      kind: "reencrypt-into",
      files: [file],
      refusedFolders: [],
    });
  });

  it("Folder copied to another private room: the folder is refused, the files are re-encrypted", () => {
    const store = createTestFilesActionsStore();
    const dest = { insidePrivateRoom: true, roomId: 8, rootFolderId: 10 };
    expect(
      store.planPrivateTransfer({
        items: [file, folder],
        sourceInPrivateRoom: true,
        sourceRoomId: 7,
        dest,
      }),
    ).toEqual({
      kind: "reencrypt-into",
      files: [file],
      refusedFolders: [folder],
    });
    expect(
      store.planPrivateTransfer({
        items: [folder],
        sourceInPrivateRoom: true,
        sourceRoomId: 7,
        dest,
      }),
    ).toEqual({ kind: "refuse-folder-out" });
  });

  it("returns refuse-move-into for a move of files or folders into another private room", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file, folder],
      sourceInPrivateRoom: true,
      sourceRoomId: 7,
      move: true,
      dest: { insidePrivateRoom: true, roomId: 8, rootFolderId: 10 },
    });
    expect(plan).toEqual({ kind: "refuse-move-into" });
  });

  it("treats a private destination whose room is unknown as another room", () => {
    const store = createTestFilesActionsStore();
    const dest = { private: true, rootFolderType: FolderType.Rooms };
    expect(
      store.planPrivateTransfer({
        items: [file],
        sourceInPrivateRoom: true,
        sourceRoomId: 7,
        dest,
      }),
    ).toEqual({ kind: "reencrypt-into", files: [file], refusedFolders: [] });
    expect(
      store.planPrivateTransfer({
        items: [file],
        sourceInPrivateRoom: true,
        sourceRoomId: 7,
        move: true,
        dest,
      }),
    ).toEqual({ kind: "refuse-move-into" });
  });

  it("returns refuse-folder-out when only folders leave a private room", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [folder],
      sourceInPrivateRoom: true,
      sourceRoomId: 7,
      dest: { private: false, rootFolderId: 20 },
    });
    expect(plan).toEqual({ kind: "refuse-folder-out" });
  });

  it("returns decrypt-out with the files and the refused folders when files leave a private room", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file, folder],
      sourceInPrivateRoom: true,
      sourceRoomId: 7,
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

  it("refuses refuse-move-into with Common:CannotMoveToAnotherPrivateRoom", () => {
    const store = createTestFilesActionsStore();
    const copy = vi.fn(async () => {});
    store.copyEncryptedFilesToFolder = copy;
    expect(
      store.runPrivateTransferPlan({ kind: "refuse-move-into" }, 5, null, { move: true }),
    ).toBe(true);
    expect(toastr.error).toHaveBeenCalledWith("Common:CannotMoveToAnotherPrivateRoom");
    expect(copy).not.toHaveBeenCalled();
  });

  it("reencrypt-into copies the files into the private destination and never deletes the sources", () => {
    const store = createTestFilesActionsStore();
    const copy = vi.fn(async () => {});
    store.copyEncryptedFilesToFolder = copy;
    const handled = store.runPrivateTransferPlan(
      { kind: "reencrypt-into", files: [file], refusedFolders: [] },
      5,
      { private: true, rootFolderId: 10, rootFolderType: FolderType.Rooms },
      { move: true, sourceRoomId: 7 },
    );
    expect(handled).toBe(true);
    expect(copy).toHaveBeenCalledWith(
      [file],
      5,
      expect.objectContaining({
        private: true,
        rootFolderType: FolderType.Rooms,
        deleteSourceOnSuccess: false,
        sourceRoomId: 7,
      }),
    );
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
      sourceRoomId: 7,
      dest: { rootFolderId: 10, insidePrivateRoom: false },
    });
    expect(plan).toEqual({ kind: "decrypt-out", files: [file], refusedFolders: [] });
  });

  it("returns refuse-into for a subfolder known to be inside a private room", () => {
    const store = createTestFilesActionsStore();
    const plan = store.planPrivateTransfer({
      items: [file],
      sourceInPrivateRoom: false,
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

describe("FilesActionsStore - drag inside a private room", () => {
  const item = {
    id: 1,
    title: "a.docx",
    fileExst: ".docx",
    encrypted: true,
    security: { Move: true },
  };

  const dragFromRoom = (dest: Record<string, unknown>, destFolderId: number) => {
    const itemOperationToFolder = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder: true },
      selectedFolderStore: {
        id: 50,
        isRoom: true,
        rootFolderId: 10,
        navigationPath: [{ id: 10, isRootRoom: true }],
      },
      filesStore: { selection: [item], bufferSelection: null },
      uploadDataStore: progressStore({ itemOperationToFolder }),
    });
    const copy = vi.fn(async () => {});
    store.copyEncryptedFilesToFolder = copy;
    store.moveDragItems(destFolderId, "Folder", dest as never);
    return { copy, itemOperationToFolder };
  };

  it("moves files dropped on a folder row of the open room on the server", async () => {
    const { copy, itemOperationToFolder } = dragFromRoom(
      { id: 60, parentId: 50, private: false, rootFolderId: 10 },
      60,
    );

    await vi.waitFor(() => expect(itemOperationToFolder).toHaveBeenCalled());
    expect(toastr.error).not.toHaveBeenCalled();
    expect(copy).not.toHaveBeenCalled();
  });

  it("refuses files dropped on another private room row with Common:CannotMoveToAnotherPrivateRoom", () => {
    const { copy, itemOperationToFolder } = dragFromRoom(
      { id: 70, isRoom: true, private: true, rootFolderId: 10 },
      70,
    );

    expect(toastr.error).toHaveBeenCalledWith("Common:CannotMoveToAnotherPrivateRoom");
    expect(copy).not.toHaveBeenCalled();
    expect(itemOperationToFolder).not.toHaveBeenCalled();
  });
});

describe("FilesActionsStore - drag out of an archived private room", () => {
  const ARCHIVE_ROOT_ID = 30;
  const myDocuments = { id: 5, private: false, rootFolderId: 20 } as never;

  // The server grants Copy, not Move, inside an archived room.
  const archivedStore = (selection: unknown[]) => {
    const itemOperationToFolder = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder: true },
      selectedFolderStore: {
        rootFolderId: ARCHIVE_ROOT_ID,
        rootFolderType: FolderType.Archive,
      },
      filesStore: { selection, bufferSelection: null },
      uploadDataStore: progressStore({ itemOperationToFolder }),
    });
    const copy = vi.fn(async () => {});
    store.copyEncryptedFilesToFolder = copy;
    return { store, copy, itemOperationToFolder };
  };

  it("decrypts encrypted files dragged to My documents and requests no server copy", () => {
    const file = {
      id: 1,
      title: "a.docx",
      fileExst: ".docx",
      encrypted: true,
      security: { Copy: true, Move: false },
    };
    const { store, copy, itemOperationToFolder } = archivedStore([file]);

    store.moveDragItems(5, "My documents", myDocuments);

    expect(copy).toHaveBeenCalledWith(
      [file],
      5,
      expect.objectContaining({ deleteSourceOnSuccess: false }),
    );
    expect(itemOperationToFolder).not.toHaveBeenCalled();
  });

  it("Folder dragged out", () => {
    const folder = {
      id: 2,
      title: "Reports",
      isFolder: true,
      security: { Copy: true, Move: false },
    };
    const { store, copy, itemOperationToFolder } = archivedStore([folder]);

    store.moveDragItems(5, "My documents", myDocuments);

    expect(toastr.error).toHaveBeenCalledWith(
      "Common:CannotTransferFolderFromPrivateRoom",
    );
    expect(copy).not.toHaveBeenCalled();
    expect(itemOperationToFolder).not.toHaveBeenCalled();
  });
});

describe("FilesActionsStore - the section does not decide transfers", () => {
  // The root of a private room as SelectedFolderStore holds it.
  const openFolder = { id: 50, private: true, navigationPath: [] };
  const file = {
    id: 1,
    title: "a.docx",
    isFolder: false,
    security: { Move: true },
  };

  const dragOutUnder = (pathname: string) => {
    window.history.pushState({}, "", pathname);
    const { isPrivacyFolder } = new TreeFoldersStore(
      ...([openFolder, {}, {}] as unknown as ConstructorParameters<
        typeof TreeFoldersStore
      >),
    );
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder },
      selectedFolderStore: { rootFolderId: 10 },
      filesStore: { selection: [file], bufferSelection: null },
    });
    const copy = vi.fn(async () => {});
    store.copyEncryptedFilesToFolder = copy;

    store.moveDragItems(5, "Docs", {
      id: 5,
      private: false,
      rootFolderId: 20,
    } as never);

    return copy.mock.calls;
  };

  afterEach(() => window.history.pushState({}, "", "/"));

  it("Private room opened under Rooms: files dragged out are decrypted as under /private", () => {
    const underRooms = dragOutUnder("/rooms/shared/50/filter");
    const underPrivate = dragOutUnder("/private/50/filter");

    expect(underRooms).toEqual([
      [[file], 5, expect.objectContaining({ deleteSourceOnSuccess: true })],
    ]);
    expect(underPrivate).toEqual(underRooms);
  });
});
