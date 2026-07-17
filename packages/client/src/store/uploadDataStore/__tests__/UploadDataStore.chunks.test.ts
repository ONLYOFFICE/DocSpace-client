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
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { AnalyticsEvents } from "@docspace/shared/enums";

import type { TFile } from "@docspace/shared/api/files/types";
import type { TTranslation } from "@docspace/shared/types";
import type UploadDataStore from "../../UploadDataStore";

const t = ((key: string) => key) as unknown as TTranslation;

type TChunkResLike = {
  uploaded: boolean;
  id: number | string | null;
  file: TFile | null;
};

const callCheckChunkUpload = (
  store: UploadDataStore,
  args: {
    res: TChunkResLike;
    index: number;
    indexOfFile: number;
    chunksLength: number;
    resolve: (value?: unknown) => void;
    path?: number[];
    createNewIfExist?: boolean;
  },
) =>
  store.checkChunkUpload({
    t,
    path: [],
    ...args,
  } as unknown as Parameters<UploadDataStore["checkChunkUpload"]>[0]);

const replaceAction = (
  store: UploadDataStore,
  key: "startSessionFunc" | "refreshFiles" | "finishUploadFiles",
) => {
  const fn = vi.fn().mockResolvedValue(undefined);
  (store as unknown as Record<string, unknown>)[key] = fn;
  return fn;
};

const getDataLayer = () =>
  (window as unknown as { dataLayer: Array<Record<string, unknown>> })
    .dataLayer;

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("UploadDataStore.checkChunkUpload — intermediate chunks", () => {
  it("updates history percent monotonically and never resolves early", () => {
    const { store, fakes } = createTestUploadDataStore();
    const entry = makeUploadFile({ uniqueId: "mid", inAction: true });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    const resolve = vi.fn();

    for (const index of [1, 2, 1, 3]) {
      callCheckChunkUpload(store, {
        res: { uploaded: false, id: null, file: null },
        index,
        indexOfFile: 0,
        chunksLength: 4,
        resolve,
      });
    }

    expect(resolve.mock.calls).toEqual([]);

    const progress =
      fakes.primaryProgressDataStore.setPrimaryProgressBarData as ReturnType<
        typeof vi.fn
      >;
    expect(progress.mock.calls).toEqual([
      [{ operation: OPERATIONS_NAME.upload, percent: 25 }],
      [{ operation: OPERATIONS_NAME.upload, percent: 50 }],
      [{ operation: OPERATIONS_NAME.upload, percent: 50 }],
      [{ operation: OPERATIONS_NAME.upload, percent: 75 }],
    ]);

    const percents = progress.mock.calls.map(
      ([arg]) => (arg as { percent: number }).percent,
    );
    percents.forEach((p: number, i: number) => {
      if (i > 0) expect(p).toBeGreaterThanOrEqual(percents[i - 1]);
    });

    expect(store.uploadedFilesHistory[0].percent).toBe(75);
    expect(store.percent).toBe(75);
    expect(store.files[0].percent).toBe(0);
    expect(store.currentUploadNumber).toBe(1);
  });
});

describe("UploadDataStore.checkChunkUpload — final chunk", () => {
  it("marks the file uploaded in place, frees the slot, chains the next file and resolves once", () => {
    const { store, fakes } = createTestUploadDataStore();
    const uploadingFile = makeUploadFile({
      uniqueId: "done",
      inAction: true,
      toFolderId: 7,
    });
    const queuedFile = makeUploadFile({ uniqueId: "queued" });
    store.files = [uploadingFile, queuedFile];
    store.uploadedFilesHistory = [{ ...uploadingFile, percent: 50 }];
    store.uploaded = false;
    store.currentUploadNumber = 1;

    const startSessionFunc = replaceAction(store, "startSessionFunc");
    const refreshFiles = replaceAction(store, "refreshFiles");
    const historyRef = store.uploadedFilesHistory;
    const serverFile = makeFileInfo({
      id: 555,
      folderId: 7,
      version: 1,
      fileExst: ".docx",
    });
    const resolve = vi.fn();

    callCheckChunkUpload(store, {
      res: { uploaded: true, id: 555, file: serverFile },
      index: 3,
      indexOfFile: 0,
      chunksLength: 3,
      path: [7],
      resolve,
      createNewIfExist: true,
    });

    expect(resolve.mock.calls).toEqual([[]]);

    expect(store.files[0].action).toBe("uploaded");
    expect(store.files[0].fileId).toBe(555);
    expect(store.files[0].fileInfo?.id).toBe(555);
    expect(store.files[0].path).toEqual([7]);

    expect(store.uploadedFilesHistory[0].action).toBe("uploaded");
    expect(store.uploadedFilesHistory[0].fileId).toBe(555);
    expect(store.uploadedFilesHistory[0].fileInfo?.id).toBe(555);
    expect(store.uploadedFilesHistory[0].error).toBeNull();
    expect(store.uploadedFilesHistory[0].percent).toBe(100);
    expect(store.uploadedFilesHistory).toBe(historyRef);

    expect(store.currentUploadNumber).toBe(0);

    expect(startSessionFunc).toHaveBeenCalledTimes(1);
    expect(startSessionFunc).toHaveBeenCalledWith(1, t, true);
    expect(store.files[1].action).toBe("upload");

    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      percent: 100,
    });

    expect(getDataLayer()).toEqual([
      { event: AnalyticsEvents.FileUploaded, id: 555, parentId: 7 },
    ]);

    expect(refreshFiles).toHaveBeenCalledTimes(1);
    expect(refreshFiles).toHaveBeenCalledWith(store.files[0]);
  });
});

describe("UploadDataStore.checkChunkUpload — index targeting", () => {
  it("final chunk mutates exactly the file at indexOfFile, leaving its neighbors alone", () => {
    const { store } = createTestUploadDataStore();
    const bystander = makeUploadFile({ uniqueId: "bystander", inAction: true });
    const uploading = makeUploadFile({
      uniqueId: "second",
      inAction: true,
      toFolderId: 7,
    });
    store.files = [bystander, uploading];
    store.uploadedFilesHistory = [{ ...bystander }, { ...uploading }];
    store.uploaded = false;
    store.currentUploadNumber = 2;
    replaceAction(store, "refreshFiles");
    const serverFile = makeFileInfo({ id: 606, folderId: 7, version: 1 });

    callCheckChunkUpload(store, {
      res: { uploaded: true, id: 606, file: serverFile },
      index: 1,
      indexOfFile: 1,
      chunksLength: 1,
      resolve: vi.fn(),
    });

    expect(store.files[1].action).toBe("uploaded");
    expect(store.files[1].fileId).toBe(606);
    expect(store.uploadedFilesHistory[1].action).toBe("uploaded");
    expect(store.uploadedFilesHistory[1].fileId).toBe(606);
    expect(store.files[0].action).toBe("upload");
    expect(store.files[0].fileId).toBeNull();
    expect(store.uploadedFilesHistory[0].action).toBe("upload");
    expect(store.uploadedFilesHistory[0].fileId).toBeNull();
  });
});

describe("UploadDataStore.startSessionFunc — caller-side finalization latch", () => {
  it("skips finalization entirely when finishUploadFilesCalled is already latched", async () => {
    const { store } = createTestUploadDataStore();
    const entry = makeUploadFile({
      uniqueId: "latched",
      file: makeBrowserFile("latched.docx", 1024),
      toFolderId: 1,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    store.finishUploadFilesCalled = true;
    const finishUploadFiles = replaceAction(store, "finishUploadFiles");
    vi.mocked(filesApi.startUploadSession).mockRejectedValue(
      new Error("boom"),
    );

    await store.startSessionFunc(0, t);

    expect(store.files[0].error).toBe("boom");
    expect(finishUploadFiles).not.toHaveBeenCalled();
    expect(store.uploaded).toBe(false);
  });
});

describe("UploadDataStore.asyncUpload — cancelled file", () => {
  it("resolves immediately without touching the chunk pipeline", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const browserFile = makeBrowserFile("cancelled.docx", 1024);
    const entry = makeUploadFile({ file: browserFile, cancel: true });
    store.files = [entry];
    store.uploaded = false;

    const onUpload = vi.fn();
    store.asyncUploadObj = {
      "op-1": {
        chunksArray: [
          { isActive: false, isFinished: false, isFinalize: false, onUpload },
        ],
      },
    } as unknown as typeof store.asyncUploadObj;
    const resolve = vi.fn();
    const reject = vi.fn();

    await store.asyncUpload(
      t,
      { operationId: "op-1", file: browserFile, indexOfFile: 0, path: [], length: 1 },
      resolve,
      reject,
    );

    expect(resolve.mock.calls).toEqual([[]]);
    expect(reject.mock.calls).toEqual([]);

    expect(onUpload.mock.calls).toEqual([]);
    expect(store.asyncUploadObj["op-1"].chunksArray[0].isActive).toBe(false);
    expect(store.asyncUploadObj["op-1"].chunksArray[0].isFinished).toBe(false);
    expect(
      (
        fakes.primaryProgressDataStore
          .setPrimaryProgressBarData as ReturnType<typeof vi.fn>
      ).mock.calls,
    ).toEqual([]);
    expect(store.files[0].action).toBe("upload");
    expect(store.currentUploadNumber).toBe(0);
  });
});

describe("UploadDataStore.asyncUpload — cancellation mid-chunk", () => {
  it("skips finalization and the completion toast when cancelUpload lands while a chunk is in flight", async () => {
    const { store } = createTestUploadDataStore();
    const browserFile = makeBrowserFile("cancelled.docx", 1024);
    const entry = makeUploadFile({
      uniqueId: "cancel-mid",
      file: browserFile,
      toFolderId: 1,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    const refreshFiles = replaceAction(store, "refreshFiles");

    vi.mocked(filesApi.startUploadSession).mockResolvedValue({
      id: "sess-1",
      path: [],
    } as never);
    let releaseChunk: (() => void) | undefined;
    vi.mocked(filesApi.uploadChunkParallel).mockImplementation(
      () =>
        new Promise((res) => {
          releaseChunk = () =>
            res({ uploaded: false, id: null, file: null } as never);
        }) as never,
    );

    const done = store.startSessionFunc(0, t);
    await vi.waitFor(() => expect(releaseChunk).toBeDefined());

    store.cancelUpload();
    releaseChunk?.();
    await done;

    expect(filesApi.finalizeUploadSession).not.toHaveBeenCalled();
    expect(toastr.success).not.toHaveBeenCalled();
    expect(refreshFiles).not.toHaveBeenCalled();
    expect(store.files[0].cancel).toBe(true);
    expect(store.files[0].action).toBe("upload");
    expect(store.finishUploadFilesCalled).toBe(true);
    expect(toastr.info).toHaveBeenCalledWith("Common:CancelUpload");
  });
});

describe("UploadDataStore.uploadFileChunks + asyncUpload — full cycle", () => {
  it("drains chunks through the thread pool and finalizes exactly once before resolving", async () => {
    const { store, fakes } = createTestUploadDataStore({
      filesSettingsStore: { uploadThreadCount: 2 },
    });
    const browserFile = makeBrowserFile("bundle.docx", 3000);
    const entry = makeUploadFile({
      uniqueId: "chunky",
      file: browserFile,
      toFolderId: 42,
      inAction: true,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    const refreshFiles = replaceAction(store, "refreshFiles");

    const serverFile = makeFileInfo({
      id: 777,
      folderId: 42,
      version: 1,
      fileExst: ".docx",
    });
    vi.mocked(filesApi.uploadChunkParallel).mockResolvedValue({
      uploaded: false,
      id: null,
      file: null,
    } as never);
    const journal: string[] = [];
    let releaseFinalize: (() => void) | undefined;
    vi.mocked(filesApi.finalizeUploadSession).mockImplementation(
      () =>
        new Promise((res) => {
          releaseFinalize = () => {
            journal.push("finalize");
            res({ uploaded: true, id: 777, file: serverFile } as never);
          };
        }) as never,
    );

    const requests = [new FormData(), new FormData(), new FormData()];
    const done = store
      .uploadFileChunks(
        "sess-1",
        42,
        requests,
        3000,
        0,
        browserFile,
        [42],
        t,
        "op-1",
        42,
        true,
      )
      .then(() => {
        journal.push("resolved");
      });

    await vi.waitFor(() => expect(releaseFinalize).toBeDefined());
    expect(journal).toEqual([]);

    releaseFinalize?.();
    await done;

    expect(vi.mocked(filesApi.finalizeUploadSession).mock.calls).toEqual([
      [42, "sess-1"],
    ]);
    expect(journal).toEqual(["finalize", "resolved"]);

    const chunkCalls = vi.mocked(filesApi.uploadChunkParallel).mock.calls;
    expect(chunkCalls.map((c) => [c[0], c[1], c[2]])).toEqual([
      [42, "sess-1", 1],
      [42, "sess-1", 2],
      [42, "sess-1", 3],
    ]);
    chunkCalls.forEach((c, i) => expect(c[3]).toBe(requests[i]));

    const chunkOrders =
      vi.mocked(filesApi.uploadChunkParallel).mock.invocationCallOrder;
    const finalizeOrder =
      vi.mocked(filesApi.finalizeUploadSession).mock.invocationCallOrder[0];
    chunkOrders.forEach((order) =>
      expect(finalizeOrder).toBeGreaterThan(order),
    );

    expect(store.files[0].action).toBe("uploaded");
    expect(store.files[0].fileId).toBe(777);
    expect(store.files[0].fileInfo?.id).toBe(777);
    expect(store.currentUploadNumber).toBe(0);
    expect(refreshFiles).toHaveBeenCalledTimes(1);
    expect(refreshFiles).toHaveBeenCalledWith(store.files[0]);

    const percents = (
      fakes.primaryProgressDataStore
        .setPrimaryProgressBarData as ReturnType<typeof vi.fn>
    ).mock.calls.map(([arg]) => (arg as { percent: number }).percent);
    expect(percents).toHaveLength(4);
    percents.forEach((p: number, i: number) => {
      if (i > 0) expect(p).toBeGreaterThanOrEqual(percents[i - 1]);
    });
    expect(percents[3]).toBe(100);
    expect(store.percent).toBe(100);
    expect(store.uploadedFilesHistory[0].percent).toBe(100);
  });
});

describe("UploadDataStore.startSessionFunc — session error", () => {
  it("marks the failed file, chains the next queued file and finishes with the aggregate error toast", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const fileA = makeUploadFile({
      uniqueId: "err-a",
      file: makeBrowserFile("alpha.docx", 1024),
      toFolderId: 1,
    });
    const fileB = makeUploadFile({
      uniqueId: "err-b",
      file: makeBrowserFile("beta.docx", 2048),
      toFolderId: 1,
    });
    store.files = [fileA, fileB];
    store.uploadedFilesHistory = [{ ...fileA }, { ...fileB }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    vi.mocked(filesApi.startUploadSession).mockRejectedValue(
      new Error("boom"),
    );

    await store.startSessionFunc(0, t);
    await vi.waitFor(() => expect(store.files[1].error).toBe("boom"));
    await vi.waitFor(() =>
      expect(vi.mocked(toastr.error).mock.calls).toHaveLength(1),
    );

    expect(filesApi.startUploadSession).toHaveBeenCalledTimes(2);
    expect(filesApi.startUploadSession).toHaveBeenNthCalledWith(
      1, 1, "alpha.docx", 1024, "", false, undefined, true,
    );
    expect(filesApi.startUploadSession).toHaveBeenNthCalledWith(
      2, 1, "beta.docx", 2048, "", false, undefined, true,
    );

    expect(store.files[0].error).toBe("boom");
    expect(store.files[1].error).toBe("boom");
    expect(store.files[0].isQuotaError).toBe(false);
    expect(store.files[1].isQuotaError).toBe(false);
    expect(store.files.map((f) => f.inAction)).toEqual([true, true]);
    expect(store.uploadedFilesHistory[0].error).toBe("boom");
    expect(store.uploadedFilesHistory[1].error).toBe("boom");
    expect(store.quotaErrorRaised).toBe(false);

    expect(store.currentUploadNumber).toBe(-1);

    expect(
      (
        fakes.primaryProgressDataStore
          .setPrimaryProgressBarData as ReturnType<typeof vi.fn>
      ).mock.calls,
    ).toEqual([
      [
        {
          operation: OPERATIONS_NAME.upload,
          percent: 0,
          completed: false,
          alert: true,
        },
      ],
      [
        {
          operation: OPERATIONS_NAME.upload,
          percent: 0,
          completed: true,
          alert: true,
        },
      ],
      [{ operation: OPERATIONS_NAME.upload, alert: true, errorCount: 2 }],
      [{ operation: OPERATIONS_NAME.upload, completed: true }],
    ]);

    expect(toastr.error).toHaveBeenCalledWith("UploadPanel:UploadingError");
    expect(store.finishUploadFilesCalled).toBe(true);
  });
});

describe("UploadDataStore.startSessionFunc — quota cascade", () => {
  it("marks every pending file in one pass, raises the flag, blocks new sessions and toasts once", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const files = ["q-a", "q-b", "q-c"].map((uniqueId, i) =>
      makeUploadFile({
        uniqueId,
        file: makeBrowserFile(`${uniqueId}.docx`, 1024 * (i + 1)),
        toFolderId: 1,
      }),
    );
    store.files = files;
    store.uploadedFilesHistory = files.map((f) => ({ ...f }));
    store.uploaded = false;
    store.currentUploadNumber = 1;

    const quotaError = {
      response: {
        status: 507,
        data: {
          error: {
            message: "Storage quota exceeded",
            type: "TenantQuotaException",
          },
        },
      },
      message: "Request failed with status code 507",
    };
    vi.mocked(filesApi.startUploadSession).mockRejectedValue(quotaError);

    await store.startSessionFunc(0, t);

    expect(store.quotaErrorRaised).toBe(true);
    expect(vi.mocked(filesApi.startUploadSession).mock.calls).toHaveLength(1);

    expect(store.files.map((f) => f.error)).toEqual([
      "Storage quota exceeded",
      "Storage quota exceeded",
      "Storage quota exceeded",
    ]);
    expect(store.files.map((f) => f.isQuotaError)).toEqual([
      true,
      true,
      true,
    ]);
    expect(store.files.map((f) => f.inAction)).toEqual([true, true, true]);
    store.uploadedFilesHistory.forEach((h) => {
      expect(h.error).toBe("Storage quota exceeded");
      expect(h.isQuotaError).toBe(true);
      expect(h.errorShown).toBe(true);
    });

    expect(store.currentUploadNumber).toBe(0);

    expect(vi.mocked(toastr.error).mock.calls).toHaveLength(1);
    expect(toastr.error).toHaveBeenCalledWith(
      expect.anything(),
      null,
      60000,
      true,
    );

    expect(
      (
        fakes.primaryProgressDataStore
          .setPrimaryProgressBarData as ReturnType<typeof vi.fn>
      ).mock.calls,
    ).toEqual([
      [
        {
          operation: OPERATIONS_NAME.upload,
          percent: 0,
          completed: true,
          alert: true,
        },
      ],
      [{ operation: OPERATIONS_NAME.upload, alert: true, errorCount: 3 }],
      [{ operation: OPERATIONS_NAME.upload, completed: true }],
    ]);
    expect(store.finishUploadFilesCalled).toBe(true);
  });
});

describe("UploadDataStore.parallelUploading — semaphore", () => {
  it("keeps at most maxUploadFilesCount sessions in flight across a 4-file batch", async () => {
    const { store } = createTestUploadDataStore({
      filesSettingsStore: { maxUploadFilesCount: 2 },
    });
    const entries = [0, 1, 2, 3].map((i) =>
      makeUploadFile({
        uniqueId: `p${i}`,
        file: makeBrowserFile(`p${i}.docx`, 1024),
        toFolderId: 1,
      }),
    );
    store.files = entries;
    store.uploadedFilesHistory = entries.map((e) => ({ ...e }));
    store.uploaded = false;
    replaceAction(store, "refreshFiles");

    let inFlight = 0;
    let maxInFlight = 0;
    const sessionResolvers: Array<() => void> = [];
    vi.mocked(filesApi.startUploadSession).mockImplementation(() => {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      const sessionNumber = sessionResolvers.length;
      return new Promise((resolve) => {
        sessionResolvers.push(() =>
          resolve({ id: `sess-${sessionNumber}`, path: [] } as never),
        );
      }) as never;
    });
    vi.mocked(filesApi.uploadChunkParallel).mockResolvedValue({
      uploaded: false,
      id: null,
      file: null,
    } as never);
    vi.mocked(filesApi.finalizeUploadSession).mockImplementation(
      (async (...args: unknown[]) => {
        inFlight -= 1;
        const n = Number(String(args[1]).replace("sess-", ""));
        return {
          uploaded: true,
          id: 900 + n,
          file: makeFileInfo({ id: 900 + n, folderId: 1, version: 1 }),
        };
      }) as never,
    );

    store.parallelUploading([...store.files], t, true);

    expect(vi.mocked(filesApi.startUploadSession).mock.calls).toHaveLength(2);
    expect(store.currentUploadNumber).toBe(2);
    expect(store.files.map((f) => !!f.inAction)).toEqual([
      true,
      true,
      false,
      false,
    ]);

    sessionResolvers[0]();
    await vi.waitFor(() =>
      expect(
        vi.mocked(filesApi.startUploadSession).mock.calls,
      ).toHaveLength(3),
    );
    expect(maxInFlight).toBe(2);

    sessionResolvers[1]();
    await vi.waitFor(() =>
      expect(
        vi.mocked(filesApi.startUploadSession).mock.calls,
      ).toHaveLength(4),
    );

    sessionResolvers[2]();
    sessionResolvers[3]();
    await vi.waitFor(() =>
      expect(store.files.map((f) => f.action)).toEqual([
        "uploaded",
        "uploaded",
        "uploaded",
        "uploaded",
      ]),
    );

    expect(maxInFlight).toBe(2);
    expect(store.files.map((f) => f.fileId)).toEqual([900, 901, 902, 903]);

    expect(store.uploaded).toBe(true);
    expect(vi.mocked(toastr.success).mock.calls).toEqual([
      ["Common:ItemsSuccessfullyUploaded"],
    ]);

    expect(store.currentUploadNumber).toBe(-2);
  });
});
