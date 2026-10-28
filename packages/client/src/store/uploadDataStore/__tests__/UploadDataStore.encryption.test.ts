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
  makePrivateUploadTarget,
  makeUploadFile,
} from "./testHarness";

import * as filesApi from "@docspace/shared/api/files";
import { getRoomEncryptionKeys } from "@docspace/shared/api/privacy";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { rememberEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";
import { wipeDek } from "@docspace/shared/services/encryption/file-keys";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import { requestDeviceSetupHint } from "@docspace/shared/services/encryption/device-setup-hint-notifier";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { verifyMemberKeys } from "@docspace/shared/services/private-room/member-key-verification";
import { pendingAccessStore } from "@docspace/shared/services/private-room/pending-access";
import { tagFileForCopy } from "@docspace/shared/services/private-room/encrypted-copy";
import {
  EncryptedReimportError,
  makeOpaqueUploadName,
  prepareEncryptedUpload,
  recoverDekForReimport,
  sniffDse3Upload,
} from "@docspace/shared/services/private-room/encrypted-upload";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { RoomsType } from "@docspace/shared/enums";

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
  "@docspace/shared/services/encryption/device-setup-hint-notifier",
  async (orig) => {
    const actual = (await orig()) as Record<string, unknown>;
    return { ...actual, requestDeviceSetupHint: vi.fn() };
  },
);

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

vi.mock(
  "@docspace/shared/services/private-room/member-key-verification",
  async (orig) => {
    const actual = (await orig()) as Record<string, unknown>;
    return {
      ...actual,
      verifyMemberKeys: vi.fn(async (recipients: unknown[]) => ({
        verified: recipients,
        skipped: [],
      })),
    };
  },
);

const t = ((key: string) => key) as unknown as TTranslation;

const userWithKeys = () => ({
  user: { id: "user-1", isAdmin: false },
  encryptionKeys: [{ id: "key-1", publicKey: "pub-b64" }],
});

const replaceAction = (store: UploadDataStore, key: string) => {
  const fn = vi.fn().mockResolvedValue(undefined);
  (store as unknown as Record<string, unknown>)[key] = fn;
  return fn;
};

const makeDek = (fill = 1) => new Uint8Array([fill, fill + 1, fill + 2]);

const memberKey = (userId: string, publicKey: string) => ({
  id: `${userId}-key`,
  userId,
  publicKey,
  privateKeyEnc: "",
  date: "2026-01-01T00:00:00",
});

declare function allowConsoleError(matcher: RegExp | string): void;

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

const IDENTITY = { publicKey: "id-pub" };

/** Lets an encrypted upload through: session, parts and a finalize that answers the stored file. */
const serveEncryptedUpload = (fileId = 555, folderId: number = 7) => {
  vi.mocked(filesApi.startUploadSession).mockResolvedValue({
    id: "session-1",
    path: [2, folderId],
  } as never);
  vi.mocked(filesApi.uploadChunkParallel).mockResolvedValue({} as never);
  vi.mocked(filesApi.finalizeUploadSession).mockResolvedValue({
    id: fileId,
    uploaded: true,
    file: makeFileInfo({ id: fileId, folderId, version: 1 }),
  } as never);
  vi.mocked(filesApi.getFileEncryptionAccess).mockResolvedValue({
    fileKeys: [],
  } as never);
  vi.mocked(filesApi.setFileEncryptionKeys).mockResolvedValue(
    undefined as never,
  );
  vi.mocked(getRoomEncryptionKeys).mockResolvedValue([] as never);
  vi.mocked(wrapDekForRecipients).mockImplementation(
    async ({ recipients }) =>
      recipients.map((r) => ({
        userId: r.userId,
        publicKeyId: r.publicKeyId ?? "",
        privateKeyEnc: `wrap-${r.userId}`,
      })) as never,
  );
};

describe("UploadDataStore.startSessionFunc — encrypted upload through the shared pipeline", () => {
  const setupEncryptedPendingFile = () => {
    const harness = createTestUploadDataStore({ userStore: userWithKeys() });
    const { store } = harness;
    const entry = makeUploadFile({
      uniqueId: "enc-pending",
      file: makeBrowserFile("secret.docx", 3000),
      toFolderId: 7,
      encryptionRoomId: 7,
      target: makePrivateUploadTarget({ folderId: 7 }),
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    replaceAction(store, "refreshFiles");
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

  beforeEach(() => {
    vi.mocked(requireUnlock).mockResolvedValue(IDENTITY as never);
    vi.mocked(sniffDse3Upload).mockResolvedValue(null);
  });

  it("marks the entry encrypted, shows the encryption progress and starts the session with the obfuscated name", async () => {
    const { store, fakes } = setupEncryptedPendingFile();
    vi.mocked(prepareEncryptedUpload).mockImplementation(async (config) => {
      config.onProgress?.(0.5);
      return preparedUpload(makeDek()) as never;
    });
    vi.mocked(filesApi.startUploadSession).mockReturnValue(
      new Promise(() => {}) as never,
    );

    store.startSessionFunc(0, t);
    await vi.waitFor(() =>
      expect(filesApi.startUploadSession).toHaveBeenCalledTimes(1),
    );

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

  it("stores the file, remembers its plaintext name, wraps it for the uploader and wipes the DEK", async () => {
    const { store } = setupEncryptedPendingFile();
    const dek = makeDek();
    vi.mocked(prepareEncryptedUpload).mockResolvedValue(
      preparedUpload(dek) as never,
    );
    serveEncryptedUpload();

    await store.startSessionFunc(0, t);

    expect(store.files[0]).toMatchObject({
      action: "uploaded",
      fileId: 555,
      encrypted: true,
    });
    expect(store.files[0].error).toBeFalsy();
    expect(vi.mocked(rememberEncryptedFilename).mock.calls).toEqual([
      [555, "secret.docx"],
    ]);
    expect(vi.mocked(filesApi.setFileEncryptionKeys).mock.calls[0]).toEqual([
      555,
      [{ userId: "user-1", publicKeyId: "key-1", privateKeyEnc: "wrap-user-1" }],
    ]);
    expect(filesApi.uploadChunkParallel).toHaveBeenCalled();
    expect(filesApi.finalizeUploadSession).toHaveBeenCalledTimes(1);
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
    expect(store.currentUploadNumber).toBe(0);
  });

  it("Member key mismatch on upload: the skipped members land on the file and its history entry", async () => {
    const { store } = setupEncryptedPendingFile();
    vi.mocked(prepareEncryptedUpload).mockResolvedValue(
      preparedUpload(makeDek()) as never,
    );
    serveEncryptedUpload();
    vi.mocked(getRoomEncryptionKeys).mockResolvedValue([
      memberKey("bob", "pk-bob"),
    ] as never);
    const skipped = [
      { userId: "bob", displayName: undefined, reason: "key-mismatch-refused" as const },
    ];
    vi.mocked(verifyMemberKeys).mockResolvedValueOnce({
      verified: [],
      skipped,
    } as never);
    const named = [{ ...skipped[0], displayName: "Bob" }];
    const report = replaceAction(store, "reportSkippedMembers");
    report.mockResolvedValue(named);

    await store.startSessionFunc(0, t);

    expect(report).toHaveBeenCalledWith(skipped);
    expect(store.files[0].skippedMembers).toEqual(named);
    expect(store.uploadedFilesHistory[0].skippedMembers).toEqual(named);
    expect(store.files[0].error).toBeFalsy();
  });

  it("Key trusted after a refusal: the uploaded file is recorded as missing for the member whose key was refused", async () => {
    const { store } = setupEncryptedPendingFile();
    vi.mocked(prepareEncryptedUpload).mockResolvedValue(
      preparedUpload(makeDek()) as never,
    );
    serveEncryptedUpload(555);
    vi.mocked(getRoomEncryptionKeys).mockResolvedValue([
      memberKey("bob", "pk-bob"),
    ] as never);
    vi.mocked(verifyMemberKeys).mockResolvedValueOnce({
      verified: [],
      skipped: [{ userId: "bob", reason: "key-mismatch-refused" }],
    } as never);
    replaceAction(store, "reportSkippedMembers");

    await store.startSessionFunc(0, t);

    expect(pendingAccessStore.get(7, "bob")?.missingFileIds).toEqual([555]);
    pendingAccessStore.clear(7, "bob");
  });

  it("marks the file and its history entry when wrapping rejects after upload", async () => {
    const { store } = setupEncryptedPendingFile();
    vi.mocked(prepareEncryptedUpload).mockResolvedValue(
      preparedUpload(makeDek()) as never,
    );
    serveEncryptedUpload();
    vi.mocked(filesApi.setFileEncryptionKeys).mockRejectedValueOnce({
      response: { status: 500 },
      message: "wrap exploded",
    });

    await store.startSessionFunc(0, t);

    expect(store.files[0].error).toBe("Common:EncryptionUploadWrapFailed");
    expect(store.files[0].action).toBe("uploaded");
    expect(store.files[0].fileId).toBe(555);
    expect(store.uploadedFilesHistory[0].error).toBe(
      "Common:EncryptionUploadWrapFailed",
    );
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionUploadWrapFailed",
    );
  });

  it("wipes the DEK when the upload session fails after encryption", async () => {
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
    expect(store.files[0].error).toBe("session down");
    expect(store.currentUploadNumber).toBe(0);
  });

  it("fails the file and frees the slot when the encryption preparation itself rejects", async () => {
    allowConsoleError("[ENCRYPTION] encrypted upload preparation failed");
    const { store, fakes } = setupEncryptedPendingFile();
    vi.mocked(prepareEncryptedUpload).mockRejectedValue(
      new Error("encryptFile blew up"),
    );
    const finishUploadFiles = replaceAction(store, "finishUploadFiles");

    await store.startSessionFunc(0, t);

    expect(wipeDek).not.toHaveBeenCalled();
    expect(store.files[0].error).toBe("Common:EncryptionPrepareFailed");
    expect(store.files[0].percent).toBe(0);
    expect(store.files[0].encrypted).toBe(false);
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

describe("UploadDataStore.startSessionFunc — uploader without a key", () => {
  const setupKeylessPendingFile = () => {
    const harness = createTestUploadDataStore({
      userStore: { user: { id: "user-1", isAdmin: false }, encryptionKeys: [] },
    });
    const { store } = harness;
    const entry = makeUploadFile({
      uniqueId: "keyless-pending",
      file: makeBrowserFile("secret.docx", 3000),
      toFolderId: 7,
      target: makePrivateUploadTarget({ folderId: 7 }),
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    return { ...harness, entry };
  };

  it("refuses a key-less upload: no session, no encryption, localized reason, hint requested", async () => {
    const { store, fakes } = setupKeylessPendingFile();
    const finishUploadFiles = replaceAction(store, "finishUploadFiles");

    await store.startSessionFunc(0, t);

    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
    expect(prepareEncryptedUpload).not.toHaveBeenCalled();
    expect(sniffDse3Upload).not.toHaveBeenCalled();
    expect(store.files[0].error).toBe("Common:EncryptionKeysRequiredForUpload");
    expect(store.files[0].percent).toBe(0);
    expect(store.uploadedFilesHistory[0].error).toBe(
      "Common:EncryptionKeysRequiredForUpload",
    );
    expect(requestDeviceSetupHint).toHaveBeenCalledTimes(1);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenLastCalledWith({
      operation: OPERATIONS_NAME.upload,
      percent: 0,
      alert: true,
    });
    expect(store.currentUploadNumber).toBe(0);
    expect(store.finishUploadFilesCalled).toBe(true);
    expect(finishUploadFiles.mock.calls).toEqual([[t, false]]);
  });

  it("still uploads plaintext outside private rooms without keys", async () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: false },
      userStore: { user: { id: "user-1", isAdmin: false }, encryptionKeys: [] },
    });
    const entry = makeUploadFile({
      uniqueId: "plain-pending",
      file: makeBrowserFile("notes.txt", 10),
      toFolderId: 9,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    vi.mocked(filesApi.startUploadSession).mockReturnValue(
      new Promise(() => {}) as never,
    );

    store.startSessionFunc(0, t);
    await vi.waitFor(() =>
      expect(filesApi.startUploadSession).toHaveBeenCalledTimes(1),
    );

    expect(store.files[0].error).toBeNull();
    expect(requestDeviceSetupHint).not.toHaveBeenCalled();
  });
});

describe("UploadDataStore.startSessionFunc — encrypted re-import (bug 83549)", () => {
  const RAW_NAME = "9f8b7c6d-1a2b-4c3d-8e4f-556677889900.docx";
  const dse3Header = {
    encryptedName: new Uint8Array([1, 2, 3]),
    fileNonce: new Uint8Array(16),
  };

  const setupReimportPendingFile = () => {
    const harness = createTestUploadDataStore({ userStore: userWithKeys() });
    const { store } = harness;
    const entry = makeUploadFile({
      uniqueId: "reimport-pending",
      file: makeBrowserFile(RAW_NAME, 2048),
      toFolderId: 7,
      encryptionRoomId: 55,
      target: makePrivateUploadTarget({ folderId: 7, encryptionRoomId: 55 }),
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    replaceAction(store, "refreshFiles");
    return { ...harness, entry };
  };

  it("uploads the DSE3 blob unchanged with the recovered DEK instead of re-encrypting", async () => {
    const { store, entry } = setupReimportPendingFile();
    vi.mocked(sniffDse3Upload).mockResolvedValue(dse3Header as never);
    vi.mocked(requireUnlock).mockResolvedValue(IDENTITY as never);
    vi.mocked(recoverDekForReimport).mockResolvedValue({
      dek: makeDek(),
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
          identity: IDENTITY,
        },
      ],
    ]);
    expect(store.files[0].encrypted).toBe(true);

    const sessionArgs = vi.mocked(filesApi.startUploadSession).mock.calls[0];
    expect(sessionArgs[0]).toBe(7);
    expect(sessionArgs[1]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.docx$/,
    );
    expect(sessionArgs[1]).not.toBe(RAW_NAME);
    expect(sessionArgs[2]).toBe(2048);
    expect(sessionArgs[4]).toBe(true);
  });

  it("caches the recovered real name instead of the opaque browser file name", async () => {
    const { store } = setupReimportPendingFile();
    vi.mocked(sniffDse3Upload).mockResolvedValue(dse3Header as never);
    vi.mocked(requireUnlock).mockResolvedValue(IDENTITY as never);
    vi.mocked(recoverDekForReimport).mockResolvedValue({
      dek: makeDek(),
      realName: "secret.docx",
      sourceFileId: 42,
    } as never);
    serveEncryptedUpload();

    await store.startSessionFunc(0, t);

    expect(store.files[0].action).toBe("uploaded");
    expect(vi.mocked(rememberEncryptedFilename).mock.calls).toEqual([
      [555, "secret.docx"],
    ]);
  });

  it("fails the file with the re-import message when no DEK can be recovered", async () => {
    allowConsoleError("[ENCRYPTION] encrypted upload preparation failed");
    const { store } = setupReimportPendingFile();
    vi.mocked(sniffDse3Upload).mockResolvedValue(dse3Header as never);
    vi.mocked(requireUnlock).mockResolvedValue(IDENTITY as never);
    vi.mocked(recoverDekForReimport).mockRejectedValue(
      new EncryptedReimportError("no source file"),
    );
    const finishUploadFiles = replaceAction(store, "finishUploadFiles");

    await store.startSessionFunc(0, t);

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

describe("UploadDataStore — encrypted batch gates (Phase 5 net)", () => {
  it("ensureEncryptionUnlockedForBatch is a pass-through without keys or encryptable files", async () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile()];
    await expect(store.ensureEncryptionUnlockedForBatch()).resolves.toBe(true);
    expect(requireUnlock).not.toHaveBeenCalled();
  });

  it("ensureEncryptionUnlockedForBatch requires an unlocked identity when a pending file will encrypt", async () => {
    const { store } = createTestUploadDataStore({ userStore: userWithKeys() });
    store.files = [makeUploadFile({ target: makePrivateUploadTarget() })];

    vi.mocked(requireUnlock).mockResolvedValue({ pub: "x" } as never);
    await expect(store.ensureEncryptionUnlockedForBatch()).resolves.toBe(true);
    expect(vi.mocked(requireUnlock).mock.calls).toEqual([["user-1"]]);

    vi.mocked(requireUnlock).mockResolvedValue(null as never);
    await expect(store.ensureEncryptionUnlockedForBatch()).resolves.toBe(
      false,
    );
  });

  it("uploader declines to unlock: cancelEncryptedBatchUpload fails only the not-yet-started encryptable files with the locked reason", () => {
    const { store } = createTestUploadDataStore({ userStore: userWithKeys() });
    const target = makePrivateUploadTarget();
    const pendingEncryptable = makeUploadFile({ uniqueId: "enc-a", target });
    const alreadyRunning = makeUploadFile({
      uniqueId: "run-b",
      inAction: true,
      target,
    });
    const alreadyEncrypted = makeUploadFile({
      uniqueId: "pre-c",
      encrypted: true,
      target,
    });
    store.files = [pendingEncryptable, alreadyRunning, alreadyEncrypted];
    store.uploadedFilesHistory = [
      { ...pendingEncryptable },
      { ...alreadyRunning },
      { ...alreadyEncrypted },
    ];

    store.cancelEncryptedBatchUpload();

    expect(store.files.map((f) => !!f.cancel)).toEqual([false, false, false]);
    expect(store.files[0].error).toBe("Common:EncryptionLockedUpload");
    expect(store.files[0].inAction).toBe(true);
    expect(store.files[0].percent).toBe(0);
    expect(store.files[1].error).toBeNull();
    expect(store.files[2].error).toBeNull();
    expect(store.uploadedFilesHistory.map((f) => f.uniqueId)).toEqual([
      "enc-a",
      "run-b",
      "pre-c",
    ]);
    expect(store.uploadedFilesHistory[0].error).toBe(
      "Common:EncryptionLockedUpload",
    );
    expect(toastr.info).toHaveBeenCalledWith(
      "Common:EncryptionUploadCancelled",
    );
  });
});

describe("UploadDataStore — upload target fixed when the user starts the upload", () => {
  const OPAQUE_NAME =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.docx$/;
  const PRIVATE_ROOM_ID = 50;
  const PLAIN_FOLDER_ID = 9;

  const privateRoomOpen = {
    selectedFolderStore: {
      id: PRIVATE_ROOM_ID,
      isRoom: true,
      roomType: RoomsType.CustomRoom,
      navigationPath: [],
    },
    treeFoldersStore: { isPrivacyFolder: true },
  };

  const plainFolderOpen = {
    selectedFolderStore: {
      id: PLAIN_FOLDER_ID,
      isRoom: false,
      roomType: null,
      navigationPath: [],
    },
    treeFoldersStore: { isPrivacyFolder: false },
  };

  const openFolder = (
    store: UploadDataStore,
    folder: {
      selectedFolderStore: Record<string, unknown>;
      treeFoldersStore: Record<string, unknown>;
    },
  ) => {
    Object.assign(store.selectedFolderStore, folder.selectedFolderStore);
    Object.assign(store.treeFoldersStore, folder.treeFoldersStore);
  };

  const openRoomsList = (store: UploadDataStore) =>
    openFolder(store, {
      selectedFolderStore: {
        id: 2,
        isRoom: false,
        roomType: null,
        navigationPath: [],
      },
      treeFoldersStore: { isPrivacyFolder: false },
    });

  const clearSelectedFolder = (store: UploadDataStore) =>
    openFolder(store, {
      selectedFolderStore: {
        id: null,
        isRoom: false,
        roomType: null,
        navigationPath: [],
      },
      treeFoldersStore: { isPrivacyFolder: false },
    });

  /** Queues files the way an entry point does: the open folder is the target. */
  const queueIntoOpenFolder = (store: UploadDataStore, count: number) => {
    const handleUploadConflicts = vi.fn();
    store.handleUploadConflicts = handleUploadConflicts as never;
    const parentFolderId = store.selectedFolderStore.id;
    const files = Array.from({ length: count }, (_, i) =>
      makeBrowserFile(`report-${i}.docx`, 100, { parentFolderId }),
    );
    store.startUpload(files, store.resolveOpenFolderTarget(), t);
    return handleUploadConflicts.mock.calls[0][2];
  };

  const encryptEveryFile = () =>
    vi.mocked(prepareEncryptedUpload).mockImplementation(
      async (config) =>
        ({
          data: new Blob([new Uint8Array(config.file.size + 100)]),
          encrypted: true,
          dek: makeDek(),
          uploadFileName: makeOpaqueUploadName(config.file.name),
          originalFileType: "application/octet-stream",
          originalFileSize: config.file.size,
          originalFileName: config.file.name,
        }) as never,
    );

  const sessionCalls = () => vi.mocked(filesApi.startUploadSession).mock.calls;

  beforeEach(() => {
    vi.mocked(sniffDse3Upload).mockResolvedValue(null);
    vi.mocked(filesApi.startUploadSession).mockReturnValue(
      new Promise(() => {}) as never,
    );
  });

  it("Room left while files are queued", async () => {
    const { store } = createTestUploadDataStore({
      ...privateRoomOpen,
      userStore: userWithKeys(),
    });
    vi.mocked(requireUnlock).mockResolvedValue({ pub: "x" } as never);
    encryptEveryFile();

    const data = queueIntoOpenFolder(store, 6);
    openRoomsList(store);
    store.handleFilesUpload(data, t);
    await vi.waitFor(() => expect(sessionCalls()).toHaveLength(5));

    store.startSessionFunc(5, t);
    await vi.waitFor(() => expect(sessionCalls()).toHaveLength(6));

    expect(
      new Set(vi.mocked(requireUnlock).mock.calls.map(([userId]) => userId)),
    ).toEqual(new Set(["user-1"]));
    for (const [folderId, name, , , encrypted] of sessionCalls()) {
      expect(folderId).toBe(PRIVATE_ROOM_ID);
      expect(name).toMatch(OPAQUE_NAME);
      expect(encrypted).toBe(true);
    }
    for (const [config] of vi.mocked(prepareEncryptedUpload).mock.calls) {
      expect(config).toMatchObject({
        isPrivate: true,
        roomType: RoomsType.CustomRoom,
      });
    }
    expect(store.files.every((f) => f.encrypted)).toBe(true);
  });

  it("Files section left while files are queued", async () => {
    const { store } = createTestUploadDataStore({
      ...privateRoomOpen,
      userStore: userWithKeys(),
    });
    vi.mocked(requireUnlock).mockResolvedValue({ pub: "x" } as never);
    encryptEveryFile();

    const data = queueIntoOpenFolder(store, 2);
    clearSelectedFolder(store);
    store.handleFilesUpload(data, t);
    await vi.waitFor(() => expect(sessionCalls()).toHaveLength(2));

    for (const [folderId, name, , , encrypted] of sessionCalls()) {
      expect(folderId).toBe(PRIVATE_ROOM_ID);
      expect(name).toMatch(OPAQUE_NAME);
      expect(encrypted).toBe(true);
    }
  });

  it("Private room opened while a plain upload is queued", async () => {
    const { store } = createTestUploadDataStore({
      ...plainFolderOpen,
      userStore: userWithKeys(),
    });

    const data = queueIntoOpenFolder(store, 2);
    openFolder(store, privateRoomOpen);
    store.handleFilesUpload(data, t);
    await vi.waitFor(() => expect(sessionCalls()).toHaveLength(2));

    expect(requireUnlock).not.toHaveBeenCalled();
    expect(prepareEncryptedUpload).not.toHaveBeenCalled();
    expect(sessionCalls().map(([folderId, name, , , encrypted]) => [
      folderId,
      name,
      encrypted,
    ])).toEqual([
      [PLAIN_FOLDER_ID, "report-0.docx", false],
      [PLAIN_FOLDER_ID, "report-1.docx", false],
    ]);
  });

  it("No key when the queued file starts", async () => {
    const { store } = createTestUploadDataStore({
      ...privateRoomOpen,
      userStore: { user: { id: "user-1", isAdmin: false }, encryptionKeys: [] },
    });
    replaceAction(store, "finishUploadFiles");

    const data = queueIntoOpenFolder(store, 2);
    openRoomsList(store);
    store.handleFilesUpload(data, t);
    await vi.waitFor(() =>
      expect(store.files.every((f) => !!f.error)).toBe(true),
    );

    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
    expect(prepareEncryptedUpload).not.toHaveBeenCalled();
    expect(store.files.map((f) => f.error)).toEqual([
      "Common:EncryptionKeysRequiredForUpload",
      "Common:EncryptionKeysRequiredForUpload",
    ]);
  });

  it("Encryption yields no ciphertext", async () => {
    allowConsoleError("[ENCRYPTION] encrypted upload preparation failed");
    const { store } = createTestUploadDataStore({
      ...privateRoomOpen,
      userStore: userWithKeys(),
    });
    vi.mocked(requireUnlock).mockResolvedValue({ pub: "x" } as never);
    vi.mocked(prepareEncryptedUpload).mockImplementation(
      async (config) =>
        ({
          data: config.file,
          encrypted: false,
          dek: null,
          uploadFileName: config.file.name,
          originalFileType: "application/octet-stream",
          originalFileSize: config.file.size,
          originalFileName: config.file.name,
        }) as never,
    );
    replaceAction(store, "finishUploadFiles");

    const data = queueIntoOpenFolder(store, 1);
    openRoomsList(store);
    store.handleFilesUpload(data, t);
    await vi.waitFor(() =>
      expect(store.files[0].error).toBe("Common:EncryptionPrepareFailed"),
    );

    expect(prepareEncryptedUpload).toHaveBeenCalledTimes(1);
    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
    expect(store.files[0].encrypted).toBeFalsy();
  });

  it("Private target with another room type", async () => {
    const { store } = createTestUploadDataStore({
      ...privateRoomOpen,
      userStore: userWithKeys(),
    });
    replaceAction(store, "finishUploadFiles");
    const handleUploadConflicts = vi.fn();
    store.handleUploadConflicts = handleUploadConflicts as never;

    store.startUpload(
      [makeBrowserFile("report-0.docx", 100, { parentFolderId: PRIVATE_ROOM_ID })],
      {
        folderId: PRIVATE_ROOM_ID,
        isPrivate: true,
        roomType: RoomsType.PublicRoom,
        encryptionRoomId: PRIVATE_ROOM_ID,
      },
      t,
    );
    store.handleFilesUpload(handleUploadConflicts.mock.calls[0][2], t);
    await vi.waitFor(() =>
      expect(store.files[0].error).toBe("Common:EncryptionPrepareFailed"),
    );

    expect(prepareEncryptedUpload).not.toHaveBeenCalled();
    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
  });

  it("Unlock declined for a queued batch", async () => {
    const { store } = createTestUploadDataStore({
      ...privateRoomOpen,
      userStore: userWithKeys(),
    });
    vi.mocked(requireUnlock).mockResolvedValue(null as never);

    const data = queueIntoOpenFolder(store, 2);
    openRoomsList(store);
    store.handleFilesUpload(data, t);
    await vi.waitFor(() => expect(store.uploaded).toBe(true));

    expect(vi.mocked(requireUnlock).mock.calls).toEqual([["user-1"]]);
    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
    expect(prepareEncryptedUpload).not.toHaveBeenCalled();
    expect(store.files.map((f) => f.error)).toEqual([
      "Common:EncryptionLockedUpload",
      "Common:EncryptionLockedUpload",
    ]);
  });
});

describe("UploadDataStore — copy into another private room", () => {
  const DEST_ROOM_ID = 60;

  it("Destination member without a key", async () => {
    const { store } = createTestUploadDataStore({ userStore: userWithKeys() });
    vi.mocked(requireUnlock).mockResolvedValue({ publicKey: "id-pub" } as never);
    vi.mocked(sniffDse3Upload).mockResolvedValue(null);
    vi.mocked(prepareEncryptedUpload).mockImplementation(
      async (config) =>
        ({
          data: new Blob([new Uint8Array(config.file.size + 100)]),
          encrypted: true,
          dek: makeDek(),
          uploadFileName: makeOpaqueUploadName(config.file.name),
          originalFileType: "application/octet-stream",
          originalFileSize: config.file.size,
          originalFileName: config.file.name,
        }) as never,
    );
    serveEncryptedUpload(555, DEST_ROOM_ID);
    vi.mocked(getRoomEncryptionKeys).mockResolvedValue([
      memberKey("user-1", "pub-b64"),
      memberKey("bob", "pk-bob"),
      memberKey("carol", ""),
    ] as never);
    replaceAction(store, "refreshFiles");
    replaceAction(store, "finishUploadFiles");
    const handleUploadConflicts = vi.fn();
    store.handleUploadConflicts = handleUploadConflicts as never;

    store.startUpload(
      [
        tagFileForCopy(makeBrowserFile("plan.docx", 100), DEST_ROOM_ID, {
          roomType: RoomsType.CustomRoom,
          isPrivate: true,
        }),
      ],
      makePrivateUploadTarget({
        folderId: DEST_ROOM_ID,
        encryptionRoomId: DEST_ROOM_ID,
      }),
      t,
    );
    store.handleFilesUpload(handleUploadConflicts.mock.calls[0][2], t);
    await vi.waitFor(() =>
      expect(filesApi.setFileEncryptionKeys).toHaveBeenCalledTimes(2),
    );

    const [folderId, , , , encrypted] = vi.mocked(filesApi.startUploadSession)
      .mock.calls[0];
    expect([folderId, encrypted]).toEqual([DEST_ROOM_ID, true]);
    expect(
      vi
        .mocked(wrapDekForRecipients)
        .mock.calls.map(([{ recipients }]) => recipients.map((r) => r.userId)),
    ).toEqual([["user-1"], ["bob"]]);
    expect(vi.mocked(getRoomEncryptionKeys).mock.calls).toEqual([
      [DEST_ROOM_ID],
    ]);
    expect(store.files[0].skippedMembers).toBeUndefined();
    expect(toastr.warning).not.toHaveBeenCalled();
  });
});
