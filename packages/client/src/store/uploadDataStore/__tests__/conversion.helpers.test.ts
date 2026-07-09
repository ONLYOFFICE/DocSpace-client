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

// The harness must be imported before the modules it mocks (see its header).
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
  convertFileFromFilesImpl,
  retryConvertFilesImpl,
  setConversionPercentImpl,
  startConversionFromFilesImpl,
} from "../conversion.helpers";

// Direct unit tests for the extracted Phase 3 conversion-from-files helpers
// (plan §4.1 step 7). They invoke the *Impl functions with the harness store
// (self-technique tested "через harness-стор"), proving the safety net bites
// the conversion.helpers module directly, not only through the facade. The
// polling loop is covered exhaustively (fake timers) by
// UploadDataStore.conversionLoop.test.ts; here the loop path uses an
// immediate progress:100 response so no getConversationProgress poll runs.

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
    // still only the first (uploaded=true) call was forwarded
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

    // immediate 100% => the inner getConversationProgress poll never runs
    vi.mocked(filesApi.convertFile).mockResolvedValue([
      { progress: 100, error: "" },
    ] as never);

    await startConversionFromFilesImpl(store, t, false);

    // MobX wraps queued plain objects in observable proxies, so assert against
    // the store's live element rather than the raw fixture object.
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

    // assert against the store's live (observable) elements, not the raw row
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
