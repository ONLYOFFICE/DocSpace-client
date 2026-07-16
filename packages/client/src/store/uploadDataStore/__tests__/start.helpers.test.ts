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
  makeUploadFile,
} from "./testHarness";
import type { TTranslation } from "@docspace/shared/types";

import {
  cancelUploadActionImpl,
  cancelUploadImpl,
  handleFilesUploadImpl,
  retryQuotaFailedFilesImpl,
  retryUploadFilesImpl,
  setConflictDialogDataImpl,
} from "../start.helpers";

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

describe("retryUploadFilesImpl", () => {
  it("resets an errored upload row, clears the quota flag and re-primes the pool", () => {
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

    retryUploadFilesImpl(store, t, "x");

    expect(store.files[0].action).toBe("upload");
    expect(store.files[0].error).toBe("");
    expect(store.files[0].isQuotaError).toBe(false);
    expect(store.quotaErrorRaised).toBe(false);
    expect(parallelUploading).toHaveBeenCalledTimes(1);
  });

  it("delegates a failed conversion retry to convertFile", () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ uniqueId: "c", action: "convert" })];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "c", action: "convert" }),
    ];
    const convertFile = vi.fn();
    store.convertFile = convertFile as never;

    retryUploadFilesImpl(store, t, "c");

    expect(convertFile).toHaveBeenCalledTimes(1);
  });
});

describe("retryQuotaFailedFilesImpl", () => {
  it("resets only quota-failed rows and re-primes the pool", () => {
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

    retryQuotaFailedFilesImpl(store, t);

    expect(store.files[0].isQuotaError).toBe(false);
    expect(store.files[0].action).toBe("upload");
    expect(store.quotaErrorRaised).toBe(false);
    expect(parallelUploading).toHaveBeenCalledTimes(1);
  });

  it("is a no-op when no file has a quota error", () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "upload" })];
    const parallelUploading = vi.fn();
    store.parallelUploading = parallelUploading as never;

    retryQuotaFailedFilesImpl(store, t);

    expect(parallelUploading).not.toHaveBeenCalled();
  });
});
