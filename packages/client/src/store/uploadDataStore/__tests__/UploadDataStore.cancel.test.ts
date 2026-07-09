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

// ---------------------------------------------------------------------------
// Characterization tests for the cancellation family of UploadDataStore
// actions (Phase 0, §3.4 item #3 of uploadDataStore/REFACTORING_PLAN.md):
// cancelUpload, cancelCurrentUpload, cancelUploadAction,
// cancelCurrentFileConversion, cancelConversion (+ clearConversionData).
// They freeze CURRENT behavior, including the quirks called out inline.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeEach, vi } from "vitest";

import { OPERATIONS_NAME } from "@docspace/shared/constants";
import type { TTranslation } from "@docspace/shared/types";

// Import order below is load-bearing. Both harnesses register vi.mock
// factories for @docspace/ui-kit/components/toast, and every re-registration
// makes the NEXT import of the module create a fresh mock instance.
// Evaluating the filesStore harness first means the upload harness's
// re-registration lands right before UploadDataStore's own import, so the
// toastr imported at the bottom is the very instance the store calls.
import "../../filesStore/__tests__/testHarness";
import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeUploadFile,
} from "./testHarness";
import { toastr } from "@docspace/ui-kit/components/toast";

const t = ((key: string) => key) as unknown as TTranslation;

/** Narrow a fake-store member back to the vi.fn() the harness installed. */
const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

/**
 * Replace a store method with a vi.fn(). vi.spyOn cannot patch these:
 * makeAutoObservable stores arrow-method fields behind observable accessors
 * whose descriptor sampling throws in tinyspy. A plain assignment goes
 * through the MobX setter and swaps the stored function instead.
 */
const stubStoreMethod = <T, K extends keyof T>(target: T, key: K) => {
  const fn = vi.fn();
  target[key] = fn as unknown as T[K];
  return fn;
};

beforeEach(() => {
  vi.clearAllMocks();
  // cancelUpload reads window.i18n.t directly — reinstall per test.
  installWindowGlobals();
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.cancelUpload", () => {
  it("cancels pending files, prunes history/conversion queues, and resets aggregates", () => {
    const { store } = createTestUploadDataStore();

    store.files = [
      makeUploadFile({ uniqueId: "done", action: "uploaded", percent: 100 }),
      makeUploadFile({ uniqueId: "pending", action: "upload" }),
      makeUploadFile({
        uniqueId: "convert-queued",
        action: "convert",
        inConversion: false,
      }),
      makeUploadFile({
        uniqueId: "convert-active",
        action: "convert",
        inConversion: true,
      }),
    ];
    // Capture the observable proxies so identity survival can be asserted.
    const filesBefore = store.files.slice();

    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "done", action: "uploaded", percent: 100 }),
      makeUploadFile({ uniqueId: "pending", action: "upload" }),
      makeUploadFile({
        uniqueId: "failed",
        action: "upload",
        error: "Server error",
      }),
      makeUploadFile({
        uniqueId: "convert-failed",
        action: "convert",
        error: "Conversion error",
      }),
      makeUploadFile({
        uniqueId: "convert-active",
        action: "convert",
        inConversion: true,
      }),
      makeUploadFile({
        uniqueId: "convert-queued",
        action: "convert",
        inConversion: false,
      }),
    ];
    store.filesToConversion = [
      makeUploadFile({ uniqueId: "convert-active", inConversion: true }),
      makeUploadFile({ uniqueId: "convert-queued", inConversion: false }),
    ];
    store.filesSize = 4096;
    store.uploadedFiles = 1;
    store.percent = 37;
    store.uploaded = false;
    store.converted = false;
    store.currentUploadNumber = 2;
    store.quotaErrorRaised = true;
    store.finishUploadFilesCalled = true;

    store.cancelUpload();

    // Pending upload + not-yet-started conversion get cancelled copies;
    // finished and in-flight-conversion entries survive untouched.
    expect(
      store.files.map((f) => ({ uniqueId: f.uniqueId, cancel: f.cancel })),
    ).toEqual([
      { uniqueId: "done", cancel: false },
      { uniqueId: "pending", cancel: true },
      { uniqueId: "convert-queued", cancel: true },
      { uniqueId: "convert-active", cancel: false },
    ]);
    expect(store.files[0]).toBe(filesBefore[0]);
    expect(store.files[3]).toBe(filesBefore[3]);
    expect(store.files[1]).not.toBe(filesBefore[1]);

    // History keeps finished entries, errored entries (upload AND convert)
    // and in-flight conversions; pending entries are dropped.
    expect(store.uploadedFilesHistory.map((f) => f.uniqueId)).toEqual([
      "done",
      "failed",
      "convert-failed",
      "convert-active",
    ]);
    // Only in-flight conversions stay queued.
    expect(store.filesToConversion.map((f) => f.uniqueId)).toEqual([
      "convert-active",
    ]);

    expect(store.percent).toBe(100);
    expect(store.uploaded).toBe(true);
    expect(store.converted).toBe(true);
    expect(store.currentUploadNumber).toBe(0);
    expect(store.quotaErrorRaised).toBe(false);
    expect(store.finishUploadFilesCalled).toBe(false);
    // filesSize/uploadedFiles round-trip through setUploadData unchanged.
    expect(store.filesSize).toBe(4096);
    expect(store.uploadedFiles).toBe(1);
  });

  it("announces cancellation via the progress bar, then a toast", () => {
    const { store, fakes } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "upload" })];

    store.cancelUpload();

    const progressMock = asMock(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    );
    expect(progressMock).toHaveBeenCalledTimes(1);
    // The label goes through window.i18n.t (echo mock returns the outer
    // key, interpolation options are dropped).
    expect(progressMock).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      completed: true,
      canceled: true,
      alert: true,
      label: "Common:CanceledOperation",
    });

    expect(toastr.info).toHaveBeenCalledTimes(1);
    expect(toastr.info).toHaveBeenCalledWith("Common:CancelUpload");

    // Order is part of the contract: progress bar first, toast second.
    expect(progressMock.mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(toastr.info).mock.invocationCallOrder[0],
    );
  });
});

// mutation-checked: deleting the `currentUploadNumber -= 1` decrement
// (§3.4.2) turned the semaphore asserts red (2 tests, run 2026-07-09).
describe("UploadDataStore.cancelCurrentUpload", () => {
  it("marks the file, decrements the semaphore by exactly 1, and starts the next pending file", () => {
    const { store } = createTestUploadDataStore();
    const startSessionSpy = stubStoreMethod(store, "startSessionFunc");

    store.files = [
      makeUploadFile({
        uniqueId: "u1",
        action: "upload",
        inAction: true,
        percent: 50,
      }),
      makeUploadFile({ uniqueId: "u2", action: "upload", inAction: false }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "u1", percent: 50 }),
      makeUploadFile({ uniqueId: "u2", percent: 0 }),
    ];
    store.currentUploadNumber = 2;

    store.cancelCurrentUpload("u1", t);

    const canceled = store.files[0];
    expect(canceled.cancel).toBe(true);
    expect(canceled.percent).toBe(100);
    expect(canceled.action).toBe("uploaded");

    // §3.4.1 "cancellation must not orphan the queue": exactly one
    // decrement, and the next not-in-action file is (re)started.
    expect(store.currentUploadNumber).toBe(1);
    expect(startSessionSpy).toHaveBeenCalledTimes(1);
    expect(startSessionSpy).toHaveBeenCalledWith(1, t);

    expect(store.uploadedFilesHistory.map((f) => f.uniqueId)).toEqual(["u2"]);
    // characterized quirk: the percent is derived from the history array
    // BEFORE the canceled entry is removed from it — (50 + 0) / 200 * 100.
    expect(store.percent).toBe(25);
  });

  it("does not start another session when every file is already in action", () => {
    const { store } = createTestUploadDataStore();
    const startSessionSpy = stubStoreMethod(store, "startSessionFunc");

    store.files = [
      makeUploadFile({
        uniqueId: "u1",
        action: "upload",
        inAction: true,
        percent: 80,
      }),
      makeUploadFile({
        uniqueId: "u2",
        action: "upload",
        inAction: true,
        percent: 20,
      }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "u1", percent: 80 }),
      makeUploadFile({ uniqueId: "u2", percent: 20 }),
    ];
    store.currentUploadNumber = 2;

    store.cancelCurrentUpload("u1", t);

    expect(store.currentUploadNumber).toBe(1);
    expect(startSessionSpy).not.toHaveBeenCalled();
    expect(store.uploadedFilesHistory.map((f) => f.uniqueId)).toEqual(["u2"]);
    // Pre-filter history again: (80 + 20) / 200 * 100.
    expect(store.percent).toBe(50);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.cancelUploadAction", () => {
  it("removes explicitly passed items from files, history and temp conversion queue", () => {
    const { store, fakes } = createTestUploadDataStore();

    store.files = [
      makeUploadFile({ uniqueId: "u1" }),
      makeUploadFile({ uniqueId: "u2" }),
      makeUploadFile({ uniqueId: "u3" }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "u1" }),
      makeUploadFile({ uniqueId: "u2" }),
    ];
    store.tempConversionFiles = [makeUploadFile({ uniqueId: "u1" })];
    store.uploaded = true;

    store.cancelUploadAction([{ uniqueId: "u1" }]);

    expect(store.files.map((f) => f.uniqueId)).toEqual(["u2", "u3"]);
    expect(store.uploadedFilesHistory.map((f) => f.uniqueId)).toEqual(["u2"]);
    expect(store.tempConversionFiles).toEqual([]);

    // History still has entries → status stays, no showPanel key is added.
    const progressMock = asMock(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    );
    expect(progressMock).toHaveBeenCalledTimes(1);
    expect(progressMock).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      completed: true,
      withoutStatus: false,
    });
  });

  it("falls back to the conflict dialog's allNewFiles and hides the status when history empties", () => {
    const { store, fakes } = createTestUploadDataStore({
      dialogsStore: {
        conflictResolveDialogData: {
          newUploadData: {
            allNewFiles: [{ uniqueId: "u1" }, { uniqueId: "u2" }],
          },
        },
      },
    });

    store.files = [
      makeUploadFile({ uniqueId: "u1" }),
      makeUploadFile({ uniqueId: "u2" }),
    ];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "u1" }),
      makeUploadFile({ uniqueId: "u2" }),
    ];
    store.tempConversionFiles = [makeUploadFile({ uniqueId: "u2" })];

    store.cancelUploadAction();

    expect(store.files).toEqual([]);
    expect(store.uploadedFilesHistory).toEqual([]);
    expect(store.tempConversionFiles).toEqual([]);

    const progressMock = asMock(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    );
    expect(progressMock).toHaveBeenCalledTimes(1);
    expect(progressMock).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      completed: true,
      withoutStatus: true,
      showPanel: null,
    });
  });

  it("skips the progress-bar update while an upload is still running", () => {
    const { store, fakes } = createTestUploadDataStore();

    store.files = [
      makeUploadFile({ uniqueId: "u1" }),
      makeUploadFile({ uniqueId: "u2" }),
    ];
    store.uploadedFilesHistory = [makeUploadFile({ uniqueId: "u1" })];
    store.uploaded = false;

    store.cancelUploadAction([{ uniqueId: "u1" }]);

    expect(store.files.map((f) => f.uniqueId)).toEqual(["u2"]);
    expect(store.uploadedFilesHistory).toEqual([]);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.cancelCurrentFileConversion", () => {
  it("clears the convert dialog item and drops the file from both queues", () => {
    const { store, fakes } = createTestUploadDataStore({
      dialogsStore: { convertItem: { fileId: 42 } },
    });

    store.files = [
      makeUploadFile({ uniqueId: "c1", fileId: 42 }),
      makeUploadFile({ uniqueId: "c2", fileId: 43 }),
    ];
    store.filesToConversion = [
      makeUploadFile({ uniqueId: "c1", fileId: 42 }),
      makeUploadFile({ uniqueId: "c2", fileId: 43 }),
    ];
    store.filesSize = 2048;
    store.uploadedFiles = 1;
    store.percent = 60;

    // The panel passes the id as a string; matching is by `${fileId}`.
    store.cancelCurrentFileConversion("42");

    expect(fakes.dialogsStore.setConvertItem).toHaveBeenCalledTimes(1);
    expect(fakes.dialogsStore.setConvertItem).toHaveBeenCalledWith(null);

    expect(store.files.map((f) => f.fileId)).toEqual([43]);
    expect(store.filesToConversion.map((f) => f.fileId)).toEqual([43]);
    // Aggregates round-trip through setUploadData unchanged.
    expect(store.filesSize).toBe(2048);
    expect(store.uploadedFiles).toBe(1);
    expect(store.percent).toBe(60);
  });

  it("leaves the convert dialog untouched when no item is set", () => {
    const { store, fakes } = createTestUploadDataStore();

    store.files = [makeUploadFile({ uniqueId: "c1", fileId: 42 })];
    store.filesToConversion = [makeUploadFile({ uniqueId: "c1", fileId: 42 })];

    store.cancelCurrentFileConversion("42");

    expect(fakes.dialogsStore.setConvertItem).not.toHaveBeenCalled();
    expect(store.files).toEqual([]);
    expect(store.filesToConversion).toEqual([]);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.cancelConversion + clearConversionData", () => {
  it("keeps converted/failed/in-flight entries and finishes the progress state", () => {
    const { store } = createTestUploadDataStore();

    store.files = [
      makeUploadFile({ uniqueId: "kept-converted", action: "converted" }),
      makeUploadFile({
        uniqueId: "kept-error",
        action: "convert",
        error: "Conversion error",
      }),
      makeUploadFile({
        uniqueId: "kept-active",
        action: "convert",
        inConversion: true,
      }),
      makeUploadFile({
        uniqueId: "dropped-convert",
        action: "convert",
        inConversion: false,
      }),
      // characterized quirk: a pending plain upload (no error, not
      // converting) is dropped by cancelConversion as well.
      makeUploadFile({ uniqueId: "dropped-upload", action: "upload" }),
    ];
    store.filesToConversion = [makeUploadFile({ uniqueId: "dropped-convert" })];
    store.uploadPanelVisible = true;
    store.filesSize = 512;
    store.uploadedFiles = 2;
    store.percent = 10;
    store.uploaded = false;
    store.converted = false;

    store.cancelConversion();

    expect(store.files.map((f) => f.uniqueId)).toEqual([
      "kept-converted",
      "kept-error",
      "kept-active",
    ]);
    expect(store.filesToConversion).toEqual([]);
    expect(store.percent).toBe(100);
    expect(store.uploaded).toBe(true);
    expect(store.converted).toBe(true);
    expect(store.filesSize).toBe(512);
    expect(store.uploadedFiles).toBe(2);
    // Survivors remain → the panel stays open.
    expect(store.uploadPanelVisible).toBe(true);
  });

  it("hides the upload panel when nothing survives the cancellation", () => {
    const { store } = createTestUploadDataStore();

    store.files = [
      makeUploadFile({ action: "convert", inConversion: false }),
      makeUploadFile({ action: "upload" }),
    ];
    store.uploadPanelVisible = true;

    store.cancelConversion();

    expect(store.files).toEqual([]);
    expect(store.uploadPanelVisible).toBe(false);
  });

  it("clearConversionData resets the from-files conversion state after cancelConversion", () => {
    const { store } = createTestUploadDataStore();

    store.files = [makeUploadFile({ action: "convert", inConversion: false })];
    store.filesToConversion = [makeUploadFile()];
    store.displayedConversionFiles = [makeUploadFile({ fileId: 7 })];
    store.activeConversionQueue = [makeUploadFile({ fileId: 7 })];
    store.convertedFromFiles = false;

    store.cancelConversion();
    store.clearConversionData();

    // cancelConversion emptied the upload-side queues...
    expect(store.files).toEqual([]);
    expect(store.filesToConversion).toEqual([]);
    // ...clearConversionData empties the from-files conversion state.
    expect(store.displayedConversionFiles).toEqual([]);
    expect(store.activeConversionQueue).toEqual([]);
    expect(store.convertedFromFiles).toBe(true);
  });
});
