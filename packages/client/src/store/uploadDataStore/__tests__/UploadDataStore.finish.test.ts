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

// Characterization tests for the upload finalization block (#14 of the
// plan's §3.4): finishUploadFiles + showFinishUploadToastr. They close the
// §3.4.1 "finalization latch" invariant AT ITS ACTUAL LEVEL: the
// finishUploadFilesCalled latch lives at the call sites (checkChunkUpload's
// all-files-uploaded branches, ~2485/~2667), NOT inside finishUploadFiles —
// the method itself is deliberately characterized as unguarded below.
//
// releaseUploadAutoLockSuspension stays REAL: without a prior acquire it is
// a no-op (uploadDataStore/helpers.ts), so no mock is needed.

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";

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
import { createTestUploadDataStore, makeUploadFile } from "./testHarness";

import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";
import { toastr } from "@docspace/ui-kit/components/toast";
import { OPERATIONS_NAME } from "@docspace/shared/constants";
import { TIMEOUT } from "SRC_DIR/helpers/filesConstants";

import type { TTranslation } from "@docspace/shared/types";

const t = ((key: string) => key) as unknown as TTranslation;

/** Shape of the <Trans> elements passed to toastr in error branches. */
type TransElementLike = {
  props: { i18nKey: string; values?: Record<string, number> };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

// mutation-checked: deleting the SocketHelper.emit(RefreshFolder) call
// turned 3 tests red (run 2026-07-09).
describe("UploadDataStore.finishUploadFiles — characterization", () => {
  it("emits RefreshFolder exactly once, finalizes flags and defers the counter reset by TIMEOUT", () => {
    const { store, fakes } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "uploaded", toFolderId: 7 })];
    store.uploadedFilesHistory = [
      makeUploadFile({ action: "uploaded", percent: 100 }),
    ];
    store.uploaded = false;
    store.converted = false;
    store.filesSize = 123;
    store.uploadedFiles = 4;
    store.percent = 80;
    store.conversionPercent = 55;
    store.totalErrorsCount = 9;
    store.uploadedFilesSize = 512;
    store.asyncUploadObj = { stale: { chunksArray: [] } } as never;

    store.finishUploadFiles(t);

    // §3.4.1: RefreshFolder exactly once, with the first file's folder id
    expect(SocketHelper.emit).toHaveBeenCalledTimes(1);
    expect(SocketHelper.emit).toHaveBeenCalledWith(
      SocketCommands.RefreshFolder,
      { toFolderId: 7 },
    );

    // error-free history -> a single success toast, no alert progress update
    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(toastr.success).toHaveBeenCalledWith(
      "Common:ItemsSuccessfullyUploaded",
    );

    // synchronous finalization
    expect(store.uploaded).toBe(true);
    expect(store.converted).toBe(true);
    expect(store.uploadedFilesSize).toBe(0);
    expect(store.asyncUploadObj).toEqual({});
    expect(store.files[0].isCalculated).toBe(true);

    // !waitConversion -> the bar is completed immediately
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      completed: true,
    });

    // the counter reset is deferred behind setTimeout(TIMEOUT)
    expect(store.percent).toBe(80);
    expect(store.filesSize).toBe(123);

    vi.advanceTimersByTime(TIMEOUT);

    expect(store.filesSize).toBe(0);
    expect(store.uploadedFiles).toBe(0);
    expect(store.percent).toBe(0);
    expect(store.conversionPercent).toBe(0);
    expect(store.totalErrorsCount).toBe(0);
    // panel hidden (and the phantom primaryProgressDataStore.alert prop is
    // undefined), so files/filesToConversion are NOT part of the reset
    expect(store.files).toHaveLength(1);
  });

  it("does not emit RefreshFolder when no files remain", () => {
    const { store } = createTestUploadDataStore();
    store.files = [];
    store.uploadedFilesHistory = [];

    store.finishUploadFiles(t);

    expect(SocketHelper.emit).not.toHaveBeenCalled();
  });

  it("is NOT latched itself: two direct synchronous calls run the full body twice", () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "uploaded", toFolderId: 7 })];
    store.uploadedFilesHistory = [makeUploadFile({ action: "uploaded" })];

    store.finishUploadFiles(t);
    store.finishUploadFiles(t);

    // characterized quirk: the finishUploadFilesCalled latch is checked and
    // set ONLY by the checkChunkUpload call sites; finishUploadFiles neither
    // reads nor writes it, so a direct double call double-emits and
    // double-toasts. The §3.4.1 "exactly once" guarantee holds one level up.
    expect(SocketHelper.emit).toHaveBeenCalledTimes(2);
    expect(toastr.success).toHaveBeenCalledTimes(2);
    expect(store.finishUploadFilesCalled).toBe(false);

    vi.advanceTimersByTime(TIMEOUT);
    expect(store.percent).toBe(0);
  });

  it("suppresses the completed-progress update when waitConversion is true", () => {
    const { store, fakes } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "uploaded", toFolderId: 7 })];
    store.uploadedFilesHistory = [makeUploadFile({ action: "uploaded" })];
    store.percent = 60;

    store.finishUploadFiles(t, true);

    // the socket refresh and the success toast still happen...
    expect(SocketHelper.emit).toHaveBeenCalledTimes(1);
    expect(toastr.success).toHaveBeenCalledTimes(1);
    // ...but the progress bar is left running for the conversion phase
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();

    // the deferred reset is scheduled regardless of waitConversion
    vi.advanceTimersByTime(TIMEOUT);
    expect(store.percent).toBe(0);
  });

  it("deferred reset clobbers an upload that starts inside the TIMEOUT window (known race)", () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "uploaded", toFolderId: 3 })];
    store.uploadedFilesHistory = [makeUploadFile({ action: "uploaded" })];

    store.finishUploadFiles(t);

    // a new upload begins before the TIMEOUT callback fires
    const freshFile = makeUploadFile({ toFolderId: 9 });
    store.files = [freshFile];
    store.uploaded = false;
    store.percent = 42;
    store.filesSize = 4096;
    store.uploadedFiles = 1;

    vi.advanceTimersByTime(TIMEOUT);

    // characterized quirk (known race zone): the setTimeout callback resets
    // the counters UNCONDITIONALLY — it never re-checks `uploaded`, so the
    // in-flight upload's progress bookkeeping is zeroed out from under it.
    expect(store.percent).toBe(0);
    expect(store.filesSize).toBe(0);
    expect(store.uploadedFiles).toBe(0);
    // `uploaded` is not part of the reset payload and survives...
    expect(store.uploaded).toBe(false);
    // ...and files are untouched because the panel is hidden
    expect(store.files).toHaveLength(1);
    expect(store.files[0].uniqueId).toBe(freshFile.uniqueId);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.showFinishUploadToastr — characterization", () => {
  it("shows a single success toast when there are no errors", () => {
    const { store, fakes } = createTestUploadDataStore();
    const ok1 = makeUploadFile({ action: "uploaded" });
    const ok2 = makeUploadFile({ action: "uploaded" });
    store.uploadedFilesHistory = [
      { ...ok1, errorShown: false },
      { ...ok2, errorShown: false },
    ];

    const tSpy = vi.fn((key: string) => key);

    store.showFinishUploadToastr(
      tSpy as unknown as TTranslation,
      0,
      [ok1, ok2],
      [],
      0,
    );

    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(toastr.success).toHaveBeenCalledWith(
      "Common:ItemsSuccessfullyUploaded",
    );
    expect(tSpy).toHaveBeenCalledWith("Common:ItemsSuccessfullyUploaded", {
      count: 2,
    });
    // the error branch (progress alert + errorShown sweep) is skipped
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).not.toHaveBeenCalled();
    expect(store.uploadedFilesHistory[0].errorShown).toBe(false);
  });

  it("alerts the progress bar, sweeps errorShown in place and toasts once for multiple errors", () => {
    const { store, fakes } = createTestUploadDataStore();
    const ok = makeUploadFile({ action: "uploaded" });
    const err1 = makeUploadFile({ error: "first failure" });
    const err2 = makeUploadFile({ error: "second failure" });
    store.uploadedFilesHistory = [ok, err1, err2];

    store.showFinishUploadToastr(t, 2, [ok], [err1, err2], 2);

    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      alert: true,
      errorCount: 2,
    });

    // characterized quirk: errorShown is stamped on EVERY history entry —
    // including the successful ones — via an in-place mutation sweep.
    expect(store.uploadedFilesHistory.map((f) => f.errorShown)).toEqual([
      true,
      true,
      true,
    ]);

    expect(toastr.error).toHaveBeenCalledTimes(1);
    expect(toastr.error).toHaveBeenCalledWith("UploadPanel:UploadingError");
    expect(toastr.success).not.toHaveBeenCalled();
    expect(toastr.warning).not.toHaveBeenCalled();
  });

  it("prefers the quota toast (with uploaded/total counters) over every other error toast", () => {
    const { store } = createTestUploadDataStore();
    const quotaErr = makeUploadFile({
      error: "quota exceeded",
      isQuotaError: true,
    });
    store.uploadedFilesHistory = [quotaErr];

    store.showFinishUploadToastr(
      t,
      1,
      [makeUploadFile(), makeUploadFile(), makeUploadFile()],
      [quotaErr],
      1,
    );

    expect(toastr.error).toHaveBeenCalledTimes(1);
    const [element, title, timeout, withCross] = vi.mocked(toastr.error).mock
      .calls[0] as unknown as [TransElementLike, null, number, boolean];
    expect(element).toBeDefined();
    expect(element.props.i18nKey).toBe("UploadPanel:QuotaExceededDuringUpload");
    expect(element.props.values).toEqual({ uploaded: 3, total: 4 });
    expect(title).toBeNull();
    expect(timeout).toBe(60000);
    expect(withCross).toBe(true);
  });

  it("re-toasts a single non-password error verbatim", () => {
    const { store } = createTestUploadDataStore();
    const errEntry = makeUploadFile({ error: "Broken pipe" });
    store.uploadedFilesHistory = [errEntry];

    store.showFinishUploadToastr(t, 1, [], [errEntry], 1);

    expect(toastr.error).toHaveBeenCalledTimes(1);
    expect(toastr.error).toHaveBeenCalledWith("Broken pipe");
    expect(toastr.warning).not.toHaveBeenCalled();
  });

  it("shows the password-protected warning for a single password error", () => {
    const { store } = createTestUploadDataStore();
    const errEntry = makeUploadFile({ error: "File requires a password" });
    store.uploadedFilesHistory = [errEntry];

    store.showFinishUploadToastr(t, 1, [], [errEntry], 1);

    expect(toastr.error).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalledTimes(1);
    const [element, title, timeout, withCross] = vi.mocked(toastr.warning).mock
      .calls[0] as unknown as [TransElementLike, null, number, boolean];
    expect(element.props.i18nKey).toBe("Common:PasswordProtectedFiles");
    expect(title).toBeNull();
    expect(timeout).toBe(60000);
    expect(withCross).toBe(true);
  });
});
