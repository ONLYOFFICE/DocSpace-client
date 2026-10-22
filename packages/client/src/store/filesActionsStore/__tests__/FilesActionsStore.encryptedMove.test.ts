// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@docspace/shared/services/encryption/secret-storage", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  requireUnlock: vi.fn(async () => ({ publicKey: "pk", privateKey: "sk" })),
}));

vi.mock("@docspace/shared/services/private-room/encrypted-copy", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  decryptEncryptedItemToFile: vi.fn(async (item: { id: number; title: string }) => {
    if (item.id === 2) throw new Error("bad key");
    return new File(["plain"], item.title, { type: "text/plain" });
  }),
}));

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getFolderPath: vi.fn(),
}));

import { createTestFilesActionsStore } from "./testHarness";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { getFolderPath } from "@docspace/shared/api/files";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import { decryptEncryptedItemToFile } from "@docspace/shared/services/private-room/encrypted-copy";

declare function allowConsoleError(matcher: RegExp | string): void;

type TTagged = File & {
  parentFolderId?: number | string;
  uploadContext?: { isPrivate: boolean; moveSource?: unknown };
};

const ok = { id: 1, title: "ok.docx", fileExst: ".docx", encrypted: true };
const broken = { id: 2, title: "broken.docx", fileExst: ".docx", encrypted: true };

const setup = () => {
  const startUpload = vi.fn();
  const store = createTestFilesActionsStore({
    userStore: { user: { id: "user-1" }, encryptionKeys: [{ id: "k1" }] },
    selectedFolderStore: {
      rootFolderId: 10,
      navigationPath: [{ id: 7, isRoom: true }],
    },
    uploadDataStore: { startUpload },
  });
  const uploaded = () =>
    (startUpload.mock.calls[0]?.[0] ?? []) as TTagged[];
  return { store, startUpload, uploaded };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FilesActionsStore - encrypted files moved out of a private room", () => {
  it("Move out of the room: each decrypted copy carries its source for deletion", async () => {
    const { store, uploaded } = setup();

    await store.copyEncryptedFilesToFolder([ok] as never, 5, {
      private: false,
      rootFolderId: 20,
      rootFolderType: FolderType.USER,
      deleteSourceOnSuccess: true,
    });

    expect(uploaded()).toHaveLength(1);
    expect(uploaded()[0].parentFolderId).toBe(5);
    expect(uploaded()[0].uploadContext?.moveSource).toEqual({
      fileId: 1,
      title: "ok.docx",
    });
  });

  it("Move with a failed copy: the failed source is not tagged and is named", async () => {
    allowConsoleError(/client copy failed/);
    const { store, uploaded } = setup();

    await store.copyEncryptedFilesToFolder([ok, broken] as never, 5, {
      private: false,
      rootFolderId: 20,
      rootFolderType: FolderType.USER,
      deleteSourceOnSuccess: true,
    });

    expect(uploaded().map((f) => f.name)).toEqual(["ok.docx"]);
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedMovePartialFailure",
    );
  });

  it("Copy to My documents: decrypted copies carry no source to delete", async () => {
    allowConsoleError(/client copy failed/);
    const { store, uploaded } = setup();

    await store.copyEncryptedFilesToFolder([ok, broken] as never, 5, {
      private: false,
      rootFolderId: 20,
      rootFolderType: FolderType.USER,
    });

    expect(uploaded()[0].uploadContext?.moveSource).toBeUndefined();
    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptedCopyFailed");
  });

  it("Identity locked: nothing is transferred and no source is tagged", async () => {
    vi.mocked(requireUnlock).mockResolvedValueOnce(null as never);
    const { store, startUpload } = setup();

    await store.copyEncryptedFilesToFolder([ok] as never, 5, {
      private: false,
      rootFolderId: 20,
      rootFolderType: FolderType.USER,
      deleteSourceOnSuccess: true,
    });

    expect(startUpload).not.toHaveBeenCalled();
  });
});

describe("FilesActionsStore - encrypted files copied into another private room", () => {
  const SOURCE_ROOM = 7;
  const DEST_ROOM = 8;
  const DEST_FOLDER = 80;

  /** A GET folder/{id}/path answer: the section root, the room, the folder. */
  const pathTo = (roomId: number, isPrivate: boolean) =>
    [
      { id: 10, title: "Rooms", private: false },
      {
        id: roomId,
        title: "Room",
        roomType: RoomsType.CustomRoom,
        private: isPrivate,
      },
      { id: DEST_FOLDER, title: "Folder", private: false },
    ] as never;

  const roomTarget = (roomId: number) => ({
    folderId: roomId,
    isPrivate: true,
    roomType: RoomsType.CustomRoom,
    encryptionRoomId: roomId,
  });

  const setupFrom = (
    source: "active" | "archived",
    openTarget = roomTarget(SOURCE_ROOM),
  ) => {
    const startUpload = vi.fn();
    const store = createTestFilesActionsStore({
      userStore: { user: { id: "user-1" }, encryptionKeys: [{ id: "k1" }] },
      selectedFolderStore: {
        id: SOURCE_ROOM,
        isRoom: true,
        rootFolderId: source === "active" ? 10 : 30,
        rootFolderType:
          source === "active" ? FolderType.Rooms : FolderType.Archive,
        navigationPath: [],
      },
      uploadDataStore: { startUpload, resolveOpenFolderTarget: () => openTarget },
    });
    const uploaded = () =>
      (startUpload.mock.calls[0]?.[0] ?? []) as TTagged[];
    const target = () => startUpload.mock.calls[0]?.[1];
    return { store, startUpload, uploaded, target };
  };

  const copyToDest = (store: ReturnType<typeof setupFrom>["store"]) =>
    store.copyEncryptedFilesToFolder([ok] as never, DEST_FOLDER, {
      private: true,
      rootFolderId: 10,
      rootFolderType: FolderType.Rooms,
      sourceRoomId: SOURCE_ROOM,
    });

  it("Copy to another private room", async () => {
    vi.mocked(getFolderPath).mockResolvedValue(pathTo(DEST_ROOM, true));
    const { store, uploaded, target } = setupFrom("active");

    await copyToDest(store);

    expect(vi.mocked(getFolderPath).mock.calls).toEqual([[DEST_FOLDER]]);
    expect(target()).toEqual({
      ...roomTarget(DEST_ROOM),
      folderId: DEST_FOLDER,
    });
    expect(uploaded().map((f) => f.name)).toEqual(["ok.docx"]);
    expect(uploaded()[0].uploadContext).toEqual({
      roomType: RoomsType.CustomRoom,
      isPrivate: true,
    });
  });

  it("Copy from an archived private room", async () => {
    vi.mocked(getFolderPath).mockResolvedValue(pathTo(DEST_ROOM, true));
    const { store, uploaded, target } = setupFrom("archived");

    await copyToDest(store);

    expect(target()).toMatchObject({ isPrivate: true });
    expect(uploaded()).toHaveLength(1);
    expect(uploaded()[0].uploadContext?.isPrivate).toBe(true);
  });

  it("Key wrapped for the destination room", async () => {
    vi.mocked(getFolderPath).mockResolvedValue(pathTo(DEST_ROOM, true));
    const { store, target } = setupFrom("active");

    await copyToDest(store);

    expect(target().encryptionRoomId).toBe(DEST_ROOM);
    expect(target().encryptionRoomId).not.toBe(SOURCE_ROOM);
  });

  it("Destination room cannot be resolved", async () => {
    allowConsoleError(/copy destination not resolved/);
    vi.mocked(getFolderPath).mockRejectedValueOnce(new Error("403"));
    const { store, startUpload } = setupFrom("active");

    await copyToDest(store);

    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptedCopyFailed");
    expect(requireUnlock).not.toHaveBeenCalled();
    expect(decryptEncryptedItemToFile).not.toHaveBeenCalled();
    expect(startUpload).not.toHaveBeenCalled();
  });

  it("Identity locked", async () => {
    vi.mocked(getFolderPath).mockResolvedValue(pathTo(DEST_ROOM, true));
    vi.mocked(requireUnlock).mockResolvedValueOnce(null as never);
    const { store, startUpload } = setupFrom("active");

    await copyToDest(store);

    expect(decryptEncryptedItemToFile).not.toHaveBeenCalled();
    expect(startUpload).not.toHaveBeenCalled();
  });

  it("never uploads into a private folder whose room is not known", async () => {
    const { store, startUpload } = setupFrom("active", {
      ...roomTarget(SOURCE_ROOM),
      encryptionRoomId: null as never,
    });

    await store.copyEncryptedFilesToFolder([ok] as never, SOURCE_ROOM, {
      private: true,
    });

    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptedCopyFailed");
    expect(startUpload).not.toHaveBeenCalled();
  });

  it("Same-room copy: a copy into the open room keeps its room and gets a suffix", async () => {
    const { store, uploaded, target } = setupFrom("active");

    await store.copyEncryptedFilesToFolder([ok] as never, SOURCE_ROOM, {
      private: true,
      sourceRoomId: SOURCE_ROOM,
    });

    expect(getFolderPath).not.toHaveBeenCalled();
    expect(target()).toEqual(roomTarget(SOURCE_ROOM));
    expect(uploaded()[0].name).not.toBe("ok.docx");
    expect(uploaded()[0].name).toMatch(/^ok.*\.docx$/);
  });
});
