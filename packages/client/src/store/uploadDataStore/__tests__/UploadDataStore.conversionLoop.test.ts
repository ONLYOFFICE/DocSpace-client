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

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import "../../filesStore/__tests__/testHarness";

import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeFileInfo,
  makeUploadFile,
} from "./testHarness";

import * as filesApi from "@docspace/shared/api/files";
import { OPERATIONS_NAME } from "@docspace/shared/constants";

import type { TTranslation } from "@docspace/shared/types";
import type UploadDataStore from "../../UploadDataStore";

const t = ((key: string) => key) as unknown as TTranslation;

const replaceAction = (store: UploadDataStore, key: string) => {
  const fn = vi.fn().mockResolvedValue(undefined);
  (store as unknown as Record<string, unknown>)[key] = fn;
  return fn;
};

const conversionItem = (fileId: number) =>
  ({ fileId, password: null, format: null }) as never;

const progressCalls = (
  fakes: ReturnType<typeof createTestUploadDataStore>["fakes"],
) =>
  (
    fakes.primaryProgressDataStore.setPrimaryProgressBarData as ReturnType<
      typeof vi.fn
    >
  ).mock.calls;

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("UploadDataStore.startConversion — entry/exit branches", () => {
  it("bails out silently while a previous conversion cycle is still running (converted=false)", async () => {
    const { store, fakes } = createTestUploadDataStore();
    store.converted = false;
    store.filesToConversion = [conversionItem(42)];

    await store.startConversion(t);

    expect(filesApi.convertFile).not.toHaveBeenCalled();
    expect(progressCalls(fakes)).toEqual([]);
    expect(store.filesToConversion).toHaveLength(1);
  });

  it("with an empty queue completes at 100% and finalizes the batch", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const finishUploadFiles = replaceAction(store, "finishUploadFiles");

    await store.startConversion(t);

    expect(filesApi.convertFile).not.toHaveBeenCalled();
    expect(progressCalls(fakes)).toEqual([
      [{ operation: OPERATIONS_NAME.upload, percent: 0, completed: false }],
      [{ operation: OPERATIONS_NAME.upload, percent: 100, completed: false }],
    ]);
    expect(finishUploadFiles.mock.calls).toEqual([[t, false]]);
    expect(store.converted).toBe(false);
  });

  it("polls until 100%, marks the file converted and refreshes the file list", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const finishUploadFiles = replaceAction(store, "finishUploadFiles");
    const refreshFiles = replaceAction(store, "refreshFiles");

    const entry = makeUploadFile({
      fileId: 42,
      action: "uploaded",
      needConvert: true,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.filesToConversion = [conversionItem(42)];
    store.uploaded = true;

    const converted = makeFileInfo({ id: 43, title: "converted.docx" });
    vi.mocked(filesApi.convertFile).mockResolvedValue([
      { progress: 0, result: null, error: "" },
    ] as never);
    vi.mocked(filesApi.getFileConversationProgress)
      .mockResolvedValueOnce([
        { progress: 50, result: null, error: "" },
      ] as never)
      .mockResolvedValueOnce([
        { progress: 100, result: converted, error: "" },
      ] as never);

    const run = store.startConversion(t);
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.files[0].convertProgress).toBe(50);
    expect(store.files[0].inConversion).toBe(true);
    await vi.advanceTimersByTimeAsync(1000);
    await run;

    expect(vi.mocked(filesApi.convertFile).mock.calls).toEqual([
      [42, null, null],
    ]);
    expect(
      vi.mocked(filesApi.getFileConversationProgress).mock.calls,
    ).toEqual([[42], [42]]);

    expect(store.files[0].action).toBe("converted");
    expect(store.files[0].convertProgress).toBe(100);
    expect(store.files[0].inConversion).toBe(false);
    expect(store.files[0].error).toBe("");
    expect(store.files[0].fileInfo?.id).toBe(43);
    expect(store.uploadedFilesHistory[0].action).toBe("converted");
    expect(store.uploadedFilesHistory[0].fileInfo?.id).toBe(43);

    expect(refreshFiles.mock.calls).toEqual([[store.files[0]]]);

    expect(progressCalls(fakes)).toEqual([
      [{ operation: OPERATIONS_NAME.upload, percent: 0, completed: false }],
      [{ operation: OPERATIONS_NAME.upload, percent: 100, completed: false }],
      [{ operation: OPERATIONS_NAME.upload, percent: 100, completed: false }],
      [{ operation: OPERATIONS_NAME.upload, percent: 100, completed: false }],
      [{ operation: OPERATIONS_NAME.upload, percent: 100, completed: false }],
    ]);
    expect(finishUploadFiles.mock.calls).toEqual([[t, false]]);
  });

  it("a password-protected poll response flags needPassword, alerts and keeps the batch open", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const finishUploadFiles = replaceAction(store, "finishUploadFiles");

    const converting = makeUploadFile({
      fileId: 42,
      action: "uploaded",
      needConvert: true,
    });
    const stillUploading = makeUploadFile({ fileId: null });
    store.files = [converting, stillUploading];
    store.uploadedFilesHistory = [{ ...converting }];
    store.filesToConversion = [conversionItem(42)];
    store.uploaded = false;

    vi.mocked(filesApi.convertFile).mockResolvedValue([
      { progress: 0, result: null, error: "" },
    ] as never);
    vi.mocked(filesApi.getFileConversationProgress).mockResolvedValue([
      { progress: 30, result: "password", error: "Incorrect password" },
    ] as never);

    const run = store.startConversion(t);
    await vi.advanceTimersByTimeAsync(1000);
    await run;

    expect(store.files[0].error).toBe("Incorrect password");
    expect(store.files[0].needPassword).toBe(true);
    expect(store.files[0].inConversion).toBe(false);
    expect(store.uploadedFilesHistory[0].error).toBe("Incorrect password");
    expect(store.uploadedFilesHistory[0].needPassword).toBe(true);

    expect(progressCalls(fakes)).toEqual([
      [{ operation: OPERATIONS_NAME.upload, alert: true }],
    ]);

    expect(finishUploadFiles).not.toHaveBeenCalled();
    expect(store.converted).toBe(true);
    expect(store.filesToConversion).toEqual([]);
    expect(store.conversionPercent).toBe(0);
  });

  it("a poller rejection stamps the message on the file and stops polling that file", async () => {
    const { store } = createTestUploadDataStore();
    replaceAction(store, "finishUploadFiles");

    const entry = makeUploadFile({
      fileId: 42,
      action: "uploaded",
      needConvert: true,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.filesToConversion = [conversionItem(42)];
    store.uploaded = true;

    vi.mocked(filesApi.convertFile).mockResolvedValue([
      { progress: 0, result: null, error: "" },
    ] as never);
    vi.mocked(filesApi.getFileConversationProgress).mockRejectedValue(
      new Error("poller down"),
    );

    const run = store.startConversion(t);
    await vi.advanceTimersByTimeAsync(1000);
    await run;

    expect(store.files[0].error).toBe("poller down");
    expect(store.files[0].inConversion).toBe(false);
    expect(store.uploadedFilesHistory[0].error).toBe("poller down");
    expect(filesApi.getFileConversationProgress).toHaveBeenCalledTimes(1);
  });

  it("a convertFile rejection fails the entry and completes the single-file progress bar", async () => {
    const { store, fakes } = createTestUploadDataStore();
    replaceAction(store, "finishUploadFiles");

    const entry = makeUploadFile({
      fileId: 42,
      action: "uploaded",
      needConvert: true,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.filesToConversion = [conversionItem(42)];
    store.uploaded = true;

    vi.mocked(filesApi.convertFile).mockRejectedValue(new Error("rejected"));

    await store.startConversion(t);

    expect(store.files[0].error).toBe("Common:FailedToConvert");
    expect(store.files[0].inConversion).toBe(false);
    expect(store.uploadedFilesHistory[0].error).toBe("Common:FailedToConvert");
    expect(filesApi.getFileConversationProgress).not.toHaveBeenCalled();

    expect(progressCalls(fakes)).toEqual([
      [{ operation: OPERATIONS_NAME.upload, percent: 0, completed: false }],
      [
        {
          operation: OPERATIONS_NAME.upload,
          alert: true,
          percent: 100,
          completed: true,
        },
      ],
      [{ operation: OPERATIONS_NAME.upload, percent: 100, completed: false }],
    ]);
  });
});

describe("UploadDataStore.startConversionFromFiles — entry/exit branches", () => {
  it("stops at the first queued file that is no longer displayed and still finalizes the panel state", async () => {
    const { store, fakes } = createTestUploadDataStore();
    store.activeConversionQueue = [conversionItem(42)];
    store.displayedConversionFiles = [];

    await store.startConversionFromFiles(t);

    expect(filesApi.convertFile).not.toHaveBeenCalled();
    expect(progressCalls(fakes)).toEqual([
      [{ operation: OPERATIONS_NAME.convert, completed: true }],
    ]);
    expect(store.convertedFromFiles).toBe(true);
    expect(store.activeConversionQueue).toEqual([]);
  });

  it("polls the displayed entry to 100% and marks it converted in place", async () => {
    const { store, fakes } = createTestUploadDataStore();

    const displayed = makeUploadFile({ fileId: 42, action: "convert" });
    store.displayedConversionFiles = [displayed];
    store.activeConversionQueue = [conversionItem(42)];

    const converted = makeFileInfo({ id: 43, title: "converted.docx" });
    vi.mocked(filesApi.convertFile).mockResolvedValue([
      { progress: 0, result: null, error: "" },
    ] as never);
    vi.mocked(filesApi.getFileConversationProgress)
      .mockResolvedValueOnce([
        { progress: 60, result: null, error: "" },
      ] as never)
      .mockResolvedValueOnce([
        { progress: 100, result: converted, error: "" },
      ] as never);

    const run = store.startConversionFromFiles(t);
    await vi.advanceTimersByTimeAsync(1000);
    expect(store.displayedConversionFiles[0].convertProgress).toBe(60);
    expect(store.displayedConversionFiles[0].inConversion).toBe(true);
    await vi.advanceTimersByTimeAsync(1000);
    await run;

    const row = store.displayedConversionFiles[0];
    expect(row.action).toBe("converted");
    expect(row.convertProgress).toBe(100);
    expect(row.inConversion).toBe(false);
    expect(row.error).toBe("");
    expect(row.fileInfo?.id).toBe(43);

    expect(progressCalls(fakes)).toEqual([
      [{ operation: OPERATIONS_NAME.convert, completed: true }],
    ]);
    expect(store.convertedFromFiles).toBe(true);
    expect(store.activeConversionQueue).toEqual([]);
  });

  it("an error reported by the poller alerts, releases the row and skips the converted transition", async () => {
    const { store, fakes } = createTestUploadDataStore();

    const displayed = makeUploadFile({ fileId: 42, action: "convert" });
    store.displayedConversionFiles = [displayed];
    store.activeConversionQueue = [conversionItem(42)];

    vi.mocked(filesApi.convertFile).mockResolvedValue([
      { progress: 0, result: null, error: "" },
    ] as never);
    vi.mocked(filesApi.getFileConversationProgress).mockResolvedValue([
      { progress: 30, result: null, error: "Broken document" },
    ] as never);

    const run = store.startConversionFromFiles(t);
    await vi.advanceTimersByTimeAsync(1000);
    await run;

    const row = store.displayedConversionFiles[0];
    expect(row.error).toBe("Broken document");
    expect(row.inConversion).toBe(false);
    expect(row.needPassword).toBe(false);
    expect(row.action).toBe("convert");

    expect(progressCalls(fakes)).toEqual([
      [{ operation: OPERATIONS_NAME.convert, alert: true }],
      [{ operation: OPERATIONS_NAME.convert, completed: true }],
    ]);
    expect(store.activeConversionQueue).toEqual([]);
  });

  it("a convertFile rejection stamps the generic error without raising the panel alert", async () => {
    const { store, fakes } = createTestUploadDataStore();

    const displayed = makeUploadFile({ fileId: 42, action: "convert" });
    store.displayedConversionFiles = [displayed];
    store.activeConversionQueue = [conversionItem(42)];

    vi.mocked(filesApi.convertFile).mockRejectedValue(new Error("rejected"));

    await store.startConversionFromFiles(t);

    expect(store.displayedConversionFiles[0].error).toBe(
      "Common:FailedToConvert",
    );
    expect(filesApi.getFileConversationProgress).not.toHaveBeenCalled();

    expect(progressCalls(fakes)).toEqual([
      [{ operation: OPERATIONS_NAME.convert, completed: true }],
    ]);
  });
});
