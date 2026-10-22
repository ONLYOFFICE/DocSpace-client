// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeBrowserFile,
  makePrivateUploadTarget,
  makeUploadFile,
  makeUploadTarget,
} from "./testHarness";
import * as filesApi from "@docspace/shared/api/files";
import { RoomsType } from "@docspace/shared/enums";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import { listDecryptedFileNames } from "@docspace/shared/services/private-room/encrypted-name-clash";
import type { TTranslation } from "@docspace/shared/types";

import {
  cancelUploadActionImpl,
  cancelUploadImpl,
  handleFilesUploadImpl,
  handleUploadConflictsImpl,
  retryQuotaFailedFilesImpl,
  retryUploadFilesImpl,
  setConflictDialogDataImpl,
  startUploadImpl,
} from "../start.helpers";
import type { TUploadFile, TUploadTarget } from "../helpers";
import type UploadDataStore from "../../UploadDataStore";

vi.mock("@docspace/shared/services/encryption/secret-storage", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  requireUnlock: vi.fn(),
}));

vi.mock(
  "@docspace/shared/services/private-room/encrypted-name-clash",
  async (io) => ({
    ...((await io()) as Record<string, unknown>),
    listDecryptedFileNames: vi.fn(),
  }),
);

const t = ((key: string) => key) as unknown as TTranslation;

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("cancelUploadImpl", () => {
  it("cancels pending rows, prunes history, clears the quota flag and finalizes", () => {
    const { store, fakes } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ uniqueId: "up", action: "upload" }),
      makeUploadFile({ uniqueId: "done", action: "uploaded" }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "done", action: "uploaded" }),
      makeUploadFile({ uniqueId: "up", action: "upload" }),
    ];
    store.quotaErrorRaised = true;

    cancelUploadImpl(store);

    expect(store.uploaded).toBe(true);
    expect(store.converted).toBe(true);
    expect(store.percent).toBe(100);
    expect(store.quotaErrorRaised).toBe(false);
    expect(store.files.find((f) => f.uniqueId === "up")?.cancel).toBe(true);
    expect(store.uploadedFilesHistory.map((f) => f.uniqueId)).toEqual(["done"]);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ completed: true, canceled: true }),
    );
  });
});

describe("cancelUploadActionImpl", () => {
  it("removes the given items from files, history and tempConversionFiles", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ uniqueId: "a" }),
      makeUploadFile({ uniqueId: "b" }),
    ];
    store.uploadedFilesHistory = [makeUploadFile({ uniqueId: "a" })];
    store.tempConversionFiles = [makeUploadFile({ uniqueId: "a" })];

    cancelUploadActionImpl(store, [{ uniqueId: "a" }]);

    expect(store.files.map((f) => f.uniqueId)).toEqual(["b"]);
    expect(store.uploadedFilesHistory).toEqual([]);
    expect(store.tempConversionFiles).toEqual([]);
  });
});

describe("setConflictDialogDataImpl", () => {
  it("forwards conflicts and payload to the dialog store and opens it", () => {
    const { store, fakes } = createTestUploadDataStore();
    const conflicts = [{ title: "a.docx", isFile: true }];
    const payload = { isUploadConflict: true, folderTitle: "Backups" };

    setConflictDialogDataImpl(store, conflicts, payload as never);

    expect(
      fakes.dialogsStore.setConflictResolveDialogItems,
    ).toHaveBeenCalledWith(conflicts);
    expect(
      fakes.dialogsStore.setConflictResolveDialogData,
    ).toHaveBeenCalledWith(payload);
    expect(
      fakes.dialogsStore.setConflictResolveDialogVisible,
    ).toHaveBeenCalledWith(true);
  });
});

describe("handleFilesUploadImpl", () => {
  it("adopts the new history and hands off to the uploader", () => {
    const { store } = createTestUploadDataStore();
    const startUploadFiles = vi.fn();
    store.startUploadFiles = startUploadFiles as never;
    const history = [makeUploadFile({ uniqueId: "h" })];
    const data = {
      files: [makeUploadFile({ uniqueId: "h" })],
      filesSize: 10,
      uploadedFilesHistory: history,
      newFilesWithoutConversion: [],
      allNewFiles: [],
    };

    handleFilesUploadImpl(store, data as never, t, true);

    expect(store.uploadedFilesHistory.map((f) => f.uniqueId)).toEqual(["h"]);
    expect(store.files.map((f) => f.uniqueId)).toEqual(["h"]);
    expect(startUploadFiles).toHaveBeenCalledWith(t, true);
  });
});

describe("handleUploadConflictsImpl", () => {
  const checkConflicts = async (
    store: UploadDataStore,
    files: TUploadFile[],
    toFolderId: number,
  ) => {
    const handleUploadAndOptionalConversion = vi.fn();
    store.handleUploadAndOptionalConversion =
      handleUploadAndOptionalConversion as never;
    vi.mocked(filesApi.checkIsFileExist).mockResolvedValue([] as never);
    vi.mocked(filesApi.getFolderInfo).mockResolvedValue({
      title: "Room",
    } as never);

    await handleUploadConflictsImpl(store, t, toFolderId, {
      files,
      filesSize: 0,
      uploadedFilesHistory: files,
      newFilesWithoutConversion: files,
      allNewFiles: files,
      conversionFiles: [],
      percent: 0,
    } as never);

    return handleUploadAndOptionalConversion;
  };

  const privateItem = () =>
    makeUploadFile({
      file: makeBrowserFile("Salary review.docx", 10),
      toFolderId: 50,
      target: makePrivateUploadTarget(),
    });

  const ordinaryItem = () =>
    makeUploadFile({
      file: makeBrowserFile("Agenda.docx", 10),
      toFolderId: 1,
    });

  it("Conflict check", async () => {
    const { store } = createTestUploadDataStore();

    const upload = await checkConflicts(store, [privateItem()], 50);

    expect(filesApi.checkIsFileExist).not.toHaveBeenCalled();
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it("leaves files queued for a private room out of a later ordinary check", async () => {
    const { store } = createTestUploadDataStore();

    await checkConflicts(store, [privateItem(), ordinaryItem()], 1);

    expect(filesApi.checkIsFileExist).toHaveBeenCalledWith(1, ["Agenda.docx"]);
  });

  describe("name clashes in a private room", () => {
    const keyed = {
      userStore: {
        user: { id: "user-1", isAdmin: false },
        encryptionKeys: [{ id: "key-1", publicKey: "pub-b64" }],
      },
    };

    const copyInto = (name: string) =>
      makeUploadFile({
        file: makeBrowserFile(name, 10, {
          parentFolderId: 50,
          uploadContext: { roomType: RoomsType.CustomRoom, isPrivate: true },
        }),
        toFolderId: 50,
        target: makePrivateUploadTarget(),
      });

    const dialogPayload = (setData: unknown) =>
      vi.mocked(setData as (data: unknown) => void).mock
        .calls[0][0] as unknown as {
        newUploadData: never;
        privateRenames: never;
      };

    it("Copy into a room holding a file of the same name", async () => {
      const { store, fakes } = createTestUploadDataStore(keyed);
      vi.mocked(requireUnlock).mockResolvedValue({} as never);
      vi.mocked(listDecryptedFileNames).mockResolvedValue([
        "New document.docx",
      ]);
      const item = copyInto("New document.docx");

      const upload = await checkConflicts(store, [item], 50);

      expect(upload).not.toHaveBeenCalled();
      expect(filesApi.checkIsFileExist).not.toHaveBeenCalled();
      expect(listDecryptedFileNames).toHaveBeenCalledWith(
        "50",
        50,
        "user-1",
        {},
      );
      expect(
        fakes.dialogsStore.setConflictResolveDialogItems,
      ).toHaveBeenCalledWith([{ title: "New document.docx", isFile: true }]);
      const payload = dialogPayload(
        fakes.dialogsStore.setConflictResolveDialogData,
      );
      expect(payload.privateRenames).toEqual([
        {
          uniqueId: item.uniqueId,
          title: "New document.docx",
          name: "New document (1).docx",
        },
      ]);

      store.conflictDialogUploadHandler(
        payload.newUploadData,
        t,
        true,
        payload.privateRenames,
      );

      expect(item.file.name).toBe("New document (1).docx");
      expect(item.file.parentFolderId).toBe(50);
      expect(item.file.uploadContext).toEqual({
        roomType: RoomsType.CustomRoom,
        isPrivate: true,
      });
      expect(upload).toHaveBeenCalledWith(payload.newUploadData, t, true);
    });

    it("Upload without a clash", async () => {
      const { store, fakes } = createTestUploadDataStore(keyed);
      vi.mocked(requireUnlock).mockResolvedValue({} as never);
      vi.mocked(listDecryptedFileNames).mockResolvedValue(["Other.docx"]);

      const upload = await checkConflicts(store, [privateItem()], 50);

      expect(upload).toHaveBeenCalledTimes(1);
      expect(
        fakes.dialogsStore.setConflictResolveDialogVisible,
      ).not.toHaveBeenCalled();
      expect(filesApi.checkIsFileExist).not.toHaveBeenCalled();
    });

    it("fails the files as locked when the unlock for the comparison is declined", async () => {
      const { store, fakes } = createTestUploadDataStore(keyed);
      vi.mocked(requireUnlock).mockResolvedValue(null as never);
      const item = privateItem();

      const upload = await checkConflicts(store, [item], 50);

      expect(listDecryptedFileNames).not.toHaveBeenCalled();
      expect(item.error).toBe("Common:EncryptionLockedUpload");
      expect(item.inAction).toBe(true);
      expect(
        fakes.dialogsStore.setConflictResolveDialogVisible,
      ).not.toHaveBeenCalled();
      expect(upload).toHaveBeenCalledTimes(1);
    });
  });

  it("checks an ordinary target while an AI room is open", async () => {
    const { store } = createTestUploadDataStore({
      selectedFolderStore: { isAIRoom: true },
    });

    await checkConflicts(store, [ordinaryItem()], 1);

    expect(filesApi.checkIsFileExist).toHaveBeenCalledWith(1, ["Agenda.docx"]);
  });
});

describe("retryUploadFilesImpl", () => {
  it("resets an errored upload row, clears the quota flag and re-primes the pool", async () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({
        uniqueId: "x",
        action: "upload",
        error: "boom",
        isQuotaError: true,
      }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "x", action: "upload", error: "boom" }),
    ];
    store.quotaErrorRaised = true;
    const parallelUploading = vi.fn();
    store.parallelUploading = parallelUploading as never;

    await retryUploadFilesImpl(store, t, "x");

    expect(store.files[0].action).toBe("upload");
    expect(store.files[0].error).toBe("");
    expect(store.files[0].isQuotaError).toBe(false);
    expect(store.quotaErrorRaised).toBe(false);
    expect(parallelUploading).toHaveBeenCalledTimes(1);
  });

  it("delegates a failed conversion retry to convertFile", async () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ uniqueId: "c", action: "convert" })];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "c", action: "convert" }),
    ];
    const convertFile = vi.fn();
    store.convertFile = convertFile as never;

    await retryUploadFilesImpl(store, t, "c");

    expect(convertFile).toHaveBeenCalledTimes(1);
  });
});

describe("retryQuotaFailedFilesImpl", () => {
  it("resets only quota-failed rows and re-primes the pool", async () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ uniqueId: "q", action: "upload", isQuotaError: true }),
      makeUploadFile({ uniqueId: "ok", action: "uploaded" }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "q", action: "upload", isQuotaError: true }),
    ];
    store.quotaErrorRaised = true;
    const parallelUploading = vi.fn();
    store.parallelUploading = parallelUploading as never;

    await retryQuotaFailedFilesImpl(store, t);

    expect(store.files[0].isQuotaError).toBe(false);
    expect(store.files[0].action).toBe("upload");
    expect(store.quotaErrorRaised).toBe(false);
    expect(parallelUploading).toHaveBeenCalledTimes(1);
  });

  it("is a no-op when no file has a quota error", async () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "upload" })];
    const parallelUploading = vi.fn();
    store.parallelUploading = parallelUploading as never;

    await retryQuotaFailedFilesImpl(store, t);

    expect(parallelUploading).not.toHaveBeenCalled();
  });
});

/** Queues files the way an entry point does: by default the open folder is the target. */
const queueFiles = (
  store: UploadDataStore,
  files: File[],
  target: TUploadTarget = store.resolveOpenFolderTarget(),
): TUploadFile[] => {
  const handleUploadConflicts = vi.fn();
  store.handleUploadConflicts = handleUploadConflicts as never;
  startUploadImpl(store, files, target, t);
  return handleUploadConflicts.mock.calls[0][2].allNewFiles;
};

const privateRoomTarget = makeUploadTarget({
  folderId: 50,
  isPrivate: true,
  roomType: RoomsType.CustomRoom,
  encryptionRoomId: 50,
});

describe("startUploadImpl - upload target", () => {
  it("stores the target it was queued with on every item", () => {
    const { store } = createTestUploadDataStore();
    const files = [
      makeBrowserFile("a.docx", 10, { parentFolderId: 50 }),
      makeBrowserFile("b.docx", 10, { parentFolderId: 51 }),
    ];

    const items = queueFiles(store, files, privateRoomTarget);

    expect(items.map((i) => i.target)).toEqual([
      privateRoomTarget,
      privateRoomTarget,
    ]);
    expect(items.map((i) => i.toFolderId)).toEqual([50, 51]);
    expect(items.map((i) => i.encryptionRoomId)).toEqual([50, 50]);
  });

  it("stores the snapshot of the open folder an entry point took", () => {
    const { store } = createTestUploadDataStore({
      selectedFolderStore: {
        id: 60,
        isRoom: false,
        roomType: null,
        navigationPath: [{ id: 50, isRoom: true, private: true }],
      },
      treeFoldersStore: { isPrivacyFolder: true },
    });

    const [item] = queueFiles(store, [
      makeBrowserFile("a.docx", 10, { parentFolderId: 60 }),
    ]);

    expect(item.target).toEqual({
      folderId: 60,
      isPrivate: true,
      roomType: RoomsType.CustomRoom,
      encryptionRoomId: 50,
    });
  });

  it("leaves queued items unchanged when the selected folder changes or is cleared", () => {
    const { store } = createTestUploadDataStore({
      selectedFolderStore: { id: 50, isRoom: true, navigationPath: [] },
      treeFoldersStore: { isPrivacyFolder: true },
    });

    const [item] = queueFiles(store, [
      makeBrowserFile("a.docx", 10, { parentFolderId: 50 }),
    ]);
    const queued = { ...item.target };

    Object.assign(store.selectedFolderStore, {
      id: null,
      isRoom: false,
      navigationPath: [],
    });
    Object.assign(store.treeFoldersStore, { isPrivacyFolder: false });
    expect(store.resolveOpenFolderTarget().isPrivate).toBe(false);

    expect(item.target).toEqual(queued);
    expect(item.target.isPrivate).toBe(true);
    expect(item.encryptionRoomId).toBe(50);
    expect(item.toFolderId).toBe(50);
  });

  it("offers no conversion for a private target", () => {
    const { store } = createTestUploadDataStore({
      filesSettingsStore: { canConvert: vi.fn(() => true) },
    });

    const [privateItem] = queueFiles(
      store,
      [makeBrowserFile("legacy.doc", 10)],
      privateRoomTarget,
    );
    const [plainItem] = queueFiles(
      store,
      [makeBrowserFile("legacy.doc", 10)],
      makeUploadTarget(),
    );

    expect(privateItem.needConvert).toBe(false);
    expect(plainItem.needConvert).toBe(true);
  });

  it("lets a per-file upload context win for privacy and room type", () => {
    const { store } = createTestUploadDataStore();
    const moveSource = { fileId: 7, title: "a.docx" };
    const copyOut = makeBrowserFile("a.docx", 10, {
      parentFolderId: 80,
      uploadContext: {
        roomType: RoomsType.PublicRoom,
        isPrivate: false,
        moveSource,
      },
    });
    const sameRoomCopy = makeBrowserFile("b.docx", 10, {
      parentFolderId: 80,
      uploadContext: { roomType: RoomsType.CustomRoom, isPrivate: true },
    });

    const [outItem, inItem] = queueFiles(
      store,
      [copyOut, sameRoomCopy],
      makeUploadTarget({ folderId: 80, encryptionRoomId: 50 }),
    );

    expect(outItem.target).toEqual({
      folderId: 80,
      isPrivate: false,
      roomType: RoomsType.PublicRoom,
      encryptionRoomId: 50,
    });
    expect(outItem.file.uploadContext?.moveSource).toEqual(moveSource);
    expect(inItem.target).toEqual({
      folderId: 80,
      isPrivate: true,
      roomType: RoomsType.CustomRoom,
      encryptionRoomId: 50,
    });
  });

  it("sends every item of an AI agent's upload to its knowledge folder", () => {
    const { store } = createTestUploadDataStore({
      selectedFolderStore: { id: 70, isRoom: true, isAIRoom: true },
      aiRoomStore: { knowledgeId: 71 },
    });

    const [item] = queueFiles(store, [
      makeBrowserFile("a.docx", 10, { parentFolderId: 70 }),
    ]);

    expect(item.target.folderId).toBe(71);
    expect(item.target.roomType).toBe(RoomsType.AIRoom);
    expect(item.toFolderId).toBe(71);
  });
});
