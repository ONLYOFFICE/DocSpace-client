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

import { describe, it, expect, beforeEach, vi } from "vitest";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import {
  makeOpaqueUploadName,
  prepareEncryptedUpload,
  sniffDse3Upload,
} from "@docspace/shared/services/private-room/encrypted-upload";
import type { TTranslation } from "@docspace/shared/types";

import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeBrowserFile,
  makePrivateUploadTarget,
  makeUploadFile,
} from "./testHarness";
import * as filesApi from "@docspace/shared/api/files";
import type { TUploadFile } from "../helpers";
import type UploadDataStore from "../../UploadDataStore";

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
  "@docspace/shared/services/private-room/encrypted-upload",
  async (orig) => {
    const actual = (await orig()) as Record<string, unknown>;
    return {
      ...actual,
      prepareEncryptedUpload: vi.fn(),
      sniffDse3Upload: vi.fn(),
    };
  },
);

const t = ((key: string) => key) as unknown as TTranslation;

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

const stubStoreMethod = <T, K extends keyof T>(target: T, key: K) => {
  const fn = vi.fn();
  target[key] = fn as unknown as T[K];
  return fn;
};

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("UploadDataStore.retryUploadFiles", () => {
  it("re-queues a failed upload: resets error state on file and history, restarts uploading", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const parallelSpy = stubStoreMethod(store, "parallelUploading");

    store.files = [
      makeUploadFile({
        uniqueId: "u1",
        action: "upload",
        error: "Server error",
        isQuotaError: true,
        inAction: true,
        percent: 40,
      }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({
        uniqueId: "u1",
        action: "upload",
        error: "Server error",
        isQuotaError: true,
        inAction: true,
        errorShown: true,
        percent: 40,
      }),
    ];
    store.filesSize = 111;
    store.convertFilesSize = 555;
    store.uploadedFiles = 3;
    store.percent = 40;
    store.uploaded = true;
    store.quotaErrorRaised = true;

    await store.retryUploadFiles(t, "u1");

    expect(store.files[0]).toMatchObject({
      action: "upload",
      error: "",
      isQuotaError: false,
      inAction: false,
      percent: 0,
    });
    expect(store.uploadedFilesHistory[0]).toMatchObject({
      action: "upload",
      error: "",
      isQuotaError: false,
      inAction: false,
      errorShown: false,
      percent: 0,
    });
    expect(store.quotaErrorRaised).toBe(false);
    expect(store.uploaded).toBe(false);
    expect(store.filesSize).toBe(555);
    expect(store.uploadedFiles).toBe(3);
    expect(store.percent).toBe(40);

    const progressMock = asMock(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    );
    expect(progressMock).toHaveBeenCalledTimes(1);
    expect(progressMock).toHaveBeenCalledWith({
      completed: false,
      percent: 40,
      operation: OPERATIONS_NAME.upload,
      alert: false,
      showPanel: store.setUploadPanelVisible,
    });

    expect(parallelSpy).toHaveBeenCalledTimes(1);
    expect(parallelSpy).toHaveBeenCalledWith([store.files[0]], t);
  });

  it("routes a failed conversion retry through convertFile and leaves upload state alone", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const parallelSpy = stubStoreMethod(store, "parallelUploading");
    const convertSpy = stubStoreMethod(store, "convertFile");

    store.files = [
      makeUploadFile({
        uniqueId: "c1",
        fileId: 7,
        inConversion: true,
        error: "Conversion error",
        percent: 100,
      }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({
        uniqueId: "c1",
        fileId: 7,
        action: "convert",
        inConversion: true,
        error: "Conversion error",
        percent: 100,
      }),
    ];
    store.quotaErrorRaised = true;

    await store.retryUploadFiles(t, "c1");

    expect(store.files[0].inConversion).toBe(false);
    expect(store.uploadedFilesHistory[0].inConversion).toBe(false);
    expect(convertSpy).toHaveBeenCalledTimes(1);
    expect(convertSpy).toHaveBeenCalledWith(store.uploadedFilesHistory[0], t);

    expect(store.uploadedFilesHistory[0].error).toBe("Conversion error");
    expect(store.uploadedFilesHistory[0].percent).toBe(100);
    expect(store.quotaErrorRaised).toBe(true);

    expect(parallelSpy).not.toHaveBeenCalled();
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();
  });

  it("skips the progress-bar reset when an upload batch is still running", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const parallelSpy = stubStoreMethod(store, "parallelUploading");

    store.files = [
      makeUploadFile({
        uniqueId: "u1",
        action: "upload",
        error: "Server error",
        percent: 40,
      }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({
        uniqueId: "u1",
        action: "upload",
        error: "Server error",
        errorShown: true,
        percent: 40,
      }),
    ];
    store.filesSize = 111;
    store.convertFilesSize = 555;
    store.uploaded = false;

    await store.retryUploadFiles(t, "u1");

    expect(store.files[0]).toMatchObject({
      action: "upload",
      error: "",
      isQuotaError: false,
      inAction: false,
      percent: 0,
    });
    expect(store.filesSize).toBe(111);
    expect(store.uploaded).toBe(false);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();

    expect(parallelSpy).toHaveBeenCalledTimes(1);
    expect(parallelSpy).toHaveBeenCalledWith([store.files[0]], t);
  });
});

describe("UploadDataStore.retryQuotaFailedFiles", () => {
  it("resets every quota-failed file in one pass and re-uploads exactly that set", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const parallelSpy = stubStoreMethod(store, "parallelUploading");

    store.files = [
      makeUploadFile({
        uniqueId: "q1",
        action: "upload",
        error: "Quota exceeded",
        isQuotaError: true,
        inAction: true,
        percent: 20,
      }),
      makeUploadFile({ uniqueId: "ok", action: "uploaded", percent: 100 }),
      makeUploadFile({
        uniqueId: "q2",
        action: "upload",
        error: "Quota exceeded",
        isQuotaError: true,
        inAction: true,
        percent: 5,
      }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({
        uniqueId: "q1",
        action: "upload",
        error: "Quota exceeded",
        isQuotaError: true,
        inAction: true,
        errorShown: true,
        percent: 20,
      }),
      makeUploadFile({ uniqueId: "ok", action: "uploaded", percent: 100 }),
      makeUploadFile({
        uniqueId: "q2",
        action: "upload",
        error: "Quota exceeded",
        isQuotaError: true,
        inAction: true,
        errorShown: true,
        percent: 5,
      }),
    ];
    store.filesSize = 123;
    store.convertFilesSize = 999;
    store.uploadedFiles = 2;
    store.percent = 55;
    store.uploaded = true;
    store.quotaErrorRaised = true;

    await store.retryQuotaFailedFiles(t);

    const resetShape = {
      action: "upload",
      error: "",
      isQuotaError: false,
      inAction: false,
      percent: 0,
    };
    expect(store.files[0]).toMatchObject(resetShape);
    expect(store.files[2]).toMatchObject(resetShape);
    expect(store.files[1]).toMatchObject({ action: "uploaded", percent: 100 });

    expect(store.uploadedFilesHistory[0]).toMatchObject({
      ...resetShape,
      errorShown: false,
    });
    expect(store.uploadedFilesHistory[2]).toMatchObject({
      ...resetShape,
      errorShown: false,
    });
    expect(store.uploadedFilesHistory[1]).toMatchObject({
      action: "uploaded",
      percent: 100,
    });

    expect(store.quotaErrorRaised).toBe(false);
    expect(store.uploaded).toBe(false);
    expect(store.filesSize).toBe(999);
    expect(store.uploadedFiles).toBe(2);

    const progressMock = asMock(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    );
    expect(progressMock).toHaveBeenCalledTimes(1);
    expect(progressMock).toHaveBeenCalledWith({
      completed: false,
      percent: 55,
      operation: OPERATIONS_NAME.upload,
      alert: false,
      showPanel: store.setUploadPanelVisible,
    });

    expect(parallelSpy).toHaveBeenCalledTimes(1);
    expect(parallelSpy).toHaveBeenCalledWith(
      [store.files[0], store.files[2]],
      t,
    );
  });

  it("does nothing when no file failed with a quota error", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const parallelSpy = stubStoreMethod(store, "parallelUploading");

    store.files = [
      makeUploadFile({ uniqueId: "ok", action: "uploaded", percent: 100 }),
    ];
    store.quotaErrorRaised = true;

    await store.retryQuotaFailedFiles(t);

    expect(store.quotaErrorRaised).toBe(true);
    expect(parallelSpy).not.toHaveBeenCalled();
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();
  });

  it("resets a quota-failed file with no history entry and skips progress while uploading", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const parallelSpy = stubStoreMethod(store, "parallelUploading");

    store.files = [
      makeUploadFile({
        uniqueId: "q1",
        action: "upload",
        error: "Quota exceeded",
        isQuotaError: true,
        inAction: true,
        percent: 20,
      }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "other", action: "uploaded", percent: 100 }),
    ];
    store.filesSize = 123;
    store.convertFilesSize = 999;
    store.uploaded = false;
    store.quotaErrorRaised = true;

    await store.retryQuotaFailedFiles(t);

    expect(store.files[0]).toMatchObject({
      action: "upload",
      error: "",
      isQuotaError: false,
      inAction: false,
      percent: 0,
    });
    expect(store.uploadedFilesHistory[0]).toMatchObject({
      uniqueId: "other",
      action: "uploaded",
      percent: 100,
    });
    expect(store.quotaErrorRaised).toBe(false);
    expect(store.filesSize).toBe(123);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();

    expect(parallelSpy).toHaveBeenCalledTimes(1);
    expect(parallelSpy).toHaveBeenCalledWith([store.files[0]], t);
  });
});

describe("UploadDataStore.retryConvertFiles", () => {
  it("clears the in-conversion flags and re-runs conversion for the displayed file", () => {
    const { store } = createTestUploadDataStore();
    const convertFromFilesSpy = stubStoreMethod(
      store,
      "convertFileFromFiles",
    );

    store.files = [
      makeUploadFile({ uniqueId: "f1", fileId: 42, inConversion: true }),
      makeUploadFile({ uniqueId: "f2", fileId: 43, inConversion: true }),
    ];
    store.displayedConversionFiles = [
      makeUploadFile({ uniqueId: "f1", fileId: 42, inConversion: true }),
    ];

    store.retryConvertFiles(t, 42);

    expect(store.files[0].inConversion).toBe(false);
    expect(store.files[1].inConversion).toBe(true);
    expect(store.displayedConversionFiles[0].inConversion).toBe(false);

    expect(convertFromFilesSpy).toHaveBeenCalledTimes(1);
    expect(convertFromFilesSpy).toHaveBeenCalledWith(
      store.displayedConversionFiles[0],
      t,
    );
  });

  it("returns early when the file is not displayed in the conversion panel", () => {
    const { store } = createTestUploadDataStore();
    const convertFromFilesSpy = stubStoreMethod(
      store,
      "convertFileFromFiles",
    );

    store.files = [
      makeUploadFile({ uniqueId: "f1", fileId: 42, inConversion: true }),
    ];
    store.displayedConversionFiles = [];

    store.retryConvertFiles(t, 42);

    expect(store.files[0].inConversion).toBe(false);
    expect(convertFromFilesSpy).not.toHaveBeenCalled();
  });

  it("re-runs conversion even when the file is missing from the upload list", () => {
    const { store } = createTestUploadDataStore();
    const convertFromFilesSpy = stubStoreMethod(
      store,
      "convertFileFromFiles",
    );

    store.files = [];
    store.displayedConversionFiles = [
      makeUploadFile({ uniqueId: "f1", fileId: 42, inConversion: true }),
    ];

    store.retryConvertFiles(t, 42);

    expect(store.displayedConversionFiles[0].inConversion).toBe(false);
    expect(convertFromFilesSpy).toHaveBeenCalledTimes(1);
    expect(convertFromFilesSpy).toHaveBeenCalledWith(
      store.displayedConversionFiles[0],
      t,
    );
  });
});

describe("UploadDataStore retry — the private-room rules run again on the fixed target", () => {
  const ROOM_ID = 50;
  const OPAQUE_NAME =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.docx$/;
  const userWithKeys = {
    user: { id: "user-1", isAdmin: false },
    encryptionKeys: [{ id: "key-1", publicKey: "pub-b64" }],
  };

  const failedPrivateItem = (
    uniqueId: string,
    overrides: Partial<TUploadFile> = {},
  ) =>
    makeUploadFile({
      uniqueId,
      file: makeBrowserFile(`${uniqueId}.docx`, 100),
      action: "upload",
      error: "Server error",
      inAction: true,
      toFolderId: ROOM_ID,
      encryptionRoomId: ROOM_ID,
      target: makePrivateUploadTarget({ folderId: ROOM_ID }),
      ...overrides,
    });

  /** The Rooms list is open: nothing about the open folder is private. */
  const storeWithFailed = (
    items: TUploadFile[],
    userStore: Record<string, unknown> = userWithKeys,
  ) => {
    const { store } = createTestUploadDataStore({
      selectedFolderStore: { id: 2002, isRoom: false, navigationPath: [] },
      treeFoldersStore: { isPrivacyFolder: false },
      userStore,
    });
    store.files = items;
    store.uploadedFilesHistory = items.map((i) => ({ ...i }));
    store.uploaded = true;
    return store;
  };

  const sessionCalls = () => vi.mocked(filesApi.startUploadSession).mock.calls;

  const expectEncryptedIntoRoom = () => {
    for (const [folderId, name, , , encrypted] of sessionCalls()) {
      expect(folderId).toBe(ROOM_ID);
      expect(name).toMatch(OPAQUE_NAME);
      expect(encrypted).toBe(true);
    }
  };

  const spyOnWrap = (store: UploadDataStore) => {
    const wrap = vi.fn();
    store.wrapForSelfThenRoom = wrap as never;
    return wrap;
  };

  beforeEach(() => {
    vi.mocked(sniffDse3Upload).mockResolvedValue(null);
    vi.mocked(filesApi.startUploadSession).mockReturnValue(
      new Promise(() => {}) as never,
    );
    vi.mocked(prepareEncryptedUpload).mockImplementation(
      async (config) =>
        ({
          data: new Blob([new Uint8Array(config.file.size + 100)]),
          encrypted: true,
          dek: new Uint8Array([1, 2, 3]),
          uploadFileName: makeOpaqueUploadName(config.file.name),
          originalFileType: "application/octet-stream",
          originalFileSize: config.file.size,
          originalFileName: config.file.name,
        }) as never,
    );
  });

  it("Retry from another folder", async () => {
    const store = storeWithFailed([failedPrivateItem("a")]);
    vi.mocked(requireUnlock).mockResolvedValue({ pub: "x" } as never);

    await store.retryUploadFiles(t, "a");
    await vi.waitFor(() => expect(sessionCalls()).toHaveLength(1));

    expect(vi.mocked(requireUnlock).mock.calls).toEqual([["user-1"]]);
    expect(
      vi.mocked(requireUnlock).mock.invocationCallOrder[0],
    ).toBeLessThan(
      vi.mocked(filesApi.startUploadSession).mock.invocationCallOrder[0],
    );
    expect(vi.mocked(prepareEncryptedUpload).mock.calls[0][0]).toMatchObject({
      isPrivate: true,
    });
    expectEncryptedIntoRoom();
  });

  it("Retry still without a key", async () => {
    const store = storeWithFailed(
      [
        failedPrivateItem("a", {
          error: "Common:EncryptionKeysRequiredForUpload",
        }),
      ],
      { user: { id: "user-1", isAdmin: false }, encryptionKeys: [] },
    );
    stubStoreMethod(store, "finishUploadFiles");

    await store.retryUploadFiles(t, "a");
    await vi.waitFor(() =>
      expect(store.files[0].error).toBe(
        "Common:EncryptionKeysRequiredForUpload",
      ),
    );

    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
    expect(prepareEncryptedUpload).not.toHaveBeenCalled();
  });

  it("Retry while locked", async () => {
    const store = storeWithFailed([failedPrivateItem("a")]);
    vi.mocked(requireUnlock).mockResolvedValue(null as never);
    const wrap = spyOnWrap(store);
    const finishUploadFiles = stubStoreMethod(store, "finishUploadFiles");

    await store.retryUploadFiles(t, "a");

    expect(store.files[0].error).toBe("Common:EncryptionLockedUpload");
    expect(store.uploadedFilesHistory[0].error).toBe(
      "Common:EncryptionLockedUpload",
    );
    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
    expect(prepareEncryptedUpload).not.toHaveBeenCalled();
    expect(wrap).not.toHaveBeenCalled();
    expect(finishUploadFiles).toHaveBeenCalledTimes(1);
  });

  it("Retry after a quota failure", async () => {
    const store = storeWithFailed([
      failedPrivateItem("a", { error: "Quota exceeded", isQuotaError: true }),
      failedPrivateItem("b", { error: "Quota exceeded", isQuotaError: true }),
    ]);
    vi.mocked(requireUnlock).mockResolvedValue({ pub: "x" } as never);

    await store.retryQuotaFailedFiles(t);
    await vi.waitFor(() => expect(sessionCalls()).toHaveLength(2));

    expect(vi.mocked(requireUnlock).mock.calls).toEqual([["user-1"]]);
    expectEncryptedIntoRoom();
  });
});
