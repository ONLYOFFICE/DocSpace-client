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

// Characterization tests for the conversion/conflict branching of
// UploadDataStore (#9, #10 and the conversion entry points of the plan's
// §3.4). They pin CURRENT behavior — including oddities marked
// `// characterized quirk:` — and must not be "fixed" alongside store code.
//
// Facade methods (parallelUploading, startUploadFiles, startConversion,
// startConversionFromFiles, handleFilesUpload, ...) are stubbed by property
// ASSIGNMENT, not vi.spyOn: makeAutoObservable installs the actions behind
// non-configurable accessors (spyOn throws), but plain assignment goes
// through MobX's setter and subsequent `this.method()` calls land on the
// assigned vi.fn.

import { describe, it, expect, vi, beforeEach } from "vitest";

// Import ORDER below is load-bearing. The upload harness imports
// UploadDataStore BEFORE the filesStore harness; the filesStore harness then
// re-registers vi.mock factories for the same module ids (socket, toastr,
// i18n, ...), which invalidates the cached mock instances — so a test file
// importing those modules afterwards would receive FRESH mock instances,
// different from the ones UploadDataStore captured, and every
// toHaveBeenCalled assertion would silently see zero calls. Evaluating the
// filesStore harness FIRST makes the upload harness's registrations the last
// ones, so UploadDataStore and this file share the same mock instances.
import "../../filesStore/__tests__/testHarness";
import {
  createTestUploadDataStore,
  makeFileInfo,
  makeUploadFile,
} from "./testHarness";

import * as filesApi from "@docspace/shared/api/files";
import { toastr } from "@docspace/ui-kit/components/toast";
import { OPERATIONS_NAME } from "@docspace/shared/constants";

import type { TTranslation } from "@docspace/shared/types";
import type { TUploadFile } from "../helpers";

const t = ((key: string) => key) as unknown as TTranslation;

/** Minimal-but-complete TStartUploadData-shaped payload (§3.0.7). */
const makeStartUploadData = (
  overrides: Partial<Record<string, unknown>> = {},
) => {
  const files = [makeUploadFile(), makeUploadFile()];
  return {
    files,
    filesSize: 2048,
    uploadedFilesHistory: files.map((f) => ({ ...f })),
    newFilesWithoutConversion: [...files],
    allNewFiles: [...files],
    conversionFiles: [] as TUploadFile[],
    percent: 0,
    ...overrides,
  };
};

beforeEach(() => {
  vi.clearAllMocks();
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.convertUploadedFiles — characterization", () => {
  it("merges tempConversionFiles into files and restarts the upload cycle when idle (uploaded=true)", () => {
    const { store } = createTestUploadDataStore();
    const uploadedFile = makeUploadFile({ action: "uploaded" });
    const conv1 = makeUploadFile({ needConvert: true });
    const conv2 = makeUploadFile({ needConvert: true });

    store.files = [uploadedFile];
    store.tempConversionFiles = [conv1, conv2];
    store.convertFilesSize = 555;
    store.uploadedFiles = 2;
    store.percent = 33;

    const parallelUploading = vi.fn();
    const startUploadFiles = vi.fn().mockResolvedValue(undefined);
    store.parallelUploading = parallelUploading as never;
    store.startUploadFiles = startUploadFiles as never;

    store.convertUploadedFiles(t, false);

    // temp files appended after the existing ones, temp queue drained
    expect(store.files.map((f) => f.uniqueId)).toEqual([
      uploadedFile.uniqueId,
      conv1.uniqueId,
      conv2.uniqueId,
    ]);
    expect(store.tempConversionFiles).toEqual([]);

    // idle branch: reflection-setter applies the new upload data...
    expect(store.uploaded).toBe(false);
    expect(store.filesSize).toBe(555); // <- convertFilesSize
    expect(store.uploadedFiles).toBe(2); // self-assignment, unchanged
    expect(store.percent).toBe(33); // self-assignment, unchanged

    // ...and a fresh upload cycle starts with createNewIfExist forwarded
    expect(startUploadFiles).toHaveBeenCalledTimes(1);
    expect(startUploadFiles).toHaveBeenCalledWith(t, false);
    expect(parallelUploading).not.toHaveBeenCalled();
  });

  it("feeds only not-in-action temp files to parallelUploading when an upload is already running (uploaded=false)", () => {
    const { store } = createTestUploadDataStore();
    const inFlight = makeUploadFile();
    const pending = makeUploadFile({ needConvert: true, inAction: false });
    const alreadyActive = makeUploadFile({ needConvert: true, inAction: true });

    store.uploaded = false;
    store.files = [inFlight];
    store.tempConversionFiles = [pending, alreadyActive];

    const parallelUploading = vi.fn();
    const startUploadFiles = vi.fn().mockResolvedValue(undefined);
    store.parallelUploading = parallelUploading as never;
    store.startUploadFiles = startUploadFiles as never;

    store.convertUploadedFiles(t, false);

    expect(parallelUploading).toHaveBeenCalledTimes(1);
    expect(parallelUploading).toHaveBeenCalledWith(
      [expect.objectContaining({ uniqueId: pending.uniqueId })],
      t,
    );
    // characterized quirk: the running-upload branch drops createNewIfExist —
    // parallelUploading is invoked with exactly two arguments.
    expect(parallelUploading.mock.calls[0]).toHaveLength(2);

    expect(startUploadFiles).not.toHaveBeenCalled();
    expect(store.uploaded).toBe(false);
    expect(store.tempConversionFiles).toEqual([]);
    expect(store.files.map((f) => f.uniqueId)).toEqual([
      inFlight.uniqueId,
      pending.uniqueId,
      alreadyActive.uniqueId,
    ]);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.handleFilesUpload — characterization", () => {
  it("adopts the new history, applies upload data via the reflection setter and starts uploading", () => {
    const { store } = createTestUploadDataStore();
    const data = makeStartUploadData({ filesSize: 4096, percent: 0 });

    const startUploadFiles = vi.fn().mockResolvedValue(undefined);
    store.startUploadFiles = startUploadFiles as never;

    store.handleFilesUpload(data as never, t, false);

    expect(store.uploadedFilesHistory).toEqual(data.uploadedFilesHistory);
    // setUploadData copies every key that exists on the store instance
    expect(store.files).toEqual(data.files);
    expect(store.filesSize).toBe(4096);
    expect(startUploadFiles).toHaveBeenCalledTimes(1);
    expect(startUploadFiles).toHaveBeenCalledWith(t, false);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.handleUploadAndOptionalConversion — characterization", () => {
  it("shows the convert dialog for a conversion-only batch when confirmation is not suppressed", () => {
    const { store, fakes } = createTestUploadDataStore();
    const conversionFile = makeUploadFile({ needConvert: true });
    const data = makeStartUploadData({
      newFilesWithoutConversion: [],
      conversionFiles: [conversionFile],
    });

    store.tempConversionFiles = [conversionFile];
    store.asyncUploadObj = { stale: { chunksArray: [] } } as never;

    const handleFilesUpload = vi.fn();
    const convertUploadedFiles = vi.fn();
    store.handleFilesUpload = handleFilesUpload as never;
    store.convertUploadedFiles = convertUploadedFiles as never;

    store.handleUploadAndOptionalConversion(data as never, t, false);

    // conversion-only: no upload started, stale chunk bookkeeping dropped
    expect(handleFilesUpload).not.toHaveBeenCalled();
    expect(store.asyncUploadObj).toEqual({});
    expect(store.uploadedFilesHistory).toEqual(data.uploadedFilesHistory);

    // hideConfirmConvertSave=false (harness default) -> ask the user
    expect(convertUploadedFiles).not.toHaveBeenCalled();
    expect(fakes.dialogsStore.setConvertDialogVisible).toHaveBeenCalledWith(
      true,
    );
    expect(fakes.dialogsStore.setConvertDialogData).toHaveBeenCalledWith({
      createNewIfExist: false,
      isUploadAction: true,
      files: data.conversionFiles,
    });
  });

  it("converts immediately when hideConfirmConvertSave is enabled", () => {
    const { store, fakes } = createTestUploadDataStore({
      filesSettingsStore: { hideConfirmConvertSave: true },
    });
    const conversionFile = makeUploadFile({ needConvert: true });
    const data = makeStartUploadData({
      newFilesWithoutConversion: [],
      conversionFiles: [conversionFile],
    });

    store.tempConversionFiles = [conversionFile];

    const handleFilesUpload = vi.fn();
    const convertUploadedFiles = vi.fn();
    store.handleFilesUpload = handleFilesUpload as never;
    store.convertUploadedFiles = convertUploadedFiles as never;

    store.handleUploadAndOptionalConversion(data as never, t, true);

    expect(convertUploadedFiles).toHaveBeenCalledTimes(1);
    expect(convertUploadedFiles).toHaveBeenCalledWith(t, true);
    expect(handleFilesUpload).not.toHaveBeenCalled();
    expect(fakes.dialogsStore.setConvertDialogVisible).not.toHaveBeenCalled();
    expect(fakes.dialogsStore.setConvertDialogData).not.toHaveBeenCalled();
  });

  it("delegates straight to handleFilesUpload when nothing needs conversion", () => {
    const { store, fakes } = createTestUploadDataStore();
    const data = makeStartUploadData(); // tempConversionFiles stays []

    const handleFilesUpload = vi.fn();
    store.handleFilesUpload = handleFilesUpload as never;

    store.handleUploadAndOptionalConversion(data as never, t, false);

    // the method forwards a shallow copy of the payload
    expect(handleFilesUpload).toHaveBeenCalledTimes(1);
    expect(handleFilesUpload).toHaveBeenCalledWith(data, t, false);
    expect(fakes.dialogsStore.setConvertDialogVisible).not.toHaveBeenCalled();
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.conflictDialogUploadHandler — characterization", () => {
  it("is a thin wrapper that forwards its arguments verbatim", () => {
    const { store } = createTestUploadDataStore();
    const data = makeStartUploadData();

    const handleUploadAndOptionalConversion = vi.fn();
    store.handleUploadAndOptionalConversion =
      handleUploadAndOptionalConversion as never;

    store.conflictDialogUploadHandler(data as never, t, false);

    expect(handleUploadAndOptionalConversion).toHaveBeenCalledTimes(1);
    expect(handleUploadAndOptionalConversion).toHaveBeenCalledWith(
      data,
      t,
      false,
    );
  });
});

// mutation-checked: inverting the `conflicts.length > 0` condition
// (§3.4.2) turned 3 tests red.
describe("UploadDataStore.handleUploadConflicts — characterization", () => {
  it("opens the conflict-resolve dialog when the server reports existing names", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const data = makeStartUploadData({
      files: [
        makeUploadFile({ toFolderId: 5 }),
        makeUploadFile({ toFolderId: 5 }),
      ],
    });
    const names = (data.files as TUploadFile[]).map((f) => f.file.name);

    // checkIsFileExist resolves an array of conflicting file NAMES
    vi.mocked(filesApi.checkIsFileExist).mockResolvedValue([
      names[0],
    ] as never);
    vi.mocked(filesApi.getFolderInfo).mockResolvedValue({
      title: "Backups",
    } as never);

    const handleUploadAndOptionalConversion = vi.fn();
    store.handleUploadAndOptionalConversion =
      handleUploadAndOptionalConversion as never;

    await store.handleUploadConflicts(t, 5, data as never);

    expect(filesApi.checkIsFileExist).toHaveBeenCalledWith(5, names);
    expect(
      fakes.dialogsStore.setConflictResolveDialogItems,
    ).toHaveBeenCalledWith([{ title: names[0], isFile: true }]);
    expect(
      fakes.dialogsStore.setConflictResolveDialogData,
    ).toHaveBeenCalledWith({
      isUploadConflict: true,
      newUploadData: data,
      folderTitle: "Backups",
    });
    expect(
      fakes.dialogsStore.setConflictResolveDialogVisible,
    ).toHaveBeenCalledWith(true);
    expect(handleUploadAndOptionalConversion).not.toHaveBeenCalled();
  });

  it("starts the upload directly when no conflicts are found", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const data = makeStartUploadData({
      files: [makeUploadFile({ toFolderId: 5 })],
    });

    vi.mocked(filesApi.checkIsFileExist).mockResolvedValue([] as never);
    vi.mocked(filesApi.getFolderInfo).mockResolvedValue({
      title: "Backups",
    } as never);

    const handleUploadAndOptionalConversion = vi.fn();
    store.handleUploadAndOptionalConversion =
      handleUploadAndOptionalConversion as never;

    await store.handleUploadConflicts(t, 5, data as never);

    // characterized quirk: folder info is fetched even when it is only
    // needed for the (not shown) conflict dialog title.
    expect(filesApi.getFolderInfo).toHaveBeenCalledWith(5);
    expect(handleUploadAndOptionalConversion).toHaveBeenCalledTimes(1);
    expect(handleUploadAndOptionalConversion).toHaveBeenCalledWith(
      data,
      t,
      true,
    );
    expect(
      fakes.dialogsStore.setConflictResolveDialogVisible,
    ).not.toHaveBeenCalled();
  });

  it("skips the existence check entirely inside an AI room", async () => {
    const { store } = createTestUploadDataStore({
      selectedFolderStore: { isAIRoom: true },
    });
    const data = makeStartUploadData({
      files: [makeUploadFile({ toFolderId: 5 })],
    });

    // would produce a conflict if it were consulted
    vi.mocked(filesApi.checkIsFileExist).mockResolvedValue([
      "document.docx",
    ] as never);
    vi.mocked(filesApi.getFolderInfo).mockResolvedValue({
      title: "AI room",
    } as never);

    const handleUploadAndOptionalConversion = vi.fn();
    store.handleUploadAndOptionalConversion =
      handleUploadAndOptionalConversion as never;

    await store.handleUploadConflicts(t, 5, data as never);

    expect(filesApi.checkIsFileExist).not.toHaveBeenCalled();
    expect(handleUploadAndOptionalConversion).toHaveBeenCalledWith(
      data,
      t,
      true,
    );
  });

  it("surfaces API failures via toastr and completes the progress bar", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const data = makeStartUploadData({
      files: [makeUploadFile({ toFolderId: 5 })],
    });

    vi.mocked(filesApi.checkIsFileExist).mockRejectedValue({
      response: { data: { error: { message: "boom" } } },
    });
    vi.mocked(filesApi.getFolderInfo).mockResolvedValue({
      title: "Backups",
    } as never);

    const handleUploadAndOptionalConversion = vi.fn();
    store.handleUploadAndOptionalConversion =
      handleUploadAndOptionalConversion as never;

    await store.handleUploadConflicts(t, 5, data as never);

    expect(toastr.error).toHaveBeenCalledWith("boom", null, 0, true);
    // uploaded=true and empty history -> alert + panel dismissal
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      completed: true,
      alert: true,
      showPanel: null,
    });
    expect(handleUploadAndOptionalConversion).not.toHaveBeenCalled();
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.convertFile — characterization", () => {
  it("re-marks the history entry, resets the finished queue and starts a conversion", () => {
    const { store, fakes } = createTestUploadDataStore();
    const historyEntry = makeUploadFile({
      fileId: 42,
      action: "uploaded",
      error: "previous failure",
      errorShown: true,
    });
    store.uploadedFilesHistory = [historyEntry];
    store.convertFilesSize = 777; // converted=true (default) resets it

    const startConversion = vi.fn().mockResolvedValue(undefined);
    store.startConversion = startConversion as never;

    const file = makeUploadFile({ fileId: 42 });
    store.convertFile(file, t);

    expect(fakes.dialogsStore.setConvertItem).toHaveBeenCalledWith(null);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      alert: false,
    });

    // in-place history mutation at the pre-computed index
    expect(store.uploadedFilesHistory[0].action).toBe("convert");
    expect(store.uploadedFilesHistory[0].error).toBeNull();
    expect(store.uploadedFilesHistory[0].errorShown).toBe(false);

    expect(store.convertFilesSize).toBe(0);
    expect(store.filesToConversion).toHaveLength(1);
    expect(store.filesToConversion[0].uniqueId).toBe(file.uniqueId);

    // empty queue -> this call also starts the polling loop
    expect(startConversion).toHaveBeenCalledTimes(1);
    expect(startConversion).toHaveBeenCalledWith(t, undefined);
  });

  it("bails out silently when the file is already converting", () => {
    const { store, fakes } = createTestUploadDataStore();
    store.uploadedFilesHistory = [
      makeUploadFile({ fileId: 42, action: "convert", inConversion: true }),
    ];

    const startConversion = vi.fn().mockResolvedValue(undefined);
    store.startConversion = startConversion as never;

    store.convertFile(makeUploadFile({ fileId: 42 }), t);

    // setConvertItem(null) runs BEFORE the guard, everything else is skipped
    expect(fakes.dialogsStore.setConvertItem).toHaveBeenCalledWith(null);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();
    expect(store.filesToConversion).toHaveLength(0);
    expect(startConversion).not.toHaveBeenCalled();
    expect(store.uploadedFilesHistory[0].action).toBe("convert");
  });

  it("only enqueues when a conversion loop is already draining the queue", () => {
    const { store } = createTestUploadDataStore();
    store.converted = false; // keeps the pre-filled queue from being reset
    store.filesToConversion = [makeUploadFile({ fileId: 1 })];
    store.uploadedFilesHistory = [
      makeUploadFile({ fileId: 42, action: "uploaded" }),
    ];

    const startConversion = vi.fn().mockResolvedValue(undefined);
    store.startConversion = startConversion as never;

    const file = makeUploadFile({ fileId: 42 });
    store.convertFile(file, t);

    expect(store.filesToConversion).toHaveLength(2);
    expect(store.filesToConversion[1].uniqueId).toBe(file.uniqueId);
    expect(startConversion).not.toHaveBeenCalled();
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.convertFileFromFiles — characterization", () => {
  it("queues a fresh file, shows the panelless progress bar and starts the loop", () => {
    const { store, fakes } = createTestUploadDataStore();

    const startConversionFromFiles = vi.fn().mockResolvedValue(undefined);
    store.startConversionFromFiles = startConversionFromFiles as never;

    const file = {
      fileId: 42,
      fileInfo: makeFileInfo({ id: 42 }),
    };
    store.convertFileFromFiles(file as never, t, true);

    expect(fakes.dialogsStore.setConvertItem).toHaveBeenCalledWith(null);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.convert,
      alert: false,
      // characterized quirk: `(!length as unknown) === 0` compares a boolean
      // to a number, so `completed` is ALWAYS false here.
      completed: false,
      showPanel: store.setConversionPanelVisible,
      withoutProgress: true,
    });

    expect(store.activeConversionQueue).toHaveLength(1);
    expect(store.activeConversionQueue[0].fileId).toBe(42);
    expect(store.displayedConversionFiles).toHaveLength(1);
    expect(store.displayedConversionFiles[0].fileId).toBe(42);

    // empty queue before the push -> the loop is started
    expect(startConversionFromFiles).toHaveBeenCalledTimes(1);
    expect(startConversionFromFiles).toHaveBeenCalledWith(t, true);
  });

  it("ignores a repeat request for a file that is already in conversion", () => {
    const { store, fakes } = createTestUploadDataStore();
    store.displayedConversionFiles = [
      {
        fileId: 42,
        fileInfo: makeFileInfo({ id: 42 }),
        inConversion: true,
      } as never,
    ];

    const startConversionFromFiles = vi.fn().mockResolvedValue(undefined);
    store.startConversionFromFiles = startConversionFromFiles as never;

    store.convertFileFromFiles(
      { fileId: 42, fileInfo: makeFileInfo({ id: 42 }) } as never,
      t,
    );

    // setConvertItem(null) still fires before the guard
    expect(fakes.dialogsStore.setConvertItem).toHaveBeenCalledWith(null);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();
    expect(store.activeConversionQueue).toHaveLength(0);
    expect(store.displayedConversionFiles).toHaveLength(1);
    expect(startConversionFromFiles).not.toHaveBeenCalled();
  });

  it("updates the existing displayed entry in place on a second conversion with password", () => {
    const { store } = createTestUploadDataStore();
    store.displayedConversionFiles = [
      {
        fileId: 42,
        fileInfo: makeFileInfo({ id: 42, fileExst: ".xlsx" }),
        inConversion: false,
        action: "converted",
        error: "password required",
        errorShown: true,
      } as never,
    ];

    const startConversionFromFiles = vi.fn().mockResolvedValue(undefined);
    store.startConversionFromFiles = startConversionFromFiles as never;

    store.convertFileFromFiles(
      {
        fileId: 42,
        password: "secret",
        fileInfo: makeFileInfo({ id: 42, fileExst: ".pdf" }),
      } as never,
      t,
    );

    // updated in place, NOT pushed a second time
    expect(store.displayedConversionFiles).toHaveLength(1);
    expect(store.displayedConversionFiles[0].fileInfo?.fileExst).toBe(".pdf");
    expect(store.displayedConversionFiles[0].action).toBe("convert");
    expect(store.displayedConversionFiles[0].error).toBeNull();
    expect(store.displayedConversionFiles[0].errorShown).toBe(false);

    // the active queue still receives the new request object
    expect(store.activeConversionQueue).toHaveLength(1);
    expect(startConversionFromFiles).toHaveBeenCalledTimes(1);
    expect(startConversionFromFiles).toHaveBeenCalledWith(t, undefined);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.setConversionPercent — characterization", () => {
  it("forwards the percent to the progress bar while uploads are settled (uploaded=true)", () => {
    const { store, fakes } = createTestUploadDataStore();

    store.setConversionPercent(37);

    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledTimes(1);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      percent: 37,
      completed: false,
    });
  });

  it("merges the alert flag into the payload when provided", () => {
    const { store, fakes } = createTestUploadDataStore();

    store.setConversionPercent(80, true);

    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      percent: 80,
      completed: false,
      alert: true,
    });
  });

  it("drops the update entirely while an upload is running (uploaded=false)", () => {
    const { store, fakes } = createTestUploadDataStore();
    store.uploaded = false;

    // characterized quirk: conversion percent updates are silently discarded
    // while the uploader owns the progress bar.
    store.setConversionPercent(50);

    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();
  });
});
