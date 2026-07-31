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
  makeFileInfo,
  makeUploadFile,
} from "./testHarness";
// eslint-disable-next-line import/order
import * as filesApi from "@docspace/shared/api/files";
import type { TTranslation } from "@docspace/shared/types";

import {
  cancelConversionImpl,
  cancelCurrentFileConversionImpl,
  convertFileFromFilesImpl,
  convertFileImpl,
  convertUploadedFilesImpl,
  retryConvertFilesImpl,
  setConversionPercentImpl,
  startConversionFromFilesImpl,
  startConversionImpl,
} from "../conversion.helpers";

const t = ((key: string) => key) as unknown as TTranslation;

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("setConversionPercentImpl", () => {
  it("forwards the percent to the primary bar while uploads are settled", () => {
    const { store, fakes } = createTestUploadDataStore();

    setConversionPercentImpl(store, 37);

    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: "upload",
      percent: 37,
      completed: false,
    });
  });

  it("merges alert and drops the update entirely while an upload runs", () => {
    const { store, fakes } = createTestUploadDataStore();

    setConversionPercentImpl(store, 80, true);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenLastCalledWith({
      operation: "upload",
      percent: 80,
      completed: false,
      alert: true,
    });

    store.uploaded = false;
    setConversionPercentImpl(store, 50);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledTimes(1);
  });
});

describe("convertFileFromFilesImpl", () => {
  it("queues a fresh file and starts the loop on the first conversion", () => {
    const { store } = createTestUploadDataStore();
    const startSpy = vi.fn().mockResolvedValue(undefined);
    store.startConversionFromFiles = startSpy as never;

    convertFileFromFilesImpl(
      store,
      { fileId: 42, fileInfo: makeFileInfo({ id: 42 }) } as never,
      t,
      true,
    );

    expect(store.activeConversionQueue.map((f) => f.fileId)).toEqual([42]);
    expect(store.displayedConversionFiles.map((f) => f.fileId)).toEqual([42]);
    expect(startSpy).toHaveBeenCalledWith(t, true);
  });

  it("ignores a repeat request for a file already in conversion", () => {
    const { store } = createTestUploadDataStore();
    store.displayedConversionFiles = [
      { fileId: 42, fileInfo: makeFileInfo({ id: 42 }), inConversion: true },
    ] as never;
    const startSpy = vi.fn().mockResolvedValue(undefined);
    store.startConversionFromFiles = startSpy as never;

    convertFileFromFilesImpl(
      store,
      { fileId: 42, fileInfo: makeFileInfo({ id: 42 }) } as never,
      t,
    );

    expect(store.activeConversionQueue).toHaveLength(0);
    expect(startSpy).not.toHaveBeenCalled();
  });
});

describe("startConversionFromFilesImpl", () => {
  it("marks the displayed row converted at once and finalizes the queue", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const row = {
      fileId: 42,
      fileInfo: makeFileInfo({ id: 42, version: 1 }),
      inConversion: false,
    };
    store.displayedConversionFiles = [row] as never;
    store.activeConversionQueue = [{ fileId: 42, format: ".docx" }] as never;

    vi.mocked(filesApi.convertFile).mockResolvedValue([
      { progress: 100, error: "" },
    ] as never);

    await startConversionFromFilesImpl(store, t, false);

    const converted = store.displayedConversionFiles[0] as {
      inConversion?: boolean;
      action?: string;
    };
    expect(converted.inConversion).toBe(false);
    expect(converted.action).toBe("converted");
    expect(store.convertedFromFiles).toBe(true);
    expect(store.activeConversionQueue).toEqual([]);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenLastCalledWith({ operation: "convert", completed: true });
  });
});

describe("retryConvertFilesImpl", () => {
  it("clears inConversion and re-queues the row via convertFileFromFiles", () => {
    const { store } = createTestUploadDataStore();
    const row = {
      fileId: 42,
      fileInfo: makeFileInfo({ id: 42 }),
      inConversion: true,
    };
    store.files = [makeUploadFile({ fileId: 42, inConversion: true })];
    store.displayedConversionFiles = [row] as never;
    const convertSpy = vi.fn();
    store.convertFileFromFiles = convertSpy as never;

    retryConvertFilesImpl(store, t, 42);

    const liveRow = store.displayedConversionFiles[0];
    expect(store.files[0].inConversion).toBe(false);
    expect(liveRow.inConversion).toBe(false);
    expect(convertSpy).toHaveBeenCalledWith(liveRow, t);
  });

  it("is a no-op when the file is not in the displayed conversion list", () => {
    const { store } = createTestUploadDataStore();
    store.displayedConversionFiles = [] as never;
    const convertSpy = vi.fn();
    store.convertFileFromFiles = convertSpy as never;

    retryConvertFilesImpl(store, t, 999);

    expect(convertSpy).not.toHaveBeenCalled();
  });
});

describe("cancelConversionImpl", () => {
  it("keeps converted/failed/in-flight files, drops the rest and finalizes", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ uniqueId: "keep", action: "converted" }),
      makeUploadFile({ uniqueId: "drop", action: "upload" }),
    ];
    store.filesSize = 512;
    store.uploadPanelVisible = true;

    cancelConversionImpl(store);

    expect(store.files.map((f) => f.uniqueId)).toEqual(["keep"]);
    expect(store.filesToConversion).toEqual([]);
    expect(store.uploaded).toBe(true);
    expect(store.converted).toBe(true);
    expect(store.percent).toBe(100);
    expect(store.filesSize).toBe(512);
    expect(store.uploadPanelVisible).toBe(true);
  });

  it("hides the panel when nothing survives", () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "upload" })];
    store.uploadPanelVisible = true;

    cancelConversionImpl(store);

    expect(store.files).toEqual([]);
    expect(store.uploadPanelVisible).toBe(false);
  });
});

describe("cancelCurrentFileConversionImpl", () => {
  it("drops the file and its queue entry by stringified fileId", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ fileId: 42 }),
      makeUploadFile({ fileId: 7 }),
    ];
    store.filesToConversion = [makeUploadFile({ fileId: 42 })];

    cancelCurrentFileConversionImpl(store, "42");

    expect(store.files.map((f) => f.fileId)).toEqual([7]);
    expect(store.filesToConversion).toEqual([]);
  });
});

describe("convertFileImpl", () => {
  it("flags the history row for conversion and starts the loop on the first file", () => {
    const { store } = createTestUploadDataStore();
    store.uploadedFilesHistory = [
      makeUploadFile({ fileId: 42, action: "uploaded" }),
    ];
    store.converted = true;
    const startSpy = vi.fn().mockResolvedValue(undefined);
    store.startConversion = startSpy as never;

    convertFileImpl(store, makeUploadFile({ fileId: 42 }), t, true);

    expect(store.uploadedFilesHistory[0].action).toBe("convert");
    expect(store.filesToConversion).toHaveLength(1);
    expect(startSpy).toHaveBeenCalledWith(t, true);
  });
});

describe("startConversionImpl", () => {
  it("converts a queued file at once and finishes the upload batch", async () => {
    const { store } = createTestUploadDataStore();
    store.converted = true;
    store.uploaded = true;
    store.files = [makeUploadFile({ fileId: 42, needConvert: true })];
    store.uploadedFilesHistory = [makeUploadFile({ fileId: 42 })];
    store.filesToConversion = [{ fileId: 42, format: ".docx" }] as never;

    vi.mocked(filesApi.convertFile).mockResolvedValue([
      { progress: 100, error: "" },
    ] as never);
    const finishSpy = vi.fn();
    store.finishUploadFiles = finishSpy as never;

    await startConversionImpl(store, t, false);

    expect(store.files[0].action).toBe("converted");
    expect(store.files[0].inConversion).toBe(false);
    expect(finishSpy).toHaveBeenCalledWith(t, false);
  });

  it("bails out immediately when a conversion cycle is already running", async () => {
    const { store } = createTestUploadDataStore();
    store.converted = false;
    store.filesToConversion = [{ fileId: 42, format: ".docx" }] as never;

    await startConversionImpl(store, t, false);

    expect(filesApi.convertFile).not.toHaveBeenCalled();
  });
});

describe("convertUploadedFilesImpl", () => {
  it("merges temp files and re-primes the uploader when already uploaded", () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ uniqueId: "a" })];
    store.tempConversionFiles = [makeUploadFile({ uniqueId: "b" })];
    store.uploaded = true;
    store.convertFilesSize = 999;
    const startUploadSpy = vi.fn();
    store.startUploadFiles = startUploadSpy as never;

    convertUploadedFilesImpl(store, t, true);

    expect(store.files.map((f) => f.uniqueId)).toEqual(["a", "b"]);
    expect(store.tempConversionFiles).toEqual([]);
    expect(store.filesSize).toBe(999);
    expect(store.uploaded).toBe(false);
    expect(startUploadSpy).toHaveBeenCalledWith(t, true);
  });
});
