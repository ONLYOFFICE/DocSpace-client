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

import { beforeEach, describe, expect, it, vi } from "vitest";

import "../../filesStore/__tests__/testHarness";

import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeBrowserFile,
  makeFileInfo,
  makeUploadFile,
} from "./testHarness";

import * as filesApi from "@docspace/shared/api/files";
import { toastr } from "@docspace/ui-kit/components/toast";
import { rememberEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";
import { wipeDek } from "@docspace/shared/services/encryption/file-keys";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import {
  EncryptedReimportError,
  prepareEncryptedUpload,
  recoverDekForReimport,
  sniffDse3Upload,
} from "@docspace/shared/services/private-room/encrypted-upload";
import { OPERATIONS_NAME } from "@docspace/shared/constants";

import { hasFileDek, setFileDek, takeFileDek } from "../helpers";

import type { TFile } from "@docspace/shared/api/files/types";
import type { TTranslation } from "@docspace/shared/types";
import type UploadDataStore from "../../UploadDataStore";

vi.mock("@docspace/shared/services/encryption/file-keys", async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, wipeDek: vi.fn() };
});

vi.mock("@docspace/shared/services/encryption/secret-storage", async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, requireUnlock: vi.fn() };
});

vi.mock(
  "@docspace/shared/services/encryption/room-file-access",
  async (orig) => {
    const actual = (await orig()) as Record<string, unknown>;
    return { ...actual, wrapDekForRecipients: vi.fn() };
  },
);

vi.mock(
  "@docspace/shared/services/private-room/encrypted-upload",
  async (orig) => {
    const actual = (await orig()) as Record<string, unknown>;
    return {
      ...actual,
      prepareEncryptedUpload: vi.fn(),
      sniffDse3Upload: vi.fn(),
      recoverDekForReimport: vi.fn(),
    };
  },
);

const t = ((key: string) => key) as unknown as TTranslation;

const userWithKeys = () => ({
  user: { id: "user-1", isAdmin: false },
  encryptionKeys: [{ id: "key-1", publicKey: "pub-b64" }],
});

const callCheckChunkUpload = (
  store: UploadDataStore,
  args: {
    res: { uploaded: boolean; id: number | string | null; file: TFile | null };
    index: number;
    indexOfFile: number;
    chunksLength: number;
    resolve: (value?: unknown) => void;
  },
) =>
  store.checkChunkUpload({
    t,
    path: [],
    ...args,
  } as unknown as Parameters<UploadDataStore["checkChunkUpload"]>[0]);

const replaceAction = (store: UploadDataStore, key: string) => {
  const fn = vi.fn().mockResolvedValue(undefined);
  (store as unknown as Record<string, unknown>)[key] = fn;
  return fn;
};

const makeDek = (fill = 1) => new Uint8Array([fill, fill + 1, fill + 2]);

declare function allowConsoleError(matcher: RegExp | string): void;

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("uploadDataStore/helpers — module-level DEK store", () => {
  it("stores, reports and takes a DEK exactly once per entry", () => {
    const entry = makeUploadFile();
    const dek = makeDek();

    expect(hasFileDek(entry)).toBe(false);

    setFileDek(entry, dek);
    expect(hasFileDek(entry)).toBe(true);

    expect(takeFileDek(entry)).toBe(dek);
    expect(hasFileDek(entry)).toBe(false);
    expect(takeFileDek(entry)).toBeNull();
    expect(wipeDek).not.toHaveBeenCalled();
  });

  it("wipes the previous DEK when an entry is re-keyed, but not on a same-reference re-set", () => {
    const entry = makeUploadFile();
    const first = makeDek(1);
    const second = makeDek(10);

    setFileDek(entry, first);
    setFileDek(entry, first);
    expect(wipeDek).not.toHaveBeenCalled();

    setFileDek(entry, second);
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[first]]);
    expect(takeFileDek(entry)).toBe(second);
  });

  it("treats null/undefined entries as no-ops", () => {
    expect(() => setFileDek(null, makeDek())).not.toThrow();
    expect(hasFileDek(null)).toBe(false);
    expect(hasFileDek(undefined)).toBe(false);
    expect(takeFileDek(null)).toBeNull();
    expect(takeFileDek(undefined)).toBeNull();
    expect(wipeDek).not.toHaveBeenCalled();
  });
});

describe("UploadDataStore.wrapForSelfThenRoom — DEK hygiene (§3.4.1)", () => {
  it("wraps for self, stores the keys, delegates to room members and wipes the DEK last", async () => {
    const { store } = createTestUploadDataStore();
    const dek = makeDek();
    const identity = { publicKey: "id-pub" };
    const ownWraps = [
      { userId: "user-1", publicKeyId: "key-1", privateKeyEnc: "enc" },
    ];
    vi.mocked(requireUnlock).mockResolvedValue(identity as never);
    vi.mocked(wrapDekForRecipients).mockResolvedValue(ownWraps as never);
    vi.mocked(filesApi.setFileEncryptionKeys).mockResolvedValue(
      undefined as never,
    );
    const encryptForRoom = replaceAction(store, "encryptKeysForRoomMembers");

    await store.wrapForSelfThenRoom(555, "user-1", "pub-b64", "key-1", dek, 7);

    expect(vi.mocked(wrapDekForRecipients).mock.calls).toEqual([
      [
        {
          dek,
          senderIdentity: identity,
          senderUserId: "user-1",
          recipients: [
            { userId: "user-1", publicKey: "pub-b64", publicKeyId: "key-1" },
          ],
          fileId: 555,
        },
      ],
    ]);
    expect(vi.mocked(filesApi.setFileEncryptionKeys).mock.calls).toEqual([
      [555, ownWraps],
    ]);
    expect(encryptForRoom.mock.calls).toEqual([
      [555, "user-1", 7, dek, identity],
    ]);

    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
    expect(vi.mocked(wipeDek).mock.invocationCallOrder[0]).toBeGreaterThan(
      vi.mocked(filesApi.setFileEncryptionKeys).mock.invocationCallOrder[0],
    );
  });

  it("wipes the DEK even when the identity is locked", async () => {
    const { store } = createTestUploadDataStore();
    const dek = makeDek();
    vi.mocked(requireUnlock).mockResolvedValue(null as never);

    await expect(
      store.wrapForSelfThenRoom(555, "user-1", "pub-b64", "key-1", dek, null),
    ).rejects.toThrow("Encryption identity is locked");

    expect(filesApi.setFileEncryptionKeys).not.toHaveBeenCalled();
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
  });

  it("wipes the DEK when wrapping itself fails", async () => {
    const { store } = createTestUploadDataStore();
    const dek = makeDek();
    vi.mocked(requireUnlock).mockResolvedValue(
      { publicKey: "id-pub" } as never,
    );
    vi.mocked(wrapDekForRecipients).mockRejectedValue(
      new Error("wrap failed"),
    );

    await expect(
      store.wrapForSelfThenRoom(555, "user-1", "pub-b64", "key-1", dek, null),
    ).rejects.toThrow("wrap failed");

    expect(filesApi.setFileEncryptionKeys).not.toHaveBeenCalled();
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
  });
});

describe("UploadDataStore.checkChunkUpload — encrypted final chunk", () => {
  const setupEncryptedFinalChunk = (
    overrides: Parameters<typeof createTestUploadDataStore>[0] = {},
  ) => {
    const harness = createTestUploadDataStore(overrides);
    const { store } = harness;
    const entry = makeUploadFile({
      uniqueId: "enc-done",
      encrypted: true,
      inAction: true,
      toFolderId: 7,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry, percent: 50 }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    replaceAction(store, "refreshFiles");
    const dek = makeDek();
    setFileDek(store.files[0], dek);
    const serverFile = makeFileInfo({ id: 555, folderId: 7, version: 1 });
    return { ...harness, entry, dek, serverFile };
  };

  it("remembers the plaintext filename and hands the DEK to wrapForSelfThenRoom exactly once", () => {
    const { store, entry, dek, serverFile } = setupEncryptedFinalChunk({
      userStore: userWithKeys(),
    });
    const wrap = replaceAction(store, "wrapForSelfThenRoom");

    callCheckChunkUpload(store, {
      res: { uploaded: true, id: 555, file: serverFile },
      index: 1,
      indexOfFile: 0,
      chunksLength: 1,
      resolve: vi.fn(),
    });

    expect(vi.mocked(rememberEncryptedFilename).mock.calls).toEqual([
      [555, entry.file.name],
    ]);

    expect(wrap.mock.calls).toEqual([
      [555, "user-1", "pub-b64", "key-1", dek, null],
    ]);
    expect(hasFileDek(store.files[0])).toBe(false);
    expect(wipeDek).not.toHaveBeenCalled();
  });

  it("wipes the orphan DEK and skips wrapping when the user has no encryption keys", () => {
    allowConsoleError("[ENCRYPTION] Cannot wrap DEK");
    const { store, entry, dek, serverFile } = setupEncryptedFinalChunk();
    const wrap = replaceAction(store, "wrapForSelfThenRoom");

    callCheckChunkUpload(store, {
      res: { uploaded: true, id: 555, file: serverFile },
      index: 1,
      indexOfFile: 0,
      chunksLength: 1,
      resolve: vi.fn(),
    });

    expect(vi.mocked(rememberEncryptedFilename).mock.calls).toEqual([
      [555, entry.file.name],
    ]);

    expect(wrap).not.toHaveBeenCalled();
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
    expect(hasFileDek(store.files[0])).toBe(false);
  });

  it("marks the file and its history entry when wrapping rejects after upload", async () => {
    allowConsoleError("[ENCRYPTION] Failed to set file encryption keys");
    const { store, serverFile } = setupEncryptedFinalChunk({
      userStore: userWithKeys(),
    });
    const wrap = replaceAction(store, "wrapForSelfThenRoom");
    wrap.mockRejectedValue({
      response: { status: 500 },
      message: "wrap exploded",
    });

    callCheckChunkUpload(store, {
      res: { uploaded: true, id: 555, file: serverFile },
      index: 1,
      indexOfFile: 0,
      chunksLength: 1,
      resolve: vi.fn(),
    });

    await vi.waitFor(() =>
      expect(store.files[0].error).toBe("Common:EncryptionUploadWrapFailed"),
    );
    expect(store.files[0].action).toBe("uploaded");
    expect(store.files[0].fileId).toBe(555);
    expect(store.uploadedFilesHistory[0].error).toBe(
      "Common:EncryptionUploadWrapFailed",
    );
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionUploadWrapFailed",
    );
  });
});

describe("UploadDataStore.startSessionFunc — encrypted upload preparation", () => {
  const setupEncryptedPendingFile = () => {
    const harness = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: userWithKeys(),
    });
    const { store } = harness;
    const entry = makeUploadFile({
      uniqueId: "enc-pending",
      file: makeBrowserFile("secret.docx", 3000),
      toFolderId: 7,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    return { ...harness, entry };
  };

  const preparedUpload = (dek: Uint8Array) => ({
    data: new Blob([new Uint8Array(3100)]),
    encrypted: true,
    dek,
    uploadFileName: "0b5c72a8-0000-4000-8000-000000000000.docx",
    originalFileType: "application/octet-stream",
    originalFileSize: 3000,
    originalFileName: "secret.docx",
  });

  it("stores the DEK, marks the entry encrypted and starts the session with the obfuscated name", async () => {
    const { store, fakes } = setupEncryptedPendingFile();
    const dek = makeDek();
    vi.mocked(prepareEncryptedUpload).mockImplementation(async (config) => {
      config.onProgress?.(0.5);
      return preparedUpload(dek) as never;
    });
    vi.mocked(filesApi.startUploadSession).mockReturnValue(
      new Promise(() => {}) as never,
    );

    store.startSessionFunc(0, t);
    await vi.waitFor(() =>
      expect(filesApi.startUploadSession).toHaveBeenCalledTimes(1),
    );

    expect(hasFileDek(store.files[0])).toBe(true);
    expect(store.files[0].encrypted).toBe(true);

    expect(store.uploadedFilesHistory[0].percent).toBe(10);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      percent: 10,
      label: "Files:Encrypting",
    });

    const sessionArgs = vi.mocked(filesApi.startUploadSession).mock.calls[0];
    expect(sessionArgs[0]).toBe(7);
    expect(sessionArgs[1]).toBe("0b5c72a8-0000-4000-8000-000000000000.docx");
    expect(sessionArgs[2]).toBe(3100);
    expect(sessionArgs[4]).toBe(true);
    expect(wipeDek).not.toHaveBeenCalled();
  });

  it("wipes the orphan DEK when the upload session fails after encryption", async () => {
    const { store } = setupEncryptedPendingFile();
    const dek = makeDek();
    vi.mocked(prepareEncryptedUpload).mockResolvedValue(
      preparedUpload(dek) as never,
    );
    vi.mocked(filesApi.startUploadSession).mockRejectedValue(
      new Error("session down"),
    );
    replaceAction(store, "finishUploadFiles");

    await store.startSessionFunc(0, t);

    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
    expect(hasFileDek(store.files[0])).toBe(false);
    expect(store.files[0].error).toBe("session down");
    expect(store.currentUploadNumber).toBe(0);
  });

  it("fails the file and frees the slot when the encryption preparation itself rejects", async () => {
    allowConsoleError("[ENCRYPTION] prepareFileForEncryptedUpload failed");
    const { store, fakes } = setupEncryptedPendingFile();
    vi.mocked(prepareEncryptedUpload).mockRejectedValue(
      new Error("encryptFile blew up"),
    );
    const finishUploadFiles = replaceAction(store, "finishUploadFiles");

    await store.startSessionFunc(0, t);

    expect(wipeDek).not.toHaveBeenCalled();
    expect(hasFileDek(store.files[0])).toBe(false);

    expect(store.files[0].error).toBe("Common:EncryptionPrepareFailed");
    expect(store.files[0].percent).toBe(0);
    expect(store.uploadedFilesHistory[0].error).toBe(
      "Common:EncryptionPrepareFailed",
    );
    expect(toastr.error).not.toHaveBeenCalled();
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenLastCalledWith({
      operation: OPERATIONS_NAME.upload,
      percent: 0,
      alert: true,
    });

    expect(store.currentUploadNumber).toBe(0);
    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
    expect(store.finishUploadFilesCalled).toBe(true);
    expect(finishUploadFiles.mock.calls).toEqual([[t, false]]);
  });
});

describe("UploadDataStore.startSessionFunc — encrypted re-import (bug 83549)", () => {
  const RAW_NAME = "9f8b7c6d-1a2b-4c3d-8e4f-556677889900.docx";
  const dse3Header = {
    encryptedName: new Uint8Array([1, 2, 3]),
    fileNonce: new Uint8Array(16),
  };
  const identity = { publicKey: "id-pub" };

  const setupReimportPendingFile = () => {
    const harness = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: userWithKeys(),
    });
    const { store } = harness;
    const entry = makeUploadFile({
      uniqueId: "reimport-pending",
      file: makeBrowserFile(RAW_NAME, 2048),
      toFolderId: 7,
      encryptionRoomId: 55,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    return { ...harness, entry };
  };

  it("uploads the DSE3 blob unchanged with the recovered DEK instead of re-encrypting", async () => {
    const { store, entry } = setupReimportPendingFile();
    const dek = makeDek();
    vi.mocked(sniffDse3Upload).mockResolvedValue(dse3Header as never);
    vi.mocked(requireUnlock).mockResolvedValue(identity as never);
    vi.mocked(recoverDekForReimport).mockResolvedValue({
      dek,
      realName: "secret.docx",
      sourceFileId: 42,
    } as never);
    vi.mocked(filesApi.startUploadSession).mockReturnValue(
      new Promise(() => {}) as never,
    );

    store.startSessionFunc(0, t);
    await vi.waitFor(() =>
      expect(filesApi.startUploadSession).toHaveBeenCalledTimes(1),
    );

    expect(prepareEncryptedUpload).not.toHaveBeenCalled();
    expect(vi.mocked(recoverDekForReimport).mock.calls).toEqual([
      [
        {
          file: entry.file,
          header: dse3Header,
          roomId: 55,
          userId: "user-1",
          identity,
        },
      ],
    ]);

    expect(hasFileDek(store.files[0])).toBe(true);
    expect(takeFileDek(store.files[0])).toBe(dek);
    expect(store.files[0].encrypted).toBe(true);
    expect(store.files[0].reimportRealName).toBe("secret.docx");

    const sessionArgs = vi.mocked(filesApi.startUploadSession).mock.calls[0];
    expect(sessionArgs[0]).toBe(7);
    expect(sessionArgs[1]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.docx$/,
    );
    expect(sessionArgs[1]).not.toBe(RAW_NAME);
    expect(sessionArgs[2]).toBe(2048);
    expect(sessionArgs[4]).toBe(true);
  });

  it("fails the file with the re-import message when no DEK can be recovered", async () => {
    allowConsoleError("[ENCRYPTION] prepareFileForEncryptedUpload failed");
    const { store } = setupReimportPendingFile();
    vi.mocked(sniffDse3Upload).mockResolvedValue(dse3Header as never);
    vi.mocked(requireUnlock).mockResolvedValue(identity as never);
    vi.mocked(recoverDekForReimport).mockRejectedValue(
      new EncryptedReimportError("no source file"),
    );
    const finishUploadFiles = replaceAction(store, "finishUploadFiles");

    await store.startSessionFunc(0, t);

    expect(hasFileDek(store.files[0])).toBe(false);
    expect(store.files[0].error).toBe("Common:EncryptionReimportFailed");
    expect(store.uploadedFilesHistory[0].error).toBe(
      "Common:EncryptionReimportFailed",
    );
    expect(toastr.error).not.toHaveBeenCalled();
    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
    expect(store.currentUploadNumber).toBe(0);
    expect(finishUploadFiles).toHaveBeenCalled();
  });

  it("fails with the re-import message when the identity stays locked", async () => {
    allowConsoleError("[ENCRYPTION] prepareFileForEncryptedUpload failed");
    const { store } = setupReimportPendingFile();
    vi.mocked(sniffDse3Upload).mockResolvedValue(dse3Header as never);
    vi.mocked(requireUnlock).mockResolvedValue(null as never);
    replaceAction(store, "finishUploadFiles");

    await store.startSessionFunc(0, t);

    expect(recoverDekForReimport).not.toHaveBeenCalled();
    expect(store.files[0].error).toBe("Common:EncryptionReimportFailed");
    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
  });
});

describe("UploadDataStore.checkChunkUpload — re-imported file display name", () => {
  it("caches the recovered real name instead of the opaque browser file name", () => {
    const harness = createTestUploadDataStore({ userStore: userWithKeys() });
    const { store } = harness;
    const entry = makeUploadFile({
      uniqueId: "reimport-done",
      encrypted: true,
      inAction: true,
      toFolderId: 7,
      reimportRealName: "secret.docx",
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry, percent: 50 }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    replaceAction(store, "refreshFiles");
    replaceAction(store, "wrapForSelfThenRoom");
    setFileDek(store.files[0], makeDek());

    callCheckChunkUpload(store, {
      res: {
        uploaded: true,
        id: 555,
        file: makeFileInfo({ id: 555, folderId: 7 }),
      },
      index: 1,
      indexOfFile: 0,
      chunksLength: 1,
      resolve: vi.fn(),
    });

    expect(vi.mocked(rememberEncryptedFilename).mock.calls).toEqual([
      [555, "secret.docx"],
    ]);
  });
});

describe("UploadDataStore — encrypted batch gates (Phase 5 net)", () => {
  it("ensureEncryptionUnlockedForBatch is a pass-through without keys or encryptable files", async () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile()];
    await expect(store.ensureEncryptionUnlockedForBatch()).resolves.toBe(true);
    expect(requireUnlock).not.toHaveBeenCalled();
  });

  it("ensureEncryptionUnlockedForBatch requires an unlocked identity when a pending file will encrypt", async () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: userWithKeys(),
    });
    store.files = [makeUploadFile()];

    vi.mocked(requireUnlock).mockResolvedValue({ pub: "x" } as never);
    await expect(store.ensureEncryptionUnlockedForBatch()).resolves.toBe(true);
    expect(vi.mocked(requireUnlock).mock.calls).toEqual([["user-1"]]);

    vi.mocked(requireUnlock).mockResolvedValue(null as never);
    await expect(store.ensureEncryptionUnlockedForBatch()).resolves.toBe(
      false,
    );
  });

  it("cancelEncryptedBatchUpload cancels only the not-yet-started encryptable files and prunes their history", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: userWithKeys(),
    });
    const pendingEncryptable = makeUploadFile({ uniqueId: "enc-a" });
    const alreadyRunning = makeUploadFile({
      uniqueId: "run-b",
      inAction: true,
    });
    const alreadyEncrypted = makeUploadFile({
      uniqueId: "pre-c",
      encrypted: true,
    });
    store.files = [pendingEncryptable, alreadyRunning, alreadyEncrypted];
    store.uploadedFilesHistory = [
      { ...pendingEncryptable },
      { ...alreadyRunning },
      { ...alreadyEncrypted },
    ];

    store.cancelEncryptedBatchUpload();

    expect(store.files.map((f) => !!f.cancel)).toEqual([true, false, false]);
    expect(store.files[0].action).toBe("uploaded");
    expect(store.files[0].percent).toBe(100);
    expect(store.uploadedFilesHistory.map((f) => f.uniqueId)).toEqual([
      "run-b",
      "pre-c",
    ]);
    expect(toastr.info).toHaveBeenCalledWith(
      "Common:EncryptionUploadCancelled",
    );
  });
});
