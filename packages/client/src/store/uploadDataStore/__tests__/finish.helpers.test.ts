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

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Import ORDER is load-bearing (see UploadDataStore.finish.test.ts): the
// filesStore harness must evaluate first so the upload harness's socket/toastr
// mock registrations win and are the instances UploadDataStore captured.
import "../../filesStore/__tests__/testHarness";
import { createTestUploadDataStore, makeUploadFile } from "./testHarness";

import SocketHelper, { SocketCommands } from "@docspace/ui-kit/utils/socket";
import { toastr } from "@docspace/ui-kit/components/toast";

import type { TTranslation } from "@docspace/shared/types";

import {
  finishUploadFilesImpl,
  showFinishUploadToastrImpl,
} from "../finish.helpers";

// Direct unit tests for the extracted Phase 8 finalization helpers (plan §4.1
// step 7), invoked with the harness store. refreshFiles is covered end-to-end
// (real FilesStore) by UploadDataStore.operations.test.ts; the extraction-phase
// control mutation (§4.1 step 8) confirmed the net bites this module.

const t = ((key: string) => key) as unknown as TTranslation;

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("showFinishUploadToastrImpl", () => {
  it("shows a single success toast when there are no errors", () => {
    const { store } = createTestUploadDataStore();

    showFinishUploadToastrImpl(store, t, 0, [makeUploadFile()], [], 0);

    expect(toastr.success).toHaveBeenCalledTimes(1);
    expect(toastr.error).not.toHaveBeenCalled();
  });

  it("shows the generic error toast when more than one file failed", () => {
    const { store, fakes } = createTestUploadDataStore();
    const failed = [
      makeUploadFile({ error: "boom" }),
      makeUploadFile({ error: "boom" }),
    ];

    showFinishUploadToastrImpl(store, t, 2, [], failed, 2);

    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith(
      expect.objectContaining({ alert: true, errorCount: 2 }),
    );
    expect(toastr.error).toHaveBeenCalledWith("UploadPanel:UploadingError");
    expect(toastr.success).not.toHaveBeenCalled();
  });
});

describe("finishUploadFilesImpl", () => {
  it("emits RefreshFolder for the first file's folder and finalizes the flags", () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "uploaded", toFolderId: 7 })];
    store.uploadedFilesHistory = [
      makeUploadFile({ action: "uploaded", error: null }),
    ];

    finishUploadFilesImpl(store, t);

    expect(SocketHelper!.emit).toHaveBeenCalledTimes(1);
    expect(SocketHelper!.emit).toHaveBeenCalledWith(
      SocketCommands.RefreshFolder,
      { toFolderId: 7 },
    );
    expect(store.uploaded).toBe(true);
    expect(store.converted).toBe(true);
    expect(store.asyncUploadObj).toEqual({});

    // the deferred reset is scheduled behind a timeout; flush it cleanly
    vi.runAllTimers();
  });
});
