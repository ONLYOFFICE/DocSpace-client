// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestFilesActionsStore } from "../filesActionsStore/__tests__/testHarness";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";

import HotkeyStore from "../HotkeyStore";
import { resolveOpenFolderTarget } from "../uploadDataStore/target.helpers";

const t = ((key: string) => key) as unknown as TTranslation;

const ROOMS_ROOT = 100;
const MY_ROOT = 200;

type TItem = {
  id: number;
  title: string;
  fileExst?: string;
  isFolder?: boolean;
  security: { Copy: boolean; Move: boolean };
};

const file = (id: number): TItem => ({
  id,
  title: `f${id}.docx`,
  fileExst: ".docx",
  security: { Copy: true, Move: true },
});
const folder = (id: number): TItem => ({
  id,
  title: `d${id}`,
  isFolder: true,
  security: { Copy: true, Move: true },
});
// Inside a private room the server denies Copy and allows Move.
const privateFile = (id: number): TItem => ({
  ...file(id),
  security: { Copy: false, Move: true },
});
const privateFolder = (id: number): TItem => ({
  ...folder(id),
  security: { Copy: false, Move: true },
});

const location = {
  privateRoom: (roomId: number, folderId = roomId) => ({
    private: true,
    id: folderId,
    rootFolderId: ROOMS_ROOT,
    navigationPath:
      folderId === roomId ? [] : [{ id: roomId, isRoom: true, private: true }],
    isRoom: folderId === roomId,
    roomType: RoomsType.CustomRoom,
  }),
  room: (roomId: number) => ({
    private: false,
    id: roomId,
    rootFolderId: ROOMS_ROOT,
    navigationPath: [],
    isRoom: true,
    roomType: RoomsType.CustomRoom,
  }),
  myDocuments: (folderId: number) => ({
    private: false,
    id: folderId,
    rootFolderId: MY_ROOT,
    navigationPath: [],
    isRoom: false,
    roomType: null,
  }),
};

// makeAutoObservable deep-clones plain objects; a real store is a class instance.
const asStore = <T extends object>(fake: T): T =>
  Object.assign(Object.create({}), fake);

const setup = () => {
  const filesStore = asStore({
    selection: [] as TItem[],
    hotkeysClipboard: [] as TItem[],
    activeFiles: [],
    activeFolders: [],
    setHotkeysClipboard: vi.fn((clipboard?: TItem[]) => {
      filesStore.hotkeysClipboard = clipboard ?? [...filesStore.selection];
    }),
  });
  const treeFoldersStore = asStore({ isPrivacyFolder: false });
  const selectedFolderStore = asStore({
    id: 0 as number,
    rootFolderId: 0 as number,
    rootFolderType: FolderType.Rooms as FolderType,
    roomType: null as RoomsType | null,
    navigationPath: [] as { id: number; isRoom: boolean }[],
    isRoom: false,
    security: { CopyTo: true, MoveTo: true },
    getSelectedFolder: () => ({ id: selectedFolderStore.id }),
  });
  const itemOperationToFolder = vi.fn(async () => {});
  const startUpload = vi.fn();
  const uploadDataStore = asStore({
    itemOperationToFolder,
    clearActiveOperations: vi.fn(),
    startUpload,
    resolveOpenFolderTarget: () =>
      resolveOpenFolderTarget({
        selectedFolderStore,
        treeFoldersStore,
        aiRoomStore: { knowledgeId: null },
      } as never),
  });

  const filesActionsStore = createTestFilesActionsStore({ uploadDataStore });
  const copyEncryptedFilesToFolder = vi.fn(async () => {});
  const createFoldersTree = vi.fn();
  // The app shares one SelectedFolderStore between the stores.
  Object.assign(filesActionsStore, {
    selectedFolderStore,
    copyEncryptedFilesToFolder,
    createFoldersTree,
    checkFileConflicts: vi.fn(async () => []),
    setSelectedItems: vi.fn(),
    setConflictDialogData: vi.fn(),
  });

  const store = new HotkeyStore(
    filesStore as never,
    asStore({ setMoveToPublicRoomVisible: vi.fn() }) as never,
    asStore({}) as never,
    filesActionsStore as never,
    treeFoldersStore as never,
    uploadDataStore as never,
    selectedFolderStore as never,
    asStore({}) as never,
  );

  const goTo = (where: ReturnType<(typeof location)[keyof typeof location]>) => {
    treeFoldersStore.isPrivacyFolder = where.private;
    selectedFolderStore.id = where.id;
    selectedFolderStore.rootFolderId = where.rootFolderId;
    selectedFolderStore.rootFolderType =
      where.rootFolderId === ROOMS_ROOT ? FolderType.Rooms : FolderType.USER;
    selectedFolderStore.roomType = where.roomType;
    selectedFolderStore.navigationPath = where.navigationPath;
    selectedFolderStore.isRoom = where.isRoom;
  };

  const clip = (items: TItem[], cut = false) => {
    filesStore.selection = items;
    store.copyToClipboard(t, cut);
  };

  const paste = async () => {
    store.moveFilesFromClipboard(t);
    await new Promise((resolve) => setTimeout(resolve, 0));
  };

  return {
    store,
    goTo,
    clip,
    paste,
    filesStore,
    itemOperationToFolder,
    copyEncryptedFilesToFolder,
    createFoldersTree,
    startUpload,
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("HotkeyStore - clipboard paste and private rooms", () => {
  it("Paste with hotkey: items from a non-private location are refused in a private room", async () => {
    const s = setup();
    s.goTo(location.myDocuments(5));
    s.clip([file(1)]);
    s.goTo(location.privateRoom(7));
    await s.paste();

    expect(toastr.error).toHaveBeenCalledWith("Common:CannotTransferToPrivateRoom");
    expect(s.itemOperationToFolder).not.toHaveBeenCalled();
    expect(s.copyEncryptedFilesToFolder).not.toHaveBeenCalled();
    expect(s.filesStore.hotkeysClipboard).toEqual([]);
  });

  it("Cut and paste out of a private room: files are decrypted and their sources deleted", async () => {
    const s = setup();
    s.goTo(location.privateRoom(7));
    s.clip([privateFile(1), privateFile(2)], true);
    s.goTo(location.myDocuments(5));
    await s.paste();

    expect(s.itemOperationToFolder).not.toHaveBeenCalled();
    expect(s.copyEncryptedFilesToFolder).toHaveBeenCalledWith(
      [privateFile(1), privateFile(2)],
      5,
      expect.objectContaining({
        private: false,
        deleteSourceOnSuccess: true,
        sourceRoomId: 7,
      }),
    );
  });

  it("cut out of a private room into another room of the same section decrypts the files", async () => {
    const s = setup();
    s.goTo(location.privateRoom(7));
    s.clip([privateFile(1)], true);
    s.goTo(location.room(8));
    await s.paste();

    expect(s.itemOperationToFolder).not.toHaveBeenCalled();
    expect(s.copyEncryptedFilesToFolder).toHaveBeenCalledWith(
      [privateFile(1)],
      8,
      expect.objectContaining({
        private: false,
        deleteSourceOnSuccess: true,
        sourceRoomId: 7,
      }),
    );
  });

  it("Copy hotkey inside a private room: nothing is added to the clipboard", () => {
    const s = setup();
    s.goTo(location.privateRoom(7));
    s.clip([privateFile(1)]);

    expect(s.filesStore.hotkeysClipboard).toEqual([]);
    expect(toastr.success).not.toHaveBeenCalled();
  });

  it("Folder cut out of a private room: the folder is not transferred", async () => {
    const s = setup();
    s.goTo(location.privateRoom(7));
    s.clip([privateFolder(3)], true);
    s.goTo(location.myDocuments(5));
    await s.paste();

    expect(toastr.error).toHaveBeenCalledWith(
      "Common:CannotTransferFolderFromPrivateRoom",
    );
    expect(s.itemOperationToFolder).not.toHaveBeenCalled();
    expect(s.copyEncryptedFilesToFolder).not.toHaveBeenCalled();
  });

  it("Paste within the same private room: the server moves the files without decryption", async () => {
    const s = setup();
    s.goTo(location.privateRoom(7));
    s.clip([privateFile(1)], true);
    s.goTo(location.privateRoom(7, 9));
    await s.paste();

    expect(s.copyEncryptedFilesToFolder).not.toHaveBeenCalled();
    expect(s.itemOperationToFolder).toHaveBeenCalledWith(
      expect.objectContaining({ destFolderId: 9, fileIds: [1], isCopy: false }),
    );
  });

  it("paste between non-private folders keeps the server-side transfer", async () => {
    const s = setup();
    s.goTo(location.myDocuments(5));
    s.clip([file(1), folder(3)], true);
    s.goTo(location.room(8));
    await s.paste();

    expect(toastr.error).not.toHaveBeenCalled();
    expect(s.copyEncryptedFilesToFolder).not.toHaveBeenCalled();
    expect(s.itemOperationToFolder).toHaveBeenCalledWith(
      expect.objectContaining({
        destFolderId: 8,
        fileIds: [1],
        folderIds: [3],
        isCopy: false,
      }),
    );
  });
});

describe("HotkeyStore - files pasted from the computer", () => {
  it("Pasted files after navigation", async () => {
    const s = setup();
    s.goTo(location.privateRoom(7));
    let releaseTree!: () => void;
    const treeHeld = new Promise<void>((resolve) => {
      releaseTree = resolve;
    });
    s.createFoldersTree.mockImplementation(
      async (_t: TTranslation, files: File[]) => {
        await treeHeld;
        return files;
      },
    );
    const pasted = new File(["secret"], "secret.txt");

    const handled = s.store.uploadClipboardFiles(t, {
      type: "paste",
      target: null,
      clipboardData: { files: [pasted] },
    } as unknown as ClipboardEvent);
    s.goTo(location.myDocuments(5));
    releaseTree();
    await handled;
    await vi.waitFor(() => expect(s.startUpload).toHaveBeenCalledTimes(1));

    const privateRoom = {
      folderId: 7,
      isPrivate: true,
      roomType: RoomsType.CustomRoom,
      encryptionRoomId: 7,
    };
    expect(s.createFoldersTree).toHaveBeenCalledWith(t, [pasted], privateRoom);
    expect(s.startUpload).toHaveBeenCalledWith([pasted], privateRoom, t);
  });
});
