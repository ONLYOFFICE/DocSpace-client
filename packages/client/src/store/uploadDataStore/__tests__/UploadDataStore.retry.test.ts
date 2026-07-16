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
import type { TTranslation } from "@docspace/shared/types";

import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeUploadFile,
} from "./testHarness";

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
  it("re-queues a failed upload: resets error state on file and history, restarts uploading", () => {
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

    store.retryUploadFiles(t, "u1");

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

  it("routes a failed conversion retry through convertFile and leaves upload state alone", () => {
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

    store.retryUploadFiles(t, "c1");

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

  it("skips the progress-bar reset when an upload batch is still running", () => {
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

    store.retryUploadFiles(t, "u1");

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
  it("resets every quota-failed file in one pass and re-uploads exactly that set", () => {
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

    store.retryQuotaFailedFiles(t);

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

  it("does nothing when no file failed with a quota error", () => {
    const { store, fakes } = createTestUploadDataStore();
    const parallelSpy = stubStoreMethod(store, "parallelUploading");

    store.files = [
      makeUploadFile({ uniqueId: "ok", action: "uploaded", percent: 100 }),
    ];
    store.quotaErrorRaised = true;

    store.retryQuotaFailedFiles(t);

    expect(store.quotaErrorRaised).toBe(true);
    expect(parallelSpy).not.toHaveBeenCalled();
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();
  });

  it("resets a quota-failed file with no history entry and skips progress while uploading", () => {
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

    store.retryQuotaFailedFiles(t);

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
